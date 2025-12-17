/**
 * Notification Helper
 * Funciones auxiliares para determinar tipos de notificación y destinatarios
 */

/**
 * Determina el tipo de notificación basado en el rol del usuario destinatario
 * @param {string} userRole - Rol del usuario ('Administrador', 'Aprobador Jefe', 'Aprobador Financiero', 'Comprador')
 * @returns {string} Tipo de notificación: 'aprobador' o 'comprador'
 */
export function getNotificationTypeByRole(userRole) {
  // Admin y aprobadores reciben notificaciones de tipo 'aprobador'
  if (userRole === 'Administrador' || 
      userRole === 'Aprobador Jefe' || 
      userRole === 'Aprobador Financiero') {
    return 'aprobador';
  }
  // Compradores reciben notificaciones de tipo 'comprador'
  return 'comprador';
}

/**
 * Obtiene todos los usuarios que deben recibir notificaciones de aprobador
 * @param {Function} findAllUsers - Función para buscar usuarios
 * @returns {Promise<Array>} Lista de usuarios (admin y aprobadores)
 */
export async function getAprobadoresYAdmin(findAllUsers) {
  try {
    const aprobadoresJefe = await findAllUsers({ role: 'Aprobador Jefe', activo: true });
    const aprobadoresFinancieros = await findAllUsers({ role: 'Aprobador Financiero', activo: true });
    const adminUsers = await findAllUsers({ role: 'Administrador', activo: true });
    
    return [...aprobadoresJefe, ...aprobadoresFinancieros, ...adminUsers];
  } catch (error) {
    console.error('[NOTIFICATION HELPER] Error al obtener aprobadores y admin:', error);
    return [];
  }
}

/**
 * Determina si un usuario debe ver todas las notificaciones (solo admin)
 * @param {string} userRole - Rol del usuario
 * @returns {boolean} true si es admin, false en caso contrario
 */
export function shouldSeeAllNotifications(userRole) {
  return userRole === 'Administrador';
}

