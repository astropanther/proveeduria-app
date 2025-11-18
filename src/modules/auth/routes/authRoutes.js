/**
 * Authentication routes
 * PB-8: Inicio de Sesión Seguro
 */

import express from 'express';
import { login } from '../service.js';

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

export default router;

