// ==========================================
// FILE: app/api/auth/session/route.ts
// ==========================================
import { NextResponse } from 'next/server';
import { SessionManager } from '@/lib/auth/sessionManager';

export async function GET() {
  try {
    const session = await SessionManager.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: session.userId,
        email: session.email,
        ...session.profile,
      },
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { error: 'Session check failed' },
      { status: 401 }
    );
  }
}