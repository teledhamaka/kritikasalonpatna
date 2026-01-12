// ==========================================
// FILE: app/api/auth/profile/route.ts
// ==========================================
import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@/lib/auth/sessionManager';
import { AuthService } from '@/lib/auth/authService';

export async function PATCH(request: NextRequest) {
  try {
    const session = await SessionManager.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const updates = await request.json();

    // Update profile
    const updatedProfile = await AuthService.updateProfile(session.userId, updates);

    return NextResponse.json({
      success: true,
      user: updatedProfile,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Profile update failed' },
      { status: 500 }
    );
  }
}