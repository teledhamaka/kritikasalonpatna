// types/service.ts

// Unified Service interface that matches both contexts
export interface Service {
  id: string;
  name: string;
  title: string;
  slug?: string;
  description?: string;
  detailed_description?: string;
  shortDescription?: string;
  logo?: string;
  
  // Media
  image?: string;
  imageUrl?: string;
  image_url?: string;

  // Category & routing - FIXED
  category?: string; // legacy support (optional)
  categorySlug?: string;
  primaryCategory: 'makeup' | 'skin' | 'hair' | 'nails';
  eventCategory?: string; // e.g. "bridal", "party", "engagement"
  url: string; // CRITICAL: Added for internal linking + SEO
  
  // Pricing
  price: number;
  base_price: number;
  originalPrice: number;
  original_price?: number;
  discounted_price?: number;
  priceCurrency?: string;
  discountPercentage?: number;
  
  // Service details
  duration: number;
  duration_minutes: number;
  durationText?: string; // ADDED: For display (e.g. "2-3 hours")
  
  // Popularity flags
  isTrending?: boolean;
  is_trending?: boolean;
  is_popular?: boolean;
  isPopular?: boolean;
  is_signature?: boolean;
  isBestSeller?: boolean;
  trending?: boolean; // Added for backward compatibility
    
  // Service metadata
  category_id?: string;
  category_name?: string;
  requires_consultation?: boolean;
  suitable_for?: string[];
  suitableFor?: string[];
  tags?: string[];
  active?: boolean;
  viral?: boolean; // Added for viral services
  
  // Content fields - FIXED
  keyIngredients?: string[]; // ADDED: Was missing
  key_ingredients?: string[];
  benefits?: string[];
  precautions?: string;
  aftercare?: string;
  
  // Review and rating - ENHANCED
  rating?: number;
  reviews?: number;
  reviewCount?: number;
  reviewSource?: string; // ADDED: Schema + legal safety
  bookingCount?: number;
  
  // SEO - ADDED
  seoKeywords?: string[];
  
  // Audience & intent - FIXED
  idealFor?: string[]; // FIXED: Now array
  targetAudience?: string[]; // FIXED: Now array
  
  // Inclusions - ADDED
  whatsIncluded?: string[];
  whatsNotIncluded?: string[];
  
  // Availability
  availability?: {
    days: string[];
    times: string[];
  };
  requirements?: string[];
  
  // FAQs - STRONGLY TYPED
  faqs?: {
    question: string;
    answer: string;
  }[];
  
  // Add-ons - STRONGLY TYPED
  addOns?: {
    name: string;
    price: number;
  }[];
  
  // Geography - STRONGLY TYPED
  serviceArea?: {
    city: string;
    region: string;
    country: string;
    radiusKm?: number;
  };
  
  provider?: {
    name: string;
    address: string;
    phone?: string;
    googleMapsUrl?: string;
  };
  
  geo?: {
    lat: number;
    lng: number;
  };
  
  nearbyLandmarks?: string[];
  
  // Navigation and deals
  link?: string;
  deal?: string;
  serviceType?: 'makeup' | 'skin' | 'hair' | 'nails' | 'viral';
  service_type?: 'makeup' | 'skin' | 'hair' | 'nails' | 'viral';
  
  // Meta / ops - ADDED
  seasonalTags?: string[];
  processingTime?: string; // ADDED: e.g. "Same day booking available"
  cancellationPolicy?: string;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
}

// BookingItem interface for cart functionality
export interface BookingItem extends Service {
  quantity: number;
  selected_stylist_id?: string;
  stylist_name?: string;
  customizations?: Record<string, unknown>;
  notes?: string;
  selectedDate?: string;
  selectedTime?: string;
  specialInstructions?: string;
}

// Base database service type (from Supabase)
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
  duration_minutes: number;
  duration?: number;
  key_ingredients?: string[];
  benefits?: string[];
  precautions?: string;
  aftercare?: string;
  category_id?: string;
  category_name?: string;
  image_url?: string;
  is_popular?: boolean;
  is_signature?: boolean;
  requires_consultation?: boolean;
  suitable_for?: string[];
  tags?: string[];
  active: boolean;
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
  created_at: string;
  updated_at: string;
}

