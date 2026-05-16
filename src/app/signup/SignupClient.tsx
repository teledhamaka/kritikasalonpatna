'use client';

// ============================================================
// FILE: app/signup/SignupClient.tsx
//
// PHILOSOPHY CHANGE (most important):
//   OLD: 2-step form collecting name + email + password +
//        mobile + DOB + marital status + anniversary
//   NEW: Single step — name + email + password. DONE.
//
//   Everything else is collected PROGRESSIVELY:
//     • Phone     → during first booking ("for reminders")
//     • DOB       → after first login ("unlock birthday offers")
//     • Anniversary → during bridal promotions
//
//   WHY THIS CONVERTS BETTER FOR SALON AUDIENCE:
//   Instagram-generation users abandon long forms instantly.
//   A 2-step form on mobile with 7+ fields will lose 60-80%
//   of signups. Google-first is even better (zero fields).
//   The minimal email form is only for users who actively
//   choose NOT to use Google.
//
// KEY CHANGES vs original:
//   ✅ Single step only (no step 2 upfront)
//   ✅ Google is primary CTA with instant loading state
//   ✅ Password: min 6 chars, no complexity enforcement
//      (we are a salon, not a bank)
//   ✅ DOB and marital status REMOVED from signup
//      (collected via progressive profiling hooks after booking)
//   ✅ Inline errors (no redirect)
//   ✅ After signup: welcome toast → automatic redirect (no verify wall)
// ============================================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Eye, EyeOff, Mail, Lock, User as UserIcon, X, ArrowLeft,
} from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';

