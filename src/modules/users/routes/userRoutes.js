/**
 * User routes
 * PB-6: Registrar Usuarios y Roles
 * PB-7: Editar e Inactivar Usuarios
 */

import express from 'express';
import { createUser, listUsers, getUserById, updateUser, inactivateUser, activateUser } from '../controller.js';
import { authGuard } from '../../../middleware/authGuard.js';
import { inactivityGuard } from '../../../middleware/inactivityGuard.js';
import { ROLES } from '../types.js';

const router = express.Router();

// En desarrollo, permitir crear usuarios sin autenticación (para inicializar el primer admin)
// En producción, todas las rutas requieren autenticación y rol de Administrador
const isDevelopment = process.env.NODE_ENV !== 'production';

if (!isDevelopment) {
  // En producción, todas las rutas requieren autenticación admin
  router.use(authGuard([ROLES.ADMIN]));
}

// POST /users - Crear nuevo usuario
// En desarrollo: sin autenticación | En producción: requiere admin
router.post('/', createUser);

// GET /users - Listar usuarios (con filtros opcionales: ?role=Comprador&activo=true)
// Siempre requiere autenticación admin y verificación de inactividad
router.get('/', authGuard([ROLES.ADMIN]), inactivityGuard(), listUsers);

// GET /users/:id - Obtener usuario por ID
// Siempre requiere autenticación admin y verificación de inactividad
router.get('/:id', authGuard([ROLES.ADMIN]), inactivityGuard(), getUserById);

// PUT /users/:id - Actualizar usuario
// Siempre requiere autenticación admin y verificación de inactividad
router.put('/:id', authGuard([ROLES.ADMIN]), inactivityGuard(), updateUser);

// PATCH /users/:id/inactivate - Inactivar usuario
// Siempre requiere autenticación admin y verificación de inactividad
router.patch('/:id/inactivate', authGuard([ROLES.ADMIN]), inactivityGuard(), inactivateUser);

// PATCH /users/:id/activate - Activar usuario
// Siempre requiere autenticación admin y verificación de inactividad
router.patch('/:id/activate', authGuard([ROLES.ADMIN]), inactivityGuard(), activateUser);

export default router;

