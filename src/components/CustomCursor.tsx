import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

export const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorGlowRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  
  useEffect(() => {
    const cursor = cursorRef.current;
    const cursorGlow = cursorGlowRef.current;
    if (!cursor || !cursorGlow) return;

    const onMouseMove = (e: MouseEvent) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: 'power2.out'
      });
      
      gsap.to(cursorGlow, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    const onMouseEnter = (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList.contains('cursor-hover')
      ) {
        setIsHovering(true);
        gsap.to(cursor, {
          scale: 0.5,
          duration: 0.3,
          ease: 'power2.out'
        });
        gsap.to(cursorGlow, {
          scale: 1.5,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    const onMouseLeave = (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList.contains('cursor-hover')
      ) {
        setIsHovering(false);
        gsap.to(cursor, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
        gsap.to(cursorGlow, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseenter', onMouseEnter, true);
    document.addEventListener('mouseleave', onMouseLeave, true);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseenter', onMouseEnter, true);
      document.removeEventListener('mouseleave', onMouseLeave, true);
    };
  }, []);

  return (
    <>
      <div
        ref={cursorGlowRef}
        className="fixed top-0 left-0 w-12 h-12 pointer-events-none z-[10000] mix-blend-screen"
        style={{
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="w-full h-full rounded-full border-2 border-white/30 animate-pulse"
          style={{
            boxShadow: '0 0 30px rgba(255,255,255,0.6), 0 0 60px rgba(255,255,255,0.4), inset 0 0 20px rgba(255,255,255,0.3)',
          }}
        />
      </div>
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-3 h-3 bg-white rounded-full pointer-events-none z-[10001] mix-blend-difference"
        style={{
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 10px rgba(255,255,255,0.8)',
        }}
      />
    </>
  );
};
