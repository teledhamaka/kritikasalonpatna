// app/auth/callback/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');
  const next = requestUrl.searchParams.get('next') || '/';

  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/';
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  // --- Password recovery flow ---
  if (type === 'recovery' && token_hash) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: 'recovery' });
    if (error) {
      return NextResponse.redirect(`${requestUrl.origin}/login?error=recovery_failed`);
    }
    return NextResponse.redirect(`${requestUrl.origin}/reset-password`);
  }

  // --- OAuth (Google) / Email confirmation flow ---
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('exchangeCodeForSession error:', error);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=oauth_failed`);
    }

    // Get user and upsert profile
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        first_name: user.user_metadata?.full_name?.split(' ')[0] || '',
        last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
        profile_image_url: user.user_metadata?.avatar_url || '',
        signup_method: user.app_metadata?.provider === 'google' ? 'google' : 'email',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    }

    return NextResponse.redirect(`${requestUrl.origin}${safeNext}`);
  }

  // Fallback
  return NextResponse.redirect(`${requestUrl.origin}/login`);
}