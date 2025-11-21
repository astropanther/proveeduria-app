/**
 * Database connection module
 * PB-20: Optimización y Normalización de la Base de Datos
 */

import sql from 'mssql';
import { loadEnv } from '../config/env.js';

const env = loadEnv();

let pool = null;

/**
 * Obtiene el pool de conexiones a SQL Server
 * @returns {Promise<sql.ConnectionPool>}
 */
export async function getPool() {
  if (pool && pool.connected) {
    return pool;
  }

  const config = {
    server: env.DB_SERVER,
    port: parseInt(env.DB_PORT),
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
    options: {
      encrypt: env.DB_ENCRYPT,
      trustServerCertificate: env.DB_TRUST_CERT,
      enableArithAbort: true,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  };

  try {
    pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('Conexion a la base de datos establecida');
    return pool;
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    throw error;
  }
}

/**
 * Cierra el pool de conexiones
 */
export async function closePool() {
  if (pool) {
    try {
      await pool.close();
      pool = null;
      console.log('Conexión a la base de datos cerrada');
    } catch (error) {
      console.error('Error al cerrar la conexión:', error);
    }
  }
}

/**
 * Ejecuta una consulta SQL
 * @param {string} queryString - Consulta SQL
 * @param {object} params - Parámetros de la consulta (opcional)
 * @returns {Promise<sql.IResult<any>>}
 */
export async function query(queryString, params = {}) {
  const pool = await getPool();
  const request = pool.request();

  // Agregar parámetros si existen
  Object.keys(params).forEach(key => {
    const value = params[key];
    // Determinar el tipo de dato automáticamente
    if (value === null || value === undefined) {
      request.input(key, sql.NVarChar, null);
    } else if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        request.input(key, sql.Int, value);
      } else {
        request.input(key, sql.Decimal(18, 2), value);
      }
    } else if (typeof value === 'boolean') {
      request.input(key, sql.Bit, value);
    } else {
      request.input(key, sql.NVarChar, value);
    }
  });

  try {
    const result = await request.query(queryString);
    return result;
  } catch (error) {
    console.error('Error al ejecutar query:', error);
    console.error('Query:', queryString);
    console.error('Params:', params);
    throw error;
  }
}

/**
 * Ejecuta un procedimiento almacenado
 * @param {string} procedureName - Nombre del procedimiento
 * @param {object} params - Parámetros del procedimiento
 * @returns {Promise<sql.IResult<any>>}
 */
export async function executeProcedure(procedureName, params = {}) {
  const pool = await getPool();
  const request = pool.request();

  // Agregar parámetros
  Object.keys(params).forEach(key => {
    request.input(key, params[key]);
  });

  try {
    const result = await request.execute(procedureName);
    return result;
  } catch (error) {
    console.error(`Error al ejecutar procedimiento ${procedureName}:`, error);
    throw error;
  }
}

/**
 * Verifica la conexión a la base de datos
 * @returns {Promise<boolean>}
 */
export async function testConnection() {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT 1 AS test');
    return result.recordset.length > 0;
  } catch (error) {
    console.error('Error al verificar conexión:', error);
    return false;
  }
}
