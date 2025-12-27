import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CountdownTimer } from './CountdownTimer';
import { SocialProofNotification } from './SocialProofNotification';
import { CheckCircle2, Sparkles, TrendingUp, ArrowRight, Zap, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PriceAnchoring } from '@/components/PriceAnchoring';

/**
 * ALEX HORMOZI'S GRAND SLAM OFFERS - SIMPLIFIED TO 3 CORE TIERS
 *
 * TIER 1: Entry ($149) - "The First-Timer's Transformation"
 * TIER 2: Core ($249-299) - "The Complete Makeover"
 * TIER 3: Premium ($797) - "3-Month Transformation Package"
 *
 * HORMOZI PRINCIPLES APPLIED:
 * - Outcome-based headlines (not feature-based)
 * - Emotional taglines (desire/pain point driven)
 * - Before/After format descriptions
 * - Specific numbered bonuses with dollar values
 * - Strong scarcity & urgency
 * - Social proof integrated
 */

// The 3 Core Offers - Hormozi Style (Hardcoded for now, can be database-driven later)
const CORE_OFFERS = [
  {
    id: 'tier-1-entry',
    tier: 'ENTRY',
    badge: '🌟 PERFECT FOR FIRST-TIMERS',
    headline: 'The First-Timer\'s Transformation',
    tagline: 'Look $240 Better for $149',
    description: 'Walk in stressed and uncertain. Walk out glowing, confident, and ready to conquer. Your first visit will prove why 500+ clients never go anywhere else. We guarantee it or it\'s free.',
    regularPrice: 240,
    discountedPrice: 149,
    savingsAmount: 91,
    savingsPercentage: 38,
    includedServices: [
      { name: '💇‍♀️ Signature Haircut & Style', duration: '60 min', value: 65 },
      { name: '💆‍♀️ Stress-Melting Massage', duration: '30 min', value: 80 },
      { name: '✨ Age-Defying Facial', duration: '45 min', value: 95 }
    ],
    bonuses: [
      { number: 1, name: '$60 Take-Home Product Kit', detail: 'yours to keep' },
      { number: 2, name: 'VIP Fast-Track Booking', detail: 'skip the 2-week waitlist' },
      { number: 3, name: '10% Lifetime Discount Code', detail: 'use forever' }
    ],
    limitedSpots: 50,
    remainingSpots: 42,
    isFeatured: true,
    ctaText: 'START YOUR TRANSFORMATION'
  },
  {
    id: 'tier-2-makeover',
    tier: 'TRANSFORMATION',
    badge: '💅 MOST POPULAR',
    headline: 'The Complete Makeover',
    tagline: 'Bad Hair to Best Hair',
    description: 'Stop hiding under hats. Start turning heads. Get the hair you\'ve been dreaming about for YEARS. Complete color transformation + cut + conditioning. This is the "ex-revenge" package our clients swear by.',
    regularPrice: 500,
    discountedPrice: 299,
    savingsAmount: 201,
    savingsPercentage: 40,
    includedServices: [
      { name: '💇‍♀️ Premium Haircut & Style', duration: '60 min', value: 75 },
      { name: '🎨 Full Color Treatment', duration: '120 min', value: 120 },
      { name: '💧 Deep Conditioning Repair', duration: '30 min', value: 45 },
      { name: '💨 Professional Blowout & Style', duration: '45 min', value: 60 },
      { name: '👩‍🔬 Expert Hair Consultation', duration: '30 min', value: 40 }
    ],
    bonuses: [
      { number: 1, name: 'FREE Hair Care Product Kit', detail: '$60 value - yours to keep' },
      { number: 2, name: 'FREE Touch-up Color', detail: 'within 6 weeks - $80 value' },
      { number: 3, name: 'Priority Booking Access', detail: 'skip the line forever' }
    ],
    limitedSpots: 20,
    remainingSpots: 18,
    isFeatured: false,
    ctaText: 'BOOK MY MAKEOVER'
  },
  {
    id: 'tier-3-vip',
    tier: 'PREMIUM',
    badge: '👑 BEST VALUE',
    headline: '3-Month Transformation Journey',
    tagline: 'Your Journey to Radiance - 40% Savings',
    description: 'This isn\'t just beauty treatments. This is a 90-day commitment to becoming the best version of yourself. Unlimited monthly services. Personal transformation plan. Results guaranteed or full refund.',
    regularPrice: 1347,
    discountedPrice: 797,
    savingsAmount: 550,
    savingsPercentage: 41,
    includedServices: [
      { name: '📅 3 Months of Unlimited Services', detail: 'up to $449/month value - $1,347 total' },
      { name: '👩‍⚕️ Personalized Beauty Consultation', detail: 'custom transformation roadmap' },
      { name: '📊 Monthly Check-ins with Master Stylist', detail: 'track your progress' },
      { name: '📸 Before & After Photo Shoot', detail: 'professional documentation' }
    ],
    bonuses: [
      { number: 1, name: 'Free Product Starter Kit', detail: '$150 value' },
      { number: 2, name: 'VIP Priority Booking', detail: 'never wait again' },
      { number: 3, name: 'Exclusive Transformation Photo Shoot', detail: '$200 value - celebrate your results' }
    ],
    limitedSpots: 10,
    remainingSpots: 7,
    isFeatured: true,
    ctaText: 'START MY JOURNEY'
  }
];

