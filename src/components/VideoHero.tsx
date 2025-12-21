import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/use-language';

// Text reveal animation variants
const titleVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2,
    },
  },
};

const letterVariants = {
  hidden: {
    opacity: 0,
    y: 50,
    rotateX: -90,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: "spring",
      damping: 12,
      stiffness: 100,
    },
  },
};

const subtitleVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: 0.6,
      ease: [0.25, 0.4, 0.25, 1],
    },
  },
};

// Floating decorative elements
const floatingVariants = {
  animate: {
    y: [-10, 10, -10],
    opacity: [0.3, 0.6, 0.3],
    transition: {
      y: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
      opacity: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },
};

// Framer Motion variants for hero entrance animations
const heroButtonVariants = {
  initial: {
    opacity: 0,
    y: 50,
    scale: 0.9
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      delay: 0.8
    }
  },
  hover: {
    scale: 1.05,
    y: -3,
    transition: { type: "spring", stiffness: 400, damping: 10 }
  },
  tap: {
    scale: 0.95,
    transition: { type: "spring", stiffness: 400, damping: 10 }
  }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

const VideoHero = React.memo(() => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const { t } = useLanguage();

  const handleBookNowClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      // Mock API call for booking start
      const response = await fetch('/api/booking/start', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      // Silent fail for mock API
    }
    // Navigate to booking page
    window.location.href = '/booking';
  };

  // Simple video initialization - let the browser handle playback smoothly
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Simple autoplay attempt
    const attemptPlay = () => {
      if (!video) return;
      video.muted = true;
      video.play().catch(() => {
        // Autoplay blocked - user interaction will trigger play
      });
    };

    // Try to play when video is ready
    const handleCanPlay = () => {
      attemptPlay();
    };

    // Only add essential event listeners
    video.addEventListener('canplay', handleCanPlay);

    // Initial play attempt
    const initTimer = setTimeout(() => {
      if (video.readyState >= 2) {
        attemptPlay();
      }
    }, 100);

    // Cleanup
    return () => {
      clearTimeout(initTimer);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  const handleVideoError = () => {
    setVideoError(true);
  };

  const handleVideoLoad = () => {
    // Video loaded successfully
  };

  if (videoError) {
    return (
      <section className="fixed inset-0 w-full h-screen z-0 bg-gradient-to-br from-neutral-900 via-stone-800 to-amber-900">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Zavira
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-md mx-auto">
              {t('professionalBeautyServices')}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                onClick={handleBookNowClick}
                className="bg-white text-black hover:bg-transparent hover:text-white border-2 border-white rounded-full px-12 py-5 font-semibold text-2xl md:text-3xl"
                style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.02em' }}
              >
                {t('bookNow')}
              </Button>
              <Button asChild className="bg-transparent text-white hover:bg-white hover:text-black border-2 border-white rounded-full px-12 py-5 font-semibold text-2xl md:text-3xl" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.02em' }}>
                <Link to="/services">{t('exploreServices')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="fixed inset-0 w-full h-screen z-0" aria-label="Hero video section">
      {/* Video - Optimized for all browsers (Edge, Safari, Chrome, Firefox) */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover object-center"
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
        aria-label="Background video showcasing Zavira salon atmosphere"
        onError={handleVideoError}
        onLoadedData={handleVideoLoad}
        poster="/images/hair-service.jpg"
        // @ts-ignore - webkit specific attribute
        webkit-playsinline="true"
        // @ts-ignore - x5 video player attribute for mobile
        x5-video-player-type="h5"
        x5-video-player-fullscreen="true"
        style={{
          // Ensure video is visible and non-interactive
          pointerEvents: 'none',
          zIndex: 1
        }}
      >
        {/* MP4 with H.264 - Optimized (1.66 MB) - Universal browser support */}
        <source src="/videos/hero-video-optimized.mp4" type="video/mp4; codecs=avc1.42E01E,mp4a.40.2" />
        {/* Fallback MP4 without codec specification */}
        <source src="/videos/hero-video-optimized.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Single optimized overlay */}
      <div className="absolute inset-0 bg-black/40 z-5 pointer-events-none" />

      {/* ZAVIRA Hero Logo - Centered on Video - ALWAYS VISIBLE */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          zIndex: 30,
          paddingBottom: '200px'
        }}
      >
        <motion.div
          className="text-center px-4 w-full max-w-[95vw]"
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.h1
            className="text-8xl sm:text-9xl md:text-[11rem] lg:text-[13rem] xl:text-[16rem] font-serif font-light text-white luxury-glow"
            style={{
              textShadow: '0 0 20px rgba(255,255,255,1), 0 0 40px rgba(255,255,255,0.8), 0 0 60px rgba(255,255,255,0.6)',
              letterSpacing: '0.05em',
              WebkitTextStroke: '2px rgba(255,255,255,0.5)',
              fontWeight: 300,
              filter: 'drop-shadow(0 0 30px rgba(255,255,255,1))'
            }}
            animate={{
              textShadow: [
                '0 0 20px rgba(255,255,255,1), 0 0 40px rgba(255,255,255,0.8)',
                '0 0 30px rgba(255,255,255,1), 0 0 60px rgba(255,255,255,1)',
                '0 0 20px rgba(255,255,255,1), 0 0 40px rgba(255,255,255,0.8)',
              ],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            ZAVIRA
          </motion.h1>
        </motion.div>
      </div>

      {/* Floating decorative elements - simplified for better performance */}
      <motion.div
        className="absolute top-20 left-10 w-2 h-2 rounded-full bg-white/30 z-10"
        variants={floatingVariants}
        animate="animate"
      />
      <motion.div
        className="absolute top-40 right-20 w-2 h-2 rounded-full bg-white/20 z-10"
        variants={floatingVariants}
        animate="animate"
        style={{ animationDelay: '1s' }}
      />

      
      {/* Hero Buttons - Bottom Center with Framer Motion */}
      <motion.div
        className="absolute bottom-20 md:bottom-16 left-1/2 transform -translate-x-1/2 z-20 flex flex-col sm:flex-row gap-4 md:gap-5 items-center w-full px-6 justify-center max-w-sm sm:max-w-none"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Primary CTA - Book Now (Solid, Prominent) */}
        <motion.div
          variants={heroButtonVariants}
          whileHover="hover"
          whileTap="tap"
          className="w-full sm:w-auto"
        >
          <Button
            onClick={handleBookNowClick}
            className="group relative bg-white text-black hover:bg-white hover:text-black transition-all duration-300 ease-out rounded-full px-8 md:px-10 py-3 md:py-3.5 font-medium text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2 focus:ring-offset-black/50 min-h-[48px] md:min-h-[52px] w-full sm:w-auto sm:min-w-[180px] md:min-w-[200px] touch-manipulation overflow-hidden"
            style={{
              boxShadow: '0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(255,255,255,0.1)',
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '0.02em',
              fontWeight: 500
            }}
            aria-label="Book an appointment now"
          >
            {/* Subtle shine effect on hover */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
            <span className="relative z-10">
              {t('bookNow')}
            </span>
          </Button>
        </motion.div>

        {/* Secondary CTA - Explore Services (Same style as Book Now) */}
        <motion.div
          variants={heroButtonVariants}
          whileHover="hover"
          whileTap="tap"
          className="w-full sm:w-auto"
        >
          <Button
            asChild
            className="group relative bg-white text-black hover:bg-white hover:text-black transition-all duration-300 ease-out rounded-full px-8 md:px-10 py-3 md:py-3.5 font-medium text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2 focus:ring-offset-black/50 min-h-[48px] md:min-h-[52px] w-full sm:w-auto sm:min-w-[180px] md:min-w-[200px] touch-manipulation overflow-hidden"
            style={{
              boxShadow: '0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(255,255,255,0.1)',
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '0.02em',
              fontWeight: 500
            }}
            aria-label="Explore our services"
          >
            <Link to="/services">
              {/* Subtle shine effect on hover */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
              <span className="relative z-10">
                {t('exploreServices')}
              </span>
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
});

export default VideoHero;