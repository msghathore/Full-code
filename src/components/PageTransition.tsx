import { useEffect, useRef, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: ReactNode;
}

export const PageTransition = ({ children }: PageTransitionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Skip transitions for certain routes or components
    const skipTransition = location.pathname.includes('/admin') ||
                          location.pathname.includes('/dashboard');

    if (skipTransition) {
      container.style.opacity = '1';
      container.style.transform = 'translateY(0px)';
      return;
    }

    // Set initial state
    container.style.opacity = '0';
    container.style.transform = 'translateY(20px)';

    // Animate in
    requestAnimationFrame(() => {
      container.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
      container.style.opacity = '1';
      container.style.transform = 'translateY(0px)';
    });

    // Cleanup on unmount
    return () => {
      if (container) {
        container.style.opacity = '0';
        container.style.transform = 'translateY(-20px)';
      }
    };
  }, [location.pathname]);

  return (
    <div ref={containerRef} className="page-transition-container">
      {children}
    </div>
  );
};