import { useEffect, useRef, useState } from 'react';
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

export const Navigation = ({ hideWhenPopup = false }: NavigationProps) => {
  // Hamburger animation working - cache refresh
  console.log('Navigation rendering');
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
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Detect scroll position for mobile homepage
  useEffect(() => {
    const handleScroll = () => {
      if (isMobile && isHomePage) {
        // Show navigation logo when scrolled past video banner (80vh)
        const scrolledPastBanner = window.scrollY > window.innerHeight * 0.8;
        setHasScrolledPastBanner(scrolledPastBanner);
        console.log('Mobile scroll - Scroll Y:', window.scrollY, 'Threshold:', window.innerHeight * 0.8, 'Past Banner:', scrolledPastBanner);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile, isHomePage]);
  
  // Hide navigation logo only on mobile homepage when not scrolled past banner
  const shouldHideNavigationLogo = isMobile && isHomePage && !hasScrolledPastBanner;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
      
      // Only apply banner detection on homepage
      if (isHomePage) {
        const onBanner = window.scrollY <= window.innerHeight * 0.8;
        setIsOnBanner(onBanner);
        console.log('Homepage scroll - Scroll Y:', window.scrollY, 'Threshold:', window.innerHeight * 0.8, 'On Banner:', onBanner);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

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

  // Reset body overflow on route change
  useEffect(() => {
    document.body.style.overflow = '';
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Logo sizing is now handled via inline conditional classes in JSX for React-idiomatic approach

  const toggleMenu = () => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);

    // Lock/unlock body scroll when menu opens/closes
    if (newState) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    if (hamburgerRef.current) {
      const lines = hamburgerRef.current.querySelectorAll('.hamburger-line');

      if (!isMenuOpen) {
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
  };

  // Show loading state while Clerk loads - don't return null, render basic nav
  if (!isLoaded) {
    return (
      <nav
        className="fixed top-0 left-0 right-0 z-[1000] py-2 transition-all duration-500 bg-black/10 backdrop-blur-xl border-b border-white/20"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container mx-auto px-8 flex items-center justify-between relative z-10">
          <Link to="/" className="cursor-hover absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="transition-all duration-500 text-center">
              <div className="text-3xl md:text-5xl font-serif font-light text-white logo-main">
                <span className="text-white luxury-glow animate-glow-pulse inline-block text-hover-shimmer">
                  ZAVIRA
                </span>
              </div>
              <div className="text-sm md:text-lg font-light text-white/80 -mt-1" style={{transform: 'scale(1.125)'}}>
                {t('salonAndSpa')}
              </div>
            </div>
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <>
      {!hideWhenPopup && (
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

           {/* Logo - Centered (Shows on Mobile Other Pages and Desktop) */}
           <Link to="/" className={`cursor-hover absolute left-1/2 transform -translate-x-1/2 ${(isHomePage && isOnBanner) ? '-top-5 md:-top-4' : 'top-1/2 -translate-y-1/2'} ${shouldHideNavigationLogo ? 'hidden' : ''}`}>
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
                     style={{ transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
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
           {isSignedIn ? (
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
