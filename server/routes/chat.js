const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// ============================================
// RUTAS DE CHAT - Docentes y Administradores
// ============================================

// ============================================
// Solamente docentes y administradores pueden iniciar chats
// Admin siempre aparece primero para los docentes
// ============================================
router.get('/contactos', async (req, res) => {
    const { usuario_id, establecimiento_id } = req.query;

    if (!usuario_id || !establecimiento_id) {
        return res.status(400).json({
            success: false,
            message: 'usuario_id y establecimiento_id son requeridos'
        });
    }

    try {
        // Obtener tipo de usuario actual
        const [usuarioActual] = await pool.query(
            'SELECT tipo_usuario FROM tb_usuarios WHERE id = ? AND activo = 1',
            [usuario_id]
        );

        if (usuarioActual.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const tipoUsuario = usuarioActual[0].tipo_usuario;

        // --- LOGICA COMUN: OBTENER ADMINISTRADORES ---
        const [admins] = await pool.query(`
            SELECT
                u.id AS usuario_id,
                a.id AS entidad_id,
                a.nombres,
                a.apellidos,
                CONCAT(a.nombres, ' ', a.apellidos) AS nombre_completo,
                a.foto_url,
                'administrador' AS tipo,
                1 AS es_admin,
                (
                    SELECT COUNT(*)
                    FROM tb_chat_mensajes m
                    INNER JOIN tb_chat_conversaciones c ON m.conversacion_id = c.id
                    WHERE c.establecimiento_id = ?
                    AND ((c.usuario1_id = ? AND c.usuario2_id = u.id) OR (c.usuario2_id = ? AND c.usuario1_id = u.id))
                    AND m.remitente_id = u.id
                    AND m.leido = 0
                    AND m.eliminado_destinatario = 0
                ) AS mensajes_no_leidos
            FROM tb_usuarios u
            INNER JOIN tb_administradores a ON u.id = a.usuario_id
            INNER JOIN tb_administrador_establecimiento ae ON a.id = ae.administrador_id
            WHERE ae.establecimiento_id = ?
            AND ae.activo = 1
            AND u.activo = 1
            AND a.activo = 1
            AND u.id != ?
        `, [establecimiento_id, usuario_id, usuario_id, establecimiento_id, usuario_id]);


        let contactos = [...admins];

        // --- LOGICA DIFERENCIADA POR ROL ---

        if (tipoUsuario === 'docente' || tipoUsuario === 'administrador') {
            // STAFF: Ven a todos los docentes del establecimiento
            const [docentes] = await pool.query(`
                SELECT
                    u.id AS usuario_id,
                    d.id AS entidad_id,
                    d.nombres,
                    d.apellidos,
                    CONCAT(d.nombres, ' ', d.apellidos) AS nombre_completo,
                    d.foto_url,
                    d.especialidad,
                    'docente' AS tipo,
                    0 AS es_admin,
                    (
                        SELECT COUNT(*)
                        FROM tb_chat_mensajes m
                        INNER JOIN tb_chat_conversaciones c ON m.conversacion_id = c.id
                        WHERE c.establecimiento_id = ?
                        AND ((c.usuario1_id = ? AND c.usuario2_id = u.id) OR (c.usuario2_id = ? AND c.usuario1_id = u.id))
                        AND m.remitente_id = u.id
                        AND m.leido = 0
                        AND m.eliminado_destinatario = 0
                    ) AS mensajes_no_leidos
                FROM tb_usuarios u
                INNER JOIN tb_docentes d ON u.id = d.usuario_id
                INNER JOIN tb_docente_establecimiento de ON d.id = de.docente_id
                WHERE de.establecimiento_id = ?
                AND de.activo = 1
                AND u.activo = 1
                AND d.activo = 1
                AND u.id != ?
            `, [establecimiento_id, usuario_id, usuario_id, establecimiento_id, usuario_id]);

            contactos = [...contactos, ...docentes];

        } else if (tipoUsuario === 'apoderado') {
            // APODERADO: Ve SOLO a los docentes de sus pupilos (o pupilo seleccionado)
            const { alumno_id } = req.query;

            // Caso: Traer Docentes y Administradores UNIFICADOS
            let queryUnificada = `
                (
                    SELECT 
                        u.id AS usuario_id,
                        d.id AS entidad_id,
                        CONCAT(d.nombres, ' ', d.apellidos) AS nombre_completo,
                        d.foto_url,
                        'docente' AS tipo,
                        0 AS es_admin,
                        GROUP_CONCAT(DISTINCT tas.nombre SEPARATOR ', ') as asignaturas,
                        (SELECT COUNT(*) FROM tb_chat_mensajes m 
                         JOIN tb_chat_conversaciones c ON m.conversacion_id = c.id 
                         WHERE c.establecimiento_id = ? AND ((c.usuario1_id = ? AND c.usuario2_id = u.id) OR (c.usuario2_id = ? AND c.usuario1_id = u.id)) 
                         AND m.remitente_id = u.id AND m.leido = 0 AND m.eliminado_destinatario = 0) AS mensajes_no_leidos
                    FROM tb_alumno_establecimiento ae
                    JOIN tb_apoderado_alumno aa ON ae.alumno_id = aa.alumno_id
                    JOIN tb_apoderados ap ON aa.apoderado_id = ap.id
                    JOIN tb_asignaciones asig ON ae.curso_id = asig.curso_id AND asig.activo = 1
                    JOIN tb_asignaturas tas ON asig.asignatura_id = tas.id
                    JOIN tb_docentes d ON asig.docente_id = d.id AND d.activo = 1
                    JOIN tb_usuarios u ON d.usuario_id = u.id AND u.activo = 1
                    WHERE ap.usuario_id = ? AND ae.establecimiento_id = ? AND ae.activo = 1
                    ${alumno_id ? 'AND ae.alumno_id = ?' : ''}
                    GROUP BY u.id, d.id, d.nombres, d.apellidos, d.foto_url
                )
                UNION
                (
                    SELECT 
                        u.id AS usuario_id,
                        a.id AS entidad_id,
                        CONCAT(a.nombres, ' ', a.apellidos) AS nombre_completo,
                        a.foto_url,
                        'administrador' AS tipo,
                        1 AS es_admin,
                        'Administración' as asignaturas,
                        (SELECT COUNT(*) FROM tb_chat_mensajes m 
                         JOIN tb_chat_conversaciones c ON m.conversacion_id = c.id 
                         WHERE c.establecimiento_id = ? AND ((c.usuario1_id = ? AND c.usuario2_id = u.id) OR (c.usuario2_id = ? AND c.usuario1_id = u.id)) 
                         AND m.remitente_id = u.id AND m.leido = 0 AND m.eliminado_destinatario = 0) AS mensajes_no_leidos
                    FROM tb_administradores a
                    JOIN tb_administrador_establecimiento ae ON a.id = ae.administrador_id AND ae.activo = 1
                    JOIN tb_usuarios u ON a.usuario_id = u.id AND u.activo = 1
                    WHERE ae.establecimiento_id = ?
                )
                ORDER BY es_admin DESC, nombre_completo ASC
            `;

            const parametros = [
                // Parte 1: Docentes
                establecimiento_id, usuario_id, usuario_id,
                usuario_id, establecimiento_id
            ];

            if (alumno_id) {
                parametros.push(alumno_id);
            }

            // Parte 2: Admins
            parametros.push(establecimiento_id, usuario_id, usuario_id, establecimiento_id);

            const [resultados] = await pool.query(queryUnificada, parametros);
            contactos = resultados;
        } else {
            return res.status(403).json({
                success: false,
                message: 'Tipo de usuario no autorizado para chat'
            });
        }

        res.json({
            success: true,
            data: contactos
        });

    } catch (error) {
        console.error('Error al obtener contactos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener contactos'
        });
    }
});

