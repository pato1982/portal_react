require('dotenv').config();
const { pool } = require('./config/database');

async function limpiarBase() {
    console.log('🧹 INICIANDO LIMPIEZA DE BASE DE DATOS (MODO SEGURO)...');

    const connection = await pool.getConnection();
    try {
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        const tablas = [
            'tb_mensajes', 'tb_chat', // Por si acaso
            'tb_notas',
            'tb_asistencia',
            'tb_anotaciones',
            'tb_matriculas',
            'tb_alumnos',
            'tb_apoderados'
        ];

        for (const tabla of tablas) {
            try {
                await connection.query(`DELETE FROM ${tabla}`);
                console.log(`   ✅ Limpiada: ${tabla}`);
            } catch (e) {
                console.log(`   ⚠️  Saltada (No existe o error): ${tabla}`);
            }
        }

        // Usuarios (Preservando admin)
        try {
            await connection.query("DELETE FROM tb_usuarios WHERE email NOT LIKE '%patcorher%' AND rol != 'administrador' AND rol != 'docente'");
            console.log('   ✅ Limpieza de Usuarios completada.');
        } catch (e) { console.log('   ⚠️  Error limpiando usuarios:', e.message); }

        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('🏁 LIMPIEZA FINALIZADA.');
        process.exit(0);

    } catch (error) {
        console.error('❌ ERROR FATAL:', error);
        process.exit(1);
    } finally {
        connection.release();
    }
}
limpiarBase();
