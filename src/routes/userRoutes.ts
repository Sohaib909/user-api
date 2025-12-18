import { Router } from 'express';
import { getUserById, createUser } from '../controllers';
import { rateLimitMiddleware } from '../middlewares';

const router = Router();

router.post('/', rateLimitMiddleware, createUser);
router.get('/:id', rateLimitMiddleware, getUserById);

export default router;
