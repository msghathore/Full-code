import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Product360ViewerProps {
  images: string[];
  alt: string;
  className?: string;
}

export const Product360Viewer = ({ images, alt, className = '' }: Product360ViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoRotating && images.length > 1) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 100); // Fast rotation for smooth 360 effect
    }
    return () => clearInterval(interval);
  }, [isAutoRotating, images.length]);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleMouseDown = () => {
    setIsAutoRotating(true);
  };

  const handleMouseUp = () => {
    setIsAutoRotating(false);
  };

  if (!images || images.length === 0) {
    return (
      <div className={`aspect-square bg-black/20 rounded-lg flex items-center justify-center ${className}`}>
        <span className="text-white/50">No images available</span>
      </div>
    );
  }

  return (
    <div className={`relative group ${className}`}>
      <div className="aspect-square overflow-hidden rounded-lg relative">
        <img
          src={images[currentIndex]}
          alt={`${alt} - View ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-200"
          loading="lazy"
        />

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}

        {/* 360° rotation hint */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <RotateCcw className="w-3 h-3" />
            <span>360° View</span>
          </div>
        )}

        {/* Auto-rotate on mouse hold */}
        {images.length > 1 && (
          <div
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        )}
      </div>

      {/* Thumbnail indicators */}
      {images.length > 1 && (
        <div className="flex justify-center gap-1 mt-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};