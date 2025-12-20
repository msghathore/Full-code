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

    if (isMobile) {
      // On mobile, use native scrolling - no Lenis
      console.log('📱 Mobile detected - using native scrolling');
      return;
    }

    const lenis = new Lenis({
      duration: 0.6, // Faster scroll (was 1.2 - too slow)
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.2, // Slightly faster wheel response (was 1)
      touchMultiplier: 2,
      syncTouch: false, // Disabled to prevent stuck scroll on touch devices
      infinite: false, // Prevent infinite scroll issues
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Expose lenis to window for use by scroll helpers
    (window as any).lenis = lenis;

    return () => {
      lenis.destroy();
      delete (window as any).lenis;
    };
  }, []);

  return <>{children}</>;
};

export default SmoothScrollProvider;
