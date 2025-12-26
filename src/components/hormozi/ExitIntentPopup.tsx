import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Gift, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'exit_intent_shown';
const MINIMUM_TIME_ON_SITE = 30000; // 30 seconds
const OFFER_DURATION = 10 * 60 * 1000; // 10 minutes

interface ExitIntentPopupProps {
  onClose?: () => void;
}

export const ExitIntentPopup = ({ onClose }: ExitIntentPopupProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(OFFER_DURATION);
  const [hasBooked, setHasBooked] = useState(false);
  const [isOnExcludedPage, setIsOnExcludedPage] = useState(false);
  const { toast } = useToast();

  // Check if user has already booked
  useEffect(() => {
    const checkBookingStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from('appointments')
          .select('id')
          .eq('customer_id', session.user.id)
          .limit(1);

        if (data && data.length > 0) {
          setHasBooked(true);
        }
      }
    };

    checkBookingStatus();
  }, []);

  // Check if on excluded pages
  useEffect(() => {
    const excludedPaths = ['/booking', '/checkout', '/booking/checkout', '/shop/checkout'];
    const isExcluded = excludedPaths.some(path => window.location.pathname.includes(path));
    setIsOnExcludedPage(isExcluded);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1000) {
          handleClose();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  // Exit intent detection
  useEffect(() => {
    // Don't show if already shown in this session
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    // Don't show if user has booked
    if (hasBooked) return;

    // Don't show on excluded pages
    if (isOnExcludedPage) return;

    let timeOnSite = 0;
    const siteTimer = setInterval(() => {
      timeOnSite += 1000;
    }, 1000);

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse leaves from top of viewport
      if (e.clientY <= 10 && timeOnSite >= MINIMUM_TIME_ON_SITE) {
        setIsVisible(true);
        sessionStorage.setItem(STORAGE_KEY, 'true');

        // Track popup shown in database
        trackPopupShown();
      }
    };

    // Mobile: detect back button attempt
    const handlePopState = () => {
      if (timeOnSite >= MINIMUM_TIME_ON_SITE) {
        setIsVisible(true);
        sessionStorage.setItem(STORAGE_KEY, 'true');
        trackPopupShown();
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('popstate', handlePopState);

    return () => {
      clearInterval(siteTimer);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasBooked, isOnExcludedPage]);

  const trackPopupShown = async () => {
    try {
      await supabase.from('exit_intent_conversions').insert({
        customer_email: null,
        offer_claimed: false,
      });
    } catch (error) {
      console.error('Failed to track popup shown:', error);
    }
  };

  const handleClose = useCallback(() => {
    setIsVisible(false);
    onClose?.();
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Track conversion in database
      await supabase.from('exit_intent_conversions').insert({
        customer_email: email,
        offer_claimed: true,
      });

      // Send notification email (via Edge Function)
      await supabase.functions.invoke('send-exit-intent-offer', {
        body: { email },
      });

      toast({
        title: '🎉 Offer Claimed!',
        description: 'Check your email for your exclusive 20% off code!',
      });

      // Store email in localStorage for pre-fill on booking
      localStorage.setItem('exit_intent_email', email);

      handleClose();
    } catch (error) {
      console.error('Failed to claim offer:', error);
      toast({
        title: 'Error',
        description: 'Failed to claim offer. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-black border-2 border-white rounded-lg shadow-2xl relative overflow-hidden"
              style={{
                boxShadow: '0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,255,0.3), 0 0 60px rgba(255,255,255,0.1)'
              }}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/10 pointer-events-none" />

              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-white hover:text-white/80 transition-colors z-10 bg-black/50 hover:bg-black/70 rounded-full p-2"
                aria-label="Close popup"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="p-8 relative z-10">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <Gift className="w-16 h-16 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                    <Sparkles className="w-6 h-6 text-white absolute -top-2 -right-2 animate-pulse drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                  </div>
                </div>

                {/* Headline */}
                <h2
                  className="text-3xl md:text-4xl font-serif font-bold text-center mb-2 text-white"
                  style={{
                    textShadow: '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.6), 0 0 30px rgba(255,255,255,0.4)'
                  }}
                >
                  WAIT! Don't Miss This
                </h2>
                <h3
                  className="text-2xl md:text-3xl font-serif font-bold text-center mb-6 text-white"
                  style={{
                    textShadow: '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.6), 0 0 30px rgba(255,255,255,0.4)'
                  }}
                >
                  Special Offer
                </h3>

                {/* Offer details */}
                <div className="bg-slate-950 border border-white/30 rounded-lg p-6 mb-6">
                  <p className="text-white text-center text-lg mb-4">
                    Get <span className="font-bold text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">20% OFF</span> your first booking
                  </p>
                  <p className="text-white/80 text-center text-sm">
                    OR choose a <span className="text-white font-semibold drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]">FREE upgrade</span> to premium services
                  </p>
                </div>

                {/* Countdown timer */}
                <div className="flex items-center justify-center gap-2 mb-6 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                  <Clock className="w-5 h-5 animate-pulse" />
                  <span className="font-mono text-xl font-bold">
                    Offer expires in {formatTime(timeRemaining)}
                  </span>
                </div>

                {/* Email capture form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-slate-950 border-white/50 text-white placeholder:text-white/40 focus:border-white focus:ring-2 focus:ring-white/50 h-12 text-center"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-white hover:bg-white/90 text-black font-bold h-12 text-lg transition-all transform hover:scale-105"
                    style={{
                      boxShadow: '0 0 20px rgba(255,255,255,0.6), 0 0 30px rgba(255,255,255,0.4)'
                    }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Claiming Offer...' : 'Claim My Exclusive Offer'}
                  </Button>
                </form>

                {/* Trust indicators */}
                <p className="text-white/60 text-xs text-center mt-4">
                  Join 2,000+ satisfied customers • No spam, ever
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
