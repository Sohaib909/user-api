import { LRUCache } from 'lru-cache';
import { User, CacheStats } from '../interfaces/interfaces';

class UserCache {
    private cache: LRUCache<number, User>;
    private stats: CacheStats = { hits: 0, misses: 0, currentSize: 0 };
    private cleanupInterval: NodeJS.Timeout;

    constructor() {
        this.cache = new LRUCache<number, User>({
            max: 100,
            ttl: 60000, // 60 seconds
            updateAgeOnGet: true,
            updateAgeOnHas: false
        });

        // Background task to clean stale entries and update stats
        this.cleanupInterval = setInterval(() => {
            this.cache.purgeStale();
            this.stats.currentSize = this.cache.size;
        }, 5000); // Check every 5 seconds
    }

    get(id: number): User | undefined {
        const value = this.cache.get(id);
        if (value) {
            this.stats.hits++;
        } else {
            this.stats.misses++;
        }
        this.stats.currentSize = this.cache.size;
        return value;
    }

    set(id: number, user: User): void {
        this.cache.set(id, user);
        this.stats.currentSize = this.cache.size;
    }

    has(id: number): boolean {
        return this.cache.has(id);
    }

    getStats(): CacheStats {
        return { ...this.stats };
    }

    clear(): void {
        this.cache.clear();
        this.stats.currentSize = 0;
    }

    cleanup(): void {
        clearInterval(this.cleanupInterval);
    }
}

export const userCache = new UserCache();
