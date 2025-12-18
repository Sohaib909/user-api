import { RateLimitEntry } from '../interfaces/interfaces';

class RateLimiter {
    private store: Map<string, RateLimitEntry> = new Map();
    private maxRequests = 10; // 10 requests per minute
    private windowMs = 60000; // 1 minute
    private burstCapacity = 5; // 5 requests in burst
    private burstWindowMs = 10000; // 10 seconds

    checkLimit(ip: string): { allowed: boolean; retryAfter?: number } {
        const now = Date.now();
        let entry = this.store.get(ip);

        if (!entry) {
            entry = {
                count: 0,
                resetTime: now + this.windowMs,
                burstTokens: this.burstCapacity,
                lastBurstReset: now
            };
            this.store.set(ip, entry);
        }

        // Reset window if expired
        if (now >= entry.resetTime) {
            entry.count = 0;
            entry.resetTime = now + this.windowMs;
        }

        // Reset burst tokens if burst window expired
        if (now - entry.lastBurstReset >= this.burstWindowMs) {
            entry.burstTokens = this.burstCapacity;
            entry.lastBurstReset = now;
        }

        // Check burst limit first
        if (entry.burstTokens > 0) {
            entry.burstTokens--;
            entry.count++;
            return { allowed: true };
        }

        // Check rate limit
        if (entry.count >= this.maxRequests) {
            const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
            return { allowed: false, retryAfter };
        }

        entry.count++;
        return { allowed: true };
    }

    cleanup(): void {
        const now = Date.now();
        for (const [ip, entry] of this.store.entries()) {
            if (now >= entry.resetTime) {
                this.store.delete(ip);
            }
        }
    }
}

export const rateLimiter = new RateLimiter();
