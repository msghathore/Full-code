import { useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { Play, Pause } from 'lucide-react';

export const VideoHero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const controlsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (controlsRef.current) {
      gsap.fromTo(
        controlsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, delay: 1.5, ease: 'power2.out' }
      );
    }
  }, []);

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

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/videos/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Minimal content - logo is separate component now */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 pt-64">
        <p className="text-sm md:text-base text-white/70 max-w-2xl">
          Experience luxury beauty treatments in an atmosphere of elegance and sophistication
        </p>
      </div>

      {/* Video Controls */}
      <div
        ref={controlsRef}
        className="absolute bottom-12 right-12 z-20"
      >
        <button
          onClick={togglePlay}
          className="group flex items-center space-x-3 px-6 py-3 frosted-glass border border-white/20 rounded-full hover:border-white/40 transition-all cursor-hover"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-white group-hover:luxury-glow transition-all" />
          ) : (
            <Play className="w-5 h-5 text-white group-hover:luxury-glow transition-all" />
          )}
          <span className="text-white text-sm tracking-wider group-hover:luxury-glow transition-all">
            {isPlaying ? 'PAUSE' : 'PLAY'}
          </span>
        </button>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex flex-col items-center">
          <span className="text-white/60 text-xs tracking-widest mb-2">SCROLL</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/60 to-transparent" />
        </div>
      </div>
    </div>
  );
};
