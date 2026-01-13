/**
 * Script para crear usuarios de prueba
 * Ejecutar: node scripts/crear-usuario-prueba.js
 */

const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function crearUsuariosPrueba() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    console.log('Conectado a la base de datos...\n');

    try {
        // Contraseñas de prueba (hasheadas)
        const passwordAdmin = await bcrypt.hash('Admin123', 10);
        const passwordDocente = await bcrypt.hash('Docente123', 10);
        const passwordApoderado = await bcrypt.hash('Apoderado123', 10);

        // 1. Crear usuario administrador
        console.log('Creando usuario administrador...');
        const [existeAdmin] = await connection.query(
            'SELECT id FROM tb_usuarios WHERE email = ?',
            ['admin@colegio.cl']
        );

        let adminUsuarioId;
        if (existeAdmin.length === 0) {
            const [resultAdmin] = await connection.query(`
                INSERT INTO tb_usuarios (email, password_hash, tipo_usuario, activo, email_verificado)
                VALUES (?, ?, 'administrador', 1, 1)
            `, ['admin@colegio.cl', passwordAdmin]);
            adminUsuarioId = resultAdmin.insertId;
            console.log('   ✓ Usuario admin creado con ID:', adminUsuarioId);
        } else {
            adminUsuarioId = existeAdmin[0].id;
            // Actualizar password
            await connection.query(
                'UPDATE tb_usuarios SET password_hash = ? WHERE id = ?',
                [passwordAdmin, adminUsuarioId]
            );
            console.log('   ✓ Usuario admin ya existe, password actualizado');
        }

        // Crear registro en tb_administradores si no existe
        const [existeAdminReg] = await connection.query(
            'SELECT id FROM tb_administradores WHERE usuario_id = ?',
            [adminUsuarioId]
        );

        let adminId;
        if (existeAdminReg.length === 0) {
            const [resultAdminReg] = await connection.query(`
                INSERT INTO tb_administradores (usuario_id, rut, nombres, apellidos, telefono, activo)
                VALUES (?, '11111111-1', 'Administrador', 'Sistema', '+56912345678', 1)
            `, [adminUsuarioId]);
            adminId = resultAdminReg.insertId;
            console.log('   ✓ Registro administrador creado');
        } else {
            adminId = existeAdminReg[0].id;
            console.log('   ✓ Registro administrador ya existe');
        }

        // Verificar si existe establecimiento
        const [establecimientos] = await connection.query('SELECT id, nombre FROM tb_establecimientos LIMIT 1');
        let establecimientoId = 1;

        if (establecimientos.length === 0) {
            console.log('\n   Creando establecimiento de prueba...');
            const [resultEst] = await connection.query(`
                INSERT INTO tb_establecimientos (nombre, rbd, direccion, ciudad, region, telefono, email, activo)
                VALUES ('Colegio Demo', '12345-6', 'Av. Principal 123', 'Santiago', 'Metropolitana', '+56223456789', 'contacto@colegio.cl', 1)
            `);
            establecimientoId = resultEst.insertId;
            console.log('   ✓ Establecimiento creado con ID:', establecimientoId);
        } else {
            establecimientoId = establecimientos[0].id;
            console.log('   ✓ Usando establecimiento existente:', establecimientos[0].nombre);
        }

        // Asociar admin al establecimiento
        const [existeAdminEst] = await connection.query(
            'SELECT id FROM tb_administrador_establecimiento WHERE administrador_id = ? AND establecimiento_id = ?',
            [adminId, establecimientoId]
        );

        if (existeAdminEst.length === 0) {
            await connection.query(`
                INSERT INTO tb_administrador_establecimiento (administrador_id, establecimiento_id, es_principal, cargo, fecha_asignacion, activo)
                VALUES (?, ?, 1, 'Super Administrador', CURDATE(), 1)
            `, [adminId, establecimientoId]);
            console.log('   ✓ Admin asociado al establecimiento');
        }

        // 2. Crear usuario docente
        console.log('\nCreando usuario docente...');
        const [existeDocente] = await connection.query(
            'SELECT id FROM tb_usuarios WHERE email = ?',
            ['docente@colegio.cl']
        );

        let docenteUsuarioId;
        if (existeDocente.length === 0) {
            const [resultDocente] = await connection.query(`
                INSERT INTO tb_usuarios (email, password_hash, tipo_usuario, activo, email_verificado)
                VALUES (?, ?, 'docente', 1, 1)
            `, ['docente@colegio.cl', passwordDocente]);
            docenteUsuarioId = resultDocente.insertId;
            console.log('   ✓ Usuario docente creado con ID:', docenteUsuarioId);
        } else {
            docenteUsuarioId = existeDocente[0].id;
            await connection.query(
                'UPDATE tb_usuarios SET password_hash = ? WHERE id = ?',
                [passwordDocente, docenteUsuarioId]
            );
            console.log('   ✓ Usuario docente ya existe, password actualizado');
        }

        // Crear registro en tb_docentes si no existe
        const [existeDocenteReg] = await connection.query(
            'SELECT id FROM tb_docentes WHERE usuario_id = ?',
            [docenteUsuarioId]
        );

        let docenteId;
        if (existeDocenteReg.length === 0) {
            const [resultDocenteReg] = await connection.query(`
                INSERT INTO tb_docentes (usuario_id, rut, nombres, apellidos, telefono, activo)
                VALUES (?, '22222222-2', 'María', 'González', '+56987654321', 1)
            `, [docenteUsuarioId]);
            docenteId = resultDocenteReg.insertId;
            console.log('   ✓ Registro docente creado');
        } else {
            docenteId = existeDocenteReg[0].id;
            console.log('   ✓ Registro docente ya existe');
        }

        // Asociar docente al establecimiento
        const [existeDocenteEst] = await connection.query(
            'SELECT id FROM tb_docente_establecimiento WHERE docente_id = ? AND establecimiento_id = ?',
            [docenteId, establecimientoId]
        );

        if (existeDocenteEst.length === 0) {
            await connection.query(`
                INSERT INTO tb_docente_establecimiento (docente_id, establecimiento_id, fecha_ingreso, activo)
                VALUES (?, ?, CURDATE(), 1)
            `, [docenteId, establecimientoId]);
            console.log('   ✓ Docente asociado al establecimiento');
        }

        // 3. Crear usuario apoderado
        console.log('\nCreando usuario apoderado...');
        const [existeApoderado] = await connection.query(
            'SELECT id FROM tb_usuarios WHERE email = ?',
            ['apoderado@colegio.cl']
        );

        let apoderadoUsuarioId;
        if (existeApoderado.length === 0) {
            const [resultApoderado] = await connection.query(`
                INSERT INTO tb_usuarios (email, password_hash, tipo_usuario, activo, email_verificado)
                VALUES (?, ?, 'apoderado', 1, 1)
            `, ['apoderado@colegio.cl', passwordApoderado]);
            apoderadoUsuarioId = resultApoderado.insertId;
            console.log('   ✓ Usuario apoderado creado con ID:', apoderadoUsuarioId);
        } else {
            apoderadoUsuarioId = existeApoderado[0].id;
            await connection.query(
                'UPDATE tb_usuarios SET password_hash = ? WHERE id = ?',
                [passwordApoderado, apoderadoUsuarioId]
            );
            console.log('   ✓ Usuario apoderado ya existe, password actualizado');
        }

        // Crear registro en tb_apoderados si no existe
        const [existeApoderadoReg] = await connection.query(
            'SELECT id FROM tb_apoderados WHERE usuario_id = ?',
            [apoderadoUsuarioId]
        );

        if (existeApoderadoReg.length === 0) {
            await connection.query(`
                INSERT INTO tb_apoderados (usuario_id, rut, nombres, apellidos, telefono, activo)
                VALUES (?, '33333333-3', 'Juan', 'Pérez', '+56911111111', 1)
            `, [apoderadoUsuarioId]);
            console.log('   ✓ Registro apoderado creado');
        } else {
            console.log('   ✓ Registro apoderado ya existe');
        }

        console.log('\n========================================');
        console.log('USUARIOS DE PRUEBA CREADOS EXITOSAMENTE');
        console.log('========================================');
        console.log('\nCredenciales para login:');
        console.log('┌─────────────┬─────────────────────┬──────────────┐');
        console.log('│ Tipo        │ Email               │ Contraseña   │');
        console.log('├─────────────┼─────────────────────┼──────────────┤');
        console.log('│ admin       │ admin@colegio.cl    │ Admin123     │');
        console.log('│ docente     │ docente@colegio.cl  │ Docente123   │');
        console.log('│ apoderado   │ apoderado@colegio.cl│ Apoderado123 │');
        console.log('└─────────────┴─────────────────────┴──────────────┘');

    } catch (error) {
        console.error('Error:', error.message);
        if (error.code === 'ER_NO_SUCH_TABLE') {
            console.log('\n⚠️  Las tablas no existen en la base de datos.');
            console.log('   Primero debes ejecutar el archivo estructuras_tb.sql');
        }
    } finally {
        await connection.end();
    }
}

crearUsuariosPrueba();
