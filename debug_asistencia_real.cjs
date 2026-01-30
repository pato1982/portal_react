const mysql = require('mysql2/promise');

async function debug() {
    const pool = mysql.createPool({
        host: '170.239.87.97',
        user: 'root',
        password: 'EXwCVq87aj0F3f1',
        database: 'portal_estudiantil',
        waitForConnections: true,
        connectionLimit: 1,
        queueLimit: 0
    });

    try {
        console.log("--- Schema de tb_cursos ---");
        const [columns] = await pool.query(`DESCRIBE tb_cursos`);
        console.table(columns);

        console.log("\n--- Resultado de la query de riesgo (limit 5) ---");
        const [rows] = await pool.query(`
            SELECT 
                a.alumno_id, 
                al.nombres, 
                al.apellidos, 
                a.curso_id as curso_id_en_asistencia,
                c.nombre as nombre_del_curso,
                COUNT(*) as total,
                SUM(CASE WHEN a.estado IN ('presente', 'atrasado') THEN 1 ELSE 0 END) as asistencias,
                ROUND((SUM(CASE WHEN a.estado IN ('presente', 'atrasado') THEN 1 ELSE 0 END) / COUNT(*)) * 100, 1) as porcentaje
            FROM tb_asistencia a
            JOIN tb_alumnos al ON a.alumno_id = al.id
            LEFT JOIN tb_cursos c ON a.curso_id = c.id
            WHERE a.establecimiento_id = 1
            AND YEAR(a.fecha) = 2026
            AND a.activo = 1
            GROUP BY a.alumno_id, al.nombres, al.apellidos, a.curso_id, c.nombre
            HAVING porcentaje < 85
            ORDER BY porcentaje ASC
            LIMIT 5
        `);
        console.table(rows);

    } catch (e) { console.error(e); }
    finally { await pool.end(); }
}

debug();
