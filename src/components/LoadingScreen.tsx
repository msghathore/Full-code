import { useEffect, useState } from 'react';
import { gsap } from 'gsap';

export const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        setTimeout(onComplete, 500);
      }
    });

    // Simulate loading
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[10000] bg-black flex items-center justify-center">
      <div className="text-center">
        <div
          className="text-7xl md:text-9xl font-serif text-white mb-8 luxury-glow"
          style={{
            textShadow: '0 0 30px rgba(255,255,255,0.8), 0 0 60px rgba(255,255,255,0.6)',
            animation: 'pulse 2s ease-in-out infinite'
          }}
        >
          ZAVIRA
        </div>
        <div className="w-64 h-1 bg-white/20 rounded-full overflow-hidden mx-auto">
          <div
            className="h-full bg-white luxury-glow transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-white/60 mt-4 tracking-widest text-sm">
          {Math.round(progress)}%
        </p>
      </div>
    </div>
  );
};
