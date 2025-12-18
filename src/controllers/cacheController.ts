import { Request, Response } from 'express';
import { userCache } from '../services';

export function getCacheStats(req: Request, res: Response) {
    res.json(userCache.getStats());
}

export function clearCache(req: Request, res: Response) {
    userCache.clear();
    res.json({ message: 'Cache cleared successfully', stats: userCache.getStats() });
}