// ============================================
// GET /api/chat/conversaciones - Obtener conversaciones del usuario
// ============================================
router.get('/conversaciones', async (req, res) => {
    const { usuario_id, establecimiento_id } = req.query;

    if (!usuario_id || !establecimiento_id) {
        return res.status(400).json({
            success: false,
            message: 'usuario_id y establecimiento_id son requeridos'
        });
    }

    try {
        const [conversaciones] = await pool.query(`
            SELECT
                c.id,
                c.asunto,
                c.contexto_tipo,
                c.mensajes_count,
                c.ultimo_mensaje_fecha,
                c.fecha_creacion,
                c.respuesta_habilitada,
                CASE
                    WHEN c.usuario1_id = ? THEN c.usuario2_id
                    ELSE c.usuario1_id
                END AS otro_usuario_id,
                CASE
                    WHEN c.usuario1_id = ? THEN c.usuario1_archivado
                    ELSE c.usuario2_archivado
                END AS archivado,
                (
                    SELECT m.mensaje
                    FROM tb_chat_mensajes m
                    WHERE m.conversacion_id = c.id
                    AND m.eliminado_remitente = 0
                    AND m.eliminado_destinatario = 0
                    ORDER BY m.fecha_envio DESC
                    LIMIT 1
                ) AS ultimo_mensaje,
                (
                    SELECT COUNT(*)
                    FROM tb_chat_mensajes m
                    WHERE m.conversacion_id = c.id
                    AND m.remitente_id != ?
                    AND m.leido = 0
                    AND m.eliminado_destinatario = 0
                ) AS mensajes_no_leidos
            FROM tb_chat_conversaciones c
            WHERE c.establecimiento_id = ?
            AND (c.usuario1_id = ? OR c.usuario2_id = ?)
            AND c.activo = 1
            AND CASE
                WHEN c.usuario1_id = ? THEN c.usuario1_eliminado = 0
                ELSE c.usuario2_eliminado = 0
            END
            ORDER BY c.ultimo_mensaje_fecha DESC
        `, [usuario_id, usuario_id, usuario_id, establecimiento_id, usuario_id, usuario_id, usuario_id]);

        // Obtener información del otro usuario para cada conversación
        for (let conv of conversaciones) {
            const [otroUsuario] = await pool.query(`
                SELECT
                    u.id AS usuario_id,
                    u.tipo_usuario,
                    CASE
                        WHEN u.tipo_usuario = 'administrador' THEN (SELECT CONCAT(nombres, ' ', apellidos) FROM tb_administradores WHERE usuario_id = u.id)
                        WHEN u.tipo_usuario = 'docente' THEN (SELECT CONCAT(nombres, ' ', apellidos) FROM tb_docentes WHERE usuario_id = u.id)
                    END AS nombre_completo,
                    CASE
                        WHEN u.tipo_usuario = 'administrador' THEN (SELECT foto_url FROM tb_administradores WHERE usuario_id = u.id)
                        WHEN u.tipo_usuario = 'docente' THEN (SELECT foto_url FROM tb_docentes WHERE usuario_id = u.id)
                    END AS foto_url
                FROM tb_usuarios u
                WHERE u.id = ?
            `, [conv.otro_usuario_id]);

            if (otroUsuario.length > 0) {
                conv.otro_usuario = otroUsuario[0];
            }
        }

        res.json({
            success: true,
            data: conversaciones
        });

    } catch (error) {
        console.error('Error al obtener conversaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener conversaciones'
        });
    }
});

