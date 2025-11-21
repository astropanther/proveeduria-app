/**
 * Auditoría service
 * PB-15: Registro de Actividades del Sistema
 */

import * as auditoriaRepository from './repository.js';

/**
 * Registra una actividad en el sistema
 * @param {object} actividad - Datos de la actividad
 * @param {number} actividad.usuarioId - ID del usuario que realizó la acción
 * @param {string} actividad.accion - Tipo de acción (CREAR_SOLICITUD, APROBAR_SOLICITUD, etc.)
 * @param {string} actividad.entidad - Tipo de entidad afectada (Solicitud, Usuario, etc.)
 * @param {number} actividad.entidadId - ID de la entidad afectada
 * @param {string} actividad.detalles - Detalles adicionales de la actividad
 */
export async function registrarActividad(actividad) {
  try {
    const { usuarioId, accion, entidad, entidadId, detalles } = actividad;

    if (!usuarioId || !accion || !entidad) {
      console.warn('Actividad incompleta, no se registró:', actividad);
      return null;
    }

    const nuevaActividad = await auditoriaRepository.addActividad({
      usuarioId,
      accion,
      entidad,
      entidadId: entidadId || null,
      detalles: detalles || '',
    });

    console.log(`[AUDITORÍA] ${accion} - Usuario: ${usuarioId}, Entidad: ${entidad}${entidadId ? ` (ID: ${entidadId})` : ''}`);
    
    return nuevaActividad;
  } catch (error) {
    console.error('Error al registrar actividad:', error);
    // No lanzar error para no interrumpir el flujo principal
    return null;
  }
}

/**
 * Obtiene todas las actividades
 */
export async function obtenerActividades(filtros = {}) {
  const actividades = await auditoriaRepository.getAllActividades(filtros);

  if (filtros.usuarioId) {
    actividades = actividades.filter(a => a.usuarioId === parseInt(filtros.usuarioId));
  }

  if (filtros.entidad) {
    actividades = actividades.filter(a => a.entidad === filtros.entidad);
  }

  if (filtros.accion) {
    actividades = actividades.filter(a => a.accion === filtros.accion);
  }

  // Ordenar por fecha descendente (más recientes primero)
  actividades.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  return actividades;
}

