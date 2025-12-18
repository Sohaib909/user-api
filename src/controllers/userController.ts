import { Request, Response } from 'express';
import { User } from '../interfaces/interfaces';
import { userCache, requestQueue, deduplicator, fetchUserFromDatabase, createUserInDatabase } from '../services';

export async function getUserById(req: Request, res: Response) {
    const userId = parseInt(req.params.id);

    // Validate user ID
    if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    try {
        // Check cache first
        let user: User | null | undefined = userCache.get(userId);

        if (user) {
            return res.json(user);
        }

        // If not in cache, fetch with deduplication
        user = await deduplicator.deduplicate(userId, async () => {
            // Double-check cache in case it was populated while waiting
            const cachedUser = userCache.get(userId);
            if (cachedUser) {
                return cachedUser;
            }

            // Fetch from "database" via queue
            return await requestQueue.add(() => fetchUserFromDatabase(userId));
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update cache
        userCache.set(userId, user);

        return res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export async function createUser(req: Request, res: Response) {
    const { name, email } = req.body;

    // Validate input
    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
    }

    if (typeof name !== 'string' || typeof email !== 'string') {
        return res.status(400).json({ error: 'Name and email must be strings' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    try {
        // Create user in database via queue
        const newUser = await requestQueue.add(() => createUserInDatabase(name, email));

        // Add to cache
        userCache.set(newUser.id, newUser);

        return res.status(201).json(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
