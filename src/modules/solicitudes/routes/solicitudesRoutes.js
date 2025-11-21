/**
 * Solicitudes routes
 * PB-10: Crear Solicitud de Compra
 * PB-11: Aprobar o Rechazar Solicitud
 * PB-12: Anular Solicitud Pendiente
 */

import express from 'express';
import {
  crearSolicitud,
  listarSolicitudes,
  obtenerSolicitud,
  aprobarSolicitud,
  rechazarSolicitud,
  anularSolicitud,
} from '../controller.js';
import { authGuard } from '../../../middleware/authGuard.js';
import { inactivityGuard } from '../../../middleware/inactivityGuard.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authGuard([]));
router.use(inactivityGuard);

// PB-10: Crear solicitud (compradores y admin)
router.post('/', authGuard(['Comprador', 'Administrador']), crearSolicitud);

// Listar solicitudes
router.get('/', listarSolicitudes);

// Obtener una solicitud
router.get('/:id', obtenerSolicitud);

// PB-11: Aprobar solicitud (aprobadores y admin)
router.post('/:id/aprobar', authGuard(['Aprobador Jefe', 'Aprobador Financiero', 'Administrador']), aprobarSolicitud);

// PB-11: Rechazar solicitud (aprobadores y admin)
router.post('/:id/rechazar', authGuard(['Aprobador Jefe', 'Aprobador Financiero', 'Administrador']), rechazarSolicitud);

// PB-12: Anular solicitud (solo el creador o admin)
router.post('/:id/anular', anularSolicitud);

export default router;

