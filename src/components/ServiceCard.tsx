// components/ServiceCard.tsx — LEAN VERSION
// Changes from original:
// 1. "View Details" button → <Link> to /bhootnath-road/{service.slug} (SEO page)
// 2. Schema removed — it lives on server-rendered [slug]/[serviceSlug]/page.tsx now
// 3. Everything else (badges, booking, animations) — unchanged

"use client";

import { motion } from 'framer-motion';
import { Heart, Clock, Star, ChevronRight } from 'lucide-react';
import { Service } from '../types/service';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface ServiceCardProps {
  service: Service;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onAddToCart: () => void;
  onViewDetails?: () => void;        // kept for backward compat — no longer used for routing
  variant?: 'compact' | 'detailed' | 'grid';
  showBestSellerBadge?: boolean;
  // NEW: which location to link to (default: bhootnath-road = main branch)
  locationSlug?: string;
}

// ─── Smart badge logic — UNCHANGED from original ──────────────────────────────
interface Badge {
  label: string;
  bg: string;
  text: string;
  border?: string;
}

function getSmartBadge(service: Service, discountPct: number): Badge | null {
  if (service.eventCategory?.toLowerCase().includes('bridal'))
    return { label: '👰 Bridal', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border border-rose-200' };
  if ((service as any).isExclusive || (service as any).isLimited)
    return { label: '✦ Exclusive', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border border-purple-200' };
  if (discountPct >= 20)
    return { label: `${discountPct}% OFF`, bg: 'bg-rose-500', text: 'text-white' };
  if (discountPct > 0)
    return { label: `${discountPct}% OFF`, bg: 'bg-rose-100', text: 'text-rose-700', border: 'border border-rose-200' };
  if (service.isTrending)
    return { label: '🔥 Trending', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border border-orange-200' };
  if (service.isBestSeller)
    return { label: '⭐ Bestseller', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border border-amber-200' };
  if (service.isPopular)
    return { label: '💖 Popular', bg: 'bg-pink-50', text: 'text-pink-700', border: 'border border-pink-200' };
  if (service.rating && service.rating >= 4.8 && service.reviewCount && service.reviewCount >= 10)
    return { label: `★ ${service.rating} Rated`, bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border border-yellow-200' };
  if (service.bookingCount && service.bookingCount >= 300)
    return {
      label: `${service.bookingCount >= 1000 ? `${(service.bookingCount / 1000).toFixed(1)}k` : service.bookingCount}+ Booked`,
      bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border border-emerald-200'
    };
  if ((service as any).homeService)
    return { label: '🏠 Home Service', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border border-sky-200' };
  return null;
}

function getSocialProof(service: Service): string | null {
  if (service.bookingCount && service.bookingCount >= 500) return `${service.bookingCount}+ women booked this month`;
  if (service.bookingCount && service.bookingCount >= 100) return `${service.bookingCount}+ bookings — a client favourite`;
  if (service.reviewCount && service.reviewCount >= 20 && service.rating && service.rating >= 4.5)
    return `Loved by ${service.reviewCount}+ clients in Patna`;
  if (service.isTrending) return 'Most booked this week in Patna';
  if (service.isBestSeller) return 'Consistently our top pick';
  return null;
}

// ─── Build the SEO page URL for this service ─────────────────────────────────
// Uses service.slug (from Supabase) — falls back to service.id
function getServicePageUrl(service: Service, locationSlug: string): string {
  const slug = service.slug || service.id;
  return `/${locationSlug}/${slug}`;
}

// ─── Component ────────────────────────────────────────────────────────────────
const ServiceCard = ({
  service,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  onViewDetails,          // no longer drives navigation — kept for compat
  variant = 'detailed',
  showBestSellerBadge,
  locationSlug = 'bhootnath-road',  // default = main branch
}: ServiceCardProps) => {
  const [imageLoading, setImageLoading] = useState(true);

  const discountPercentage =
    service.originalPrice && service.originalPrice > service.price
      ? Math.round(((service.originalPrice - service.price) / service.originalPrice) * 100)
      : 0;

  const badge = getSmartBadge(service, discountPercentage);
  const socialProof = getSocialProof(service);

  // The canonical SEO page for this service
  const servicePageUrl = getServicePageUrl(service, locationSlug);

  const altText = `${service.title} at Kritika Ladies Parlour Patna`;

  return (
    <article
      className="group relative bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-rose-50 hover:border-rose-100 flex flex-col"
      itemScope
      itemType="https://schema.org/Product"
      data-service-id={service.id}
      data-category={service.category}
      data-location="Patna"
      data-price={service.price}
    >
      {/* SR-only heading for accessibility + basic on-page SEO */}
      <div className="sr-only">
        <h2>{service.title} in Patna</h2>
        <p>₹{service.price} | {service.durationText || `${service.duration} min`}</p>
        <p>{service.shortDescription}</p>
      </div>

      {/* ── IMAGE BLOCK — clicking goes to SEO page ── */}
      <Link
        href={servicePageUrl}
        className="relative aspect-[4/3] overflow-hidden block"
        aria-label={`View full details for ${service.title}`}
        prefetch={false}
      >
        <motion.div className="w-full h-full" whileTap={{ scale: 0.99 }}>
          <Image
            src={service.image || '/images/placeholder.jpg'}
            alt={altText}
            fill
            className={`object-cover transition-transform duration-700 group-hover:scale-105 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={service.isTrending || service.isBestSeller}
            quality={85}
            onLoad={() => setImageLoading(false)}
            itemProp="image"
          />
          {imageLoading && (
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 animate-pulse" />
          )}

          {/* Hover veil */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Smart badge */}
          {badge && (
            <span
              className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm ${badge.bg} ${badge.text} ${badge.border ?? ''}`}
              role="status"
              aria-label={badge.label}
            >
              {badge.label}
            </span>
          )}

          {/* Wishlist heart */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(); }}
            className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-full shadow-md hover:scale-110 active:scale-95 transition-transform"
            aria-label={isFavorite ? `Remove ${service.title} from wishlist` : `Save ${service.title} to wishlist`}
            aria-pressed={isFavorite}
          >
            <Heart className={`w-4 h-4 transition-all duration-300 ${isFavorite ? 'fill-rose-500 text-rose-500 scale-110' : 'text-gray-400 hover:text-rose-400'}`} />
          </button>

          {/* Duration pill */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-full">
            <Clock className="w-3 h-3" aria-hidden="true" />
            <time dateTime={`PT${service.duration}M`}>{service.durationText || `${service.duration} min`}</time>
          </div>

          {/* Booking count */}
          {service.bookingCount && service.bookingCount >= 100 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-full">
              <span aria-hidden="true">💖</span>
              <span>
                {service.bookingCount >= 1000
                  ? `${(service.bookingCount / 1000).toFixed(1)}k`
                  : service.bookingCount}+ booked
              </span>
            </div>
          )}
        </motion.div>
      </Link>

      {/* ── CONTENT BLOCK ── */}
      <div className="p-4 md:p-5 flex flex-col flex-1">

        {/* Category label */}
        <p className="text-[11px] uppercase tracking-widest font-medium text-rose-400 mb-1.5">
          {service.primaryCategory || service.category}
        </p>

        {/* Title — links to SEO page */}
        <Link href={servicePageUrl} prefetch={false}>
          <h3
            className="font-semibold text-gray-900 text-base leading-snug line-clamp-2 mb-2 hover:text-rose-600 transition-colors"
            itemProp="name"
          >
            {service.title}
          </h3>
        </Link>

        {/* Short description — 1 line only on card */}
        {(service.shortDescription || service.description) && (
          <p className="text-gray-500 text-xs leading-relaxed line-clamp-1 mb-3">
            {service.shortDescription || service.description}
          </p>
        )}

        {/* Star rating */}
        {service.rating && service.reviewCount && service.reviewCount >= 5 && (
          <div className="flex items-center gap-1 mb-3" aria-label={`Rated ${service.rating} out of 5`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${star <= Math.round(service.rating!) ? 'fill-amber-400 text-amber-400' : 'fill-gray-100 text-gray-200'}`}
                aria-hidden="true"
              />
            ))}
            <span className="text-xs font-semibold text-gray-700 ml-0.5">{service.rating}</span>
            <span className="text-xs text-gray-400">({service.reviewCount})</span>
          </div>
        )}

        {/* Key ingredients — max 3 */}
        {service.keyIngredients && service.keyIngredients.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {service.keyIngredients.slice(0, 3).map((item, idx) => (
              <span key={idx} className="bg-rose-50 text-rose-600 text-[10px] font-medium px-2 py-0.5 rounded-full border border-rose-100">
                {item}
              </span>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="pt-3 border-t border-rose-50 mb-3 mt-auto">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-xl font-bold text-rose-600" itemProp="price" aria-label={`Price ₹${service.price}`}>
              ₹{service.price}
            </span>
            {service.originalPrice && service.originalPrice > service.price && (
              <span className="text-sm text-gray-400 line-through" aria-label={`Was ₹${service.originalPrice}`}>
                ₹{service.originalPrice}
              </span>
            )}
          </div>
          {discountPercentage > 0 && (
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              You save ₹{service.originalPrice! - service.price} ({discountPercentage}% off)
            </p>
          )}
        </div>

        {/* ── ACTION BUTTONS ── */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* View Details → navigates to SEO page */}
          <Link
            href={servicePageUrl}
            prefetch={false}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-2xl border-2 border-rose-200 text-rose-600 text-sm font-semibold hover:bg-rose-50 hover:border-rose-300 active:scale-[0.98] transition-all focus:ring-2 focus:ring-rose-200 focus:outline-none"
            aria-label={`View full details for ${service.title}`}
          >
            View Details
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>

          {/* Book Now → existing booking flow, unchanged */}
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart(); }}
            className="flex items-center justify-center py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-bold hover:from-rose-600 hover:to-pink-600 hover:shadow-md active:scale-[0.98] transition-all shadow-sm focus:ring-2 focus:ring-rose-300 focus:outline-none"
            aria-label={`Book ${service.title} at Kritika Ladies Parlour Patna`}
            data-gtm="add-to-cart"
            data-service={service.title}
            data-price={service.price}
          >
            Book Now →
          </button>
        </div>

        {/* Social proof line */}
        {socialProof && (
          <p className="text-[11px] text-gray-400 mt-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" aria-hidden="true" />
            {socialProof}
          </p>
        )}
      </div>
    </article>
  );
};

export default ServiceCard;