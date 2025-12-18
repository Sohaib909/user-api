import { Request, Response, NextFunction } from 'express';
import { rateLimiter } from '../services';

export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

    const rateLimitResult = rateLimiter.checkLimit(clientIp);

    if (!rateLimitResult.allowed) {
        return res.status(429).json({
            error: 'Too many requests. Please try again later.',
            retryAfter: rateLimitResult.retryAfter
        });
    }

    next();
}
