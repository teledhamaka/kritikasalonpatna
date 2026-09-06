'use client';

import Link from 'next/link';
import { Check, CalendarDays, Phone, MessageCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  const whatsappText = `Hi Kritika Salon, I have booked an appointment${bookingId ? ` (Booking ID: ${bookingId})` : ''}. Please confirm.`;

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-brand-lg border border-[rgba(184,102,122,0.12)] p-7 text-center">
        <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="font-serif text-2xl text-plum">Appointment request received 🌸</h1>
        <p className="mt-2 text-sm text-plum-light">
          Thank you for booking with Kritika Salon. We will contact you shortly to confirm your appointment.
        </p>

        {bookingId && (
          <div className="mt-5 rounded-2xl bg-blush p-4">
            <div className="text-[11px] text-plum-light">Booking ID</div>
            <div className="mt-1 font-semibold text-plum tracking-wide">{bookingId}</div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <a href="tel:+919650461390" className="rounded-xl bg-plum text-white py-3 text-sm font-medium flex items-center justify-center gap-2">
            <Phone className="w-4 h-4" /> Call
          </a>
          <a href={`https://wa.me/919650461390?text=${encodeURIComponent(whatsappText)}`} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-green-500 text-white py-3 text-sm font-medium flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </a>
        </div>

        <Link href="/" className="mt-5 inline-flex items-center justify-center gap-2 text-sm text-rose-brand font-medium">
          <CalendarDays className="w-4 h-4" /> Back to salon
        </Link>
      </div>
    </main>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <SuccessContent />
    </Suspense>
  );
}
