// ============================================================================
// FILE: app/api/auth/password-reset/reset/route.ts
// Reset password with verified OTP
// ============================================================================
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/db/users';
import { hashPassword } from '@/lib/auth/password-auth';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Verify user and OTP again
    const user = await findUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid request' },
        { status: 404 }
      );
    }

    // Verify OTP
    if (user.password_reset_otp !== otp) {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // Check if OTP expired
    const otpExpiry = new Date(user.password_reset_otp_expiry);
    if (otpExpiry < new Date()) {
      return NextResponse.json(
        { success: false, error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password and clear OTP
    const supabase = createServerSupabaseClient();
    const { error } = await supabase
      .from('profiles')
      .update({
        password_hash: passwordHash,
        password_reset_otp: null,
        password_reset_otp_expiry: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
    });

  } catch (error: any) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}