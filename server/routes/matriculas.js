const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET /api/matriculas - Listar matrículas (con filtros opcionales)
router.get('/', async (req, res) => {
    try {
        const { establecimiento_id, anio, curso_id } = req.query;

        let query = `
            SELECT m.*, 
                   c.nombre as nombre_curso,
                   CONCAT(a.nombres, ' ', a.apellidos) as nombre_apoderado
            FROM tb_matriculas m
            LEFT JOIN tb_cursos c ON m.curso_asignado_id = c.id
            LEFT JOIN tb_apoderados a ON m.apoderado_id = a.id
            WHERE m.activo = 1
        `;

        const params = [];

        if (establecimiento_id) {
            query += ' AND m.establecimiento_id = ?';
            params.push(establecimiento_id);
        }

        if (anio) {
            query += ' AND m.anio_academico = ?';
            params.push(anio);
        }

        if (curso_id) {
            query += ' AND m.curso_asignado_id = ?';
            params.push(curso_id);
        }

        query += ' ORDER BY m.fecha_creacion DESC LIMIT 100';

        const [rows] = await pool.query(query, params);

        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error al obtener matrículas:', error);
        res.status(500).json({ success: false, error: 'Error del servidor' });
    }
});

// POST /api/matriculas - Crear nueva matrícula
router.post('/', async (req, res) => {
    try {
        const {
            establecimiento_id,
            alumno_id, // Puede venir si elegimos un alumno existente
            apoderado_id,
            curso_asignado_id,
            anio_academico,
            rut_alumno,
            nombres_alumno,
            apellidos_alumno,
            periodo_matricula_id // Si no viene, intentaremos buscar el activo
        } = req.body;

        // Validaciones básicas
        if (!establecimiento_id || !rut_alumno || !nombres_alumno || !apellidos_alumno) {
            return res.status(400).json({ success: false, error: 'Faltan campos obligatorios' });
        }

        // 1. Resolver Periodo de Matrícula (Si no viene)
        let periodoId = periodo_matricula_id;
        if (!periodoId) {
            // Buscar periodo activo para el año y establecimiento
            const [periodos] = await pool.query(
                'SELECT id FROM tb_periodos_matricula WHERE establecimiento_id = ? AND anio = ? AND activo = 1 LIMIT 1',
                [establecimiento_id, anio_academico || new Date().getFullYear()]
            );

            if (periodos.length > 0) {
                periodoId = periodos[0].id;
            } else {
                // Si no existe periodo, crear uno por defecto (para evitar bloqueo en testing)
                const [nuevoPeriodo] = await pool.query(
                    'INSERT INTO tb_periodos_matricula (establecimiento_id, nombre, anio, fecha_inicio, fecha_fin, estado) VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), "abierto")',
                    [establecimiento_id, `Periodo ${anio_academico || 2026}`, anio_academico || 2026]
                );
                periodoId = nuevoPeriodo.insertId;
            }
        }

        // 2. Verificar o Crear Alumno en tb_alumnos (Si no viene ID)
        let finalAlumnoId = alumno_id;
        if (!finalAlumnoId) {
            // Buscar por RUT
            const [alumnosExistentes] = await pool.query('SELECT id FROM tb_alumnos WHERE rut = ?', [rut_alumno]);
            if (alumnosExistentes.length > 0) {
                finalAlumnoId = alumnosExistentes[0].id;
            } else {
                // Si no existe, ¿Debemos crearlo? 
                // Para simplificar la matrícula rápida, asumiremos que SI
                // Sin embargo, idealmente el alumno debería crearse en AlumnosTab. 
                // Aquí solo vinculamos si existe.
            }
        }

        // 3. Crear Matrícula
        const queryInsert = `
            INSERT INTO tb_matriculas (
                establecimiento_id, periodo_matricula_id, alumno_id, apoderado_id,
                anio_academico, numero_matricula, tipo_matricula, estado,
                curso_asignado_id, nombres_alumno, apellidos_alumno, rut_alumno,
                fecha_creacion
            ) VALUES (?, ?, ?, ?, ?, ?, 'nuevo', 'aprobada', ?, ?, ?, ?, NOW())
        `;

        // Generar numero matricula simple
        const numMatricula = `${anio_academico || 2026}-${Math.floor(Math.random() * 10000)}`;

        const values = [
            establecimiento_id,
            periodoId,
            finalAlumnoId, // Puede ser null segun schema, pero idealmente no
            apoderado_id,
            anio_academico || new Date().getFullYear(),
            numMatricula,
            curso_asignado_id, // CRUCIAL para el chat
            nombres_alumno,
            apellidos_alumno,
            rut_alumno
        ];

        const [result] = await pool.query(queryInsert, values);

        res.json({
            success: true,
            message: 'Matrícula creada exitosamente',
            id: result.insertId
        });

    } catch (error) {
        console.error('Error al crear matrícula:', error);
        res.status(500).json({ success: false, error: error.message || 'Error del servidor' });
    }
});

module.exports = router;
