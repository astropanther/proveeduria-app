import express from 'express';
import authRoutes from '../modules/auth/routes/authRoutes.js';
import userRoutes from '../modules/users/routes/userRoutes.js';

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes
router.use('/auth', authRoutes);

// User routes
router.use('/users', userRoutes);

export default router;