// ============================================
// GET /api/chat/docente/:id/cursos - Obtener cursos del docente
// ============================================
// ============================================
// GET /api/chat/docente/:id/cursos - Obtener cursos del docente (o todos si es admin)
// ============================================
router.get('/docente/:id/cursos', async (req, res) => {
    const { id } = req.params; // usuario_id
    const { establecimiento_id } = req.query;

    if (!establecimiento_id) {
        console.log('Chat/Cursos: Faltan parametros', req.query);
        return res.status(400).json({ success: false, message: 'establecimiento_id requerido' });
    }

    try {
        console.log(`Chat/Cursos: Solicitando cursos para usuario ${id}, estab ${establecimiento_id}`);
        // Verificar tipo de usuario
        const [users] = await pool.query('SELECT tipo_usuario FROM tb_usuarios WHERE id = ?', [id]);

        if (users.length === 0) {
            console.log('Chat/Cursos: Usuario no encontrado');
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        const tipoUsuario = users[0].tipo_usuario;
        console.log(`Chat/Cursos: Tipo de usuario detectado: ${tipoUsuario}`);
        let cursos = [];

        if (tipoUsuario === 'administrador') {
            // Administradores ven TODOS los cursos activos del establecimiento
            const [todosCursos] = await pool.query(`
                SELECT id, nombre, grado, letra, nivel
                FROM tb_cursos
                WHERE establecimiento_id = ? AND activo = 1
                ORDER BY nivel, grado, letra
            `, [establecimiento_id]);
            cursos = todosCursos;
            console.log(`Chat/Cursos: Admin encontrÃ³ ${cursos.length} cursos`);

        } else {
            // Docentes ven solo sus cursos asignados
            const [cursosAsignados] = await pool.query(`
                SELECT DISTINCT c.id, c.nombre, c.grado, c.letra, c.nivel
                FROM tb_cursos c
                INNER JOIN tb_asignaciones a ON c.id = a.curso_id
                WHERE a.docente_id = (SELECT id FROM tb_docentes WHERE usuario_id = ?)
                AND c.establecimiento_id = ?
                AND c.activo = 1
                AND a.activo = 1
                ORDER BY c.nivel, c.grado, c.letra
            `, [id, establecimiento_id]);
            cursos = cursosAsignados;
            console.log(`Chat/Cursos: Docente encontrÃ³ ${cursos.length} cursos`);
        }

        res.json({ success: true, data: cursos });
    } catch (error) {
        console.error('Error al obtener cursos:', error);
        res.status(500).json({ success: false, message: 'Error interno' });
    }
});

// ============================================
// GET /api/chat/curso/:id/alumnos-chat - Obtener alumnos y apoderados para chat
// ============================================
router.get('/curso/:id/alumnos-chat', async (req, res) => {
    const { id } = req.params;
    const { usuario_id } = req.query; // ID del docente solicitante

    try {
        const [alumnos] = await pool.query(`
            SELECT 
                a.id AS alumno_id,
                CONCAT(a.nombres, ' ', a.apellidos) AS nombre_alumno,
                ap.id AS apoderado_id,
                ap.usuario_id AS apoderado_usuario_id,
                CONCAT(ap.nombres, ' ', ap.apellidos) AS nombre_apoderado,
                ap.foto_url AS foto_apoderado,
                (CASE WHEN u.id IS NOT NULL AND u.activo = 1 THEN 1 ELSE 0 END) as apoderado_activo,
                (
                    SELECT c.respuesta_habilitada
                    FROM tb_chat_conversaciones c
                    WHERE c.activo = 1
                    AND ((c.usuario1_id = ? AND c.usuario2_id = ap.usuario_id) OR (c.usuario2_id = ? AND c.usuario1_id = ap.usuario_id))
                    ORDER BY c.ultimo_mensaje_fecha DESC
                    LIMIT 1
                ) as chat_habilitado,
                (
                    SELECT COUNT(*)
                    FROM tb_chat_mensajes m
                    INNER JOIN tb_chat_conversaciones c ON m.conversacion_id = c.id
                    WHERE c.activo = 1
                    AND ((c.usuario1_id = ? AND c.usuario2_id = ap.usuario_id) OR (c.usuario2_id = ? AND c.usuario1_id = ap.usuario_id))
                    AND m.remitente_id = ap.usuario_id
                    AND m.leido = 0
                ) AS mensajes_no_leidos
            FROM tb_alumno_establecimiento ae
            INNER JOIN tb_alumnos a ON ae.alumno_id = a.id
            LEFT JOIN tb_apoderado_alumno aa ON a.id = aa.alumno_id
            LEFT JOIN tb_apoderados ap ON aa.apoderado_id = ap.id
            LEFT JOIN tb_usuarios u ON ap.usuario_id = u.id
            WHERE ae.curso_id = ?
            AND ae.activo = 1
            AND a.activo = 1
            ORDER BY a.apellidos, a.nombres
        `, [usuario_id, usuario_id, usuario_id, usuario_id, id]);

        res.json({ success: true, data: alumnos });
    } catch (error) {
        console.error('Error al obtener alumnos:', error);
        res.status(500).json({ success: false, message: 'Error interno' });
    }
});



// ============================================
// GET /api/chat/conversacion/:id/mensajes - Obtener mensajes de una conversación
// ============================================
router.get('/conversacion/:id/mensajes', async (req, res) => {
    const { id } = req.params;
    const { usuario_id, limite = 50, offset = 0, since_id } = req.query;

    if (!usuario_id) {
        return res.status(400).json({
            success: false,
            message: 'usuario_id es requerido'
        });
    }

    try {
        // Verificar que el usuario pertenece a la conversación
        const [conv] = await pool.query(
            'SELECT * FROM tb_chat_conversaciones WHERE id = ? AND (usuario1_id = ? OR usuario2_id = ?) AND activo = 1',
            [id, usuario_id, usuario_id]
        );

        if (conv.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Conversación no encontrada'
            });
        }

        let mensajes;

        if (since_id) {
            // Sincronización: Traer solo los nuevos después del último ID conocido
            [mensajes] = await pool.query(`
                SELECT
                    m.id,
                    m.remitente_id,
                    m.mensaje,
                    m.tipo_mensaje,
                    m.archivo_url,
                    m.archivo_nombre,
                    m.archivo_tamano,
                    m.leido,
                    m.fecha_lectura,
                    m.editado,
                    m.fecha_edicion,
                    m.fecha_envio,
                    CASE WHEN m.remitente_id = ? THEN 'enviado' ELSE 'recibido' END AS direccion
                FROM tb_chat_mensajes m
                WHERE m.conversacion_id = ?
                AND m.id > ?
                AND CASE
                    WHEN m.remitente_id = ? THEN m.eliminado_remitente = 0
                    ELSE m.eliminado_destinatario = 0
                END
                ORDER BY m.id ASC
            `, [usuario_id, id, since_id, usuario_id]);

        } else {
            // Carga inicial: Traer los ÚLTIMOS mensajes (Order DESC limit -> Order ASC)
            // Esto asegura que veamos lo más reciente, no lo más antiguo
            [mensajes] = await pool.query(`
                SELECT * FROM (
                    SELECT
                        m.id,
                        m.remitente_id,
                        m.mensaje,
                        m.tipo_mensaje,
                        m.archivo_url,
                        m.archivo_nombre,
                        m.archivo_tamano,
                        m.leido,
                        m.fecha_lectura,
                        m.editado,
                        m.fecha_edicion,
                        m.fecha_envio,
                        CASE WHEN m.remitente_id = ? THEN 'enviado' ELSE 'recibido' END AS direccion
                    FROM tb_chat_mensajes m
                    WHERE m.conversacion_id = ?
                    AND CASE
                        WHEN m.remitente_id = ? THEN m.eliminado_remitente = 0
                        ELSE m.eliminado_destinatario = 0
                    END
                    ORDER BY m.fecha_envio DESC
                    LIMIT ? OFFSET ?
                ) AS sub
                ORDER BY sub.fecha_envio ASC
            `, [usuario_id, id, usuario_id, parseInt(limite), parseInt(offset)]);
        }

        res.json({
            success: true,
            data: mensajes
        });

    } catch (error) {
        console.error('Error al obtener mensajes:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener mensajes'
        });
    }
});

