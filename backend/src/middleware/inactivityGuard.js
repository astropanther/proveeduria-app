/**
 * Inactivity guard middleware
 * PB-9: Cierre de Sesión y Control de Inactividad
 * 
 * Verifica que el usuario no haya estado inactivo por más del tiempo permitido.
 * Si el tiempo de inactividad excede el límite, se rechaza la petición.
 */

// Almacenamiento en memoria del último tiempo de actividad por usuario
// En producción, esto debería estar en Redis o base de datos
const lastActivity = new Map();

// Tiempo máximo de inactividad en milisegundos (30 minutos por defecto)
const MAX_INACTIVITY_TIME = 30 * 60 * 1000; // 30 minutos

/**
 * Middleware para verificar inactividad del usuario
 * @param {number} maxInactivityMs - Tiempo máximo de inactividad en milisegundos (opcional)
 */
export function inactivityGuard(maxInactivityMs = MAX_INACTIVITY_TIME) {
  return (req, res, next) => {
    // Solo aplicar si el usuario está autenticado
    if (!req.user || !req.user.userId) {
      return next();
    }

    const userId = req.user.userId;
    const now = Date.now();
    const lastActivityTime = lastActivity.get(userId);

    // Si es la primera vez que vemos actividad de este usuario, registrar
    if (!lastActivityTime) {
      lastActivity.set(userId, now);
      return next();
    }

    // Calcular tiempo de inactividad
    const inactivityTime = now - lastActivityTime;

    // Si excede el tiempo máximo, rechazar la petición
    if (inactivityTime > maxInactivityMs) {
      // Limpiar registro de actividad
      lastActivity.delete(userId);
      
      return res.status(401).json({
        error: 'Sesión expirada por inactividad. Por favor, inicia sesión nuevamente.',
        code: 'SESSION_EXPIRED',
      });
    }

    // Actualizar último tiempo de actividad
    lastActivity.set(userId, now);
    next();
  };
}

/**
 * Registra actividad del usuario (útil para llamar después del login)
 * @param {number} userId - ID del usuario
 */
export function recordActivity(userId) {
  lastActivity.set(userId, Date.now());
}

/**
 * Limpia el registro de actividad de un usuario (útil para logout)
 * @param {number} userId - ID del usuario
 */
export function clearActivity(userId) {
  lastActivity.delete(userId);
}

/**
 * Limpia todos los registros de actividad (útil para testing o limpieza)
 */
export function clearAllActivity() {
  lastActivity.clear();
}

