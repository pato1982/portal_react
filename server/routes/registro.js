const express = require('express');
const bcrypt = require('bcrypt');
const { pool } = require('../config/database');

const router = express.Router();
const SALT_ROUNDS = 10;

// ============================================
// Funciones auxiliares para registrar intentos fallidos
// ============================================

// Registrar intento fallido de registro de ADMINISTRADOR
const registrarFalloAdmin = async (establecimientoId, datos, codigoIngresado, motivoFallo, req) => {
    try {
        await pool.query(`
            INSERT INTO tb_intentos_registro_fallidos_admin
            (establecimiento_id, rut_admin, nombres_admin, apellidos_admin, email_admin, telefono_admin,
             codigo_ingresado, motivo_fallo, ip_address, user_agent, fecha_intento)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
            establecimientoId || 0,
            datos.rut || '',
            datos.nombres || '',
            datos.apellidos || '',
            datos.email || null,
            datos.telefono || null,
            codigoIngresado || null,
            motivoFallo,
            req.ip,
            req.headers['user-agent']
        ]);
    } catch (error) {
        console.error('Error al registrar intento fallido de admin:', error);
    }
};

// Registrar intento fallido de registro de DOCENTE
const registrarFalloDocente = async (establecimientoId, datos, motivoFallo, req) => {
    try {
        await pool.query(`
            INSERT INTO tb_intentos_registro_fallidos_docentes
            (establecimiento_id, rut_docente, nombres_docente, apellidos_docente, email_docente,
             telefono_docente, especialidad_indicada, motivo_fallo, ip_address, user_agent, fecha_intento)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
            establecimientoId || 0,
            datos.rut || '',
            datos.nombres || '',
            datos.apellidos || '',
            datos.email || null,
            datos.telefono || null,
            datos.especialidad || null,
            motivoFallo,
            req.ip,
            req.headers['user-agent']
        ]);
    } catch (error) {
        console.error('Error al registrar intento fallido de docente:', error);
    }
};

