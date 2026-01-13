/**
 * Script para probar el login
 */

const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testLogin() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    console.log('Verificando usuario admin@colegio.cl...\n');

    try {
        // Buscar usuario
        const [usuarios] = await connection.query(
            'SELECT * FROM tb_usuarios WHERE email = ?',
            ['admin@colegio.cl']
        );

        if (usuarios.length === 0) {
            console.log('❌ Usuario NO encontrado en tb_usuarios');
            return;
        }

        const usuario = usuarios[0];
        console.log('✓ Usuario encontrado:');
        console.log('  - ID:', usuario.id);
        console.log('  - Email:', usuario.email);
        console.log('  - Tipo:', usuario.tipo_usuario);
        console.log('  - Activo:', usuario.activo);
        console.log('  - Hash guardado:', usuario.password_hash.substring(0, 20) + '...');

        // Verificar contraseña
        const passwordValida = await bcrypt.compare('Admin123', usuario.password_hash);
        console.log('\n✓ Verificación de contraseña "Admin123":', passwordValida ? 'CORRECTA' : 'INCORRECTA');

        if (!passwordValida) {
            console.log('\n  Regenerando hash...');
            const nuevoHash = await bcrypt.hash('Admin123', 10);
            await connection.query(
                'UPDATE tb_usuarios SET password_hash = ? WHERE id = ?',
                [nuevoHash, usuario.id]
            );
            console.log('  ✓ Password actualizado. Intenta login de nuevo.');
        }

        // Verificar registro en tb_administradores
        const [admin] = await connection.query(
            'SELECT * FROM tb_administradores WHERE usuario_id = ?',
            [usuario.id]
        );

        if (admin.length === 0) {
            console.log('\n❌ No hay registro en tb_administradores');
        } else {
            console.log('\n✓ Registro en tb_administradores:');
            console.log('  - ID Admin:', admin[0].id);
            console.log('  - Nombres:', admin[0].nombres);
            console.log('  - Apellidos:', admin[0].apellidos);
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await connection.end();
    }
}

testLogin();
