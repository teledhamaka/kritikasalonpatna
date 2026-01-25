// ============================================================================
// FILE: app/api/auth/password-reset/request/route.ts
// Request password reset (send OTP)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/db/users';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await findUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No account found with this email address' },
        { status: 404 }
      );
    }

    // Check if user signed up with Google
    if (user.signup_method === 'google' || !user.password_hash) {
      return NextResponse.json(
        { success: false, error: 'This email is associated with a Google account. Please sign in with Google instead.' },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database (add these columns to profiles table if not exist)
    const supabase = createServerSupabaseClient();
    const { error } = await supabase
      .from('profiles')
      .update({
        password_reset_otp: otp,
        password_reset_otp_expiry: otpExpiry.toISOString(),
      })
      .eq('id', user.id);

    if (error) throw error;

    // TODO: Send OTP via email
    // For now, log it (in production, use email service)
    console.log(`Password reset OTP for ${email}: ${otp}`);

    // In production, you would send email here:
    // await sendEmail({
    //   to: email,
    //   subject: 'Password Reset OTP - Kritika Salon',
    //   html: `Your OTP is: ${otp}. Valid for 10 minutes.`
    // });

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your email',
      // REMOVE THIS IN PRODUCTION - only for testing
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });

  } catch (error: any) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}