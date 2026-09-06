'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setReady(Boolean(data.user)));
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirm) return setError('Passwords do not match.');
    setSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (updateError) return setError(updateError.message);
    setSuccess(true);
    setTimeout(() => router.replace('/login'), 1500);
  };

  if (!ready && !success) {
    return <main className="min-h-screen bg-cream flex items-center justify-center text-sm text-plum-light">Checking reset link…</main>;
  }

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-brand-lg border border-[rgba(184,102,122,0.1)] p-6">
        <h1 className="font-serif text-2xl text-plum">Choose a new password</h1>
        <p className="mt-1 text-sm text-plum-light">Use at least 6 characters.</p>
        {error && <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</div>}
        {success ? (
          <div className="mt-5 rounded-xl bg-green-50 p-3 text-sm text-green-700">Password updated. Redirecting to sign in…</div>
        ) : !ready ? (
          <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">This reset link is invalid or expired.</div>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-4">
            <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="New password" autoComplete="new-password" className="inp w-full" />
            <input type="password" required minLength={6} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm password" autoComplete="new-password" className="inp w-full" />
            <button disabled={saving} className="w-full rounded-xl bg-plum text-white py-3 text-sm font-medium disabled:opacity-50">{saving ? 'Saving…' : 'Update password'}</button>
          </form>
        )}
        <Link href="/login" className="mt-5 inline-block text-xs text-rose-brand">Back to sign in</Link>
      </div>
    </main>
  );
}