// ============================================
// POST /api/chat/conversacion - Crear o obtener conversación existente
// ============================================
router.post('/conversacion', async (req, res) => {
    const { usuario_id, otro_usuario_id, establecimiento_id, asunto, contexto_tipo, contexto_id } = req.body;

    if (!usuario_id || !otro_usuario_id || !establecimiento_id) {
        return res.status(400).json({
            success: false,
            message: 'usuario_id, otro_usuario_id y establecimiento_id son requeridos'
        });
    }

    try {
        // Verificar que ambos usuarios son docentes o administradores (permitir inactivos para dejar mensajes en espera)
        const [usuarios] = await pool.query(
            'SELECT id, tipo_usuario FROM tb_usuarios WHERE id IN (?, ?)',
            [usuario_id, otro_usuario_id]
        );

        if (usuarios.length !== 2) {
            return res.status(404).json({
                success: false,
                message: 'Uno o ambos usuarios no encontrados'
            });
        }

        const tiposValidos = ['docente', 'administrador', 'apoderado'];
        let esChatConApoderado = false;

        for (const u of usuarios) {
            if (!tiposValidos.includes(u.tipo_usuario)) {
                return res.status(403).json({
                    success: false,
                    message: 'Tipo de usuario no permitido en el chat'
                });
            }
            if (u.tipo_usuario === 'apoderado') {
                esChatConApoderado = true;
            }
        }

        // Si hay un apoderado, respuesta_habilitada inicia en 0 (false), si no 1 (true)
        const respuestaHabilitadaInicial = esChatConApoderado ? 0 : 1;

        // Buscar conversación existente (ordenando los IDs para evitar duplicados)
        const [u1, u2] = [usuario_id, otro_usuario_id].sort((a, b) => a - b);

        const [convExistente] = await pool.query(`
            SELECT id FROM tb_chat_conversaciones
            WHERE establecimiento_id = ?
            AND ((usuario1_id = ? AND usuario2_id = ?) OR (usuario1_id = ? AND usuario2_id = ?))
            AND activo = 1
        `, [establecimiento_id, u1, u2, u2, u1]);

        if (convExistente.length > 0) {
            // Reactivar si estaba eliminado para este usuario
            await pool.query(`
                UPDATE tb_chat_conversaciones
                SET
                    usuario1_eliminado = CASE WHEN usuario1_id = ? THEN 0 ELSE usuario1_eliminado END,
                    usuario2_eliminado = CASE WHEN usuario2_id = ? THEN 0 ELSE usuario2_eliminado END
                WHERE id = ?
            `, [usuario_id, usuario_id, convExistente[0].id]);

            return res.json({
                success: true,
                data: { id: convExistente[0].id },
                message: 'Conversación existente recuperada'
            });
        }

        // Crear nueva conversación
        const [resultado] = await pool.query(`
            INSERT INTO tb_chat_conversaciones
            (establecimiento_id, usuario1_id, usuario2_id, asunto, contexto_tipo, contexto_id, iniciada_por, respuesta_habilitada)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [establecimiento_id, u1, u2, asunto || null, contexto_tipo || 'general', contexto_id || null, usuario_id, respuestaHabilitadaInicial]);

        res.json({
            success: true,
            data: { id: resultado.insertId },
            message: 'Conversación creada'
        });

    } catch (error) {
        console.error('Error al crear conversación:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear conversación'
        });
    }
});

// ============================================
// POST /api/chat/mensaje - Enviar mensaje
// ============================================
router.post('/mensaje', async (req, res) => {
    const { conversacion_id, remitente_id, mensaje, tipo_mensaje, archivo_url, archivo_nombre, archivo_tamano } = req.body;

    if (!conversacion_id || !remitente_id || !mensaje) {
        return res.status(400).json({
            success: false,
            message: 'conversacion_id, remitente_id y mensaje son requeridos'
        });
    }

    try {
        // Verificar que el remitente pertenece a la conversación
        const [conv] = await pool.query(
            'SELECT * FROM tb_chat_conversaciones WHERE id = ? AND (usuario1_id = ? OR usuario2_id = ?) AND activo = 1',
            [conversacion_id, remitente_id, remitente_id]
        );

        if (conv.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Conversación no encontrada o no tienes acceso'
            });
        }

        const conversacion = conv[0];

        // Verificar permisos de respuesta si el remitente es apoderado
        // Necesitamos saber el tipo de usuario del remitente
        const [remitente] = await pool.query('SELECT tipo_usuario FROM tb_usuarios WHERE id = ?', [remitente_id]);

        if (remitente.length > 0 && remitente[0].tipo_usuario === 'apoderado') {
            if (conversacion.respuesta_habilitada === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permiso para responder en esta conversación hasta que el docente lo habilite.'
                });
            }
        }

        // Insertar mensaje
        const [resultado] = await pool.query(`
            INSERT INTO tb_chat_mensajes
            (conversacion_id, remitente_id, mensaje, tipo_mensaje, archivo_url, archivo_nombre, archivo_tamano)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [conversacion_id, remitente_id, mensaje, tipo_mensaje || 'texto', archivo_url || null, archivo_nombre || null, archivo_tamano || null]);

        // Actualizar conversación
        await pool.query(`
            UPDATE tb_chat_conversaciones
            SET
                mensajes_count = mensajes_count + 1,
                ultimo_mensaje_id = ?,
                ultimo_mensaje_fecha = NOW()
            WHERE id = ?
        `, [resultado.insertId, conversacion_id]);

        // Obtener el mensaje insertado
        const [mensajeInsertado] = await pool.query(
            'SELECT * FROM tb_chat_mensajes WHERE id = ?',
            [resultado.insertId]
        );

        // --- SOCKET.IO EMIT (Real-time) ---
        if (req.io) {
            try {
                // Determinar quién es el otro usuario
                const otroUsuarioId = (conversacion.usuario1_id == remitente_id)
                    ? conversacion.usuario2_id
                    : conversacion.usuario1_id;

                // 1. Notificar al DESTINATARIO
                req.io.to(`user_${otroUsuarioId}`).emit('nuevo_mensaje', {
                    ...mensajeInsertado[0],
                    direccion: 'recibido', // Importante para que se pinte a la izquierda
                    conversacion_id: parseInt(conversacion_id)
                });

                // 2. Notificar al REMITENTE (Sync multi-tab/multi-device)
                req.io.to(`user_${remitente_id}`).emit('nuevo_mensaje', {
                    ...mensajeInsertado[0],
                    direccion: 'enviado',
                    conversacion_id: parseInt(conversacion_id)
                });
            } catch (e) {
                console.error("Error emitiendo socket:", e);
            }
        }

        res.json({
            success: true,
            data: mensajeInsertado[0],
            message: 'Mensaje enviado'
        });

    } catch (error) {
        console.error('Error al enviar mensaje:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar mensaje'
        });
    }
});

