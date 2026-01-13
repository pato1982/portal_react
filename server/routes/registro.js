const express = require('express');
const bcrypt = require('bcrypt');
const { pool } = require('../config/database');

const router = express.Router();
const SALT_ROUNDS = 10;

// ============================================
// POST /api/registro/validar-codigo - Validar código de administrador
// ============================================
router.post('/validar-codigo', async (req, res) => {
    const { codigo } = req.body;

    if (!codigo) {
        return res.status(400).json({
            success: false,
            message: 'El código es requerido'
        });
    }

    try {
        // Buscar código en tb_codigos_validacion
        const [codigos] = await pool.query(`
            SELECT cv.*, e.nombre as establecimiento_nombre
            FROM tb_codigos_validacion cv
            JOIN tb_establecimientos e ON cv.establecimiento_id = e.id
            WHERE cv.codigo = ?
              AND cv.activo = 1
              AND cv.usado = 0
              AND (cv.fecha_expiracion IS NULL OR cv.fecha_expiracion > NOW())
        `, [codigo.toUpperCase()]);

        if (codigos.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'El código ingresado no es válido o ya fue utilizado.'
            });
        }

        res.json({
            success: true,
            establecimiento: codigos[0].establecimiento_nombre,
            establecimiento_id: codigos[0].establecimiento_id
        });

    } catch (error) {
        console.error('Error validando código:', error);
        res.status(500).json({
            success: false,
            message: 'Error al validar el código'
        });
    }
});

// ============================================
// POST /api/registro/validar-docente - Validar RUT de docente en pre-registro
// ============================================
router.post('/validar-docente', async (req, res) => {
    const { rut } = req.body;

    if (!rut) {
        return res.status(400).json({
            success: false,
            message: 'El RUT es requerido'
        });
    }

    try {
        // Buscar en tb_preregistro_docentes (case-insensitive)
        const [preregistros] = await pool.query(`
            SELECT pd.*, e.nombre as establecimiento_nombre
            FROM tb_preregistro_docentes pd
            JOIN tb_establecimientos e ON pd.establecimiento_id = e.id
            WHERE UPPER(pd.rut) = UPPER(?)
              AND pd.activo = 1
              AND pd.usado = 0
        `, [rut]);

        if (preregistros.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'El RUT ingresado no coincide con el registrado por el establecimiento. Por favor, comuníquese con ellos para verificar o corregir sus datos.'
            });
        }

        const preregistro = preregistros[0];

        res.json({
            success: true,
            datos: {
                nombres: preregistro.nombres,
                apellidos: preregistro.apellidos,
                email: preregistro.email,
                telefono: preregistro.telefono,
                establecimiento: preregistro.establecimiento_nombre,
                establecimiento_id: preregistro.establecimiento_id
            }
        });

    } catch (error) {
        console.error('Error validando docente:', error);
        res.status(500).json({
            success: false,
            message: 'Error al validar el RUT'
        });
    }
});

