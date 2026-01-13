const express = require('express');
const cors = require('cors');
const { pool, testConnection } = require('./config/database');
const authRoutes = require('./routes/auth');
const registroRoutes = require('./routes/registro');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de registro
app.use('/api/registro', registroRoutes);

// ============================================
// RUTAS DE ESTABLECIMIENTOS
// ============================================

// GET /api/establecimientos - Obtener todos los establecimientos
app.get('/api/establecimientos', async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT id, nombre, codigo, direccion, telefono, email
      FROM tb_establecimientos
      WHERE activo = 1
      ORDER BY nombre
    `);

        // Para el frontend, devolver solo los nombres
        const establecimientos = rows.map(e => e.nombre);
        res.json({ success: true, establecimientos, data: rows });
    } catch (error) {
        console.error('Error al obtener establecimientos:', error);
        res.status(500).json({ success: false, error: 'Error al obtener establecimientos' });
    }
});

// ============================================
// RUTAS DE ALUMNOS
// ============================================

// GET /api/alumnos - Obtener todos los alumnos con sus cursos
// Campos: curso, rut, fecha_nacimiento, nombres, apellidos, sexo
// Query params opcionales: curso_id (para filtrar por curso)
app.get('/api/alumnos', async (req, res) => {
    const { curso_id } = req.query;

    try {
        let query = `
      SELECT
        a.id,
        a.rut,
        a.nombres,
        a.apellidos,
        a.fecha_nacimiento,
        a.sexo,
        CONCAT(a.apellidos, ', ', a.nombres) AS nombre_completo,
        c.nombre AS curso_nombre,
        c.id AS curso_id
      FROM tb_alumnos a
      LEFT JOIN tb_alumno_establecimiento ae ON a.id = ae.alumno_id AND ae.activo = 1
      LEFT JOIN tb_cursos c ON ae.curso_id = c.id
      WHERE a.activo = 1
    `;

        const params = [];

        // Filtrar por curso si se especifica
        if (curso_id) {
            query += ` AND c.id = ?`;
            params.push(curso_id);
        }

        query += ` ORDER BY c.nombre, a.apellidos, a.nombres`;

        const [rows] = await pool.query(query, params);

        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error al obtener alumnos:', error);
        res.status(500).json({ success: false, error: 'Error al obtener alumnos' });
    }
});

// GET /api/alumnos/por-curso - Obtener alumnos agrupados por curso
app.get('/api/alumnos/por-curso', async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT 
        a.id,
        a.rut,
        a.nombres,
        a.apellidos,
        a.fecha_nacimiento,
        a.sexo,
        CONCAT(a.apellidos, ', ', a.nombres) AS nombre_completo,
        c.nombre AS curso_nombre,
        c.id AS curso_id
      FROM tb_alumnos a
      LEFT JOIN tb_alumno_establecimiento ae ON a.id = ae.alumno_id AND ae.activo = 1
      LEFT JOIN tb_cursos c ON ae.curso_id = c.id
      WHERE a.activo = 1
      ORDER BY c.nombre, a.apellidos, a.nombres
    `);

        // Agrupar por curso
        const alumnosPorCurso = {};
        rows.forEach(alumno => {
            const cursoNombre = alumno.curso_nombre || 'Sin Curso';
            if (!alumnosPorCurso[cursoNombre]) {
                alumnosPorCurso[cursoNombre] = [];
            }
            alumnosPorCurso[cursoNombre].push(alumno);
        });

        res.json({ success: true, data: alumnosPorCurso });
    } catch (error) {
        console.error('Error al obtener alumnos por curso:', error);
        res.status(500).json({ success: false, error: 'Error al obtener alumnos' });
    }
});

// POST /api/alumnos - Crear nuevo alumno (sin apoderado)
app.post('/api/alumnos', async (req, res) => {
    const { rut, nombres, apellidos, fecha_nacimiento, sexo, curso_id, establecimiento_id = 1 } = req.body;

    try {
        // Insertar alumno
        const [result] = await pool.query(`
      INSERT INTO tb_alumnos (rut, nombres, apellidos, fecha_nacimiento, sexo, activo)
      VALUES (?, ?, ?, ?, ?, 1)
    `, [rut, nombres, apellidos, fecha_nacimiento, sexo]);

        const alumnoId = result.insertId;

        // Asociar al establecimiento y curso
        if (curso_id) {
            await pool.query(`
        INSERT INTO tb_alumno_establecimiento
        (alumno_id, establecimiento_id, curso_id, anio_academico, fecha_ingreso, activo)
        VALUES (?, ?, ?, YEAR(CURDATE()), CURDATE(), 1)
      `, [alumnoId, establecimiento_id, curso_id]);
        }

        res.json({ success: true, message: 'Alumno creado correctamente', id: alumnoId });
    } catch (error) {
        console.error('Error al crear alumno:', error);
        res.status(500).json({ success: false, error: 'Error al crear alumno' });
    }
});

// POST /api/alumnos/con-apoderado - Crear alumno + preregistro de relación con apoderado
app.post('/api/alumnos/con-apoderado', async (req, res) => {
    const {
        // Datos del alumno
        alumno_rut,
        alumno_nombres,
        alumno_apellidos,
        alumno_fecha_nacimiento,
        alumno_sexo,
        curso_id,
        establecimiento_id = 1,
        // Datos del apoderado
        apoderado_rut,
        apoderado_nombres,
        apoderado_apellidos,
        apoderado_telefono,
        apoderado_email,
        parentesco,
        // Tipo: 'nuevo' o 'existente'
        tipo_apoderado
    } = req.body;

    // Validaciones básicas
    if (!alumno_rut || !alumno_nombres || !alumno_apellidos || !curso_id) {
        return res.status(400).json({
            success: false,
            error: 'Faltan datos obligatorios del alumno'
        });
    }

    if (!apoderado_rut || !apoderado_nombres || !apoderado_apellidos || !parentesco) {
        return res.status(400).json({
            success: false,
            error: 'Faltan datos obligatorios del apoderado'
        });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Verificar si el alumno ya existe (por RUT, case-insensitive)
        const [alumnoExistente] = await connection.query(
            'SELECT id FROM tb_alumnos WHERE UPPER(rut) = UPPER(?)',
            [alumno_rut]
        );

        if (alumnoExistente.length > 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                error: 'Ya existe un alumno con ese RUT'
            });
        }

        // 2. Crear alumno en tb_alumnos
        const [resultAlumno] = await connection.query(`
            INSERT INTO tb_alumnos (rut, nombres, apellidos, fecha_nacimiento, sexo, activo)
            VALUES (?, ?, ?, ?, ?, 1)
        `, [alumno_rut, alumno_nombres, alumno_apellidos, alumno_fecha_nacimiento, alumno_sexo]);

        const alumnoId = resultAlumno.insertId;

        // 3. Asociar alumno al establecimiento y curso
        await connection.query(`
            INSERT INTO tb_alumno_establecimiento
            (alumno_id, establecimiento_id, curso_id, anio_academico, fecha_ingreso, activo)
            VALUES (?, ?, ?, YEAR(CURDATE()), CURDATE(), 1)
        `, [alumnoId, establecimiento_id, curso_id]);

        // 4. Verificar si el apoderado ya existe en el sistema (tiene cuenta)
        const [apoderadoExistente] = await connection.query(
            'SELECT id FROM tb_apoderados WHERE UPPER(rut) = UPPER(?) AND activo = 1',
            [apoderado_rut]
        );

        if (tipo_apoderado === 'existente') {
            // Si el apoderado ya existe, verificar que realmente existe
            if (apoderadoExistente.length === 0) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    error: 'No se encontró un apoderado con ese RUT en el sistema'
                });
            }
        }

        // 5. Crear preregistro de relación en tb_preregistro_relaciones
        // (Siempre se crea para que el apoderado nuevo pueda registrarse
        //  o el existente pueda agregar al pupilo)
        await connection.query(`
            INSERT INTO tb_preregistro_relaciones
            (establecimiento_id, rut_apoderado, nombres_apoderado, apellidos_apoderado,
             telefono_apoderado, email_apoderado, rut_alumno, nombres_alumno, apellidos_alumno,
             parentesco, es_apoderado_titular, activo, usado)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 0)
        `, [
            establecimiento_id,
            apoderado_rut,
            apoderado_nombres,
            apoderado_apellidos,
            apoderado_telefono || null,
            apoderado_email || null,
            alumno_rut,
            alumno_nombres,
            alumno_apellidos,
            parentesco
        ]);

        await connection.commit();

        res.json({
            success: true,
            message: tipo_apoderado === 'nuevo'
                ? 'Alumno creado correctamente. El apoderado podrá registrarse en el sistema.'
                : 'Alumno creado correctamente. El apoderado podrá agregar al pupilo desde su cuenta.',
            alumno_id: alumnoId
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error al crear alumno con apoderado:', error);
        res.status(500).json({
            success: false,
            error: 'Error al crear alumno'
        });
    } finally {
        connection.release();
    }
});

// PUT /api/alumnos/:id - Actualizar alumno con logging
app.put('/api/alumnos/:id', async (req, res) => {
    const { id } = req.params;
    const {
        rut, nombres, apellidos, curso_id,
        establecimiento_id = 1,
        usuario_id = null,
        tipo_usuario = 'sistema',
        nombre_usuario = 'Sistema'
    } = req.body;

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Obtener datos actuales del alumno para el log
        const [alumnoActual] = await connection.query(`
            SELECT a.rut, a.nombres, a.apellidos, ae.curso_id, c.nombre as curso_nombre
            FROM tb_alumnos a
            LEFT JOIN tb_alumno_establecimiento ae ON a.id = ae.alumno_id AND ae.activo = 1
            LEFT JOIN tb_cursos c ON ae.curso_id = c.id
            WHERE a.id = ?
        `, [id]);

        if (alumnoActual.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, error: 'Alumno no encontrado' });
        }

        const datosAnteriores = alumnoActual[0];

        // 2. Actualizar datos del alumno
        await connection.query(`
            UPDATE tb_alumnos
            SET rut = ?, nombres = ?, apellidos = ?
            WHERE id = ?
        `, [rut, nombres, apellidos, id]);

        // 3. Actualizar curso si se proporciona y es diferente
        let cursoAnteriorId = datosAnteriores.curso_id;
        let cursoNuevoNombre = datosAnteriores.curso_nombre;

        if (curso_id && curso_id !== cursoAnteriorId) {
            await connection.query(`
                UPDATE tb_alumno_establecimiento
                SET curso_id = ?
                WHERE alumno_id = ? AND activo = 1
            `, [curso_id, id]);

            // Obtener nombre del nuevo curso
            const [cursoNuevo] = await connection.query(
                'SELECT nombre FROM tb_cursos WHERE id = ?',
                [curso_id]
            );
            if (cursoNuevo.length > 0) {
                cursoNuevoNombre = cursoNuevo[0].nombre;
            }
        }

        // 4. Registrar en tb_log_actividades
        const cambios = [];
        if (rut !== datosAnteriores.rut) {
            cambios.push(`RUT: "${datosAnteriores.rut}" → "${rut}"`);
        }
        if (nombres !== datosAnteriores.nombres) {
            cambios.push(`Nombres: "${datosAnteriores.nombres}" → "${nombres}"`);
        }
        if (apellidos !== datosAnteriores.apellidos) {
            cambios.push(`Apellidos: "${datosAnteriores.apellidos}" → "${apellidos}"`);
        }
        if (curso_id && curso_id !== cursoAnteriorId) {
            cambios.push(`Curso: "${datosAnteriores.curso_nombre || 'Sin curso'}" → "${cursoNuevoNombre}"`);
        }

        if (cambios.length > 0) {
            const datosAnterioresJson = JSON.stringify({
                rut: datosAnteriores.rut,
                nombres: datosAnteriores.nombres,
                apellidos: datosAnteriores.apellidos,
                curso_id: datosAnteriores.curso_id
            });
            const datosNuevosJson = JSON.stringify({
                rut, nombres, apellidos, curso_id
            });

            await connection.query(`
                INSERT INTO tb_log_actividades
                (usuario_id, tipo_usuario, nombre_usuario, accion, modulo, descripcion,
                 entidad_tipo, entidad_id, datos_anteriores, datos_nuevos, establecimiento_id)
                VALUES (?, ?, ?, 'editar', 'alumnos', ?, 'alumno', ?, ?, ?, ?)
            `, [
                usuario_id,
                tipo_usuario,
                nombre_usuario,
                cambios.join(' | '),
                id,
                datosAnterioresJson,
                datosNuevosJson,
                establecimiento_id
            ]);
        }

        await connection.commit();

        res.json({ success: true, message: 'Alumno actualizado correctamente' });
    } catch (error) {
        await connection.rollback();
        console.error('Error al actualizar alumno:', error);
        res.status(500).json({ success: false, error: 'Error al actualizar alumno' });
    } finally {
        connection.release();
    }
});

// DELETE /api/alumnos/:id - Eliminar alumno (soft delete) con logging
app.delete('/api/alumnos/:id', async (req, res) => {
    const { id } = req.params;
    const {
        establecimiento_id = 1,
        usuario_id = null,
        tipo_usuario = 'sistema',
        nombre_usuario = 'Sistema'
    } = req.body || {};

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Obtener datos del alumno para el log
        const [alumnoActual] = await connection.query(`
            SELECT a.rut, a.nombres, a.apellidos, ae.curso_id, c.nombre as curso_nombre
            FROM tb_alumnos a
            LEFT JOIN tb_alumno_establecimiento ae ON a.id = ae.alumno_id AND ae.activo = 1
            LEFT JOIN tb_cursos c ON ae.curso_id = c.id
            WHERE a.id = ?
        `, [id]);

        if (alumnoActual.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, error: 'Alumno no encontrado' });
        }

        const alumno = alumnoActual[0];
        const descripcion = `Alumno eliminado: ${alumno.nombres} ${alumno.apellidos} (RUT: ${alumno.rut}) - Curso: ${alumno.curso_nombre || 'Sin curso'}`;

        // 2. Soft delete del alumno
        await connection.query(`UPDATE tb_alumnos SET activo = 0 WHERE id = ?`, [id]);

        // 3. Desactivar también la relación con el establecimiento
        await connection.query(`UPDATE tb_alumno_establecimiento SET activo = 0 WHERE alumno_id = ?`, [id]);

        // 4. Registrar en tb_log_actividades
        const datosAnterioresJson = JSON.stringify({
            rut: alumno.rut,
            nombres: alumno.nombres,
            apellidos: alumno.apellidos,
            curso_id: alumno.curso_id,
            activo: 1
        });

        await connection.query(`
            INSERT INTO tb_log_actividades
            (usuario_id, tipo_usuario, nombre_usuario, accion, modulo, descripcion,
             entidad_tipo, entidad_id, datos_anteriores, datos_nuevos, establecimiento_id)
            VALUES (?, ?, ?, 'eliminar', 'alumnos', ?, 'alumno', ?, ?, NULL, ?)
        `, [
            usuario_id,
            tipo_usuario,
            nombre_usuario,
            descripcion,
            id,
            datosAnterioresJson,
            establecimiento_id
        ]);

        await connection.commit();

        res.json({ success: true, message: 'Alumno eliminado correctamente' });
    } catch (error) {
        await connection.rollback();
        console.error('Error al eliminar alumno:', error);
        res.status(500).json({ success: false, error: 'Error al eliminar alumno' });
    } finally {
        connection.release();
    }
});

