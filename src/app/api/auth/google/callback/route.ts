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

  console.log('📥 Google callback received:', { 
    code: code ? 'present' : 'missing', 
    error,
    url: request.url 
  });

  if (error) {
    console.error('❌ Google OAuth error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?error=${error}`
    );
  }

  if (!code) {
    console.error('❌ No code received');
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?error=missing_code`
    );
  }

  try {
    // Step 1: Exchange code for tokens
    console.log('🔄 Exchanging code for tokens...');
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

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ Token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        body: errorText
      });
      throw new Error(`Token exchange failed: ${tokenResponse.status}`);
    }

    const tokens = await tokenResponse.json();
    console.log('✅ Tokens received:', { 
      hasIdToken: !!tokens.id_token,
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiresIn: tokens.expires_in
    });

    if (!tokens.id_token) {
      throw new Error('No ID token received from Google');
    }

    // Step 2: Login with Google ID token
    console.log('🔄 Logging in with ID token via AuthService...');
    const loginResult = await AuthService.loginWithGoogle(tokens.id_token);
    console.log('✅ Login result:', loginResult);

    // Validate that we have the required user data
    if (!loginResult?.userId || !loginResult?.email) {
      console.error('❌ Missing userId or email from AuthService.loginWithGoogle', loginResult);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=missing_user_data`
      );
    }

    // Step 3: Update login stats
    console.log('🔄 Updating login stats for user:', loginResult.userId);
    await AuthService.updateLoginStats(loginResult.userId);
    console.log('✅ Login stats updated');

    // Step 4: Create session
    console.log('🔄 Creating session for:', loginResult.email);
    await SessionManager.createSession(loginResult.userId, loginResult.email);
    console.log('✅ Session created');

    // Success! Redirect to home
    console.log('🎉 Google login successful, redirecting to home');
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?login=success`);
    
  } catch (error) {
    console.error('❌ Google OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?error=auth_failed`
    );
  }
}