// ============================================
// PUT /api/chat/mensaje/:id/leido - Marcar mensaje como leído
// ============================================
router.put('/mensaje/:id/leido', async (req, res) => {
    const { id } = req.params;
    const { usuario_id } = req.body;

    if (!usuario_id) {
        return res.status(400).json({
            success: false,
            message: 'usuario_id es requerido'
        });
    }

    try {
        // Solo marcar como leído si el usuario NO es el remitente
        await pool.query(`
            UPDATE tb_chat_mensajes
            SET leido = 1, fecha_lectura = NOW()
            WHERE id = ? AND remitente_id != ? AND leido = 0
        `, [id, usuario_id]);

        res.json({
            success: true,
            message: 'Mensaje marcado como leído'
        });

    } catch (error) {
        console.error('Error al marcar mensaje como leído:', error);
        res.status(500).json({
            success: false,
            message: 'Error al marcar mensaje como leído'
        });
    }
});

// ============================================
// PUT /api/chat/conversacion/:id/leer-todos - Marcar todos los mensajes como leídos
// ============================================
router.put('/conversacion/:id/leer-todos', async (req, res) => {
    const { id } = req.params;
    const { usuario_id } = req.body;

    if (!usuario_id) {
        return res.status(400).json({
            success: false,
            message: 'usuario_id es requerido'
        });
    }

    try {
        // Verificar que el usuario pertenece a la conversación
        const [conv] = await pool.query(
            'SELECT * FROM tb_chat_conversaciones WHERE id = ? AND (usuario1_id = ? OR usuario2_id = ?) AND activo = 1',
            [id, usuario_id, usuario_id]
        );

        if (conv.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Conversación no encontrada'
            });
        }

        // Marcar todos los mensajes no leídos como leídos (excepto los enviados por el usuario)
        await pool.query(`
            UPDATE tb_chat_mensajes
            SET leido = 1, fecha_lectura = NOW()
            WHERE conversacion_id = ? AND remitente_id != ? AND leido = 0
        `, [id, usuario_id]);

        res.json({
            success: true,
            message: 'Mensajes marcados como leídos'
        });

    } catch (error) {
        console.error('Error al marcar mensajes como leídos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al marcar mensajes como leídos'
        });
    }
});