// Registrar intento fallido de registro de APODERADO
const registrarFalloApoderado = async (establecimientoId, datosApoderado, datosAlumno, motivoFallo, req) => {
    try {
        await pool.query(`
            INSERT INTO tb_intentos_registro_fallidos
            (establecimiento_id, rut_apoderado, nombres_apoderado, apellidos_apoderado, email_apoderado,
             telefono_apoderado, rut_alumno, nombres_alumno, apellidos_alumno, curso_indicado,
             parentesco, motivo_fallo, ip_address, user_agent, fecha_intento)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
            establecimientoId || 0,
            datosApoderado.rut || '',
            datosApoderado.nombres || '',
            datosApoderado.apellidos || '',
            datosApoderado.email || null,
            datosApoderado.telefono || null,
            datosAlumno.rut || null,
            datosAlumno.nombres || null,
            datosAlumno.apellidos || null,
            datosAlumno.curso || null,
            datosAlumno.parentesco || null,
            motivoFallo,
            req.ip,
            req.headers['user-agent']
        ]);
    } catch (error) {
        console.error('Error al registrar intento fallido de apoderado:', error);
    }
};

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
            // Registrar intento fallido
            await registrarFalloDocente(null, { rut, nombres: '', apellidos: '', email: null }, 'rut_no_preregistrado', req);
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
            // Registrar intento fallido
            const datosApoderado = { rut: rutApoderado, nombres: '', apellidos: '', email: null };
            const primerAlumno = alumnos.length > 0 ? alumnos[0] : { rut: '', nombres: '', apellidos: '' };
            await registrarFalloApoderado(null, datosApoderado, primerAlumno, 'rut_no_preregistrado', req);
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

            // Registrar intento fallido con el primer alumno que no coincide
            const alumnoFallido = alumnos[alumnosNoCoinciden[0] - 1];
            const datosApoderado = {
                rut: rutApoderado,
                nombres: preregistros[0].nombres_apoderado,
                apellidos: preregistros[0].apellidos_apoderado,
                email: null
            };
            await registrarFalloApoderado(preregistros[0].establecimiento_id, datosApoderado, alumnoFallido, 'alumno_no_encontrado', req);

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
    const datosAdmin = { rut, nombres, apellidos, email, telefono };

    if (!codigo || !rut || !nombres || !apellidos || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Todos los campos son requeridos'
        });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Validar código - primero verificar si existe pero está expirado o usado
        const [codigoInfo] = await connection.query(`
            SELECT cv.*, e.id as est_id FROM tb_codigos_validacion cv
            LEFT JOIN tb_establecimientos e ON cv.establecimiento_id = e.id
            WHERE cv.codigo = ?
        `, [codigo.toUpperCase()]);

        const establecimientoId = codigoInfo.length > 0 ? codigoInfo[0].est_id : null;

        // Validar código activo
        const [codigos] = await connection.query(`
            SELECT * FROM tb_codigos_validacion
            WHERE codigo = ? AND activo = 1 AND usado = 0
              AND (fecha_expiracion IS NULL OR fecha_expiracion > NOW())
        `, [codigo.toUpperCase()]);

        if (codigos.length === 0) {
            await connection.rollback();
            // Determinar motivo específico
            let motivoFallo = 'codigo_invalido';
            if (codigoInfo.length > 0) {
                if (codigoInfo[0].usado === 1) motivoFallo = 'codigo_usado';
                else if (codigoInfo[0].fecha_expiracion && new Date(codigoInfo[0].fecha_expiracion) < new Date()) motivoFallo = 'codigo_expirado';
            }
            await registrarFalloAdmin(establecimientoId, datosAdmin, codigo, motivoFallo, req);
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
            await registrarFalloAdmin(codigoValidacion.establecimiento_id, datosAdmin, codigo, 'ya_registrado', req);
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
            await registrarFalloAdmin(codigoValidacion.establecimiento_id, datosAdmin, codigo, 'ya_registrado', req);
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
            SET usado = 1, fecha_uso = NOW(), usado_por_id = ?
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

        // Primero buscar cualquier preregistro para obtener el establecimiento_id
        const [preregistroInfo] = await connection.query(`
            SELECT establecimiento_id, nombres, apellidos, especialidad, usado FROM tb_preregistro_docentes
            WHERE UPPER(rut) = UPPER(?)
        `, [rut]);

        const establecimientoId = preregistroInfo.length > 0 ? preregistroInfo[0].establecimiento_id : null;
        const datosDocente = {
            rut,
            nombres: preregistroInfo.length > 0 ? preregistroInfo[0].nombres : '',
            apellidos: preregistroInfo.length > 0 ? preregistroInfo[0].apellidos : '',
            email,
            especialidad: preregistroInfo.length > 0 ? preregistroInfo[0].especialidad : null
        };

        // Validar pre-registro activo y no usado (case-insensitive)
        const [preregistros] = await connection.query(`
            SELECT * FROM tb_preregistro_docentes
            WHERE UPPER(rut) = UPPER(?) AND activo = 1 AND usado = 0
        `, [rut]);

        if (preregistros.length === 0) {
            await connection.rollback();
            // Determinar motivo
            let motivoFallo = 'rut_no_preregistrado';
            if (preregistroInfo.length > 0 && preregistroInfo[0].usado === 1) {
                motivoFallo = 'ya_registrado';
            }
            await registrarFalloDocente(establecimientoId, datosDocente, motivoFallo, req);
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
            await registrarFalloDocente(preregistro.establecimiento_id, datosDocente, 'ya_registrado', req);
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

        // Verificar si el docente ya existe en el sistema (por RUT)
        const [docentesExistentes] = await connection.query(
            'SELECT id FROM tb_docentes WHERE rut = ?',
            [rut]
        );

        let docenteId;

        if (docentesExistentes.length > 0) {
            // El docente ya existe (caso datos poblados), vincular usuario
            docenteId = docentesExistentes[0].id;
            await connection.query(`
                UPDATE tb_docentes 
                SET usuario_id = ?, email = ?, activo = 1 
                WHERE id = ?
            `, [usuarioId, email, docenteId]);

            // Asegurar que está vinculado al establecimiento
            const [relacionEst] = await connection.query(
                'SELECT id FROM tb_docente_establecimiento WHERE docente_id = ? AND establecimiento_id = ?',
                [docenteId, preregistro.establecimiento_id]
            );

            if (relacionEst.length === 0) {
                await connection.query(`
                    INSERT INTO tb_docente_establecimiento
                    (docente_id, establecimiento_id, fecha_ingreso, activo)
                    VALUES (?, ?, CURDATE(), 1)
                `, [docenteId, preregistro.establecimiento_id]);
            }

            // NO sobreescribimos asignaturas si ya existe, asumiendo que ya tiene las correctas
        } else {
            // Crear nuevo registro de docente
            const [resultDocente] = await connection.query(`
                INSERT INTO tb_docentes (usuario_id, rut, nombres, apellidos, email, telefono, activo)
                VALUES (?, ?, ?, ?, ?, ?, 1)
            `, [usuarioId, rut, preregistro.nombres, preregistro.apellidos, email, preregistro.telefono]);

            docenteId = resultDocente.insertId;

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

        // Primero buscar cualquier preregistro para obtener datos
        const [preregistroInfo] = await connection.query(`
            SELECT * FROM tb_preregistro_relaciones
            WHERE UPPER(rut_apoderado) = UPPER(?)
        `, [rutApoderado]);

        const establecimientoId = preregistroInfo.length > 0 ? preregistroInfo[0].establecimiento_id : null;
        const datosApoderado = {
            rut: rutApoderado,
            nombres: preregistroInfo.length > 0 ? preregistroInfo[0].nombres_apoderado : '',
            apellidos: preregistroInfo.length > 0 ? preregistroInfo[0].apellidos_apoderado : '',
            email,
            telefono: preregistroInfo.length > 0 ? preregistroInfo[0].telefono_apoderado : null
        };
        const primerAlumno = alumnos.length > 0 ? alumnos[0] : { rut: '', nombres: '', apellidos: '' };

        // Validar pre-registro activo y no usado (case-insensitive)
        const [preregistros] = await connection.query(`
            SELECT * FROM tb_preregistro_relaciones
            WHERE UPPER(rut_apoderado) = UPPER(?) AND activo = 1 AND usado = 0
        `, [rutApoderado]);

        if (preregistros.length === 0) {
            await connection.rollback();
            // Determinar motivo
            let motivoFallo = 'rut_no_preregistrado';
            if (preregistroInfo.length > 0) {
                const todosUsados = preregistroInfo.every(p => p.usado === 1);
                if (todosUsados) motivoFallo = 'ya_registrado';
            }
            await registrarFalloApoderado(establecimientoId, datosApoderado, primerAlumno, motivoFallo, req);
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
                await registrarFalloApoderado(preregistros[0].establecimiento_id, datosApoderado, alumno, 'alumno_no_encontrado', req);
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
            await registrarFalloApoderado(primerPreregistro.establecimiento_id, datosApoderado, primerAlumno, 'ya_registrado', req);
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