// Simple password strength — 3 levels, no complexity gatekeeping
function pwStrength(pw: string): 0 | 1 | 2 | 3 {
  if (pw.length < 6) return 0;
  let s = 0;
  if (pw.length >= 8)       s++;
  if (/[A-Z]/.test(pw))     s++;
  if (/[0-9!@#$]/.test(pw)) s++;
  return Math.min(s, 3) as 0 | 1 | 2 | 3;
}

const STRENGTH_LABEL = ['Too short', 'Okay', 'Good', 'Strong 🔒'];
const STRENGTH_COLOR = ['bg-[#9B2335]', 'bg-gold', 'bg-rose-brand', 'bg-[#2D7A4F]'];
const STRENGTH_TEXT  = ['text-[#9B2335]', 'text-gold-deep', 'text-rose-brand', 'text-[#2D7A4F]'];

export default function SignupClient() {
  const router        = useRouter();
  const searchParams  = useSearchParams();
  const { signUp, signInWithGoogle, isLoggedIn, isInitializing,
          loading, googleLoading } = useAuth();
  const { success } = useToast();

  const [firstName,    setFirstName]    = useState('');
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPw,       setShowPw]       = useState(false);
  const [error,        setError]        = useState('');

  const strength = pwStrength(password);

  // Redirect if already logged in
  useEffect(() => {
    if (!isInitializing && isLoggedIn) router.replace('/');
  }, [isLoggedIn, isInitializing, router]);

  // Handle error from /auth/callback (Google failed)
  useEffect(() => {
    const msg = searchParams.get('msg');
    if (msg === 'google_failed') {
      setError('Google sign-up failed. Please try again or use email.');
      window.history.replaceState({}, '', '/signup');
    }
  }, [searchParams]);

  const handleGoogle = async () => {
    setError('');
    const { error: googleErr } = await signInWithGoogle();
    if (googleErr) setError(googleErr);
    // Otherwise redirect is in-flight — googleLoading handles UX
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = firstName.trim();
    if (!name)                   return setError('Tell us your name 💕');
    if (!/\S+@\S+\.\S+/.test(email)) return setError('Enter a valid email address.');
    if (password.length < 6)     return setError('Password must be at least 6 characters.');

    setError('');
    const { error: signupErr } = await signUp({
      email:     email.trim(),
      password,
      firstName: name,
    });

    if (signupErr) {
      if (signupErr.includes('already registered')) {
        setError('This email is already registered. Try signing in 💕');
      } else {
        setError(signupErr);
      }
      return;
    }

    // onAuthStateChange fires → isLoggedIn becomes true → useEffect redirects
    success('Welcome to Kritika Salon! 🌸');
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rose-brand/30 border-t-rose-brand
          rounded-full animate-spin" />
      </div>
    );
  }

  const isRedirecting = googleLoading;

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-sm">

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-brand-lg
            border border-[rgba(184,102,122,0.1)] overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-plum to-plum-mid p-7 text-center">
            <button onClick={() => router.push('/login')}
              className="absolute left-4 top-4 text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button onClick={() => router.push('/')}
              className="absolute right-4 top-4 text-white/60 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 mx-auto rounded-full bg-white/10 border border-white/20
              flex items-center justify-center mb-4">
              <span className="text-2xl">💅</span>
            </div>
            <h1 className="font-serif text-2xl text-white">Join the club</h1>
            <p className="text-[12px] text-white/60 mt-1">
              Patna's favourite beauty community 🌸
            </p>
          </div>

          <div className="p-6 space-y-4">

            {/* ── Google CTA — PRIMARY ────────────────────────────── */}
            <button
              onClick={handleGoogle}
              disabled={isRedirecting || loading}
              className="relative w-full flex items-center justify-center gap-3 py-3.5
                rounded-xl bg-cream border border-[rgba(184,102,122,0.2)]
                text-[13px] text-plum font-medium
                hover:border-rose-brand hover:bg-blush
                active:scale-[0.99] transition-all duration-200
                disabled:opacity-60 overflow-hidden"
            >
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
                  Sign up with Google
                </>
              )}
            </button>

            {/* Inline error */}
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
                  or with email
                </span>
              </div>
            </div>

            {/* ── Minimal form — just 3 fields ───────────────────── */}
            <form onSubmit={handleSubmit} className="space-y-3.5">

              {/* First name only — last name is optional (collected later) */}
              <div>
                <label className="inp-label">Your First Name *</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2
                    w-4 h-4 text-rose-brand/50" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => { setFirstName(e.target.value); setError(''); }}
                    disabled={isRedirecting}
                    required
                    placeholder="Priya"
                    autoComplete="given-name"
                    className="inp pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="inp-label">Email *</label>
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
                    className="inp pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="inp-label">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2
                    w-4 h-4 text-rose-brand/50" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    disabled={isRedirecting}
                    required
                    placeholder="Min 6 characters"
                    autoComplete="new-password"
                    className="inp pl-10 pr-11"
                  />
                  <button type="button" onClick={() => setShowPw(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2
                      text-plum-light hover:text-plum transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Strength indicator — visible, not gatekeeping */}
                {password && (
                  <div className="mt-1.5">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors
                          ${strength >= i
                            ? STRENGTH_COLOR[strength]
                            : 'bg-[rgba(184,102,122,0.12)]'
                          }`} />
                      ))}
                    </div>
                    <span className={`text-[10px] ${STRENGTH_TEXT[strength]}`}>
                      {STRENGTH_LABEL[strength]}
                    </span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || isRedirecting}
                className="w-full py-3 rounded-pill bg-rose-brand text-white
                  font-medium text-[13px] tracking-wide hover:bg-rose-deep
                  active:scale-[0.99] transition-all duration-200 disabled:opacity-60
                  flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white
                      rounded-full animate-spin" />
                    Creating account…
                  </>
                ) : 'Create My Account 🌸'}
              </button>
            </form>

            {/* Progress hint — sets expectation for progressive profiling */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-blush
              border border-[rgba(184,102,122,0.15)]">
              <span className="text-base">🎁</span>
              <p className="text-[11px] text-plum-mid leading-relaxed">
                Add birthday & phone after signup to unlock birthday surprises
                and booking reminders!
              </p>
            </div>

            <p className="text-center text-[12px] text-plum-light">
              Already have an account?{' '}
              <Link href="/login"
                className="text-rose-brand font-medium hover:text-rose-deep">
                Sign in
              </Link>
            </p>

            <p className="text-[10px] text-plum-light text-center">
              By joining, you agree to our{' '}
              <Link href="/terms" className="text-rose-brand hover:underline">Terms</Link>
              {' & '}
              <Link href="/privacy" className="text-rose-brand hover:underline">Privacy</Link>
            </p>
          </div>
        </motion.div>

        {/* Benefits nudge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 grid grid-cols-3 gap-3"
        >
          {[
            { icon: '🎁', label: 'Birthday offers' },
            { icon: '💎', label: 'Loyalty rewards' },
            { icon: '📅', label: 'Easy booking' },
          ].map(({ icon, label }) => (
            <div key={label}
              className="bg-white rounded-xl p-3 text-center shadow-brand-sm
                border border-[rgba(184,102,122,0.1)]">
              <div className="text-xl mb-1">{icon}</div>
              <div className="text-[10px] text-plum-mid font-medium">{label}</div>
            </div>
          ))}
        </motion.div>

      </div>
    </div>
  );
}