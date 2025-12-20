import { useEffect, useState } from 'react';

export const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Quick, snappy loading - just enough for branding
    const duration = 1300;
    const interval = 50; // Update every 50ms for smooth animation
    const increment = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 200); // Small delay before transition
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
      <div className="text-center">
        {/* ZAVIRA Logo with glow effect */}
        <div
          className="text-7xl md:text-9xl font-serif text-white mb-8"
          style={{
            textShadow: '0 0 30px rgba(255,255,255,0.8), 0 0 60px rgba(255,255,255,0.6), 0 0 90px rgba(255,255,255,0.4)',
            animation: 'pulse 2s ease-in-out infinite'
          }}
        >
          ZAVIRA
        </div>

        {/* Clean loading bar with glow */}
        <div className="w-64 h-1 bg-white/20 rounded-full overflow-hidden mx-auto">
          <div
            className="h-full bg-white rounded-full transition-all duration-100 ease-out"
            style={{
              width: `${progress}%`,
              boxShadow: '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.4)'
            }}
          />
        </div>
      </div>
    </div>
  );
};
