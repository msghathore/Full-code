import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import UserDropdown from './UserDropdown';
import { useLanguage } from '@/hooks/use-language';

interface MobileNavigationProps {
  hideWhenPopup?: boolean;
}

export const MobileNavigation = ({ hideWhenPopup = false }: MobileNavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLogo, setShowLogo] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const { isLoaded, isSignedIn, user } = useUser();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Mobile-specific optimizations
  const [isMobile, setIsMobile] = useState(true);
  const [hasScrolledPastBanner, setHasScrolledPastBanner] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile scroll detection with performance optimization
  useEffect(() => {
    const handleScroll = () => {
      if (isMobile) {
        const scrolledPastBanner = window.scrollY > window.innerHeight * 0.6;
        setHasScrolledPastBanner(scrolledPastBanner);
        setIsScrolled(window.scrollY > 50);

        // Always show logo on mobile (removed homepage hiding logic)
        setShowLogo(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile, isHomePage]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Mobile-optimized menu items
  const menuItems = [
    { name: 'Home', href: '/', icon: '🏠' },
    { name: 'Services', href: '/services', icon: '✂️' },
    { name: 'Booking', href: '/booking', icon: '📅' },
    { name: 'Shop', href: '/shop', icon: '🛍️' },
    { name: 'About', href: '/about', icon: 'ℹ️' },
    { name: 'Contact', href: '/contact', icon: '📞' },
  ];

  if (!isLoaded) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-[1000] py-3 bg-black/90 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="text-white font-medium">Loading...</div>
        </div>
      </nav>
    );
  }

  return (
    <>
      {!hideWhenPopup && (
        <nav className={`fixed top-0 left-0 right-0 z-[1000] py-3 transition-all duration-300 ${isScrolled
            ? 'bg-black/90 backdrop-blur-lg border-b border-white/10'
            : (isHomePage ? 'bg-transparent' : 'bg-black/90 backdrop-blur-lg border-b border-white/10')
          }`}>
          <div className="container mx-auto px-4 flex items-center justify-between">
            {/* Mobile Menu Button - Always visible */}
            <button
              onClick={toggleMenu}
              className="flex items-center space-x-2 cursor-pointer z-20 p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle mobile menu"
            >
              <div className="relative w-6 h-6">
                <div className={`absolute top-1.5 left-0 w-5 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'rotate-45 top-2.5' : ''
                  }`} />
                <div className={`absolute top-2.75 left-0 w-5 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''
                  }`} />
                <div className={`absolute top-4 left-0 w-5 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? '-rotate-45 top-2.5' : ''
                  }`} />
              </div>
              <span className="text-white text-sm font-medium">Menu</span>
            </button>

            {/* Mobile Logo - Optimized visibility */}
            <Link
              to="/"
              className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 ${!showLogo ? 'opacity-0 pointer-events-none' : 'opacity-100'} transition-opacity duration-300`}
              aria-hidden={!showLogo}
            >
              <div className="text-xl font-serif font-light text-white logo-main">
                <span
                  className="text-white luxury-glow animate-glow-pulse inline-block text-hover-shimmer"
                  style={{
                    willChange: 'transform, filter',
                    backfaceVisibility: 'hidden',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale'
                  }}
                >
                  ZAVIRA
                </span>
              </div>
            </Link>

            {/* Right side - Login/User */}
            <div className="flex items-center">
              {isSignedIn ? (
                <div className="flex items-center space-x-2">
                  <UserDropdown mobile={true} />
                </div>
              ) : (
                <a
                  href="/auth"
                  className="text-white hover:luxury-glow transition-all cursor-pointer p-2"
                  aria-label={t('login')}
                >
                  <User className="w-6 h-6" />
                </a>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* Mobile Menu Panel - Optimized for touch */}
      <div
        ref={menuRef}
        className={`fixed top-0 left-0 w-full h-screen z-[1001] bg-black/95 backdrop-blur-xl transition-all duration-300 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Close button and logo */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <Link to="/" onClick={() => setIsMenuOpen(false)}>
              <div className="text-xl font-serif font-light text-white logo-main">
                <span className="text-white luxury-glow animate-glow-pulse inline-block">
                  ZAVIRA
                </span>
              </div>
            </Link>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="text-white hover:text-gray-300 transition-colors p-2"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          {/* Mobile Menu Items - Large touch targets */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="block py-4 px-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-transparent hover:border-white/20"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-white text-lg font-medium">{item.name}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom section with additional links */}
          <div className="p-4 border-t border-white/10 space-y-3">
            {!isSignedIn ? (
              <>
                <Link
                  to="/auth"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors text-white font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center py-3 bg-white text-black rounded-xl hover:bg-gray-100 transition-colors font-medium"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  // TODO: Implement logout
                }}
                className="block w-full text-center py-3 bg-red-600/20 hover:bg-red-600/30 rounded-xl transition-colors text-white font-medium"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};