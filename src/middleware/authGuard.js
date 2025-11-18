/**
 * Authentication guard middleware
 * PB-8: Inicio de Sesión Seguro
 * Protege rutas requiriendo JWT válido y opcionalmente roles específicos
 */

import { verifyToken } from '../modules/auth/service.js';

/**
 * Middleware que valida JWT y opcionalmente roles
 * @param {string[]} requiredRoles - Roles permitidos (vacío = cualquier rol autenticado)
 */
export function authGuard(requiredRoles = []) {
  return async (req, res, next) => {
    try {
      // 1. Extraer token de header Authorization: Bearer <token>
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token no proporcionado' });
      }

      const token = authHeader.substring(7); // Remover "Bearer "

      // 2. Verificar token con authService.verifyToken()
      const decoded = verifyToken(token);

      // 3. Si requiredRoles no está vacío, validar que el usuario tenga uno de esos roles
      if (requiredRoles.length > 0 && !requiredRoles.includes(decoded.role)) {
        return res.status(403).json({ error: 'No tienes permisos para acceder a este recurso' });
      }

      // 4. Adjuntar datos del usuario a req.user
      req.user = decoded;

      // 5. Continuar al siguiente middleware
      next();
    } catch (error) {
      return res.status(401).json({ error: error.message || 'Token inválido' });
    }
  };
}

