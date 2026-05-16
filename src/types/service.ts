/**
 * types/service.ts
 *
 * This file is the frontend-facing type layer.
 * It re-exports the canonical Service (and related types) from types/index.ts
 * so every component imports from ONE place and TS never complains about
 * missing DB columns (booking_count, rating_average, rating_count, etc.).
 *
 * Rule: add new DB columns to types/index.ts ONLY.
 *       Add frontend-only helpers/aliases here.
 */

// ─── Re-export everything from index so callers can import either file ────────
export type {
  Service,
  CartItem,
  BookingItem,
  Stylist,
  TimeSlot,
  Appointment,
  Booking,
  BookingSlot,
  Address,
  Personalization,
  ServiceCategory,
  Profile,
  User,
} from './index';

export { getEffectivePrice } from './index';

// ─── Import the canonical Service for use inside this file ───────────────────
import type { Service } from './index';

// ============================================
// Base DB service type (raw Supabase row)
// ============================================

export interface BaseService {
  id: string;
  name: string;
  title?: string;
  category: string;
  image: string;
  description: string;
  detailed_description?: string;
  base_price: number;
  price?: number;
  original_price?: number;
  discounted_price?: number;
  is_trending: boolean;
  is_popular?: boolean;
  is_signature?: boolean;
  duration_minutes: number;
  duration?: number;
  key_ingredients?: string[];
  benefits?: string[];
  precautions?: string;
  aftercare?: string;
  category_id?: string;
  category_name?: string;
  image_url?: string;
  requires_consultation?: boolean;
  suitable_for?: string[];
  tags?: string[];
  active: boolean;
  /** DB columns — always present on Supabase rows */
  booking_count: number;
  rating_average: number;
  rating_count: number;
  faqs?: Array<{ question: string; answer: string }>;
  created_at: string;
  updated_at: string;
}

// Specific service variants (extend BaseService for narrowing if needed)
export interface MakeupService extends BaseService { service_type?: 'makeup'; }
export interface SkinService   extends BaseService { service_type?: 'skin'; }
export interface HairService   extends BaseService { service_type?: 'hair'; }
export interface NailService   extends BaseService { service_type?: 'nails'; }
export interface ViralService  extends BaseService { service_type?: 'viral'; }

export type DatabaseService =
  | MakeupService
  | SkinService
  | HairService
  | NailService
  | ViralService;

// ============================================
// Filter & sort types
// ============================================

export interface ServiceFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  duration?: number;
  trending?: boolean;
  search?: string;
  serviceType?: 'makeup' | 'skin' | 'hair' | 'nails' | 'viral';
  eventCategory?: string;
}

export type SortOption =
  | 'price_asc'
  | 'price_desc'
  | 'duration_asc'
  | 'duration_desc'
  | 'trending'
  | 'newest'
  | 'title_asc'
  | 'title_desc'
  | 'name_asc'
  | 'name_desc';

export interface ServiceResponse<T extends DatabaseService> {
  data: T[];
  error?: string;
  total?: number;
  page?: number;
  limit?: number;
}

