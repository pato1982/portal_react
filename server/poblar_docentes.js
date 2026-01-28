require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Configuración
const ESTABLECIMIENTO_ID = 1;
const ANIO = 2026;
const PASSWORD_MJ = 'Pmmj8282.';
const PASSWORD_GENERICO = 'Colegio2026';

// Datos Maestros
const ASIGNATURAS = [
    { nombre: 'Matemáticas', codigo: 'MAT' },
    { nombre: 'Lenguaje y Comunicación', codigo: 'LEN' },
    { nombre: 'Historia y Geografía', codigo: 'HIS' },
    { nombre: 'Ciencias Naturales', codigo: 'CIE' },
    { nombre: 'Inglés', codigo: 'ING' },
    { nombre: 'Artes Visuales', codigo: 'ART' },
    { nombre: 'Música', codigo: 'MUS' },
    { nombre: 'Educación Física', codigo: 'EFI' },
    { nombre: 'Tecnología', codigo: 'TEC' },
    { nombre: 'Orientación', codigo: 'ORI' }
];

const DOCENTES = [
    {
        rut: '15.555.555-5',
        nombres: 'Esteban',
        apellidos: 'Dido',
        email: 'esteban.dido@demo.cl',
        especialidad: 'Ciencias e Historia'
    },
    {
        rut: '16.666.666-6',
        nombres: 'Elba',
        apellidos: 'Lazo',
        email: 'elba.lazo@demo.cl',
        especialidad: 'Inglés y Artes'
    },
    {
        rut: '17.777.777-7',
        nombres: 'Armando',
        apellidos: 'Casas',
        email: 'armando.casas@demo.cl',
        especialidad: 'Deportes y Tecnología'
    },
    {
        rut: '18.888.888-8',
        nombres: 'Susana',
        apellidos: 'Oria',
        email: 'susana.oria@demo.cl',
        especialidad: 'Polivalente Media'
    }
];

// La estrella del show
const DOCENTE_PRINCIPAL = {
    rut: '12.345.678-9', // RUT Ficticio si no lo tienes
    nombres: 'Maria Jose',
    apellidos: 'Valderrama P.',
    email: 'mjvalderramap@gmail.com',
    especialidad: 'Matemáticas y Lenguaje'
};

