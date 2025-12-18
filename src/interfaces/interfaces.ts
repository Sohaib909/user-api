export interface User {
    id: number;
    name: string;
    email: string;
}

export interface CacheStats {
    hits: number;
    misses: number;
    currentSize: number;
}

export interface RateLimitEntry {
    count: number;
    resetTime: number;
    burstTokens: number;
    lastBurstReset: number;
}

export interface PendingRequest {
    resolve: (value: User | null) => void;
    reject: (error: Error) => void;
}
