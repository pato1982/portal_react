import mysql from 'mysql2/promise';

async function testConnection() {
  console.log('Conectando a la base de datos...\n');

  try {
    const connection = await mysql.createConnection({
      host: '170.239.87.97',
      port: 3306,
      user: 'portal_user',
      password: 'Portal@DB2024',
      database: 'portal_estudiantil'
    });

    console.log('✓ Conexión exitosa!\n');

    const [rows] = await connection.execute('SHOW TABLES');
    console.log('Tablas en la base de datos:');
    console.log('─'.repeat(40));

    if (rows.length === 0) {
      console.log('(No hay tablas en la base de datos)');
    } else {
      rows.forEach((row, i) => {
        console.log(`${(i+1).toString().padStart(2)}. ${Object.values(row)[0]}`);
      });
    }

    console.log('─'.repeat(40));
    console.log(`Total: ${rows.length} tablas\n`);

    await connection.end();
  } catch (err) {
    console.error('✗ Error de conexión:', err.message);
  }
}

testConnection();
