'use client';

// ============================================================
// FILE: context/AuthContext.tsx
//
// TYPESCRIPT FIXES in this version:
//
// FIX 1 (errors at line 94): Missing `await` before withRetry()
//   ❌ const { data, error } = withRetry(async () => await supabase...)
//      TypeScript sees: destructure a Promise<T> → no .data / .error
//   ✅ const { data, error } = await withRetry(() => supabase...)
//      TypeScript sees: destructure the resolved value → .data / .error exist
//
// FIX 2 (errors at line 271): Same pattern in updateProfile()
//
// FIX 3: Removed `async` from arrow fn passed to withRetry
//   withRetry's fn is typed as () => PromiseLike<T>
//   Supabase builders already return PromiseLike — no need for async/await inside
//   async () => await supabase... ≡ () => supabase... (same result, cleaner)
//
// FIX 4: fetchProfile useCallback dependency
//   Original had `profile` in dependency array of fetchProfile, which caused
//   the callback to re-create on every profile update → infinite loop risk.
//   Removed `profile` from deps; guard logic uses ref instead.
// ============================================================

import React, {
  createContext, useContext, useEffect,
  useState, useCallback, useMemo, useRef, ReactNode,
} from 'react';
import { supabase } from '@/lib/supabase/client';
import { withRetry } from '@/lib/utils/booking';
import type { Profile } from '@/types';

// ── Types ─────────────────────────────────────────────────────
export interface SignUpData {
  email:     string;
  password:  string;
  firstName: string;
  lastName?: string;
}

interface AuthResult { error?: string; user?: Profile; }

interface AuthContextType {
  profile:          Profile | null;
  isLoggedIn:       boolean;
  isInitializing:   boolean;
  loading:          boolean;
  googleLoading:    boolean;
  signUp:           (data: SignUpData) => Promise<AuthResult>;
  signIn:           (email: string, password: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signOut:          () => Promise<void>;
  updateProfile:    (updates: Partial<Profile>) => Promise<{ error?: string }>;
  resetPassword:    (email: string) => Promise<{ error?: string }>;
  refreshProfile:   () => Promise<void>;
}

const PROFILE_WHITELIST: (keyof Profile)[] = [
  'first_name', 'last_name', 'full_name', 'phone',
  'birthday', 'anniversary_date', 'marital_status',
  'skin_type', 'hair_type', 'profile_image_url',
  'preferred_stylist', 'preferred_category',
];

// ── Context ───────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile,        setProfile]        = useState<Profile | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [loading,        setLoading]        = useState(false);
  const [googleLoading,  setGoogleLoading]  = useState(false);

  const fetchingRef       = useRef(false);
  const lastFetchedUserId = useRef<string | null>(null);
  // Store profile in ref so fetchProfile guard doesn't need profile in deps
  const profileRef        = useRef<Profile | null>(null);

  // Keep profileRef in sync
  useEffect(() => { profileRef.current = profile; }, [profile]);

