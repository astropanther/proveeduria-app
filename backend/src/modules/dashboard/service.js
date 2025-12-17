/**
 * Dashboard service
 * PB-22: Dashboard de Resumen de Solicitudes
 */

import { query } from '../../db/connection.js';
import { loadEnv } from '../../config/env.js';

const env = loadEnv();
const USE_DB = env.USE_DATABASE === true;

/**
 * Obtiene resumen de solicitudes para el dashboard
 */
export async function obtenerResumenSolicitudes() {
  if (!USE_DB) {
    return {
      total: 0,
      pendientes: 0,
      aprobadas: 0,
      rechazadas: 0,
      anuladas: 0,
      montoTotal: 0,
      montoPendiente: 0,
      montoAprobado: 0,
    };
  }

  try {
    const sql = `
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN estado = 'Pendiente' THEN 1 ELSE 0 END) AS pendientes,
        SUM(CASE WHEN estado = 'Aprobada' THEN 1 ELSE 0 END) AS aprobadas,
        SUM(CASE WHEN estado = 'Rechazada' THEN 1 ELSE 0 END) AS rechazadas,
        SUM(CASE WHEN estado = 'Anulada' THEN 1 ELSE 0 END) AS anuladas,
        SUM(monto) AS montoTotal,
        SUM(CASE WHEN estado = 'Pendiente' THEN monto ELSE 0 END) AS montoPendiente,
        SUM(CASE WHEN estado = 'Aprobada' THEN monto ELSE 0 END) AS montoAprobado
      FROM solicitudes
    `;

    const result = await query(sql, {});
    const data = result.recordset[0] || {};

    return {
      total: parseInt(data.total) || 0,
      pendientes: parseInt(data.pendientes) || 0,
      aprobadas: parseInt(data.aprobadas) || 0,
      rechazadas: parseInt(data.rechazadas) || 0,
      anuladas: parseInt(data.anuladas) || 0,
      montoTotal: parseFloat(data.montoTotal) || 0,
      montoPendiente: parseFloat(data.montoPendiente) || 0,
      montoAprobado: parseFloat(data.montoAprobado) || 0,
    };
  } catch (error) {
    console.error('Error al obtener resumen de solicitudes:', error);
    throw error;
  }
}

/**
 * Obtiene estadísticas por mes
 */
export async function obtenerEstadisticasPorMes() {
  if (!USE_DB) {
    return [];
  }

  try {
    const sql = `
      SELECT 
        DATENAME(MONTH, fecha_creacion) AS mes,
        MONTH(fecha_creacion) AS mesNumero,
        COUNT(*) AS total,
        SUM(CASE WHEN estado = 'Aprobada' THEN 1 ELSE 0 END) AS aprobadas,
        SUM(CASE WHEN estado = 'Rechazada' THEN 1 ELSE 0 END) AS rechazadas
      FROM solicitudes
      WHERE fecha_creacion >= DATEADD(MONTH, -6, GETDATE())
      GROUP BY DATENAME(MONTH, fecha_creacion), MONTH(fecha_creacion)
      ORDER BY mesNumero
    `;

    const result = await query(sql, {});
    const meses = {
      'enero': 'ENE', 'febrero': 'FEB', 'marzo': 'MAR', 'abril': 'ABR',
      'mayo': 'MAY', 'junio': 'JUN', 'julio': 'JUL', 'agosto': 'AGO',
      'septiembre': 'SEP', 'octubre': 'OCT', 'noviembre': 'NOV', 'diciembre': 'DIC'
    };
    
    return result.recordset.map(row => ({
      mes: meses[row.mes?.toLowerCase()] || row.mes?.substring(0, 3).toUpperCase() || 'N/A',
      total: parseInt(row.total) || 0,
      aprobadas: parseInt(row.aprobadas) || 0,
      rechazadas: parseInt(row.rechazadas) || 0,
    }));
  } catch (error) {
    console.error('Error al obtener estadísticas por mes:', error);
    return [];
  }
}

/**
 * Obtiene solicitudes recientes
 */
export async function obtenerSolicitudesRecientes(limite = 5) {
  if (!USE_DB) {
    return [];
  }

  try {
    const sql = `
      SELECT TOP (@limite)
        s.id,
        s.numero,
        s.monto,
        s.fecha_creacion,
        s.estado,
        u.nombre AS usuario
      FROM solicitudes s
      INNER JOIN users u ON s.usuario_id = u.id
      ORDER BY s.fecha_creacion DESC
    `;

    const result = await query(sql, { limite });
    return result.recordset.map(row => {
      // Formatear fecha usando fecha_creacion (fecha real de creación)
      let fechaFormateada = '';
      if (row.fecha_creacion) {
        const fecha = new Date(row.fecha_creacion);
        // Usar fecha local sin conversión de zona horaria
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        fechaFormateada = `${year}-${month}-${day}`;
      }
      
      return {
        id: row.id ? row.id.toString() : row.numero,
        usuario: row.usuario || 'N/A',
        monto: `$${parseFloat(row.monto || 0).toLocaleString('es-ES')}`,
        fecha: fechaFormateada,
        estado: (row.estado || '').toLowerCase(),
      };
    });
  } catch (error) {
    console.error('Error al obtener solicitudes recientes:', error);
    return [];
  }
}

/**
 * Obtiene estadísticas de usuarios
 */
export async function obtenerEstadisticasUsuarios() {
  if (!USE_DB) {
    return {
      total: 0,
      activos: 0,
    };
  }

  try {
    const sql = `
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) AS activos
      FROM users
    `;

    const result = await query(sql, {});
    const data = result.recordset[0] || {};

    return {
      total: parseInt(data.total) || 0,
      activos: parseInt(data.activos) || 0,
    };
  } catch (error) {
    console.error('Error al obtener estadísticas de usuarios:', error);
    return { total: 0, activos: 0 };
  }
}

