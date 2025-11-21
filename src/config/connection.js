// src/config/connection.js
import sql from 'mssql';
import 'dotenv/config';

// Configuración de conexión usando las variables del .env
const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,     // DESKTOP-J9TK34C\SQLEXPRESS
  database: process.env.DB_DATABASE, // veterinaria
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

let pool = null;

// Esta función se usa para obtener (o crear) la conexión
export async function getConnection() {
  if (!pool) {
    pool = await sql.connect(sqlConfig);
    console.log('✅ Conectado a SQL Server');
  }
  return pool;
}