// ============================================================
// FILE: lib/supabase/client.ts
// Browser-side Supabase client — @supabase/ssr
//
// KEY CHANGES vs original:
//  ✅ persistSession: true  — survives tab-close on Android Chrome
//  ✅ autoRefreshToken: true — no "session expired" on long visits
//  ✅ detectSessionInUrl: true — catches token after OAuth redirect
//     (critical for Instagram / WhatsApp in-app browsers)
//  ✅ storageKey namespaced — avoids conflicts if user has multiple
//     tabs or another Supabase project open
// ============================================================
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession:    true,   // keep session across browser restarts
        autoRefreshToken:  true,   // silently refresh before expiry
        detectSessionInUrl: true,  // parse token from URL hash after redirect
        storageKey: 'kritika-salon-auth', // namespaced localStorage key
        flowType: 'pkce',          // PKCE is more secure + works in Safari
      },
    }
  );
}

// Singleton — import this everywhere in Client Components
export const supabase = createClient();