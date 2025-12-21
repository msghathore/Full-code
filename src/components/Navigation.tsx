import { useEffect, useRef, useState, useCallback, memo, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Award, Menu } from 'lucide-react';
import { AnimatedMenu } from './AnimatedMenu';
import { useUser } from '@clerk/clerk-react';
import UserDropdown from './UserDropdown';
import { useLanguage } from '@/hooks/use-language';
import { AnimatedUserIcon } from './AnimatedUserIcon';

gsap.registerPlugin(ScrollTrigger);

// Navigation animation variants
const navVariants = {
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
    },
  },
  hidden: {
    y: -100,
    opacity: 0,
  },
};

const logoVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 15,
      delay: 0.2,
    },
  },
  hover: {
    scale: 1.05,
    textShadow: '0 0 30px rgba(255,255,255,1)',
    transition: { duration: 0.3 },
  },
};

interface NavigationProps {
  hideWhenPopup?: boolean;
}

const NavigationComponent = ({ hideWhenPopup = false }: NavigationProps) => {
  // Track renders for performance monitoring
  if (process.env.NODE_ENV === 'development') {
    console.log('[Navigation] Rendering');
  }

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOnBanner, setIsOnBanner] = useState(true);
  const logoRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const { t } = useLanguage();
  const { isLoaded, isSignedIn, user } = useUser();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Check if device is mobile
  const [isMobile, setIsMobile] = useState(false);
  const [hasScrolledPastBanner, setHasScrolledPastBanner] = useState(false);
  
  // Memoize mobile check to prevent unnecessary recalculation
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // CONSOLIDATED scroll handler - combines both scroll effects into one
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const bannerThreshold = window.innerHeight * 0.8;

          setIsScrolled(scrollY > 0);

          if (isHomePage) {
            const onBanner = scrollY <= bannerThreshold;
            setIsOnBanner(onBanner);

            if (isMobile) {
              setHasScrolledPastBanner(scrollY > bannerThreshold);
            }
          }

          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage, isMobile]); // Only re-run if these change

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
        document.body.style.overflow = '';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // Always reset body overflow when component unmounts
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Reset body overflow on mount and route change
  useEffect(() => {
    document.body.style.overflow = '';
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Ensure body overflow is cleared on initial mount
  useEffect(() => {
    document.body.style.overflow = '';
  }, []);

  // Logo sizing is now handled via inline conditional classes in JSX for React-idiomatic approach

  // Memoize toggleMenu to prevent recreation on every render
  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => {
      const newState = !prev;

      // Lock/unlock body scroll when menu opens/closes
      if (newState) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }

      if (hamburgerRef.current) {
        const lines = hamburgerRef.current.querySelectorAll('.hamburger-line');

        if (!prev) {
          // Animate hamburger to cross when opening menu
          gsap.to(lines[0], { rotation: 45, y: 8, duration: 0.3, ease: 'power2.out' });
          gsap.to(lines[1], { opacity: 0, duration: 0.3, ease: 'power2.out' });
          gsap.to(lines[2], { rotation: -45, y: -8, duration: 0.3, ease: 'power2.out' });
        } else {
          // Animate cross back to hamburger when closing menu
          gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease: 'power2.out' });
          gsap.to(lines[1], { opacity: 1, duration: 0.3, ease: 'power2.out' });
          gsap.to(lines[2], { rotation: 0, y: 0, duration: 0.3, ease: 'power2.out' });
        }
      }

      return newState;
    });
  }, []); // Empty dependency array - function never changes

  // Timeout for Clerk loading - if it takes more than 3 seconds, render without Clerk
  const [showWithoutClerk, setShowWithoutClerk] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isLoaded) {
        console.warn('[Navigation] Clerk failed to load within 3 seconds, rendering without authentication');
        setShowWithoutClerk(true);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [isLoaded]);

  // Render navigation if Clerk loaded OR if timeout expired
  const shouldRenderNav = isLoaded || showWithoutClerk;

  return (
    <>
      {!hideWhenPopup && shouldRenderNav && (
        <nav
          className={`fixed top-0 left-0 right-0 z-[1000] py-2 transition-all duration-500 ${
            (isHomePage ? !isOnBanner : isScrolled)
              ? 'bg-white/10 backdrop-blur-xl border-b border-white/20'
              : 'bg-transparent'
          }`}
          style={{
            background: (isHomePage ? !isOnBanner : isScrolled)
              ? 'rgba(255, 255, 255, 0.1)'
              : 'transparent',
            backdropFilter: (isHomePage ? !isOnBanner : isScrolled) ? 'blur(20px)' : 'none',
            WebkitBackdropFilter: (isHomePage ? !isOnBanner : isScrolled) ? 'blur(20px)' : 'none',
            borderBottom: (isHomePage ? !isOnBanner : isScrolled) ? '1px solid rgba(255, 255, 255, 0.2)' : 'none'
          }}
          role="navigation"
          aria-label="Main navigation"
        >
        <div className="container mx-auto px-4 md:px-8 flex items-center justify-between relative z-10">
           {/* Luxury Sidebar Toggle */}
           <button
             ref={hamburgerRef}
             onClick={toggleMenu}
             className="flex items-center space-x-1 md:space-x-2 cursor-hover group z-10"
             style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6)) drop-shadow(0 4px 8px rgba(0,0,0,0.5)) drop-shadow(0 6px 12px rgba(0,0,0,0.4))' }}
             aria-label="Toggle sidebar"
           >
             {/* Custom Hamburger Icon */}
             <div className="relative w-6 h-6 md:w-7 md:h-7">
               <div className="hamburger-line absolute top-1.5 left-0 w-5 h-0.5 md:w-6 md:h-0.5 bg-white group-hover:luxury-glow transition-all duration-300 origin-center"></div>
               <div className="hamburger-line absolute top-2.75 left-0 w-5 h-0.5 md:w-6 md:h-0.5 bg-white group-hover:luxury-glow transition-all duration-300 origin-center"></div>
               <div className="hamburger-line absolute top-4 left-0 w-5 h-0.5 md:w-6 md:h-0.5 bg-white group-hover:luxury-glow transition-all duration-300 origin-center"></div>
             </div>
             <span className="hidden sm:inline text-white text-sm font-semibold group-hover:luxury-glow transition-all">Menu</span>
           </button>

           {/* Logo - Centered (Hidden on homepage banner to avoid duplicate ZAVIRA text) */}
           <Link
             to="/"
             className={`cursor-hover absolute left-1/2 transform -translate-x-1/2 ${(isHomePage && isOnBanner) ? 'opacity-0 pointer-events-none' : 'top-1/2 -translate-y-1/2 opacity-100'} transition-opacity duration-300`}
             aria-hidden={isHomePage && isOnBanner}
           >
             <motion.div
               ref={logoRef}
               className="transition-all duration-500 text-center"
               variants={logoVariants}
               initial="initial"
               animate="animate"
               whileHover="hover"
             >
               <div className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-white logo-main">
                   <motion.span
                     className={`main-logo-text ${(isHomePage && isOnBanner) ? 'text-6xl sm:text-8xl md:text-[11rem]' : 'text-3xl sm:text-4xl md:text-5xl'} text-white luxury-glow animate-glow-pulse inline-block text-hover-shimmer max-w-[90vw]`}
                     style={{
                       transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                       filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                       willChange: 'transform, filter',
                       backfaceVisibility: 'hidden',
                       WebkitFontSmoothing: 'antialiased',
                       MozOsxFontSmoothing: 'grayscale'
                     }}
                     animate={{
                       textShadow: [
                         '0 0 10px rgba(255,255,255,0.8)',
                         '0 0 20px rgba(255,255,255,1)',
                         '0 0 10px rgba(255,255,255,0.8)',
                       ],
                     }}
                     transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                   >
                     ZAVIRA
                   </motion.span>
               </div>
             </motion.div>
           </Link>

           {/* Right side - Login/User */}
           {isLoaded && isSignedIn ? (
             <motion.div
               className="flex items-center space-x-2 md:space-x-4 z-10"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.3 }}
             >
               <UserDropdown />
             </motion.div>
           ) : (
             <AnimatedUserIcon size={36} className="z-10" />
           )}
         </div>
       </nav>
     )}

     <AnimatedMenu isOpen={isMenuOpen} onClose={toggleMenu} />
   </>
 );
};

// Wrap component with React.memo to prevent unnecessary re-renders
export const Navigation = memo(NavigationComponent);
