const mysql = require('mysql2/promise');

async function checkRiskStudents() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'db_colegio',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    try {
        console.log("--- Analizando Alumnos en Riesgo y sus Cursos ---");
        const [rows] = await pool.query(`
            SELECT 
                a.alumno_id, 
                al.nombres, 
                al.apellidos, 
                a.curso_id as curso_id_asistencia,
                al.curso_id as curso_id_alumno,
                c.nombre as nombre_curso_asistencia,
                COUNT(*) as registros
            FROM tb_asistencia a
            JOIN tb_alumnos al ON a.alumno_id = al.id
            LEFT JOIN tb_cursos c ON a.curso_id = c.id
            WHERE a.activo = 1
            GROUP BY a.alumno_id, a.curso_id, al.nombres, al.apellidos, al.curso_id, c.nombre
            HAVING (SUM(CASE WHEN a.estado IN ('presente', 'atrasado') THEN 1 ELSE 0 END) / COUNT(*)) * 100 < 85
            LIMIT 5
        `);

        if (rows.length === 0) {
            console.log("No se encontraron alumnos bajo el 85% en la consulta de prueba.");
        } else {
            console.table(rows);
        }

    } catch (error) {
        console.error("Error den diagnóstico:", error);
    } finally {
        await pool.end();
    }
}

checkRiskStudents();
