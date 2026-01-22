
import { createConnection } from 'mysql2/promise';

const config = {
    host: '170.239.87.97',
    user: 'root',
    password: 'EXwCVq87aj0F3f1',
    database: 'portal_estudiantil'
};

/*
  Script para poblar datos completos de un alumno (Florencia, ID 121)
  - Notas
  - Asistencia
  - Anotaciones
  - Comunicados (para el curso)
*/

async function poblarDatos() {
    let connection;
    try {
        connection = await createConnection(config);
        console.log('Conectado a la BD...');

        const alumnoId = 121; // Florencia Soto
        const cursoId = 1;    // 1° Básico A
        const establecimientoId = 1;
        const anio = 2026;

        // 1. Obtener Asignaturas del Curso (usando tb_asignaciones o tb_asignaturas directas si están vinculadas por malla)
        // Como no tengo claro la malla, buscaré asignaturas activas y seleccionaré 4 comunes.

        /* 
           Nota: En este sistema, las asignaturas se relacionan al curso vía tb_asignaciones (docente->curso->asig).
           O quizás existe tb_curso_asignatura. 
           Voy a buscar asignaturas generales.
        */
        const [asignaturas] = await connection.query(`
            SELECT id, nombre FROM tb_asignaturas 
            WHERE activo = 1 
            AND establecimiento_id = ?
            LIMIT 5
        `, [establecimientoId]);

        if (asignaturas.length === 0) {
            console.log("No se encontraron asignaturas. Creando asignaturas dummy...");
            // Crear si no existen (solo para demo)
            const materias = ['Matemática', 'Lenguaje', 'Historia', 'Ciencias'];
            for (const mat of materias) {
                await connection.query('INSERT INTO tb_asignaturas (nombre, codigo, establecimiento_id, activo) VALUES (?, ?, ?, 1)', [mat, mat.substring(0, 3).toUpperCase(), establecimientoId]);
            }
            // Recargar
            const [asignaturasNuevas] = await connection.query(`SELECT id, nombre FROM tb_asignaturas WHERE activo = 1 AND establecimiento_id = ? LIMIT 5`, [establecimientoId]);
            asignaturas.push(...asignaturasNuevas);
        }

        console.log(`Usando ${asignaturas.length} asignaturas para generar notas.`);

        // 2. Insertar NOTAS
        console.log('--- Generando Notas ---');
        // Limpiar notas previas de este alumno para evitar duplicados masivos si corre de nuevo
        await connection.query('DELETE FROM tb_notas WHERE alumno_id = ?', [alumnoId]);

        const trimestres = [1, 2, 3];

        for (const asig of asignaturas) {
            for (const tri of trimestres) {
                // Generar 3 notas por trimestre
                for (let i = 0; i < 3; i++) {
                    const nota = (Math.random() * (7.0 - 4.0) + 4.0).toFixed(1); // Notas entre 4.0 y 7.0
                    // A veces una roja
                    const notaFinal = Math.random() > 0.9 ? (Math.random() * (3.9 - 2.0) + 2.0).toFixed(1) : nota;

                    const fecha = `${anio}-0${tri + 2}-${10 + i}`; // Fechas ficticias mar/abr/may...

                    await connection.query(`
                        INSERT INTO tb_notas 
                        (alumno_id, asignatura_id, curso_id, docente_id, establecimiento_id, trimestre, nota, fecha_evaluacion, tipo_evaluacion_id, registrado_por, fecha_registro)
                        VALUES (?, ?, ?, 1, ?, ?, ?, ?, 1, 1, NOW())
                    `, [alumnoId, asig.id, cursoId, establecimientoId, tri, notaFinal, fecha]);
                }
            }
        }
        console.log('Notas generadas.');

        // 3. Insertar ASISTENCIA
        console.log('--- Generando Asistencia ---');
        await connection.query('DELETE FROM tb_asistencia WHERE alumno_id = ?', [alumnoId]);

        // Generar asistencia para un mes (ej: Marzo)
        for (let dia = 1; dia <= 20; dia++) {
            // Saltamos fines de semana simple (simulado)
            if (dia % 7 === 6 || dia % 7 === 0) continue;

            const estadoRand = Math.random();
            let estado = 'presente';
            if (estadoRand > 0.90) estado = 'ausente';
            else if (estadoRand > 0.85) estado = 'tardio';

            const fecha = `${anio}-03-${String(dia).padStart(2, '0')}`;

            await connection.query(`
                INSERT INTO tb_asistencia
                (alumno_id, curso_id, establecimiento_id, fecha, estado, activo, registrado_por)
                VALUES (?, ?, ?, ?, ?, 1, 1)
            `, [alumnoId, cursoId, establecimientoId, fecha, estado]);
        }
        console.log('Asistencia generada.');

        // 4. Insertar ANOTACIONES
        console.log('--- Generando Anotaciones ---');
        await connection.query('DELETE FROM tb_anotaciones WHERE alumno_id = ?', [alumnoId]);

        await connection.query(`
            INSERT INTO tb_anotaciones (alumno_id, tipo, descripcion, fecha, docente_id, establecimiento_id, activo)
            VALUES (?, 'positiva', 'Participa activamente en clases.', NOW(), 1, ?, 1)
        `, [alumnoId, establecimientoId]);

        await connection.query(`
            INSERT INTO tb_anotaciones (alumno_id, tipo, 'negativa', descripcion, fecha, docente_id, establecimiento_id, activo)
            VALUES (?, 'negativa', 'Olvida sus materiales de trabajo.', DATE_SUB(NOW(), INTERVAL 2 DAY), 1, ?, 1)
        `, [alumnoId, establecimientoId]);
        console.log('Anotaciones generadas.');

        // 5. Insertar COMUNICADOS
        console.log('--- Generando Comunicados ---');
        // Comunicado general al curso
        await connection.query(`
            INSERT INTO tb_comunicados (titulo, contenido, tipo_destinatario, destinatario_id, establecimiento_id, fecha_envio, enviado_por, activo)
            VALUES 
            ('Reunión de Apoderados', 'Se cita a reunión de apoderados para el día Viernes a las 19:00 hrs.', 'curso', ?, ?, NOW(), 1, 1),
            ('Feria Científica', 'Recordar traer materiales para la feria científica.', 'curso', ?, ?, DATE_SUB(NOW(), INTERVAL 5 DAY), 1, 1)
        `, [cursoId, establecimientoId, cursoId, establecimientoId]);

        console.log('Comunicados generados.');

        console.log('=========================================');
        console.log(' Datos Completos Generados para Florencia');
        console.log('=========================================');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

poblarDatos();
