
import { createConnection } from 'mysql2/promise';

const config = {
    host: '170.239.87.97',
    user: 'root',
    password: 'EXwCVq87aj0F3f1',
    database: 'portal_estudiantil'
};

async function checkTotalData() {
    let connection;
    try {
        connection = await createConnection(config);
        console.log('Conectado a BD.');

        const [alumnos] = await connection.query('SELECT COUNT(*) as c FROM tb_alumnos');
        console.log(`TB_ALUMNOS: ${alumnos[0].c}`);

        const [apoderados] = await connection.query('SELECT COUNT(*) as c FROM tb_apoderados');
        console.log(`TB_APODERADOS: ${apoderados[0].c}`);

        const [matriculas] = await connection.query('SELECT COUNT(*) as c FROM tb_matriculas');
        console.log(`TB_MATRICULAS: ${matriculas[0].c}`);

        // Check if matriculas link alumnos and apoderados
        if (matriculas[0].c === 0 && alumnos[0].c > 0) {
            console.log('ALERTA: Hay alumnos creados, pero NO están matriculados (tb_matriculas está vacía).');
            console.log('El chat busca en tb_matriculas para saber quién está en qué curso.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

checkTotalData();
