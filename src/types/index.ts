// types/index.ts
export interface BlogPost {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  date: string;
  author: string;
  coverImage: string;
  tags: string[];
  keywords: string[];
  category: string;
  excerpt: string;
  content?: string;
}

export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  skinType?: 'dry' | 'oily' | 'combination' | 'normal' | 'sensitive';
  knownAllergies?: string[];
  previousServices: string[];
  beautyScanHistory: BeautyScanResult[];
}

export interface BeautyScanResult {
  date: string;
  image?: string; // Base64 thumbnail
  analysis: {
    skinScore: number;
    primaryConcern: string;
    recommendedServices: string[];
  };
}

export interface SalonService {
  id: string;
  name: string;
  category: 'makeup' | 'skin' | 'hair' | 'nail';
  duration: number; // minutes
  price: number;
  description: string;
  suitableFor?: string[];
  contraindications?: string[];
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  size: string;
  ingredients: string[];
  skinTypes: string[];
  imageUrl: string;
}

// types/index.ts - Complete type definitions for the beauty salon booking system

// ============================================
// User & Profile Types
// ============================================

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  birthday: string | null;
  age: number | null;
  anniversary_date: string | null;
  marital_status: 'single' | 'married' | 'engaged' | 'other';
  skin_type: 'dry' | 'oily' | 'combination' | 'normal' | 'sensitive' | null;
  hair_type: 'straight' | 'wavy' | 'curly' | 'coily' | null;
  profile_image_url: string | null;
  loyalty_points: number;
  total_bookings: number;
  total_spent: number;
  theme_style: 'pink' | 'purple' | 'blue' | 'green' | 'gold';
  enable_period_tracker: boolean;
  notification_preferences: {
    sms: boolean;
    push: boolean;
    email: boolean;
  };
  login_count: number;
  last_login_at: string | null;
  membership_tier?: 'basic' | 'premium' | 'vip';
  created_at: string;
  updated_at: string;
}

// ============================================
// Address Types
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

// ============================================
// Service Types
// ============================================

export interface ServiceCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  title: string | null;
  category_id: string | null;
  category: string | null;
  service_type: 'makeup' | 'skin' | 'hair' | 'nail' | 'spa' | 'other';
  description: string;
  detailed_description: string | null;
  image: string | null;
  image_url: string | null;
  base_price: number;
  price: number | null;
  original_price: number | null;
  discounted_price: number | null;
  duration_minutes: number;
  duration: number | null;
  key_ingredients: string[] | null;
  benefits: string[] | null;
  suitable_for: string[] | null;
  tags: string[] | null;
  precautions: string | null;
  aftercare: string | null;
  is_trending: boolean;
  is_popular: boolean;
  is_signature: boolean;
  requires_consultation: boolean;
  active: boolean;
  faqs: Array<{ question: string; answer: string; }> | null; // ✅ FIXED
  booking_count: number;
  rating_average: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export interface BookingItem extends Service {
  quantity: number;
  customizations?: Record<string, unknown>; // ✅ FIXED
  notes?: string;
}

// ============================================
// Stylist Types
// ============================================

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
  working_days: number[]; // 0-6 (Sunday-Saturday)
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

// ============================================
// Appointment & Booking Types
// ============================================

export interface TimeSlot {
  id: string;
  date: string;
  time: string;
  stylist_id: string;
  available: boolean;
  duration_minutes: number;
  period?: 'morning' | 'afternoon' | 'evening';
  popular?: boolean;
}

