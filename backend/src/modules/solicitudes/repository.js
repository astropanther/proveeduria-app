/**
 * Solicitudes repository
 * PB-10, PB-11, PB-12: Operaciones con base de datos
 */

import { query } from '../../db/connection.js';
import { loadEnv } from '../../config/env.js';
import * as solicitudesData from './solicitudesData.js';

const env = loadEnv();
const USE_DB = env.USE_DATABASE === true;

/**
 * Obtener todas las solicitudes
 */
export async function getAllSolicitudes(filters = {}) {
  if (!USE_DB) {
    return solicitudesData.getAllSolicitudes();
  }

  try {
    let sqlQuery = `
      SELECT 
        s.*,
        u.nombre AS usuario,
        u.email AS usuario_email
      FROM solicitudes s
      INNER JOIN users u ON s.usuario_id = u.id
      WHERE 1=1
    `;
    const params = {};

    if (filters.estado) {
      sqlQuery += ` AND s.estado = @estado`;
      params.estado = filters.estado;
    }

    if (filters.usuarioId) {
      sqlQuery += ` AND s.usuario_id = @usuarioId`;
      params.usuarioId = parseInt(filters.usuarioId);
    }

    sqlQuery += ` ORDER BY s.fecha_creacion DESC`;

    const result = await query(sqlQuery, params);
    return result.recordset.map(mapSolicitudFromDB);
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    throw error;
  }
}

/**
 * Obtener solicitud por ID
 */
export async function getSolicitudById(id) {
  if (!USE_DB) {
    return solicitudesData.getSolicitudById(id);
  }

  try {
    const sqlQuery = `
      SELECT 
        s.*,
        u.nombre AS usuario,
        u.email AS usuario_email
      FROM solicitudes s
      INNER JOIN users u ON s.usuario_id = u.id
      WHERE s.id = @id
    `;
    const result = await query(sqlQuery, { id: parseInt(id) });
    
    if (result.recordset.length === 0) {
      return null;
    }
    
    return mapSolicitudFromDB(result.recordset[0]);
  } catch (error) {
    console.error('Error al obtener solicitud:', error);
    throw error;
  }
}

/**
 * Crear nueva solicitud
 */
export async function createSolicitud(solicitudData) {
  if (!USE_DB) {
    return solicitudesData.addSolicitud(solicitudData);
  }

  try {
    // Generar número de solicitud
    const year = new Date().getFullYear();
    const countResult = await query(
      `SELECT COUNT(*) AS count FROM solicitudes WHERE YEAR(fecha_creacion) = @year`,
      { year: year }
    );
    const count = countResult.recordset[0]?.count || 0;
    const numero = `SOL-${year}-${String(count + 1).padStart(3, '0')}`;

    const sqlQuery = `
      INSERT INTO solicitudes (
        numero, descripcion, usuario_id, monto, categoria, fecha,
        estado, prioridad, justificacion, fecha_creacion
      )
      VALUES (
        @numero, @descripcion, @usuarioId, @monto, @categoria, @fecha,
        @estado, @prioridad, @justificacion, GETDATE()
      );
      SELECT SCOPE_IDENTITY() AS id;
    `;

    const params = {
      numero: numero,
      descripcion: solicitudData.descripcion,
      usuarioId: parseInt(solicitudData.usuarioId),
      monto: parseFloat(solicitudData.monto),
      categoria: solicitudData.categoria,
      fecha: solicitudData.fecha || new Date().toISOString().split('T')[0],
      estado: 'Pendiente',
      prioridad: solicitudData.prioridad || 'media',
      justificacion: solicitudData.justificacion || null,
    };

    const result = await query(sqlQuery, params);
    const newId = result.recordset[0]?.id;
    
    if (!newId) {
      throw new Error('No se pudo obtener el ID de la solicitud creada');
    }
    
    // Obtener la solicitud completa usando el ID
    const createdResult = await query(
      `SELECT * FROM solicitudes WHERE id = @id`,
      { id: parseInt(newId) }
    );
    const created = createdResult.recordset[0];
    
    if (!created) {
      throw new Error('No se pudo crear la solicitud');
    }
    
    // Obtener datos del usuario para la respuesta
    const userResult = await query(
      `SELECT nombre, email FROM users WHERE id = @usuarioId`,
      { usuarioId: parseInt(solicitudData.usuarioId) }
    );
    const user = userResult.recordset[0];

    if (!user) {
      // Si no se encuentra el usuario, usar datos por defecto
      return {
        ...mapSolicitudFromDB(created),
        usuario: solicitudData.usuario || 'Usuario',
        usuarioEmail: solicitudData.usuarioEmail || '',
      };
    }

    return {
      ...mapSolicitudFromDB(created),
      usuario: user.nombre,
      usuarioEmail: user.email,
    };
  } catch (error) {
    console.error('Error al crear solicitud:', error);
    throw error;
  }
}

