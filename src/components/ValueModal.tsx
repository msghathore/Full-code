import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Star, CheckCircle2, Shield, Clock, Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { BookingRouterModal } from './BookingRouterModal';

interface ValueModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void; // Made optional since we'll handle routing internally

  // Service/Tier details
  name: string;
  price: number;
  duration?: number;
  category?: string;
  description?: string;

  // Pre-selection for booking router
  serviceId?: string;
  tierId?: string;

  // Optional overrides
  transformation?: string;
  features?: string[];
  testimonial?: {
    text: string;
    author: string;
    rating: number;
  };
}

export const ValueModal = ({
  open,
  onClose,
  onConfirm,
  name,
  price,
  duration,
  category,
  description,
  serviceId,
  tierId,
  transformation,
  features,
  testimonial
}: ValueModalProps) => {
  const [showBookingRouter, setShowBookingRouter] = useState(false);

  // Determine tier based on price
  const getTier = (price: number): 'basic' | 'premium' | 'luxury' => {
    if (price < 75) return 'basic';
    if (price < 150) return 'premium';
    return 'luxury';
  };

  const tier = getTier(price);

  // Default transformation messages by tier
  const defaultTransformation =
    tier === 'luxury'
      ? `Experience world-class luxury and leave transformed, confident, and absolutely radiant.`
      : tier === 'premium'
      ? `Get premium results that exceed expectations and make you feel incredible.`
      : `Professional quality service that delivers great results you'll love.`;

  // Default features by tier
  const defaultFeatures =
    tier === 'luxury'
      ? [
          'Master-level artist with 10+ years experience',
          'Top-tier luxury products worth $100+',
          'Extended appointment time for perfection',
          'Private suite with premium beverages',
          'VIP priority booking access',
          'Complimentary luxury touch-up within 7 days'
        ]
      : tier === 'premium'
      ? [
          'Senior stylist with 5+ years experience',
          'Premium brand products',
          'Extended service time',
          'Premium beverages included',
          'Priority scheduling',
          'Touch-up guarantee within 7 days'
        ]
      : [
          'Professional certified stylist',
          'Quality salon products',
          'Standard service time',
          'Complimentary beverages',
          'Flexible scheduling',
          'Satisfaction guaranteed'
        ];

  // Default testimonial by tier
  const defaultTestimonial =
    tier === 'luxury'
      ? {
          text: "Absolutely worth every penny. The luxury experience is unmatched and I've never looked better!",
          author: "Sarah K.",
          rating: 5
        }
      : tier === 'premium'
      ? {
          text: "Perfect balance of quality and value. My stylist was amazing and the results lasted weeks!",
          author: "Jessica M.",
          rating: 5
        }
      : {
          text: "Great service at a fair price. Professional, friendly, and I'm always happy with the results!",
          author: "Emily R.",
          rating: 5
        };

  const displayTransformation = transformation || defaultTransformation;
  const displayFeatures = features || defaultFeatures;
  const displayTestimonial = testimonial || defaultTestimonial;

  // Show different content intensity based on tier
  const showFullContent = tier === 'luxury';
  const showMediumContent = tier === 'premium';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-w-2xl max-h-[90vh] overflow-y-auto bg-black border-2 border-white/20 text-white",
        "scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
      )}>
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 rounded-full p-2 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
        >
          <X className="h-5 w-5 text-white" />
        </button>

        {/* Header */}
        <DialogHeader className="space-y-4 pt-6">
          {/* Tier Badge */}
          <div className="flex items-center justify-center gap-2">
            {tier === 'luxury' && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/30 rounded-full">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-white font-semibold text-xs uppercase tracking-wider">
                  LUXURY EXPERIENCE
                </span>
              </div>
            )}
            {tier === 'premium' && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/30 rounded-full">
                <Star className="w-4 h-4 text-white" />
                <span className="text-white font-semibold text-xs uppercase tracking-wider">
                  PREMIUM SERVICE
                </span>
              </div>
            )}
            {tier === 'basic' && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/30 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span className="text-white font-semibold text-xs uppercase tracking-wider">
                  PROFESSIONAL QUALITY
                </span>
              </div>
            )}
          </div>

          {/* Service Name */}
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-center drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] px-4">
            {name}
          </h2>

          {/* Category & Duration */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-white/70 text-xs sm:text-sm px-4">
            {category && <span className="uppercase tracking-wider">{category}</span>}
            {duration && (
              <>
                <span className="text-white/40">•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  {duration} min
                </span>
              </>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Price Display */}
          <div className="text-center py-4 px-4">
            <div className="text-4xl sm:text-5xl font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
              ${price}
            </div>
            {tier === 'luxury' && (
              <p className="text-white/60 text-xs sm:text-sm mt-2">Investment in your transformation</p>
            )}
          </div>

          {/* Transformation Promise */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-6 mx-4">
            <h3 className="text-white font-bold mb-3 text-base sm:text-lg flex items-center gap-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              Your Transformation
            </h3>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              {displayTransformation}
            </p>
          </div>

          {/* Value Stack - Show different amounts based on tier */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-6 mx-4">
            <h3 className="text-white font-bold mb-4 text-base sm:text-lg">
              What's Included:
            </h3>
            <ul className="space-y-3">
              {displayFeatures.slice(0, showFullContent ? 6 : showMediumContent ? 4 : 3).map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-white/80">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Proof - Show for premium and luxury */}
          {(showMediumContent || showFullContent) && (
            <div className="bg-white/10 border border-white/20 rounded-lg p-4 sm:p-6 mx-4">
              <div className="flex items-center gap-2 mb-3">
                {Array.from({ length: displayTestimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-white text-white" />
                ))}
                <span className="text-white/60 text-xs sm:text-sm ml-2">Real Client Review</span>
              </div>
              <p className="text-white italic mb-2 leading-relaxed text-xs sm:text-sm">
                "{displayTestimonial.text}"
              </p>
              <p className="text-white/60 text-xs sm:text-sm">
                — {displayTestimonial.author}
              </p>
            </div>
          )}

          {/* Risk Reversal - Show for all tiers */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-6 mx-4">
            <h3 className="text-white font-bold mb-3 text-base sm:text-lg flex items-center gap-2">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
              Our Guarantee
            </h3>
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
              {tier === 'luxury'
                ? "Love your results or receive a complimentary luxury touch-up within 7 days. Your satisfaction is our priority."
                : tier === 'premium'
                ? "Not completely satisfied? We offer a free touch-up within 7 days, no questions asked."
                : "Satisfaction guaranteed. If you're not happy, we'll make it right within 7 days."}
            </p>
          </div>

          {/* Urgency - Only for luxury */}
          {showFullContent && (
            <div className="text-center py-2 px-4">
              <p className="text-white/60 text-xs sm:text-sm">
                ⏰ Limited availability • <span className="text-white font-semibold">Book now to secure your spot</span>
              </p>
            </div>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3 pt-4 border-t border-white/10 px-4">
          <Button
            onClick={() => {
              if (onConfirm) {
                // If custom onConfirm provided, use it (for backward compatibility)
                onConfirm();
              } else {
                // Otherwise, open booking router modal
                setShowBookingRouter(true);
              }
            }}
            size="lg"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base sm:text-lg py-5 sm:py-6 rounded-xl shadow-lg hover:shadow-emerald-500/50 transition-all"
          >
            Reserve Your Spot
          </Button>

          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full text-white/60 hover:text-white hover:bg-white/5 text-sm sm:text-base"
          >
            Maybe Later
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-6 pt-4 pb-2 text-white/40 text-[10px] sm:text-xs px-4">
          <span>✓ Same-day booking</span>
          <span className="hidden sm:inline">•</span>
          <span>✓ Easy rescheduling</span>
          <span className="hidden sm:inline">•</span>
          <span>✓ Secure payment</span>
        </div>
      </DialogContent>

      {/* Booking Router Modal */}
      <BookingRouterModal
        open={showBookingRouter}
        onClose={() => {
          setShowBookingRouter(false);
          onClose(); // Also close the value modal
        }}
        preSelectedService={serviceId}
        preSelectedTier={tierId}
      />
    </Dialog>
  );
};
