// types/service.ts

// Unified Service interface that matches both contexts
export interface Service {
  id: string;
  name: string;
  title: string;
  description: string;
  detailed_description?: string;
  category: string;
  image: string;
  imageUrl?: string;
  image_url?: string;
  
  // Pricing
  price: number;
  base_price: number;
  originalPrice: number;
  original_price?: number;
  discounted_price?: number;
  
  // Service details
  duration: number;
  duration_minutes: number;
  isTrending?: boolean;
  is_trending?: boolean;
  is_popular?: boolean;
  is_signature?: boolean;
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
  
  // Content fields
  keyIngredients: string[];
  key_ingredients?: string[];
  benefits: string[];
  precautions?: string;
  aftercare?: string;
  
  // Review and rating
  rating?: number;
  reviews?: number;
  
  // Availability
  availability?: {
    days: string[];
    times: string[];
  };
  requirements?: string[];
  
  // FAQs
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  
  // Navigation and deals
  link?: string;
  deal?: string;
  serviceType?: 'makeup' | 'skin' | 'hair' | 'nail' | 'viral';
  service_type?: 'makeup' | 'skin' | 'hair' | 'nail' | 'viral';
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
}

// BookingItem interface for cart functionality
export interface BookingItem extends Service {
  quantity: number;
  selected_stylist_id?: string;
  stylist_name?: string;
  customizations?: Record<string, unknown>; // ✅ FIXED
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
  service_type?: 'nail';
}

export interface ViralService extends BaseService {
  service_type?: 'viral';
}

// Generic database service type
export type DatabaseService = MakeupService | SkinService | HairService | NailService | ViralService;

// Transform database service to unified service format
export const transformServiceForComponent = (
  service: DatabaseService | Record<string, unknown>, // ✅ FIXED
  serviceType: 'makeup' | 'skin' | 'hair' | 'nail' | 'viral' = 'makeup'
): Service => {
  const s = service as any; // Internal cast to avoid breaking property access
  return {
  id: s.id,
  name: s.name || s.title,
  title: s.title || s.name,
  description: s.description,
  detailed_description: s.detailed_description,
  category: s.category,
  category_id: s.category_id,
  category_name: s.category_name,
  
  image: s.image || s.image_url,
  imageUrl: s.image || s.image_url,
  image_url: s.image_url || s.image,
  
  price: s.price || s.base_price,
  base_price: s.base_price || s.price,
  originalPrice: s.original_price,
  original_price: s.original_price,
  discounted_price: s.discounted_price,
  
  duration: s.duration || s.duration_minutes,
  duration_minutes: s.duration_minutes || s.duration,
  
  isTrending: s.is_trending || s.isTrending || s.trending,
  is_trending: s.is_trending || s.isTrending || s.trending,
  trending: s.trending || s.is_trending || s.isTrending,
  is_popular: s.is_popular,
  is_signature: s.is_signature,
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
  availability: s.availability,
  requirements: s.requirements,
  faqs: s.faqs || [],
  
  link: s.link || `/${serviceType}/service/${s.id}`,
  deal: s.deal || (s.original_price && s.original_price > (s.price || s.base_price)
    ? `Save ₹${s.original_price - (s.price || s.base_price)}` 
    : undefined),
  serviceType,
  service_type: s.service_type || serviceType,
  
  created_at: s.created_at,
  updated_at: s.updated_at,
  };
};

// Transform JSON data to Service format (for static data)
export const transformJSONToService = (data: Record<string, unknown>): Service => { // ✅ FIXED
  const d = data as any; // Internal cast to avoid breaking property access
  return {
  id: d.id,
  name: d.name || d.title,
  title: d.title || d.name,
  description: d.description,
  detailed_description: d.detailed_description,
  category: d.category,
  image: d.image,
  imageUrl: d.image,
  price: d.price,
  base_price: d.price,
  originalPrice: d.originalPrice,
  discounted_price: d.discountedPrice,
  duration: d.duration,
  duration_minutes: d.duration,
  isTrending: d.isTrending || d.trending,
  is_trending: d.isTrending || d.trending,
  trending: d.trending || d.isTrending,
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
  faqs: d.faqs || [],
  link: d.link,
  deal: d.deal,
  serviceType: d.serviceType,
  service_type: d.serviceType || d.service_type,
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
  serviceType?: 'makeup' | 'skin' | 'hair' | 'nail' | 'viral';
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