/**
 * Actualizar solicitud
 */
export async function updateSolicitud(id, updates) {
  if (!USE_DB) {
    return solicitudesData.updateSolicitud(id, updates);
  }

  try {
    const fields = [];
    const params = { id: parseInt(id) };

    if (updates.estado !== undefined) {
      fields.push('estado = @estado');
      params.estado = updates.estado;
    }
    if (updates.aprobadorJefe !== undefined) {
      fields.push('aprobador_jefe_id = @aprobadorJefe');
      params.aprobadorJefe = updates.aprobadorJefe ? parseInt(updates.aprobadorJefe) : null;
    }
    if (updates.aprobadorFinanciero !== undefined) {
      fields.push('aprobador_financiero_id = @aprobadorFinanciero');
      params.aprobadorFinanciero = updates.aprobadorFinanciero ? parseInt(updates.aprobadorFinanciero) : null;
    }
    if (updates.motivoRechazo !== undefined) {
      fields.push('motivo_rechazo = @motivoRechazo');
      params.motivoRechazo = updates.motivoRechazo;
    }
    if (updates.fechaAprobacion !== undefined) {
      fields.push('fecha_aprobacion = @fechaAprobacion');
      params.fechaAprobacion = updates.fechaAprobacion;
    }
    if (updates.fechaRechazo !== undefined) {
      fields.push('fecha_rechazo = @fechaRechazo');
      params.fechaRechazo = updates.fechaRechazo;
    }
    if (updates.fechaAnulacion !== undefined) {
      fields.push('fecha_anulacion = @fechaAnulacion');
      params.fechaAnulacion = updates.fechaAnulacion;
    }

    if (fields.length === 0) {
      return getSolicitudById(id);
    }

    const sqlQuery = `
      UPDATE solicitudes
      SET ${fields.join(', ')}
      WHERE id = @id
    `;

    await query(sqlQuery, params);
    
    // Obtener la solicitud actualizada
    const updatedResult = await query(
      `SELECT * FROM solicitudes WHERE id = @id`,
      { id: parseInt(id) }
    );
    const updated = updatedResult.recordset[0];
    
    // Obtener datos del usuario
    const userResult = await query(
      `SELECT nombre, email FROM users WHERE id = @usuarioId`,
      { usuarioId: updated.usuario_id }
    );
    const user = userResult.recordset[0];

    return {
      ...mapSolicitudFromDB(updated),
      usuario: user.nombre,
      usuarioEmail: user.email,
    };
  } catch (error) {
    console.error('Error al actualizar solicitud:', error);
    throw error;
  }
}

/**
 * Mapear solicitud de la base de datos al formato esperado
 */
function mapSolicitudFromDB(row) {
  // Helper para convertir fechas
  const formatDate = (date) => {
    if (!date) return null;
    if (typeof date === 'string') return date;
    if (date instanceof Date) return date.toISOString();
    return new Date(date).toISOString();
  };

  const formatDateOnly = (date) => {
    if (!date) return new Date().toISOString().split('T')[0];
    if (typeof date === 'string') return date.split('T')[0];
    if (date instanceof Date) return date.toISOString().split('T')[0];
    return new Date(date).toISOString().split('T')[0];
  };

  return {
    id: row.id,
    numero: row.numero,
    descripcion: row.descripcion,
    usuarioId: row.usuario_id,
    usuario: row.usuario || row.usuario_nombre,
    usuarioEmail: row.usuario_email || row.usuarioEmail,
    monto: parseFloat(row.monto),
    categoria: row.categoria,
    fecha: formatDateOnly(row.fecha),
    estado: row.estado,
    prioridad: row.prioridad,
    justificacion: row.justificacion,
    aprobadorJefe: row.aprobador_jefe_id,
    aprobadorFinanciero: row.aprobador_financiero_id,
    motivoRechazo: row.motivo_rechazo,
    fechaCreacion: formatDate(row.fecha_creacion) || new Date().toISOString(),
    fechaAprobacion: formatDate(row.fecha_aprobacion),
    fechaRechazo: formatDate(row.fecha_rechazo),
    fechaAnulacion: formatDate(row.fecha_anulacion),
  };
}

