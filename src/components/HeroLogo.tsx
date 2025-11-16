import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

export const HeroLogo = () => {
  const logoRef = useRef<HTMLDivElement>(null);
  const mainTextRef = useRef<HTMLDivElement>(null);
  const subTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!logoRef.current || !mainTextRef.current || !subTextRef.current) return;

    // Initial sparkle animation
    gsap.to(logoRef.current, {
      textShadow: '0 0 20px rgba(255,255,255,1), 0 0 40px rgba(255,255,255,0.8), 0 0 60px rgba(255,255,255,0.6)',
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    // Scroll animation - shrink and move to nav
    ScrollTrigger.create({
      trigger: logoRef.current,
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        
        // Scale down
        const scale = 1 - (progress * 0.7);
        gsap.to(mainTextRef.current, { scale, duration: 0.1 });
        
        // Fade out subtitle
        gsap.to(subTextRef.current, { opacity: 1 - progress, duration: 0.1 });
        
        // Move up
        const y = -(progress * 300);
        gsap.to(logoRef.current, { y, duration: 0.1 });
      }
    });
  }, []);

  return (
    <Link to="/" className="cursor-hover">
      <div
        ref={logoRef}
        className="absolute top-32 left-1/2 transform -translate-x-1/2 z-30 text-center"
        style={{ pointerEvents: 'all' }}
      >
        <div
          ref={mainTextRef}
          className="text-9xl md:text-[12rem] font-serif text-white tracking-widest"
          style={{
            textShadow: '0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.6), 0 0 80px rgba(255,255,255,0.4)',
            fontWeight: 300,
            letterSpacing: '0.2em'
          }}
        >
          ZAVIRA
        </div>
        <div
          ref={subTextRef}
          className="text-2xl md:text-3xl text-white tracking-[0.5em] font-light mt-4"
          style={{
            textShadow: '0 0 10px rgba(255,255,255,0.6), 0 0 20px rgba(255,255,255,0.4)'
          }}
        >
          SALON & SPA
        </div>
      </div>
    </Link>
  );
};
