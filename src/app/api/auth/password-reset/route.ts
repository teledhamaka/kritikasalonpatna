// ==========================================
// FILE: app/api/auth/reset-password/route.ts
// ==========================================
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/authService';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await AuthService.resetPassword(email);

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to send password reset email' },
      { status: 500 }
    );
  }
}