export interface UseServiceReturn {
  services: Service[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// ============================================
// Transform helpers
// ============================================

/**
 * Transforms a raw Supabase / DatabaseService row into the unified Service type.
 * All DB columns (booking_count, rating_average, rating_count) are mapped here.
 */
export const transformServiceForComponent = (
  service: DatabaseService | Record<string, unknown>,
  serviceType: 'makeup' | 'skin' | 'hair' | 'nails' | 'viral' = 'makeup',
): Service => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = service as any;

  const effectivePrice: number = s.price ?? s.base_price ?? 0;
  const effectiveOriginal: number = s.original_price ?? s.originalPrice ?? effectivePrice;

  return {
    // ── Identity ────────────────────────────────────────────
    id: s.id,
    name: s.name ?? s.title,
    title: s.title ?? s.name ?? null,
    slug: s.slug,

    // ── Category & routing ──────────────────────────────────
    category_id: s.category_id ?? null,
    category: s.category ?? null,
    category_name: s.category_name,
    categorySlug: s.categorySlug,
    service_type: s.service_type ?? serviceType,
    primaryCategory: s.primaryCategory ?? serviceType,
    eventCategory: s.eventCategory,
    url: s.url ?? `/${serviceType}/${s.slug ?? s.id}`,

    // ── Content ─────────────────────────────────────────────
    description: s.description ?? '',
    detailed_description: s.detailed_description ?? null,
    shortDescription: s.shortDescription,

    // ── Media ───────────────────────────────────────────────
    image: s.image ?? s.image_url ?? null,
    image_url: s.image_url ?? s.image ?? null,
    imageUrl: s.image ?? s.image_url,

    // ── Pricing ─────────────────────────────────────────────
    base_price: s.base_price ?? 0,
    price: effectivePrice,
    original_price: effectiveOriginal,
    originalPrice: effectiveOriginal,
    discounted_price: s.discounted_price ?? null,
    priceCurrency: s.priceCurrency,
    discountPercentage: s.discountPercentage,
    deal: s.deal ?? (effectiveOriginal > effectivePrice
      ? `Save ₹${effectiveOriginal - effectivePrice}`
      : undefined),

    // ── Duration ────────────────────────────────────────────
    duration_minutes: s.duration_minutes ?? s.duration ?? 60,
    duration: s.duration ?? s.duration_minutes ?? 60,
    durationText: s.durationText,

    // ── Ingredients & benefits ──────────────────────────────
    key_ingredients: s.key_ingredients ?? s.keyIngredients ?? null,
    keyIngredients: s.keyIngredients ?? s.key_ingredients,
    benefits: s.benefits ?? null,
    precautions: s.precautions ?? null,
    aftercare: s.aftercare ?? null,

    // ── Suitability ─────────────────────────────────────────
    suitable_for: s.suitable_for ?? s.suitableFor ?? null,
    suitableFor: s.suitableFor ?? s.suitable_for,
    tags: s.tags ?? null,

    // ── Popularity flags ────────────────────────────────────
    is_trending: s.is_trending ?? s.isTrending ?? s.trending ?? false,
    isTrending: s.isTrending ?? s.is_trending ?? s.trending,
    trending: s.trending ?? s.is_trending ?? s.isTrending,
    is_popular: s.is_popular ?? s.isPopular ?? false,
    isPopular: s.isPopular ?? s.is_popular,
    is_signature: s.is_signature ?? false,
    isBestSeller: s.isBestSeller ?? false,
    viral: s.viral,

    // ── Ratings & bookings (DB columns — always mapped) ─────
    booking_count: s.booking_count ?? s.bookingCount ?? 0,
    rating_average: s.rating_average ?? s.rating ?? 0,
    rating_count: s.rating_count ?? s.rating_count ?? s.reviews ?? s.reviewCount ?? 0,
    // Frontend aliases
    bookingCount: s.bookingCount ?? s.booking_count ?? 0,
    rating: s.rating ?? s.rating_average ?? 0,
    reviews: s.reviews ?? s.rating_count ?? 0,
    reviewCount: s.reviewCount ?? s.rating_count ?? s.reviews ?? 0,
    reviewSource: s.reviewSource,

    // ── Operational ─────────────────────────────────────────
    requires_consultation: s.requires_consultation ?? false,
    active: s.active !== false,

    // ── FAQs ────────────────────────────────────────────────
    faqs: s.faqs ?? [],

    // ── SEO ─────────────────────────────────────────────────
    seoKeywords: s.seoKeywords,

    // ── Audience & intent ───────────────────────────────────
    idealFor: s.idealFor,
    targetAudience: s.targetAudience,

    // ── Inclusions ──────────────────────────────────────────
    whatsIncluded: s.whatsIncluded,
    whatsNotIncluded: s.whatsNotIncluded,

    // ── Availability ────────────────────────────────────────
    availability: s.availability,
    requirements: s.requirements,

    // ── Add-ons ─────────────────────────────────────────────
    addOns: s.addOns,

    // ── Geography ───────────────────────────────────────────
    serviceArea: s.serviceArea,
    provider: s.provider,
    geo: s.geo,
    nearbyLandmarks: s.nearbyLandmarks,

    // ── Meta / ops ──────────────────────────────────────────
    seasonalTags: s.seasonalTags,
    processingTime: s.processingTime,
    cancellationPolicy: s.cancellationPolicy,
    link: s.link ?? s.url ?? `/${serviceType}/service/${s.id}`,

    // ── Timestamps ──────────────────────────────────────────
    created_at: s.created_at ?? '',
    updated_at: s.updated_at ?? '',
  };
};

/**
 * Transforms a static JSON object (e.g. hardcoded data files) into the
 * unified Service type. Assumes camelCase source fields.
 */
export const transformJSONToService = (data: Record<string, unknown>): Service => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = data as any;

