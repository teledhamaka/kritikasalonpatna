// components/WhatsAppFloating.tsx
"use client";

import { Phone, MessageCircle } from 'lucide-react';

export default function WhatsAppFloating() {
  const phoneNumber = "+919650461390";
  const message = "Hello Kritika Salon - I want to book an appointment";

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col space-y-3">
      {/* WhatsApp Button */}
      <a
        href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
        className="flex items-center justify-center w-14 h-14 bg-green-500 text-white rounded-full shadow-2xl hover:bg-green-600 transition-all duration-300 animate-bounce"
        aria-label="Chat on WhatsApp"
        target="_blank"
        rel="noopener noreferrer"
      >
        <MessageCircle className="w-6 h-6" />
      </a>

      {/* Call Button */}
      <a
        href={`tel:${phoneNumber}`}
        className="flex items-center justify-center w-14 h-14 bg-pink-500 text-white rounded-full shadow-2xl hover:bg-pink-600 transition-all duration-300"
        aria-label="Call Salon"
      >
        <Phone className="w-5 h-5" />
      </a>
    </div>
  );
}