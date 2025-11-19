/**
 * Authentication routes
 * PB-8: Inicio de Sesión Seguro
 * PB-9: Cierre de Sesión y Control de Inactividad
 */

import express from 'express';
import { login } from '../service.js';
import { authGuard } from '../../../middleware/authGuard.js';
import { recordActivity, clearActivity } from '../../../middleware/inactivityGuard.js';
import * as userRepository from '../../users/repository.js';
import { ROLES } from '../../users/types.js';

const router = express.Router();

/**
 * POST /auth/login
 * Inicia sesión con email y password
 * Body: { email: string, password: string }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar que se proporcionen email y password
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email y password son requeridos' 
      });
    }

    // Intentar login
    const result = await login(email, password);

    // Registrar actividad del usuario
    recordActivity(result.user.id);

    return res.status(200).json({
      message: 'Login exitoso',
      ...result,
    });
  } catch (error) {
    return res.status(401).json({ 
      error: error.message || 'Error al iniciar sesión' 
    });
  }
});

/**
 * POST /auth/init
 * Crea el usuario administrador inicial (solo en desarrollo)
 * No requiere autenticación
 */
router.post('/init', async (req, res) => {
  // Solo disponible en desarrollo
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ 
      error: 'Este endpoint no está disponible en producción' 
    });
  }

  try {
    // Verificar si ya existe el admin
    const existingAdmin = await userRepository.findByEmail('admin@proveeduria.com');
    
    if (existingAdmin) {
      // eslint-disable-next-line no-unused-vars
      const { password_hash, ...adminSafe } = existingAdmin;
      return res.status(200).json({
        message: 'Usuario admin ya existe',
        user: adminSafe,
      });
    }

    // Crear usuario admin
    const admin = await userRepository.create({
      email: 'admin@proveeduria.com',
      password: 'admin123',
      role: ROLES.ADMIN,
      nombre: 'Administrador',
    });

    // Remover password_hash de la respuesta
    // eslint-disable-next-line no-unused-vars
    const { password_hash, ...adminSafe } = admin;

    return res.status(201).json({
      message: 'Usuario admin creado exitosamente',
      user: adminSafe,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Error al crear usuario admin',
    });
  }
});

/**
 * POST /auth/logout
 * Cierra la sesión del usuario
 * Requiere autenticación
 */
router.post('/logout', authGuard([]), (req, res) => {
  try {
    // Limpiar registro de actividad del usuario
    if (req.user && req.user.userId) {
      clearActivity(req.user.userId);
    }
    
    return res.status(200).json({
      message: 'Sesión cerrada exitosamente',
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Error al cerrar sesión',
    });
  }
});

export default router;

