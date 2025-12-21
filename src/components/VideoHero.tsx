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
  const lastTimeRef = useRef<number>(0);
  const stallCountRef = useRef<number>(0);
  const recoveryAttemptRef = useRef<number>(0);
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

  // Recovery function for stalled video
  const recoverFromStall = useCallback((video: HTMLVideoElement) => {
    if (recoveryAttemptRef.current >= 3) {
      console.warn('🎥 VideoHero: Max recovery attempts reached');
      return;
    }

    recoveryAttemptRef.current++;

    // Try different recovery strategies
    if (recoveryAttemptRef.current === 1) {
      // Strategy 1: Seek slightly forward
      const seekTo = Math.min(video.currentTime + 0.1, video.duration - 0.5);
      video.currentTime = seekTo;
      video.play().catch(() => {});
    } else if (recoveryAttemptRef.current === 2) {
      // Strategy 2: Restart from beginning
      video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      // Strategy 3: Force reload the video
      const currentSrc = video.currentSrc;
      video.src = '';
      video.load();
      video.src = currentSrc;
      video.load();
      video.play().catch(() => {});
    }
  }, []);

  // Enhanced video initialization for cross-browser compatibility
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let stallCheckInterval: NodeJS.Timeout | null = null;
    let isPlaying = false;

    // Attempt to play video
    const attemptPlay = () => {
      if (!video) return;

      video.muted = true;
      const playPromise = video.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            isPlaying = true;
            stallCountRef.current = 0;
            recoveryAttemptRef.current = 0;
          })
          .catch((error) => {
            console.warn('🎥 VideoHero: Autoplay blocked:', error.message);
          });
      }
    };

    // Monitor for stalls - critical for Edge browser
    const checkForStall = () => {
      if (!video || video.paused || video.ended) return;

      const currentTime = video.currentTime;
      const timeDiff = Math.abs(currentTime - lastTimeRef.current);

      // If time hasn't advanced in 1 second while video should be playing
      if (timeDiff < 0.1 && isPlaying && !video.seeking) {
        stallCountRef.current++;
        console.warn(`🎥 VideoHero: Video stall detected (count: ${stallCountRef.current}), time stuck at ${currentTime.toFixed(2)}s`);

        if (stallCountRef.current >= 2) {
          recoverFromStall(video);
          stallCountRef.current = 0;
        }
      } else {
        stallCountRef.current = 0;
        recoveryAttemptRef.current = 0; // Reset on successful play
      }

      lastTimeRef.current = currentTime;
    };

    // Event handlers
    const handleCanPlay = () => {
      attemptPlay();
    };

    const handleLoadedData = () => {
      // Video loaded successfully
    };

    const handleStalled = () => {
      console.warn('🎥 VideoHero: Video stalled');
      // Give it a moment, then try recovery
      setTimeout(() => {
        if (video && video.paused) {
          recoverFromStall(video);
        }
      }, 1000);
    };

    const handleWaiting = () => {
      // Video waiting for more data
    };

    const handlePlaying = () => {
      isPlaying = true;
      stallCountRef.current = 0;
    };

    const handlePause = () => {
      // Video paused - might be due to buffer underrun in Edge
      if (!video.ended) {
        setTimeout(() => {
          if (video && video.paused && !video.ended) {
            video.play().catch(() => {});
          }
        }, 100);
      }
    };

    const handleEnded = () => {
      // For looping video, this shouldn't fire, but just in case
      video.currentTime = 0;
      video.play().catch(() => {});
    };

    const handleProgress = () => {
      // Monitor buffering progress
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration || 0;
        const bufferPercent = duration > 0 ? ((bufferedEnd / duration) * 100).toFixed(1) : 0;

        // If buffer is very low and video is near buffer boundary
        if (bufferedEnd - video.currentTime < 1 && bufferedEnd < duration - 1) {
          console.warn(`🎥 VideoHero: Low buffer warning - buffered to ${bufferedEnd.toFixed(1)}s, playing at ${video.currentTime.toFixed(1)}s`);
        }
      }
    };

    // User interaction handler for browsers that block autoplay
    const handleUserInteraction = () => {
      if (video && video.paused) {
        video.muted = true;
        video.play().catch(() => {});
      }
    };

    // Add event listeners
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('stalled', handleStalled);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('progress', handleProgress);

    // Add user interaction listeners
    const interactionEvents = ['click', 'touchstart', 'keydown', 'scroll'];
    interactionEvents.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { passive: true, once: true });
    });

    // Start stall detection interval - critical for Edge
    stallCheckInterval = setInterval(checkForStall, 1000);

    // Initial play attempt after a short delay
    const initTimer = setTimeout(() => {
      if (video.readyState >= 2) {
        attemptPlay();
      }
    }, 100);

    // Cleanup
    return () => {
      clearTimeout(initTimer);
      if (stallCheckInterval) clearInterval(stallCheckInterval);

      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('stalled', handleStalled);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('progress', handleProgress);

      interactionEvents.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [recoverFromStall]);

  const handleVideoError = () => {
    console.error('❌ VideoHero: Video failed to load');
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
        {/* MP4 with H.264 - widest compatibility */}
        <source src="/videos/hero-video.mp4" type="video/mp4; codecs=avc1.42E01E,mp4a.40.2" />
        {/* WebM with VP9 - better compression */}
        <source src="/videos/hero-video.webm" type="video/webm; codecs=vp9,opus" />
        {/* Fallback MP4 without codec specification */}
        <source src="/videos/hero-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Single optimized overlay */}
      <div className="absolute inset-0 bg-black/40 z-5" />

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
            className="text-[5.5rem] sm:text-8xl md:text-9xl lg:text-[12rem] xl:text-[15rem] font-serif font-light text-white luxury-glow"
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
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            ZAVIRA
          </motion.h1>
        </motion.div>
      </div>

      {/* Floating decorative elements */}
      <motion.div
        className="absolute top-20 left-10 w-2 h-2 rounded-full bg-white/40 blur-sm z-10"
        variants={floatingVariants}
        animate="animate"
      />
      <motion.div
        className="absolute top-40 right-20 w-3 h-3 rounded-full bg-white/30 blur-sm z-10"
        variants={floatingVariants}
        animate="animate"
        style={{ animationDelay: '1s' }}
      />
      <motion.div
        className="absolute bottom-40 left-1/4 w-2 h-2 rounded-full bg-white/20 blur-sm z-10"
        variants={floatingVariants}
        animate="animate"
        style={{ animationDelay: '2s' }}
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