// ============================================
// GET /api/chat/no-leidos - Obtener conteo total de mensajes no leídos
// ============================================
router.get('/no-leidos', async (req, res) => {
    const { usuario_id, establecimiento_id } = req.query;

    if (!usuario_id || !establecimiento_id) {
        return res.status(400).json({
            success: false,
            message: 'usuario_id y establecimiento_id son requeridos'
        });
    }

    try {
        const [resultado] = await pool.query(`
            SELECT COUNT(*) AS total_no_leidos
            FROM tb_chat_mensajes m
            INNER JOIN tb_chat_conversaciones c ON m.conversacion_id = c.id
            WHERE c.establecimiento_id = ?
            AND (c.usuario1_id = ? OR c.usuario2_id = ?)
            AND c.activo = 1
            AND m.remitente_id != ?
            AND m.leido = 0
            AND m.eliminado_destinatario = 0
        `, [establecimiento_id, usuario_id, usuario_id, usuario_id]);

        res.json({
            success: true,
            data: {
                total_no_leidos: resultado[0].total_no_leidos
            }
        });

    } catch (error) {
        console.error('Error al obtener mensajes no leídos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener mensajes no leídos'
        });
    }
});

// ============================================
// GET /api/chat/nuevos-mensajes - Polling para nuevos mensajes
// ============================================
router.get('/nuevos-mensajes', async (req, res) => {
    const { usuario_id, establecimiento_id, desde } = req.query;

    if (!usuario_id || !establecimiento_id) {
        return res.status(400).json({
            success: false,
            message: 'usuario_id y establecimiento_id son requeridos'
        });
    }

    try {
        // Obtener mensajes nuevos desde la última consulta
        const fechaDesde = desde || new Date(Date.now() - 30000).toISOString(); // últimos 30 segundos si no se especifica

        const [mensajes] = await pool.query(`
            SELECT
                m.id,
                m.conversacion_id,
                m.remitente_id,
                m.mensaje,
                m.tipo_mensaje,
                m.fecha_envio,
                c.usuario1_id,
                c.usuario2_id
            FROM tb_chat_mensajes m
            INNER JOIN tb_chat_conversaciones c ON m.conversacion_id = c.id
            WHERE c.establecimiento_id = ?
            AND (c.usuario1_id = ? OR c.usuario2_id = ?)
            AND c.activo = 1
            AND m.remitente_id != ?
            AND m.fecha_envio > ?
            AND m.eliminado_destinatario = 0
            ORDER BY m.fecha_envio ASC
        `, [establecimiento_id, usuario_id, usuario_id, usuario_id, fechaDesde]);

        res.json({
            success: true,
            data: mensajes,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error al obtener nuevos mensajes:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener nuevos mensajes'
        });
    }
});

