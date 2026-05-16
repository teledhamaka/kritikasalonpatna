'use client';

// ============================================================
// FILE: context/BookingContext.tsx
//
// TYPESCRIPT FIXES in this version:
//
// FIX 1 (error 1128 — line 300): Syntax error in toggleFavorite
//   Root cause: mixed `{ }` block body with `)` closing paren
//     ❌ await withRetry(async () => {
//          await isFav ? ... : ...
//        );          ← should be }) not )
//   Fix: switch to expression body (no braces needed for single expression):
//     ✅ await withRetry(() =>
//          isFav ? ... : ...
//        );
//
// FIX 2 (errors 2339 — lines 360, 386): Missing `await` before withRetry
//   ❌ const { data: appt, error: apptErr } = withRetry(...)
//      TypeScript: destructuring a Promise<T>, not T
//   ✅ const { data: appt, error: apptErr } = await withRetry(...)
//
// FIX 3 (error 2339 — line 425): `.catch()` on `PromiseLike`
//   Root cause: withRetry(fn).catch() — TypeScript infers return
//   of fn as PromiseLike<T> (Supabase builders) → withRetry result
//   may not carry .catch() in some inference paths
//   Fix: wrap fire-and-forget calls in void + try-catch inside async IIFE
//     ✅ void (async () => { try { await withRetry(...) } catch {} })();
//
// FIX 4: Removed `async` and `await` from inside withRetry fn arg
//   fn is () => PromiseLike<T> — Supabase builder is already PromiseLike
//   Adding `async () => await` adds an extra Promise wrapper unnecessarily
// ============================================================

import React, {
  createContext, useContext, useReducer, useEffect,
  useMemo, useCallback, useRef, ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase/client';
import { getEffectivePrice } from '@/types';
import {
  withRetry,
  normalizePhone,
  generateBookingId,
} from '@/lib/utils/booking';
import type { Service, CartItem, Address } from '@/types';

// ── State ─────────────────────────────────────────────────────
interface BookingState {
  cart:      CartItem[];
  favorites: string[];
  addresses: Address[];
  loading:   boolean;
}

const initialState: BookingState = {
  cart: [], favorites: [], addresses: [], loading: false,
};

type Action =
  | { type: 'SET_CART';         payload: CartItem[] }
  | { type: 'ADD_TO_CART';      payload: Service }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY';  payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_FAVORITES';    payload: string[] }
  | { type: 'ADD_FAVORITE';     payload: string }
  | { type: 'REMOVE_FAVORITE';  payload: string }
  | { type: 'SET_ADDRESSES';    payload: Address[] }
  | { type: 'SET_LOADING';      payload: boolean };

