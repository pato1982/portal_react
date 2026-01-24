const mysql = require('mysql2/promise');

async function vincularDocentes() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: '170.239.87.97',
            user: 'root',
            password: 'EXwCVq87aj0F3f1',
            database: 'portal_estudiantil',
            port: 3306
        });

        console.log('--- VINCULANDO DOCENTES A CURSOS Y ASIGNATURAS ---');

        const estId = 1;
        const anioAcademico = 2026;

        // 1. Obtener todos los cursos
        const [cursos] = await connection.execute('SELECT id, nombre, nivel FROM tb_cursos WHERE establecimiento_id = ?', [estId]);

        // 2. Obtener todas las asignaturas
        const [asignaturas] = await connection.execute('SELECT id, nombre, nivel FROM tb_asignaturas WHERE establecimiento_id = ?', [estId]);

        // 3. Obtener todos los docentes
        const [docentes] = await connection.execute('SELECT id, nombres, apellidos, email FROM tb_docentes');

        // Mapeo de docentes por especialidad (basado en el email para mayor precisión)
        const docenteMap = {};
        docentes.forEach(d => {
            if (d.email === 'mjvalderramap@gmail.com') docenteMap['MAT_FIS'] = d.id;
            if (d.email === 'abello@demo.cl') docenteMap['LEN'] = d.id;
            if (d.email === 'cbravo@demo.cl') docenteMap['EFI'] = d.id;
            if (d.email === 'gmistral@demo.cl') docenteMap['HIS'] = d.id;
            if (d.email === 'pneruda@demo.cl') docenteMap['ART_MUS'] = d.id;
            if (d.email === 'vparra@demo.cl') docenteMap['CIE_QUI'] = d.id;
        });

        console.log('Realizando asignaciones masivas...');

        for (const curso of cursos) {
            for (const asig of asignaturas) {
                let docenteAsignadoId = null;

                // Lógica de asignación por nombre de asignatura
                const nom = asig.nombre.toLowerCase();

                if (nom.includes('matemática') || nom.includes('física')) {
                    docenteAsignadoId = docenteMap['MAT_FIS'];
                } else if (nom.includes('lenguaje')) {
                    docenteAsignadoId = docenteMap['LEN'];
                } else if (nom.includes('historia')) {
                    docenteAsignadoId = docenteMap['HIS'];
                } else if (nom.includes('educación física')) {
                    docenteAsignadoId = docenteMap['EFI'];
                } else if (nom.includes('artes') || nom.includes('música')) {
                    docenteAsignadoId = docenteMap['ART_MUS'];
                } else if (nom.includes('ciencias') || nom.includes('química') || nom.includes('biología')) {
                    docenteAsignadoId = docenteMap['CIE_QUI'];
                } else {
                    // Para asignaturas como Inglés, Religión, etc., repartimos carga o asignamos al azar de los disponibles
                    docenteAsignadoId = docenteMap['LEN']; // Asignación temporal por defecto para completar el set
                }

                if (docenteAsignadoId) {
                    await connection.execute(
                        `INSERT INTO tb_asignaciones (
                            establecimiento_id, docente_id, curso_id, asignatura_id, 
                            anio_academico, horas_asignadas, es_titular, activo
                        ) VALUES (?, ?, ?, ?, ?, 4, 1, 1)`,
                        [estId, docenteAsignadoId, curso.id, asig.id, anioAcademico]
                    );
                }
            }
            console.log(`✅ Asignaturas vinculadas para el curso: ${curso.nombre}`);
        }

        // 4. Asignar Jefatura (María José Valderrama será profe jefe de 1ero Medio)
        const curso1Medio = cursos.find(c => c.nombre === '1ero Medio A');
        if (curso1Medio && docenteMap['MAT_FIS']) {
            await connection.execute(
                'UPDATE tb_docente_establecimiento SET es_profesor_jefe = 1, curso_jefatura_id = ? WHERE docente_id = ?',
                [curso1Medio.id, docenteMap['MAT_FIS']]
            );
            console.log(`🌟 Jefatura asignada: María José Valderrama -> ${curso1Medio.nombre}`);
        }

        console.log('\n=============================================');
        console.log('¡VINCULACIÓN COMPLETADA!');
        console.log(`Se han creado el total de asignaciones para los 12 cursos.`);
        console.log('Los docentes ya pueden ver sus libros de clases.');
        console.log('=============================================');

    } catch (error) {
        console.error('❌ ERROR AL VINCULAR:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

vincularDocentes();
