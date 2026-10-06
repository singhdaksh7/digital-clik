import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/auth.js';
import { prisma } from '../lib/prisma.js';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
    });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyAccessToken(token);

  if (!payload) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Token is invalid or expired' }
    });
  }

  try {
    const dbUser = await prisma.adminUser.findUnique({
      where: { id: payload.userId },
      select: { status: true, role: true, tokenVersion: true }
    });

    if (!dbUser || dbUser.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        error: { code: 'ACCOUNT_DISABLED', message: 'Account is inactive or disabled' }
      });
    }

    if (payload.tokenVersion !== undefined && payload.tokenVersion !== dbUser.tokenVersion) {
      return res.status(401).json({
        success: false,
        error: { code: 'SESSION_REVOKED', message: 'Session has been invalidated due to password change or logout' }
      });
    }

    req.user = {
      ...payload,
      role: dbUser.role,
      tokenVersion: dbUser.tokenVersion
    };

    next();
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Authentication verification failed' }
    });
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Insufficient role permissions' }
      });
    }

    next();
  };
}
