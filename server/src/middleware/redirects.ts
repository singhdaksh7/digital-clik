import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';

// In-memory cache for fast redirect lookups
let redirectCache: Map<string, { targetPath: string; statusCode: number }> | null = null;
let lastCacheUpdate = 0;
const CACHE_TTL = 30000; // 30 seconds

export async function refreshRedirectCache(): Promise<void> {
  try {
    const redirects = await prisma.redirect.findMany({
      where: { isActive: true }
    });
    const map = new Map<string, { targetPath: string; statusCode: number }>();
    for (const r of redirects) {
      // Normalize source path to lowercase, ensure leading slash, remove trailing slash (except root)
      let src = r.sourcePath.trim().toLowerCase();
      if (!src.startsWith('/')) src = '/' + src;
      if (src.length > 1 && src.endsWith('/')) src = src.slice(0, -1);
      map.set(src, { targetPath: r.targetPath, statusCode: r.statusCode });
    }
    redirectCache = map;
    lastCacheUpdate = Date.now();
  } catch (err) {
    console.error('Failed to load redirects into cache:', err);
  }
}

/**
 * Middleware that checks if incoming request matches a 301/302 Redirect.
 * Handles circular loop detection up to 5 hops.
 */
export async function redirectsMiddleware(req: Request, res: Response, next: NextFunction) {
  // Only apply to GET / HEAD requests, not API or static assets
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return next();
  }

  const path = req.path.toLowerCase();
  if (
    path.startsWith('/api') ||
    path.startsWith('/uploads') ||
    path.startsWith('/assets') ||
    path.startsWith('/@') ||
    path.includes('.')
  ) {
    return next();
  }

  // Refresh cache if needed
  if (!redirectCache || Date.now() - lastCacheUpdate > CACHE_TTL) {
    await refreshRedirectCache();
  }

  if (!redirectCache || redirectCache.size === 0) {
    return next();
  }

  let normalized = path;
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }

  let current = normalized;
  const visited = new Set<string>();
  let finalTarget: string | null = null;
  let finalStatus = 301;

  while (redirectCache.has(current)) {
    if (visited.has(current)) {
      console.warn(`[RedirectLoopDetected] Loop detected for path: ${path}`);
      return next(); // Break loop, let app handle
    }
    visited.add(current);
    const entry = redirectCache.get(current)!;
    finalTarget = entry.targetPath;
    finalStatus = entry.statusCode || 301;

    // Check if target is an external URL
    if (finalTarget.startsWith('http://') || finalTarget.startsWith('https://')) {
      break;
    }

    let nextPath = finalTarget.trim().toLowerCase();
    if (!nextPath.startsWith('/')) nextPath = '/' + nextPath;
    if (nextPath.length > 1 && nextPath.endsWith('/')) nextPath = nextPath.slice(0, -1);
    current = nextPath;
  }

  if (finalTarget && visited.size > 0) {
    // Record hit analytics asynchronously
    prisma.redirect.updateMany({
      where: {
        OR: [
          { sourcePath: normalized },
          { sourcePath: path }
        ]
      },
      data: {
        hitCount: { increment: 1 },
        lastHitAt: new Date()
      }
    }).catch(() => {});

    return res.redirect(finalStatus, finalTarget);
  }

  next();
}
