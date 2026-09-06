// components/BookingCTA.tsx
// Reusable sticky booking button used on service×location detail pages
// Server Component — no 'use client' needed

import Link from 'next/link'
import { Phone } from 'lucide-react'

interface BookingCTAProps {
  serviceTitle: string
  locationName: string
  price: number
  variant?: 'inline' | 'card'
}

export default function BookingCTA({
  serviceTitle,
  locationName,
  price,
  variant = 'inline',
}: BookingCTAProps) {
  const waText = `Hi, I want to book ${serviceTitle} at ${locationName} (₹${price})`

  if (variant === 'card') {
    return (
      <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-5 text-white text-center">
        <p className="font-bold text-base mb-1">Book {serviceTitle}</p>
        <p className="text-rose-100 text-xs mb-4">at our {locationName} salon — same-day available</p>
        <div className="flex gap-3 justify-center">
          <a
            href="tel:+919650461390"
            className="bg-white text-rose-600 px-5 py-2 rounded-full font-bold text-sm flex items-center gap-1"
          >
            <Phone className="w-3.5 h-3.5" /> Call
          </a>
          <a
            href={`https://wa.me/919650461390?text=${encodeURIComponent(waText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/20 border border-white/30 text-white px-5 py-2 rounded-full font-bold text-sm"
          >
            💬 WhatsApp
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <a
        href="tel:+919650461390"
        className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white py-3 rounded-xl font-bold text-center text-sm flex items-center justify-center gap-2"
      >
        <Phone className="w-4 h-4" /> Call to Book
      </a>
      <a
        href={`https://wa.me/919650461390?text=${encodeURIComponent(waText)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold text-center text-sm"
      >
        💬 WhatsApp
      </a>
    </div>
  )
}