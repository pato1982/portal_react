import mysql from 'mysql2/promise';

async function debugData() {
    let pool;
    try {
        // Create direct connection to avoid module/path issues
        pool = mysql.createPool({
            host: '170.239.87.97',
            user: 'root',
            password: 'EXwCVq87aj0F3f1',
            database: 'portal_estudiantil',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        const alumnoId = 121; // Florencia Soto
        const anioActual = 2026;

        console.log(`--- DEBUGGING DATA FOR ALUMNO ${alumnoId} YEAR ${anioActual} ---`);

        // 1. Check if 'tb_notas' has any data for this student
        const [allNotas] = await pool.query(`
            SELECT COUNT(*) as count, anio_academico 
            FROM tb_notas 
            WHERE alumno_id = ? 
            GROUP BY anio_academico
        `, [alumnoId]);
        console.log('Notas count by year:', allNotas);

        // 2. Run the EXACT query from the endpoint
        const [notas] = await pool.query(`
            SELECT
                n.nota,
                n.trimestre,
                n.fecha_evaluacion,
                asig.nombre as asignatura
            FROM tb_notas n
            JOIN tb_asignaturas asig ON n.asignatura_id = asig.id
            WHERE n.alumno_id = ?
            AND n.activo = 1
            AND n.anio_academico = ?
            AND n.es_pendiente = 0
            AND n.nota IS NOT NULL
            ORDER BY n.fecha_evaluacion ASC
        `, [alumnoId, anioActual]);

        console.log(`Query returned ${notas.length} records.`);
        if (notas.length > 0) {
            console.log('Sample record:', notas[0]);
        } else {
            console.log('NO RECORDS FOUND with strict filter.');

            // Check why? Maybe not 'activo', or 'nota' is null
            console.log('Checking lenient query...');
            const [lenientNotas] = await pool.query(`
               SELECT count(*) as total 
               FROM tb_notas 
               WHERE alumno_id = ? AND anio_academico = ?
            `, [alumnoId, anioActual]);
            console.log('Total notes (ignoring checks):', lenientNotas[0].total);
        }

        // 3. Process data
        const asignaturas = [...new Set(notas.map(n => n.asignatura))].sort();
        console.log('Computed Asignaturas:', asignaturas);

        const promediosPorAsignatura = {};
        asignaturas.forEach(asig => {
            const notasAsig = notas.filter(n => n.asignatura === asig);
            if (notasAsig.length > 0) {
                const suma = notasAsig.reduce((acc, n) => acc + parseFloat(n.nota), 0);
                promediosPorAsignatura[asig] = suma / notasAsig.length;
            }
        });
        console.log('Computed Promedios:', promediosPorAsignatura);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (pool) await pool.end();
        process.exit();
    }
}

debugData();
