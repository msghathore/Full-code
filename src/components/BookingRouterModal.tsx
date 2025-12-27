import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Heart, Sparkles, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BookingRouterModalProps {
  open: boolean;
  onClose: () => void;
  preSelectedService?: string;
  preSelectedTier?: string;
}

export const BookingRouterModal = ({
  open,
  onClose,
  preSelectedService,
  preSelectedTier
}: BookingRouterModalProps) => {
  const navigate = useNavigate();

  const handleRouteSelection = (mode: 'vip' | 'returning' | 'new') => {
    console.log('[BookingRouterModal] Route selected:', mode);

    // Build query params
    const params = new URLSearchParams();
    params.set('mode', mode);
    if (preSelectedService) params.set('service', preSelectedService);
    if (preSelectedTier) params.set('tier', preSelectedTier);

    const queryString = params.toString();
    const route = `/booking${queryString ? `?${queryString}` : ''}`;

    console.log('[BookingRouterModal] Navigating to:', route);

    onClose();
    navigate(route);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-w-3xl bg-black border-2 border-white/20 text-white p-0 overflow-hidden",
        "shadow-[0_0_50px_rgba(255,255,255,0.1)]"
      )}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full p-2 hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-white" />
        </button>

        {/* Header */}
        <DialogHeader className="space-y-4 pt-8 pb-6 px-6 sm:px-8 border-b border-white/10">
          <DialogTitle className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-center drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
            Welcome to Zavira
          </DialogTitle>
          <p className="text-center text-white/70 text-base sm:text-lg">
            Let's find the perfect booking experience for you
          </p>
        </DialogHeader>

        {/* Routing Options */}
        <div className="grid md:grid-cols-3 gap-4 p-6 sm:p-8">
          {/* Option 1: VIP Member */}
          <button
            onClick={() => handleRouteSelection('vip')}
            aria-label="Select VIP Member booking - Fast-track with exclusive perks and priority scheduling"
            className="group relative bg-gradient-to-br from-slate-900/80 to-black/80 border-2 border-white/10 rounded-xl p-6 hover:border-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 text-left hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-black"
          >
            {/* VIP Badge */}
            <div className="absolute -top-3 -right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              FASTEST
            </div>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                <Crown className="w-8 h-8 text-white group-hover:text-emerald-400 transition-colors" />
              </div>

              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold mb-2 group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.6)] transition-all">
                  I'm a VIP Member
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Fast-track booking with exclusive member perks and priority scheduling
                </p>
              </div>

              <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                <span>Express Booking</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </button>

          {/* Option 2: Returning Customer */}
          <button
            onClick={() => handleRouteSelection('returning')}
            aria-label="Select Returning Customer - Book again and unlock VIP membership savings"
            className="group relative bg-gradient-to-br from-slate-900/80 to-black/80 border-2 border-white/10 rounded-xl p-6 hover:border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300 text-left hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
          >
            {/* Popular Badge */}
            <div className="absolute -top-3 -right-3 bg-white text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              POPULAR
            </div>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <Heart className="w-8 h-8 text-white transition-colors" />
              </div>

              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold mb-2 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all">
                  I've Been Here Before
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Welcome back! Book again and unlock VIP membership savings
                </p>
              </div>

              <div className="flex items-center gap-2 text-white text-sm font-semibold">
                <span>Book + Save</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </button>

          {/* Option 3: New Customer */}
          <button
            onClick={() => handleRouteSelection('new')}
            aria-label="Select First Visit - Let us guide you to your perfect transformation experience"
            className="group relative bg-gradient-to-br from-slate-900/80 to-black/80 border-2 border-white/10 rounded-xl p-6 hover:border-white/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 text-left hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <Sparkles className="w-8 h-8 text-white transition-colors" />
              </div>

              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold mb-2 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all">
                  This is My First Visit
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Let us guide you to your perfect transformation experience
                </p>
              </div>

              <div className="flex items-center gap-2 text-white/70 text-sm font-semibold">
                <span>Start Here</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </button>
        </div>

        {/* Footer Trust Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-4 px-6 border-t border-white/10 bg-white/5 text-white/40 text-xs sm:text-sm">
          <span className="flex items-center gap-1">
            ✓ Same-day booking available
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-1">
            ✓ Easy rescheduling
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-1">
            ✓ Secure payment
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
