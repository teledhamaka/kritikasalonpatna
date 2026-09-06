'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ForgotPasswordPage() {
  const { resetPassword, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    const result = await resetPassword(email);
    if (result.error) setError(result.error);
    else setMessage('If an account exists for this email, a password reset link has been sent.');
  };

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-brand-lg border border-[rgba(184,102,122,0.1)] p-6">
        <Link href="/login" className="inline-flex items-center gap-1 text-xs text-plum-light hover:text-plum"><ArrowLeft className="w-4 h-4" /> Back to sign in</Link>
        <h1 className="mt-5 font-serif text-2xl text-plum">Reset your password</h1>
        <p className="mt-1 text-sm text-plum-light">We’ll email you a secure reset link.</p>

        {error && <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</div>}
        {message && <div className="mt-4 rounded-xl bg-green-50 p-3 text-xs text-green-700">{message}</div>}

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-brand/50" />
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="yourname@email.com" autoComplete="email" className="inp pl-10 w-full" />
          </div>
          <button disabled={loading} className="w-full rounded-xl bg-plum text-white py-3 text-sm font-medium disabled:opacity-50">{loading ? 'Sending…' : 'Send reset link'}</button>
        </form>
      </div>
    </main>
  );
}