// ============================================
// RUTAS DE CURSOS
// ============================================

// GET /api/cursos - Obtener cursos del establecimiento
app.get('/api/cursos', async (req, res) => {
    const { establecimiento_id = 1, anio_academico } = req.query;
    const anio = anio_academico || new Date().getFullYear();

    try {
        const [rows] = await pool.query(`
            SELECT id, nombre, codigo, nivel, grado, letra, anio_academico
            FROM tb_cursos
            WHERE establecimiento_id = ?
            AND anio_academico = ?
            AND activo = 1
            ORDER BY nivel, grado, letra
        `, [establecimiento_id, anio]);

        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error al obtener cursos:', error);
        res.status(500).json({ success: false, error: 'Error al obtener cursos' });
    }
});

// ============================================
// RUTAS DE APODERADO
// ============================================

// GET /api/apoderado/pupilos-pendientes/:rutApoderado - Obtener pupilos pendientes de vinculación
app.get('/api/apoderado/pupilos-pendientes/:rutApoderado', async (req, res) => {
    const { rutApoderado } = req.params;

    try {
        // Buscar en tb_preregistro_relaciones los pupilos pendientes (case-insensitive)
        const [pendientes] = await pool.query(`
            SELECT
                pr.id as preregistro_id,
                pr.rut_alumno,
                pr.nombres_alumno,
                pr.apellidos_alumno,
                pr.parentesco,
                pr.establecimiento_id,
                e.nombre as establecimiento_nombre,
                a.id as alumno_id,
                c.nombre as curso_nombre
            FROM tb_preregistro_relaciones pr
            JOIN tb_establecimientos e ON pr.establecimiento_id = e.id
            JOIN tb_alumnos a ON UPPER(a.rut) = UPPER(pr.rut_alumno) AND a.activo = 1
            LEFT JOIN tb_alumno_establecimiento ae ON a.id = ae.alumno_id AND ae.activo = 1
            LEFT JOIN tb_cursos c ON ae.curso_id = c.id
            WHERE UPPER(pr.rut_apoderado) = UPPER(?)
              AND pr.activo = 1
              AND pr.usado = 0
        `, [rutApoderado]);

        res.json({
            success: true,
            data: pendientes,
            cantidad: pendientes.length
        });

    } catch (error) {
        console.error('Error obteniendo pupilos pendientes:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener pupilos pendientes'
        });
    }
});

// POST /api/apoderado/confirmar-pupilo - Confirmar vinculación de pupilo
app.post('/api/apoderado/confirmar-pupilo', async (req, res) => {
    const { preregistro_id, apoderado_id } = req.body;

    if (!preregistro_id || !apoderado_id) {
        return res.status(400).json({
            success: false,
            error: 'Faltan datos requeridos'
        });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Obtener datos del preregistro
        const [preregistros] = await connection.query(
            'SELECT * FROM tb_preregistro_relaciones WHERE id = ? AND activo = 1 AND usado = 0',
            [preregistro_id]
        );

        if (preregistros.length === 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                error: 'Preregistro no encontrado o ya fue usado'
            });
        }

        const preregistro = preregistros[0];

        // 2. Buscar el alumno por RUT (case-insensitive)
        const [alumnos] = await connection.query(
            'SELECT id FROM tb_alumnos WHERE UPPER(rut) = UPPER(?) AND activo = 1',
            [preregistro.rut_alumno]
        );

        if (alumnos.length === 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                error: 'El alumno no está registrado en el sistema'
            });
        }

        const alumnoId = alumnos[0].id;

        // 3. Verificar que no exista ya la relación
        const [relacionExistente] = await connection.query(
            'SELECT id FROM tb_apoderado_alumno WHERE apoderado_id = ? AND alumno_id = ? AND activo = 1',
            [apoderado_id, alumnoId]
        );

        if (relacionExistente.length > 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                error: 'Este pupilo ya está vinculado a su cuenta'
            });
        }

        // 4. Crear relación en tb_apoderado_alumno
        await connection.query(`
            INSERT INTO tb_apoderado_alumno
            (apoderado_id, alumno_id, parentesco, es_apoderado_titular, activo)
            VALUES (?, ?, ?, ?, 1)
        `, [apoderado_id, alumnoId, preregistro.parentesco, preregistro.es_apoderado_titular || 1]);

        // 5. Marcar preregistro como usado
        await connection.query(`
            UPDATE tb_preregistro_relaciones
            SET usado = 1, fecha_uso = NOW()
            WHERE id = ?
        `, [preregistro_id]);

        await connection.commit();

        res.json({
            success: true,
            message: 'Pupilo vinculado correctamente'
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error confirmando pupilo:', error);
        res.status(500).json({
            success: false,
            error: 'Error al vincular pupilo'
        });
    } finally {
        connection.release();
    }
});

// GET /api/apoderado/mis-pupilos/:apoderadoId - Obtener pupilos vinculados del apoderado
app.get('/api/apoderado/mis-pupilos/:apoderadoId', async (req, res) => {
    const { apoderadoId } = req.params;

    try {
        const [pupilos] = await pool.query(`
            SELECT
                a.id,
                a.rut,
                a.nombres,
                a.apellidos,
                a.fecha_nacimiento,
                a.sexo,
                CONCAT(a.nombres, ' ', a.apellidos) as nombre_completo,
                aa.parentesco,
                aa.es_apoderado_titular,
                c.nombre as curso_nombre,
                e.nombre as establecimiento_nombre
            FROM tb_apoderado_alumno aa
            JOIN tb_alumnos a ON aa.alumno_id = a.id AND a.activo = 1
            LEFT JOIN tb_alumno_establecimiento ae ON a.id = ae.alumno_id AND ae.activo = 1
            LEFT JOIN tb_cursos c ON ae.curso_id = c.id
            LEFT JOIN tb_establecimientos e ON ae.establecimiento_id = e.id
            WHERE aa.apoderado_id = ? AND aa.activo = 1
            ORDER BY a.apellidos, a.nombres
        `, [apoderadoId]);

        res.json({
            success: true,
            data: pupilos
        });

    } catch (error) {
        console.error('Error obteniendo pupilos:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener pupilos'
        });
    }
});

// ============================================
// RUTAS DE ASIGNATURAS
// ============================================

// GET /api/asignaturas - Obtener asignaturas del establecimiento
app.get('/api/asignaturas', async (req, res) => {
    const { establecimiento_id = 1 } = req.query;

    try {
        const [rows] = await pool.query(`
            SELECT id, nombre, codigo, descripcion
            FROM tb_asignaturas
            WHERE establecimiento_id = ? AND activo = 1
            ORDER BY nombre
        `, [establecimiento_id]);

        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error al obtener asignaturas:', error);
        res.status(500).json({ success: false, error: 'Error al obtener asignaturas' });
    }
});

// POST /api/asignaturas - Crear nueva asignatura
app.post('/api/asignaturas', async (req, res) => {
    const { nombre, codigo, descripcion, establecimiento_id = 1 } = req.body;

    if (!nombre) {
        return res.status(400).json({ success: false, error: 'El nombre es requerido' });
    }

    try {
        // Verificar si ya existe una asignatura con ese nombre en el establecimiento
        const [existente] = await pool.query(
            'SELECT id FROM tb_asignaturas WHERE UPPER(nombre) = UPPER(?) AND establecimiento_id = ? AND activo = 1',
            [nombre, establecimiento_id]
        );

        if (existente.length > 0) {
            return res.status(400).json({ success: false, error: 'Ya existe una asignatura con ese nombre' });
        }

        const [result] = await pool.query(`
            INSERT INTO tb_asignaturas (nombre, codigo, descripcion, establecimiento_id, activo)
            VALUES (?, ?, ?, ?, 1)
        `, [nombre, codigo || null, descripcion || null, establecimiento_id]);

        res.json({
            success: true,
            message: 'Asignatura creada correctamente',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error al crear asignatura:', error);
        res.status(500).json({ success: false, error: 'Error al crear asignatura' });
    }
});

// DELETE /api/asignaturas/:id - Eliminar asignatura (soft delete)
app.delete('/api/asignaturas/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Verificar si la asignatura tiene docentes asignados activos
        const [docentesAsignados] = await pool.query(
            'SELECT COUNT(*) as count FROM tb_docente_asignatura WHERE asignatura_id = ? AND activo = 1',
            [id]
        );

        if (docentesAsignados[0].count > 0) {
            return res.status(400).json({
                success: false,
                error: 'No se puede eliminar: hay docentes asignados a esta asignatura'
            });
        }

        await pool.query('UPDATE tb_asignaturas SET activo = 0 WHERE id = ?', [id]);

        res.json({ success: true, message: 'Asignatura eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar asignatura:', error);
        res.status(500).json({ success: false, error: 'Error al eliminar asignatura' });
    }
});

// ============================================
// RUTAS DE DOCENTES
// ============================================

// GET /api/docentes - Obtener docentes del establecimiento con sus asignaturas
app.get('/api/docentes', async (req, res) => {
    const { establecimiento_id = 1 } = req.query;

    try {
        // Obtener docentes del establecimiento
        const [docentes] = await pool.query(`
            SELECT
                d.id,
                d.rut,
                d.nombres,
                d.apellidos,
                d.email,
                CONCAT(d.apellidos, ', ', d.nombres) as nombre_completo,
                de.id as relacion_id,
                de.cargo
            FROM tb_docentes d
            JOIN tb_docente_establecimiento de ON d.id = de.docente_id AND de.activo = 1
            WHERE de.establecimiento_id = ? AND d.activo = 1
            ORDER BY d.apellidos, d.nombres
        `, [establecimiento_id]);

        // Obtener asignaturas de cada docente (filtradas por establecimiento de la asignatura)
        for (let docente of docentes) {
            const [asignaturas] = await pool.query(`
                SELECT a.id, a.nombre
                FROM tb_docente_asignatura da
                JOIN tb_asignaturas a ON da.asignatura_id = a.id AND a.activo = 1
                WHERE da.docente_id = ? AND da.activo = 1 AND a.establecimiento_id = ?
            `, [docente.id, establecimiento_id]);
            docente.asignaturas = asignaturas;
        }

        res.json({ success: true, data: docentes });
    } catch (error) {
        console.error('Error al obtener docentes:', error);
        res.status(500).json({ success: false, error: 'Error al obtener docentes' });
    }
});

// POST /api/docentes/agregar - Agregar docente (verifica si existe o va a preregistro)
app.post('/api/docentes/agregar', async (req, res) => {
    const {
        rut,
        nombres,
        apellidos,
        email,
        asignaturas = [], // Array de IDs de asignaturas
        establecimiento_id = 1
    } = req.body;

    if (!rut || !nombres || !apellidos) {
        return res.status(400).json({
            success: false,
            error: 'RUT, nombres y apellidos son requeridos'
        });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Verificar si el docente ya existe en tb_docentes (ya registrado en el sistema)
        const [docenteExistente] = await connection.query(
            'SELECT id, nombres, apellidos FROM tb_docentes WHERE UPPER(rut) = UPPER(?) AND activo = 1',
            [rut]
        );

        let docenteId = null;
        let mensaje = '';
        let yaRegistrado = false;

        if (docenteExistente.length > 0) {
            // El docente YA está registrado en el sistema (tiene cuenta)
            docenteId = docenteExistente[0].id;
            yaRegistrado = true;

            // Verificar si ya está en este establecimiento
            const [yaEnEstablecimiento] = await connection.query(
                'SELECT id FROM tb_docente_establecimiento WHERE docente_id = ? AND establecimiento_id = ? AND activo = 1',
                [docenteId, establecimiento_id]
            );

            if (yaEnEstablecimiento.length > 0) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    error: 'Este docente ya está registrado en este establecimiento'
                });
            }

            // Agregar al establecimiento
            await connection.query(`
                INSERT INTO tb_docente_establecimiento (docente_id, establecimiento_id, fecha_ingreso, activo)
                VALUES (?, ?, CURDATE(), 1)
            `, [docenteId, establecimiento_id]);

            mensaje = `Docente ${docenteExistente[0].nombres} ${docenteExistente[0].apellidos} agregado al establecimiento. Ya tiene cuenta en el sistema.`;

        } else {
            // El docente NO está registrado - verificar si ya está en preregistro para este establecimiento
            const [enPreregistro] = await connection.query(
                'SELECT id FROM tb_preregistro_docentes WHERE UPPER(rut) = UPPER(?) AND establecimiento_id = ? AND activo = 1 AND usado = 0',
                [rut, establecimiento_id]
            );

            if (enPreregistro.length > 0) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    error: 'Este docente ya está en espera de registro para este establecimiento'
                });
            }

            // Obtener nombres de asignaturas para guardar en campo especialidad (texto informativo)
            let especialidadTexto = null;
            if (asignaturas.length > 0) {
                const [nombresAsig] = await connection.query(
                    `SELECT nombre FROM tb_asignaturas WHERE id IN (?) AND activo = 1`,
                    [asignaturas]
                );
                especialidadTexto = nombresAsig.map(a => a.nombre).join(', ');
            }

            // Crear preregistro para que el docente pueda registrarse
            const [resultPreregistro] = await connection.query(`
                INSERT INTO tb_preregistro_docentes
                (establecimiento_id, rut, nombres, apellidos, email, especialidad, activo, usado)
                VALUES (?, ?, ?, ?, ?, ?, 1, 0)
            `, [establecimiento_id, rut, nombres, apellidos, email || null, especialidadTexto]);

            const preregistroId = resultPreregistro.insertId;

            // Guardar las asignaturas en tb_preregistro_docente_asignatura (relación real)
            if (asignaturas.length > 0) {
                for (const asignaturaId of asignaturas) {
                    await connection.query(`
                        INSERT INTO tb_preregistro_docente_asignatura (preregistro_docente_id, asignatura_id)
                        VALUES (?, ?)
                    `, [preregistroId, asignaturaId]);
                }
            }

            mensaje = 'Docente agregado correctamente. Podrá registrarse en el sistema con su RUT.';
        }

        // 2. Si el docente ya estaba registrado, asignar las asignaturas directamente
        if (yaRegistrado && asignaturas.length > 0) {
            for (const asignaturaId of asignaturas) {
                // Verificar que no exista ya la asignación
                const [yaAsignada] = await connection.query(
                    'SELECT id FROM tb_docente_asignatura WHERE docente_id = ? AND asignatura_id = ? AND activo = 1',
                    [docenteId, asignaturaId]
                );

                if (yaAsignada.length === 0) {
                    await connection.query(`
                        INSERT INTO tb_docente_asignatura (docente_id, asignatura_id, activo)
                        VALUES (?, ?, 1)
                    `, [docenteId, asignaturaId]);
                }
            }
        }

        await connection.commit();

        res.json({
            success: true,
            message: mensaje,
            docente_existente: yaRegistrado,
            docente_id: docenteId
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error al agregar docente:', error);
        res.status(500).json({ success: false, error: 'Error al agregar docente' });
    } finally {
        connection.release();
    }
});

