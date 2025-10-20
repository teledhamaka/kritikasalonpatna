// context/BookingContext.tsx
'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { Service as UnifiedService, BookingItem as UnifiedBookingItem } from '../types/service';

// Use the unified Service type from types/service.ts
type Service = UnifiedService;
type BookingItem = UnifiedBookingItem;

// Rest of your existing interfaces (Address, Stylist, TimeSlot, Personalization) remain the same
interface Address {
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

interface Stylist {
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

interface TimeSlot {
  id: string;
  date: string;
  time: string;
  stylist_id: string;
  available: boolean;
  duration_minutes: number;
  period?: 'morning' | 'afternoon' | 'evening';
  popular?: boolean;
}

interface Personalization {
  preferred_music?: string;
  lighting_preference?: string;
  conversation_style?: string;
  special_instructions?: string;
  preferred_style?: string;
}

interface BookingState {
  cart: BookingItem[];
  favorites: string[];
  selectedServices: Service[];
  selectedStylist?: Stylist;
  selectedTimeSlot?: TimeSlot;
  selectedAddress?: Address;
  availableTimeSlots: TimeSlot[];
  personalization?: Personalization;
  bookingDetails: {
    appointment_date?: string;
    start_time?: string;
    end_time?: string;
    discount_amount: number;
    tip_amount: number;
    special_instructions?: string;
    payment_method?: string;
  };
  isBookingInProgress: boolean;
  loading: boolean;
  addresses: Address[];
  stylists: Stylist[];
}

type BookingAction =
  | { type: 'ADD_TO_CART'; payload: Service }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'ADD_TO_FAVORITES'; payload: string }
  | { type: 'REMOVE_FROM_FAVORITES'; payload: string }
  | { type: 'SET_SELECTED_SERVICES'; payload: Service[] }
  | { type: 'SET_SELECTED_STYLIST'; payload: Stylist | undefined }
  | { type: 'SET_SELECTED_TIME_SLOT'; payload: TimeSlot | undefined }
  | { type: 'SET_SELECTED_ADDRESS'; payload: Address | undefined }
  | { type: 'SET_AVAILABLE_TIME_SLOTS'; payload: TimeSlot[] }
  | { type: 'SET_PERSONALIZATION'; payload: Personalization }
  | { type: 'UPDATE_BOOKING_DETAILS'; payload: Partial<BookingState['bookingDetails']> }
  | { type: 'SET_BOOKING_IN_PROGRESS'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ADDRESSES'; payload: Address[] }
  | { type: 'SET_STYLISTS'; payload: Stylist[] }
  | { type: 'LOAD_PERSISTED_STATE'; payload: Partial<BookingState> }
  | { type: 'RESET_BOOKING_FLOW' };

// Fixed BookingContextType - removed cart override to avoid type conflict
interface BookingContextType extends BookingState {
  addToCart: (service: Service) => void;
  removeFromCart: (serviceId: string) => void;
  updateQuantity: (serviceId: string, quantity: number) => void;
  clearCart: () => void;
  addToFavorites: (serviceId: string) => Promise<void>;
  removeFromFavorites: (serviceId: string) => Promise<void>;
  toggleFavorite: (serviceId: string) => Promise<void>;
  isFavorite: (serviceId: string) => boolean;
  loadUserFavorites: () => Promise<void>;
  setSelectedServices: (services: Service[]) => void;
  setSelectedStylist: (stylist: Stylist | undefined) => void;
  setSelectedTimeSlot: (slot: TimeSlot | undefined) => void;
  setSelectedAddress: (address: Address | undefined) => void;
  setPersonalization: (personalization: Personalization) => void;
  updateBookingDetails: (details: Partial<BookingState['bookingDetails']>) => void;
  setBookingInProgress: (inProgress: boolean) => void;
  resetBookingFlow: () => void;
  fetchAvailableTimeSlots: (date: string, stylistId?: string) => Promise<void>;
  fetchAddresses: () => Promise<void>;
  fetchStylists: (filters?: { trending?: boolean; topRated?: boolean }) => Promise<void>;
  createBooking: () => Promise<{ success: boolean; appointmentId?: string; bookingId?: string; error?: string }>;
  cartItemCount: number;
  totalDuration: number;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
}

// Create the context with proper typing
const BookingContext = createContext<BookingContextType | undefined>(undefined);

const initialState: BookingState = {
  cart: [],
  favorites: [],
  selectedServices: [],
  selectedStylist: undefined,
  selectedTimeSlot: undefined,
  selectedAddress: undefined,
  availableTimeSlots: [],
  personalization: undefined,
  bookingDetails: {
    discount_amount: 0,
    tip_amount: 0,
  },
  isBookingInProgress: false,
  loading: false,
  addresses: [],
  stylists: [],
};

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItem = state.cart.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }

      // Convert Service to BookingItem by adding quantity
      const bookingItem: BookingItem = {
        ...action.payload,
        quantity: 1
      };

      return {
        ...state,
        cart: [...state.cart, bookingItem],
      };
    }

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload),
      };

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          cart: state.cart.filter(item => item.id !== action.payload.id),
        };
      }

      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    }

    case 'CLEAR_CART':
      return {
        ...state,
        cart: [],
      };

    case 'ADD_TO_FAVORITES':
      return {
        ...state,
        favorites: [...state.favorites, action.payload],
      };

    case 'REMOVE_FROM_FAVORITES':
      return {
        ...state,
        favorites: state.favorites.filter(id => id !== action.payload),
      };

    case 'SET_SELECTED_SERVICES':
      return {
        ...state,
        selectedServices: action.payload,
      };

    case 'SET_SELECTED_STYLIST':
      return {
        ...state,
        selectedStylist: action.payload,
      };

    case 'SET_SELECTED_TIME_SLOT':
      return {
        ...state,
        selectedTimeSlot: action.payload,
      };

    case 'SET_SELECTED_ADDRESS':
      return {
        ...state,
        selectedAddress: action.payload,
      };

    case 'SET_AVAILABLE_TIME_SLOTS':
      return {
        ...state,
        availableTimeSlots: action.payload,
      };

    case 'SET_PERSONALIZATION':
      return {
        ...state,
        personalization: action.payload,
      };

    case 'UPDATE_BOOKING_DETAILS':
      return {
        ...state,
        bookingDetails: {
          ...state.bookingDetails,
          ...action.payload,
        },
      };

    case 'SET_BOOKING_IN_PROGRESS':
      return {
        ...state,
        isBookingInProgress: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    case 'SET_ADDRESSES':
      return {
        ...state,
        addresses: action.payload,
      };

    case 'SET_STYLISTS':
      return {
        ...state,
        stylists: action.payload,
      };

    case 'LOAD_PERSISTED_STATE':
      return {
        ...state,
        ...action.payload,
      };

    case 'RESET_BOOKING_FLOW':
      return {
        ...state,
        selectedServices: [],
        selectedStylist: undefined,
        selectedTimeSlot: undefined,
        selectedAddress: undefined,
        availableTimeSlots: [],
        personalization: undefined,
        bookingDetails: initialState.bookingDetails,
        isBookingInProgress: false,
      };

    default:
      return state;
  }
}

interface BookingProviderProps {
  children: ReactNode;
}

