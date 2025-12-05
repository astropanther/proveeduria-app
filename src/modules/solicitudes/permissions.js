/**
 * Permisos y niveles de acceso para solicitudes
 * Define quién puede ver, aprobar y gestionar solicitudes según roles y montos
 */

export const ROLES = {
  ADMIN: 'Administrador',
  COMPRADOR: 'Comprador',
  APROBADOR_JEFE: 'Aprobador Jefe',
  APROBADOR_FINANCIERO: 'Aprobador Financiero',
};

// Límites de monto para aprobaciones
export const LIMITES_APROBACION = {
  APROBADOR_JEFE_MAX: 50000, // Hasta $50,000 puede aprobar solo el jefe
  APROBADOR_FINANCIERO_MIN: 50000, // Desde $50,000 requiere aprobador financiero
  REQUIERE_DOBLE_APROBACION: 100000, // Desde $100,000 requiere ambos aprobadores
};

/**
 * Verifica si un usuario puede ver una solicitud
 */
export function puedeVerSolicitud(userRole, userId, solicitud) {
  if (!solicitud || !userRole || !userId) {
    return false;
  }

  // Admin puede ver todo
  if (userRole === ROLES.ADMIN) {
    return true;
  }

  // Comprador solo puede ver sus propias solicitudes
  if (userRole === ROLES.COMPRADOR) {
    const solicitudUsuarioId = solicitud.usuarioId || solicitud.usuario_id;
    return solicitudUsuarioId === userId;
  }

  // Aprobadores pueden ver solicitudes pendientes que necesitan su aprobación
  if (userRole === ROLES.APROBADOR_JEFE || userRole === ROLES.APROBADOR_FINANCIERO) {
    // Pueden ver todas las solicitudes pendientes
    if (solicitud.estado === 'Pendiente') {
      return true;
    }
    // También pueden ver solicitudes que ya aprobaron
    if (solicitud.estado === 'Aprobada' || solicitud.estado === 'Rechazada') {
      const aprobadorJefe = solicitud.aprobadorJefe || solicitud.aprobador_jefe_id;
      const aprobadorFinanciero = solicitud.aprobadorFinanciero || solicitud.aprobador_financiero_id;
      return (
        aprobadorJefe === userId ||
        aprobadorFinanciero === userId
      );
    }
  }

  return false;
}

/**
 * Verifica si un usuario puede aprobar una solicitud según el monto
 */
export function puedeAprobarSolicitud(userRole, userId, solicitud) {
  const monto = parseFloat(solicitud.monto) || 0;

  // Admin puede aprobar todo
  if (userRole === ROLES.ADMIN) {
    return true;
  }

  // Comprador no puede aprobar
  if (userRole === ROLES.COMPRADOR) {
    return false;
  }

  // Solo solicitudes pendientes pueden ser aprobadas
  if (solicitud.estado !== 'Pendiente') {
    return false;
  }

  // Aprobador Jefe
  if (userRole === ROLES.APROBADOR_JEFE) {
    // Si ya fue aprobada por él, no puede aprobar de nuevo
    const aprobadorJefe = solicitud.aprobadorJefe || solicitud.aprobador_jefe_id;
    if (aprobadorJefe === userId) {
      return false;
    }
    // Puede aprobar si:
    // 1. Monto < $50,000 (puede aprobar solo)
    // 2. Monto >= $50,000 (necesita aprobación financiera también, pero puede dar su aprobación)
    return true;
  }

  // Aprobador Financiero
  if (userRole === ROLES.APROBADOR_FINANCIERO) {
    // Si ya fue aprobada por él, no puede aprobar de nuevo
    const aprobadorFinanciero = solicitud.aprobadorFinanciero || solicitud.aprobador_financiero_id;
    if (aprobadorFinanciero === userId) {
      return false;
    }
    // Puede aprobar si:
    // 1. Monto >= $50,000 (siempre requiere aprobación financiera)
    // 2. Monto < $50,000 pero >= $100,000 (requiere doble aprobación)
    if (monto >= LIMITES_APROBACION.APROBADOR_FINANCIERO_MIN) {
      return true;
    }
    // Para montos menores, solo si ya tiene aprobación del jefe
    const aprobadorJefe = solicitud.aprobadorJefe || solicitud.aprobador_jefe_id;
    if (monto < LIMITES_APROBACION.APROBADOR_FINANCIERO_MIN && aprobadorJefe) {
      return true;
    }
  }

  return false;
}

/**
 * Determina qué campos puede ver un usuario según su rol
 */
export function getCamposVisibles(userRole, solicitud) {
  const campos = {
    id: true,
    numero: true,
    descripcion: true,
    categoria: true,
    fecha: true,
    estado: true,
    monto: true,
    prioridad: true,
  };

  // Admin ve todo
  if (userRole === ROLES.ADMIN) {
    return {
      ...campos,
      usuario: true,
      usuarioEmail: true,
      usuarioId: true,
      justificacion: true,
      aprobadorJefe: true,
      aprobadorFinanciero: true,
      motivoRechazo: true,
      fechaAprobacion: true,
      fechaRechazo: true,
      fechaAnulacion: true,
    };
  }

  // Comprador ve sus propios datos completos
  if (userRole === ROLES.COMPRADOR) {
    return {
      ...campos,
      usuario: true,
      usuarioEmail: true,
      justificacion: true,
      aprobadorJefe: false, // No ve quién aprobó (privacidad)
      aprobadorFinanciero: false,
      motivoRechazo: true, // Ve el motivo si fue rechazada
      fechaAprobacion: true,
      fechaRechazo: true,
      fechaAnulacion: true,
    };
  }

  // Aprobadores ven información necesaria para tomar decisiones
  if (userRole === ROLES.APROBADOR_JEFE || userRole === ROLES.APROBADOR_FINANCIERO) {
    return {
      ...campos,
      usuario: true,
      usuarioEmail: false, // No ven email por privacidad
      usuarioId: true,
      justificacion: true,
      aprobadorJefe: true,
      aprobadorFinanciero: true,
      motivoRechazo: true,
      fechaAprobacion: true,
      fechaRechazo: true,
      fechaAnulacion: false,
    };
  }

  return campos;
}

/**
 * Filtra los campos de una solicitud según los permisos del usuario
 */
export function filtrarCamposSolicitud(userRole, userId, solicitud) {
  if (!solicitud) {
    return null;
  }

  if (!puedeVerSolicitud(userRole, userId, solicitud)) {
    return null; // No tiene permiso para ver
  }

  try {
    const camposVisibles = getCamposVisibles(userRole, solicitud);
    const solicitudFiltrada = {};

    Object.keys(camposVisibles).forEach(campo => {
      if (camposVisibles[campo] && solicitud.hasOwnProperty(campo)) {
        solicitudFiltrada[campo] = solicitud[campo];
      }
    });

    return solicitudFiltrada;
  } catch (error) {
    console.error('Error al filtrar campos:', error);
    // En caso de error, devolver la solicitud completa (mejor que nada)
    return solicitud;
  }
}

