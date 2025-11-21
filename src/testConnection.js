// src/testConnection.js
import { getConnection } from './config/connection.js';

async function main() {
  try {
    const pool = await getConnection();

    // Cambia la tabla si quieres probar otra
    const result = await pool
      .request()
      .query('SELECT TOP 2 * FROM propietario');

    console.log('✅ Resultado de la consulta:');
    console.log(result.recordset);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error al conectar o ejecutar consulta:', err);
    process.exit(1);
  }
}

main();