export const BookingProvider: React.FC<BookingProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);
  const { user, profile } = useAuth();

  // Load cart and favorites from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('salon-cart');
    const savedFavorites = localStorage.getItem('salon-favorites');
    
    if (savedCart) {
      try {
        const cart = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_PERSISTED_STATE', payload: { cart } });
      } catch (e) {
        console.error('Error loading cart:', e);
      }
    }
    
    if (savedFavorites) {
      try {
        const favorites = JSON.parse(savedFavorites);
        dispatch({ type: 'LOAD_PERSISTED_STATE', payload: { favorites } });
      } catch (e) {
        console.error('Error loading favorites:', e);
      }
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('salon-cart', JSON.stringify(state.cart));
  }, [state.cart]);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('salon-favorites', JSON.stringify(state.favorites));
  }, [state.favorites]);

  // Load user data on auth
  useEffect(() => {
    if (user) {
      loadUserFavorites();
      fetchAddresses();
    }
  }, [user?.id]);

  const cartItemCount = useMemo(() => {
    return state.cart.reduce((count, item) => count + item.quantity, 0);
  }, [state.cart]);

  const subtotal = useMemo(() => {
    return state.cart.reduce((total, item) => {
      // Safe price calculation with null checks
      const price = item.discounted_price || item.price || item.base_price || 0;
      return total + (price * item.quantity);
    }, 0);
  }, [state.cart]);
  
  const totalDuration = useMemo(() => {
    return state.cart.reduce((duration, item) => {
      const itemDuration = item.duration_minutes || item.duration || 60;
      return duration + (itemDuration * item.quantity);
    }, 0);
  }, [state.cart]);

  const taxAmount = useMemo(() => {
    const taxRate = 0.18; // 18% GST
    return subtotal * taxRate;
  }, [subtotal]);

  const totalAmount = useMemo(() => {
    const total = subtotal + taxAmount + (state.bookingDetails.tip_amount || 0) - (state.bookingDetails.discount_amount || 0);
    return Math.max(0, total);
  }, [subtotal, taxAmount, state.bookingDetails.tip_amount, state.bookingDetails.discount_amount]);

  const addToCart = useCallback((service: Service) => {
    dispatch({ type: 'ADD_TO_CART', payload: service });
  }, []);

  const removeFromCart = useCallback((serviceId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: serviceId });
  }, []);

  const updateQuantity = useCallback((serviceId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: serviceId, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const loadUserFavorites = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('service_id')
        .eq('user_id', user.id);

      if (!error && data) {
        const favorites = data.map(fav => fav.service_id);
        dispatch({ type: 'LOAD_PERSISTED_STATE', payload: { favorites } });
      }
    } catch (error) {
      console.error('Error loading user favorites:', error);
    }
  }, [user?.id]);

  const addToFavorites = useCallback(async (serviceId: string) => {
    if (state.favorites.includes(serviceId)) return;

    dispatch({ type: 'ADD_TO_FAVORITES', payload: serviceId });

    if (user) {
      try {
        await supabase
          .from('user_favorites')
          .insert({ user_id: user.id, service_id: serviceId });
      } catch (error) {
        console.error('Error saving favorite:', error);
      }
    }
  }, [state.favorites, user]);

  const removeFromFavorites = useCallback(async (serviceId: string) => {
    dispatch({ type: 'REMOVE_FROM_FAVORITES', payload: serviceId });

    if (user) {
      try {
        await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('service_id', serviceId);
      } catch (error) {
        console.error('Error removing favorite:', error);
      }
    }
  }, [user]);

  const toggleFavorite = useCallback(async (serviceId: string) => {
    if (state.favorites.includes(serviceId)) {
      await removeFromFavorites(serviceId);
    } else {
      await addToFavorites(serviceId);
    }
  }, [state.favorites, addToFavorites, removeFromFavorites]);

  const isFavorite = useCallback((serviceId: string) => {
    return state.favorites.includes(serviceId);
  }, [state.favorites]);

  const fetchAddresses = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (!error && data) {
        dispatch({ type: 'SET_ADDRESSES', payload: data });
        
        // Auto-select default address
        const defaultAddress = data.find(addr => addr.is_default);
        if (defaultAddress && !state.selectedAddress) {
          dispatch({ type: 'SET_SELECTED_ADDRESS', payload: defaultAddress });
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  }, [user?.id, state.selectedAddress]);

  const fetchStylists = useCallback(async (filters?: { trending?: boolean; topRated?: boolean }) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      let query = supabase
        .from('stylists')
        .select('*')
        .eq('is_active', true);

      if (filters?.trending) {
        query = query.eq('is_trending', true);
      }

      if (filters?.topRated) {
        query = query.gte('rating', 4.8);
      }

      query = query.order('is_featured', { ascending: false })
        .order('trending_rank', { ascending: false })
        .order('rating', { ascending: false });

      const { data, error } = await query;

      if (!error && data) {
        dispatch({ type: 'SET_STYLISTS', payload: data });
      }
    } catch (error) {
      console.error('Error fetching stylists:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const fetchAvailableTimeSlots = useCallback(async (date: string, stylistId?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Calculate duration from cart (with fallback)
      const calculatedDuration = state.cart.reduce((total, item) => {
        const itemDuration = item.duration_minutes || item.duration || 60;
        return total + (itemDuration * (item.quantity || 1));
      }, 0) || 60; // Default to 60 minutes if cart is empty

      // Get existing appointments for the date
      let query = supabase
        .from('appointments')
        .select('start_time, end_time, total_duration')
        .eq('appointment_date', date)
        .in('status', ['scheduled', 'confirmed', 'in_progress']);

      if (stylistId) {
        query = query.eq('stylist_id', stylistId);
      }

      const { data: bookedSlots, error } = await query;

      if (error) {
        console.error('Supabase error:', error);
        // Don't throw, continue with empty booked slots
      }

      // Get stylist working hours
      const stylist = stylistId 
        ? state.stylists.find(s => s.id === stylistId) || state.selectedStylist
        : state.selectedStylist;

      const startHour = stylist && stylist.start_time 
        ? parseInt(stylist.start_time.split(':')[0]) 
        : 9;
      const endHour = stylist && stylist.end_time 
        ? parseInt(stylist.end_time.split(':')[0]) 
        : 20; // Extended to 8 PM
      const slotInterval = 30; // 30 minutes

      const slots: TimeSlot[] = [];
      const bookedTimes = new Set(
        bookedSlots?.map(slot => slot.start_time) || []
      );

      // Check if selected date is today
      const today = new Date();
      const selectedDate = new Date(date);
      const isToday = selectedDate.toDateString() === today.toDateString();
      const currentHour = today.getHours();
      const currentMinutes = today.getMinutes();

      for (let hour = startHour; hour < endHour; hour++) {
        for (let minutes = 0; minutes < 60; minutes += slotInterval) {
          // Skip past time slots if it's today
          if (isToday && (hour < currentHour || (hour === currentHour && minutes <= currentMinutes))) {
            continue;
          }

          const timeString = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          
          // Check if slot can accommodate the service duration
          const slotEndTime = new Date(`2024-01-01 ${timeString}`);
          slotEndTime.setMinutes(slotEndTime.getMinutes() + calculatedDuration);

          // Only add slot if it ends before closing time
          if (slotEndTime.getHours() < endHour || 
              (slotEndTime.getHours() === endHour && slotEndTime.getMinutes() === 0)) {
            const available = !bookedTimes.has(timeString);
            const period: 'morning' | 'afternoon' | 'evening' = 
              hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

            slots.push({
              id: `${date}-${timeString}-${stylistId || 'any'}`,
              date,
              time: timeString,
              stylist_id: stylistId || '',
              available,
              duration_minutes: calculatedDuration,
              period,
              popular: available && (hour === 10 || hour === 14 || hour === 16),
            });
          }
        }
      }

      dispatch({ type: 'SET_AVAILABLE_TIME_SLOTS', payload: slots });
    } catch (error) {
      console.error('Error fetching time slots:', error);
      // Generate default slots even on error
      const defaultSlots: TimeSlot[] = [];
      for (let hour = 9; hour < 18; hour++) {
        for (let minutes = 0; minutes < 60; minutes += 30) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          defaultSlots.push({
            id: `${date}-${timeString}-default`,
            date,
            time: timeString,
            stylist_id: stylistId || '',
            available: true,
            duration_minutes: 60,
            period: hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening',
          });
        }
      }
      dispatch({ type: 'SET_AVAILABLE_TIME_SLOTS', payload: defaultSlots });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.stylists, state.selectedStylist, state.cart]);

  const createBooking = useCallback(async (): Promise<{ 
    success: boolean; 
    appointmentId?: string; 
    bookingId?: string; 
    error?: string 
  }> => {
    if (!user || !state.selectedTimeSlot || !state.selectedAddress) {
      return { 
        success: false, 
        error: 'Missing required information: user, time slot, or address' 
      };
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Calculate end time
      const startTime = new Date(`${state.selectedTimeSlot.date} ${state.selectedTimeSlot.time}`);
      const endTime = new Date(startTime.getTime() + totalDuration * 60000);

      // Create appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          stylist_id: state.selectedStylist?.id,
          appointment_date: state.selectedTimeSlot.date,
          start_time: state.selectedTimeSlot.time,
          end_time: endTime.toTimeString().slice(0, 5),
          total_duration: totalDuration,
          subtotal: subtotal,
          tax_amount: taxAmount,
          discount_amount: state.bookingDetails.discount_amount || 0,
          tip_amount: state.bookingDetails.tip_amount || 0,
          total_amount: totalAmount,
          special_instructions: state.personalization?.special_instructions || state.bookingDetails.special_instructions,
          preferred_music: state.personalization?.preferred_music,
          lighting_preference: state.personalization?.lighting_preference,
          conversation_style: state.personalization?.conversation_style,
          status: 'scheduled',
          payment_status: 'pending',
        })
        .select()
        .single();

      if (appointmentError) throw appointmentError;

      // Create booking record
      const bookingId = `BK${Date.now().toString().slice(-8)}`;
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          booking_id: bookingId,
          date: state.selectedTimeSlot.date,
          time: state.selectedTimeSlot.time,
          stylist_name: state.selectedStylist?.full_name || 'Any Available',
          address_id: state.selectedAddress.id,
          address: state.selectedAddress.full_address,
          total_price: totalAmount,
          services: state.cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.discounted_price || item.price || item.base_price || 0,
            quantity: item.quantity,
          })),
          customer_name: profile?.full_name || user.email || '',
          customer_phone: profile?.phone || '',
          payment_method: state.bookingDetails.payment_method || 'pending',
          status: 'Upcoming',
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create appointment services with safe price calculations
      const appointmentServices = state.cart.map(item => {
        const basePrice = item.base_price || 0;
        const finalPrice = item.discounted_price || item.price || basePrice;
        const discountAmount = (item.discounted_price ? basePrice - finalPrice : 0) * item.quantity;
        const totalPrice = finalPrice * item.quantity;

        return {
          appointment_id: appointment.id,
          service_id: item.id,
          quantity: item.quantity,
          unit_price: basePrice,
          discount_amount: discountAmount,
          total_price: totalPrice,
        };
      });

      const { error: servicesError } = await supabase
        .from('appointment_services')
        .insert(appointmentServices);

      if (servicesError) throw servicesError;

      // Clear cart and reset flow
      dispatch({ type: 'CLEAR_CART' });
      dispatch({ type: 'RESET_BOOKING_FLOW' });

      return { 
        success: true, 
        appointmentId: appointment.id,
        bookingId: bookingId,
      };
    } catch (error: any) {
      console.error('Error creating booking:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to create booking' 
      };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [
    user, 
    profile,
    state.selectedTimeSlot, 
    state.selectedStylist, 
    state.selectedAddress,
    state.cart, 
    state.bookingDetails,
    state.personalization,
    totalDuration,
    subtotal,
    taxAmount,
    totalAmount,
  ]);

  const setSelectedServices = useCallback((services: Service[]) => {
    dispatch({ type: 'SET_SELECTED_SERVICES', payload: services });
  }, []);

  const setSelectedStylist = useCallback((stylist: Stylist | undefined) => {
    dispatch({ type: 'SET_SELECTED_STYLIST', payload: stylist });
  }, []);

  const setSelectedTimeSlot = useCallback((slot: TimeSlot | undefined) => {
    dispatch({ type: 'SET_SELECTED_TIME_SLOT', payload: slot });
    if (slot) {
      dispatch({
        type: 'UPDATE_BOOKING_DETAILS',
        payload: {
          appointment_date: slot.date,
          start_time: slot.time,
        },
      });
    }
  }, []);

  const setSelectedAddress = useCallback((address: Address | undefined) => {
    dispatch({ type: 'SET_SELECTED_ADDRESS', payload: address });
  }, []);

  const setPersonalization = useCallback((personalization: Personalization) => {
    dispatch({ type: 'SET_PERSONALIZATION', payload: personalization });
  }, []);

  const updateBookingDetails = useCallback((details: Partial<BookingState['bookingDetails']>) => {
    dispatch({ type: 'UPDATE_BOOKING_DETAILS', payload: details });
  }, []);

  const setBookingInProgress = useCallback((inProgress: boolean) => {
    dispatch({ type: 'SET_BOOKING_IN_PROGRESS', payload: inProgress });
  }, []);

  const resetBookingFlow = useCallback(() => {
    dispatch({ type: 'RESET_BOOKING_FLOW' });
  }, []);

  const value: BookingContextType = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    loadUserFavorites,
    setSelectedServices,
    setSelectedStylist,
    setSelectedTimeSlot,
    setSelectedAddress,
    setPersonalization,
    updateBookingDetails,
    setBookingInProgress,
    resetBookingFlow,
    fetchAvailableTimeSlots,
    fetchAddresses,
    fetchStylists,
    createBooking,
    cartItemCount,
    totalDuration,
    subtotal,
    taxAmount,
    totalAmount,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

// Export the context and types
export { BookingContext };
export type { Address, Stylist, Service, BookingItem, TimeSlot, Personalization };