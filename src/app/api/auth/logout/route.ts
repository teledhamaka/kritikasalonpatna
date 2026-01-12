// ==========================================
// FILE: app/api/auth/logout/route.ts
// ==========================================
import { NextResponse } from 'next/server';
import { SessionManager } from '@/lib/auth/sessionManager';

export async function POST() {
  try {
    await SessionManager.destroySession();

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
