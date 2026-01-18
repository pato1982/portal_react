
import { createConnection } from 'mysql2/promise';

const config = {
    host: '170.239.87.97',
    user: 'root',
    password: 'EXwCVq87aj0F3f1',
    database: 'portal_estudiantil'
};

async function checkData() {
    let connection;
    try {
        connection = await createConnection(config);
        console.log('Conectado a la BD.');

        const [total] = await connection.query('SELECT COUNT(*) as c FROM tb_matriculas');
        console.log(`Total Matriculas: ${total[0].c}`);

        const [active] = await connection.query('SELECT COUNT(*) as c FROM tb_matriculas WHERE activo = 1');
        console.log(`Total Matriculas Activas: ${active[0].c}`);

        const [conCurso] = await connection.query('SELECT COUNT(*) as c FROM tb_matriculas WHERE curso_asignado_id IS NOT NULL');
        console.log(`Total Matriculas Con Curso: ${conCurso[0].c}`);

        const [sample] = await connection.query('SELECT * FROM tb_matriculas LIMIT 1');
        console.log('Sample Matricula:', sample[0]);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

checkData();
