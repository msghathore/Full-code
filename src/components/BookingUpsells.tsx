import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { X, Plus, Sparkles, TrendingUp, Clock, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ServiceUpsell {
  id: string;
  parent_service_id: string;
  upsell_service_id: string;
  upsell_type: 'bundle' | 'addon' | 'upgrade' | 'complementary';
  discount_percentage: number;
  pitch_text: string;
  display_order: number;
  times_shown: number;
  times_accepted: number;
}

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  category: string;
  image_url?: string;
}

interface ServiceWithDiscount {
  serviceId: string;
  discount?: {
    type: 'upsell';
    percentage: number;
    originalPrice: number;
    discountedPrice: number;
    reason: string;
  };
}

interface BookingUpsellsProps {
  selectedServiceIds: string[];
  onAddService: (serviceData: ServiceWithDiscount) => void;
  services: Service[];
  className?: string;
}

export const BookingUpsells = ({
  selectedServiceIds,
  onAddService,
  services,
  className
}: BookingUpsellsProps) => {
  const [dismissedUpsells, setDismissedUpsells] = useState<Set<string>>(new Set());
  const [showUpsells, setShowUpsells] = useState(true);

  // Fetch upsells for selected services
  const { data: upsells, isLoading } = useQuery({
    queryKey: ['service-upsells', selectedServiceIds],
    queryFn: async () => {
      if (selectedServiceIds.length === 0) return [];

      // Generate smart upsells based on selected services
      const generatedUpsells: (ServiceUpsell & { upsell_service: Service })[] = [];

      for (const selectedId of selectedServiceIds) {
        const selectedService = services.find(s => s.id === selectedId);
        if (!selectedService) continue;

        // Find complementary services based on category and name
        const category = selectedService.category;
        const name = selectedService.name.toLowerCase();

        // Haircut -> Add color/highlights
        if (name.includes('haircut') || name.includes('cut')) {
          const colorServices = services.filter(s =>
            (s.name.toLowerCase().includes('highlight') ||
             s.name.toLowerCase().includes('color') ||
             s.name.toLowerCase().includes('toner')) &&
            s.id !== selectedId
          );

          colorServices.slice(0, 2).forEach((service, idx) => {
            generatedUpsells.push({
              id: `generated-${selectedId}-${service.id}`,
              parent_service_id: selectedId,
              upsell_service_id: service.id,
              upsell_type: 'addon',
              discount_percentage: 15,
              pitch_text: `Add ${service.name} to your new haircut - Save 15%! Popular combination.`,
              display_order: idx + 1,
              times_shown: 0,
              times_accepted: 0,
              upsell_service: service
            });
          });
        }

        // Manicure -> Pedicure or vice versa
        if (name.includes('manicure')) {
          const pedicure = services.find(s =>
            s.name.toLowerCase().includes('pedicure') && s.id !== selectedId
          );
          if (pedicure) {
            generatedUpsells.push({
              id: `generated-${selectedId}-${pedicure.id}`,
              parent_service_id: selectedId,
              upsell_service_id: pedicure.id,
              upsell_type: 'bundle',
              discount_percentage: 25,
              pitch_text: 'Complete your spa day! Add a pedicure for ultimate pampering - Save 25%',
              display_order: 1,
              times_shown: 0,
              times_accepted: 0,
              upsell_service: pedicure
            });
          }
        }

        if (name.includes('pedicure')) {
          const manicure = services.find(s =>
            s.name.toLowerCase().includes('manicure') && s.id !== selectedId
          );
          if (manicure) {
            generatedUpsells.push({
              id: `generated-${selectedId}-${manicure.id}`,
              parent_service_id: selectedId,
              upsell_service_id: manicure.id,
              upsell_type: 'bundle',
              discount_percentage: 25,
              pitch_text: 'Don\'t forget your hands! Add a manicure to complete your look - Save 25%',
              display_order: 1,
              times_shown: 0,
              times_accepted: 0,
              upsell_service: manicure
            });
          }
        }

        // Facial -> Massage
        if (name.includes('facial')) {
          const massage = services.find(s =>
            s.name.toLowerCase().includes('massage') && s.id !== selectedId
          );
          if (massage) {
            generatedUpsells.push({
              id: `generated-${selectedId}-${massage.id}`,
              parent_service_id: selectedId,
              upsell_service_id: massage.id,
              upsell_type: 'complementary',
              discount_percentage: 20,
              pitch_text: 'Enhance your relaxation with a soothing massage - Perfect combination! Save 20%',
              display_order: 1,
              times_shown: 0,
              times_accepted: 0,
              upsell_service: massage
            });
          }
        }

        // Color services -> Toner
        if (name.includes('color') || name.includes('highlight')) {
          const toner = services.find(s =>
            s.name.toLowerCase().includes('toner') && s.id !== selectedId
          );
          if (toner) {
            generatedUpsells.push({
              id: `generated-${selectedId}-${toner.id}`,
              parent_service_id: selectedId,
              upsell_service_id: toner.id,
              upsell_type: 'addon',
              discount_percentage: 15,
              pitch_text: 'Lock in your color with professional toner & gloss - Save 15%',
              display_order: 1,
              times_shown: 0,
              times_accepted: 0,
              upsell_service: toner
            });
          }
        }

        // Waxing -> Additional waxing areas
        if (name.includes('wax')) {
          const otherWaxing = services.filter(s =>
            s.name.toLowerCase().includes('wax') && s.id !== selectedId
          );

          otherWaxing.slice(0, 1).forEach(service => {
            generatedUpsells.push({
              id: `generated-${selectedId}-${service.id}`,
              parent_service_id: selectedId,
              upsell_service_id: service.id,
              upsell_type: 'addon',
              discount_percentage: 30,
              pitch_text: `Add ${service.name} while you're here - Save 30%! Quick and convenient.`,
              display_order: 1,
              times_shown: 0,
              times_accepted: 0,
              upsell_service: service
            });
          });
        }
      }

      return generatedUpsells;
    },
    enabled: selectedServiceIds.length > 0
  });

  // Filter out already selected services and dismissed upsells
  const availableUpsells = upsells?.filter(
    upsell =>
      !selectedServiceIds.includes(upsell.upsell_service_id) &&
      !dismissedUpsells.has(upsell.id)
  ) || [];

  // Track conversion when service is added
  const handleAddService = (upsell: ServiceUpsell & { upsell_service: Service }) => {
    const service = upsell.upsell_service;
    const discountedPrice = calculateDiscountedPrice(service.price, upsell.discount_percentage);

    // Pass service with discount metadata
    onAddService({
      serviceId: upsell.upsell_service_id,
      discount: {
        type: 'upsell',
        percentage: upsell.discount_percentage,
        originalPrice: service.price,
        discountedPrice: discountedPrice,
        reason: upsell.pitch_text
      }
    });

    // Track acceptance (conversion) - for generated upsells, just log to console
    console.log(`Upsell accepted: ${service.name} (${upsell.upsell_type})`);

    // Dismiss this upsell
    setDismissedUpsells(prev => new Set(prev).add(upsell.id));
  };

  const handleDismiss = (upsellId: string) => {
    setDismissedUpsells(prev => new Set(prev).add(upsellId));
  };

  const handleDismissAll = () => {
    setShowUpsells(false);
  };

  // Reset dismissed when selected services change
  useEffect(() => {
    setDismissedUpsells(new Set());
    setShowUpsells(true);
  }, [selectedServiceIds.join(',')]);

  if (isLoading || !showUpsells || availableUpsells.length === 0) {
    return null;
  }

  const getUpsellTypeIcon = (type: ServiceUpsell['upsell_type']) => {
    switch (type) {
      case 'bundle':
        return <Sparkles className="w-5 h-5" />;
      case 'addon':
        return <Plus className="w-5 h-5" />;
      case 'upgrade':
        return <TrendingUp className="w-5 h-5" />;
      case 'complementary':
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const getUpsellTypeLabel = (type: ServiceUpsell['upsell_type']) => {
    switch (type) {
      case 'bundle':
        return 'BUNDLE & SAVE';
      case 'addon':
        return 'POPULAR ADD-ON';
      case 'upgrade':
        return 'UPGRADE';
      case 'complementary':
        return 'PERFECT PAIRING';
    }
  };

  const getUpsellTypeBadgeColor = (type: ServiceUpsell['upsell_type']) => {
    switch (type) {
      case 'bundle':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'addon':
        return 'bg-white/10/20 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] border-white/30/50';
      case 'upgrade':
        return 'bg-violet-500/20 text-violet-400 border-violet-500/50';
      case 'complementary':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
    }
  };

  const calculateDiscountedPrice = (originalPrice: number, discount: number) => {
    return originalPrice * (1 - discount / 100);
  };

  const calculateSavings = (originalPrice: number, discount: number) => {
    return originalPrice * (discount / 100);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn("w-full", className)}
      >
        <div className="bg-gradient-to-br from-slate-900/80 to-black/80 backdrop-blur border-2 border-emerald-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Sparkles className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-serif text-2xl font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
                  Frequently Added Together
                </h3>
                <p className="text-white/60 text-sm">
                  Enhance your experience with these popular combinations
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismissAll}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Upsell Cards */}
          <div className="grid gap-4">
            {availableUpsells.map((upsell, index) => {
              const service = upsell.upsell_service;
              const discountedPrice = calculateDiscountedPrice(service.price, upsell.discount_percentage);
              const savings = calculateSavings(service.price, upsell.discount_percentage);

              return (
                <motion.div
                  key={upsell.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="bg-black/40 border border-white/10 rounded-xl p-4 hover:border-emerald-500/50 transition-all duration-300">
                    <div className="flex gap-4">
                      {/* Service Image */}
                      {service.image_url && (
                        <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-slate-800">
                          <img
                            src={service.image_url}
                            alt={service.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Type Badge */}
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider mb-2",
                          getUpsellTypeBadgeColor(upsell.upsell_type)
                        )}>
                          {getUpsellTypeIcon(upsell.upsell_type)}
                          {getUpsellTypeLabel(upsell.upsell_type)}
                        </div>

                        {/* Service Name */}
                        <h4 className="font-serif text-lg font-bold text-white mb-1">
                          {service.name}
                        </h4>

                        {/* Pitch Text */}
                        <p className="text-white/80 text-sm mb-3">
                          {upsell.pitch_text}
                        </p>

                        {/* Service Details */}
                        <div className="flex items-center gap-4 text-sm text-white/60 mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{service.duration_minutes} min</span>
                          </div>
                          {service.description && (
                            <span className="truncate">{service.description}</span>
                          )}
                        </div>

                        {/* Pricing and CTA */}
                        <div className="flex items-center justify-between gap-4">
                          {/* Price */}
                          <div className="flex items-baseline gap-2">
                            <span className="text-white/40 line-through text-lg">
                              ${service.price.toFixed(2)}
                            </span>
                            <span className="text-2xl font-bold text-emerald-400">
                              ${discountedPrice.toFixed(2)}
                            </span>
                            <span className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/50 rounded text-emerald-400 text-xs font-bold">
                              SAVE ${savings.toFixed(0)} ({upsell.discount_percentage}% OFF)
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDismiss(upsell.id)}
                              className="text-white/60 hover:text-white hover:bg-white/10"
                            >
                              No thanks
                            </Button>
                            <Button
                              onClick={() => handleAddService(upsell)}
                              size="sm"
                              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold shadow-lg hover:shadow-emerald-500/50 transition-all"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Add to Booking
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="mt-4 text-center text-white/40 text-xs">
            ✓ Limited time discounts • ✓ Can be added anytime • ✓ No commitment required
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
