/**
 * Shared UI constants used across client pages.
 * Import these instead of re-declaring them per file.
 */

/** Inline style for touch-friendly horizontal scroll containers. */
export const SCROLL_STYLE = {
  WebkitOverflowScrolling: 'touch',
  scrollbarWidth:          'none',
  msOverflowStyle:         'none',
  overscrollBehaviorX:     'contain',
} as const;