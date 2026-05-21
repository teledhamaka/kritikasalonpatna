// src/components/TrendingCard.tsx
// Shared trending-service card used on both the Home page and category pages.
// Accent color prop switches between pink (home) and green (skin/hair/etc.).

"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Clock, Star, ShoppingBag } from 'lucide-react';

export interface TrendingCardData {
  id:             string;
  title:          string;
  image?:         string;
  price:          number;
  originalPrice?: number;
  rating?:        number;
  durationText?:  string;
  duration?:      number;
  isBestSeller?:  boolean;
}

interface TrendingCardProps {
  service:      TrendingCardData;
  href:         string;
  onAddToCart:  (e: React.MouseEvent) => void;
  isMobile?:    boolean;
  priority?:    boolean;
  accent?:      'pink' | 'green' | 'amber' | 'rose' | 'blue';
}

const ACCENT = {
  pink: {
    border:       'border-pink-100',
    price:        'text-pink-600',
    hoverHeading: 'group-hover:text-pink-600',
    button:       'from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600',
  },
  green: {
    border:       'border-green-100',
    price:        'text-green-600',
    hoverHeading: 'group-hover:text-green-600',
    button:       'from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600',
  },
  amber: {
    border:       'border-amber-100',
    price:        'text-amber-600',
    hoverHeading: 'group-hover:text-amber-600',
    button:       'from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
  },
  rose: {
    border:       'border-rose-100',
    price:        'text-rose-600',
    hoverHeading: 'group-hover:text-rose-600',
    button:       'from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600',
  },
  blue: {
    border:       'border-blue-100',
    price:        'text-blue-600',
    hoverHeading: 'group-hover:text-blue-600',
    button:       'from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600',
  }
} as const;

export default function TrendingCard({
  service,
  href,
  onAddToCart,
  isMobile  = false,
  priority  = false,
  accent    = 'pink',
}: TrendingCardProps) {
  const a = ACCENT[accent];

  return (
    <Link
      href={href}
      className={`
        flex-shrink-0 bg-white rounded-xl shadow-sm hover:shadow-md
        transition-shadow duration-200 group border ${a.border}
        ${isMobile
          ? 'min-w-[175px] max-w-[175px] p-2.5'
          : 'min-w-[190px] max-w-[190px] p-2.5 hover:scale-[1.02] transform-gpu'
        }
      `}
    >
      {/* Image — fixed 110 px height, no portrait ratio */}
      <div className="relative h-[110px] w-full rounded-lg overflow-hidden mb-2">
        <Image
          src={service.image || '/images/placeholder.jpg'}
          alt={service.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 175px, 190px"
          priority={priority}
          quality={75}
        />

        {service.isBestSeller && (
          <span className="absolute top-1.5 left-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 fill-white" /> Best
          </span>
        )}

        <span className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
          <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
          {service.rating?.toFixed(1) ?? '4.5'}
        </span>
      </div>

      {/* Info */}
      <div className="flex flex-col">
        <h3 className={`font-semibold text-gray-800 text-xs line-clamp-2 mb-1 transition-colors leading-snug ${a.hoverHeading}`}>
          {service.title}
        </h3>

        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className={`font-bold text-sm ${a.price}`}>₹{service.price}</span>
            {service.originalPrice && service.originalPrice > service.price && (
              <span className="text-gray-400 text-[10px] line-through ml-1">
                ₹{service.originalPrice}
              </span>
            )}
          </div>
          <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
            <Clock className="w-2.5 h-2.5" />
            {service.durationText ?? `${service.duration ?? 60}m`}
          </span>
        </div>

        <button
          onClick={onAddToCart}
          aria-label={`Add ${service.title} to cart`}
          className={`
            w-full mt-2 py-1.5 text-xs bg-gradient-to-r ${a.button}
            text-white font-medium rounded-lg transition-colors
            flex items-center justify-center gap-1
          `}
        >
          Book Now <ShoppingBag className="w-3 h-3" />
        </button>
      </div>
    </Link>
  );
}