// PUT /api/docentes/:id - Actualizar docente con logging
app.put('/api/docentes/:id', async (req, res) => {
    const { id } = req.params;
    const {
        rut, nombres, apellidos, email, asignaturas = [],
        establecimiento_id = 1,
        usuario_id = null,
        tipo_usuario = 'sistema',
        nombre_usuario = 'Sistema'
    } = req.body;

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Obtener datos actuales
        const [docenteActual] = await connection.query(
            'SELECT rut, nombres, apellidos, email FROM tb_docentes WHERE id = ?',
            [id]
        );

        if (docenteActual.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, error: 'Docente no encontrado' });
        }

        const datosAnteriores = docenteActual[0];

        // 2. Actualizar datos básicos del docente
        await connection.query(`
            UPDATE tb_docentes SET rut = ?, nombres = ?, apellidos = ?, email = ?
            WHERE id = ?
        `, [rut, nombres, apellidos, email, id]);

        // 3. Actualizar asignaturas: desactivar las del establecimiento actual y crear las nuevas
        // Nota: tb_docente_asignatura no tiene establecimiento_id, filtramos por establecimiento de la asignatura
        await connection.query(`
            UPDATE tb_docente_asignatura da
            JOIN tb_asignaturas a ON da.asignatura_id = a.id
            SET da.activo = 0
            WHERE da.docente_id = ? AND a.establecimiento_id = ?
        `, [id, establecimiento_id]);

        for (const asignaturaId of asignaturas) {
            // Verificar si existe el registro (aunque inactivo)
            const [existe] = await connection.query(
                'SELECT id FROM tb_docente_asignatura WHERE docente_id = ? AND asignatura_id = ?',
                [id, asignaturaId]
            );

            if (existe.length > 0) {
                await connection.query(
                    'UPDATE tb_docente_asignatura SET activo = 1 WHERE id = ?',
                    [existe[0].id]
                );
            } else {
                await connection.query(`
                    INSERT INTO tb_docente_asignatura (docente_id, asignatura_id, activo)
                    VALUES (?, ?, 1)
                `, [id, asignaturaId]);
            }
        }

        // 4. Registrar en tb_log_actividades
        const cambios = [];
        if (rut !== datosAnteriores.rut) cambios.push(`RUT: "${datosAnteriores.rut}" → "${rut}"`);
        if (nombres !== datosAnteriores.nombres) cambios.push(`Nombres: "${datosAnteriores.nombres}" → "${nombres}"`);
        if (apellidos !== datosAnteriores.apellidos) cambios.push(`Apellidos: "${datosAnteriores.apellidos}" → "${apellidos}"`);
        if (email !== datosAnteriores.email) cambios.push(`Email: "${datosAnteriores.email || ''}" → "${email || ''}"`);

        if (cambios.length > 0) {
            const datosAnterioresJson = JSON.stringify({
                rut: datosAnteriores.rut,
                nombres: datosAnteriores.nombres,
                apellidos: datosAnteriores.apellidos,
                email: datosAnteriores.email
            });
            const datosNuevosJson = JSON.stringify({
                rut, nombres, apellidos, email
            });

            await connection.query(`
                INSERT INTO tb_log_actividades
                (usuario_id, tipo_usuario, nombre_usuario, accion, modulo, descripcion,
                 entidad_tipo, entidad_id, datos_anteriores, datos_nuevos, establecimiento_id)
                VALUES (?, ?, ?, 'editar', 'docentes', ?, 'docente', ?, ?, ?, ?)
            `, [usuario_id, tipo_usuario, nombre_usuario, cambios.join(' | '), id,
                datosAnterioresJson, datosNuevosJson, establecimiento_id]);
        }

        await connection.commit();

        res.json({ success: true, message: 'Docente actualizado correctamente' });
    } catch (error) {
        await connection.rollback();
        console.error('Error al actualizar docente:', error);
        res.status(500).json({ success: false, error: 'Error al actualizar docente' });
    } finally {
        connection.release();
    }
});

// DELETE /api/docentes/:id - Eliminar docente del establecimiento (soft delete)
app.delete('/api/docentes/:id', async (req, res) => {
    const { id } = req.params;
    const {
        establecimiento_id = 1,
        usuario_id = null,
        tipo_usuario = 'sistema',
        nombre_usuario = 'Sistema'
    } = req.body || {};

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Obtener datos del docente para el log
        const [docenteActual] = await connection.query(`
            SELECT d.rut, d.nombres, d.apellidos, d.email, e.nombre as establecimiento_nombre
            FROM tb_docentes d
            JOIN tb_docente_establecimiento de ON d.id = de.docente_id
            JOIN tb_establecimientos e ON de.establecimiento_id = e.id
            WHERE d.id = ? AND de.establecimiento_id = ?
        `, [id, establecimiento_id]);

        if (docenteActual.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, error: 'Docente no encontrado en este establecimiento' });
        }

        const docente = docenteActual[0];

        // 2. Desactivar relación con el establecimiento
        await connection.query(
            'UPDATE tb_docente_establecimiento SET activo = 0 WHERE docente_id = ? AND establecimiento_id = ?',
            [id, establecimiento_id]
        );

        // 3. Desactivar asignaturas de este establecimiento (via join con tb_asignaturas)
        // Nota: tb_docente_asignatura no tiene establecimiento_id, usamos el de tb_asignaturas
        await connection.query(`
            UPDATE tb_docente_asignatura da
            JOIN tb_asignaturas a ON da.asignatura_id = a.id
            SET da.activo = 0
            WHERE da.docente_id = ? AND a.establecimiento_id = ?
        `, [id, establecimiento_id]);

        // 4. Verificar si el docente tiene otros establecimientos activos
        const [otrosEstablecimientos] = await connection.query(
            'SELECT COUNT(*) as count FROM tb_docente_establecimiento WHERE docente_id = ? AND activo = 1',
            [id]
        );

        // Si no tiene otros establecimientos, desactivar el docente completamente
        if (otrosEstablecimientos[0].count === 0) {
            await connection.query('UPDATE tb_docentes SET activo = 0 WHERE id = ?', [id]);
        }

        // 5. Registrar en tb_log_actividades
        const descripcion = `Docente eliminado: ${docente.nombres} ${docente.apellidos} (RUT: ${docente.rut}) del establecimiento ${docente.establecimiento_nombre}`;
        const datosAnterioresJson = JSON.stringify({
            rut: docente.rut,
            nombres: docente.nombres,
            apellidos: docente.apellidos,
            email: docente.email,
            establecimiento: docente.establecimiento_nombre
        });

        await connection.query(`
            INSERT INTO tb_log_actividades
            (usuario_id, tipo_usuario, nombre_usuario, accion, modulo, descripcion,
             entidad_tipo, entidad_id, datos_anteriores, datos_nuevos, establecimiento_id)
            VALUES (?, ?, ?, 'eliminar', 'docentes', ?, 'docente', ?, ?, NULL, ?)
        `, [usuario_id, tipo_usuario, nombre_usuario, descripcion, id,
            datosAnterioresJson, establecimiento_id]);

        await connection.commit();

        res.json({ success: true, message: 'Docente eliminado del establecimiento correctamente' });
    } catch (error) {
        await connection.rollback();
        console.error('Error al eliminar docente:', error);
        res.status(500).json({ success: false, error: 'Error al eliminar docente' });
    } finally {
        connection.release();
    }
});

// ============================================
// RUTAS DE ASIGNACIONES (Docente-Curso-Asignatura)
// ============================================

// GET /api/asignaciones - Listar asignaciones del establecimiento
app.get('/api/asignaciones', async (req, res) => {
    const { establecimiento_id = 1, anio_academico } = req.query;
    const anio = anio_academico || new Date().getFullYear();

    try {
        const [asignaciones] = await pool.query(`
            SELECT
                a.id,
                a.docente_id,
                a.curso_id,
                a.asignatura_id,
                a.anio_academico,
                a.horas_asignadas,
                a.es_titular,
                d.nombres as docente_nombres,
                d.apellidos as docente_apellidos,
                CONCAT(d.nombres, ' ', d.apellidos) as docente_nombre_completo,
                c.nombre as curso_nombre,
                c.codigo as curso_codigo,
                asig.nombre as asignatura_nombre
            FROM tb_asignaciones a
            JOIN tb_docentes d ON a.docente_id = d.id
            JOIN tb_cursos c ON a.curso_id = c.id
            JOIN tb_asignaturas asig ON a.asignatura_id = asig.id
            WHERE a.establecimiento_id = ?
            AND a.anio_academico = ?
            AND a.activo = 1
            ORDER BY d.apellidos, d.nombres, c.nombre, asig.nombre
        `, [establecimiento_id, anio]);

        res.json({ success: true, data: asignaciones });
    } catch (error) {
        console.error('Error al obtener asignaciones:', error);
        res.status(500).json({ success: false, error: 'Error al obtener asignaciones' });
    }
});

// POST /api/asignaciones - Crear nueva asignacion (puede ser multiple)
app.post('/api/asignaciones', async (req, res) => {
    const {
        docente_id,
        curso_id,
        asignaturas = [], // Array de IDs de asignaturas
        establecimiento_id = 1,
        anio_academico,
        horas_asignadas = null,
        es_titular = 1,
        usuario_id = null,
        tipo_usuario = 'administrador',
        nombre_usuario = 'Administrador del Sistema'
    } = req.body;

    const anio = anio_academico || new Date().getFullYear();

    if (!docente_id || !curso_id || asignaturas.length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Debe seleccionar docente, curso y al menos una asignatura'
        });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const asignacionesCreadas = [];
        const asignacionesExistentes = [];

        for (const asignatura_id of asignaturas) {
            // Verificar si ya existe la asignacion
            const [existe] = await connection.query(`
                SELECT id, activo FROM tb_asignaciones
                WHERE docente_id = ? AND curso_id = ? AND asignatura_id = ? AND anio_academico = ?
            `, [docente_id, curso_id, asignatura_id, anio]);

            if (existe.length > 0) {
                if (existe[0].activo === 0) {
                    // Reactivar asignacion existente
                    await connection.query(
                        'UPDATE tb_asignaciones SET activo = 1, es_titular = ?, horas_asignadas = ? WHERE id = ?',
                        [es_titular, horas_asignadas, existe[0].id]
                    );
                    asignacionesCreadas.push(asignatura_id);
                } else {
                    asignacionesExistentes.push(asignatura_id);
                }
            } else {
                // Crear nueva asignacion
                await connection.query(`
                    INSERT INTO tb_asignaciones
                    (establecimiento_id, docente_id, curso_id, asignatura_id, anio_academico, horas_asignadas, es_titular, activo)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
                `, [establecimiento_id, docente_id, curso_id, asignatura_id, anio, horas_asignadas, es_titular]);
                asignacionesCreadas.push(asignatura_id);
            }
        }

        // Registrar en log
        if (asignacionesCreadas.length > 0) {
            // Obtener nombres para el log
            const [docente] = await connection.query(
                'SELECT CONCAT(nombres, " ", apellidos) as nombre FROM tb_docentes WHERE id = ?',
                [docente_id]
            );
            const [curso] = await connection.query(
                'SELECT nombre FROM tb_cursos WHERE id = ?',
                [curso_id]
            );

            const descripcion = `Asignacion creada: ${docente[0]?.nombre || 'Docente'} asignado a ${curso[0]?.nombre || 'Curso'} con ${asignacionesCreadas.length} asignatura(s)`;

            await connection.query(`
                INSERT INTO tb_log_actividades
                (usuario_id, tipo_usuario, nombre_usuario, accion, modulo, descripcion,
                 entidad_tipo, entidad_id, datos_nuevos, establecimiento_id)
                VALUES (?, ?, ?, 'crear', 'asignaciones', ?, 'asignacion', ?, ?, ?)
            `, [usuario_id, tipo_usuario, nombre_usuario, descripcion, docente_id,
                JSON.stringify({ docente_id, curso_id, asignaturas: asignacionesCreadas, anio_academico: anio }),
                establecimiento_id]);
        }

        await connection.commit();

        let mensaje = '';
        if (asignacionesCreadas.length > 0 && asignacionesExistentes.length === 0) {
            mensaje = `Se crearon ${asignacionesCreadas.length} asignacion(es) correctamente`;
        } else if (asignacionesCreadas.length > 0 && asignacionesExistentes.length > 0) {
            mensaje = `Se crearon ${asignacionesCreadas.length} asignacion(es). ${asignacionesExistentes.length} ya existian.`;
        } else {
            mensaje = 'Todas las asignaciones seleccionadas ya existen';
        }

        res.json({
            success: true,
            message: mensaje,
            creadas: asignacionesCreadas.length,
            existentes: asignacionesExistentes.length
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error al crear asignacion:', error);
        res.status(500).json({ success: false, error: 'Error al crear asignacion' });
    } finally {
        connection.release();
    }
});

