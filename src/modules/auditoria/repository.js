/**
 * Auditoría repository
 * PB-15: Registro de Actividades del Sistema
 */

import { query } from '../../db/connection.js';
import { loadEnv } from '../../config/env.js';
import * as auditoriaData from './auditoriaData.js';

const env = loadEnv();
const USE_DB = env.USE_DATABASE === true;

export async function addActividad(actividad) {
  if (!USE_DB) {
    return auditoriaData.addActividad(actividad);
  }

  try {
    const sql = `
      INSERT INTO auditoria (usuario_id, accion, entidad, entidad_id, detalles, fecha)
      VALUES (@usuarioId, @accion, @entidad, @entidadId, @detalles, GETDATE())
    `;

    const params = {
      usuarioId: parseInt(actividad.usuarioId),
      accion: actividad.accion,
      entidad: actividad.entidad,
      entidadId: actividad.entidadId ? parseInt(actividad.entidadId) : null,
      detalles: actividad.detalles || null,
    };

    await query(sql, params);
    
    // Obtener la actividad recién creada usando el último ID
    const result = await query(
      `SELECT TOP 1 * FROM auditoria 
       WHERE usuario_id = @usuarioId 
       AND accion = @accion 
       AND entidad = @entidad
       ORDER BY fecha DESC`,
      {
        usuarioId: parseInt(actividad.usuarioId),
        accion: actividad.accion,
        entidad: actividad.entidad,
      }
    );
    
    return result.recordset[0] || null;
  } catch (error) {
    console.error('Error al registrar actividad:', error);
    throw error;
  }
}

export async function getAllActividades(filtros = {}) {
  if (!USE_DB) {
    return auditoriaData.getAllActividades();
  }

  try {
    let sql = `SELECT * FROM auditoria WHERE 1=1`;
    const params = {};

    if (filtros.usuarioId) {
      sql += ` AND usuario_id = @usuarioId`;
      params.usuarioId = parseInt(filtros.usuarioId);
    }

    if (filtros.entidad) {
      sql += ` AND entidad = @entidad`;
      params.entidad = filtros.entidad;
    }

    if (filtros.accion) {
      sql += ` AND accion = @accion`;
      params.accion = filtros.accion;
    }

    sql += ` ORDER BY fecha DESC`;

    const result = await query(sql, params);
    return result.recordset;
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    throw error;
  }
}

