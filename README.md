# User API

A high-performance Express.js API built with TypeScript that demonstrates advanced caching strategies, rate limiting, and asynchronous request processing. This project showcases how to build a scalable API that can handle high traffic efficiently.

## What This Project Does

This API provides user management endpoints with several performance optimization techniques:

- Intelligent caching system that remembers recently accessed users
- Rate limiting to prevent abuse and ensure fair usage
- Asynchronous request processing to handle multiple requests without blocking
- Request deduplication to avoid redundant database calls
- Automatic cleanup of old cache entries

## Getting Started

### Prerequisites

You need Node.js installed on your system. This project uses pnpm as the package manager.

### Installation

Clone the repository and install dependencies:

```bash
pnpm install
```

### Running the Server

For development with hot reload:
```bash
pnpm dev
```

For production:
```bash
pnpm build
pnpm start
```

The server will start on port 3000 by default. You can change this by setting the PORT environment variable.

## API Documentation

### User Endpoints

#### Get User by ID

Retrieve information about a specific user.

```
GET /users/:id
```

Example request:
```bash
curl http://localhost:3000/users/1
```

Example response:
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com"
}
```

Possible responses:
- 200 OK: User found and returned
- 400 Bad Request: Invalid user ID format
- 404 Not Found: User does not exist
- 429 Too Many Requests: Rate limit exceeded

#### Create New User

Add a new user to the system.

```
POST /users
```

Request body:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

Example request:
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com"}'
```

Example response:
```json
{
  "id": 4,
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

Possible responses:
- 201 Created: User successfully created
- 400 Bad Request: Missing or invalid fields
- 429 Too Many Requests: Rate limit exceeded

### Cache Endpoints

#### Get Cache Statistics

View current cache performance metrics.

```
GET /cache/stats
```

Example response:
```json
{
  "hits": 45,
  "misses": 12,
  "currentSize": 3
}
```

Understanding the metrics:
- **hits**: Number of times data was found in cache (fast responses)
- **misses**: Number of times data had to be fetched from database (slower responses)
- **currentSize**: Number of entries currently stored in cache

#### Clear Cache

Remove all entries from the cache.

```
DELETE /cache
```

Example request:
```bash
curl -X DELETE http://localhost:3000/cache
```

Example response:
```json
{
  "message": "Cache cleared successfully",
  "stats": {
    "hits": 0,
    "misses": 0,
    "currentSize": 0
  }
}
```

### System Endpoints

#### Health Check

Check if the server is running properly.

```
GET /health
```

Example response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-19T10:30:00.000Z"
}
```

## How It Works

### Caching Strategy

The API uses an LRU (Least Recently Used) cache to store user data temporarily:

- Data is cached for 60 seconds after being fetched
- Cache can hold up to 100 user records
- Stale entries are automatically removed every 5 seconds
- When multiple requests ask for the same user simultaneously, only one database call is made

This means if you request the same user within 60 seconds, you get an instant response without hitting the database.

### Rate Limiting

To prevent abuse, the API limits how many requests you can make:

- You can make up to 10 requests per minute
- There is a burst allowance of 5 requests in any 10-second window
- Limits are tracked per IP address
- When you exceed the limit, you receive a 429 status code with a retry-after time

### Asynchronous Processing

All database operations go through an asynchronous queue system:

- Requests do not block the server while waiting for data
- Multiple requests can be processed simultaneously
- The queue ensures database calls happen in an orderly fashion
- If multiple requests need the same data, they share the result of a single database call

## Project Structure

```
src/
├── controllers/          # Request handlers
│   ├── userController.ts
│   ├── cacheController.ts
│   ├── healthController.ts
│   └── index.ts
├── services/            # Business logic
│   ├── cache.ts         # LRU cache implementation
│   ├── rateLimiter.ts   # Rate limiting logic
│   ├── queue.ts         # Async request queue
│   ├── deduplicator.ts  # Request deduplication
│   ├── database.ts      # Mock database
│   └── index.ts
├── routes/              # API routes
│   ├── userRoutes.ts
│   ├── cacheRoutes.ts
│   ├── healthRoutes.ts
│   └── index.ts
├── middlewares/         # Express middlewares
│   ├── rateLimitMiddleware.ts
│   └── index.ts
├── interfaces/          # TypeScript types
│   └── interfaces.ts
└── index.ts            # Application entry point
```