// DELETE /api/asignaciones/:id - Eliminar asignacion (soft delete)
app.delete('/api/asignaciones/:id', async (req, res) => {
    const { id } = req.params;
    const {
        establecimiento_id = 1,
        usuario_id = null,
        tipo_usuario = 'administrador',
        nombre_usuario = 'Administrador del Sistema'
    } = req.body || {};

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Obtener datos de la asignacion para el log
        const [asignacion] = await connection.query(`
            SELECT
                a.id, a.docente_id, a.curso_id, a.asignatura_id,
                CONCAT(d.nombres, ' ', d.apellidos) as docente_nombre,
                c.nombre as curso_nombre,
                asig.nombre as asignatura_nombre
            FROM tb_asignaciones a
            JOIN tb_docentes d ON a.docente_id = d.id
            JOIN tb_cursos c ON a.curso_id = c.id
            JOIN tb_asignaturas asig ON a.asignatura_id = asig.id
            WHERE a.id = ? AND a.establecimiento_id = ?
        `, [id, establecimiento_id]);

        if (asignacion.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, error: 'Asignacion no encontrada' });
        }

        const asig = asignacion[0];

        // Soft delete
        await connection.query('UPDATE tb_asignaciones SET activo = 0 WHERE id = ?', [id]);

        // Registrar en log
        const descripcion = `Asignacion eliminada: ${asig.docente_nombre} - ${asig.curso_nombre} - ${asig.asignatura_nombre}`;

        await connection.query(`
            INSERT INTO tb_log_actividades
            (usuario_id, tipo_usuario, nombre_usuario, accion, modulo, descripcion,
             entidad_tipo, entidad_id, datos_anteriores, establecimiento_id)
            VALUES (?, ?, ?, 'eliminar', 'asignaciones', ?, 'asignacion', ?, ?, ?)
        `, [usuario_id, tipo_usuario, nombre_usuario, descripcion, id,
            JSON.stringify(asig), establecimiento_id]);

        await connection.commit();

        res.json({ success: true, message: 'Asignacion eliminada correctamente' });

    } catch (error) {
        await connection.rollback();
        console.error('Error al eliminar asignacion:', error);
        res.status(500).json({ success: false, error: 'Error al eliminar asignacion' });
    } finally {
        connection.release();
    }
});

// ============================================
// RUTAS DE NOTAS POR CURSO
// ============================================

// GET /api/asignaturas/por-curso/:cursoId - Obtener asignaturas asignadas a un curso
app.get('/api/asignaturas/por-curso/:cursoId', async (req, res) => {
    const { cursoId } = req.params;
    const { establecimiento_id = 1, anio_academico } = req.query;
    const anio = anio_academico || new Date().getFullYear();

    try {
        const [asignaturas] = await pool.query(`
            SELECT DISTINCT
                asig.id,
                asig.nombre,
                asig.codigo
            FROM tb_asignaciones a
            JOIN tb_asignaturas asig ON a.asignatura_id = asig.id
            WHERE a.curso_id = ?
            AND a.establecimiento_id = ?
            AND a.anio_academico = ?
            AND a.activo = 1
            AND asig.activo = 1
            ORDER BY asig.nombre
        `, [cursoId, establecimiento_id, anio]);

        res.json({ success: true, data: asignaturas });
    } catch (error) {
        console.error('Error al obtener asignaturas del curso:', error);
        res.status(500).json({ success: false, error: 'Error al obtener asignaturas del curso' });
    }
});

// GET /api/alumnos/por-curso/:cursoId - Obtener alumnos de un curso específico
app.get('/api/alumnos/por-curso/:cursoId', async (req, res) => {
    const { cursoId } = req.params;
    const { establecimiento_id = 1, anio_academico } = req.query;
    const anio = anio_academico || new Date().getFullYear();

    try {
        const [alumnos] = await pool.query(`
            SELECT
                a.id,
                a.rut,
                a.nombres,
                a.apellidos,
                CONCAT(a.apellidos, ', ', a.nombres) AS nombre_completo,
                ae.numero_lista
            FROM tb_alumnos a
            JOIN tb_alumno_establecimiento ae ON a.id = ae.alumno_id
            WHERE ae.curso_id = ?
            AND ae.establecimiento_id = ?
            AND ae.anio_academico = ?
            AND ae.activo = 1
            AND a.activo = 1
            ORDER BY ae.numero_lista, a.apellidos, a.nombres
        `, [cursoId, establecimiento_id, anio]);

        res.json({ success: true, data: alumnos });
    } catch (error) {
        console.error('Error al obtener alumnos del curso:', error);
        res.status(500).json({ success: false, error: 'Error al obtener alumnos del curso' });
    }
});

// GET /api/notas/por-curso - Obtener notas filtradas por curso, asignatura y trimestre
app.get('/api/notas/por-curso', async (req, res) => {
    const {
        curso_id,
        asignatura_id,
        trimestre,
        establecimiento_id = 1,
        anio_academico
    } = req.query;
    const anio = anio_academico || new Date().getFullYear();

    if (!curso_id || !asignatura_id) {
        return res.status(400).json({
            success: false,
            error: 'Debe especificar curso_id y asignatura_id'
        });
    }

    try {
        // Primero obtener todos los alumnos del curso
        const [alumnos] = await pool.query(`
            SELECT
                a.id,
                a.rut,
                a.nombres,
                a.apellidos,
                CONCAT(a.apellidos, ', ', a.nombres) AS nombre_completo,
                ae.numero_lista
            FROM tb_alumnos a
            JOIN tb_alumno_establecimiento ae ON a.id = ae.alumno_id
            WHERE ae.curso_id = ?
            AND ae.establecimiento_id = ?
            AND ae.anio_academico = ?
            AND ae.activo = 1
            AND a.activo = 1
            ORDER BY ae.numero_lista, a.apellidos, a.nombres
        `, [curso_id, establecimiento_id, anio]);

        // Construir query de notas según filtros
        let notasQuery = `
            SELECT
                n.id,
                n.alumno_id,
                n.trimestre,
                n.numero_evaluacion,
                n.nota,
                n.descripcion,
                te.nombre as tipo_evaluacion,
                te.abreviatura as tipo_evaluacion_abrev
            FROM tb_notas n
            LEFT JOIN tb_tipos_evaluacion te ON n.tipo_evaluacion_id = te.id
            WHERE n.curso_id = ?
            AND n.asignatura_id = ?
            AND n.establecimiento_id = ?
            AND n.anio_academico = ?
            AND n.activo = 1
        `;
        const params = [curso_id, asignatura_id, establecimiento_id, anio];

        // Filtrar por trimestre si no es "todas"
        if (trimestre && trimestre !== 'todas') {
            notasQuery += ` AND n.trimestre = ?`;
            params.push(trimestre);
        }

        notasQuery += ` ORDER BY n.trimestre, n.numero_evaluacion`;

        const [notas] = await pool.query(notasQuery, params);

        // Organizar notas por alumno y trimestre
        const notasPorAlumno = {};
        notas.forEach(nota => {
            if (!notasPorAlumno[nota.alumno_id]) {
                notasPorAlumno[nota.alumno_id] = { 1: [], 2: [], 3: [] };
            }
            notasPorAlumno[nota.alumno_id][nota.trimestre].push({
                id: nota.id,
                numero: nota.numero_evaluacion,
                nota: nota.nota,
                descripcion: nota.descripcion,
                tipo: nota.tipo_evaluacion_abrev || nota.tipo_evaluacion
            });
        });

        // Combinar alumnos con sus notas
        const resultado = alumnos.map(alumno => ({
            ...alumno,
            notas: notasPorAlumno[alumno.id] || { 1: [], 2: [], 3: [] }
        }));

        res.json({
            success: true,
            data: resultado,
            trimestres: trimestre === 'todas' ? [1, 2, 3] : [parseInt(trimestre)]
        });
    } catch (error) {
        console.error('Error al obtener notas del curso:', error);
        res.status(500).json({ success: false, error: 'Error al obtener notas del curso' });
    }
});

// POST /api/notas - Guardar o actualizar una nota
app.post('/api/notas', async (req, res) => {
    const {
        alumno_id,
        asignatura_id,
        curso_id,
        docente_id,
        tipo_evaluacion_id,
        trimestre,
        numero_evaluacion,
        nota,
        descripcion,
        establecimiento_id = 1,
        anio_academico,
        usuario_id = null,
        tipo_usuario = 'docente',
        nombre_usuario = 'Docente'
    } = req.body;

    const anio = anio_academico || new Date().getFullYear();

    if (!alumno_id || !asignatura_id || !curso_id || !trimestre || nota === undefined) {
        return res.status(400).json({
            success: false,
            error: 'Faltan datos requeridos (alumno, asignatura, curso, trimestre, nota)'
        });
    }

    // Validar rango de nota (1.0 - 7.0)
    const notaNum = parseFloat(nota);
    if (isNaN(notaNum) || notaNum < 1.0 || notaNum > 7.0) {
        return res.status(400).json({
            success: false,
            error: 'La nota debe estar entre 1.0 y 7.0'
        });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Verificar si ya existe una nota para ese alumno/asignatura/trimestre/numero_evaluacion
        const [existente] = await connection.query(`
            SELECT id, nota as nota_anterior
            FROM tb_notas
            WHERE alumno_id = ?
            AND asignatura_id = ?
            AND curso_id = ?
            AND trimestre = ?
            AND numero_evaluacion = ?
            AND establecimiento_id = ?
            AND anio_academico = ?
            AND activo = 1
        `, [alumno_id, asignatura_id, curso_id, trimestre, numero_evaluacion || 1,
            establecimiento_id, anio]);

        let notaId;
        let accion;

        if (existente.length > 0) {
            // Actualizar nota existente
            notaId = existente[0].id;
            accion = 'editar';

            await connection.query(`
                UPDATE tb_notas
                SET nota = ?, descripcion = ?, docente_id = ?, tipo_evaluacion_id = ?,
                    fecha_evaluacion = CURDATE()
                WHERE id = ?
            `, [notaNum, descripcion || null, docente_id || null, tipo_evaluacion_id || null, notaId]);
        } else {
            // Insertar nueva nota
            accion = 'crear';

            const [result] = await connection.query(`
                INSERT INTO tb_notas
                (establecimiento_id, alumno_id, asignatura_id, curso_id, docente_id,
                 tipo_evaluacion_id, anio_academico, trimestre, numero_evaluacion,
                 nota, descripcion, fecha_evaluacion, activo)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), 1)
            `, [establecimiento_id, alumno_id, asignatura_id, curso_id, docente_id || null,
                tipo_evaluacion_id || null, anio, trimestre, numero_evaluacion || 1,
                notaNum, descripcion || null]);

            notaId = result.insertId;
        }

        // Registrar en log
        await connection.query(`
            INSERT INTO tb_log_actividades
            (usuario_id, tipo_usuario, nombre_usuario, accion, modulo, descripcion,
             entidad_tipo, entidad_id, datos_nuevos, establecimiento_id)
            VALUES (?, ?, ?, ?, 'notas', ?, 'nota', ?, ?, ?)
        `, [usuario_id, tipo_usuario, nombre_usuario, accion,
            `Nota ${accion === 'crear' ? 'ingresada' : 'editada'}: ${notaNum}`,
            notaId,
            JSON.stringify({ alumno_id, asignatura_id, trimestre, nota: notaNum }),
            establecimiento_id]);

        await connection.commit();

        res.json({
            success: true,
            message: `Nota ${accion === 'crear' ? 'guardada' : 'editada'} correctamente`,
            id: notaId
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error al guardar nota:', error);
        res.status(500).json({ success: false, error: 'Error al guardar nota' });
    } finally {
        connection.release();
    }
});

// ============================================
// RUTAS DE ASISTENCIA
// ============================================

// GET /api/asistencia - Obtener asistencia por curso y mes
app.get('/api/asistencia', async (req, res) => {
    const { curso_id, mes, anio, establecimiento_id = 1 } = req.query;
    const anioActual = anio || new Date().getFullYear();

    if (!curso_id || mes === undefined) {
        return res.status(400).json({
            success: false,
            error: 'Debe especificar curso_id y mes'
        });
    }

    try {
        // Obtener todos los registros de asistencia del curso para el mes
        const [asistencias] = await pool.query(`
            SELECT
                a.id,
                a.alumno_id,
                a.fecha,
                DAY(a.fecha) as dia,
                a.estado,
                a.hora_llegada,
                a.minutos_atraso,
                a.motivo_ausencia,
                a.observacion,
                a.registrado_por,
                a.fecha_modificacion
            FROM tb_asistencia a
            WHERE a.curso_id = ?
            AND a.establecimiento_id = ?
            AND MONTH(a.fecha) = ?
            AND YEAR(a.fecha) = ?
            AND a.activo = 1
            ORDER BY a.alumno_id, a.fecha
        `, [curso_id, establecimiento_id, parseInt(mes) + 1, anioActual]);

        // Organizar por alumno
        const asistenciaPorAlumno = {};
        asistencias.forEach(registro => {
            if (!asistenciaPorAlumno[registro.alumno_id]) {
                asistenciaPorAlumno[registro.alumno_id] = {};
            }
            asistenciaPorAlumno[registro.alumno_id][registro.dia] = {
                id: registro.id,
                estado: registro.estado,
                hora_llegada: registro.hora_llegada,
                minutos_atraso: registro.minutos_atraso,
                motivo_ausencia: registro.motivo_ausencia,
                observacion: registro.observacion
            };
        });

        res.json({
            success: true,
            data: asistenciaPorAlumno,
            total_registros: asistencias.length
        });
    } catch (error) {
        console.error('Error al obtener asistencia:', error);
        res.status(500).json({ success: false, error: 'Error al obtener asistencia' });
    }
});

// GET /api/asistencia/estadisticas - Obtener estadísticas/KPIs del mes
app.get('/api/asistencia/estadisticas', async (req, res) => {
    const { curso_id, mes, anio, establecimiento_id = 1 } = req.query;
    const anioActual = anio || new Date().getFullYear();

    if (!curso_id || mes === undefined) {
        return res.status(400).json({
            success: false,
            error: 'Debe especificar curso_id y mes'
        });
    }

    try {
        // Obtener conteo por estado
        const [estadisticas] = await pool.query(`
            SELECT
                estado,
                COUNT(*) as cantidad
            FROM tb_asistencia
            WHERE curso_id = ?
            AND establecimiento_id = ?
            AND MONTH(fecha) = ?
            AND YEAR(fecha) = ?
            AND activo = 1
            GROUP BY estado
        `, [curso_id, establecimiento_id, parseInt(mes) + 1, anioActual]);

        // Construir objeto de estadísticas
        const stats = {
            total: 0,
            presente: 0,
            ausente: 0,
            justificado: 0,
            atrasado: 0,
            retirado: 0,
            suspendido: 0
        };

        estadisticas.forEach(e => {
            stats[e.estado] = e.cantidad;
            stats.total += e.cantidad;
        });

        // Calcular porcentaje de asistencia (presentes + atrasados / total)
        const asistenciaReal = stats.presente + stats.atrasado;
        stats.porcentaje_asistencia = stats.total > 0
            ? ((asistenciaReal / stats.total) * 100).toFixed(1)
            : '0.0';

        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ success: false, error: 'Error al obtener estadísticas' });
    }
});

