import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
gsap.registerPlugin(ScrollTrigger);
export const HeroLogo = () => {
  const logoRef = useRef<HTMLDivElement>(null);
  const mainTextRef = useRef<HTMLDivElement>(null);
  const subTextRef = useRef<HTMLDivElement>(null);
  
  // Sparkle effect state
  const sparkles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    opacity: Math.random() * 0.8 + 0.2,
    delay: Math.random() * 2,
  }));

  useEffect(() => {
    if (!logoRef.current || !mainTextRef.current || !subTextRef.current) return;

    // Initial sparkle animation
    gsap.to(mainTextRef.current, {
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
      onUpdate: self => {
        const progress = self.progress;

        // Scale down
        const scale = 1 - progress * 0.7;
        gsap.to(mainTextRef.current, {
          scale,
          duration: 0.1
        });

        // Fade out subtitle
        gsap.to(subTextRef.current, {
          opacity: 1 - progress,
          duration: 0.1
        });

        // Move up
        const y = -(progress * 300);
        gsap.to(logoRef.current, {
          y,
          duration: 0.1
        });
      }
    });
  }, []);
  
  return (
    <Link to="/" className="cursor-hover">
      <div 
        ref={logoRef} 
        className="absolute top-32 left-1/2 transform -translate-x-1/2 z-30 text-center" 
        style={{
          pointerEvents: 'all'
        }}
      >
        {/* Sparkle effects */}
        {sparkles.map((sparkle) => (
          <div
            key={sparkle.id}
            className="absolute w-2 h-2 bg-white rounded-full animate-pulse"
            style={{
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
              opacity: sparkle.opacity,
              boxShadow: '0 0 20px rgba(255,255,255,0.8)',
              animation: `pulse ${sparkle.delay}s infinite`,
            }}
          />
        ))}

        {/* Main logo - Much larger like Jimmy Choo */}
        <h1 
          ref={mainTextRef}
          className="text-9xl md:text-[12rem] lg:text-[15rem] font-serif tracking-widest luxury-glow transition-all duration-1000"
        >
          ZAVIRA
        </h1>
        <p 
          ref={subTextRef}
          className="text-2xl md:text-4xl lg:text-5xl tracking-[0.3em] mt-4 luxury-glow"
        >
          SALON & SPA
        </p>
      </div>
    </Link>
  );
};