// Enhanced Stylist interface with all required fields
export interface Stylist {
  id: string;
  name?: string;
  full_name: string;
  specialties: string[];
  specialty?: string; // Added for single specialty display
  experience_years: number;
  experience?: string; // Added for backward compatibility like "8 years"
  bio?: string;
  about?: string; // Added for detailed bio
  rating: number;
  total_reviews: number;
  profile_image_url?: string;
  image?: string;
  working_days: number[];
  start_time: string;
  end_time: string;
  is_active: boolean;
  is_featured: boolean;
  available_times?: string[];
  
  // Enhanced fields for components
  price?: number; // Service fee for this stylist
  totalBookings?: number;
  badges?: string[];
  isVerified?: boolean;
  isTrending?: boolean;
  availableToday?: boolean;
  responseTime?: string;
}

// TimeSlot interface for booking with all required fields
export interface TimeSlot {
  id: string | number;
  date: string;
  time: string;
  stylist_id: string;
  available: boolean;
  duration_minutes: number;
  period?: string; // morning, afternoon, evening
  popular?: boolean;
}

// Specific service types that extend BaseService
export interface MakeupService extends BaseService {
  service_type?: 'makeup';
}

export interface SkinService extends BaseService {
  service_type?: 'skin';
}

export interface HairService extends BaseService {
  service_type?: 'hair';
}

export interface NailService extends BaseService {
  service_type?: 'nails';
}

export interface ViralService extends BaseService {
  service_type?: 'viral';
}

// Generic database service type
export type DatabaseService = MakeupService | SkinService | HairService | NailService | ViralService;

// Transform database service to unified service format
export const transformServiceForComponent = (
  service: DatabaseService | Record<string, unknown>,
  serviceType: 'makeup' | 'skin' | 'hair' | 'nails' | 'viral' = 'makeup'
): Service => {
  const s = service as any; // Internal cast to avoid breaking property access
  return {
    id: s.id,
    name: s.name || s.title,
    title: s.title || s.name,
    slug: s.slug,
    description: s.description,
    detailed_description: s.detailed_description,
    shortDescription: s.shortDescription,
    category: s.category,
    category_id: s.category_id,
    category_name: s.category_name,
    categorySlug: s.categorySlug,
    
    // FIXED: New taxonomy fields
    primaryCategory: s.primaryCategory || serviceType,
    eventCategory: s.eventCategory,
    url: s.url || `/${serviceType}/${s.slug || s.id}`,
    
    image: s.image || s.image_url,
    imageUrl: s.image || s.image_url,
    image_url: s.image_url || s.image,
    
    price: s.price || s.base_price,
    base_price: s.base_price || s.price,
    originalPrice: s.original_price || s.originalPrice,
    original_price: s.original_price,
    discounted_price: s.discounted_price,
    priceCurrency: s.priceCurrency,
    discountPercentage: s.discountPercentage,
    
    duration: s.duration || s.duration_minutes,
    duration_minutes: s.duration_minutes || s.duration,
    durationText: s.durationText,
    
    isTrending: s.is_trending || s.isTrending || s.trending,
    is_trending: s.is_trending || s.isTrending || s.trending,
    trending: s.trending || s.is_trending || s.isTrending,
    is_popular: s.is_popular || s.isPopular,
    isPopular: s.isPopular || s.is_popular,
    is_signature: s.is_signature,
    isBestSeller: s.isBestSeller,
    active: s.active !== false,
    viral: s.viral,
    
    keyIngredients: s.key_ingredients || s.keyIngredients,
    key_ingredients: s.key_ingredients || s.keyIngredients,
    benefits: s.benefits,
    precautions: s.precautions,
    aftercare: s.aftercare,
    
    requires_consultation: s.requires_consultation,
    suitable_for: s.suitable_for || s.suitableFor,
    suitableFor: s.suitableFor || s.suitable_for,
    tags: s.tags,
    rating: s.rating,
    reviews: s.reviews,
    reviewCount: s.reviewCount || s.reviews,
    reviewSource: s.reviewSource,
    bookingCount: s.bookingCount,
    
    seoKeywords: s.seoKeywords,
    idealFor: s.idealFor,
    targetAudience: s.targetAudience,
    whatsIncluded: s.whatsIncluded,
    whatsNotIncluded: s.whatsNotIncluded,
    
    availability: s.availability,
    requirements: s.requirements,
    faqs: s.faqs || [],
    
    addOns: s.addOns,
    serviceArea: s.serviceArea,
    provider: s.provider,
    geo: s.geo,
    nearbyLandmarks: s.nearbyLandmarks,
    
    link: s.link || s.url || `/${serviceType}/service/${s.id}`,
    deal: s.deal || (s.original_price && s.original_price > (s.price || s.base_price)
      ? `Save ₹${s.original_price - (s.price || s.base_price)}` 
      : undefined),
    serviceType,
    service_type: s.service_type || serviceType,
    
    seasonalTags: s.seasonalTags,
    processingTime: s.processingTime,
    cancellationPolicy: s.cancellationPolicy,
    
    created_at: s.created_at,
    updated_at: s.updated_at,
  };
};