// ============================================
// PUT /api/chat/conversacion/:id/habilitar-respuesta - Habilitar/Deshabilitar respuesta
// ============================================
router.put('/conversacion/:id/habilitar-respuesta', async (req, res) => {
    const { id } = req.params;
    const { habilitado } = req.body; // true o false

    try {
        await pool.query('UPDATE tb_chat_conversaciones SET respuesta_habilitada = ? WHERE id = ?', [habilitado ? 1 : 0, id]);
        res.json({ success: true, message: 'Permiso de respuesta actualizado' });
    } catch (error) {
        console.error('Error al actualizar permiso:', error);
        res.status(500).json({ success: false, message: 'Error interno' });
    }
});

// ============================================
// POST /api/chat/mensaje-masivo - Enviar mensaje a múltiples destinatarios
// ============================================
router.post('/mensaje-masivo', async (req, res) => {
    const { remitente_id, destinatarios_ids, mensaje, establecimiento_id, respuesta_habilitada } = req.body;

    if (!remitente_id || !destinatarios_ids || !mensaje || !establecimiento_id) {
        return res.status(400).json({ success: false, message: 'Faltan datos requeridos' });
    }

    // Por defecto respuesta_habilitada es 0 (deshabilitada) si no se especifica
    const habilitarRespuesta = respuesta_habilitada !== undefined ? (respuesta_habilitada ? 1 : 0) : 0;

    try {
        let enviados = 0;

        for (const destId of destinatarios_ids) {
            // 1. Obtener o crear conversación
            // Reutilizamos lógica de crearConversacion pero simplificada
            const [u1, u2] = [remitente_id, destId].sort((a, b) => a - b);

            // Verificar existencia
            let [conv] = await pool.query(`
                SELECT id FROM tb_chat_conversaciones
                WHERE establecimiento_id = ?
                AND ((usuario1_id = ? AND usuario2_id = ?) OR (usuario1_id = ? AND usuario2_id = ?))
            `, [establecimiento_id, u1, u2, u2, u1]);

            let conversacionId;

            if (conv.length > 0) {
                conversacionId = conv[0].id;
                // Asegurar activo y actualizar respuesta_habilitada
                await pool.query('UPDATE tb_chat_conversaciones SET activo = 1, respuesta_habilitada = ? WHERE id = ?', [habilitarRespuesta, conversacionId]);
            } else {
                // Crear nueva con el valor de respuesta_habilitada especificado
                const [result] = await pool.query(`
                    INSERT INTO tb_chat_conversaciones
                    (establecimiento_id, usuario1_id, usuario2_id, contexto_tipo, iniciada_por, respuesta_habilitada)
                    VALUES (?, ?, ?, 'curso', ?, ?)
                `, [establecimiento_id, u1, u2, remitente_id, habilitarRespuesta]);
                conversacionId = result.insertId;
            }

            // 2. Insertar mensaje
            await pool.query(`
                INSERT INTO tb_chat_mensajes
                (conversacion_id, remitente_id, mensaje, tipo_mensaje)
                VALUES (?, ?, ?, 'texto')
            `, [conversacionId, remitente_id, mensaje]);

            // 3. Actualizar contadores
            await pool.query(`
                UPDATE tb_chat_conversaciones
                SET mensajes_count = mensajes_count + 1, ultimo_mensaje_fecha = NOW()
                WHERE id = ?
            `, [conversacionId]);

            enviados++;
        }

        res.json({ success: true, count: enviados, message: `Mensaje enviado a ${enviados} destinatarios` });

    } catch (error) {
        console.error('Error masivo:', error);
        res.status(500).json({ success: false, message: 'Error al enviar mensajes masivos' });
    }
});


