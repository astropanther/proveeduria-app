import express from 'express';
import authRoutes from '../modules/auth/routes/authRoutes.js';

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes
router.use('/auth', authRoutes);

export default router;