// GET /api/asistencia/alumnos-bajo-umbral - Alumnos con asistencia bajo 85%
app.get('/api/asistencia/alumnos-bajo-umbral', async (req, res) => {
    const { curso_id, anio, establecimiento_id = 1, umbral = 85 } = req.query;
    const anioActual = anio || new Date().getFullYear();

    if (!curso_id) {
        return res.status(400).json({
            success: false,
            error: 'Debe especificar curso_id'
        });
    }

    try {
        // Obtener asistencia de todo el año por alumno
        const [resultados] = await pool.query(`
            SELECT
                a.alumno_id,
                al.nombres,
                al.apellidos,
                CONCAT(al.apellidos, ', ', al.nombres) as nombre_completo,
                COUNT(*) as total_registros,
                SUM(CASE WHEN a.estado IN ('presente', 'atrasado') THEN 1 ELSE 0 END) as asistencias,
                ROUND((SUM(CASE WHEN a.estado IN ('presente', 'atrasado') THEN 1 ELSE 0 END) / COUNT(*)) * 100, 1) as porcentaje
            FROM tb_asistencia a
            JOIN tb_alumnos al ON a.alumno_id = al.id
            WHERE a.curso_id = ?
            AND a.establecimiento_id = ?
            AND YEAR(a.fecha) = ?
            AND a.activo = 1
            GROUP BY a.alumno_id, al.nombres, al.apellidos
            HAVING porcentaje < ?
            ORDER BY porcentaje ASC
        `, [curso_id, establecimiento_id, anioActual, umbral]);

        res.json({
            success: true,
            data: resultados,
            cantidad: resultados.length,
            umbral: umbral
        });
    } catch (error) {
        console.error('Error al obtener alumnos bajo umbral:', error);
        res.status(500).json({ success: false, error: 'Error al obtener alumnos bajo umbral' });
    }
});

// POST /api/asistencia - Registrar asistencia de un alumno (individual)
app.post('/api/asistencia', async (req, res) => {
    const {
        alumno_id,
        curso_id,
        fecha,
        estado,
        hora_llegada,
        minutos_atraso,
        motivo_ausencia,
        observacion,
        registrado_por,
        establecimiento_id = 1,
        anio_academico,
        trimestre = 1
    } = req.body;

    const anio = anio_academico || new Date().getFullYear();

    if (!alumno_id || !curso_id || !fecha || !estado) {
        return res.status(400).json({
            success: false,
            error: 'Faltan datos requeridos (alumno_id, curso_id, fecha, estado)'
        });
    }

    try {
        // Verificar si ya existe registro para ese alumno y fecha
        const [existente] = await pool.query(`
            SELECT id FROM tb_asistencia
            WHERE alumno_id = ? AND fecha = ? AND activo = 1
        `, [alumno_id, fecha]);

        let asistenciaId;

        if (existente.length > 0) {
            // Actualizar registro existente
            await pool.query(`
                UPDATE tb_asistencia
                SET estado = ?, hora_llegada = ?, minutos_atraso = ?,
                    motivo_ausencia = ?, observacion = ?, registrado_por = ?
                WHERE id = ?
            `, [estado, hora_llegada || null, minutos_atraso || 0,
                motivo_ausencia || null, observacion || null, registrado_por || null,
                existente[0].id]);
            asistenciaId = existente[0].id;
        } else {
            // Crear nuevo registro
            const [result] = await pool.query(`
                INSERT INTO tb_asistencia
                (establecimiento_id, alumno_id, curso_id, fecha, anio_academico, trimestre,
                 estado, hora_llegada, minutos_atraso, motivo_ausencia, observacion, registrado_por, activo)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            `, [establecimiento_id, alumno_id, curso_id, fecha, anio, trimestre,
                estado, hora_llegada || null, minutos_atraso || 0,
                motivo_ausencia || null, observacion || null, registrado_por || null]);
            asistenciaId = result.insertId;
        }

        res.json({
            success: true,
            message: 'Asistencia registrada correctamente',
            id: asistenciaId
        });
    } catch (error) {
        console.error('Error al registrar asistencia:', error);
        res.status(500).json({ success: false, error: 'Error al registrar asistencia' });
    }
});

// POST /api/asistencia/masivo - Registrar asistencia de todo un curso
app.post('/api/asistencia/masivo', async (req, res) => {
    const {
        curso_id,
        fecha,
        asistencias, // Array de { alumno_id, estado, hora_llegada?, minutos_atraso?, observacion? }
        registrado_por,
        establecimiento_id = 1,
        anio_academico,
        trimestre = 1
    } = req.body;

    const anio = anio_academico || new Date().getFullYear();

    if (!curso_id || !fecha || !asistencias || asistencias.length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Faltan datos requeridos (curso_id, fecha, asistencias)'
        });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        let registrosCreados = 0;
        let registrosActualizados = 0;

        for (const item of asistencias) {
            // Verificar si ya existe
            const [existente] = await connection.query(`
                SELECT id FROM tb_asistencia
                WHERE alumno_id = ? AND fecha = ? AND activo = 1
            `, [item.alumno_id, fecha]);

            if (existente.length > 0) {
                // Actualizar
                await connection.query(`
                    UPDATE tb_asistencia
                    SET estado = ?, hora_llegada = ?, minutos_atraso = ?,
                        observacion = ?, registrado_por = ?
                    WHERE id = ?
                `, [item.estado, item.hora_llegada || null, item.minutos_atraso || 0,
                    item.observacion || null, registrado_por || null, existente[0].id]);
                registrosActualizados++;
            } else {
                // Insertar
                await connection.query(`
                    INSERT INTO tb_asistencia
                    (establecimiento_id, alumno_id, curso_id, fecha, anio_academico, trimestre,
                     estado, hora_llegada, minutos_atraso, observacion, registrado_por, activo)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
                `, [establecimiento_id, item.alumno_id, curso_id, fecha, anio, trimestre,
                    item.estado, item.hora_llegada || null, item.minutos_atraso || 0,
                    item.observacion || null, registrado_por || null]);
                registrosCreados++;
            }
        }

        await connection.commit();

        res.json({
            success: true,
            message: `Asistencia guardada: ${registrosCreados} nuevos, ${registrosActualizados} actualizados`,
            registros_creados: registrosCreados,
            registros_actualizados: registrosActualizados
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error al registrar asistencia masiva:', error);
        res.status(500).json({ success: false, error: 'Error al registrar asistencia' });
    } finally {
        connection.release();
    }
});

// PUT /api/asistencia/:id - Actualizar un registro de asistencia (admin)
app.put('/api/asistencia/:id', async (req, res) => {
    const { id } = req.params;
    const {
        estado,
        hora_llegada,
        minutos_atraso,
        motivo_ausencia,
        observacion,
        modificado_por,
        establecimiento_id = 1
    } = req.body;

    if (!estado) {
        return res.status(400).json({
            success: false,
            error: 'El estado es requerido'
        });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Obtener datos anteriores para log
        const [anterior] = await connection.query(
            'SELECT * FROM tb_asistencia WHERE id = ? AND activo = 1',
            [id]
        );

        if (anterior.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, error: 'Registro no encontrado' });
        }

        const datosAnteriores = anterior[0];

        // Actualizar asistencia
        await connection.query(`
            UPDATE tb_asistencia
            SET estado = ?, hora_llegada = ?, minutos_atraso = ?,
                motivo_ausencia = ?, observacion = ?
            WHERE id = ?
        `, [estado, hora_llegada || null, minutos_atraso || 0,
            motivo_ausencia || null, observacion || null, id]);

        // Registrar en log si cambió el estado
        if (estado !== datosAnteriores.estado) {
            await connection.query(`
                INSERT INTO tb_log_actividades
                (usuario_id, tipo_usuario, nombre_usuario, accion, modulo, descripcion,
                 entidad_tipo, entidad_id, datos_anteriores, datos_nuevos, establecimiento_id)
                VALUES (?, 'administrador', ?, 'editar', 'asistencia', ?, 'asistencia', ?, ?, ?, ?)
            `, [
                modificado_por || null,
                'Administrador',
                `Cambio de asistencia: ${datosAnteriores.estado} → ${estado}`,
                id,
                JSON.stringify({ estado: datosAnteriores.estado }),
                JSON.stringify({ estado }),
                establecimiento_id
            ]);
        }

        await connection.commit();

        res.json({
            success: true,
            message: 'Asistencia actualizada correctamente'
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error al actualizar asistencia:', error);
        res.status(500).json({ success: false, error: 'Error al actualizar asistencia' });
    } finally {
        connection.release();
    }
});

// ============================================
// RUTAS DE COMUNICADOS
// ============================================

// GET /api/comunicados - Obtener comunicados (para admin ver historial)
app.get('/api/comunicados', async (req, res) => {
    const { establecimiento_id = 1, limite = 50 } = req.query;

    try {
        const [comunicados] = await pool.query(`
            SELECT
                c.id,
                c.titulo,
                c.mensaje,
                c.tipo,
                c.prioridad,
                c.para_todos_cursos,
                c.fecha_envio,
                c.activo,
                CONCAT(u.nombres, ' ', u.apellidos) as remitente_nombre
            FROM tb_comunicados c
            LEFT JOIN tb_usuarios u ON c.remitente_id = u.id
            WHERE c.establecimiento_id = ?
            AND c.activo = 1
            ORDER BY c.fecha_envio DESC
            LIMIT ?
        `, [establecimiento_id, parseInt(limite)]);

        // Obtener cursos de cada comunicado
        for (let comunicado of comunicados) {
            if (!comunicado.para_todos_cursos) {
                const [cursos] = await pool.query(`
                    SELECT c.id, c.nombre
                    FROM tb_comunicado_curso cc
                    JOIN tb_cursos c ON cc.curso_id = c.id
                    WHERE cc.comunicado_id = ?
                `, [comunicado.id]);
                comunicado.cursos = cursos;
            } else {
                comunicado.cursos = [{ id: 0, nombre: 'Todos los cursos' }];
            }
        }

        res.json({ success: true, data: comunicados });
    } catch (error) {
        console.error('Error al obtener comunicados:', error);
        res.status(500).json({ success: false, error: 'Error al obtener comunicados' });
    }
});

// GET /api/comunicados/apoderado/:apoderadoId - Obtener comunicados para un apoderado
app.get('/api/comunicados/apoderado/:apoderadoId', async (req, res) => {
    const { apoderadoId } = req.params;
    const { establecimiento_id = 1 } = req.query;

    try {
        // Primero obtener los cursos de los pupilos del apoderado
        const [pupilos] = await pool.query(`
            SELECT DISTINCT ae.curso_id
            FROM tb_apoderado_alumno aa
            JOIN tb_alumno_establecimiento ae ON aa.alumno_id = ae.alumno_id AND ae.activo = 1
            WHERE aa.apoderado_id = ? AND aa.activo = 1
        `, [apoderadoId]);

        const cursosIds = pupilos.map(p => p.curso_id);

        if (cursosIds.length === 0) {
            return res.json({ success: true, data: [] });
        }

        // Obtener comunicados para esos cursos o para todos los cursos
        const [comunicados] = await pool.query(`
            SELECT DISTINCT
                c.id,
                c.titulo,
                c.mensaje,
                c.tipo,
                c.prioridad,
                c.para_todos_cursos,
                c.requiere_confirmacion,
                c.permite_respuesta,
                c.fecha_evento,
                c.hora_evento,
                c.lugar_evento,
                c.fecha_envio,
                CONCAT(u.nombres, ' ', u.apellidos) as remitente_nombre,
                cl.id as lectura_id,
                cl.fecha_lectura,
                cl.confirmado,
                cl.fecha_confirmacion
            FROM tb_comunicados c
            LEFT JOIN tb_usuarios u ON c.remitente_id = u.id
            LEFT JOIN tb_comunicado_curso cc ON c.id = cc.comunicado_id
            LEFT JOIN tb_comunicado_leido cl ON c.id = cl.comunicado_id AND cl.usuario_id = ?
            WHERE c.establecimiento_id = ?
            AND c.activo = 1
            AND c.para_apoderados = 1
            AND (c.para_todos_cursos = 1 OR cc.curso_id IN (?))
            ORDER BY c.fecha_envio DESC
        `, [apoderadoId, establecimiento_id, cursosIds]);

        res.json({ success: true, data: comunicados });
    } catch (error) {
        console.error('Error al obtener comunicados del apoderado:', error);
        res.status(500).json({ success: false, error: 'Error al obtener comunicados' });
    }
});

