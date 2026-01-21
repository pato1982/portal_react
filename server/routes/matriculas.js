const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET /api/matriculas
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
        if (establecimiento_id) { query += ' AND m.establecimiento_id = ?'; params.push(establecimiento_id); }
        if (anio) { query += ' AND m.anio_academico = ?'; params.push(anio); }
        if (curso_id) { query += ' AND m.curso_asignado_id = ?'; params.push(curso_id); }

        query += ' ORDER BY m.fecha_creacion DESC LIMIT 100';

        const [rows] = await pool.query(query, params);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error al obtener matrículas:', error);
        res.status(500).json({ success: false, error: 'Error del servidor' });
    }
});

// POST /api/matriculas - Crear Matrícula con Apoderado Inteligente
router.post('/', async (req, res) => {
    const connection = await pool.getConnection(); // Transacción
    await connection.beginTransaction();

    try {
        const {
            establecimiento_id,
            alumno_id, apoderado_id, // IDs existentes (opcionales)
            curso_asignado_id, anio_academico, periodo_matricula_id,

            // Datos Alumno
            rut_alumno, nombres_alumno, apellidos_alumno,
            fecha_nacimiento_alumno, sexo_alumno, nacionalidad_alumno,
            direccion_alumno, comuna_alumno, ciudad_alumno, email_alumno, telefono_alumno,

            // Datos Apoderado (Puede ser existente o nuevo)
            rut_apoderado, nombres_apoderado, apellidos_apoderado,
            email_apoderado, telefono_apoderado, direccion_apoderado,
            parentezco, // NUEVO CAMPO

            // Antecedentes
            colegio_procedencia, ultimo_curso_aprobado, promedio_notas_anterior,

            // Salud / NEE / Emergencia
            tiene_nee, detalle_nee, alergias, enfermedades_cronicas,
            contacto_emergencia_nombre, contacto_emergencia_telefono,
            observaciones_apoderado
        } = req.body;

        if (!establecimiento_id || !rut_alumno || !nombres_alumno) {
            await connection.rollback(); connection.release();
            return res.status(400).json({ success: false, error: 'Faltan campos obligatorios del alumno' });
        }

        // -------------------------------------------------------------
        // 1. GESTIÓN DE APODERADO: BUSCAR O CREAR
        // -------------------------------------------------------------
        let finalApoderadoId = apoderado_id;

        if (!finalApoderadoId) {
            if (!rut_apoderado || !nombres_apoderado) {
                await connection.rollback(); connection.release();
                return res.status(400).json({ success: false, error: 'Debe ingresar RUT y Nombre del Apoderado' });
            }

            // Buscar si existe ese apoderado
            const [apoderados] = await connection.query('SELECT id FROM tb_apoderados WHERE rut = ?', [rut_apoderado]);

            if (apoderados.length > 0) {
                finalApoderadoId = apoderados[0].id;
                // Opcional: Podríamos actualizar sus datos (telefono, email) aquí.
            } else {
                // Crear Nuevo Apoderado
                const passTemp = rut_apoderado.replace(/\./g, '').substring(0, 4); // Clave: 4 primeros digitos rut

                const [nuevoAp] = await connection.query(`
                    INSERT INTO tb_apoderados (
                        rut, nombres, apellidos, email, telefono, direccion, 
                        clave, estado, fecha_registro
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'activo', NOW())
                `, [rut_apoderado, nombres_apoderado, apellidos_apoderado, email_apoderado, telefono_apoderado, direccion_apoderado, passTemp]);

                finalApoderadoId = nuevoAp.insertId;
            }
        }

        // -------------------------------------------------------------
        // 2. PERIODO Y ALUMNO
        // -------------------------------------------------------------
        let periodoId = periodo_matricula_id;
        if (!periodoId) {
            const [periodos] = await connection.query(
                'SELECT id FROM tb_periodos_matricula WHERE establecimiento_id = ? AND anio = ? AND activo = 1 LIMIT 1',
                [establecimiento_id, anio_academico || new Date().getFullYear()]
            );
            if (periodos.length > 0) periodoId = periodos[0].id;
            else {
                const year = anio_academico || new Date().getFullYear();
                const [nuevo] = await connection.query(
                    'INSERT INTO tb_periodos_matricula (establecimiento_id, nombre, anio, fecha_inicio, fecha_fin, estado) VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), "abierto")',
                    [establecimiento_id, `Admisión ${year}`, year]
                );
                periodoId = nuevo.insertId;
            }
        }

        let finalAlumnoId = alumno_id;
        if (!finalAlumnoId) {
            const [alumnosExistentes] = await connection.query('SELECT id FROM tb_alumnos WHERE rut = ?', [rut_alumno]);
            if (alumnosExistentes.length > 0) finalAlumnoId = alumnosExistentes[0].id;
        }

        // -------------------------------------------------------------
        // 3. INSERTAR MATRÍCULA
        // -------------------------------------------------------------
        const queryInsert = `
            INSERT INTO tb_matriculas (
                establecimiento_id, periodo_matricula_id, alumno_id, apoderado_id,
                anio_academico, numero_matricula, tipo_matricula, estado,
                curso_asignado_id, 
                nombres_alumno, apellidos_alumno, rut_alumno,
                fecha_nacimiento_alumno, sexo_alumno, nacionalidad_alumno,
                direccion_alumno, comuna_alumno, ciudad_alumno, email_alumno, telefono_alumno,
                parentezco,
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
                ?,
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
            finalApoderadoId, // ID REAL
            anio_academico || new Date().getFullYear(),
            numMatricula,
            curso_asignado_id || null,

            nombres_alumno, apellidos_alumno, rut_alumno,
            fecha_nacimiento_alumno || null, sexo_alumno || null, nacionalidad_alumno || 'Chilena',
            direccion_alumno || null, comuna_alumno || null, ciudad_alumno || null, email_alumno || null, telefono_alumno || null,
            parentezco || 'Apoderado', // DEFAULT SI VACIO
            colegio_procedencia || null, ultimo_curso_aprobado || null, promedio_notas_anterior || null,
            tiene_nee ? 1 : 0, detalle_nee || null, alergias || null, enfermedades_cronicas || null,
            contacto_emergencia_nombre || null, contacto_emergencia_telefono || null,
            observaciones_apoderado || null
        ];

        const [result] = await connection.query(queryInsert, values);

        await connection.commit();
        connection.release();

        res.json({ success: true, message: 'Matrícula y Apoderado guardados correctamente', id: result.insertId });

    } catch (error) {
        if (connection) { await connection.rollback(); connection.release(); }
        console.error('Error matrículas:', error);
        res.status(500).json({ success: false, error: 'Error: ' + error.message });
    }
});

module.exports = router;
