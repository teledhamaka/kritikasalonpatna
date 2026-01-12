// ==========================================
// FILE: app/api/auth/login/route.ts
// ==========================================
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/authService';
import { SessionManager } from '@/lib/auth/sessionManager';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Login
    const { user } = await AuthService.loginWithEmail(email, password);

    // Update login stats
    await AuthService.updateLoginStats(user.id);

    // Create session
    await SessionManager.createSession(user.id, user.email!);

    // Get full profile
    const profile = await AuthService.getProfile(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        ...profile,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    
    let errorMessage = 'Login failed. Please try again.';
    if (error.message.includes('Invalid login credentials')) {
      errorMessage = 'Invalid email or password.';
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 401 }
    );
  }
}