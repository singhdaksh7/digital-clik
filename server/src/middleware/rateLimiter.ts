import { Request, Response, NextFunction } from 'express';
import { Redis } from 'ioredis';

let redisClient: Redis | null = null;
let redisAvailable = false;

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = parseInt(process.env.REDIS_PORT || '6381', 10);
const redisUrl = process.env.REDIS_URL;

try {
  if (redisUrl || process.env.REDIS_HOST || process.env.NODE_ENV === 'production') {
    redisClient = redisUrl ? new Redis(redisUrl) : new Redis({ host: redisHost, port: redisPort, lazyConnect: true, maxRetriesPerRequest: 1 });
    redisClient.connect().then(() => {
      redisAvailable = true;
      console.log('✅ Connected to Redis for rate limiting');
    }).catch(() => {
      redisAvailable = false;
      console.warn('⚠️ Redis connection failed. Falling back to in-memory rate limiting.');
    });

    redisClient.on('error', () => {
      redisAvailable = false;
    });
  }
} catch (e) {
  redisAvailable = false;
}

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const memoryStore = new Map<string, RateLimitStore>();

setInterval(() => {
  const now = Date.now();
  for (const [key, store] of memoryStore.entries()) {
    if (now > store.resetTime) memoryStore.delete(key);
  }
}, 5 * 60 * 1000);

async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<{ allowed: boolean; remaining: number }> {
  if (redisAvailable && redisClient) {
    try {
      const windowSeconds = Math.ceil(windowMs / 1000);
      const current = await redisClient.incr(key);
      if (current === 1) {
        await redisClient.expire(key, windowSeconds);
      }
      return {
        allowed: current <= limit,
        remaining: Math.max(0, limit - current)
      };
    } catch (err) {
      redisAvailable = false;
    }
  }

  // Fallback to in-memory store
  const now = Date.now();
  const record = memoryStore.get(key);
  if (!record || now > record.resetTime) {
    memoryStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  record.count += 1;
  return {
    allowed: record.count <= limit,
    remaining: Math.max(0, limit - record.count)
  };
}

export function loginRateLimiter(maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const email = req.body?.email || '';
    const key = `rate:login:${ip}:${email}`;

    const result = await checkRateLimit(key, maxAttempts, windowMs);
    if (!result.allowed) {
      return res.status(429).json({
        success: false,
        error: { code: 'TOO_MANY_REQUESTS', message: 'Too many login attempts. Please try again after 15 minutes.' }
      });
    }

    next();
  };
}

export function formRateLimiter(maxRequests = 10, windowMs = 60 * 1000) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `rate:form:${ip}`;

    const result = await checkRateLimit(key, maxRequests, windowMs);
    if (!result.allowed) {
      return res.status(429).json({
        success: false,
        error: { code: 'TOO_MANY_REQUESTS', message: 'Too many submissions. Please wait a minute.' }
      });
    }

    next();
  };
}

export function publicRateLimiter(maxRequests = 100, windowMs = 60 * 1000) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `rate:public:${ip}`;

    const result = await checkRateLimit(key, maxRequests, windowMs);
    if (!result.allowed) {
      return res.status(429).json({
        success: false,
        error: { code: 'TOO_MANY_REQUESTS', message: 'Rate limit exceeded. Please slow down.' }
      });
    }

    next();
  };
}
