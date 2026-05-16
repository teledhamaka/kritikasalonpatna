'use client';

// ============================================================
// FILE: hooks/useDebounce.ts
//
// RECOMMENDED FIX: Debounce + throttle for buttons
//
// WHY THIS MATTERS FOR INDIAN MOBILE NETWORKS:
//   On 4G with 200-500ms latency, users tap again when
//   nothing visually changes instantly. This causes:
//     • Double bookings
//     • Duplicate favorite toggles (partially fixed by pendingFavorites ref)
//     • Multiple login attempts submitted
//     • Cart quantity incremented twice
//
//   Two different tools for two different problems:
//
//   useThrottledCallback — for ACTION buttons
//     "Tap fires once, then ignores all taps for N ms"
//     Use on: Add to Cart, Book Now, Pay, Submit form
//     Typical delay: 1500ms (enough for Supabase round-trip in India)
//
//   useDebouncedCallback — for INPUT-triggered actions
//     "Wait until user stops typing/tapping for N ms, then fire"
//     Use on: Search, filter changes, address lookup
//     Typical delay: 400ms
//
// HOW TO USE:
//
//   // Book Now button — allow only 1 tap per 1.5 seconds
//   const handleBook = useThrottledCallback(() => {
//     createBooking(formData);
//   }, 1500);
//   <button onClick={handleBook}>Book Now</button>
//
//   // Add to Cart — allow 1 add per 800ms
//   const handleAdd = useThrottledCallback(() => {
//     addToCart(service);
//   }, 800);
//
//   // Search input — fire after 400ms of no typing
//   const handleSearch = useDebouncedCallback((query: string) => {
//     setFilter(query);
//   }, 400);
//   <input onChange={e => handleSearch(e.target.value)} />
// ============================================================

import { useCallback, useRef } from 'react';

// ── useThrottledCallback ─────────────────────────────────────
// Fires immediately on first call, then ignores calls for `wait` ms.
// Perfect for action buttons — gives instant feedback on tap, then
// blocks retaps until the action has time to complete.
export function useThrottledCallback<T extends (...args: any[]) => any>(
  fn:   T,
  wait: number = 1200,
): (...args: Parameters<T>) => void {
  const lastCalledAt = useRef<number>(0);

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCalledAt.current >= wait) {
      lastCalledAt.current = now;
      fn(...args);
    }
  }, [fn, wait]);
}

// ── useDebouncedCallback ─────────────────────────────────────
// Delays execution until `wait` ms after the last call.
// Perfect for search / filter inputs — avoids firing on every keystroke.
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  fn:   T,
  wait: number = 400,
): (...args: Parameters<T>) => void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback((...args: Parameters<T>) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      fn(...args);
    }, wait);
  }, [fn, wait]);
}

// ── useDebounce (value version) ──────────────────────────────
// React hook that returns a debounced version of a value.
// Use when you want to derive a debounced state, not wrap a function.
//
// Example:
//   const [query, setQuery] = useState('');
//   const debouncedQuery = useDebounce(query, 400);
//   useEffect(() => { search(debouncedQuery); }, [debouncedQuery]);
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, wait: number = 400): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), wait);
    return () => clearTimeout(timer);
  }, [value, wait]);

  return debounced;
}