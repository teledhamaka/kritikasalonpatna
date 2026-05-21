import { useState, useEffect } from 'react';

/**
 * Returns true when the viewport is narrower than `breakpoint` px.
 * Debounced 150 ms; responds to resize and orientationchange.
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const update = () => setIsMobile(window.innerWidth < breakpoint);
    const onResize = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(update, 150);
    };

    update();
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, [breakpoint]);

  return isMobile;
}