async function poblarDocentes() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('🚀 INICIANDO POBLADO DE DOCENTES Y CARGA ACADÉMICA...');

        // 1. Crear Asignaturas
        console.log('📚 Creando Asignaturas...');
        const mapAsignaturas = {}; // nombre -> id
        for (const asig of ASIGNATURAS) {
            const [result] = await connection.query(`
                INSERT INTO tb_asignaturas (establecimiento_id, nombre, codigo, activo)
                VALUES (?, ?, ?, 1)
            `, [ESTABLECIMIENTO_ID, asig.nombre, asig.codigo]);
            mapAsignaturas[asig.nombre] = result.insertId;
        }

        // 2. Crear Usuario y Docente Principal (MJ)
        console.log('👩‍🏫 Creando Docente Principal: Maria Jose...');
        const hashMJ = await bcrypt.hash(PASSWORD_MJ, 10);

        const [userMJ] = await connection.query(`
            INSERT INTO tb_usuarios (email, password_hash, tipo_usuario, activo)
            VALUES (?, ?, 'docente', 1)
        `, [DOCENTE_PRINCIPAL.email, hashMJ]);

        const [docMJ] = await connection.query(`
            INSERT INTO tb_docentes (usuario_id, rut, nombres, apellidos, email, telefono, activo)
            VALUES (?, ?, ?, ?, ?, '+56900000000', 1)
        `, [userMJ.insertId, DOCENTE_PRINCIPAL.rut, DOCENTE_PRINCIPAL.nombres, DOCENTE_PRINCIPAL.apellidos, DOCENTE_PRINCIPAL.email]);

        const idDocenteMJ = docMJ.insertId;

        // 3. Crear Docentes de Relleno
        console.log('👥 Creando Colegas...');
        const hashGen = await bcrypt.hash(PASSWORD_GENERICO, 10);
        const idsDocentesRelleno = [];

        for (const doc of DOCENTES) {
            const [user] = await connection.query(`
                INSERT INTO tb_usuarios (email, password_hash, tipo_usuario, activo)
                VALUES (?, ?, 'docente', 1)
            `, [doc.email, hashGen]);

            const [d] = await connection.query(`
                INSERT INTO tb_docentes (usuario_id, rut, nombres, apellidos, email, telefono, activo)
                VALUES (?, ?, ?, ?, ?, '+56900000111', 1)
            `, [user.insertId, doc.rut, doc.nombres, doc.apellidos, doc.email]);

            idsDocentesRelleno.push(d.insertId);
        }

        const todosLosDocentesIds = [idDocenteMJ, ...idsDocentesRelleno];

        // 4. Vincular Docentes a Establecimiento
        for (const id of todosLosDocentesIds) {
            await connection.query(`
                INSERT INTO tb_docente_establecimiento (docente_id, establecimiento_id, fecha_ingreso, activo)
                VALUES (?, ?, CURDATE(), 1)
            `, [id, ESTABLECIMIENTO_ID]);
        }

        // 5. Asignar Especialidades (Asignaturas que PUEDEN dictar)
        // MJ dicta Mate, Lenguaje y Orientación
        const asigsMJ = ['Matemáticas', 'Lenguaje y Comunicación', 'Orientación'];
        for (const nom of asigsMJ) {
            await connection.query(`INSERT INTO tb_docente_asignatura (docente_id, asignatura_id, activo) VALUES (?, ?, 1)`, [idDocenteMJ, mapAsignaturas[nom]]);
        }
        // Otros profes dictan el resto... (simplificado: todos pueden todo para asegurar cobertura)
        for (const id of idsDocentesRelleno) {
            for (const nom of Object.keys(mapAsignaturas)) {
                if (!asigsMJ.includes(nom)) {
                    await connection.query(`INSERT INTO tb_docente_asignatura (docente_id, asignatura_id, activo) VALUES (?, ?, 1)`, [id, mapAsignaturas[nom]]);
                }
            }
        }

        // 6. ASIGNACIONES DE CLASES (La parte clave)
        console.log('📅 Asignando Cursos...');

        // Obtener cursos creados
        const [cursos] = await connection.query('SELECT id, nombre, nivel FROM tb_cursos WHERE establecimiento_id = ?', [ESTABLECIMIENTO_ID]);

        for (const curso of cursos) {
            // Asignar Prof Jefatura (MJ en los A, otros en otros)
            // Asignar MATERIAS

            // MJ toma Matemáticas y Lenguaje en TODOS los cursos (trabajadora!)
            await asignar(connection, curso.id, mapAsignaturas['Matemáticas'], idDocenteMJ);
            await asignar(connection, curso.id, mapAsignaturas['Lenguaje y Comunicación'], idDocenteMJ);
            if (curso.nombre.includes('1ero Medio')) await asignar(connection, curso.id, mapAsignaturas['Orientación'], idDocenteMJ);

            // Repartir el resto
            let docenteIndex = 0;
            for (const nombreAsig of Object.keys(mapAsignaturas)) {
                if (['Matemáticas', 'Lenguaje y Comunicación', 'Orientación'].includes(nombreAsig)) continue;

                // Rotar profesores de relleno
                const docenteId = idsDocentesRelleno[docenteIndex % idsDocentesRelleno.length];
                await asignar(connection, curso.id, mapAsignaturas[nombreAsig], docenteId);
                docenteIndex++;
            }
        }

        console.log('\n✨ ¡ÉXITO TOTAL! Docentes creados y clases asignadas.');
        console.log(`🔑 Login MJ: ${DOCENTE_PRINCIPAL.email} / ${PASSWORD_MJ}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

async function asignar(conn, cursoId, asigId, docenteId) {
    if (!asigId) return;
    try {
        await conn.query(`
            INSERT INTO tb_asignaciones_profesor 
            (establecimiento_id, curso_id, asignatura_id, docente_id, anio_academico, activo)
            VALUES (?, ?, ?, ?, ?, 1)
        `, [ESTABLECIMIENTO_ID, cursoId, asigId, docenteId, ANIO]);
    } catch (e) {
        console.log('Error asignando:', e.message);
    }
}

poblarDocentes();
