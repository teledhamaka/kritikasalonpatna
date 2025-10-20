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
  customizations?: any;
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
  service: DatabaseService | any, 
  serviceType: 'makeup' | 'skin' | 'hair' | 'nail' | 'viral' = 'makeup'
): Service => ({
  id: service.id,
  name: service.name || service.title,
  title: service.title || service.name,
  description: service.description,
  detailed_description: service.detailed_description,
  category: service.category,
  category_id: service.category_id,
  category_name: service.category_name,
  
  image: service.image || service.image_url,
  imageUrl: service.image || service.image_url,
  image_url: service.image_url || service.image,
  
  price: service.price || service.base_price,
  base_price: service.base_price || service.price,
  originalPrice: service.original_price,
  original_price: service.original_price,
  discounted_price: service.discounted_price,
  
  duration: service.duration || service.duration_minutes,
  duration_minutes: service.duration_minutes || service.duration,
  
  isTrending: service.is_trending || service.isTrending || service.trending,
  is_trending: service.is_trending || service.isTrending || service.trending,
  trending: service.trending || service.is_trending || service.isTrending,
  is_popular: service.is_popular,
  is_signature: service.is_signature,
  active: service.active !== false,
  viral: service.viral,
  
  keyIngredients: service.key_ingredients || service.keyIngredients,
  key_ingredients: service.key_ingredients || service.keyIngredients,
  benefits: service.benefits,
  precautions: service.precautions,
  aftercare: service.aftercare,
  
  requires_consultation: service.requires_consultation,
  suitable_for: service.suitable_for || service.suitableFor,
  suitableFor: service.suitableFor || service.suitable_for,
  tags: service.tags,
  rating: service.rating,
  reviews: service.reviews,
  availability: service.availability,
  requirements: service.requirements,
  faqs: service.faqs || [],
  
  link: service.link || `/${serviceType}/service/${service.id}`,
  deal: service.deal || (service.original_price && service.original_price > (service.price || service.base_price)
    ? `Save ₹${service.original_price - (service.price || service.base_price)}` 
    : undefined),
  serviceType,
  service_type: service.service_type || serviceType,
  
  created_at: service.created_at,
  updated_at: service.updated_at,
});

// Transform JSON data to Service format (for static data)
export const transformJSONToService = (data: any): Service => ({
  id: data.id,
  name: data.name || data.title,
  title: data.title || data.name,
  description: data.description,
  detailed_description: data.detailed_description,
  category: data.category,
  image: data.image,
  imageUrl: data.image,
  price: data.price,
  base_price: data.price,
  originalPrice: data.originalPrice,
  discounted_price: data.discountedPrice,
  duration: data.duration,
  duration_minutes: data.duration,
  isTrending: data.isTrending || data.trending,
  is_trending: data.isTrending || data.trending,
  trending: data.trending || data.isTrending,
  active: true,
  viral: data.viral,
  keyIngredients: data.keyIngredients,
  benefits: data.benefits,
  precautions: data.precautions,
  aftercare: data.aftercare,
  suitable_for: data.suitableFor,
  suitableFor: data.suitableFor,
  rating: data.rating,
  reviews: data.reviews,
  faqs: data.faqs || [],
  link: data.link,
  deal: data.deal,
  serviceType: data.serviceType,
  service_type: data.serviceType || data.service_type,
});

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