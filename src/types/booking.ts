// ============================================
// 1. Types Definition (types/booking.ts)
// ============================================

export interface Address {
  id: string;
  user_id: string;
  flat: string | null;
  colony: string;
  locality: string;
  landmark: string | null;
  city: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  full_address: string | null;
  is_default: boolean;
  address_type: 'home' | 'work' | 'other';
  delivery_instructions: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Stylist {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  specialties: string[];
  experience_years: number;
  bio: string | null;
  profile_image_url: string | null;
  rating: number;
  total_reviews: number;
  total_appointments: number;
  repeat_clients: number;
  is_trending: boolean;
  trending_rank: number;
  social_media_handle: string | null;
  featured_in: string[];
  awards: string[];
  working_days: number[];
  start_time: string;
  end_time: string;
  music_preferences: string[];
  conversation_styles: string[];
  special_skills: string[];
  instagram_followers: number;
  portfolio_images: string[];
  video_intro_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimeSlot {
  id: string;
  stylist_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  notes?: string;
}

export interface Service {
  id: string;
  title: string;
  category: string;
  price: number;
  image: string;
  duration_minutes: number;
}

export interface Personalization {
  preferred_music?: string;
  lighting_preference?: string;
  conversation_style?: string;
  special_instructions?: string;
}

export interface Appointment {
  id?: string;
  user_id: string;
  stylist_id?: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  total_duration: number;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  tip_amount: number;
  total_amount: number;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  special_instructions?: string;
  share_code?: string;
  referral_source?: string;
  is_shared: boolean;
  shared_count: number;
  preferred_music?: string;
  lighting_preference?: string;
  conversation_style?: string;
  confirmed_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  created_at?: string;
  updated_at?: string;
}