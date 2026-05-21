// components/ServiceCard.tsx — PRODUCTION OPTIMIZED
"use client";

import { motion } from 'framer-motion';
import { Heart, Clock, Star, ChevronRight } from 'lucide-react';
import { Service } from '../types/service';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { getServiceUrl } from '../utils/serviceUrl';

interface ServiceCardProps {
  service: Service;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onAddToCart: () => void;
  onViewDetails?: () => void;
  variant?: 'compact' | 'detailed' | 'grid';
  locationSlug?: string;
  priority?: boolean;
}

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

const ServiceCard = ({
  service,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  priority = false,
}: ServiceCardProps) => {
  const [imageLoading, setImageLoading] = useState(true);

  const discountPercentage =
    service.originalPrice && service.originalPrice > service.price
      ? Math.round(((service.originalPrice - service.price) / service.originalPrice) * 100)
      : 0;

  const badge = getSmartBadge(service, discountPercentage);
  const socialProof = getSocialProof(service);
  const servicePageUrl = getServiceUrl(service);
  const altText = `${service.title} at Kritika Ladies Parlour Patna`;

  return (
    <article
      className="group relative bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-rose-50 hover:border-rose-100 flex flex-col min-h-[420px]"
      data-service-id={service.id}
      data-category={service.category}
      data-location="Patna"
      data-price={service.price}
    >
      {/* ── IMAGE BLOCK ── */}
      <div className="relative aspect-[4/3] overflow-hidden w-full isolation-auto">
        <Link
          href={servicePageUrl}
          className="w-full h-full block relative"
          aria-label={`View full details for ${service.title}`}
          prefetch={false}
        >
          <Image
            src={service.image || '/images/placeholder.jpg'}
            alt={altText}
            fill
            className={`object-cover transition-all duration-700 group-hover:scale-105 ${imageLoading ? 'scale-105 blur-md' : 'scale-100 blur-0'}`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={priority || service.isTrending || service.isBestSeller}
            quality={85}
            onLoad={() => setImageLoading(false)}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

          {/* Absolute Overlays Tied to the Anchor Context */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full pointer-events-none z-10">
            <Clock className="w-3 h-3" aria-hidden="true" />
            <time dateTime={`PT${service.duration}M`}>{service.durationText || `${service.duration} min`}</time>
          </div>

          {service.bookingCount && service.bookingCount >= 100 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full pointer-events-none z-10">
              <span aria-hidden="true">💖</span>
              <span>
                {service.bookingCount >= 1000
                  ? `${(service.bookingCount / 1000).toFixed(1)}k`
                  : service.bookingCount}+ booked
              </span>
            </div>
          )}
        </Link>

        {/* Wishlist Button: Completely isolated from the Link DOM chain */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-full shadow-md hover:bg-white transition-all duration-200 z-20 group/fav"
          aria-label={isFavorite ? `Remove ${service.title} from wishlist` : `Save ${service.title} to wishlist`}
          aria-pressed={isFavorite}
        >
          <Heart 
            className={`w-4 h-4 transition-all duration-300 group-hover/fav:scale-110 ${
              isFavorite 
                ? 'fill-rose-500 text-rose-500' 
                : 'text-gray-500 group-hover/fav:text-rose-500'
            }`} 
          />
        </button>

        {badge && (
          <span
            className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm select-none z-20 ${badge.bg} ${badge.text} ${badge.border ?? ''}`}
            role="status"
            aria-label={badge.label}
          >
            {badge.label}
          </span>
        )}
      </div>

      {/* ── CONTENT BLOCK ── */}
      <div className="p-4 md:p-5 flex flex-col flex-1">
        <p className="text-[11px] uppercase tracking-widest font-bold text-rose-400 mb-1.5">
          {service.primaryCategory || service.category}
        </p>

        <Link href={servicePageUrl} prefetch={false} className="focus:outline-none">
          <h3 className="font-semibold text-gray-900 text-base leading-snug line-clamp-3 mb-2 hover:text-rose-600 transition-colors focus:underline decoration-rose-500 decoration-2">
            {service.title}
          </h3>
        </Link>

        {(service.shortDescription || service.description) && (
          <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-3">
            {service.shortDescription || service.description}
          </p>
        )}

        {service.rating && service.reviewCount && service.reviewCount >= 5 && (
          <div className="flex items-center gap-1 mb-3" aria-label={`Rated ${service.rating} out of 5 stars based on ${service.reviewCount} reviews`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${star <= Math.round(service.rating!) ? 'fill-amber-400 text-amber-400' : 'fill-gray-100 text-gray-200'}`}
                aria-hidden="true"
              />
            ))}
            <span className="text-xs font-bold text-gray-700 ml-0.5">{service.rating}</span>
            <span className="text-xs text-gray-400">({service.reviewCount})</span>
          </div>
        )}

        {service.keyIngredients && service.keyIngredients.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {service.keyIngredients.slice(0, 3).map((item, idx) => (
              <span key={idx} className="bg-rose-50/60 text-rose-600 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-rose-100/70">
                {item}
              </span>
            ))}
          </div>
        )}

        <div className="pt-3 border-t border-rose-50 mb-3 mt-auto">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-xl font-black text-rose-600" aria-label={`Price: ${service.price} Rupees`}>
              ₹{service.price}
            </span>
            {service.originalPrice && service.originalPrice > service.price && (
              <span className="text-sm text-gray-400 line-through font-medium" aria-label={`Original price was ${service.originalPrice} Rupees`}>
                ₹{service.originalPrice}
              </span>
            )}
          </div>
          {discountPercentage > 0 && (
            <p className="text-[11px] text-emerald-600 font-bold mt-0.5">
              Save ₹{service.originalPrice! - service.price} ({discountPercentage}% off)
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Link
            href={servicePageUrl}
            prefetch={false}
            className="flex items-center justify-center gap-1 py-2.5 rounded-2xl border-2 border-rose-100 text-rose-600 text-sm font-bold hover:bg-rose-50 hover:border-rose-200 active:scale-[0.98] transition-all focus:ring-2 focus:ring-rose-300 focus:outline-none"
            aria-label={`View full details and variations for ${service.title}`}
          >
            Details
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={(e) => { e.stopPropagation(); onAddToCart(); }}
            className="flex items-center justify-center py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-bold hover:from-rose-600 hover:to-pink-600 hover:shadow-md transition-all shadow-sm focus:ring-2 focus:ring-rose-400 focus:outline-none"
            aria-label={`Book ${service.title} session now`}
            data-gtm="add-to-cart"
            data-service={service.title}
            data-price={service.price}
          >
            Book Now
          </motion.button>
        </div>

        {socialProof && (
          <p className="text-[11px] text-gray-500 font-medium mt-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse" aria-hidden="true" />
            {socialProof}
          </p>
        )}
      </div>
    </article>
  );
};

export default ServiceCard;