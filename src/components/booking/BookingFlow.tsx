'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Check, ChevronLeft, Clock, MessageCircle, Phone, User, X } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';

type BookingDraft = {
  date: string;
  time: string;
  name: string;
  phone: string;
  specialInstructions: string;
};

const DRAFT_KEY = 'kr-booking-draft';

const TIME_SLOTS = [
  ['10:00', '10:00 AM'],
  ['11:00', '11:00 AM'],
  ['12:00', '12:00 PM'],
  ['13:00', '1:00 PM'],
  ['14:00', '2:00 PM'],
  ['15:00', '3:00 PM'],
  ['16:00', '4:00 PM'],
  ['17:00', '5:00 PM'],
  ['18:00', '6:00 PM'],
] as const;

interface BookingFlowProps {
  onBack?: () => void;
}

function getToday() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

export default function BookingFlow({ onBack }: BookingFlowProps) {
  const router = useRouter();
  const { cart, getSubtotal, getTaxAmount, getTotalAmount, totalDuration, createBooking, loading: bookingLoading, profileDefaults } = useBooking();
  const { profile, isLoggedIn } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<BookingDraft>({
    date: '',
    time: '',
    name: profileDefaults.name,
    phone: profileDefaults.phone,
    specialInstructions: '',
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as Partial<BookingDraft>;
        setForm(current => ({ ...current, ...draft }));
      }
    } catch {}
  }, []);

  useEffect(() => {
    setForm(current => ({
      ...current,
      name: current.name || profileDefaults.name,
      phone: current.phone || profileDefaults.phone,
    }));
  }, [profileDefaults.name, profileDefaults.phone]);

  const subtotal = getSubtotal();
  const tax = getTaxAmount();
  const total = getTotalAmount();
  const minDate = getToday();

  const canContinue = Boolean(form.date && form.time);
  const canConfirm = Boolean(form.name.trim() && form.phone.trim());

  const serviceSummary = useMemo(
    () => cart.map(item => `${item.name || item.title} × ${item.quantity}`).join(', '),
    [cart]
  );

  const goBack = () => {
    if (step === 2) setStep(1);
    else if (onBack) onBack();
    else router.push('/cart');
  };

  const saveDraftAndLogin = () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    router.push('/login?redirect=/booking');
  };

  const handleConfirm = async () => {
    setError('');

    if (!form.name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!form.phone.trim()) {
      setError('Please enter your mobile number so we can confirm the appointment.');
      return;
    }

    if (!isLoggedIn || !profile?.id) {
      saveDraftAndLogin();
      return;
    }

    setSaving(true);
    try {
      const result = await createBooking({
        date: form.date,
        time: form.time,
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: '',
        stylist: 'any',
        specialInstructions: form.specialInstructions.trim(),
        paymentMethod: 'pay_at_salon',
      });

      if (!result.success) {
        setError(result.error || 'We could not complete your booking. Please try again.');
        return;
      }

      localStorage.removeItem(DRAFT_KEY);
      router.replace(`/booking/success?bookingId=${encodeURIComponent(result.bookingId || '')}`);
    } finally {
      setSaving(false);
    }
  };

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-brand-lg p-7 text-center">
          <div className="text-4xl mb-4">💆‍♀️</div>
          <h1 className="font-serif text-2xl text-plum">Choose a service first</h1>
          <p className="mt-2 text-sm text-plum-light">Select one or more services and your appointment will be ready to book.</p>
          <button onClick={() => router.push('/')} className="mt-6 w-full rounded-xl bg-plum text-white py-3 font-medium">
            Explore Services
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[rgba(184,102,122,0.12)]">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={goBack} className="p-2 -ml-2 text-plum-light hover:text-plum" aria-label="Go back">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h1 className="font-serif text-lg text-plum">Book Appointment</h1>
            <p className="text-[11px] text-plum-light">{step === 1 ? 'Choose your time' : 'Almost done'}</p>
          </div>
          <button onClick={() => router.push('/')} className="p-2 -mr-2 text-plum-light hover:text-plum" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-5 pb-10">
        <div className="flex items-center gap-2 mb-5">
          <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-rose-brand' : 'bg-gray-200'}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-rose-brand' : 'bg-gray-200'}`} />
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          <section className="bg-white rounded-3xl shadow-brand-sm border border-[rgba(184,102,122,0.1)] p-5 sm:p-6">
            {error && (
              <div className="mb-5 rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-700">{error}</div>
            )}

            {step === 1 ? (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-blush flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-rose-brand" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-plum">When would you like to visit?</h2>
                    <p className="text-xs text-plum-light">Choose your preferred date and time.</p>
                  </div>
                </div>

                <label className="block text-xs font-medium text-plum mb-2">Date</label>
                <input
                  type="date"
                  min={minDate}
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value, time: '' })}
                  className="w-full rounded-xl border border-[rgba(184,102,122,0.2)] px-4 py-3 text-sm text-plum focus:outline-none focus:ring-2 focus:ring-rose-brand/30"
                />

                <div className="mt-5">
                  <label className="block text-xs font-medium text-plum mb-2">Available time</label>
                  <div className="grid grid-cols-3 gap-2">
                    {TIME_SLOTS.map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        disabled={!form.date}
                        onClick={() => setForm({ ...form, time: value })}
                        className={`rounded-xl py-3 text-sm font-medium transition-all ${
                          form.time === value
                            ? 'bg-plum text-white'
                            : 'bg-blush text-plum hover:bg-rose-100'
                        } disabled:opacity-40`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] text-plum-light flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Final slot availability should be confirmed by the salon.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={!canContinue}
                  onClick={() => { setError(''); setStep(2); }}
                  className="mt-6 w-full rounded-xl bg-plum text-white py-3 font-medium disabled:opacity-40"
                >
                  Continue
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-blush flex items-center justify-center">
                    <User className="w-5 h-5 text-rose-brand" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-plum">Your details</h2>
                    <p className="text-xs text-plum-light">Only what we need to confirm your visit.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-plum mb-2">Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                      autoComplete="name"
                      className="w-full rounded-xl border border-[rgba(184,102,122,0.2)] px-4 py-3 text-sm text-plum focus:outline-none focus:ring-2 focus:ring-rose-brand/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-plum mb-2">Mobile number *</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      placeholder="10-digit mobile number"
                      autoComplete="tel"
                      inputMode="tel"
                      className="w-full rounded-xl border border-[rgba(184,102,122,0.2)] px-4 py-3 text-sm text-plum focus:outline-none focus:ring-2 focus:ring-rose-brand/30"
                    />
                  </div>

                  <details className="rounded-xl bg-blush px-4 py-3">
                    <summary className="cursor-pointer text-xs font-medium text-plum">+ Add a note (optional)</summary>
                    <textarea
                      value={form.specialInstructions}
                      onChange={e => setForm({ ...form, specialInstructions: e.target.value })}
                      rows={3}
                      placeholder="Anything we should know?"
                      className="mt-3 w-full rounded-lg border border-[rgba(184,102,122,0.18)] px-3 py-2 text-sm bg-white"
                    />
                  </details>
                </div>

                {!isLoggedIn && (
                  <div className="mt-5 rounded-xl bg-blush p-3 text-xs text-plum-mid">
                    <strong>Almost there.</strong> We’ll ask you to sign in once, then return you here with your details saved.
                  </div>
                )}

                <button
                  type="button"
                  disabled={!canConfirm || saving || bookingLoading}
                  onClick={handleConfirm}
                  className="mt-6 w-full rounded-xl bg-plum text-white py-3.5 font-medium disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {saving || bookingLoading ? 'Confirming…' : isLoggedIn ? 'Confirm Appointment' : 'Continue to Sign In'}
                </button>

                <p className="mt-3 text-center text-[11px] text-plum-light flex items-center justify-center gap-1">
                  <MessageCircle className="w-3 h-3" /> We’ll call or WhatsApp to confirm.
                </p>
              </div>
            )}
          </section>

          <aside className="h-fit bg-white rounded-3xl shadow-brand-sm border border-[rgba(184,102,122,0.1)] p-5 lg:sticky lg:top-24">
            <h3 className="font-semibold text-plum">Your selection</h3>
            <div className="mt-3 space-y-2">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between gap-3 text-xs text-plum-mid">
                  <span>{item.name || item.title} × {item.quantity}</span>
                  <span className="font-medium whitespace-nowrap">₹{(Number(item.discounted_price ?? item.price ?? item.base_price ?? 0) * item.quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-plum-light"><span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span></div>
              <div className="flex justify-between text-plum-light"><span>GST</span><span>₹{tax.toFixed(0)}</span></div>
              <div className="flex justify-between font-semibold text-plum pt-2 border-t"><span>Total</span><span>₹{total.toFixed(0)}</span></div>
            </div>
            <div className="mt-4 text-[11px] text-plum-light">
              <div>Duration: {totalDuration} min</div>
              {form.date && form.time && <div className="mt-1">{form.date} · {TIME_SLOTS.find(([value]) => value === form.time)?.[1] || form.time}</div>}
            </div>
            <div className="mt-4 flex gap-2 text-[11px] text-plum-light">
              <Phone className="w-3.5 h-3.5 text-rose-brand" /> +91 96504 61390
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