// ============================================
// POST /api/registro/validar-apoderado - Validar RUT de apoderado y alumnos
// ============================================
router.post('/validar-apoderado', async (req, res) => {
    const { rutApoderado, alumnos } = req.body;

    if (!rutApoderado || !alumnos || alumnos.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'RUT del apoderado y al menos un alumno son requeridos'
        });
    }

    try {
        // Buscar en tb_preregistro_relaciones (case-insensitive)
        const [preregistros] = await pool.query(`
            SELECT pr.*, e.nombre as establecimiento_nombre
            FROM tb_preregistro_relaciones pr
            JOIN tb_establecimientos e ON pr.establecimiento_id = e.id
            WHERE UPPER(pr.rut_apoderado) = UPPER(?)
              AND pr.activo = 1
              AND pr.usado = 0
        `, [rutApoderado]);

        if (preregistros.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'El RUT del apoderado ingresado no coincide con el registrado en el establecimiento. Por favor, comuníquese con el establecimiento para verificar sus datos.'
            });
        }

        // Validar cada alumno (case-insensitive)
        const rutsAlumnosPreregistro = preregistros.map(p => p.rut_alumno.toUpperCase());
        const alumnosNoCoinciden = [];

        alumnos.forEach((alumno, index) => {
            if (!rutsAlumnosPreregistro.includes(alumno.rut.toUpperCase())) {
                alumnosNoCoinciden.push(index + 1);
            }
        });

        if (alumnosNoCoinciden.length > 0) {
            const alumnoTexto = alumnosNoCoinciden.length === 1
                ? `El RUT del Alumno ${alumnosNoCoinciden[0]}`
                : `Los RUT de los Alumnos ${alumnosNoCoinciden.join(', ')}`;

            return res.status(400).json({
                success: false,
                message: `${alumnoTexto} no coincide con los registrados en el establecimiento para este apoderado. Por favor, comuníquese con el establecimiento para verificar los datos.`
            });
        }

        // Obtener datos del primer preregistro para respuesta
        const primerPreregistro = preregistros[0];

        res.json({
            success: true,
            datos: {
                nombres: primerPreregistro.nombres_apoderado,
                apellidos: primerPreregistro.apellidos_apoderado,
                email: primerPreregistro.email_apoderado,
                telefono: primerPreregistro.telefono_apoderado,
                establecimiento: primerPreregistro.establecimiento_nombre,
                establecimiento_id: primerPreregistro.establecimiento_id,
                alumnos: preregistros.map(p => ({
                    rut: p.rut_alumno,
                    nombres: p.nombres_alumno,
                    apellidos: p.apellidos_alumno,
                    curso: p.curso_nombre
                }))
            }
        });

    } catch (error) {
        console.error('Error validando apoderado:', error);
        res.status(500).json({
            success: false,
            message: 'Error al validar los datos'
        });
    }
});

// ============================================
// POST /api/registro/admin - Registrar administrador
// ============================================
router.post('/admin', async (req, res) => {
    const { codigo, rut, nombres, apellidos, email, telefono, password } = req.body;

    if (!codigo || !rut || !nombres || !apellidos || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Todos los campos son requeridos'
        });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Validar código
        const [codigos] = await connection.query(`
            SELECT * FROM tb_codigos_validacion
            WHERE codigo = ? AND activo = 1 AND usado = 0
              AND (fecha_expiracion IS NULL OR fecha_expiracion > NOW())
        `, [codigo.toUpperCase()]);

        if (codigos.length === 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'El código no es válido o ya fue utilizado'
            });
        }

        const codigoValidacion = codigos[0];

        // Verificar que el email no exista
        const [existeEmail] = await connection.query(
            'SELECT id FROM tb_usuarios WHERE email = ?',
            [email]
        );

        if (existeEmail.length > 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'El correo electrónico ya está registrado'
            });
        }

        // Verificar que el RUT no exista
        const [existeRut] = await connection.query(
            'SELECT id FROM tb_administradores WHERE rut = ?',
            [rut]
        );

        if (existeRut.length > 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'El RUT ya está registrado'
            });
        }

        // Crear hash de contraseña
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Crear usuario en tb_usuarios
        const [resultUsuario] = await connection.query(`
            INSERT INTO tb_usuarios (email, password_hash, tipo_usuario, activo)
            VALUES (?, ?, 'administrador', 1)
        `, [email, passwordHash]);

        const usuarioId = resultUsuario.insertId;

        // Crear administrador en tb_administradores
        const [resultAdmin] = await connection.query(`
            INSERT INTO tb_administradores (usuario_id, rut, nombres, apellidos, telefono, activo)
            VALUES (?, ?, ?, ?, ?, 1)
        `, [usuarioId, rut, nombres, apellidos, telefono]);

        const adminId = resultAdmin.insertId;

        // Asociar al establecimiento
        await connection.query(`
            INSERT INTO tb_administrador_establecimiento
            (administrador_id, establecimiento_id, es_principal, cargo, fecha_asignacion, activo)
            VALUES (?, ?, 1, 'Administrador', CURDATE(), 1)
        `, [adminId, codigoValidacion.establecimiento_id]);

        // Marcar código como usado
        await connection.query(`
            UPDATE tb_codigos_validacion
            SET usado = 1, fecha_uso = NOW(), usuario_id = ?
            WHERE id = ?
        `, [usuarioId, codigoValidacion.id]);

        await connection.commit();

        res.json({
            success: true,
            message: 'Cuenta de administrador creada con éxito. Ya puede iniciar sesión con su email y la contraseña que acaba de crear.'
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error en registro de admin:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear la cuenta'
        });
    } finally {
        connection.release();
    }
});

