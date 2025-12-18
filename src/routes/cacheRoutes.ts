import { Router } from 'express';
import { getCacheStats, clearCache } from '../controllers';

const router = Router();

router.get('/stats', getCacheStats);
router.delete('/', clearCache);

export default router;
