/**
 * Notificaciones repository
 * PB-13: Operaciones con base de datos para notificaciones persistentes
 */

import { query } from '../../db/connection.js';
import { loadEnv } from '../../config/env.js';

const env = loadEnv();
const USE_DB = env.USE_DATABASE === true;

/**
 * Crear una notificación
 */
export async function createNotificacion(notificacionData) {
  if (!USE_DB) {
    // En modo sin BD, solo retornar un objeto simulado
    return {
      id: Date.now(),
      ...notificacionData,
      fecha_creacion: new Date().toISOString(),
    };
  }

  try {
    const sql = `
      INSERT INTO notificaciones (
        usuario_id, tipo, evento, titulo, mensaje, leida, solicitud_id, detalles
      )
      VALUES (
        @usuarioId, @tipo, @evento, @titulo, @mensaje, 0, @solicitudId, @detalles
      );
      SELECT SCOPE_IDENTITY() AS id;
    `;

    const params = {
      usuarioId: parseInt(notificacionData.usuarioId),
      tipo: notificacionData.tipo || 'comprador',
      evento: notificacionData.evento,
      titulo: notificacionData.titulo,
      mensaje: notificacionData.mensaje,
      solicitudId: notificacionData.solicitudId ? parseInt(notificacionData.solicitudId) : null,
      detalles: notificacionData.detalles ? JSON.stringify(notificacionData.detalles) : null,
    };

    const result = await query(sql, params);
    const newId = result.recordset[0]?.id;

    if (!newId) {
      throw new Error('No se pudo crear la notificación');
    }

    // Obtener la notificación completa
    return await getNotificacionById(newId);
  } catch (error) {
    console.error('Error al crear notificación:', error);
    throw error;
  }
}

/**
 * Obtener notificaciones por usuario
 */
export async function getNotificacionesByUsuario(usuarioId, filters = {}) {
  if (!USE_DB) {
    console.log('[NOTIFICACIONES REPO] USE_DB está deshabilitado, retornando array vacío');
    return [];
  }

  try {
    if (!usuarioId) {
      console.error('[NOTIFICACIONES REPO] ERROR: usuarioId no proporcionado');
      return [];
    }

    const userIdInt = parseInt(usuarioId);
    if (isNaN(userIdInt)) {
      console.error(`[NOTIFICACIONES REPO] ERROR: usuarioId no es un número válido: ${usuarioId}`);
      return [];
    }

    console.log(`[NOTIFICACIONES REPO] Buscando notificaciones para usuarioId: ${userIdInt}, filtros:`, JSON.stringify(filters, null, 2));

    // Primero verificar si el usuario existe
    const userCheck = await query(`SELECT id, email, role FROM users WHERE id = @usuarioId`, { usuarioId: userIdInt });
    if (userCheck.recordset.length === 0) {
      console.warn(`[NOTIFICACIONES REPO] Usuario con ID ${userIdInt} no existe en la BD`);
      return [];
    }
    console.log(`[NOTIFICACIONES REPO] Usuario encontrado:`, userCheck.recordset[0]);

    let sql = `
      SELECT 
        n.*,
        s.numero AS solicitud_numero,
        s.estado AS solicitud_estado
      FROM notificaciones n
      LEFT JOIN solicitudes s ON n.solicitud_id = s.id
      WHERE n.usuario_id = @usuarioId
    `;
    const params = { usuarioId: userIdInt };

    if (filters.leida !== undefined) {
      sql += ` AND n.leida = @leida`;
      params.leida = filters.leida ? 1 : 0;
    }

    if (filters.tipo) {
      sql += ` AND n.tipo = @tipo`;
      params.tipo = filters.tipo;
    }

    if (filters.evento) {
      sql += ` AND n.evento = @evento`;
      params.evento = filters.evento;
    }

    sql += ` ORDER BY n.fecha_creacion DESC`;

    if (filters.limite) {
      sql = `SELECT TOP (@limite) * FROM (${sql}) AS subquery`;
      params.limite = parseInt(filters.limite);
    }

    console.log(`[NOTIFICACIONES REPO] SQL ejecutado:`, sql);
    console.log(`[NOTIFICACIONES REPO] Params:`, JSON.stringify(params, null, 2));

    const result = await query(sql, params);
    console.log(`[NOTIFICACIONES REPO] Resultado raw: ${result.recordset.length} filas`);
    
    const notificaciones = result.recordset.map(mapNotificacionFromDB);
    
    console.log(`[NOTIFICACIONES REPO] Notificaciones mapeadas: ${notificaciones.length}`);
    if (notificaciones.length > 0) {
      console.log(`[NOTIFICACIONES REPO] Primera notificación mapeada:`, JSON.stringify(notificaciones[0], null, 2));
    }
    
    return notificaciones;
  } catch (error) {
    console.error('[NOTIFICACIONES REPO] Error al obtener notificaciones:', error);
    console.error('[NOTIFICACIONES REPO] Stack:', error.stack);
    throw error;
  }
}

