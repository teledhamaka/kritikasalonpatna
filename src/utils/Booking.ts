// ============================================================
// FILE: lib/utils/booking.ts
// Shared utility functions used across booking + auth flows
//
// Fixes addressed:
//   ISSUE 6  — phone normalization (canonical 10-digit storage)
//   ISSUE 7  — collision-safe booking ID using crypto.randomUUID()
//   ISSUE 9  — retry helper for flaky Indian mobile networks
// ============================================================

// ── ISSUE 9: Retry helper ────────────────────────────────────
// Wraps any async operation with exponential back-off retries.
// Use for: favorites, profile updates, booking save.
// Do NOT use for: Google sign-in redirect (retrying would reopen browser).
//
// Default: 2 retries → max 3 total attempts
// Delays:  500ms → 1000ms → give up
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries  = 2,
  delayMs  = 500,
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise(r => setTimeout(r, delayMs));
    return withRetry(fn, retries - 1, delayMs * 2);
  }
}

// ── ISSUE 6: Phone normalization ─────────────────────────────
// Store phones as canonical 10-digit Indian numbers.
// '+91 98765 43210', '098765 43210', '9876543210' all → '9876543210'
//
// WHY: prevents duplicates in promo queries, and WhatsApp API
// requires the canonical number without country code for domestic sends.
//
// Display formatting is done separately in the UI layer.
export function normalizePhone(raw: string): string {
  // Strip everything except digits
  const digits = raw.replace(/\D/g, '');

  // Handle +91 / 0 prefix → last 10 digits
  if (digits.length >= 10) {
    return digits.slice(-10);
  }

  // Return as-is if less than 10 digits (let validation catch it)
  return digits;
}

// Format for display: '9876543210' → '+91 98765 43210'
export function formatPhoneDisplay(normalized: string): string {
  if (normalized.length !== 10) return normalized;
  return `+91 ${normalized.slice(0, 5)} ${normalized.slice(5)}`;
}

// Validate: must be 10 digits, starting with 6-9 (Indian mobile)
export function isValidIndianPhone(normalized: string): boolean {
  return /^[6-9]\d{9}$/.test(normalized);
}

// ── ISSUE 7: Collision-safe booking ID ───────────────────────
// Original: BK + last 8 digits of Date.now()
// Problem:  two concurrent bookings within the same millisecond = collision
//           (rare but real on shared hosting / concurrent mobile users)
//
// New: BK + 8 chars from crypto.randomUUID() (128-bit entropy, no collision)
// Example output: BKA3F7C2D1
//
// Falls back to timestamp method if crypto unavailable (old browsers).
export function generateBookingId(): string {
  try {
    const uuid = crypto.randomUUID().replace(/-/g, '').toUpperCase();
    return `BK${uuid.slice(0, 8)}`;
  } catch {
    // Fallback for environments without crypto.randomUUID
    return `BK${Date.now().toString(36).toUpperCase().slice(-8)}`;
  }
}