// POST /api/comunicados - Crear/enviar comunicado
app.post('/api/comunicados', async (req, res) => {
    const {
        titulo,
        mensaje,
        tipo = 'informativo',
        prioridad = 'normal',
        para_todos_cursos = false,
        cursos_ids = [], // Array de IDs de cursos
        para_apoderados = true,
        para_docentes = false,
        requiere_confirmacion = false,
        permite_respuesta = false,
        fecha_evento = null,
        hora_evento = null,
        lugar_evento = null,
        remitente_id,
        establecimiento_id = 1
    } = req.body;

    if (!titulo || !mensaje) {
        return res.status(400).json({
            success: false,
            error: 'El título y mensaje son requeridos'
        });
    }

    if (!remitente_id) {
        return res.status(400).json({
            success: false,
            error: 'El remitente es requerido'
        });
    }

    if (!para_todos_cursos && cursos_ids.length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Debe seleccionar al menos un curso o marcar "todos los cursos"'
        });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Insertar comunicado
        const [result] = await connection.query(`
            INSERT INTO tb_comunicados
            (establecimiento_id, remitente_id, titulo, mensaje, tipo, prioridad,
             para_todos_cursos, para_docentes, para_apoderados,
             requiere_confirmacion, permite_respuesta,
             fecha_evento, hora_evento, lugar_evento, enviado, activo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)
        `, [
            establecimiento_id,
            remitente_id,
            titulo,
            mensaje,
            tipo,
            prioridad,
            para_todos_cursos ? 1 : 0,
            para_docentes ? 1 : 0,
            para_apoderados ? 1 : 0,
            requiere_confirmacion ? 1 : 0,
            permite_respuesta ? 1 : 0,
            fecha_evento,
            hora_evento,
            lugar_evento
        ]);

        const comunicadoId = result.insertId;

        // 2. Si no es para todos los cursos, insertar relaciones con cursos
        if (!para_todos_cursos && cursos_ids.length > 0) {
            for (const cursoId of cursos_ids) {
                await connection.query(`
                    INSERT INTO tb_comunicado_curso (comunicado_id, curso_id)
                    VALUES (?, ?)
                `, [comunicadoId, cursoId]);
            }
        }

        // 3. Registrar en log
        await connection.query(`
            INSERT INTO tb_log_actividades
            (usuario_id, tipo_usuario, nombre_usuario, accion, modulo, descripcion,
             entidad_tipo, entidad_id, datos_nuevos, establecimiento_id)
            VALUES (?, 'administrador', 'Administrador', 'crear', 'comunicados', ?, 'comunicado', ?, ?, ?)
        `, [
            remitente_id,
            `Comunicado enviado: ${titulo}`,
            comunicadoId,
            JSON.stringify({ titulo, tipo, para_todos_cursos, cursos_ids }),
            establecimiento_id
        ]);

        await connection.commit();

        res.json({
            success: true,
            message: 'Comunicado enviado correctamente',
            id: comunicadoId
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error al enviar comunicado:', error);
        res.status(500).json({ success: false, error: 'Error al enviar comunicado' });
    } finally {
        connection.release();
    }
});

// POST /api/comunicados/:id/marcar-leido - Marcar comunicado como leído
app.post('/api/comunicados/:id/marcar-leido', async (req, res) => {
    const { id } = req.params;
    const { usuario_id } = req.body;

    if (!usuario_id) {
        return res.status(400).json({
            success: false,
            error: 'El usuario_id es requerido'
        });
    }

    try {
        // Verificar si ya existe registro de lectura
        const [existente] = await pool.query(`
            SELECT id FROM tb_comunicado_leido
            WHERE comunicado_id = ? AND usuario_id = ?
        `, [id, usuario_id]);

        if (existente.length === 0) {
            // Crear registro de lectura
            await pool.query(`
                INSERT INTO tb_comunicado_leido (comunicado_id, usuario_id)
                VALUES (?, ?)
            `, [id, usuario_id]);
        }

        res.json({ success: true, message: 'Comunicado marcado como leído' });
    } catch (error) {
        console.error('Error al marcar comunicado como leído:', error);
        res.status(500).json({ success: false, error: 'Error al marcar como leído' });
    }
});

// POST /api/comunicados/:id/confirmar - Confirmar comunicado (si requiere confirmación)
app.post('/api/comunicados/:id/confirmar', async (req, res) => {
    const { id } = req.params;
    const { usuario_id, respuesta } = req.body;

    if (!usuario_id) {
        return res.status(400).json({
            success: false,
            error: 'El usuario_id es requerido'
        });
    }

    try {
        // Verificar si ya existe registro
        const [existente] = await pool.query(`
            SELECT id FROM tb_comunicado_leido
            WHERE comunicado_id = ? AND usuario_id = ?
        `, [id, usuario_id]);

        if (existente.length > 0) {
            // Actualizar con confirmación
            await pool.query(`
                UPDATE tb_comunicado_leido
                SET confirmado = 1, fecha_confirmacion = NOW(),
                    respuesta = ?, fecha_respuesta = ?
                WHERE id = ?
            `, [respuesta || null, respuesta ? new Date() : null, existente[0].id]);
        } else {
            // Crear registro con confirmación
            await pool.query(`
                INSERT INTO tb_comunicado_leido
                (comunicado_id, usuario_id, confirmado, fecha_confirmacion, respuesta, fecha_respuesta)
                VALUES (?, ?, 1, NOW(), ?, ?)
            `, [id, usuario_id, respuesta || null, respuesta ? new Date() : null]);
        }

        res.json({ success: true, message: 'Comunicado confirmado' });
    } catch (error) {
        console.error('Error al confirmar comunicado:', error);
        res.status(500).json({ success: false, error: 'Error al confirmar comunicado' });
    }
});

// DELETE /api/comunicados/:id - Eliminar comunicado (soft delete)
app.delete('/api/comunicados/:id', async (req, res) => {
    const { id } = req.params;
    const { establecimiento_id = 1 } = req.body || {};

    try {
        await pool.query(`
            UPDATE tb_comunicados SET activo = 0 WHERE id = ? AND establecimiento_id = ?
        `, [id, establecimiento_id]);

        res.json({ success: true, message: 'Comunicado eliminado' });
    } catch (error) {
        console.error('Error al eliminar comunicado:', error);
        res.status(500).json({ success: false, error: 'Error al eliminar comunicado' });
    }
});

// ============================================
// RUTAS DE ESTADÍSTICAS
// ============================================

// GET /api/estadisticas/general - KPIs generales del establecimiento
app.get('/api/estadisticas/general', async (req, res) => {
    const { establecimiento_id = 1, anio_academico } = req.query;
    const anio = anio_academico || new Date().getFullYear();

    try {
        // Promedio general y tasa de aprobación
        const [notasStats] = await pool.query(`
            SELECT
                ROUND(AVG(nota), 1) as promedioGeneral,
                ROUND(SUM(CASE WHEN nota >= 4.0 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as tasaAprobacion,
                COUNT(DISTINCT alumno_id) as totalAlumnosConNotas
            FROM tb_notas
            WHERE establecimiento_id = ? AND anio_academico = ? AND activo = 1 AND nota IS NOT NULL
        `, [establecimiento_id, anio]);

        // Total de alumnos activos
        const [alumnosCount] = await pool.query(`
            SELECT COUNT(DISTINCT a.id) as totalAlumnos
            FROM tb_alumnos a
            INNER JOIN tb_alumno_establecimiento ae ON a.id = ae.alumno_id
            WHERE ae.establecimiento_id = ? AND ae.anio_academico = ? AND ae.activo = 1 AND a.activo = 1
        `, [establecimiento_id, anio]);

        // Total de docentes activos
        const [docentesCount] = await pool.query(`
            SELECT COUNT(DISTINCT d.id) as totalDocentes
            FROM tb_docentes d
            INNER JOIN tb_docente_establecimiento de ON d.id = de.docente_id
            WHERE de.establecimiento_id = ? AND de.activo = 1 AND d.activo = 1
        `, [establecimiento_id]);

        // Alumnos destacados (promedio >= 6.0) y en riesgo (promedio < 4.0)
        const [alumnosCategoria] = await pool.query(`
            SELECT
                SUM(CASE WHEN promedio >= 6.0 THEN 1 ELSE 0 END) as alumnosDestacados,
                SUM(CASE WHEN promedio < 4.0 THEN 1 ELSE 0 END) as alumnosRiesgo
            FROM (
                SELECT alumno_id, ROUND(AVG(nota), 1) as promedio
                FROM tb_notas
                WHERE establecimiento_id = ? AND anio_academico = ? AND activo = 1 AND nota IS NOT NULL
                GROUP BY alumno_id
            ) as promedios
        `, [establecimiento_id, anio]);

        // Porcentaje de asistencia general
        const [asistenciaStats] = await pool.query(`
            SELECT
                ROUND(SUM(CASE WHEN estado IN ('presente', 'atrasado') THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as asistencia
            FROM tb_asistencia
            WHERE establecimiento_id = ? AND anio_academico = ? AND activo = 1
        `, [establecimiento_id, anio]);

        // Tendencia mensual (promedios por mes)
        const [tendencia] = await pool.query(`
            SELECT
                MONTH(fecha_evaluacion) as mes,
                ROUND(AVG(nota), 2) as promedio
            FROM tb_notas
            WHERE establecimiento_id = ? AND anio_academico = ? AND activo = 1 AND nota IS NOT NULL AND fecha_evaluacion IS NOT NULL
            GROUP BY MONTH(fecha_evaluacion)
            ORDER BY mes
        `, [establecimiento_id, anio]);

        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const tendenciaMensual = Array(12).fill(null);
        tendencia.forEach(t => {
            if (t.mes >= 1 && t.mes <= 12) {
                tendenciaMensual[t.mes - 1] = parseFloat(t.promedio);
            }
        });

        res.json({
            success: true,
            data: {
                promedioGeneral: parseFloat(notasStats[0]?.promedioGeneral) || 0,
                tasaAprobacion: parseFloat(notasStats[0]?.tasaAprobacion) || 0,
                totalAlumnos: alumnosCount[0]?.totalAlumnos || 0,
                totalDocentes: docentesCount[0]?.totalDocentes || 0,
                alumnosDestacados: parseInt(alumnosCategoria[0]?.alumnosDestacados) || 0,
                alumnosRiesgo: parseInt(alumnosCategoria[0]?.alumnosRiesgo) || 0,
                asistencia: parseFloat(asistenciaStats[0]?.asistencia) || 0,
                tendenciaMensual: tendenciaMensual.filter(t => t !== null),
                meses: meses
            }
        });
    } catch (error) {
        console.error('Error al obtener estadísticas generales:', error);
        res.status(500).json({ success: false, error: 'Error al obtener estadísticas generales' });
    }
});

// GET /api/estadisticas/general/asignaturas - Promedio por asignatura
app.get('/api/estadisticas/general/asignaturas', async (req, res) => {
    const { establecimiento_id = 1, anio_academico } = req.query;
    const anio = anio_academico || new Date().getFullYear();

    try {
        const [rows] = await pool.query(`
            SELECT
                asig.nombre as asignatura,
                ROUND(AVG(n.nota), 1) as promedio
            FROM tb_notas n
            INNER JOIN tb_asignaturas asig ON n.asignatura_id = asig.id
            WHERE n.establecimiento_id = ? AND n.anio_academico = ? AND n.activo = 1 AND n.nota IS NOT NULL
            GROUP BY asig.id, asig.nombre
            ORDER BY promedio DESC
        `, [establecimiento_id, anio]);

        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error al obtener promedios por asignatura:', error);
        res.status(500).json({ success: false, error: 'Error al obtener promedios por asignatura' });
    }
});

// GET /api/estadisticas/general/ranking-cursos - Top cursos por promedio
app.get('/api/estadisticas/general/ranking-cursos', async (req, res) => {
    const { establecimiento_id = 1, anio_academico, limite = 5 } = req.query;
    const anio = anio_academico || new Date().getFullYear();

    try {
        const [rows] = await pool.query(`
            SELECT
                c.nombre as curso,
                c.id as curso_id,
                ROUND(AVG(n.nota), 2) as promedio
            FROM tb_notas n
            INNER JOIN tb_cursos c ON n.curso_id = c.id
            WHERE n.establecimiento_id = ? AND n.anio_academico = ? AND n.activo = 1 AND n.nota IS NOT NULL
            GROUP BY c.id, c.nombre
            ORDER BY promedio DESC
            LIMIT ?
        `, [establecimiento_id, anio, parseInt(limite)]);

        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error al obtener ranking de cursos:', error);
        res.status(500).json({ success: false, error: 'Error al obtener ranking de cursos' });
    }
});

// GET /api/estadisticas/general/distribucion - Distribución de alumnos
app.get('/api/estadisticas/general/distribucion', async (req, res) => {
    const { establecimiento_id = 1, anio_academico } = req.query;
    const anio = anio_academico || new Date().getFullYear();

    try {
        const [rows] = await pool.query(`
            SELECT
                SUM(CASE WHEN promedio >= 6.0 THEN 1 ELSE 0 END) as destacados,
                SUM(CASE WHEN promedio >= 4.0 AND promedio < 6.0 THEN 1 ELSE 0 END) as regulares,
                SUM(CASE WHEN promedio < 4.0 THEN 1 ELSE 0 END) as enRiesgo
            FROM (
                SELECT alumno_id, ROUND(AVG(nota), 1) as promedio
                FROM tb_notas
                WHERE establecimiento_id = ? AND anio_academico = ? AND activo = 1 AND nota IS NOT NULL
                GROUP BY alumno_id
            ) as promedios
        `, [establecimiento_id, anio]);

        res.json({
            success: true,
            data: {
                destacados: parseInt(rows[0]?.destacados) || 0,
                regulares: parseInt(rows[0]?.regulares) || 0,
                enRiesgo: parseInt(rows[0]?.enRiesgo) || 0
            }
        });
    } catch (error) {
        console.error('Error al obtener distribución:', error);
        res.status(500).json({ success: false, error: 'Error al obtener distribución' });
    }
});

// ============================================
// ESTADÍSTICAS POR CURSO
// ============================================