function reducer(state: BookingState, action: Action): BookingState {
  switch (action.type) {
    case 'SET_CART': return { ...state, cart: action.payload };
    case 'ADD_TO_CART': {
      const ex = state.cart.find(i => i.id === action.payload.id);
      if (ex) {
        return {
          ...state,
          cart: state.cart.map(i =>
            i.id === action.payload.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { ...state, cart: [...state.cart, { ...action.payload, quantity: 1 }] };
    }
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter(i => i.id !== action.payload) };
    case 'UPDATE_QUANTITY':
      if (action.payload.quantity <= 0) {
        return { ...state, cart: state.cart.filter(i => i.id !== action.payload.id) };
      }
      return {
        ...state,
        cart: state.cart.map(i =>
          i.id === action.payload.id ? { ...i, quantity: action.payload.quantity } : i
        ),
      };
    case 'CLEAR_CART':    return { ...state, cart: [] };
    case 'SET_FAVORITES': return { ...state, favorites: action.payload };
    case 'ADD_FAVORITE':
      return state.favorites.includes(action.payload)
        ? state
        : { ...state, favorites: [...state.favorites, action.payload] };
    case 'REMOVE_FAVORITE':
      return { ...state, favorites: state.favorites.filter(id => id !== action.payload) };
    case 'SET_ADDRESSES': return { ...state, addresses: action.payload };
    case 'SET_LOADING':   return { ...state, loading: action.payload };
    default: return state;
  }
}

// ── Context types ─────────────────────────────────────────────
export interface BookingFormData {
  date:                string;
  time:                string;
  name?:               string;
  phone?:              string;
  address:             string;
  stylist:             string;
  specialInstructions: string;
  paymentMethod:       string;
}

interface BookingResult { success: boolean; bookingId?: string; error?: string; }

interface ProfileDefaults {
  name:          string;
  phone:         string;
  needsPhone:    boolean;
  needsBirthday: boolean;
}

interface BookingContextType extends BookingState {
  addToCart:         (service: Service) => void;
  removeFromCart:    (id: string) => void;
  updateQuantity:    (id: string, quantity: number) => void;
  clearCart:         () => void;
  toggleFavorite:    (id: string) => Promise<void>;
  isFavorite:        (id: string) => boolean;
  loadUserFavorites: () => Promise<void>;
  fetchAddresses:    () => Promise<void>;
  createBooking:     (data: BookingFormData) => Promise<BookingResult>;
  getSubtotal:       () => number;
  getTaxAmount:      () => number;
  getTotalAmount:    () => number;
  cartItemCount:     number;
  totalDuration:     number;
  profileDefaults:   ProfileDefaults;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────
export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { profile } = useAuth();

  const bookingInProgress = useRef(false);
  const pendingFavorites  = useRef(new Set<string>());

  // ── Cart restore ──────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem('kr-cart');
      if (!raw) return;
      const items: CartItem[] = JSON.parse(raw);
      if (Array.isArray(items) && items.length > 0) {
        dispatch({ type: 'SET_CART', payload: items });
      }
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem('kr-cart', JSON.stringify(state.cart)); }
    catch {}
  }, [state.cart]);

  // ── On login: migrate + deduplicate + load addresses ──────
  useEffect(() => {
    if (profile?.id) {
      Promise.all([
        migrateGuestFavorites(),
        deduplicateCart(),
        fetchAddresses(),
      ]);
    } else {
      try {
        const raw = localStorage.getItem('kr-fav-guest');
        if (raw) dispatch({ type: 'SET_FAVORITES', payload: JSON.parse(raw) });
      } catch {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  // Persist guest favorites
  useEffect(() => {
    if (!profile?.id) {
      try { localStorage.setItem('kr-fav-guest', JSON.stringify(state.favorites)); }
      catch {}
    }
  }, [state.favorites, profile?.id]);

  // ── Guest favorites migration ─────────────────────────────
  const migrateGuestFavorites = useCallback(async () => {
    if (!profile?.id) return;
    try {
      const raw = localStorage.getItem('kr-fav-guest');
      const guestFavs: string[] = raw ? JSON.parse(raw) : [];
      if (guestFavs.length > 0) {
        await withRetry(() =>
          supabase
            .from('user_favorites')
            .upsert(
              guestFavs.map(serviceId => ({
                user_id: profile.id, service_id: serviceId,
              })),
              { onConflict: 'user_id,service_id', ignoreDuplicates: true }
            )
        );
        localStorage.removeItem('kr-fav-guest');
      }
      await loadUserFavorites();
    } catch {
      await loadUserFavorites();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  // ── Deduplicate cart on login ─────────────────────────────
  const deduplicateCart = useCallback(async () => {
    if (state.cart.length === 0) return;
    const seen  = new Set<string>();
    const clean = state.cart.filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
    if (clean.length !== state.cart.length) {
      dispatch({ type: 'SET_CART', payload: clean });
    }
  }, [state.cart]);

  // ── Computed ──────────────────────────────────────────────
  const cartItemCount = useMemo(
    () => state.cart.reduce((n, i) => n + i.quantity, 0), [state.cart]
  );
  const totalDuration = useMemo(
    () => state.cart.reduce((d, i) => d + (i.duration_minutes ?? 60) * i.quantity, 0),
    [state.cart]
  );
  const getSubtotal    = useCallback(
    () => state.cart.reduce((s, i) => s + getEffectivePrice(i) * i.quantity, 0),
    [state.cart]
  );
  const getTaxAmount   = useCallback(() => Math.round(getSubtotal() * 0.18), [getSubtotal]);
  const getTotalAmount = useCallback(() => getSubtotal() + getTaxAmount(), [getSubtotal, getTaxAmount]);

  const profileDefaults = useMemo<ProfileDefaults>(() => ({
    name:          profile?.full_name ?? profile?.first_name ?? '',
    phone:         profile?.phone     ?? '',
    needsPhone:    !profile?.phone,
    needsBirthday: !profile?.birthday,
  }), [profile]);

  // ── Cart actions ──────────────────────────────────────────
  const addToCart      = useCallback((s: Service) => dispatch({ type: 'ADD_TO_CART', payload: s }), []);
  const removeFromCart = useCallback((id: string) => dispatch({ type: 'REMOVE_FROM_CART', payload: id }), []);
  const updateQuantity = useCallback((id: string, qty: number) =>
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity: qty } }), []);
  const clearCart      = useCallback(() => dispatch({ type: 'CLEAR_CART' }), []);

  // ── Favorites ─────────────────────────────────────────────
  const loadUserFavorites = useCallback(async () => {
    if (!profile?.id) return;
    try {
      const { data } = await supabase
        .from('user_favorites').select('service_id').eq('user_id', profile.id);
      if (data) dispatch({ type: 'SET_FAVORITES', payload: data.map(r => r.service_id) });
    } catch {}
  }, [profile?.id]);

  // FIX 1: toggleFavorite — fixed syntax error (line 300)
  // The original had withRetry(async () => { await ternary ); — mismatched braces.
  // Correct form: withRetry(() => ternary) — expression body, no braces needed.
  const toggleFavorite = useCallback(async (serviceId: string) => {
    if (pendingFavorites.current.has(serviceId)) return;

    const isFav = state.favorites.includes(serviceId);
    pendingFavorites.current.add(serviceId);
    dispatch({ type: isFav ? 'REMOVE_FAVORITE' : 'ADD_FAVORITE', payload: serviceId });

    if (profile?.id) {
      try {
        // ✅ FIX 1: clean expression body — no braces, no stray paren
        await withRetry(() =>
          isFav
            ? supabase.from('user_favorites').delete()
                .eq('user_id', profile.id).eq('service_id', serviceId)
            : supabase.from('user_favorites')
                .insert({ user_id: profile.id, service_id: serviceId })
        );
      } catch {
        // All retries failed — rollback optimistic update
        dispatch({ type: isFav ? 'ADD_FAVORITE' : 'REMOVE_FAVORITE', payload: serviceId });
      } finally {
        pendingFavorites.current.delete(serviceId);
      }
    } else {
      pendingFavorites.current.delete(serviceId);
    }
  }, [state.favorites, profile?.id]);

  const isFavorite = useCallback(
    (id: string) => state.favorites.includes(id), [state.favorites]
  );

  // ── Addresses ─────────────────────────────────────────────
  const fetchAddresses = useCallback(async () => {
    if (!profile?.id) return;
    try {
      const { data } = await supabase
        .from('addresses').select('*')
        .eq('user_id', profile.id).eq('is_active', true)
        .order('is_default', { ascending: false });
      if (data) dispatch({ type: 'SET_ADDRESSES', payload: data });
    } catch {}
  }, [profile?.id]);

  // ── Create booking ────────────────────────────────────────
  const createBooking = useCallback(async (
    data: BookingFormData
  ): Promise<BookingResult> => {
    if (!profile?.id)            return { success: false, error: 'Please sign in to book.' };
    if (state.cart.length === 0) return { success: false, error: 'Your cart is empty.' };
    if (bookingInProgress.current) {
      return { success: false, error: 'Booking in progress. Please wait…' };
    }

    bookingInProgress.current = true;
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const subtotal    = getSubtotal();
      const taxAmount   = getTaxAmount();
      const totalAmount = getTotalAmount();
      const bookingId   = generateBookingId();

      const rawPhone      = data.phone?.trim() || profileDefaults.phone || '';
      const customerPhone = rawPhone ? normalizePhone(rawPhone) : '';
      const customerName  = data.name?.trim() || profileDefaults.name || 'Guest';

      const startDT = new Date(`${data.date}T${data.time}`);
      const endTime = new Date(startDT.getTime() + totalDuration * 60000)
        .toTimeString().slice(0, 5);

      // ✅ FIX 2: await withRetry — line 360 fix
      const { data: appt, error: apptErr } = await withRetry(() =>
        supabase
          .from('appointments')
          .insert({
            user_id:              profile.id,
            stylist_id:           data.stylist !== 'any' ? data.stylist : null,
            appointment_date:     data.date,
            start_time:           data.time,
            end_time:             endTime,
            total_duration:       totalDuration,
            subtotal,
            tax_amount:           taxAmount,
            total_amount:         totalAmount,
            discount_amount:      0,
            tip_amount:           0,
            special_instructions: data.specialInstructions || null,
            status:               'scheduled',
            payment_status:       'pending',
          })
          .select()
          .single()
      );

      if (apptErr) throw new Error('Couldn\'t create appointment. Please try again.');

      // ✅ FIX 2: await withRetry — line 386 fix
      const { error: bookingErr } = await withRetry(() =>
        supabase
          .from('bookings')
          .insert({
            user_id:        profile.id,
            booking_id:     bookingId,
            date:           data.date,
            time:           data.time,
            stylist_name:   data.stylist !== 'any' ? data.stylist : 'Any Available Stylist',
            address:        data.address,
            total_price:    totalAmount,
            services:       state.cart.map(i => ({
              id: i.id, name: i.name,
              price: getEffectivePrice(i), quantity: i.quantity,
            })),
            customer_name:  customerName,
            customer_phone: customerPhone,
            payment_method: data.paymentMethod,
            status:         'upcoming',
          })
      );

      if (bookingErr) {
        await supabase.from('appointments').delete().eq('id', appt.id);
        throw new Error('Couldn\'t save booking. Please try again.');
      }

      // Line items — fire-and-forget (non-critical)
      // ✅ void async IIFE — avoids .catch() on PromiseLike (error 2339)
      // Supabase builders return PromiseLike which only has .then(), not .catch()
      void (async () => {
        try {
          await supabase.from('appointment_services').insert(
            state.cart.map(item => ({
              appointment_id:  appt.id,
              service_id:      item.id,
              quantity:        item.quantity,
              unit_price:      item.base_price,
              discount_amount: item.discounted_price
                ? (item.base_price - item.discounted_price) * item.quantity : 0,
              total_price:     getEffectivePrice(item) * item.quantity,
            }))
          );
        } catch {}
      })();

      // ✅ FIX 3: fire-and-forget withRetry without .catch() on PromiseLike
      // Use void + async IIFE — avoids the PromiseLike.catch() error
      if (!profile.phone && customerPhone) {
        void (async () => {
          try {
            await withRetry(() =>
              supabase
                .from('profiles')
                .update({ phone: customerPhone, updated_at: new Date().toISOString() })
                .eq('id', profile.id)
            );
          } catch {}
        })();
      }

      dispatch({ type: 'CLEAR_CART' });
      return { success: true, bookingId };

    } catch (err: any) {
      return { success: false, error: err.message ?? 'Booking failed. Please try again.' };
    } finally {
      bookingInProgress.current = false;
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [
    profile?.id, profile?.phone,
    state.cart, totalDuration,
    profileDefaults, getSubtotal, getTaxAmount, getTotalAmount,
  ]);

  const value: BookingContextType = {
    ...state,
    addToCart, removeFromCart, updateQuantity, clearCart,
    toggleFavorite, isFavorite, loadUserFavorites, fetchAddresses,
    createBooking, getSubtotal, getTaxAmount, getTotalAmount,
    cartItemCount, totalDuration, profileDefaults,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking(): BookingContextType {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within BookingProvider');
  return ctx;
}

export { BookingContext };