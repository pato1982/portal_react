import mysql from 'mysql2/promise';

async function checkSchema() {
    let pool;
    try {
        pool = mysql.createPool({
            host: '170.239.87.97',
            user: 'root',
            password: 'EXwCVq87aj0F3f1',
            database: 'portal_estudiantil',
        });

        const [usuariosCols] = await pool.query('DESCRIBE tb_usuarios');
        console.log('tb_usuarios columns:', usuariosCols.map(c => c.Field).join(', '));

        const [alumnosCols] = await pool.query('DESCRIBE tb_alumnos');
        console.log('tb_alumnos columns:', alumnosCols.map(c => c.Field).join(', '));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (pool) await pool.end();
        process.exit();
    }
}

checkSchema();