// GET /api/estadisticas/curso/:cursoId - KPIs de un curso específico
app.get('/api/estadisticas/curso/:cursoId', async (req, res) => {
    const { cursoId } = req.params;
    const { establecimiento_id = 1, anio_academico } = req.query;
    const anio = anio_academico || new Date().getFullYear();

    try {
        // Info del curso
        const [cursoInfo] = await pool.query(`
            SELECT id, nombre, codigo, nivel, grado, letra
            FROM tb_cursos WHERE id = ?
        `, [cursoId]);

        if (cursoInfo.length === 0) {
            return res.status(404).json({ success: false, error: 'Curso no encontrado' });
        }

        // Promedio y aprobación del curso
        const [notasStats] = await pool.query(`
            SELECT
                ROUND(AVG(nota), 1) as promedio,
                ROUND(SUM(CASE WHEN nota >= 4.0 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as aprobacion
            FROM tb_notas
            WHERE curso_id = ? AND anio_academico = ? AND activo = 1 AND nota IS NOT NULL
        `, [cursoId, anio]);

        // Total alumnos en el curso
        const [alumnosCount] = await pool.query(`
            SELECT COUNT(DISTINCT a.id) as alumnos
            FROM tb_alumnos a
            INNER JOIN tb_alumno_establecimiento ae ON a.id = ae.alumno_id
            WHERE ae.curso_id = ? AND ae.anio_academico = ? AND ae.activo = 1 AND a.activo = 1
        `, [cursoId, anio]);

        // Alumnos destacados y en riesgo del curso
        const [alumnosCategoria] = await pool.query(`
            SELECT
                SUM(CASE WHEN promedio >= 6.0 THEN 1 ELSE 0 END) as destacados,
                SUM(CASE WHEN promedio < 4.0 THEN 1 ELSE 0 END) as riesgo
            FROM (
                SELECT alumno_id, ROUND(AVG(nota), 1) as promedio
                FROM tb_notas
                WHERE curso_id = ? AND anio_academico = ? AND activo = 1 AND nota IS NOT NULL
                GROUP BY alumno_id
            ) as promedios
        `, [cursoId, anio]);

        // Asistencia del curso
        const [asistenciaStats] = await pool.query(`
            SELECT
                ROUND(SUM(CASE WHEN estado IN ('presente', 'atrasado') THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as asistencia
            FROM tb_asistencia
            WHERE curso_id = ? AND anio_academico = ? AND activo = 1
        `, [cursoId, anio]);

        // Tendencia mensual del curso
        const [tendencia] = await pool.query(`
            SELECT
                MONTH(fecha_evaluacion) as mes,
                ROUND(AVG(nota), 2) as promedio
            FROM tb_notas
            WHERE curso_id = ? AND anio_academico = ? AND activo = 1 AND nota IS NOT NULL AND fecha_evaluacion IS NOT NULL
            GROUP BY MONTH(fecha_evaluacion)
            ORDER BY mes
        `, [cursoId, anio]);

        const tendenciaMensual = Array(12).fill(null);
        tendencia.forEach(t => {
            if (t.mes >= 1 && t.mes <= 12) {
                tendenciaMensual[t.mes - 1] = parseFloat(t.promedio);
            }
        });

        res.json({
            success: true,
            data: {
                curso: cursoInfo[0],
                promedio: parseFloat(notasStats[0]?.promedio) || 0,
                aprobacion: parseFloat(notasStats[0]?.aprobacion) || 0,
                alumnos: alumnosCount[0]?.alumnos || 0,
                destacados: parseInt(alumnosCategoria[0]?.destacados) || 0,
                riesgo: parseInt(alumnosCategoria[0]?.riesgo) || 0,
                asistencia: parseFloat(asistenciaStats[0]?.asistencia) || 0,
                tendencia: tendenciaMensual.filter(t => t !== null)
            }
        });
    } catch (error) {
        console.error('Error al obtener estadísticas del curso:', error);
        res.status(500).json({ success: false, error: 'Error al obtener estadísticas del curso' });
    }
});

// GET /api/estadisticas/curso/:cursoId/asignaturas - Promedio por asignatura en el curso
app.get('/api/estadisticas/curso/:cursoId/asignaturas', async (req, res) => {
    const { cursoId } = req.params;
    const { anio_academico } = req.query;
    const anio = anio_academico || new Date().getFullYear();

    try {
        const [rows] = await pool.query(`
            SELECT
                asig.nombre as asignatura,
                asig.id as asignatura_id,
                ROUND(AVG(n.nota), 1) as promedio
            FROM tb_notas n
            INNER JOIN tb_asignaturas asig ON n.asignatura_id = asig.id
            WHERE n.curso_id = ? AND n.anio_academico = ? AND n.activo = 1 AND n.nota IS NOT NULL
            GROUP BY asig.id, asig.nombre
            ORDER BY promedio DESC
        `, [cursoId, anio]);

        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error al obtener asignaturas del curso:', error);
        res.status(500).json({ success: false, error: 'Error al obtener asignaturas del curso' });
    }
});

// GET /api/estadisticas/cursos - Lista de cursos con promedios para el selector
app.get('/api/estadisticas/cursos', async (req, res) => {
    const { establecimiento_id = 1, anio_academico } = req.query;
    const anio = anio_academico || new Date().getFullYear();

    try {
        const [rows] = await pool.query(`
            SELECT
                c.id,
                c.nombre,
                c.codigo,
                c.nivel,
                c.grado,
                ROUND(AVG(n.nota), 2) as promedio
            FROM tb_cursos c
            LEFT JOIN tb_notas n ON c.id = n.curso_id AND n.anio_academico = ? AND n.activo = 1 AND n.nota IS NOT NULL
            WHERE c.establecimiento_id = ? AND c.anio_academico = ? AND c.activo = 1
            GROUP BY c.id, c.nombre, c.codigo, c.nivel, c.grado
            ORDER BY c.nivel, c.grado, c.nombre
        `, [anio, establecimiento_id, anio]);

        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error al obtener cursos:', error);
        res.status(500).json({ success: false, error: 'Error al obtener cursos' });
    }
});

// ============================================
// ESTADÍSTICAS POR DOCENTE
// ============================================

// GET /api/estadisticas/docentes - Lista de docentes con sus asignaturas y cursos
app.get('/api/estadisticas/docentes', async (req, res) => {
    const { establecimiento_id = 1, anio_academico } = req.query;
    const anio = anio_academico || new Date().getFullYear();

    try {
        const [rows] = await pool.query(`
            SELECT
                d.id,
                CONCAT(d.apellidos, ', ', d.nombres) as nombre,
                d.especialidad,
                GROUP_CONCAT(DISTINCT asig.nombre ORDER BY asig.nombre SEPARATOR ', ') as asignaturas,
                GROUP_CONCAT(DISTINCT c.nombre ORDER BY c.nombre SEPARATOR ', ') as cursos,
                COUNT(DISTINCT a.asignatura_id) as totalAsignaturas,
                COUNT(DISTINCT a.curso_id) as totalCursos
            FROM tb_docentes d
            INNER JOIN tb_docente_establecimiento de ON d.id = de.docente_id
            LEFT JOIN tb_asignaciones a ON d.id = a.docente_id AND a.anio_academico = ? AND a.activo = 1
            LEFT JOIN tb_asignaturas asig ON a.asignatura_id = asig.id
            LEFT JOIN tb_cursos c ON a.curso_id = c.id
            WHERE de.establecimiento_id = ? AND de.activo = 1 AND d.activo = 1
            GROUP BY d.id, d.apellidos, d.nombres, d.especialidad
            ORDER BY d.apellidos, d.nombres
        `, [anio, establecimiento_id]);

        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error al obtener docentes:', error);
        res.status(500).json({ success: false, error: 'Error al obtener docentes' });
    }
});

// GET /api/estadisticas/docente/:docenteId - Info y asignaturas del docente
app.get('/api/estadisticas/docente/:docenteId', async (req, res) => {
    const { docenteId } = req.params;
    const { establecimiento_id = 1, anio_academico } = req.query;
    const anio = anio_academico || new Date().getFullYear();

    try {
        // Info del docente
        const [docenteInfo] = await pool.query(`
            SELECT
                d.id,
                d.nombres,
                d.apellidos,
                CONCAT(d.apellidos, ', ', d.nombres) as nombre,
                d.especialidad
            FROM tb_docentes d
            WHERE d.id = ? AND d.activo = 1
        `, [docenteId]);

        if (docenteInfo.length === 0) {
            return res.status(404).json({ success: false, error: 'Docente no encontrado' });
        }

        // Asignaturas que imparte
        const [asignaturas] = await pool.query(`
            SELECT DISTINCT
                asig.id,
                asig.nombre
            FROM tb_asignaciones a
            INNER JOIN tb_asignaturas asig ON a.asignatura_id = asig.id
            WHERE a.docente_id = ? AND a.anio_academico = ? AND a.activo = 1
            ORDER BY asig.nombre
        `, [docenteId, anio]);

        // Cursos donde enseña
        const [cursos] = await pool.query(`
            SELECT DISTINCT
                c.id,
                c.nombre
            FROM tb_asignaciones a
            INNER JOIN tb_cursos c ON a.curso_id = c.id
            WHERE a.docente_id = ? AND a.anio_academico = ? AND a.activo = 1
            ORDER BY c.nombre
        `, [docenteId, anio]);

        // Total alumnos que tiene
        const [alumnosCount] = await pool.query(`
            SELECT COUNT(DISTINCT n.alumno_id) as totalAlumnos
            FROM tb_notas n
            WHERE n.docente_id = ? AND n.anio_academico = ? AND n.activo = 1
        `, [docenteId, anio]);

        res.json({
            success: true,
            data: {
                docente: docenteInfo[0],
                asignaturas: asignaturas.map(a => a.nombre),
                asignaturasDetalle: asignaturas,
                cursos: cursos.map(c => c.nombre),
                cursosDetalle: cursos,
                totalAlumnos: alumnosCount[0]?.totalAlumnos || 0
            }
        });
    } catch (error) {
        console.error('Error al obtener info del docente:', error);
        res.status(500).json({ success: false, error: 'Error al obtener info del docente' });
    }
});

// GET /api/estadisticas/docente/:docenteId/asignatura/:asignaturaId - Stats de docente en una asignatura
app.get('/api/estadisticas/docente/:docenteId/asignatura/:asignaturaId', async (req, res) => {
    const { docenteId, asignaturaId } = req.params;
    const { anio_academico } = req.query;
    const anio = anio_academico || new Date().getFullYear();

    try {
        // Promedio y aprobación del docente en esa asignatura
        const [stats] = await pool.query(`
            SELECT
                ROUND(AVG(nota), 1) as promedio,
                ROUND(SUM(CASE WHEN nota >= 4.0 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as aprobacion,
                COUNT(DISTINCT alumno_id) as totalAlumnos
            FROM tb_notas
            WHERE docente_id = ? AND asignatura_id = ? AND anio_academico = ? AND activo = 1 AND nota IS NOT NULL
        `, [docenteId, asignaturaId, anio]);

        // Promedio por curso donde imparte esa asignatura
        const [promediosPorCurso] = await pool.query(`
            SELECT
                c.id as curso_id,
                c.nombre as curso,
                ROUND(AVG(n.nota), 2) as promedio
            FROM tb_notas n
            INNER JOIN tb_cursos c ON n.curso_id = c.id
            WHERE n.docente_id = ? AND n.asignatura_id = ? AND n.anio_academico = ? AND n.activo = 1 AND n.nota IS NOT NULL
            GROUP BY c.id, c.nombre
            ORDER BY promedio DESC
        `, [docenteId, asignaturaId, anio]);

        // Tendencia mensual
        const [tendencia] = await pool.query(`
            SELECT
                MONTH(fecha_evaluacion) as mes,
                ROUND(AVG(nota), 2) as promedio
            FROM tb_notas
            WHERE docente_id = ? AND asignatura_id = ? AND anio_academico = ? AND activo = 1 AND nota IS NOT NULL AND fecha_evaluacion IS NOT NULL
            GROUP BY MONTH(fecha_evaluacion)
            ORDER BY mes
        `, [docenteId, asignaturaId, anio]);

        const tendenciaMensual = Array(12).fill(null);
        tendencia.forEach(t => {
            if (t.mes >= 1 && t.mes <= 12) {
                tendenciaMensual[t.mes - 1] = parseFloat(t.promedio);
            }
        });

        res.json({
            success: true,
            data: {
                promedio: parseFloat(stats[0]?.promedio) || 0,
                aprobacion: parseFloat(stats[0]?.aprobacion) || 0,
                totalAlumnos: stats[0]?.totalAlumnos || 0,
                promediosPorCurso,
                tendencia: tendenciaMensual.filter(t => t !== null)
            }
        });
    } catch (error) {
        console.error('Error al obtener estadísticas del docente por asignatura:', error);
        res.status(500).json({ success: false, error: 'Error al obtener estadísticas del docente' });
    }
});

// ============================================
// ESTADÍSTICAS POR ASIGNATURA
// ============================================

// GET /api/estadisticas/asignaturas - Lista de asignaturas
app.get('/api/estadisticas/asignaturas', async (req, res) => {
    const { establecimiento_id = 1, anio_academico } = req.query;
    const anio = anio_academico || new Date().getFullYear();

    try {
        const [rows] = await pool.query(`
            SELECT
                asig.id,
                asig.nombre,
                asig.codigo,
                ROUND(AVG(n.nota), 2) as promedio,
                COUNT(DISTINCT n.docente_id) as docentes
            FROM tb_asignaturas asig
            LEFT JOIN tb_notas n ON asig.id = n.asignatura_id AND n.anio_academico = ? AND n.activo = 1 AND n.nota IS NOT NULL
            WHERE asig.establecimiento_id = ? AND asig.activo = 1
            GROUP BY asig.id, asig.nombre, asig.codigo
            ORDER BY asig.nombre
        `, [anio, establecimiento_id]);

        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error al obtener asignaturas:', error);
        res.status(500).json({ success: false, error: 'Error al obtener asignaturas' });
    }
});

