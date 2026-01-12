// context/BookingContext.tsx
'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
//import { supabase } from '../lib/supabase';
import { supabase } from '@/lib/supabase/client';
import { Service } from '../types/service';

// BookingItem extends Service with quantity
export interface BookingItem extends Service {
  quantity: number;
}

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

interface BookingState {
  cart: BookingItem[];
  favorites: string[];
  loading: boolean;
  addresses: Address[];
}

type BookingAction =
  | { type: 'ADD_TO_CART'; payload: Service }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'ADD_TO_FAVORITES'; payload: string }
  | { type: 'REMOVE_FROM_FAVORITES'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ADDRESSES'; payload: Address[] }
  | { type: 'LOAD_PERSISTED_STATE'; payload: Partial<BookingState> };

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
  fetchAddresses: () => Promise<void>;
  createBooking: (bookingData: {
    date: string;
    time: string;
    name: string;
    phone: string;
    address: string;
    stylist: string;
    specialInstructions: string;
    paymentMethod: string;
  }) => Promise<{ success: boolean; bookingId?: string; error?: string }>;
  getTotalAmount: () => number;
  getSubtotal: () => number;
  getTaxAmount: () => number;
  cartItemCount: number;
  totalDuration: number;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const initialState: BookingState = {
  cart: [],
  favorites: [],
  loading: false,
  addresses: [],
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

    case 'LOAD_PERSISTED_STATE':
      return {
        ...state,
        ...action.payload,
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

  const getSubtotal = useCallback(() => {
    return state.cart.reduce((total, item) => {
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

  const getTaxAmount = useCallback(() => {
    const subtotal = getSubtotal();
    return Math.round(subtotal * 0.18); // 18% GST
  }, [getSubtotal]);

  const getTotalAmount = useCallback(() => {
    const subtotal = getSubtotal();
    const tax = getTaxAmount();
    return Math.round(subtotal + tax);
  }, [getSubtotal, getTaxAmount]);

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
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  }, [user?.id]);

  const createBooking = useCallback(async (bookingData: {
    date: string;
    time: string;
    name: string;
    phone: string;
    address: string;
    stylist: string;
    specialInstructions: string;
    paymentMethod: string;
  }): Promise<{ success: boolean; bookingId?: string; error?: string }> => {
    if (!user) {
      return { 
        success: false, 
        error: 'User not authenticated' 
      };
    }

    if (state.cart.length === 0) {
      return {
        success: false,
        error: 'Cart is empty'
      };
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const subtotal = getSubtotal();
      const taxAmount = getTaxAmount();
      const totalAmount = getTotalAmount();

      // Calculate end time
      const startDateTime = new Date(`${bookingData.date}T${bookingData.time}`);
      const endDateTime = new Date(startDateTime.getTime() + totalDuration * 60000);
      const endTime = endDateTime.toTimeString().slice(0, 5);

      // Generate booking ID
      const bookingId = `BK${Date.now().toString().slice(-8)}`;

      // Create appointment in Supabase
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          stylist_id: bookingData.stylist !== 'any' ? bookingData.stylist : null,
          appointment_date: bookingData.date,
          start_time: bookingData.time,
          end_time: endTime,
          total_duration: totalDuration,
          subtotal: subtotal,
          tax_amount: taxAmount,
          discount_amount: 0,
          tip_amount: 0,
          total_amount: totalAmount,
          special_instructions: bookingData.specialInstructions || null,
          status: 'scheduled',
          payment_status: bookingData.paymentMethod === 'pay_online' ? 'pending' : 'pending',
        })
        .select()
        .single();

      if (appointmentError) {
        console.error('Appointment creation error:', appointmentError);
        throw new Error('Failed to create appointment');
      }

      // Get stylist name
      let stylistName = 'Any Available Stylist';
      if (bookingData.stylist !== 'any') {
        const stylistMap: Record<string, string> = {
          'priya': 'Priya Sharma',
          'neha': 'Neha Singh',
          'riya': 'Riya Kumari'
        };
        stylistName = stylistMap[bookingData.stylist] || bookingData.stylist;
      }

      // Create booking record
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          booking_id: bookingId,
          date: bookingData.date,
          time: bookingData.time,
          stylist_name: stylistName,
          address: bookingData.address,
          total_price: totalAmount,
          services: state.cart.map(item => ({
            id: item.id,
            name: item.title || item.name,
            price: item.discounted_price || item.price || item.base_price || 0,
            quantity: item.quantity,
          })),
          customer_name: bookingData.name,
          customer_phone: bookingData.phone,
          payment_method: bookingData.paymentMethod,
          status: 'Upcoming',
        })
        .select()
        .single();

      if (bookingError) {
        console.error('Booking creation error:', bookingError);
        // Try to delete the appointment if booking fails
        await supabase.from('appointments').delete().eq('id', appointment.id);
        throw new Error('Failed to create booking');
      }

      // Create appointment services
      const appointmentServices = state.cart.map(item => {
        const basePrice = item.base_price || item.price || 0;
        const finalPrice = item.discounted_price || item.price || basePrice;
        const discountAmount = item.discounted_price ? (basePrice - finalPrice) * item.quantity : 0;
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

      if (servicesError) {
        console.error('Services creation error:', servicesError);
        // Continue anyway - this is not critical
      }

      // Clear cart on success
      dispatch({ type: 'CLEAR_CART' });

      return { 
        success: true, 
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
  }, [user, state.cart, totalDuration, getSubtotal, getTaxAmount, getTotalAmount]);

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
    fetchAddresses,
    createBooking,
    getTotalAmount,
    getSubtotal,
    getTaxAmount,
    cartItemCount,
    totalDuration,
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

export { BookingContext };
export type { Address };