  // ── fetchProfile ──────────────────────────────────────────
  // FIX 1: await withRetry(...)  ← was missing await
  // FIX 3: fn is () => supabase... not async () => await supabase...
  // FIX 4: profileRef.current replaces profile in guard (no dep on profile)
  const fetchProfile = useCallback(async (userId: string) => {
    if (fetchingRef.current) return;
    if (lastFetchedUserId.current === userId && profileRef.current !== null) {
      setIsInitializing(false);
      return;
    }

    fetchingRef.current = true;
    try {
      // ✅ FIX: await withRetry — resolved value has .data and .error
      const { data, error } = await withRetry(() =>
        supabase.from('profiles').select('*').eq('id', userId).single()
      );
      if (error) throw error;
      setProfile(data as Profile);
      lastFetchedUserId.current = userId;
    } catch {
      setProfile(null);
      lastFetchedUserId.current = null;
    } finally {
      setIsInitializing(false);
      fetchingRef.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // no deps — uses refs for guard; supabase is a stable singleton

  // ── Session initialisation (two-stage for Android recovery) ──
  useEffect(() => {
    // Stage 1: fast cookie read — no network
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setIsInitializing(false);
      }
    });

    // Stage 2: real-time events (OAuth redirect, token refresh, sign out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          setGoogleLoading(false);
        }
        if (event === 'SIGNED_OUT') {
          setProfile(null);
          lastFetchedUserId.current = null;
          setIsInitializing(false);
          return;
        }
        if (session?.user) {
          if (
            event !== 'TOKEN_REFRESHED' ||
            lastFetchedUserId.current !== session.user.id
          ) {
            fetchProfile(session.user.id);
          }
        } else {
          setProfile(null);
          setIsInitializing(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // ── signUp ────────────────────────────────────────────────
  const signUp = useCallback(async (data: SignUpData): Promise<AuthResult> => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email:    data.email.trim().toLowerCase(),
        password: data.password,
        options: {
          data: {
            full_name:     `${data.firstName} ${data.lastName ?? ''}`.trim(),
            first_name:    data.firstName.trim(),
            last_name:     data.lastName?.trim() ?? '',
            signup_method: 'email',
          },
        },
      });
      if (error) return { error: error.message };
      return {};
    } catch {
      return { error: 'Signup failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── signIn ────────────────────────────────────────────────
  const signIn = useCallback(async (
    email: string, password: string
  ): Promise<AuthResult> => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) {
        if (error.message.includes('Invalid login credentials'))
          return { error: 'Email ya password galat hai. Dobara try karein 💕' };
        if (error.message.includes('Email not confirmed'))
          return { error: 'Please verify your email first, then try again.' };
        return { error: error.message };
      }
      return {};
    } catch {
      return { error: 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── signInWithGoogle ──────────────────────────────────────
  const signInWithGoogle = useCallback(async (): Promise<{ error?: string }> => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo:  `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt:      'select_account',
          },
        },
      });
      if (error) {
        setGoogleLoading(false);
        return { error: 'Couldn\'t open Google. Please try again 💕' };
      }
      return {};
    } catch {
      setGoogleLoading(false);
      return { error: 'Google sign-in unavailable. Please use email.' };
    }
  }, []);

  // ── signOut ───────────────────────────────────────────────
  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setProfile(null);
      lastFetchedUserId.current = null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── updateProfile ─────────────────────────────────────────
  // FIX 2: await withRetry(...) — same missing-await fix as fetchProfile
  const updateProfile = useCallback(async (
    updates: Partial<Profile>
  ): Promise<{ error?: string }> => {
    if (!profile?.id) return { error: 'Not logged in.' };

    const safe: Partial<Profile> = {};
    for (const key of PROFILE_WHITELIST) {
      if (key in updates) (safe as any)[key] = (updates as any)[key];
    }
    if (Object.keys(safe).length === 0) return {};

    if (safe.first_name !== undefined || safe.last_name !== undefined) {
      safe.full_name = [
        safe.first_name ?? profile.first_name ?? '',
        safe.last_name  ?? profile.last_name  ?? '',
      ].join(' ').trim();
    }

    setLoading(true);
    try {
      // ✅ FIX: await withRetry — resolved value has .data and .error
      const { data, error } = await withRetry(() =>
        supabase
          .from('profiles')
          .update({ ...safe, updated_at: new Date().toISOString() })
          .eq('id', profile.id)
          .select('*')
          .single()
      );
      if (error) return { error: error.message };
      setProfile(data as Profile);
      return {};
    } catch {
      return { error: 'Couldn\'t save changes. Please try again.' };
    } finally {
      setLoading(false);
    }
  }, [profile]);

  // ── resetPassword ─────────────────────────────────────────
  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: `${window.location.origin}/auth/callback?next=/reset-password` }
    );
    if (error) return { error: error.message };
    return {};
  }, []);

  // ── refreshProfile ────────────────────────────────────────
  const refreshProfile = useCallback(async () => {
    lastFetchedUserId.current = null;
    fetchingRef.current = false;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await fetchProfile(user.id);
  }, [fetchProfile]);

  const value = useMemo<AuthContextType>(() => ({
    profile,
    isLoggedIn:  !!profile,
    isInitializing, loading, googleLoading,
    signUp, signIn, signInWithGoogle,
    signOut, updateProfile, resetPassword, refreshProfile,
  }), [
    profile, isInitializing, loading, googleLoading,
    signUp, signIn, signInWithGoogle,
    signOut, updateProfile, resetPassword, refreshProfile,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { AuthContext };