export const GrandSlamOffersSimplified = () => {
  const navigate = useNavigate();

  const handleBookPackage = (packageId: string) => {
    // Find the full package object
    const selectedOffer = CORE_OFFERS.find(offer => offer.id === packageId);

    if (selectedOffer) {
      // Store complete package object for booking flow
      const packageForBooking = {
        id: selectedOffer.id,
        name: selectedOffer.headline,
        regular_price: selectedOffer.regularPrice,
        discounted_price: selectedOffer.discountedPrice,
        savings_amount: selectedOffer.savingsAmount,
        description: selectedOffer.description
      };

      localStorage.setItem('selectedPackage', JSON.stringify(packageForBooking));
    }

    navigate('/booking?package=' + packageId);
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-black via-slate-950 to-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header - Hormozi Style */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/30 rounded-full mb-6"
          >
            <Sparkles className="w-5 h-5 text-white" />
            <span className="text-white font-semibold text-sm uppercase tracking-wider">
              LIMITED TIME OFFERS
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-serif text-5xl md:text-6xl font-bold mb-6 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
          >
            GRAND SLAM OFFERS
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl text-white/80 max-w-3xl mx-auto mb-8"
          >
            Irresistible packages that would be crazy to pass up.
            <span className="text-white font-bold"> Save hundreds</span> on your transformation today.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <SocialProofNotification type="booked" className="justify-center" />
          </motion.div>
        </div>

        {/* The 3 Core Offers - Simplified */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
          {CORE_OFFERS.map((offer, index) => (
            <PackageCard
              key={offer.id}
              offer={offer}
              onBook={() => handleBookPackage(offer.id)}
              index={index}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-center mt-16"
        >
          <p className="text-white/60 text-sm mb-6 flex items-center justify-center gap-2">
            <Zap className="w-5 h-5 text-white" />
            These offers won't last forever. Book now before spots fill up.
          </p>
          <CountdownTimer size="lg" className="justify-center mb-8" />

          <Button
            onClick={() => navigate('/packages')}
            variant="outline"
            className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-6 text-lg font-semibold rounded-full inline-flex items-center gap-2"
          >
            View All Packages
            <ArrowRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

// Package Card Component - Hormozi Style
interface PackageCardProps {
  offer: typeof CORE_OFFERS[0];
  onBook: () => void;
  index: number;
}

const PackageCard = ({ offer, onBook, index }: PackageCardProps) => {
  const spotsRemaining = offer.remainingSpots;
  const almostGone = spotsRemaining <= 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.2 }}
      whileHover={{ scale: 1.02, y: -8 }}
      className={`relative rounded-2xl border-2 p-8 transition-all duration-300 bg-gradient-to-br from-slate-900/80 to-black/80 backdrop-blur ${
        offer.isFeatured
          ? 'border-white shadow-[0_0_30px_rgba(255,255,255,0.3)]'
          : 'border-white/10 hover:border-white/50'
      }`}
    >
      {/* Featured Badge */}
      {offer.isFeatured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-white to-white/90 rounded-full">
          <span className="text-black font-bold text-sm uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            BEST VALUE
          </span>
        </div>
      )}

      {/* Package Type Badge & Almost Gone */}
      <div className="flex items-center justify-between mb-4">
        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-white/60 text-xs uppercase tracking-wider">
          {offer.badge}
        </span>
        {almostGone && (
          <span className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full text-red-400 text-xs font-bold animate-pulse flex items-center gap-1">
            🔥 {spotsRemaining} SPOTS LEFT
          </span>
        )}
      </div>

      {/* Headline - Hormozi Style (Outcome-Based) */}
      <h3 className="font-serif text-3xl font-bold mb-2 drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
        {offer.headline}
      </h3>

      {/* Tagline - Benefit-Driven */}
      <p className="text-white font-semibold text-lg mb-6">
        {offer.tagline}
      </p>

      {/* Pricing - Enhanced */}
      <div className="mb-6">
        <PriceAnchoring
          regularPrice={offer.regularPrice}
          currentPrice={offer.discountedPrice}
          size="xl"
          badgeText="LIMITED TIME"
        />

        {/* Value Proposition */}
        <div className="mt-4 p-3 bg-white/10 border border-white/30 rounded-lg">
          <div className="flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5" />
            <span className="font-bold text-sm">
              Total Value: ${offer.regularPrice} • You Pay: ${offer.discountedPrice}
            </span>
          </div>
        </div>
      </div>

      {/* Description - Before/After Format */}
      <p className="text-white/70 mb-6 leading-relaxed">
        {offer.description}
      </p>

      {/* Included Services - Hormozi Style (Benefit-focused names) */}
      <div className="mb-6">
        <h4 className="text-white font-bold mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-white" />
          What You Get:
        </h4>
        <ul className="space-y-2">
          {offer.includedServices.map((service, idx) => (
            <li key={idx} className="flex items-start gap-2 text-white/80 text-sm">
              <span className="text-white mt-0.5">✓</span>
              <div>
                <span className="font-semibold">{service.name}</span>
                {service.duration && (
                  <span className="text-white/50"> ({service.duration})</span>
                )}
                {service.value && (
                  <span className="text-white"> - ${service.value} value</span>
                )}
                {service.detail && (
                  <span className="text-white/60"> - {service.detail}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Bonuses - Numbered & Specific */}
      <div className="mb-8 p-4 bg-white/5 border border-white/20 rounded-lg">
        <h4 className="text-white font-bold mb-3 flex items-center gap-2">
          <Gift className="w-5 h-5 text-white" />
          BONUS - You Also Get:
        </h4>
        <ul className="space-y-2">
          {offer.bonuses.map((bonus, idx) => (
            <li key={idx} className="flex items-start gap-2 text-white text-sm">
              <span className="bg-white/20 text-white font-bold px-2 py-0.5 rounded text-xs flex-shrink-0">
                #{bonus.number}
              </span>
              <div>
                <span className="font-semibold">{bonus.name}</span>
                <span className="text-white/60"> ({bonus.detail})</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Limited Spots Indicator */}
      <div className="mb-6 p-3 bg-white/5 border border-white/10 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/70 text-sm font-semibold">Availability:</span>
          <span className={`text-sm font-bold ${almostGone ? 'text-red-400' : 'text-white'}`}>
            {spotsRemaining} of {offer.limitedSpots} spots left
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              almostGone ? 'bg-red-500' : 'bg-white'
            }`}
            style={{ width: `${(spotsRemaining / offer.limitedSpots) * 100}%` }}
          />
        </div>
      </div>

      {/* CTA Button */}
      <Button
        onClick={onBook}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-6 text-lg font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)]"
      >
        {offer.ctaText}
      </Button>

      {/* Trust Indicators */}
      <p className="text-white/60 text-xs text-center mt-4">
        ✓ 100% Satisfaction Guaranteed • ✓ Book in 60 seconds
      </p>
    </motion.div>
  );
};