  const effectivePrice: number = d.price ?? d.base_price ?? 0;
  const effectiveOriginal: number = d.originalPrice ?? d.original_price ?? effectivePrice;

  return {
    id: d.id,
    name: d.name ?? d.title,
    title: d.title ?? d.name ?? null,
    slug: d.slug,
    description: d.description ?? '',
    detailed_description: d.detailed_description ?? null,
    shortDescription: d.shortDescription,

    category_id: d.category_id ?? null,
    category: d.category ?? null,
    category_name: d.category_name,
    categorySlug: d.categorySlug,
    service_type: d.serviceType ?? d.service_type ?? 'makeup',
    primaryCategory: d.primaryCategory,
    eventCategory: d.eventCategory,
    url: d.url,

    image: d.image ?? null,
    image_url: d.image ?? null,
    imageUrl: d.image,

    base_price: d.price ?? d.base_price ?? 0,
    price: effectivePrice,
    original_price: effectiveOriginal,
    originalPrice: effectiveOriginal,
    discounted_price: d.discountedPrice ?? d.discounted_price ?? null,
    priceCurrency: d.priceCurrency,
    discountPercentage: d.discountPercentage,
    deal: d.deal,

    duration_minutes: d.duration ?? d.duration_minutes ?? 60,
    duration: d.duration ?? d.duration_minutes ?? 60,
    durationText: d.durationText,

    key_ingredients: d.keyIngredients ?? d.key_ingredients ?? null,
    keyIngredients: d.keyIngredients ?? d.key_ingredients,
    benefits: d.benefits ?? null,
    precautions: d.precautions ?? null,
    aftercare: d.aftercare ?? null,

    suitable_for: d.suitableFor ?? d.suitable_for ?? null,
    suitableFor: d.suitableFor ?? d.suitable_for,
    tags: d.tags ?? null,

    is_trending: d.isTrending ?? d.trending ?? false,
    isTrending: d.isTrending ?? d.trending,
    trending: d.trending ?? d.isTrending,
    is_popular: d.isPopular ?? false,
    isPopular: d.isPopular,
    is_signature: d.is_signature ?? false,
    isBestSeller: d.isBestSeller ?? false,
    viral: d.viral,

    // DB columns — default to 0 for static JSON sources
    booking_count: d.booking_count ?? d.bookingCount ?? 0,
    rating_average: d.rating_average ?? d.rating ?? 0,
    rating_count: d.rating_count ?? d.reviews ?? d.reviewCount ?? 0,
    bookingCount: d.bookingCount ?? d.booking_count ?? 0,
    rating: d.rating ?? d.rating_average ?? 0,
    reviews: d.reviews ?? d.rating_count ?? 0,
    reviewCount: d.reviewCount ?? d.reviews ?? 0,
    reviewSource: d.reviewSource,

    requires_consultation: d.requires_consultation ?? false,
    active: d.active !== false,
    faqs: d.faqs ?? [],

    seoKeywords: d.seoKeywords,
    idealFor: d.idealFor,
    targetAudience: d.targetAudience,
    whatsIncluded: d.whatsIncluded,
    whatsNotIncluded: d.whatsNotIncluded,

    availability: d.availability,
    requirements: d.requirements,
    addOns: d.addOns,
    serviceArea: d.serviceArea,
    provider: d.provider,
    geo: d.geo,
    nearbyLandmarks: d.nearbyLandmarks,

    seasonalTags: d.seasonalTags,
    processingTime: d.processingTime,
    cancellationPolicy: d.cancellationPolicy,
    link: d.link ?? d.url,

    created_at: d.created_at ?? '',
    updated_at: d.updated_at ?? '',
  };
};