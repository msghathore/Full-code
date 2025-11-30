import { useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

gsap.registerPlugin(ScrollTrigger);

export const VideoHero = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [videoError, setVideoError] = useState(false);
    const controlsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (controlsRef.current) {
      const tl = gsap.timeline();

      tl.fromTo(controlsRef.current, {
        opacity: 0,
        y: 20,
        scale: 0.8,
        filter: 'blur(5px)'
      }, {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: 1,
        delay: 1.5,
        ease: 'elastic.out(1, 0.5)',
        onComplete: () => {
          // Add continuous subtle animation
          gsap.to(controlsRef.current, {
            scale: 1.05,
            duration: 2,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            delay: 1
          });
        }
      });

      // Add entrance morphing effect
      tl.fromTo(controlsRef.current.querySelector('button'), {
        borderRadius: '50px'
      }, {
        borderRadius: '12px',
        duration: 0.5,
        ease: 'power2.inOut'
      }, '-=0.5');
    }
  }, []);

  // Handle video errors
  const handleVideoError = () => {
    console.error('Video failed to load, switching to fallback');
    setVideoError(true);
  };
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  return <section className="fixed inset-0 w-full h-screen z-0" aria-label="Hero video section">
      {/* Video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        aria-label="Background video showcasing Zavira salon atmosphere"
        onError={handleVideoError}
      >
        <source src="/videos/hero-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Video Controls */}
      <div ref={controlsRef} className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20">
        <Button
          variant="outline"
          onClick={togglePlay}
          className="group relative overflow-hidden bg-white/20 border-white/40 hover:bg-white/30 hover:border-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl hover:shadow-white/20 transition-all duration-300"
          aria-label={isPlaying ? "Pause background video" : "Play background video"}
          aria-pressed={isPlaying}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-200" aria-hidden="true" />
          ) : (
            <Play className="w-6 h-6 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-200" aria-hidden="true" />
          )}
          <span className="absolute inset-0 flex items-center justify-center text-button-enhanced text-white font-bold opacity-0 group-hover:opacity-100 group-hover:luxury-glow transition-all duration-300 drop-shadow-lg" aria-hidden="true">
            {isPlaying ? 'PAUSE' : 'PLAY'}
          </span>
        </Button>
      </div>
    </section>;
};