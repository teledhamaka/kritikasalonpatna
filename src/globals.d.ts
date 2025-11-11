// src/globals.d.ts

/**
 * Google Tag Manager / Google Analytics (gtag) global function declaration.
 * This tells TypeScript that `gtag` exists on the window object.
 */
declare function gtag(
  command: 'config' | 'event' | 'get' | 'set' | 'js',
  targetId: string,
  params?: Record<string, any>
): void;

// Optional: You can also declare it on the window object for more explicit use
interface Window {
  gtag: typeof gtag;
}