// Transform JSON data to Service format (for static data)
export const transformJSONToService = (data: Record<string, unknown>): Service => {
  const d = data as any; // Internal cast to avoid breaking property access
  return {
    id: d.id,
    name: d.name || d.title,
    title: d.title || d.name,
    slug: d.slug,
    description: d.description,
    detailed_description: d.detailed_description,
    shortDescription: d.shortDescription,
    category: d.category,
    categorySlug: d.categorySlug,
    
    // FIXED: New taxonomy fields
    primaryCategory: d.primaryCategory,
    eventCategory: d.eventCategory,
    url: d.url,
    
    image: d.image,
    imageUrl: d.image,
    price: d.price,
    base_price: d.price,
    originalPrice: d.originalPrice,
    discounted_price: d.discountedPrice,
    priceCurrency: d.priceCurrency,
    discountPercentage: d.discountPercentage,
    
    duration: d.duration,
    duration_minutes: d.duration,
    durationText: d.durationText,
    
    isTrending: d.isTrending || d.trending,
    is_trending: d.isTrending || d.trending,
    trending: d.trending || d.isTrending,
    isPopular: d.isPopular,
    isBestSeller: d.isBestSeller,
    active: true,
    viral: d.viral,
    
    keyIngredients: d.keyIngredients,
    benefits: d.benefits,
    precautions: d.precautions,
    aftercare: d.aftercare,
    suitable_for: d.suitableFor,
    suitableFor: d.suitableFor,
    rating: d.rating,
    reviews: d.reviews,
    reviewCount: d.reviewCount || d.reviews,
    reviewSource: d.reviewSource,
    bookingCount: d.bookingCount,
    
    seoKeywords: d.seoKeywords,
    idealFor: d.idealFor,
    targetAudience: d.targetAudience,
    whatsIncluded: d.whatsIncluded,
    whatsNotIncluded: d.whatsNotIncluded,
    
    faqs: d.faqs || [],
    addOns: d.addOns,
    serviceArea: d.serviceArea,
    provider: d.provider,
    geo: d.geo,
    nearbyLandmarks: d.nearbyLandmarks,
    
    link: d.link || d.url,
    deal: d.deal,
    serviceType: d.serviceType,
    service_type: d.serviceType || d.service_type,
    
    seasonalTags: d.seasonalTags,
    processingTime: d.processingTime,
    cancellationPolicy: d.cancellationPolicy,
  };
};

// Filter types
export interface ServiceFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  duration?: number;
  trending?: boolean;
  search?: string;
  serviceType?: 'makeup' | 'skin' | 'hair' | 'nails' | 'viral';
  eventCategory?: string; // ADDED: For filtering by event type
}

// Sort options
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

// Generic service response
export interface ServiceResponse<T extends DatabaseService> {
  data: T[];
  error?: string;
  total?: number;
  page?: number;
  limit?: number;
}

// Hook return type for service hooks
export interface UseServiceReturn {
  services: Service[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Appointment interface
export interface Appointment {
  id: string;
  user_id: string;
  service_id: string;
  stylist_id: string;
  date: string;
  time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  total_amount: number;
  special_instructions?: string;
  rating?: number;
  review?: string;
  created_at: string;
  updated_at: string;
}

// Booking slot interface
export interface BookingSlot {
  date: string;
  time: string;
  available: boolean;
  stylist_id?: string;
}