// ============================================
// POST /api/registro/docente - Registrar docente
// ============================================
router.post('/docente', async (req, res) => {
    const { rut, email, password } = req.body;

    if (!rut || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'RUT, email y contraseña son requeridos'
        });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Validar pre-registro (case-insensitive)
        const [preregistros] = await connection.query(`
            SELECT * FROM tb_preregistro_docentes
            WHERE UPPER(rut) = UPPER(?) AND activo = 1 AND usado = 0
        `, [rut]);

        if (preregistros.length === 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'El RUT no está autorizado para registro'
            });
        }

        const preregistro = preregistros[0];

        // Verificar que el email no exista
        const [existeEmail] = await connection.query(
            'SELECT id FROM tb_usuarios WHERE email = ?',
            [email]
        );

        if (existeEmail.length > 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'El correo electrónico ya está registrado'
            });
        }

        // Crear hash de contraseña
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Crear usuario en tb_usuarios
        const [resultUsuario] = await connection.query(`
            INSERT INTO tb_usuarios (email, password_hash, tipo_usuario, activo)
            VALUES (?, ?, 'docente', 1)
        `, [email, passwordHash]);

        const usuarioId = resultUsuario.insertId;

        // Crear docente en tb_docentes
        const [resultDocente] = await connection.query(`
            INSERT INTO tb_docentes (usuario_id, rut, nombres, apellidos, email, telefono, activo)
            VALUES (?, ?, ?, ?, ?, ?, 1)
        `, [usuarioId, rut, preregistro.nombres, preregistro.apellidos, email, preregistro.telefono]);

        const docenteId = resultDocente.insertId;

        // Asociar al establecimiento
        await connection.query(`
            INSERT INTO tb_docente_establecimiento
            (docente_id, establecimiento_id, fecha_ingreso, activo)
            VALUES (?, ?, CURDATE(), 1)
        `, [docenteId, preregistro.establecimiento_id]);

        // Transferir asignaturas de tb_preregistro_docente_asignatura a tb_docente_asignatura
        const [asignaturasPreregistro] = await connection.query(`
            SELECT asignatura_id FROM tb_preregistro_docente_asignatura
            WHERE preregistro_docente_id = ?
        `, [preregistro.id]);

        for (const asig of asignaturasPreregistro) {
            await connection.query(`
                INSERT INTO tb_docente_asignatura (docente_id, asignatura_id, activo)
                VALUES (?, ?, 1)
            `, [docenteId, asig.asignatura_id]);
        }

        // Marcar pre-registro como usado
        await connection.query(`
            UPDATE tb_preregistro_docentes
            SET usado = 1, fecha_uso = NOW(), usuario_creado_id = ?
            WHERE id = ?
        `, [usuarioId, preregistro.id]);

        await connection.commit();

        res.json({
            success: true,
            message: 'Cuenta creada con éxito. Ya puede iniciar sesión con su email y la contraseña que acaba de crear.'
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error en registro de docente:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear la cuenta'
        });
    } finally {
        connection.release();
    }
});

