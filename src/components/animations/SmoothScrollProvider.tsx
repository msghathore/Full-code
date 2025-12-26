import { ReactNode, useEffect } from 'react';
import Lenis from 'lenis';

interface SmoothScrollProviderProps {
  children: ReactNode;
}

// Global scroll helper that uses Lenis when available
export const scrollToTop = (immediate = false) => {
  const lenis = (window as any).lenis;
  if (lenis) {
    lenis.scrollTo(0, { immediate });
  } else {
    window.scrollTo({ top: 0 });
  }
};

export const scrollToElement = (target: string | HTMLElement, offset = 80, immediate = false) => {
  const lenis = (window as any).lenis;
  if (lenis) {
    lenis.scrollTo(target, { offset: -offset, immediate });
  } else {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top });
    }
  }
};

export const scrollToPosition = (top: number, immediate = false) => {
  const lenis = (window as any).lenis;
  if (lenis) {
    lenis.scrollTo(top, { immediate });
  } else {
    window.scrollTo({ top });
  }
};

export const SmoothScrollProvider = ({ children }: SmoothScrollProviderProps) => {
  useEffect(() => {
    // Disable Lenis on mobile devices to prevent scroll issues
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;

    // Disable Lenis on staff routes - they need normal scrolling
    const isStaffRoute = window.location.pathname.startsWith('/staff');

    if (isMobile || isStaffRoute) {
      // On mobile or staff routes, use native scrolling - no Lenis
      if (import.meta.env.DEV) {
        if (isMobile) console.log('📱 Mobile detected - using native scrolling');
        if (isStaffRoute) console.log('🏢 Staff route detected - using native scrolling');
      }
      return;
    }

    let lenis: Lenis | null = null;
    let rafId: number | null = null;

    try {
      lenis = new Lenis({
        duration: 0.6, // Faster scroll (was 1.2 - too slow)
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.2, // Slightly faster wheel response (was 1)
        touchMultiplier: 2,
        syncTouch: false, // Disabled to prevent stuck scroll on touch devices
        infinite: false, // Prevent infinite scroll issues
        prevent: (node) => {
          // Prevent Lenis from handling scroll inside Glen chat
          // This allows the chat to scroll normally
          return node.closest('[data-lenis-prevent]') !== null;
        },
      });

      function raf(time: number) {
        if (lenis) {
          lenis.raf(time);
          rafId = requestAnimationFrame(raf);
        }
      }

      rafId = requestAnimationFrame(raf);

      // Expose lenis to window for use by scroll helpers
      (window as any).lenis = lenis;
    } catch (error) {
      // Silently fail - native scrolling will be used as fallback
      if (import.meta.env.DEV) {
        console.warn('Lenis initialization failed, using native scrolling:', error);
      }
    }

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (lenis) {
        lenis.destroy();
      }
      delete (window as any).lenis;
    };
  }, []);

  return <>{children}</>;
};

export default SmoothScrollProvider;
