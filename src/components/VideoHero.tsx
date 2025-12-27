import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/use-language';
import { BookingRouterModal } from '@/components/BookingRouterModal';

// Optimized animations - reduced complexity for better initial performance
const heroButtonVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      delay: 0.3
    }
  },
  hover: {
    scale: 1.05,
    transition: { duration: 0.2, ease: "easeOut" }
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1, ease: "easeOut" }
  }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const VideoHero = React.memo(() => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const [showBookingRouter, setShowBookingRouter] = useState(false);
  const { t } = useLanguage();

  const handleBookNowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('[VideoHero] Book Now clicked - opening BookingRouterModal');
    setShowBookingRouter(true);
  };

  // Optimized video initialization - minimal overhead
  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      if (import.meta.env.DEV) {
        console.error('[VideoHero] Video ref not found');
      }
      return;
    }

    // Single play attempt when video can play through
    const handleCanPlayThrough = () => {
      video.muted = true;
      video.play().catch((error) => {
        if (import.meta.env.DEV) {
          console.error('[VideoHero] Autoplay failed:', error.message);
        }
      });
    };

    // Check if video is already ready (handles cached videos)
    if (video.readyState >= 3) {
      // Video already has enough data buffered
      handleCanPlayThrough();
    } else {
      // Wait for video to buffer enough data
      video.addEventListener('canplaythrough', handleCanPlayThrough, { once: true });
    }
  }, []);

  const handleVideoError = (e: any) => {
    if (import.meta.env.DEV) {
      console.error('[VideoHero] Video error:', e, {
        videoError: videoRef.current?.error,
        networkState: videoRef.current?.networkState,
        readyState: videoRef.current?.readyState
      });
    }
    setVideoError(true);
  };

  if (videoError) {
    return (
      <section className="fixed inset-0 w-full h-screen z-0 bg-gradient-to-br from-neutral-900 via-stone-800 to-white/30 dark:from-neutral-900 dark:via-stone-800 dark:to-white/30">
        <div className="absolute inset-0 bg-black/30 dark:bg-black/30" />
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-6xl md:text-8xl font-bold text-foreground mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Zavira
            </h1>
            <p className="text-xl md:text-2xl text-foreground/90 mb-12 max-w-md mx-auto">
              {t('professionalBeautyServices')}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                onClick={handleBookNowClick}
                className="bg-foreground text-background hover:bg-transparent hover:text-foreground border-2 border-foreground rounded-full px-12 py-5 font-semibold text-2xl md:text-3xl"
                style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.02em' }}
              >
                {t('bookNow')}
              </Button>
              <Button asChild className="bg-transparent text-foreground hover:bg-foreground hover:text-background border-2 border-foreground rounded-full px-12 py-5 font-semibold text-2xl md:text-3xl" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.02em' }}>
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
      {/* Video - Optimized for smooth streaming without stalling */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover object-center"
        muted={true}
        loop={true}
        playsInline={true}
        autoPlay={true}
        preload="auto"
        aria-label="Background video showcasing Zavira salon atmosphere"
        onError={handleVideoError}
        // @ts-ignore - webkit specific attribute
        webkit-playsinline="true"
        // @ts-ignore - x5 video player attribute for mobile
        x5-video-player-type="h5"
        x5-video-player-fullscreen="true"
        style={{
          // GPU acceleration for smooth playback
          pointerEvents: 'none',
          zIndex: 1,
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        }}
      >
        {/* MP4 with H.264 - Optimized (1.66 MB) - Universal browser support */}
        <source src="/videos/hero-video-optimized.mp4" type="video/mp4; codecs=avc1.42E01E,mp4a.40.2" />
        {/* Fallback MP4 without codec specification */}
        <source src="/videos/hero-video-optimized.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Single optimized overlay */}
      <div
        className="absolute inset-0 bg-black/40 z-5 pointer-events-none"
        style={{ transform: 'translateZ(0)' }}
      />

      {/* Hero Buttons - Bottom Center with optimized animations */}
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

      {/* Booking Router Modal */}
      <BookingRouterModal
        open={showBookingRouter}
        onClose={() => setShowBookingRouter(false)}
      />
    </section>
  );
});

export default VideoHero;