// ============================================
// GET /api/chat/docente/:id/cursos - Obtener cursos del docente
// ============================================
router.get('/docente/:id/cursos', async (req, res) => {
    const { id } = req.params; // usuario_id del docente (en tb_usuarios)
    const { establecimiento_id } = req.query;

    if (!establecimiento_id) {
        return res.status(400).json({ success: false, message: 'establecimiento_id requerido' });
    }

    try {
        // Obtenemos el ID de docente desde la tabla tb_docentes usando el usuario_id
        const [docente] = await pool.query('SELECT id FROM tb_docentes WHERE usuario_id = ?', [id]);

        if (docente.length === 0) {
            return res.status(404).json({ success: false, message: 'Docente no encontrado' });
        }
        const docenteId = docente[0].id;

        const [cursos] = await pool.query(`
            SELECT DISTINCT c.id, c.nombre, c.grado, c.letra, c.nivel
            FROM tb_cursos c
            INNER JOIN tb_asignaciones a ON c.id = a.curso_id
            WHERE a.docente_id = ? AND a.establecimiento_id = ? AND c.activo = 1 AND a.activo = 1
            ORDER BY c.grado, c.letra
        `, [docenteId, establecimiento_id]);

        res.json({ success: true, data: cursos });
    } catch (error) {
        console.error('Error al obtener cursos del docente:', error);
        res.status(500).json({ success: false, message: 'Error interno' });
    }
});

// ============================================
// GET /api/chat/curso/:id/alumnos-chat - Obtener alumnos y apoderados para chat
// ============================================
router.get('/curso/:id/alumnos-chat', async (req, res) => {
    const { id } = req.params; // curso_id
    const { usuario_id } = req.query; // Para verificar mensajes no leidos (opcional, o futura mejora)

    try {
        const [alumnos] = await pool.query(`
            SELECT
                al.id AS alumno_id,
                CONCAT(al.nombres, ' ', al.apellidos) AS nombre_alumno,
                ap.id AS apoderado_id,
                ap.usuario_id AS apoderado_usuario_id,
                u_ap.activo AS apoderado_activo,
                CONCAT(ap.nombres, ' ', ap.apellidos) AS nombre_apoderado,
                ap.foto_url AS foto_apoderado
            FROM tb_matriculas m
            INNER JOIN tb_alumnos al ON m.alumno_id = al.id
            INNER JOIN tb_apoderados ap ON m.apoderado_id = ap.id
            LEFT JOIN tb_usuarios u_ap ON ap.usuario_id = u_ap.id
            WHERE m.curso_asignado_id = ? AND m.activo = 1
            ORDER BY al.apellidos, al.nombres
        `, [id]);

        res.json({ success: true, data: alumnos });
    } catch (error) {
        console.error('Error al obtener alumnos del curso:', error);
        res.status(500).json({ success: false, message: 'Error interno' });
    }
});

module.exports = router;