// GET /api/estadisticas/asignatura/:asignaturaId - Stats de una asignatura
app.get('/api/estadisticas/asignatura/:asignaturaId', async (req, res) => {
    const { asignaturaId } = req.params;
    const { establecimiento_id = 1, anio_academico } = req.query;
    const anio = anio_academico || new Date().getFullYear();

    try {
        // Info de la asignatura
        const [asigInfo] = await pool.query(`
            SELECT id, nombre, codigo FROM tb_asignaturas WHERE id = ?
        `, [asignaturaId]);

        if (asigInfo.length === 0) {
            return res.status(404).json({ success: false, error: 'Asignatura no encontrada' });
        }

        // Promedio general y aprobación
        const [stats] = await pool.query(`
            SELECT
                ROUND(AVG(nota), 1) as promedio,
                ROUND(SUM(CASE WHEN nota >= 4.0 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as aprobacion
            FROM tb_notas
            WHERE asignatura_id = ? AND establecimiento_id = ? AND anio_academico = ? AND activo = 1 AND nota IS NOT NULL
        `, [asignaturaId, establecimiento_id, anio]);

        // Mejor y peor curso
        const [cursoStats] = await pool.query(`
            SELECT
                c.nombre as curso,
                ROUND(AVG(n.nota), 2) as promedio
            FROM tb_notas n
            INNER JOIN tb_cursos c ON n.curso_id = c.id
            WHERE n.asignatura_id = ? AND n.establecimiento_id = ? AND n.anio_academico = ? AND n.activo = 1 AND n.nota IS NOT NULL
            GROUP BY c.id, c.nombre
            ORDER BY promedio DESC
        `, [asignaturaId, establecimiento_id, anio]);

        const mejorCurso = cursoStats.length > 0 ? cursoStats[0].curso : '-';
        const peorCurso = cursoStats.length > 0 ? cursoStats[cursoStats.length - 1].curso : '-';

        // Cantidad de docentes que imparten
        const [docentesCount] = await pool.query(`
            SELECT COUNT(DISTINCT docente_id) as docentes
            FROM tb_asignaciones
            WHERE asignatura_id = ? AND establecimiento_id = ? AND anio_academico = ? AND activo = 1
        `, [asignaturaId, establecimiento_id, anio]);

        // Tendencia mensual
        const [tendencia] = await pool.query(`
            SELECT
                MONTH(fecha_evaluacion) as mes,
                ROUND(AVG(nota), 2) as promedio
            FROM tb_notas
            WHERE asignatura_id = ? AND establecimiento_id = ? AND anio_academico = ? AND activo = 1 AND nota IS NOT NULL AND fecha_evaluacion IS NOT NULL
            GROUP BY MONTH(fecha_evaluacion)
            ORDER BY mes
        `, [asignaturaId, establecimiento_id, anio]);

        const tendenciaMensual = Array(12).fill(null);
        tendencia.forEach(t => {
            if (t.mes >= 1 && t.mes <= 12) {
                tendenciaMensual[t.mes - 1] = parseFloat(t.promedio);
            }
        });

        res.json({
            success: true,
            data: {
                asignatura: asigInfo[0],
                promedio: parseFloat(stats[0]?.promedio) || 0,
                aprobacion: parseFloat(stats[0]?.aprobacion) || 0,
                mejorCurso,
                peorCurso,
                docentes: docentesCount[0]?.docentes || 0,
                tendencia: tendenciaMensual.filter(t => t !== null)
            }
        });
    } catch (error) {
        console.error('Error al obtener estadísticas de asignatura:', error);
        res.status(500).json({ success: false, error: 'Error al obtener estadísticas de asignatura' });
    }
});

// GET /api/estadisticas/asignatura/:asignaturaId/por-curso - Promedio de asignatura en cada curso
app.get('/api/estadisticas/asignatura/:asignaturaId/por-curso', async (req, res) => {
    const { asignaturaId } = req.params;
    const { establecimiento_id = 1, anio_academico } = req.query;
    const anio = anio_academico || new Date().getFullYear();

    try {
        const [rows] = await pool.query(`
            SELECT
                c.id as curso_id,
                c.nombre as curso,
                ROUND(AVG(n.nota), 2) as promedio
            FROM tb_notas n
            INNER JOIN tb_cursos c ON n.curso_id = c.id
            WHERE n.asignatura_id = ? AND n.establecimiento_id = ? AND n.anio_academico = ? AND n.activo = 1 AND n.nota IS NOT NULL
            GROUP BY c.id, c.nombre
            ORDER BY promedio DESC
        `, [asignaturaId, establecimiento_id, anio]);

        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error al obtener asignatura por curso:', error);
        res.status(500).json({ success: false, error: 'Error al obtener asignatura por curso' });
    }
});

// ============================================
// ESTADÍSTICAS DE ASISTENCIA
// ============================================

// GET /api/estadisticas/asistencia/general - Asistencia general del establecimiento
app.get('/api/estadisticas/asistencia/general', async (req, res) => {
    const { establecimiento_id = 1, anio_academico } = req.query;
    const anio = anio_academico || new Date().getFullYear();

    try {
        // Stats generales de asistencia
        const [stats] = await pool.query(`
            SELECT
                ROUND(SUM(CASE WHEN estado IN ('presente', 'atrasado') THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as promedioAsistencia,
                COUNT(DISTINCT alumno_id) as totalAlumnos
            FROM tb_asistencia
            WHERE establecimiento_id = ? AND anio_academico = ? AND activo = 1
        `, [establecimiento_id, anio]);

        // Alumnos con 100% asistencia
        const [asistencia100] = await pool.query(`
            SELECT COUNT(*) as cantidad
            FROM (
                SELECT alumno_id
                FROM tb_asistencia
                WHERE establecimiento_id = ? AND anio_academico = ? AND activo = 1
                GROUP BY alumno_id
                HAVING SUM(CASE WHEN estado NOT IN ('presente', 'atrasado') THEN 1 ELSE 0 END) = 0
            ) as perfectos
        `, [establecimiento_id, anio]);

        // Alumnos bajo 85% asistencia
        const [bajoUmbral] = await pool.query(`
            SELECT COUNT(*) as cantidad
            FROM (
                SELECT alumno_id,
                    ROUND(SUM(CASE WHEN estado IN ('presente', 'atrasado') THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as porcentaje
                FROM tb_asistencia
                WHERE establecimiento_id = ? AND anio_academico = ? AND activo = 1
                GROUP BY alumno_id
                HAVING porcentaje < 85
            ) as bajo_umbral
        `, [establecimiento_id, anio]);

        // Asistencia mensual
        const [mensual] = await pool.query(`
            SELECT
                MONTH(fecha) as mes,
                ROUND(SUM(CASE WHEN estado IN ('presente', 'atrasado') THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as porcentaje
            FROM tb_asistencia
            WHERE establecimiento_id = ? AND anio_academico = ? AND activo = 1
            GROUP BY MONTH(fecha)
            ORDER BY mes
        `, [establecimiento_id, anio]);

        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const asistenciaMensual = {};
        mensual.forEach(m => {
            if (m.mes >= 1 && m.mes <= 12) {
                asistenciaMensual[meses[m.mes - 1]] = parseFloat(m.porcentaje);
            }
        });

        res.json({
            success: true,
            data: {
                promedioAsistencia: parseFloat(stats[0]?.promedioAsistencia) || 0,
                totalAlumnos: stats[0]?.totalAlumnos || 0,
                asistencia100: asistencia100[0]?.cantidad || 0,
                bajoUmbral85: bajoUmbral[0]?.cantidad || 0,
                asistenciaMensual
            }
        });
    } catch (error) {
        console.error('Error al obtener estadísticas de asistencia general:', error);
        res.status(500).json({ success: false, error: 'Error al obtener estadísticas de asistencia' });
    }
});

// GET /api/estadisticas/asistencia/curso/:cursoId - Asistencia de un curso específico
app.get('/api/estadisticas/asistencia/curso/:cursoId', async (req, res) => {
    const { cursoId } = req.params;
    const { anio_academico } = req.query;
    const anio = anio_academico || new Date().getFullYear();

    try {
        // Stats de asistencia del curso
        const [stats] = await pool.query(`
            SELECT
                ROUND(SUM(CASE WHEN estado IN ('presente', 'atrasado') THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as promedioAsistencia,
                COUNT(DISTINCT alumno_id) as totalAlumnos
            FROM tb_asistencia
            WHERE curso_id = ? AND anio_academico = ? AND activo = 1
        `, [cursoId, anio]);

        // Alumnos con 100% asistencia en el curso
        const [asistencia100] = await pool.query(`
            SELECT COUNT(*) as cantidad
            FROM (
                SELECT alumno_id
                FROM tb_asistencia
                WHERE curso_id = ? AND anio_academico = ? AND activo = 1
                GROUP BY alumno_id
                HAVING SUM(CASE WHEN estado NOT IN ('presente', 'atrasado') THEN 1 ELSE 0 END) = 0
            ) as perfectos
        `, [cursoId, anio]);

        // Alumnos bajo 85% en el curso
        const [bajoUmbral] = await pool.query(`
            SELECT COUNT(*) as cantidad
            FROM (
                SELECT alumno_id,
                    ROUND(SUM(CASE WHEN estado IN ('presente', 'atrasado') THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as porcentaje
                FROM tb_asistencia
                WHERE curso_id = ? AND anio_academico = ? AND activo = 1
                GROUP BY alumno_id
                HAVING porcentaje < 85
            ) as bajo_umbral
        `, [cursoId, anio]);

        // Asistencia mensual del curso
        const [mensual] = await pool.query(`
            SELECT
                MONTH(fecha) as mes,
                ROUND(SUM(CASE WHEN estado IN ('presente', 'atrasado') THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as porcentaje
            FROM tb_asistencia
            WHERE curso_id = ? AND anio_academico = ? AND activo = 1
            GROUP BY MONTH(fecha)
            ORDER BY mes
        `, [cursoId, anio]);

        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const asistenciaMensual = {};
        mensual.forEach(m => {
            if (m.mes >= 1 && m.mes <= 12) {
                asistenciaMensual[meses[m.mes - 1]] = parseFloat(m.porcentaje);
            }
        });

        res.json({
            success: true,
            data: {
                promedioAsistencia: parseFloat(stats[0]?.promedioAsistencia) || 0,
                totalAlumnos: stats[0]?.totalAlumnos || 0,
                asistencia100: asistencia100[0]?.cantidad || 0,
                bajoUmbral85: bajoUmbral[0]?.cantidad || 0,
                asistenciaMensual
            }
        });
    } catch (error) {
        console.error('Error al obtener asistencia del curso:', error);
        res.status(500).json({ success: false, error: 'Error al obtener asistencia del curso' });
    }
});

// GET /api/estadisticas/asistencia/por-curso - Asistencia comparativa de todos los cursos
app.get('/api/estadisticas/asistencia/por-curso', async (req, res) => {
    const { establecimiento_id = 1, anio_academico } = req.query;
    const anio = anio_academico || new Date().getFullYear();

    try {
        const [rows] = await pool.query(`
            SELECT
                c.id as curso_id,
                c.nombre as curso,
                ROUND(SUM(CASE WHEN a.estado IN ('presente', 'atrasado') THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as promedioAsistencia,
                COUNT(DISTINCT a.alumno_id) as totalAlumnos
            FROM tb_asistencia a
            INNER JOIN tb_cursos c ON a.curso_id = c.id
            WHERE a.establecimiento_id = ? AND a.anio_academico = ? AND a.activo = 1
            GROUP BY c.id, c.nombre
            ORDER BY promedioAsistencia DESC
        `, [establecimiento_id, anio]);

        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error al obtener asistencia por curso:', error);
        res.status(500).json({ success: false, error: 'Error al obtener asistencia por curso' });
    }
});

// GET /api/estadisticas/asistencia/ranking - Ranking de asistencia por curso
app.get('/api/estadisticas/asistencia/ranking', async (req, res) => {
    const { establecimiento_id = 1, anio_academico } = req.query;
    const anio = anio_academico || new Date().getFullYear();

    try {
        const [rows] = await pool.query(`
            SELECT
                c.id as curso_id,
                c.nombre as curso,
                ROUND(SUM(CASE WHEN a.estado IN ('presente', 'atrasado') THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as promedioAsistencia
            FROM tb_asistencia a
            INNER JOIN tb_cursos c ON a.curso_id = c.id
            WHERE a.establecimiento_id = ? AND a.anio_academico = ? AND a.activo = 1
            GROUP BY c.id, c.nombre
            ORDER BY promedioAsistencia DESC
        `, [establecimiento_id, anio]);

        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error al obtener ranking de asistencia:', error);
        res.status(500).json({ success: false, error: 'Error al obtener ranking de asistencia' });
    }
});

// ============================================
// RUTA DE PRUEBA
// ============================================

app.get('/api/health', async (req, res) => {
    const dbConnected = await testConnection();
    res.json({
        status: 'ok',
        database: dbConnected ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// Iniciar servidor
app.listen(PORT, async () => {
    console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📋 Endpoints disponibles:`);
    console.log(`   -- Autenticación --`);
    console.log(`   POST /api/auth/login    - Iniciar sesión`);
    console.log(`   POST /api/auth/logout   - Cerrar sesión`);
    console.log(`   GET  /api/auth/me       - Verificar sesión`);
    console.log(`   -- Registro --`);
    console.log(`   POST /api/registro/validar-codigo    - Validar código admin`);
    console.log(`   POST /api/registro/validar-docente   - Validar pre-registro docente`);
    console.log(`   POST /api/registro/validar-apoderado - Validar pre-registro apoderado`);
    console.log(`   POST /api/registro/admin      - Registrar administrador`);
    console.log(`   POST /api/registro/docente    - Registrar docente`);
    console.log(`   POST /api/registro/apoderado  - Registrar apoderado`);
    console.log(`   -- General --`);
    console.log(`   GET  /api/health        - Estado del servidor`);
    console.log(`   GET  /api/establecimientos - Listar establecimientos`);
    console.log(`   GET  /api/cursos        - Listar cursos`);
    console.log(`   -- Alumnos --`);
    console.log(`   GET  /api/alumnos       - Listar alumnos`);
    console.log(`   GET  /api/alumnos/por-curso - Alumnos agrupados por curso`);
    console.log(`   POST /api/alumnos       - Crear alumno`);
    console.log(`   PUT  /api/alumnos/:id   - Actualizar alumno`);
    console.log(`   DELETE /api/alumnos/:id - Eliminar alumno\n`);

    await testConnection();
});
