import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'digitalclik_super_secret_jwt_key_2026';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'digitalclik_super_secret_refresh_key_2026';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  tokenVersion?: number;
}

export interface RefreshPayload {
  userId: string;
  family: string;
  tokenId: string;
}

export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password);
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    return false;
  }
}

export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

export function generateRefreshToken(payload: RefreshPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(token: string): RefreshPayload | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as RefreshPayload;
  } catch (error) {
    return null;
  }
}

// Backward compatibility alias
export function generateToken(payload: JwtPayload): string {
  return generateAccessToken(payload);
}

export function verifyToken(token: string): JwtPayload | null {
  return verifyAccessToken(token);
}
