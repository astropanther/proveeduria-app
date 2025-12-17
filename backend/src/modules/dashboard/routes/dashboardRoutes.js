/**
 * Dashboard routes
 * PB-22: Dashboard de Resumen de Solicitudes
 */

import express from 'express';
import { obtenerResumenSolicitudes, obtenerEstadisticasPorMes, obtenerSolicitudesRecientes, obtenerEstadisticasUsuarios } from '../service.js';
import { authGuard } from '../../../middleware/authGuard.js';
import { inactivityGuard } from '../../../middleware/inactivityGuard.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authGuard());
router.use(inactivityGuard());

// GET /dashboard/resumen - Resumen general
router.get('/resumen', async (req, res) => {
  try {
    const resumen = await obtenerResumenSolicitudes();
    const usuarios = await obtenerEstadisticasUsuarios();
    
    res.json({
      solicitudes: resumen,
      usuarios: usuarios,
    });
  } catch (error) {
    console.error('Error al obtener resumen del dashboard:', error);
    res.status(500).json({
      error: error.message || 'Error al obtener resumen del dashboard',
    });
  }
});

// GET /dashboard/estadisticas - Estadísticas por mes
router.get('/estadisticas', async (req, res) => {
  try {
    const estadisticas = await obtenerEstadisticasPorMes();
    res.json(estadisticas);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      error: error.message || 'Error al obtener estadísticas',
    });
  }
});

// GET /dashboard/recientes - Solicitudes recientes
router.get('/recientes', async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 5;
    const recientes = await obtenerSolicitudesRecientes(limite);
    res.json(recientes);
  } catch (error) {
    console.error('Error al obtener solicitudes recientes:', error);
    res.status(500).json({
      error: error.message || 'Error al obtener solicitudes recientes',
    });
  }
});

export default router;

