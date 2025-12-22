import { useEffect, useRef, useState, useMemo } from 'react';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';

interface AnimatedMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

// Universal maps URL generator - opens Apple Maps on iOS/macOS, Google Maps on others
const SALON_ADDRESS = '283 Tache Avenue, Winnipeg, MB, Canada';

const getUniversalMapsUrl = (address: string = SALON_ADDRESS): string => {
  const encodedAddress = encodeURIComponent(address);

  // Detect platform
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  const platform = navigator.platform || '';

  // Check for iOS devices
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;

  // Check for macOS (Safari on Mac)
  const isMac = platform.toLowerCase().includes('mac') || /Macintosh/.test(userAgent);

  // Use Apple Maps for iOS and macOS, Google Maps for everything else
  if (isIOS || isMac) {
    return `https://maps.apple.com/?address=${encodedAddress}&q=${encodedAddress}`;
  }

  // Google Maps for Android, Windows, Linux, and other platforms
  return `https://maps.google.com/maps?q=${encodedAddress}`;
};

// Menu items will be built dynamically with translations inside the component

export const AnimatedMenu = ({ isOpen, onClose }: AnimatedMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);
  const { t } = useLanguage();
  const { settings } = useBusinessSettings();

  // Handle directions click with platform detection
  const handleDirectionsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const address = settings?.address_full || '283 Tache Avenue, Winnipeg, MB, Canada';
    const mapsUrl = getUniversalMapsUrl(address);
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Build menu items with translations
  const menuItems = useMemo(() => [
    {
      name: t('menuServices'),
      href: '/services',
      image: '/images/services-menu.jpg',
      subItems: [
        { name: t('hairServices'), href: '/services#hair', image: '/images/hair-service.jpg' },
        { name: t('nailCare'), href: '/services#nails', image: '/images/nails-service.jpg' },
        { name: t('skinCare'), href: '/services#skin', image: '/images/skin-service.jpg' },
        { name: t('massageTherapy'), href: '/services#massage', image: '/images/massage-service.jpg' },
        { name: t('tattooArt'), href: '/services#tattoo', image: '/images/tattoo-service.jpg' },
        { name: t('piercing'), href: '/services#piercing', image: '/images/piercing-service.jpg' }
      ]
    },
    {
      name: t('menuBooking'),
      href: '/booking',
      image: '/images/booking-menu.jpg',
      subItems: [
        { name: t('bookAppointmentMenu'), href: '/booking', image: '/images/schedule-appointment.jpg' },
        { name: t('groupBooking'), href: '/group-booking', image: '/images/group-booking.jpg' }
      ]
    },
    {
      name: t('menuShop'),
      href: '/shop',
      image: '/images/shop-menu.jpg',
      subItems: [
        { name: t('hairCare'), href: '/shop?category=Hair Care', image: '/images/product-1.jpg' },
        { name: t('skinCareCategory'), href: '/shop?category=Skin Care', image: '/images/product-2.jpg' },
        { name: t('nailCareShop'), href: '/shop?category=Nail Care', image: '/images/product-3.jpg' },
        { name: t('beautyTools'), href: '/shop?category=Tools', image: '/images/product-4.jpg' },
        { name: t('bodyCareCategory'), href: '/shop?category=Body Care', image: '/images/product-5.jpg' }
      ]
    },
    {
      name: t('menuBlog'),
      href: '/blog',
      image: '/images/blog-1.jpg',
      subItems: [
        { name: t('beautyTips'), href: '/blog?category=Beauty Tips', image: '/images/blog-1.jpg' },
        { name: t('styleGuides'), href: '/blog?category=Style Guides', image: '/images/blog-2.jpg' },
        { name: t('productReviews'), href: '/blog?category=Product Reviews', image: '/images/blog-3.jpg' }
      ]
    },
    {
      name: t('menuCareers'),
      href: '/careers',
      image: '/images/careers.jpg',
      subItems: [
        { name: t('currentOpenings'), href: '/careers#openings', image: '/images/openings.jpg' },
        { name: t('applyNow'), href: '/careers#apply', image: '/images/apply.jpg' }
      ]
    },
    {
      name: t('menuAbout'),
      href: '/about',
      image: '/images/about-menu.jpg',
      subItems: [
        { name: t('ourStoryMenu'), href: '/about#story', image: '/images/our-story.jpg' },
        { name: t('ourTeam'), href: '/team', image: '/images/team.jpg' }
      ]
    },
    {
      name: t('menuContact'),
      href: '/contact',
      image: '/images/contact-menu.jpg',
      subItems: [
        { name: t('hoursOfOperation'), href: '/contact#hours', image: '/images/location.jpg' },
        { name: t('getDirections'), href: '#directions', image: '/images/directions.jpg', universalMaps: true },
        { name: t('callUs'), href: '/contact#phone', image: '/images/call-us.jpg' },
        { name: t('faq'), href: '/faq', image: '/images/faq.jpg' }
      ]
    }
  ], [t]);

  // Set default selected item to Services when menu opens
  useEffect(() => {
    if (isOpen && menuItems.length > 0) {
      setSelectedItem(menuItems[0].name);
    }
  }, [isOpen, menuItems]);

  useEffect(() => {
    if (!menuRef.current || !leftPanelRef.current || !rightPanelRef.current) return;

    const leftPanel = leftPanelRef.current;
    const rightPanel = rightPanelRef.current;
    const menuTexts = leftPanel.querySelectorAll('h2');

    if (isOpen) {
      // Set menu visible
      gsap.set(menuRef.current, { opacity: 1, pointerEvents: 'all' });

      // Slide in left panel
      gsap.fromTo(leftPanel,
        { x: '-100%' },
        {
          x: '0%',
          duration: 0.8,
          ease: 'power3.out'
        }
      );

      // Animate menu texts
      gsap.fromTo(menuTexts,
        { x: -50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          delay: 0.3,
          ease: 'power2.out'
        }
      );

      // Fade in right panel
      gsap.fromTo(rightPanel,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.5,
          delay: 0.5,
          ease: 'power2.out'
        }
      );
    } else {
      // Slide out left panel
      gsap.to(leftPanel, {
        x: '-100%',
        duration: 0.5,
        ease: 'power3.in'
      });

      // Fade out right panel
      gsap.to(rightPanel, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in'
      });

      // Hide menu after animations complete
      gsap.to(menuRef.current, {
        opacity: 0,
        duration: 0.3,
        delay: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          gsap.set(menuRef.current, { pointerEvents: 'none' });
        }
      });
    }
  }, [isOpen]);

  // Handle mouse leave from the entire menu area
  const handleMenuMouseLeave = () => {
    setTimeout(() => {
      setHoveredItem(null);
    }, 100);
  };

  return (
    <div
      ref={menuRef}
      className="menu-overlay fixed w-full h-screen z-[1001] opacity-0 pointer-events-none"
      style={{
        pointerEvents: isOpen ? 'all' : 'none'
      }}
      onMouseLeave={handleMenuMouseLeave}
    >
      {/* Left Panel - Menu Items */}
      <div
        ref={leftPanelRef}
        className="absolute left-0 top-0 h-full w-[40%] md:w-1/3 border-r border-white/10 animate-fade-in relative"
        style={{
          transform: 'translateX(-100%)',
          background: 'rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 md:top-8 md:right-8 text-white hover:text-gray-300 transition-colors cursor-pointer z-10 p-2 md:p-2"
          aria-label="Close menu"
        >
          <X size={20} className="md:w-6 md:h-6" />
        </button>
        <div
          className="flex flex-col justify-center h-full px-4 py-20 md:px-16 md:py-0 space-y-3 md:space-y-8"
          onMouseEnter={() => setHoveredItem(null)}
        >
          {menuItems.map((item, index) => {
            const isSelected = selectedItem === item.name;
            return (
              <div
                key={item.name}
                className="menu-item-text group"
                onMouseEnter={() => !isMobile && setHoveredItem(item.name)}
                onClick={(e) => {
                  if (isMobile) {
                    e.preventDefault();
                    setSelectedItem(item.name);
                  } else {
                    setHoveredItem(hoveredItem === item.name ? null : item.name);
                  }
                }}
              >
                <Link
                  to={item.href}
                  className={`block py-2.5 md:py-0 px-3 md:px-0 rounded-lg md:rounded-none transition-all duration-300 w-full ${
                    isMobile && isSelected
                      ? 'bg-white text-black'
                      : ''
                  }`}
                  style={isMobile && isSelected ? {
                    textShadow: '0 0 15px rgba(255,255,255,0.6)',
                  } : {}}
                  onClick={(e) => {
                    if (isMobile) {
                      e.preventDefault();
                    } else {
                      onClose();
                    }
                  }}
                >
                  <h2 className={`text-lg sm:text-2xl md:text-5xl font-serif transition-all duration-500 cursor-hover leading-tight break-words ${
                    isMobile && isSelected
                      ? 'text-black font-semibold'
                      : 'text-white hover:luxury-glow'
                  }`}>
                    {item.name}
                  </h2>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Panel - Service Cards */}
      <div
        ref={rightPanelRef}
        className="absolute right-0 top-0 h-full w-[60%] md:w-2/3 overflow-hidden"
        style={{
          background: 'rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.2)'
        }}
        onMouseEnter={() => {
          // Keep the hover state active when mouse enters right panel
          // Don't clear hoveredItem here
        }}
        onMouseLeave={handleMenuMouseLeave}
      >
        {(isMobile ? selectedItem : hoveredItem) && (
          <div className="flex flex-col h-full p-4 md:p-8">
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                {menuItems.find(item => item.name === (isMobile ? selectedItem : hoveredItem))?.subItems.map((subItem, index) => (
                  <div
                    key={subItem.name}
                    className="card-item transform translate-y-4 opacity-0"
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      animation: 'slideInFromBottom 0.6s ease-out forwards'
                    }}
                  >
                    {(subItem as any).universalMaps ? (
                      <button
                        onClick={(e) => {
                          handleDirectionsClick(e);
                          onClose();
                        }}
                        className="block w-full h-28 sm:h-32 md:h-44 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl md:rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:shadow-2xl hover:shadow-white/20 group cursor-pointer overflow-hidden text-left"
                        style={{
                          backdropFilter: 'blur(10px)',
                          WebkitBackdropFilter: 'blur(10px)',
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                          boxShadow: '0 0 0 0 rgba(255, 255, 255, 0)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <div className="relative w-full h-16 sm:h-20 md:h-28 overflow-hidden rounded-t-xl md:rounded-t-2xl">
                          <img
                            src={subItem.image}
                            alt={subItem.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        </div>
                        <div className="p-2 md:p-3 text-center">
                          <h3 className="text-white text-xs sm:text-sm md:text-sm font-medium group-hover:text-white transition-colors duration-300 leading-tight">
                            {subItem.name}
                          </h3>
                        </div>
                      </button>
                    ) : (subItem as any).external ? (
                      <a
                        href={subItem.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onClose}
                        className="block w-full h-28 sm:h-32 md:h-44 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl md:rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:shadow-2xl hover:shadow-white/20 group cursor-pointer overflow-hidden"
                        style={{
                          backdropFilter: 'blur(10px)',
                          WebkitBackdropFilter: 'blur(10px)',
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                          boxShadow: '0 0 0 0 rgba(255, 255, 255, 0)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <div className="relative w-full h-16 sm:h-20 md:h-28 overflow-hidden rounded-t-xl md:rounded-t-2xl">
                          <img
                            src={subItem.image}
                            alt={subItem.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        </div>
                        <div className="p-2 md:p-3 text-center">
                          <h3 className="text-white text-xs sm:text-sm md:text-sm font-medium group-hover:text-white transition-colors duration-300 leading-tight">
                            {subItem.name}
                          </h3>
                        </div>
                      </a>
                    ) : (
                      <Link
                        to={subItem.href}
                        onClick={onClose}
                        className="block w-full h-28 sm:h-32 md:h-44 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl md:rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:shadow-2xl hover:shadow-white/20 group cursor-pointer overflow-hidden"
                        style={{
                          backdropFilter: 'blur(10px)',
                          WebkitBackdropFilter: 'blur(10px)',
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                          boxShadow: '0 0 0 0 rgba(255, 255, 255, 0)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <div className="relative w-full h-16 sm:h-20 md:h-28 overflow-hidden rounded-t-xl md:rounded-t-2xl">
                          <img
                            src={subItem.image}
                            alt={subItem.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        </div>
                        <div className="p-2 md:p-3 text-center">
                          <h3 className="text-white text-xs sm:text-sm md:text-sm font-medium group-hover:text-white transition-colors duration-300 leading-tight">
                            {subItem.name}
                          </h3>
                        </div>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
