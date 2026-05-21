import { useEffect, RefObject } from 'react';

interface UseAutoScrollOptions {
  /** Pixels per second. Default 40. */
  speed?: number;
  /** Set false to disable entirely (e.g. on mobile). Default true. */
  enabled?: boolean;
  /** Pause when pointer enters the element. Default true. */
  pauseOnHover?: boolean;
}

/**
 * Slowly auto-scrolls a horizontally-scrollable container back and forth.
 * Automatically disabled when the user prefers reduced motion.
 */
export function useAutoScroll(
  ref: RefObject<HTMLElement | null>,
  options: UseAutoScrollOptions = {},
) {
  const { speed = 40, enabled = true, pauseOnHover = true } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let rafId: number;
    let direction = 1;
    let position = el.scrollLeft;
    let isPaused = false;
    let lastTs = 0;

    const tick = (ts: number) => {
      const delta = lastTs ? Math.min(ts - lastTs, 64) : 0;
      lastTs = ts;

      if (!isPaused) {
        const max = el.scrollWidth - el.clientWidth;
        if (max > 0) {
          if (position >= max - 10) direction = -1;
          else if (position <= 10) direction = 1;
          position += direction * (speed * delta / 1000);
          el.scrollLeft = position;
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    const pause  = () => { isPaused = true; };
    const resume = () => { isPaused = false; };

    rafId = requestAnimationFrame(tick);

    if (pauseOnHover) {
      el.addEventListener('mouseenter', pause);
      el.addEventListener('mouseleave', resume);
      el.addEventListener('touchstart', pause,  { passive: true });
      el.addEventListener('touchend',   resume, { passive: true });
    }

    return () => {
      cancelAnimationFrame(rafId);
      if (pauseOnHover) {
        el.removeEventListener('mouseenter', pause);
        el.removeEventListener('mouseleave', resume);
        el.removeEventListener('touchstart', pause);
        el.removeEventListener('touchend',   resume);
      }
    };
  }, [ref, speed, enabled, pauseOnHover]);
}