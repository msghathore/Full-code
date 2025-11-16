import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';

interface AnimatedMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { name: 'SERVICES', href: '/services', image: '/images/services-menu.jpg' },
  { name: 'BOOKING', href: '/booking', image: '/images/booking-menu.jpg' },
  { name: 'SHOP', href: '/shop', image: '/images/shop-menu.jpg' },
  { name: 'ABOUT', href: '/about', image: '/images/about-menu.jpg' },
  { name: 'CONTACT', href: '/contact', image: '/images/contact-menu.jpg' },
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
    const menuTexts = leftPanel.querySelectorAll('.menu-item-text');

    if (isOpen) {
      gsap.to(menuRef.current, {
        opacity: 1,
        duration: 0,
        pointerEvents: 'all'
      });

      gsap.fromTo(leftPanel, 
        { x: '-100%' },
        { 
          x: '0%', 
          duration: 0.8, 
          ease: 'power3.out'
        }
      );

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
      gsap.to([leftPanel, rightPanel], {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          gsap.set(menuRef.current, { pointerEvents: 'none' });
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="fixed inset-0 z-[999] opacity-0 pointer-events-none"
      style={{ pointerEvents: isOpen ? 'all' : 'none' }}
    >
      {/* Left Panel - Menu Items */}
      <div
        ref={leftPanelRef}
        className="absolute left-0 top-0 h-full w-2/5 border-r border-white/10"
        style={{ 
          transform: 'translateX(-100%)',
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        }}
      >
        <div className="flex flex-col justify-center h-full px-16 space-y-8">
          {menuItems.map((item, index) => (
            <Link
              key={item.name}
              to={item.href}
              className="menu-item-text group"
              onMouseEnter={() => setHoveredItem(item.name)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={onClose}
            >
              <h2 className="text-5xl font-serif text-white hover:luxury-glow transition-all duration-500 cursor-hover">
                {item.name}
                <span className="inline-block ml-4 text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  →
                </span>
              </h2>
            </Link>
          ))}
        </div>
      </div>

      {/* Right Panel - Image Preview */}
      <div
        ref={rightPanelRef}
        className="absolute right-0 top-0 h-full w-1/2 bg-black/80 flex items-center justify-center overflow-hidden"
      >
        {hoveredItem && (
          <div className="relative w-full h-full">
            <img
              src={menuItems.find(item => item.name === hoveredItem)?.image}
              alt={hoveredItem}
              className="w-full h-full object-cover opacity-70 image-hover-glow"
              style={{
                animation: 'fadeIn 0.5s ease-out'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        )}
      </div>
    </div>
  );
};
