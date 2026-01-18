
import { createConnection } from 'mysql2/promise';

const config = {
    host: '170.239.87.97',
    user: 'root',
    password: 'EXwCVq87aj0F3f1',
    database: 'portal_estudiantil'
};

async function checkDataForApoderado() {
    let connection;
    try {
        connection = await createConnection(config);
        console.log('Conectado a BD.');

        // 1. Obtener un alumno existente
        const [alumnos] = await connection.query('SELECT id, nombres, apellidos, rut FROM tb_alumnos LIMIT 1');
        if (alumnos.length === 0) {
            console.log('No hay alumnos.');
            return;
        }
        const alumno = alumnos[0];
        console.log('Alumno elegido:', alumno);

        // 2. Obtener un curso existente
        const [cursos] = await connection.query('SELECT id, nombre, grado, letra FROM tb_cursos LIMIT 1');
        if (cursos.length === 0) {
            console.log('No hay cursos.');
            return;
        }
        const curso = cursos[0];
        console.log('Curso elegido:', curso);

        // 3. Revisar si hay notas
        const [notas] = await connection.query('SELECT COUNT(*) as c FROM tb_notas WHERE alumno_id = ?', [alumno.id]);
        console.log(`Notas del alumno: ${notas[0].c}`);

        // 4. Revisar si hay asistencia
        const [asistencia] = await connection.query('SELECT COUNT(*) as c FROM tb_asistencia WHERE alumno_id = ?', [alumno.id]);
        console.log(`Asistencia del alumno: ${asistencia[0].c}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

checkDataForApoderado();
