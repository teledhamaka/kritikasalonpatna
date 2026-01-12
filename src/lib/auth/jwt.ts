// lib/auth/jwt.ts
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const SESSION_DURATION = parseInt(process.env.SESSION_DURATION || '2592000'); // 30 days
const COOKIE_NAME = process.env.COOKIE_NAME || 'kritika_auth_token';

export interface TokenPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

export interface SessionData {
  user: {
    id: string;
    email: string;
    name: string;
  };
  expiresAt: number;
}

/**
 * Generate access token (short-lived, 15 minutes)
 */
export function generateAccessToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email, type: 'access' } as TokenPayload,
    JWT_SECRET,
    { expiresIn: '15m' }
  );
}

/**
 * Generate refresh token (long-lived, 30 days)
 */
export function generateRefreshToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email, type: 'refresh' } as TokenPayload,
    JWT_REFRESH_SECRET,
    { expiresIn: SESSION_DURATION }
  );
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    if (decoded.type !== 'access') return null;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
    if (decoded.type !== 'refresh') return null;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Set auth cookies (HTTP-only, secure)
 */
export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === 'production';
  const domain = process.env.COOKIE_DOMAIN || undefined;

  // Access token cookie (15 minutes)
  cookieStore.set(COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 15 * 60, // 15 minutes
    path: '/',
    domain: isProduction ? domain : undefined,
  });

  // Refresh token cookie (30 days)
  cookieStore.set(`${COOKIE_NAME}_refresh`, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
    domain: isProduction ? domain : undefined,
  });
}

/**
 * Get current session from cookies
 */
export async function getSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  return verifyAccessToken(token);
}

/**
 * Clear auth cookies (logout)
 */
export async function clearAuthCookies() {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === 'production';
  const domain = process.env.COOKIE_DOMAIN || undefined;

  cookieStore.delete({
    name: COOKIE_NAME,
    path: '/',
    domain: isProduction ? domain : undefined,
  });

  cookieStore.delete({
    name: `${COOKIE_NAME}_refresh`,
    path: '/',
    domain: isProduction ? domain : undefined,
  });
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(`${COOKIE_NAME}_refresh`)?.value;

  if (!refreshToken) return null;

  const payload = verifyRefreshToken(refreshToken);
  if (!payload) return null;

  // Generate new access token
  const newAccessToken = generateAccessToken(payload.userId, payload.email);

  // Update access token cookie
  const isProduction = process.env.NODE_ENV === 'production';
  const domain = process.env.COOKIE_DOMAIN || undefined;

  cookieStore.set(COOKIE_NAME, newAccessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 15 * 60,
    path: '/',
    domain: isProduction ? domain : undefined,
  });

  return newAccessToken;
}