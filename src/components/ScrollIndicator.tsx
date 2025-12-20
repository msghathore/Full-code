import { useEffect, useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';

export const ScrollIndicator = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const applySection = document.querySelector('.careers-form');
      if (!applySection) return;

      const applyTop = applySection.getBoundingClientRect().top + window.scrollY;
      const windowHeight = window.innerHeight;

      // Show popup from the start until reaching the apply section
      if (scrollY < applyTop - windowHeight / 2) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const scrollToApply = () => {
    const applySection = document.querySelector('.careers-form');
    if (applySection) {
      applySection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollToApply();
    }
  };

  // Don't render on mobile devices
  if (isMobile) return null;

  return (
    <div
      className={`fixed right-6 top-1/3 transform -translate-y-1/2 z-20 transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-75 translate-x-4 pointer-events-none'
      }`}
    >
      <button
        onClick={scrollToApply}
        onKeyDown={handleKeyDown}
        className="group frosted-glass border border-white/20 rounded-xl px-4 py-3 text-white hover:border-white/40 hover:bg-white/5 transition-all duration-300 cursor-pointer flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black relative overflow-hidden"
        aria-label="Scroll to application form"
        title="Click to scroll to the application form"
      >
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <span className="text-sm font-medium tracking-wide relative z-10">Apply Now</span>
        <ChevronDown className="w-4 h-4 animate-bounce relative z-10" />

        {/* Luxury glow effect */}
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-yellow-400/10 via-transparent to-yellow-400/10 blur-sm" />
      </button>
    </div>
  );
};