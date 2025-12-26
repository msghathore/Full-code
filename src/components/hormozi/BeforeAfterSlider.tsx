import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export const BeforeAfterSlider = ({
  beforeImage,
  afterImage,
  beforeLabel = 'Before',
  afterLabel = 'After',
  className,
}: BeforeAfterSliderProps) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fallback images for error handling
  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop';

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = FALLBACK_IMAGE;
  };

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;

    // Clamp between 0 and 100
    const clampedPercentage = Math.max(0, Math.min(100, percentage));
    setSliderPosition(clampedPercentage);
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchend', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full h-full overflow-hidden select-none cursor-ew-resize',
        className
      )}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onMouseUp={handleMouseUp}
    >
      {/* After Image (Background) */}
      <div className="absolute inset-0">
        <img
          src={afterImage}
          alt={afterLabel}
          className="w-full h-full object-cover"
          draggable={false}
          onError={handleImageError}
        />
        {/* After Label */}
        <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-md text-sm font-semibold shadow-lg">
          {afterLabel}
        </div>
      </div>

      {/* Before Image (Foreground with clip) */}
      <div
        className="absolute inset-0 transition-none"
        style={{
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
        }}
      >
        <img
          src={beforeImage}
          alt={beforeLabel}
          className="w-full h-full object-cover"
          draggable={false}
          onError={handleImageError}
        />
        {/* Before Label */}
        <div className="absolute top-4 left-4 bg-slate-700 text-white px-3 py-1 rounded-md text-sm font-semibold shadow-lg">
          {beforeLabel}
        </div>
      </div>

      {/* Slider Handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={() => setIsDragging(true)}
      >
        {/* Slider Circle Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-2xl border-4 border-emerald-500 flex items-center justify-center cursor-grab active:cursor-grabbing">
          <div className="flex gap-1">
            <div className="w-1 h-6 bg-emerald-500 rounded"></div>
            <div className="w-1 h-6 bg-emerald-500 rounded"></div>
          </div>
        </div>
      </div>

      {/* Touch/Drag Hint */}
      {sliderPosition === 50 && !isDragging && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/70 text-white px-4 py-2 rounded-lg text-sm font-medium animate-pulse">
            ← Drag to Compare →
          </div>
        </div>
      )}
    </div>
  );
};
