// app/components/ServiceCard.tsx — FEMININE REDESIGN v2
// Industry standard: Urban Company + Nykaa pattern
// Smart variable badges: each card shows what's MOST compelling about that service
"use client";

import { motion } from 'framer-motion';
import { Heart, Clock, Star, ChevronRight } from 'lucide-react';
import { Service } from '../types/service';
import Image from 'next/image';
import seoData from '../../public/seo.json';
import { useState } from 'react';

interface ServiceSchema {
  "@context": string;
  "@type": string;
  name: string;
  description: string;
  brand?: { "@type": string; name: string };
  provider: {
    "@type": string;
    name: string;
    address: {
      "@type": string;
      addressLocality: string;
      addressRegion: string;
      addressCountry: string;
    };
  };
  areaServed: { "@type": string; name: string };
  offers: {
    "@type": string;
    price: number;
    priceCurrency: string;
    availability: string;
    url: string;
    priceValidUntil: string;
  };
  aggregateRating?: {
    "@type": string;
    ratingValue: number;
    reviewCount: number;
    bestRating: string;
    worstRating: string;
  };
}

interface ServiceCardProps {
  service: Service;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onAddToCart: () => void;
  onViewDetails: () => void;
  variant?: 'compact' | 'detailed' | 'grid';
  showBestSellerBadge?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// SMART BADGE LOGIC
// Each card gets ONE badge based on its most compelling attribute.
// Priority ladder ensures variety across cards — no monotony.
// Mirrors industry standard (Nykaa, Urban Company, Vagaro):
//   image overlay badge = single strongest signal, softly styled.
// ─────────────────────────────────────────────────────────────────────────────
interface Badge {
  label: string;
  bg: string;
  text: string;
  border?: string;
}

function getSmartBadge(service: Service, discountPct: number): Badge | null {
  // 1. Bridal — highest emotional resonance for female audience
  if (service.eventCategory?.toLowerCase().includes('bridal')) {
    return { label: '👰 Bridal', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border border-rose-200' };
  }

  // 2. Exclusive / Limited (if field exists on your service data)
  if ((service as any).isExclusive || (service as any).isLimited) {
    return { label: '✦ Exclusive', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border border-purple-200' };
  }

  // 3. Strong discount ≥ 20% — prominent, clear financial benefit
  if (discountPct >= 20) {
    return { label: `${discountPct}% OFF`, bg: 'bg-rose-500', text: 'text-white' };
  }

  // 4. Small discount < 20% — softer, still valuable
  if (discountPct > 0) {
    return { label: `${discountPct}% OFF`, bg: 'bg-rose-100', text: 'text-rose-700', border: 'border border-rose-200' };
  }

  // 5. Trending — viral social proof
  if (service.isTrending) {
    return { label: '🔥 Trending', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border border-orange-200' };
  }

  // 6. Bestseller — booking volume proof
  if (service.isBestSeller) {
    return { label: '⭐ Bestseller', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border border-amber-200' };
  }

  // 7. Popular — engagement signal
  if (service.isPopular) {
    return { label: '💖 Popular', bg: 'bg-pink-50', text: 'text-pink-700', border: 'border border-pink-200' };
  }

  // 8. Highly rated (4.8+, 10+ reviews) — quality signal
  if (service.rating && service.rating >= 4.8 && service.reviewCount && service.reviewCount >= 10) {
    return { label: `★ ${service.rating} Rated`, bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border border-yellow-200' };
  }

  // 9. High booking count — momentum signal
  if (service.bookingCount && service.bookingCount >= 300) {
    return { label: `${service.bookingCount >= 1000 ? `${(service.bookingCount/1000).toFixed(1)}k` : service.bookingCount}+ Booked`, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border border-emerald-200' };
  }

  // 10. Home service available
  if ((service as any).homeService) {
    return { label: '🏠 Home Service', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border border-sky-200' };
  }

  return null; // Clean card — no badge is also valid
}

// Contextual one-liner social proof, different per service
function getSocialProof(service: Service): string | null {
  if (service.bookingCount && service.bookingCount >= 500)
    return `${service.bookingCount}+ women booked this month`;
  if (service.bookingCount && service.bookingCount >= 100)
    return `${service.bookingCount}+ bookings — a client favourite`;
  if (service.reviewCount && service.reviewCount >= 20 && service.rating && service.rating >= 4.5)
    return `Loved by ${service.reviewCount}+ clients in Patna`;
  if (service.isTrending)
    return 'Most booked this week in Patna';
  if (service.isBestSeller)
    return 'Consistently our top pick';
  return null;
}

const ServiceCard = ({
  service,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  onViewDetails,
  variant = 'detailed',
  showBestSellerBadge,
}: ServiceCardProps) => {
  const [imageLoading, setImageLoading] = useState(true);

  const discountPercentage =
    service.originalPrice && service.originalPrice > service.price
      ? Math.round(((service.originalPrice - service.price) / service.originalPrice) * 100)
      : 0;

  const badge = getSmartBadge(service, discountPercentage);
  const socialProof = getSocialProof(service);

  const generateSchemaData = (): ServiceSchema => {
    const schema: ServiceSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: service.title,
      description: service.shortDescription || service.description || "",
      brand: { "@type": "BeautySalon", name: seoData.business.name },
      provider: {
        "@type": "BeautySalon",
        name: seoData.business.name,
        address: {
          "@type": "PostalAddress",
          addressLocality: seoData.business.address.locality,
          addressRegion: seoData.business.address.state,
          addressCountry: seoData.business.address.country,
        },
      },
      areaServed: { "@type": "City", name: "Patna" },
      offers: {
        "@type": "Offer",
        price: service.price,
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
        url: service.url
          ? `${seoData.business.contact.website}${service.url}`
          : `${seoData.business.contact.website}/${service.primaryCategory}/${service.slug || service.id}`,
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
    };
    if (service.rating && service.reviewCount && service.reviewCount >= 5) {
      schema.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: service.rating,
        reviewCount: service.reviewCount,
        bestRating: "5",
        worstRating: "1",
      };
    }
    return schema;
  };

  const altText = `${service.title} — ${service.primaryCategory || 'beauty'} at ${seoData.business.name}, Patna`;

  // ═══════════════════════════════════════════════════════
  // COMPACT VARIANT — used in horizontal/grid scrollers
  // ═══════════════════════════════════════════════════════
  if (variant === 'compact') {
    return (
      <>
        <script type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateSchemaData()) }} />

        <article
          itemScope itemType="https://schema.org/Product"
          className="bg-white rounded-2xl overflow-hidden border border-rose-100/80 shadow-sm hover:shadow-md transition-shadow duration-300"
          data-service-id={service.id}
          data-location="Patna"
        >
          <meta itemProp="name" content={service.title} />
          <meta itemProp="description" content={service.shortDescription || service.description || ""} />

          {/* Image */}
          <div
            className="relative aspect-[4/3] cursor-pointer overflow-hidden"
            onClick={onViewDetails}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onViewDetails()}
            aria-label={`View ${service.title}`}
          >
            <Image
              src={service.image || '/placeholder-service.jpg'}
              alt={altText}
              fill
              className={`object-cover transition-transform duration-500 hover:scale-105 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
              sizes="(max-width: 640px) 50vw, 33vw"
              priority={service.isTrending || service.isBestSeller}
              quality={80}
              onLoad={() => setImageLoading(false)}
              itemProp="image"
            />
            {imageLoading && (
              <div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-pink-100 animate-pulse" />
            )}

            {/* Smart badge — top left, variable per card */}
            {badge && (
              <span
                className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.bg} ${badge.text} ${badge.border ?? ''}`}
                role="status"
              >
                {badge.label}
              </span>
            )}

            {/* Wishlist — top right */}
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
              className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-transform"
              aria-label={isFavorite ? 'Remove from wishlist' : 'Save to wishlist'}
              aria-pressed={isFavorite}
            >
              <Heart className={`w-3.5 h-3.5 transition-all ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}`} />
            </button>

            {/* Duration — bottom left of image */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/45 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
              <Clock className="w-2.5 h-2.5" aria-hidden="true" />
              <time dateTime={`PT${service.duration}M`}>{service.durationText || `${service.duration}m`}</time>
            </div>
          </div>

          {/* Info */}
          <div className="p-3">
            <p className="text-[10px] uppercase tracking-wider font-medium text-rose-400 mb-1">
              {service.primaryCategory}
            </p>

            <h3 className="font-semibold text-sm text-gray-800 line-clamp-2 leading-snug mb-1.5" itemProp="name">
              {service.title}
            </h3>

            {/* Rating */}
            {service.rating && service.reviewCount && service.reviewCount >= 5 && (
              <div className="flex items-center gap-1 mb-2">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                <span className="text-xs font-semibold text-gray-700">{service.rating}</span>
                <span className="text-xs text-gray-400">({service.reviewCount})</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-1.5 mb-3">
              <span className="text-base font-bold text-rose-600">₹{service.price}</span>
              {service.originalPrice && service.originalPrice > service.price && (
                <span className="text-xs text-gray-400 line-through">₹{service.originalPrice}</span>
              )}
            </div>

            {/* Both buttons — always visible */}
            <div className="flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl border border-rose-200 text-rose-500 text-xs font-semibold hover:bg-rose-50 transition-colors"
                aria-label={`View details for ${service.title}`}
              >
                Details <ChevronRight className="w-3 h-3" aria-hidden="true" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onAddToCart(); }}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white text-xs font-bold hover:from-rose-500 hover:to-pink-600 active:scale-[0.98] transition-all shadow-sm"
                aria-label={`Book ${service.title}`}
                data-gtm="add-to-cart"
              >
                Book Now
              </button>
            </div>
          </div>
        </article>
      </>
    );
  }

  // ═══════════════════════════════════════════════════════
  // DETAILED VARIANT (default)
  // Layout: Urban Company / Nykaa standard
  //   [IMAGE with badge, heart, duration, booking-count]
  //   Category tag (quiet, editorial)
  //   Title
  //   Description (1 line)
  //   ★★★★★ rating  (if earned)
  //   Key features pills (if present, max 3)
  //   ─── divider ───
  //   ₹Price  [strikethrough] + savings
  //   [View Details] [Book Now]
  //   · social proof line (contextual)
  // ═══════════════════════════════════════════════════════
  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateSchemaData()) }} />

      <article
        itemScope itemType="https://schema.org/Product"
        className="group bg-white rounded-3xl overflow-hidden border border-rose-100/70 shadow-sm hover:shadow-xl transition-all duration-300"
        data-service-id={service.id}
        data-service-category={service.primaryCategory}
        data-location="Patna"
        data-price={service.price}
      >
        <div className="sr-only" aria-hidden="true">
          <h2>{service.title} in Patna</h2>
          <p>₹{service.price} | {service.durationText || `${service.duration} min`}</p>
        </div>

        {/* ── IMAGE BLOCK ── */}
        <motion.div
          className="relative aspect-[4/3] cursor-pointer overflow-hidden"
          whileTap={{ scale: 0.99 }}
          onClick={onViewDetails}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onViewDetails()}
          aria-label={`View details for ${service.title}`}
        >
          <Image
            src={service.image || '/placeholder-service.jpg'}
            alt={altText}
            fill
            className={`object-cover transition-transform duration-700 group-hover:scale-105 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={service.isTrending || service.isBestSeller}
            quality={90}
            onLoad={() => setImageLoading(false)}
            itemProp="image"
          />
          {imageLoading && (
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 animate-pulse" />
          )}

          {/* Hover veil */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* ── SMART BADGE — ONE badge, variable per card ── */}
          {badge && (
            <span
              className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm ${badge.bg} ${badge.text} ${badge.border ?? ''}`}
              role="status"
              aria-label={badge.label}
            >
              {badge.label}
            </span>
          )}

          {/* ── WISHLIST HEART — top right ── */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
            className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-full shadow-md hover:scale-110 active:scale-95 transition-transform"
            aria-label={isFavorite ? `Remove ${service.title} from wishlist` : `Save ${service.title} to wishlist`}
            aria-pressed={isFavorite}
          >
            <Heart className={`w-4 h-4 transition-all duration-300 ${isFavorite ? 'fill-rose-500 text-rose-500 scale-110' : 'text-gray-400 hover:text-rose-400'}`} />
          </button>

          {/* ── DURATION PILL — bottom left ── */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-full">
            <Clock className="w-3 h-3" aria-hidden="true" />
            <time dateTime={`PT${service.duration}M`}>{service.durationText || `${service.duration} min`}</time>
          </div>

          {/* ── BOOKING COUNT — bottom right (only if 100+) ── */}
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

        {/* ── CONTENT BLOCK ── */}
        <div className="p-4 md:p-5">

          {/* Category — editorial label, not a chip */}
          <p className="text-[11px] uppercase tracking-widest font-medium text-rose-400 mb-1.5">
            {service.primaryCategory || service.category}
          </p>

          {/* Title */}
          <h3
            className="font-semibold text-gray-900 text-base leading-snug line-clamp-2 mb-2 cursor-pointer hover:text-rose-600 transition-colors"
            onClick={onViewDetails}
            itemProp="name"
          >
            {service.title}
          </h3>

          {/* Short description — 1 line */}
          {(service.shortDescription || service.description) && (
            <p className="text-gray-500 text-xs leading-relaxed line-clamp-1 mb-3">
              {service.shortDescription || service.description}
            </p>
          )}

          {/* Star rating row — shown only when earned (5+ reviews) */}
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
              <span className="text-xs text-gray-400">({service.reviewCount} reviews)</span>
            </div>
          )}

          {/* Key ingredients / features — max 3 soft pills (only if data exists) */}
          {service.keyIngredients && service.keyIngredients.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {service.keyIngredients.slice(0, 3).map((item, idx) => (
                <span
                  key={idx}
                  className="bg-rose-50 text-rose-600 text-[10px] font-medium px-2 py-0.5 rounded-full border border-rose-100"
                >
                  {item}
                </span>
              ))}
            </div>
          )}

          {/* ── PRICE + SAVINGS ── */}
          <div className="pt-3 border-t border-rose-50 mb-3">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span
                className="text-xl font-bold text-rose-600"
                aria-label={`Price ₹${service.price}`}
                itemProp="price"
              >
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

          {/* ── ACTION BUTTONS ── always both visible (industry standard) ── */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-2xl border-2 border-rose-200 text-rose-600 text-sm font-semibold hover:bg-rose-50 hover:border-rose-300 active:scale-[0.98] transition-all focus:ring-2 focus:ring-rose-200 focus:outline-none"
              aria-label={`View full details for ${service.title}`}
            >
              View Details
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); onAddToCart(); }}
              className="flex items-center justify-center py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-bold hover:from-rose-600 hover:to-pink-600 hover:shadow-md active:scale-[0.98] transition-all shadow-sm focus:ring-2 focus:ring-rose-300 focus:outline-none"
              aria-label={`Book ${service.title} at ${seoData.business.name}`}
              data-gtm="add-to-cart"
              data-service={service.title}
              data-price={service.price}
            >
              Book My Appointment →
            </button>
          </div>

          {/* ── SOCIAL PROOF LINE — contextual, single quiet line ── */}
          {socialProof && (
            <p className="text-[11px] text-gray-400 mt-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" aria-hidden="true" />
              {socialProof}
            </p>
          )}
        </div>
      </article>
    </>
  );
};

export default ServiceCard;