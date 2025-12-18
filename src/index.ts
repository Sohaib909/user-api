import express from 'express';
import cors from 'cors';
import { router } from './routes';
import { userCache, rateLimiter } from './services';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(express.json());

// Routes
app.use(router);

// Cleanup intervals for ratelimiter
setInterval(() => {
    rateLimiter.cleanup();
}, 60000);

// Start Server (only when not running as serverless function)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log('\nAvailable endpoints:');
        console.log(`  GET    /health              - Health check`);
        console.log(`  GET    /users/:id           - Get user by ID`);
        console.log(`  POST   /users               - Create new user`);
        console.log(`  GET    /cache/stats         - Get cache statistics`);
        console.log(`  DELETE /cache               - Clear entire cache`);
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('Shutting down gracefully...');
        userCache.cleanup();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('Shutting down gracefully...');
        userCache.cleanup();
        process.exit(0);
    });
}

export default app;
