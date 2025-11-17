import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';
import { AnimatedMenu } from './AnimatedMenu';

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!logoRef.current) return;

    const handleScroll = () => {
      const scrolled = window.scrollY > 100;
      if (logoRef.current) {
        logoRef.current.textContent = scrolled ? 'ZAVIRA' : 'ZAVIRA SALON & SPA';
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    
    if (hamburgerRef.current) {
      const lines = hamburgerRef.current.querySelectorAll('.hamburger-line');
      
      if (!isMenuOpen) {
        gsap.to(lines[0], { rotation: 45, y: 8, duration: 0.3 });
        gsap.to(lines[1], { opacity: 0, duration: 0.3 });
        gsap.to(lines[2], { rotation: -45, y: -8, duration: 0.3 });
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3 });
        gsap.to(lines[1], { opacity: 1, duration: 0.3 });
        gsap.to(lines[2], { rotation: 0, y: 0, duration: 0.3 });
      }
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 ${
          isScrolled ? 'frosted-glass py-4' : 'py-8'
        }`}
      >
        <div className="container mx-auto px-8 flex items-center justify-between">
          {/* Hamburger Menu */}
          <button
            ref={hamburgerRef}
            onClick={toggleMenu}
            className="flex flex-col space-y-2 cursor-hover group"
            aria-label="Toggle menu"
          >
            <span className="hamburger-line w-8 h-0.5 bg-white block transition-all group-hover:luxury-glow" />
            <span className="hamburger-line w-8 h-0.5 bg-white block transition-all group-hover:luxury-glow" />
            <span className="hamburger-line w-8 h-0.5 bg-white block transition-all group-hover:luxury-glow" />
          </button>

          {/* Logo - Bigger and more prominent */}
          <Link to="/" className="cursor-hover">
            <div
              ref={logoRef}
              className="text-3xl md:text-4xl font-serif tracking-widest text-white luxury-glow text-center transition-all duration-500"
            >
              ZAVIRA SALON & SPA
            </div>
          </Link>

          {/* Right side - Login */}
          <a
            href="/auth"
            className="text-white text-sm tracking-wider hover:luxury-glow transition-all cursor-hover"
          >
            LOGIN
          </a>
        </div>
      </nav>

      <AnimatedMenu isOpen={isMenuOpen} onClose={() => toggleMenu()} />
    </>
  );
};
