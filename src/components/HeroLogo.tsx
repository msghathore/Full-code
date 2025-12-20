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
  const sparkles = Array.from({
    length: 20
  }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    opacity: Math.random() * 0.8 + 0.2,
    delay: Math.random() * 2
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
  return <Link to="/" className="cursor-hover">
      <div ref={logoRef} className="text-center transition-all duration-500">
        {/* Large Hero Logo - 4x Bigger */}
        <div ref={mainTextRef} className="text-8xl sm:text-9xl md:text-[12rem] lg:text-[15rem] font-serif font-light text-white logo-main luxury-glow animate-glow-pulse">
          <span className="text-white luxury-glow animate-glow-pulse inline-block text-hover-shimmer tracking-wider">
            ZAVIRA
          </span>
        </div>
        
        {/* Subtitle - Fades out on scroll */}
        <div ref={subTextRef} className="text-sm sm:text-lg md:text-xl font-light text-white/80 mt-2 tracking-widest">
          SALON AND SPA
        </div>
      </div>
    </Link>;
};