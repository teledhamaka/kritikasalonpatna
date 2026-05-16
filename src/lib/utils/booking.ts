// ============================================================
// FILE: lib/utils/booking.ts
//
// FIX: Error 2339 — "'catch' does not exist on type 'PromiseLike'"
//
// Root cause: original `withRetry` typed fn as `() => Promise<T>`.
// Supabase query builders (select/insert/update/delete) return
// `PostgrestFilterBuilder` which implements `PromiseLike<T>`,
// NOT the full `Promise<T>` interface. `PromiseLike` only has `.then()`,
// no `.catch()` or `.finally()`.
//
// Fix: type fn as `() => PromiseLike<T>` — this is the minimal interface
// needed, and `async function` still returns `Promise<T>` so callers
// can safely use `.catch()` on the result of withRetry() itself.
//
// IMPORTANT — file name MUST stay lowercase `booking.ts`.
// Windows NTFS is case-insensitive but TypeScript's `forceConsistentCasingInFileNames`
// (enabled in strict tsconfig) will error if you mix cases.
// Always import as: import { ... } from '@/lib/utils/booking'
// ============================================================

// ── withRetry ────────────────────────────────────────────────
// Retries any async operation with exponential back-off.
// Accepts PromiseLike<T> so Supabase query builders work directly.
//
// Usage:
//   const { data, error } = await withRetry(() =>
//     supabase.from('profiles').select('*').eq('id', userId).single()
//   );
//
// Note: always `await` the call — withRetry returns Promise<T>.
// The common mistake (error 2339) is forgetting the `await`:
//   ❌ const { data } = withRetry(() => ...)     // Promise, not destructurable
//   ✅ const { data } = await withRetry(() => ...) // awaited value, destructurable
export async function withRetry<T>(
  fn:       () => PromiseLike<T>,   // ← PromiseLike not Promise (fixes error 2339/catch)
  retries:  number = 2,
  delayMs:  number = 500,
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise(r => setTimeout(r, delayMs));
    return withRetry(fn, retries - 1, delayMs * 2);
  }
}

// ── normalizePhone ────────────────────────────────────────────
// Strips formatting, returns canonical 10-digit Indian mobile number.
// Store this in DB; format separately for display.
//
// '+91 98765 43210' → '9876543210'
// '098765 43210'    → '9876543210'
// '9876543210'      → '9876543210'
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  // Take last 10 digits (strips +91 / 0 prefix)
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

// Format for display: '9876543210' → '+91 98765 43210'
export function formatPhoneDisplay(normalized: string): string {
  if (normalized.length !== 10) return normalized;
  return `+91 ${normalized.slice(0, 5)} ${normalized.slice(5)}`;
}

// Validate Indian mobile: 10 digits, starting 6-9
export function isValidIndianPhone(normalized: string): boolean {
  return /^[6-9]\d{9}$/.test(normalized);
}

// ── generateBookingId ─────────────────────────────────────────
// Collision-safe booking reference using crypto.randomUUID().
// Falls back to base-36 timestamp for old Android WebViews.
//
// Output example: 'BKA3F7C2D1'
export function generateBookingId(): string {
  try {
    const uuid = crypto.randomUUID().replace(/-/g, '').toUpperCase();
    return `BK${uuid.slice(0, 8)}`;
  } catch {
    // Fallback for environments without crypto.randomUUID
    return `BK${Date.now().toString(36).toUpperCase().slice(-8)}`;
  }
}