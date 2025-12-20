import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

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
      console.log('Book Now API response:', response.status);
    } catch (error) {
      console.log('Book Now API call failed (expected for mock):', error);
    }
    // Navigate to booking page
    window.location.href = '/booking';
  };

  // Recovery function for stalled video
  const recoverFromStall = useCallback((video: HTMLVideoElement) => {
    if (recoveryAttemptRef.current >= 3) {
      console.warn('🎥 VideoHero: Max recovery attempts reached, video may not play correctly');
      return;
    }

    recoveryAttemptRef.current++;
    console.log(`🎥 VideoHero: Attempting recovery (attempt ${recoveryAttemptRef.current})`);

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

    console.log('🎥 VideoHero: Starting video initialization for all browsers (Edge, Safari, Chrome, Firefox)');

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
            console.log('🎥 VideoHero: ✅ Video playing successfully');
            isPlaying = true;
            stallCountRef.current = 0;
            recoveryAttemptRef.current = 0;
          })
          .catch((error) => {
            console.warn('🎥 VideoHero: ⚠️ Autoplay blocked, will play on interaction:', error.message);
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
      console.log('🎥 VideoHero: canplay event fired');
      attemptPlay();
    };

    const handleLoadedData = () => {
      console.log('✅ VideoHero: Video loaded successfully');
    };

    const handleStalled = () => {
      console.warn('🎥 VideoHero: Video stalled event - browser stopped fetching media');
      // Give it a moment, then try recovery
      setTimeout(() => {
        if (video && video.paused) {
          recoverFromStall(video);
        }
      }, 1000);
    };

    const handleWaiting = () => {
      console.log('🎥 VideoHero: Video waiting for more data');
    };

    const handlePlaying = () => {
      console.log('🎥 VideoHero: Video is now playing');
      isPlaying = true;
      stallCountRef.current = 0;
    };

    const handlePause = () => {
      // Video paused - might be due to buffer underrun in Edge
      if (!video.ended) {
        console.log('🎥 VideoHero: Video paused unexpectedly, attempting to resume');
        setTimeout(() => {
          if (video && video.paused && !video.ended) {
            video.play().catch(() => {});
          }
        }, 100);
      }
    };

    const handleEnded = () => {
      // For looping video, this shouldn't fire, but just in case
      console.log('🎥 VideoHero: Video ended, restarting');
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
        video.play().then(() => {
          console.log('🎥 VideoHero: ✅ Video playing after user interaction');
        }).catch(() => {});
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
    console.error('❌ VideoHero: Video failed to load, switching to fallback');
    setVideoError(true);
  };

  const handleVideoLoad = () => {
    console.log('✅ VideoHero: Video loaded successfully');
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
              Professional beauty services in an elegant atmosphere
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                onClick={handleBookNowClick}
                className="bg-white text-black hover:bg-transparent hover:text-white border-2 border-white rounded-full px-12 py-5 font-semibold text-2xl md:text-3xl"
                style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.02em' }}
              >
                Book Now
              </Button>
              <Button asChild className="bg-transparent text-white hover:bg-white hover:text-black border-2 border-white rounded-full px-12 py-5 font-semibold text-2xl md:text-3xl" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.02em' }}>
                <Link to="/services">Explore Services</Link>
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
        preload="metadata"
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

      {/* Hero Buttons - Bottom Center with Framer Motion */}
      <motion.div
        className="absolute bottom-32 md:bottom-12 left-1/2 transform -translate-x-1/2 z-20 flex flex-col sm:flex-row gap-6 md:gap-6 items-center w-full px-6 justify-center max-w-sm sm:max-w-none"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div
          variants={heroButtonVariants}
          whileHover="hover"
          whileTap="tap"
          className="w-full sm:w-auto"
        >
          <Button
            onClick={handleBookNowClick}
            className="group relative bg-white text-black hover:bg-transparent hover:text-white border-2 border-white/80 hover:border-white shadow-2xl shadow-black/30 transition-colors duration-500 ease-out rounded-full px-12 md:px-16 py-4 md:py-5 font-semibold text-2xl md:text-3xl focus:outline-none focus:ring-4 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black/50 min-h-[56px] md:min-h-[64px] w-full sm:min-w-[280px] md:min-w-[340px] touch-manipulation"
            style={{
              boxShadow: '0 10px 30px rgba(0,0,0,0.3), 0 1px 8px rgba(255,255,255,0.1) inset',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)',
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '0.02em'
            }}
            aria-label="Book an appointment now"
          >
            <span className="relative z-10 flex items-center justify-center w-full h-full">
              Book Now
            </span>
          </Button>
        </motion.div>
        <motion.div
          variants={heroButtonVariants}
          whileHover="hover"
          whileTap="tap"
          className="w-full sm:w-auto"
        >
          <Button
            asChild
            className="group relative bg-white text-black hover:bg-transparent hover:text-white border-2 border-white/80 hover:border-white shadow-2xl shadow-black/30 transition-colors duration-500 ease-out rounded-full px-12 md:px-16 py-4 md:py-5 font-semibold text-2xl md:text-3xl focus:outline-none focus:ring-4 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black/50 min-h-[56px] md:min-h-[64px] w-full sm:min-w-[280px] md:min-w-[340px] touch-manipulation"
            style={{
              boxShadow: '0 10px 30px rgba(0,0,0,0.3), 0 1px 8px rgba(255,255,255,0.1) inset',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)',
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '0.02em'
            }}
            aria-label="Explore our services"
          >
            <Link to="/services" className="relative z-10 flex items-center justify-center w-full h-full">
              Explore Services
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
});

export default VideoHero;