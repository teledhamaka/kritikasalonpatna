import { cookies } from 'next/headers';
import { AuthService } from './authService';

const COOKIE_NAME = 'kritika_salon_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export class SessionManager {
  static async createSession(userId: string, email: string) {
    const token = AuthService.generateToken(userId, email);
    
    // FIX: Await cookies()
    const cookieStore = await cookies(); 
    
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });
    return token;
  }

  static async getSession() {
    // FIX: Await cookies()
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    
    if (!token) return null;
    const decoded = AuthService.verifyToken(token);
    if (!decoded) return null;

    try {
      const profile = await AuthService.getProfile(decoded.userId);
      return {
        userId: decoded.userId,
        email: decoded.email,
        profile,
      };
    } catch {
      return null;
    }
  }

  static async destroySession() {
    // FIX: Await cookies()
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
  }
}