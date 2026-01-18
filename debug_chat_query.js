
import { createConnection } from 'mysql2/promise';

const config = {
    host: '170.239.87.97',
    user: 'root',
    password: 'EXwCVq87aj0F3f1',
    database: 'portal_estudiantil'
};

async function checkChatQuery() {
    let connection;
    try {
        connection = await createConnection(config);
        console.log('Conectado a la BD.');

        // 1. Obtener un curso con matriculas
        const [cursos] = await connection.query(`
      SELECT curso_asignado_id, COUNT(*) as count 
      FROM tb_matriculas 
      WHERE activo = 1 
      GROUP BY curso_asignado_id 
      HAVING count > 0
      LIMIT 1
    `);

        if (cursos.length === 0) {
            console.log('No hay cursos con matrículas activas.');
            return;
        }

        const cursoId = cursos[0].curso_asignado_id;
        console.log(`Probando con Curso ID: ${cursoId} (Matrículas: ${cursos[0].count})`);

        // 2. Ejecutar la query EXACTA del chat (la nueva)
        const [alumnos] = await connection.query(`
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
    `, [cursoId]);

        console.log(`Resultados Query Nueva: ${alumnos.length}`);
        if (alumnos.length > 0) {
            console.log('Ejemplo primer alumno:', alumnos[0]);
        } else {
            console.log('CRITICO: La query nueva devuelve 0 filas, pero hay matrículas.');

            // Debug por qué falla
            // Check matriculas raw
            const [mats] = await connection.query('SELECT * FROM tb_matriculas WHERE curso_asignado_id = ? AND activo = 1', [cursoId]);
            console.log(`Total Matriculas Raw: ${mats.length}`);

            // Check joins
            for (const mat of mats) {
                const [alu] = await connection.query('SELECT id FROM tb_alumnos WHERE id = ?', [mat.alumno_id]);
                const [apo] = await connection.query('SELECT id FROM tb_apoderados WHERE id = ?', [mat.apoderado_id]);
                console.log(`Matricula ${mat.id}: Alumno ${mat.alumno_id} (${alu.length > 0 ? 'OK' : 'MISSING'}), Apoderado ${mat.apoderado_id} (${apo.length > 0 ? 'OK' : 'MISSING'})`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

checkChatQuery();