// ============================================
// POST /api/registro/apoderado - Registrar apoderado
// ============================================
router.post('/apoderado', async (req, res) => {
    const { rutApoderado, alumnos, email, password } = req.body;

    if (!rutApoderado || !alumnos || alumnos.length === 0 || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Todos los campos son requeridos'
        });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Validar pre-registro (case-insensitive)
        const [preregistros] = await connection.query(`
            SELECT * FROM tb_preregistro_relaciones
            WHERE UPPER(rut_apoderado) = UPPER(?) AND activo = 1 AND usado = 0
        `, [rutApoderado]);

        if (preregistros.length === 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'El RUT no está autorizado para registro'
            });
        }

        // Validar que todos los alumnos estén en el preregistro (case-insensitive)
        const rutsAlumnosPreregistro = preregistros.map(p => p.rut_alumno.toUpperCase());
        for (const alumno of alumnos) {
            if (!rutsAlumnosPreregistro.includes(alumno.rut.toUpperCase())) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Uno o más alumnos no están registrados para este apoderado'
                });
            }
        }

        const primerPreregistro = preregistros[0];

        // Verificar que el email no exista
        const [existeEmail] = await connection.query(
            'SELECT id FROM tb_usuarios WHERE email = ?',
            [email]
        );

        if (existeEmail.length > 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'El correo electrónico ya está registrado'
            });
        }

        // Crear hash de contraseña
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Crear usuario en tb_usuarios
        const [resultUsuario] = await connection.query(`
            INSERT INTO tb_usuarios (email, password_hash, tipo_usuario, activo)
            VALUES (?, ?, 'apoderado', 1)
        `, [email, passwordHash]);

        const usuarioId = resultUsuario.insertId;

        // Crear apoderado en tb_apoderados
        const [resultApoderado] = await connection.query(`
            INSERT INTO tb_apoderados (usuario_id, rut, nombres, apellidos, email, telefono, activo)
            VALUES (?, ?, ?, ?, ?, ?, 1)
        `, [usuarioId, rutApoderado, primerPreregistro.nombres_apoderado, primerPreregistro.apellidos_apoderado, email, primerPreregistro.telefono_apoderado]);

        const apoderadoId = resultApoderado.insertId;

        // Asociar al establecimiento
        await connection.query(`
            INSERT INTO tb_apoderado_establecimiento
            (apoderado_id, establecimiento_id, fecha_registro, activo)
            VALUES (?, ?, CURDATE(), 1)
        `, [apoderadoId, primerPreregistro.establecimiento_id]);

        // Procesar cada alumno - Los alumnos YA deben existir en tb_alumnos
        for (const alumno of alumnos) {
            // Buscar el preregistro específico de este alumno (case-insensitive)
            const preregistroAlumno = preregistros.find(p =>
                p.rut_alumno.toUpperCase() === alumno.rut.toUpperCase()
            );

            if (preregistroAlumno) {
                // Buscar el alumno existente en tb_alumnos (DEBE existir, case-insensitive)
                const [alumnoExistente] = await connection.query(
                    'SELECT id FROM tb_alumnos WHERE UPPER(rut) = UPPER(?) AND activo = 1',
                    [alumno.rut]
                );

                if (alumnoExistente.length === 0) {
                    await connection.rollback();
                    return res.status(400).json({
                        success: false,
                        message: `El alumno con RUT ${alumno.rut} no está registrado en el sistema. Contacte al establecimiento.`
                    });
                }

                const alumnoId = alumnoExistente[0].id;

                // Crear relación apoderado-alumno
                await connection.query(`
                    INSERT INTO tb_apoderado_alumno
                    (apoderado_id, alumno_id, parentesco, es_apoderado_titular, activo)
                    VALUES (?, ?, ?, ?, 1)
                `, [apoderadoId, alumnoId, preregistroAlumno.parentesco || 'padre', preregistroAlumno.es_apoderado_titular || 1]);

                // Marcar pre-registro como usado
                await connection.query(`
                    UPDATE tb_preregistro_relaciones
                    SET usado = 1, fecha_uso = NOW(), usuario_creado_id = ?
                    WHERE id = ?
                `, [usuarioId, preregistroAlumno.id]);
            }
        }

        await connection.commit();

        res.json({
            success: true,
            message: 'Registro realizado con éxito. Ya puede iniciar sesión con su email y la contraseña que acaba de crear.'
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error en registro de apoderado:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear la cuenta'
        });
    } finally {
        connection.release();
    }
});

module.exports = router;
