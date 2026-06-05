import { Router } from 'express';
import swdRoutes from './swdRoutes';
import standardRoutes from './standardRoutes';
import { swdApiKeyGuard } from '../middlewares/swdAuth';

const router = Router();

// Standard JWT-driven application routes
router.use('/api', standardRoutes);

// SWD Integration (Duplicates key student functionality, ignores JWT)
router.use('/api/swd', swdApiKeyGuard, swdRoutes);

export default router;