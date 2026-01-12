// ==========================================
// FILE: app/api/auth/google/route.ts
// ==========================================
import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

export async function GET(request: NextRequest) {
  try {
    // Build Google OAuth URL
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    
    googleAuthUrl.searchParams.append('client_id', GOOGLE_CLIENT_ID);
    googleAuthUrl.searchParams.append('redirect_uri', GOOGLE_REDIRECT_URI);
    googleAuthUrl.searchParams.append('response_type', 'code');
    googleAuthUrl.searchParams.append('scope', 'openid email profile');
    googleAuthUrl.searchParams.append('access_type', 'offline');
    googleAuthUrl.searchParams.append('prompt', 'select_account');

    // Redirect to Google (users will see Google's account chooser, NOT Supabase)
    return NextResponse.redirect(googleAuthUrl.toString());
  } catch (error) {
    console.error('Google OAuth initiation error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?error=oauth_init_failed`
    );
  }
}