/**
 * Obtener notificación por ID
 */
export async function getNotificacionById(id) {
  if (!USE_DB) {
    return null;
  }

  try {
    const sql = `
      SELECT 
        n.*,
        s.numero AS solicitud_numero,
        s.estado AS solicitud_estado
      FROM notificaciones n
      LEFT JOIN solicitudes s ON n.solicitud_id = s.id
      WHERE n.id = @id
    `;
    const result = await query(sql, { id: parseInt(id) });
    
    if (result.recordset.length === 0) {
      return null;
    }
    
    return mapNotificacionFromDB(result.recordset[0]);
  } catch (error) {
    console.error('Error al obtener notificación:', error);
    throw error;
  }
}

/**
 * Marcar notificación como leída
 */
export async function marcarComoLeida(id) {
  if (!USE_DB) {
    return { id, leida: true };
  }

  try {
    const sql = `
      UPDATE notificaciones
      SET leida = 1
      WHERE id = @id
    `;
    await query(sql, { id: parseInt(id) });
    return await getNotificacionById(id);
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    throw error;
  }
}

/**
 * Marcar todas las notificaciones de un usuario como leídas
 */
export async function marcarTodasComoLeidas(usuarioId) {
  if (!USE_DB) {
    return { count: 0 };
  }

  try {
    const sql = `
      UPDATE notificaciones
      SET leida = 1
      WHERE usuario_id = @usuarioId AND leida = 0
    `;
    const result = await query(sql, { usuarioId: parseInt(usuarioId) });
    return { count: result.rowsAffected?.[0] || 0 };
  } catch (error) {
    console.error('Error al marcar todas como leídas:', error);
    throw error;
  }
}

/**
 * Contar notificaciones no leídas
 */
export async function contarNoLeidas(usuarioId) {
  if (!USE_DB) {
    return 0;
  }

  try {
    const sql = `
      SELECT COUNT(*) AS count
      FROM notificaciones
      WHERE usuario_id = @usuarioId AND leida = 0
    `;
    const result = await query(sql, { usuarioId: parseInt(usuarioId) });
    return parseInt(result.recordset[0]?.count || 0);
  } catch (error) {
    console.error('Error al contar no leídas:', error);
    return 0;
  }
}

/**
 * Mapear notificación de la base de datos
 */
function mapNotificacionFromDB(row) {
  let detalles = null;
  if (row.detalles) {
    try {
      detalles = JSON.parse(row.detalles);
    } catch (error) {
      console.error('Error al parsear detalles de notificación:', error);
    }
  }

  return {
    id: row.id,
    usuarioId: row.usuario_id,
    tipo: row.tipo,
    evento: row.evento,
    titulo: row.titulo,
    mensaje: row.mensaje,
    leida: row.leida === 1 || row.leida === true,
    solicitudId: row.solicitud_id,
    solicitudNumero: row.solicitud_numero,
    solicitudEstado: row.solicitud_estado,
    detalles: detalles,
    fechaCreacion: row.fecha_creacion ? new Date(row.fecha_creacion).toISOString() : new Date().toISOString(),
  };
}