export interface Personalization {
  preferred_music?: string;
  lighting_preference?: string;
  conversation_style?: string;
  special_instructions?: string;
  preferred_style?: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  stylist_id: string | null;
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
  payment_method: string | null;
  special_instructions: string | null;
  share_code: string | null;
  referral_source: string | null;
  is_shared: boolean;
  shared_count: number;
  preferred_music: string | null;
  lighting_preference: string | null;
  conversation_style: string | null;
  confirmed_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppointmentService {
  id: string;
  appointment_id: string;
  service_id: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  total_price: number;
  customizations: Record<string, unknown> | null; // ✅ FIXED
  notes: string | null;
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  booking_id: string;
  date: string;
  time: string;
  stylist_name: string;
  address_id: string | null;
  address: string | null;
  total_price: number;
  services: BookingItem[]; // ✅ FIXED
  customer_name: string;
  customer_phone: string;
  payment_method: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  created_at: string;
  updated_at: string;
}

// ============================================
// Payment Types
// ============================================

export interface Payment {
  id: string;
  booking_id: string;
  user_id: string;
  amount: number;
  discounted_amount: number;
  currency: 'INR' | 'USD' | 'EUR';
  payment_method: 'credit_card' | 'phonepe' | 'google_pay' | 'paytm' | 'cash' | 'other';
  payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  transaction_id: string | null;
  gateway_response: Record<string, unknown> | null; // ✅ FIXED
  service_total: number;
  stylist_fee: number;
  discount_amount: number;
  is_premium_discount: boolean;
  loyalty_points_earned: number;
  loyalty_points_redeemed: number;
  reward_redemption_id: string | null;
  gateway_transaction_id: string | null;
  gateway_payment_id: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// Loyalty & Rewards Types
// ============================================

export interface LoyaltyTransaction {
  id: string;
  user_id: string;
  appointment_id: string | null;
  transaction_type: 'earned' | 'redeemed' | 'expired' | 'bonus' | 'adjustment' | 'social_bonus' | 'referral_bonus' | 'challenge_bonus';
  points: number;
  description: string;
  related_amount: number | null;
  expiry_date: string | null;
  social_share_bonus: boolean;
  referral_bonus: boolean;
  challenge_completion: boolean;
  streak_bonus: number;
  seasonal_multiplier: number;
  is_public: boolean;
  shared_on_platforms: string[];
  created_at: string;
}

export interface RewardRedemption {
  id: string;
  user_id: string;
  appointment_id: string | null;
  reward_type: string;
  reward_name: string;
  points_redeemed: number;
  discount_amount: number;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  used_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// Review Types
// ============================================

export interface BookingReview {
  id: string;
  booking_id: string;
  user_id: string;
  stylist_id: string | null;
  rating: number;
  review_text: string | null;
  service_rating: number | null;
  punctuality_rating: number | null;
  professionalism_rating: number | null;
  images: string[];
  is_verified: boolean;
  is_published: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// Notification Types
// ============================================

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'reminder' | 'promotion' | 'review' | 'general';
  related_id: string | null;
  related_type: string | null;
  is_read: boolean;
  action_url: string | null;
  created_at: string;
  read_at: string | null;
}

// ============================================
// Favorite Types
// ============================================

export interface UserFavorite {
  id: string;
  user_id: string;
  service_id: string;
  created_at: string;
}

// ============================================
// Preference Types
// ============================================

export interface UserPreference {
  id: string;
  user_id: string;
  preference_key: string;
  preference_value: unknown; // ✅ FIXED
  created_at: string;
  updated_at: string;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================
// Form Types
// ============================================

export interface AddressFormData {
  flat: string;
  colony: string;
  locality: string;
  landmark: string;
  city: string;
  pincode: string;
  address_type: 'home' | 'work' | 'other';
  delivery_instructions: string;
  is_default: boolean;
}

export interface BookingFormData {
  services: BookingItem[];
  address: Address;
  stylist?: Stylist;
  timeSlot: TimeSlot;
  personalization?: Personalization;
  paymentMethod: string;
}

// ============================================
// Filter Types
// ============================================

export interface ServiceFilters {
  category?: string;
  service_type?: string;
  min_price?: number;
  max_price?: number;
  is_trending?: boolean;
  is_popular?: boolean;
  search?: string;
}

export interface StylistFilters {
  specialties?: string[];
  min_rating?: number;
  is_trending?: boolean;
  is_featured?: boolean;
  availability_date?: string;
}

export interface BookingFilters {
  status?: string[];
  date_from?: string;
  date_to?: string;
  stylist_id?: string;
}

// ============================================
// Context Types
// ============================================

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<Profile>) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

export interface BookingContextType {
  cart: BookingItem[];
  favorites: string[];
  selectedServices: Service[];
  selectedStylist?: Stylist;
  selectedTimeSlot?: TimeSlot;
  selectedAddress?: Address;
  availableTimeSlots: TimeSlot[];
  personalization?: Personalization;
  addresses: Address[];
  stylists: Stylist[];
  loading: boolean;
  cartItemCount: number;
  totalDuration: number;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  
  // Methods
  addToCart: (service: Service) => void;
  removeFromCart: (serviceId: string) => void;
  updateQuantity: (serviceId: string, quantity: number) => void;
  clearCart: () => void;
  addToFavorites: (serviceId: string) => Promise<void>;
  removeFromFavorites: (serviceId: string) => Promise<void>;
  toggleFavorite: (serviceId: string) => Promise<void>;
  isFavorite: (serviceId: string) => boolean;
  setSelectedServices: (services: Service[]) => void;
  setSelectedStylist: (stylist: Stylist | undefined) => void;
  setSelectedTimeSlot: (slot: TimeSlot | undefined) => void;
  setSelectedAddress: (address: Address | undefined) => void;
  setPersonalization: (personalization: Personalization) => void;
  fetchAddresses: () => Promise<void>;
  fetchStylists: (filters?: { trending?: boolean; topRated?: boolean }) => Promise<void>;
  fetchAvailableTimeSlots: (date: string, stylistId?: string) => Promise<void>;
  createBooking: () => Promise<{ success: boolean; appointmentId?: string; bookingId?: string; error?: string }>;
  resetBookingFlow: () => void;
}

// ============================================
// Utility Types
// ============================================

export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  order: SortOrder;
}

export type BookingStatus = Appointment['status'];
export type PaymentStatus = Payment['payment_status'];
export type PaymentMethod = Payment['payment_method'];