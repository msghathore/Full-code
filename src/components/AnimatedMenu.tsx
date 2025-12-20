import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

interface AnimatedMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

import { getMapsUrl } from '@/lib/businessConstants';

// Use centralized maps URL generator from businessConstants

// Handle directions click with platform detection
const handleDirectionsClick = (e: React.MouseEvent) => {
  e.preventDefault();
  const mapsUrl = getMapsUrl();
  window.open(mapsUrl, '_blank', 'noopener,noreferrer');
};

const menuItems = [
  {
    name: 'SERVICES',
    href: '/services',
    image: '/images/services-menu.jpg',
    subItems: [
      { name: 'Hair Services', href: '/services#hair', image: '/images/hair-service.jpg' },
      { name: 'Nail Care', href: '/services#nails', image: '/images/nails-service.jpg' },
      { name: 'Skin Care', href: '/services#skin', image: '/images/skin-service.jpg' },
      { name: 'Massage Therapy', href: '/services#massage', image: '/images/massage-service.jpg' },
      { name: 'Tattoo Art', href: '/services#tattoo', image: '/images/tattoo-service.jpg' },
      { name: 'Piercing', href: '/services#piercing', image: '/images/piercing-service.jpg' }
    ]
  },
  {
    name: 'BOOKING',
    href: '/booking',
    image: '/images/booking-menu.jpg',
    subItems: [
      { name: 'Book Appointment', href: '/booking', image: '/images/schedule-appointment.jpg' },
      { name: 'Group Booking', href: '/group-booking', image: '/images/group-booking.jpg' }
    ]
  },
  {
    name: 'SHOP',
    href: '/shop',
    image: '/images/shop-menu.jpg',
    subItems: [
      { name: 'Hair Care', href: '/shop?category=Hair Care', image: '/images/product-1.jpg' },
      { name: 'Skin Care', href: '/shop?category=Skin Care', image: '/images/product-2.jpg' },
      { name: 'Nail Care', href: '/shop?category=Nail Care', image: '/images/product-3.jpg' },
      { name: 'Beauty Tools', href: '/shop?category=Tools', image: '/images/product-4.jpg' },
      { name: 'Body Care', href: '/shop?category=Body Care', image: '/images/product-5.jpg' }
    ]
  },
  {
    name: 'BLOG',
    href: '/blog',
    image: '/images/blog-1.jpg',
    subItems: [
      { name: 'Beauty Tips', href: '/blog?category=Beauty Tips', image: '/images/blog-1.jpg' },
      { name: 'Style Guides', href: '/blog?category=Style Guides', image: '/images/blog-2.jpg' },
      { name: 'Product Reviews', href: '/blog?category=Product Reviews', image: '/images/blog-3.jpg' }
    ]
  },
  {
    name: 'CAREERS',
    href: '/careers',
    image: '/images/careers.jpg',
    subItems: [
      { name: 'Current Openings', href: '/careers#openings', image: '/images/openings.jpg' },
      { name: 'Apply Now', href: '/careers#apply', image: '/images/apply.jpg' }
    ]
  },
  {
    name: 'ABOUT',
    href: '/about',
    image: '/images/about-menu.jpg',
    subItems: [
      { name: 'Our Story', href: '/about#story', image: '/images/our-story.jpg' },
      { name: 'Our Team', href: '/team', image: '/images/team.jpg' }
    ]
  },
  {
    name: 'CONTACT',
    href: '/contact',
    image: '/images/contact-menu.jpg',
    subItems: [
      { name: 'Hours of Operation', href: '/contact#hours', image: '/images/location.jpg' },
      { name: 'Get Directions', href: '#directions', image: '/images/directions.jpg', universalMaps: true },
      { name: 'Call Us', href: '/contact#phone', image: '/images/call-us.jpg' },
      { name: 'FAQ', href: '/faq', image: '/images/faq.jpg' }
    ]
  }
];

export const AnimatedMenu = ({ isOpen, onClose }: AnimatedMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

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
        className="absolute left-0 top-0 h-full w-full md:w-1/3 border-r border-white/10 animate-fade-in relative"
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
          {menuItems.map((item, index) => (
            <div
              key={item.name}
              className="menu-item-text group"
              onMouseEnter={() => setHoveredItem(item.name)}
              onClick={() => setHoveredItem(hoveredItem === item.name ? null : item.name)}
            >
              <Link
                to={item.href}
                className="block py-2 md:py-0"
                onClick={onClose}
              >
                <h2 className="text-lg sm:text-xl md:text-5xl font-serif text-white hover:luxury-glow transition-all duration-500 cursor-hover leading-tight">
                  {item.name}
                </h2>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Service Cards */}
      <div
        ref={rightPanelRef}
        className="absolute right-0 top-0 h-full w-full md:w-2/3 overflow-hidden hidden md:block"
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
        {hoveredItem && (
          <div className="flex flex-col h-full p-4 md:p-8">
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3 md:gap-6">
                {menuItems.find(item => item.name === hoveredItem)?.subItems.map((subItem, index) => (
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

      {/* Mobile Submenu Panel */}
      <div
        className="absolute left-0 top-0 h-full w-full md:hidden bg-black/80 backdrop-blur-xl border-r border-white/10"
        style={{
          transform: 'translateX(100%)',
          transition: 'transform 0.3s ease'
        }}
      >
        {hoveredItem && (
          <div className="flex flex-col h-full p-4 pt-16">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-serif text-white luxury-glow">{hoveredItem}</h3>
              <button
                onClick={() => setHoveredItem(null)}
                className="text-white hover:text-gray-300 p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Back to main menu"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 gap-3">
                {menuItems.find(item => item.name === hoveredItem)?.subItems.map((subItem, index) => (
                  (subItem as any).universalMaps ? (
                    <button
                      key={subItem.name}
                      onClick={(e) => {
                        handleDirectionsClick(e);
                        onClose();
                      }}
                      className="flex items-center space-x-3 p-3 sm:p-4 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-lg sm:rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:shadow-lg group min-h-[60px] w-full text-left"
                    >
                      <img
                        src={subItem.image}
                        alt={subItem.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-md sm:rounded-lg group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium group-hover:text-white transition-colors duration-300 text-sm sm:text-base leading-tight truncate">
                          {subItem.name}
                        </h4>
                      </div>
                    </button>
                  ) : (subItem as any).external ? (
                    <a
                      key={subItem.name}
                      href={subItem.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={onClose}
                      className="flex items-center space-x-3 p-3 sm:p-4 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-lg sm:rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:shadow-lg group min-h-[60px]"
                    >
                      <img
                        src={subItem.image}
                        alt={subItem.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-md sm:rounded-lg group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium group-hover:text-white transition-colors duration-300 text-sm sm:text-base leading-tight truncate">
                          {subItem.name}
                        </h4>
                      </div>
                    </a>
                  ) : (
                    <Link
                      key={subItem.name}
                      to={subItem.href}
                      onClick={onClose}
                      className="flex items-center space-x-3 p-3 sm:p-4 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-lg sm:rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:shadow-lg group min-h-[60px]"
                    >
                      <img
                        src={subItem.image}
                        alt={subItem.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-md sm:rounded-lg group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium group-hover:text-white transition-colors duration-300 text-sm sm:text-base leading-tight truncate">
                          {subItem.name}
                        </h4>
                      </div>
                    </Link>
                  )
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
