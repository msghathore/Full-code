import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Gift, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LeadMagnet, LeadMagnetFormData } from '@/types/lead-magnets';

interface LeadMagnetPopupProps {
  /** Time in milliseconds before popup shows. Default: 30000 (30 seconds) */
  delayTime?: number;
  /** Enable exit-intent detection. Default: true */
  exitIntent?: boolean;
  /** Lead magnet to display. If not provided, fetches from database */
  leadMagnet?: LeadMagnet;
  /** Manual control - show popup */
  show?: boolean;
  /** Callback when popup is closed */
  onClose?: () => void;
}

export const LeadMagnetPopup = ({
  delayTime = 30000,
  exitIntent = true,
  leadMagnet: providedMagnet,
  show: manualShow,
  onClose,
}: LeadMagnetPopupProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leadMagnet, setLeadMagnet] = useState<LeadMagnet | null>(providedMagnet || null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LeadMagnetFormData>();

  // Fetch lead magnet from database if not provided
  useEffect(() => {
    if (!providedMagnet) {
      fetchLeadMagnet();
    }
  }, [providedMagnet]);

  const fetchLeadMagnet = async () => {
    try {
      const { data, error } = await supabase
        .from('lead_magnets')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      if (data) {
        setLeadMagnet(data as LeadMagnet);
      }
    } catch (error) {
      console.error('Error fetching lead magnet:', error);
    }
  };

  // Check if user has already seen popup in this session
  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem('leadMagnetShown');
    if (hasSeenPopup === 'true' || !leadMagnet) {
      return; // Don't show again this session or if no lead magnet
    }

    // Timer-based trigger
    const timer = setTimeout(() => {
      if (manualShow === undefined) {
        setIsOpen(true);
        sessionStorage.setItem('leadMagnetShown', 'true');
      }
    }, delayTime);

    // Exit intent detection
    const handleMouseLeave = (e: MouseEvent) => {
      const hasSeenNow = sessionStorage.getItem('leadMagnetShown');
      if (exitIntent && e.clientY <= 0 && hasSeenNow !== 'true' && manualShow === undefined) {
        setIsOpen(true);
        sessionStorage.setItem('leadMagnetShown', 'true');
      }
    };

    if (exitIntent) {
      document.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      clearTimeout(timer);
      if (exitIntent) {
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [delayTime, exitIntent, leadMagnet, manualShow]);

  // Manual control
  useEffect(() => {
    if (manualShow !== undefined) {
      setIsOpen(manualShow);
    }
  }, [manualShow]);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const onSubmit = async (data: LeadMagnetFormData) => {
    if (!leadMagnet) return;

    setIsSubmitting(true);
    try {
      // Save to database
      const { error } = await supabase
        .from('lead_magnet_downloads')
        .insert({
          lead_magnet_id: leadMagnet.id,
          customer_email: data.email,
          customer_name: data.name,
          customer_phone: data.phone || null,
        });

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Redirecting to your download...',
        duration: 2000,
      });

      // Store lead magnet claim in localStorage for promo discount
      localStorage.setItem('lead_magnet_claimed', 'true');
      localStorage.setItem('lead_magnet_email', data.email);

      // Reset form
      reset();

      // Close popup and navigate to download page
      setIsOpen(false);
      setTimeout(() => {
        navigate(`/download/${leadMagnet.slug}`);
      }, 500);
    } catch (error: any) {
      console.error('Error saving lead magnet download:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to process your request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!leadMagnet) return null;

  return (
    <AnimatePresence>
      {isOpen && (
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
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          >
            <div className="relative w-full max-w-lg bg-black border border-white/20 rounded-lg overflow-hidden max-h-[90vh] flex flex-col">
              {/* Close Button - Always visible */}
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 z-20 text-white/80 hover:text-white transition-colors bg-black/50 rounded-full p-1.5 backdrop-blur-sm"
                aria-label="Close popup"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Scrollable Content */}
              <div className="overflow-y-auto">
                {/* Preview Image */}
                {leadMagnet.preview_image && (
                  <div className="relative h-32 sm:h-48 overflow-hidden">
                    <img
                      src={leadMagnet.preview_image}
                      alt={leadMagnet.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
                  </div>
                )}

                {/* Content */}
                <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                  {/* Icon Badge */}
                  <div className="flex justify-center">
                    <div className="p-2 sm:p-3 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                      <Gift className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500" />
                    </div>
                  </div>

                  {/* Heading */}
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-serif text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                      {leadMagnet.title}
                    </h2>
                    <p className="text-white/70 text-sm">
                      {leadMagnet.description}
                    </p>
                  </div>

                {/* Benefits */}
                {leadMagnet.benefits && leadMagnet.benefits.length > 0 && (
                  <div className="space-y-2">
                    {leadMagnet.benefits.map((benefit, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <p className="text-white/80 text-sm">{benefit}</p>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Input
                      {...register('name', { required: 'Name is required' })}
                      placeholder="Your Name *"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-emerald-500/50"
                    />
                    {errors.name && (
                      <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <Input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      type="email"
                      placeholder="Your Email *"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-emerald-500/50"
                    />
                    {errors.email && (
                      <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Input
                      {...register('phone')}
                      type="tel"
                      placeholder="Phone Number (Optional)"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-emerald-500/50"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-serif text-base sm:text-lg py-4 sm:py-6 transition-all duration-300"
                  >
                    {isSubmitting ? (
                      'Processing...'
                    ) : (
                      <>
                        <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Get Free Download
                      </>
                    )}
                  </Button>

                  <p className="text-white/40 text-xs text-center">
                    We respect your privacy. Unsubscribe anytime.
                  </p>
                </form>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
