'use client';

// ============================================================
// FILE: app/login/LoginClient.tsx
//
// KEY CHANGES vs original:
//   ✅ googleLoading from AuthContext → shows "Opening Google…"
//      INSTANTLY when user taps (before redirect happens)
//   ✅ Inline error toasts — no more ?error= in URL redirect
//      → user stays on screen, sees friendly message
//   ✅ msg param (not error) → human-readable source strings
//      'cancelled' | 'google_failed' | 'link_expired'
//   ✅ Google button shows animated state immediately on tap
//   ✅ "Remember me" not shown — Supabase persists by default
//   ✅ No email-first flow — Google is primary CTA (matches India mobile UX)
//   ✅ Disabled state on email form while Google redirect is in flight
// ============================================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, X, Sparkles } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';

// Human-readable messages for msg= params set by callback route
const MSG_MAP: Record<string, string> = {
  cancelled:    'Google sign-in was cancelled. Tap to try again 💕',
  google_failed:'Google sign-in failed. Try again or use email.',
  link_expired: 'That link has expired. Please request a new one.',
};

export default function LoginClient() {
  const router        = useRouter();
  const searchParams  = useSearchParams();
  const {
    signIn, signInWithGoogle,
    isLoggedIn, isInitializing,
    loading, googleLoading,
  } = useAuth();
  const { success } = useToast();

  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading,  setFormLoading]  = useState(false);
  const [error,        setError]        = useState('');

  // Show human-readable message from callback route
  useEffect(() => {
    const msg = searchParams.get('msg');
    if (msg && MSG_MAP[msg]) {
      setError(MSG_MAP[msg]);
      window.history.replaceState({}, '', '/login');
    }
  }, [searchParams]);

  // Redirect once session is confirmed
  useEffect(() => {
    if (!isInitializing && isLoggedIn) {
      const redirect = searchParams.get('redirect') ?? '/';
      router.replace(redirect);
    }
  }, [isLoggedIn, isInitializing, router, searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setError('');
    setFormLoading(true);
    try {
      const { error: loginError } = await signIn(email.trim(), password);
      if (loginError) { setError(loginError); return; }
      success('Welcome back! 💕');
    } finally {
      setFormLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    const { error: googleErr } = await signInWithGoogle();
    // If signInWithGoogle returns an error (rare — usually means
    // popup blocked or network fail), show inline — don't redirect
    if (googleErr) setError(googleErr);
    // Otherwise: googleLoading stays true, page redirects to Google
  };

  // Show nothing while restoring session — avoids flash of login form
  // for users who are already logged in
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rose-brand/30 border-t-rose-brand
          rounded-full animate-spin" />
      </div>
    );
  }

  // Any form interaction is blocked while Google redirect is in-flight
  const isRedirecting = googleLoading;

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl shadow-brand-lg
            border border-[rgba(184,102,122,0.1)] overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-plum to-plum-mid p-7 text-center">
            <Link href="/" aria-label="Back to home"
              className="absolute left-4 top-4 text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <button onClick={() => router.push('/')} aria-label="Skip"
              className="absolute right-4 top-4 text-white/60 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 mx-auto rounded-full bg-white/10 border border-white/20
              flex items-center justify-center mb-4">
              <span className="text-2xl">💄</span>
            </div>
            <h1 className="font-serif text-2xl text-white">Welcome back</h1>
            <p className="text-[12px] text-white/60 mt-1">Your beauty journey continues ✨</p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">

            {/* ── Google CTA — PRIMARY ───────────────────────────────
                Always shown first. India mobile users expect Google
                to be the first and easiest option.
                Shows animated state instantly on tap. ──────────── */}
            <button
              onClick={handleGoogle}
              disabled={isRedirecting || formLoading}
              className="relative w-full flex items-center justify-center gap-3 py-3.5
                rounded-xl bg-cream border border-[rgba(184,102,122,0.2)]
                text-[13px] text-plum font-medium
                hover:border-rose-brand hover:bg-blush
                active:scale-[0.99] transition-all duration-200
                disabled:opacity-60 overflow-hidden"
            >
              {/* Shimmer overlay while redirecting */}
              {isRedirecting && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r
                    from-transparent via-white/40 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                />
              )}
              {isRedirecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-plum/30 border-t-plum
                    rounded-full animate-spin" />
                  Opening Google…
                </>
              ) : (
                <>
                  <FcGoogle className="w-5 h-5 flex-shrink-0" />
                  Continue with Google
                </>
              )}
            </button>

            {/* Inline error — replaces ?error= redirect approach */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 p-3 rounded-xl
                  bg-[#FFF0F3] border border-[rgba(155,35,53,0.2)]"
              >
                <span className="text-sm mt-0.5">💔</span>
                <p className="text-[12px] text-[#9B2335] leading-relaxed">{error}</p>
              </motion.div>
            )}

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[rgba(184,102,122,0.12)]" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-[11px] text-plum-light">
                  or sign in with email
                </span>
              </div>
            </div>

            {/* ── Email form ──────────────────────────────────────── */}
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="inp-label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2
                    w-4 h-4 text-rose-brand/50" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    disabled={isRedirecting}
                    required
                    placeholder="yourname@email.com"
                    autoComplete="email"
                    inputMode="email"
                    className="inp pl-10 disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="inp-label" style={{ margin: 0 }}>Password</label>
                  <Link href="/forgot-password"
                    className="text-[11px] text-rose-brand hover:text-rose-deep transition-colors">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2
                    w-4 h-4 text-rose-brand/50" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    disabled={isRedirecting}
                    required
                    placeholder="Your password"
                    autoComplete="current-password"
                    className="inp pl-10 pr-11 disabled:opacity-50"
                  />
                  <button type="button"
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2
                      text-plum-light hover:text-plum transition-colors">
                    {showPassword
                      ? <EyeOff className="w-4 h-4" />
                      : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={formLoading || isRedirecting || !email || !password}
                className="w-full py-3 rounded-pill bg-plum text-gold font-medium
                  text-[13px] tracking-wide hover:bg-plum-mid active:scale-[0.99]
                  transition-all duration-200 disabled:opacity-50
                  flex items-center justify-center gap-2"
              >
                {formLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-gold/30 border-t-gold
                      rounded-full animate-spin" />
                    Signing in…
                  </>
                ) : 'Sign In 💕'}
              </button>
            </form>

            <p className="text-center text-[12px] text-plum-light">
              New here?{' '}
              <Link href="/signup"
                className="text-rose-brand font-medium hover:text-rose-deep transition-colors">
                Create your account
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Trust badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 bg-white rounded-2xl shadow-brand-sm
            border border-[rgba(184,102,122,0.1)] p-4 flex items-center gap-3"
        >
          <Sparkles className="w-6 h-6 text-rose-brand flex-shrink-0" />
          <div>
            <div className="text-[12px] font-medium text-plum">
              Patna's most loved parlour 🌸
            </div>
            <div className="text-[11px] text-plum-light">
              Trusted by 2,000+ women · Est. 2018
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}