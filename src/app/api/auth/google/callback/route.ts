// ==========================================
// FILE: app/api/auth/google/callback/route.ts
// ==========================================
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/authService';
import { SessionManager } from '@/lib/auth/sessionManager';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?error=${error}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?error=missing_code`
    );
  }

  try {
    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokens.id_token) {
      throw new Error('No ID token received from Google');
    }

    // Login with Google ID token
    const { userId } = await AuthService.loginWithGoogle(tokens.id_token);

    // Update login stats
    await AuthService.updateLoginStats(userId);

    // Create session
    await SessionManager.createSession(userId, tokens.email);

    // Redirect to home page with success
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?login=success`);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?error=auth_failed`
    );
  }
}