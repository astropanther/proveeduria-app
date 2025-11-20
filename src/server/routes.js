import express from 'express';
import authRoutes from '../modules/auth/routes/authRoutes.js';
import userRoutes from '../modules/users/routes/userRoutes.js';
import notificacionesRoutes from '../modules/notificaciones/routes/notificacionesRoutes.js';
import reportesRoutes from '../modules/reportes/routes/reportesRoutes.js';

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes
router.use('/auth', authRoutes);

// User routes
router.use('/users', userRoutes);

// Notification routes (PB-13)
router.use('/notificaciones', notificacionesRoutes);

// Report routes (PB-14)
router.use('/reportes', reportesRoutes);

export default router;