## Configuration

The following settings can be adjusted in the service files:

### Cache Settings (src/services/cache.ts)
- TTL: 60 seconds (how long data stays in cache)
- Max Size: 100 entries (maximum number of cached items)
- Cleanup Interval: 5 seconds (how often to remove stale entries)

### Rate Limit Settings (src/services/rateLimiter.ts)
- Base Limit: 10 requests per minute
- Burst Capacity: 5 requests per 10 seconds
- Window: 60 seconds (rate limit reset time)

### Database Settings (src/services/database.ts)
- Simulated Delay: 200ms (mimics real database latency)

## Testing the API

### Test Caching

See the difference between cache hits and misses:

```bash
# First request (cache miss, takes ~200ms)
time curl http://localhost:3000/users/1

# Second request (cache hit, takes <10ms)
time curl http://localhost:3000/users/1
```

### Test Rate Limiting

Send rapid requests to trigger rate limiting:

```bash
for i in {1..15}; do 
  echo "Request $i"
  curl http://localhost:3000/users/1
  echo ""
done
```

You should see the first 10 requests succeed, then receive 429 errors.

### Test User Creation

Create a new user and verify it is cached:

```bash
# Create user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}'

# Fetch user (should be instant due to cache)
time curl http://localhost:3000/users/4
```

### Monitor Cache Performance

Watch how cache statistics change:

```bash
# Check initial stats
curl http://localhost:3000/cache/stats

# Make some requests
curl http://localhost:3000/users/1
curl http://localhost:3000/users/2
curl http://localhost:3000/users/1

# Check updated stats
curl http://localhost:3000/cache/stats
```

## Sample Data

The API comes with three pre-loaded users:

| ID | Name | Email |
|----|------|-------|
| 1  | John Doe | john@example.com |
| 2  | Jane Smith | jane@example.com |
| 3  | Alice Johnson | alice@example.com |

New users created via POST /users will start with ID 4 and increment from there.

## Technologies Used

- Express.js: Web framework
- TypeScript: Type safety and better development experience
- LRU Cache: Efficient caching with automatic eviction
- CORS: Cross-origin resource sharing support

## Deployment to Vercel

This project is configured for easy deployment to Vercel as a serverless function.

### Prerequisites

- A Vercel account (free tier works fine)
- Vercel CLI installed (optional but recommended)

### Deploy via Vercel CLI

1. Install Vercel CLI globally:
```bash
npm install -g vercel
```

2. Login to your Vercel account:
```bash
vercel login
```

3. Deploy the project:
```bash
vercel
```

4. Follow the prompts to configure your deployment

### Deploy via Vercel Dashboard

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project"
4. Import your repository
5. Vercel will automatically detect the configuration from vercel.json
6. Click "Deploy"

### Configuration Files

The project includes the following Vercel-specific files:

- **vercel.json**: Configures how Vercel builds and routes requests
- **api/index.ts**: Serverless function handler that exports the Express app
- **.vercelignore**: Specifies files to exclude from deployment

### Environment Variables

If you need to set environment variables for production:

1. In Vercel Dashboard, go to your project settings
2. Navigate to "Environment Variables"
3. Add any required variables (e.g., PORT, custom configuration)

### Post-Deployment

After deployment, Vercel will provide you with a URL like:
```
https://your-project-name.vercel.app
```

You can test your deployed API:
```bash
curl https://your-project-name.vercel.app/health
curl https://your-project-name.vercel.app/users/1
```

### Important Notes

- The app automatically detects if it is running on Vercel and skips the local server startup
- Cache and rate limiting work across serverless function invocations
- Cold starts may occur if the function has not been used recently (typical for serverless)

## License

ISC
#   u s e r - a p i  
 