const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET /api/matriculas - Listar matrículas
router.get('/', async (req, res) => {
    try {
        const { establecimiento_id, anio, curso_id } = req.query;

        // Query completa con JOINs para mostrar nombres
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

// POST /api/matriculas - Crear Matrícula Completa
router.post('/', async (req, res) => {
    try {
        const {
            establecimiento_id,
            alumno_id, // opcional si se crea nuevo
            apoderado_id,
            curso_asignado_id,
            anio_academico,
            rut_alumno,
            nombres_alumno,
            apellidos_alumno,
            periodo_matricula_id,

            // Campos Adicionales (Tabla Completa)
            fecha_nacimiento_alumno,
            sexo_alumno,
            nacionalidad_alumno,
            direccion_alumno,
            comuna_alumno,
            ciudad_alumno,
            email_alumno,
            telefono_alumno,

            // Académicos Previos
            colegio_procedencia,
            ultimo_curso_aprobado,
            promedio_notas_anterior,

            // Salud / NEE
            tiene_nee,
            detalle_nee,
            alergias,
            enfermedades_cronicas,

            // Emergencia
            contacto_emergencia_nombre,
            contacto_emergencia_telefono,
            observaciones_apoderado
        } = req.body;

        // Validaciones Obligatorias
        if (!establecimiento_id || !rut_alumno || !nombres_alumno || !apellidos_alumno) {
            return res.status(400).json({ success: false, error: 'Faltan campos obligatorios' });
        }

        // 1. Resolver Periodo de Matrícula (Si no viene)
        let periodoId = periodo_matricula_id;
        if (!periodoId) {
            const [periodos] = await pool.query(
                'SELECT id FROM tb_periodos_matricula WHERE establecimiento_id = ? AND anio = ? AND activo = 1 LIMIT 1',
                [establecimiento_id, anio_academico || new Date().getFullYear()]
            );
            if (periodos.length > 0) periodId = periodos[0].id;
            else {
                // Crear periodo default si no existe
                const year = anio_academico || new Date().getFullYear();
                const [nuevo] = await pool.query(
                    'INSERT INTO tb_periodos_matricula (establecimiento_id, nombre, anio, fecha_inicio, fecha_fin, estado) VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), "abierto")',
                    [establecimiento_id, `Admisión ${year}`, year]
                );
                periodoId = nuevo.insertId;
            }
        }

        // 2. Verificar existencia de Alumno en sistema (tb_alumnos)
        // Ojo: tb_matriculas guarda los datos PERSONALES snapshot, pero tb_alumnos es la referencia única.
        let finalAlumnoId = alumno_id;
        if (!finalAlumnoId) {
            const [alumnosExistentes] = await pool.query('SELECT id FROM tb_alumnos WHERE rut = ?', [rut_alumno]);
            if (alumnosExistentes.length > 0) {
                finalAlumnoId = alumnosExistentes[0].id;
            }
        }

        // 3. Insertar Matrícula (Query Completa)
        const queryInsert = `
            INSERT INTO tb_matriculas (
                establecimiento_id, periodo_matricula_id, alumno_id, apoderado_id,
                anio_academico, numero_matricula, tipo_matricula, estado,
                curso_asignado_id, 
                nombres_alumno, apellidos_alumno, rut_alumno,
                fecha_nacimiento_alumno, sexo_alumno, nacionalidad_alumno,
                direccion_alumno, comuna_alumno, ciudad_alumno, email_alumno, telefono_alumno,
                colegio_procedencia, ultimo_curso_aprobado, promedio_notas_anterior,
                tiene_nee, detalle_nee, alergias, enfermedades_cronicas,
                contacto_emergencia_nombre, contacto_emergencia_telefono,
                observaciones_apoderado,
                fecha_creacion, activo
            ) VALUES (
                ?, ?, ?, ?, 
                ?, ?, 'nuevo', 'aprobada',
                ?,
                ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?,
                ?,
                NOW(), 1
            )
        `;

        const numMatricula = `${anio_academico || 2026}-${Math.floor(Math.random() * 9000) + 1000}`;

        const values = [
            establecimiento_id,
            periodoId,
            finalAlumnoId || null,
            apoderado_id,
            anio_academico || new Date().getFullYear(),
            numMatricula,
            curso_asignado_id || null, // Importante: puede ser null si es solicitud, pero para admin suele ser asignado

            nombres_alumno,
            apellidos_alumno,
            rut_alumno,

            fecha_nacimiento_alumno || null,
            sexo_alumno || null,
            nacionalidad_alumno || 'Chilena',

            direccion_alumno || null,
            comuna_alumno || null,
            ciudad_alumno || null,
            email_alumno || null,
            telefono_alumno || null,

            colegio_procedencia || null,
            ultimo_curso_aprobado || null,
            promedio_notas_anterior || null,

            tiene_nee ? 1 : 0,
            detalle_nee || null,
            alergias || null,
            enfermedades_cronicas || null,

            contacto_emergencia_nombre || null,
            contacto_emergencia_telefono || null,
            observaciones_apoderado || null
        ];

        const [result] = await pool.query(queryInsert, values);

        res.json({
            success: true,
            message: 'Ficha de matrícula creada correctamente',
            id: result.insertId
        });

    } catch (error) {
        console.error('Error al crear matrícula completa:', error);
        res.status(500).json({ success: false, error: 'Error interno al guardar la matrícula' });
    }
});

module.exports = router;
