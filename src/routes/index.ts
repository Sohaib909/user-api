import { Router } from 'express';
import userRoutes from './userRoutes';
import cacheRoutes from './cacheRoutes';
import healthRoutes from './healthRoutes';

export const router = Router();

router.use('/users', userRoutes);
router.use('/cache', cacheRoutes);
router.use('/health', healthRoutes);
