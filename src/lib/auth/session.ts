// lib/auth/session.ts
import { getSession as getJWTSession, TokenPayload } from './jwt';
import { findUserById, findProfileByUserId } from '../db/queries';

export interface SessionData {
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    authProvider: string;
  };
  profile: {
    id: string;
    email: string;
    full_name: string;
    // Changed from ? (undefined) to | null to match Database types
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    birthday: string | null;
    profile_image_url: string | null;
    loyalty_points: number;
    total_bookings: number;
    total_spent: number;
  } | null;
}

export async function getSession(): Promise<TokenPayload | null> {
  return await getJWTSession();
}

export async function getFullSession(): Promise<SessionData | null> {
  const session = await getJWTSession();
  
  if (!session) return null;

  const user = await findUserById(session.userId);
  if (!user) return null;

  const profile = await findProfileByUserId(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      emailVerified: user.email_verified,
      authProvider: user.auth_provider,
    },
    // We cast this to SessionData['profile'] to ensure the types align
    profile: profile as SessionData['profile'],
  };
}