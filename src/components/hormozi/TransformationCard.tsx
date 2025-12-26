import { useState } from 'react';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { Button } from '@/components/ui/button';
import { X, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransformationCardProps {
  id: string;
  beforeImage: string;
  afterImage: string;
  description: string;
  category: string;
  featured?: boolean;
  onBookService?: () => void;
}

export const TransformationCard = ({
  beforeImage,
  afterImage,
  description,
  category,
  featured = false,
  onBookService,
}: TransformationCardProps) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleCardClick = () => {
    setIsLightboxOpen(true);
  };

  const handleBookService = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBookService) {
      onBookService();
    } else {
      // Default behavior: navigate to booking page
      window.location.href = '/booking';
    }
  };

  return (
    <>
      {/* Card */}
      <div
        className={cn(
          'group relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800 hover:border-emerald-500 transition-all duration-300 cursor-pointer',
          featured && 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-black'
        )}
        onClick={handleCardClick}
      >
        {/* Featured Badge */}
        {featured && (
          <div className="absolute top-3 left-3 z-10 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            ✨ Featured
          </div>
        )}

        {/* Image Slider */}
        <div className="aspect-[4/3] relative">
          <BeforeAfterSlider
            beforeImage={beforeImage}
            afterImage={afterImage}
            beforeLabel="Before"
            afterLabel="After"
          />
        </div>

        {/* Card Content */}
        <div className="p-5 space-y-3">
          {/* Category Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-block bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold">
              {category}
            </span>
          </div>

          {/* Description */}
          <p className="text-white text-sm leading-relaxed line-clamp-2">
            {description}
          </p>

          {/* CTA Button */}
          <Button
            onClick={handleBookService}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg hover:shadow-emerald-500/50 transition-all"
          >
            Book This Service
          </Button>

          {/* View Details Hint */}
          <p className="text-slate-400 text-xs text-center group-hover:text-emerald-400 transition-colors">
            Click to view full size
          </p>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-w-6xl w-full max-h-[90vh] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 right-4 z-20 bg-black/80 hover:bg-black text-white p-2 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image Slider (Full Size) */}
            <div className="aspect-[16/10] relative">
              <BeforeAfterSlider
                beforeImage={beforeImage}
                afterImage={afterImage}
                beforeLabel="Before"
                afterLabel="After"
              />
            </div>

            {/* Lightbox Content */}
            <div className="p-6 space-y-4 bg-gradient-to-t from-black to-transparent">
              {/* Category */}
              <div className="flex items-center justify-between">
                <span className="inline-block bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-semibold">
                  {category}
                </span>
                {featured && (
                  <span className="inline-block bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                    ✨ Featured Transformation
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-white text-lg leading-relaxed">
                {description}
              </p>

              {/* CTA Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleBookService}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg hover:shadow-emerald-500/50 transition-all"
                >
                  Book This Service
                </Button>
                <Button
                  onClick={() => (window.location.href = '/services')}
                  variant="outline"
                  className="flex-1 border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View All Services
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
