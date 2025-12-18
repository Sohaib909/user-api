import { User, PendingRequest } from '../interfaces/interfaces';

class RequestDeduplicator {
    private pendingRequests: Map<number, PendingRequest[]> = new Map();

    async deduplicate(userId: number, fetchFn: () => Promise<User | null>): Promise<User | null> {
        // Check if there's already a pending request for this user
        const existing = this.pendingRequests.get(userId);

        if (existing) {
            // Wait for the existing request to complete
            return new Promise((resolve, reject) => {
                existing.push({ resolve, reject });
            });
        }

        // Create a new pending request list
        const waiters: PendingRequest[] = [];
        this.pendingRequests.set(userId, waiters);

        try {
            const result = await fetchFn();

            // Resolve all waiting requests
            waiters.forEach(waiter => waiter.resolve(result));

            return result;
        } catch (error) {
            // Reject all waiting requests
            waiters.forEach(waiter => waiter.reject(error as Error));
            throw error;
        } finally {
            this.pendingRequests.delete(userId);
        }
    }
}

export const deduplicator = new RequestDeduplicator();
