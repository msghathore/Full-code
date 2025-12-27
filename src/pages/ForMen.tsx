import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock, Shield, Star, TrendingUp, Users, Zap } from 'lucide-react';
import { CountdownTimer, SocialProofNotification } from '@/components/hormozi';
import { PriceAnchoring } from '@/components/PriceAnchoring';

/**
 * FOR MEN - LANDING PAGE
 *
 * HORMOZI PRINCIPLES:
 * - Masculine, results-focused copy
 * - Addresses male-specific pain points (looking tired, unkempt, unprofessional)
 * - Outcome-based headlines
 * - Social proof from executives and professionals
 * - Time-saving value prop
 */

const MEN_PACKAGES = [
  {
    id: 'executive-grooming',
    badge: '🏆 MOST POPULAR FOR MEN',
    headline: 'The Executive Grooming Experience',
    tagline: 'From Tired to Tiger in 90 Minutes',
    description: 'Look like you just stepped out of a boardroom photoshoot. Professional haircut, hot towel shave, stress-melting massage. The grooming standard for high-performers.',
    regularPrice: 220,
    discountedPrice: 165,
    savingsPercentage: 25,
    includedServices: [
      { name: '✂️ Premium Executive Haircut', duration: '45 min', value: 75 },
      { name: '🪒 Classic Hot Towel Shave', duration: '30 min', value: 60 },
      { name: '💆‍♂️ Shoulder & Neck Massage', duration: '15 min', value: 45 },
      { name: '🧴 Premium Grooming Products', detail: 'beard oil, styling clay' }
    ],
    bonuses: [
      { number: 1, name: 'Executive Product Kit', detail: '$50 value - yours to keep' },
      { number: 2, name: 'Priority Booking Status', detail: 'skip the 2-week wait' },
      { number: 3, name: 'Monthly Touch-Up Discount', detail: '15% off all future visits' }
    ],
    limitedSpots: 15,
    remainingSpots: 11,
    ctaText: 'BOOK EXECUTIVE PACKAGE'
  },
  {
    id: 'quick-professional',
    badge: '⚡ BEST FOR BUSY PROFESSIONALS',
    headline: 'The Quick Professional',
    tagline: 'Sharp & Ready in 30 Minutes',
    description: 'No time to waste. Get in, get groomed, get out. Professional haircut that makes you look like you have your life together. Perfect for the man on the move.',
    regularPrice: 85,
    discountedPrice: 65,
    savingsPercentage: 24,
    includedServices: [
      { name: '✂️ Express Haircut', duration: '25 min', value: 60 },
      { name: '🧔 Beard Trim & Shape', duration: '10 min', value: 25 }
    ],
    bonuses: [
      { number: 1, name: 'Same-Day Booking Priority', detail: 'last-minute appointments available' },
      { number: 2, name: 'Free Styling Product Sample', detail: '$15 value' }
    ],
    limitedSpots: 25,
    remainingSpots: 20,
    ctaText: 'BOOK QUICK GROOMING'
  },
  {
    id: 'first-impression',
    badge: '💼 PERFECT FOR INTERVIEWS & DATES',
    headline: 'The First Impression Package',
    tagline: 'Look Your Absolute Best When It Matters',
    description: 'Job interview tomorrow? First date this weekend? Stop stressing about your appearance. Walk in looking average. Walk out looking like a million bucks. Guaranteed confidence boost.',
    regularPrice: 180,
    discountedPrice: 135,
    savingsPercentage: 25,
    includedServices: [
      { name: '✂️ Precision Haircut & Style', duration: '45 min', value: 75 },
      { name: '🪒 Clean Shave or Beard Sculpt', duration: '20 min', value: 50 },
      { name: '🧴 Premium Skincare Treatment', duration: '20 min', value: 55 }
    ],
    bonuses: [
      { number: 1, name: 'Style Consultation', detail: 'personalized grooming advice' },
      { number: 2, name: 'Emergency Rebooking', detail: 'messed it up? We fix it free' }
    ],
    limitedSpots: 10,
    remainingSpots: 7,
    ctaText: 'BOOK FIRST IMPRESSION'
  }
];

const ForMen = () => {
  const navigate = useNavigate();

  const handleBookPackage = (packageId: string) => {
    // Find the full package object
    const selectedPkg = MEN_PACKAGES.find(pkg => pkg.id === packageId);

    if (selectedPkg) {
      // Store complete package object for booking flow
      const packageForBooking = {
        id: selectedPkg.id,
        name: selectedPkg.headline,
        regular_price: selectedPkg.regularPrice,
        discounted_price: selectedPkg.discountedPrice,
        savings_amount: selectedPkg.regularPrice - selectedPkg.discountedPrice,
        description: selectedPkg.description
      };

      localStorage.setItem('selectedPackage', JSON.stringify(packageForBooking));
    }

    navigate('/booking?package=' + packageId);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 bg-gradient-to-b from-black via-slate-950 to-black">
        <div className="max-w-7xl mx-auto">
          {/* Overline */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/30 rounded-full text-white font-semibold text-sm uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              FOR HIGH-PERFORMING MEN
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-center mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]"
          >
            STOP LOOKING TIRED.
            <br />
            <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
              START LOOKING SHARP.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl text-white/80 text-center max-w-4xl mx-auto mb-8 leading-relaxed"
          >
            Your appearance is your first impression. You only get one shot.
            <br />
            <span className="text-white font-semibold">
              Premium grooming for men who refuse to look average.
            </span>
          </motion.p>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-12"
          >
            <SocialProofNotification type="booked" className="justify-center" />
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12"
          >
            <StatCard icon={<Users />} value="1,200+" label="Men Served" />
            <StatCard icon={<Star />} value="4.9/5" label="Average Rating" />
            <StatCard icon={<Clock />} value="30-90" label="Min Sessions" />
            <StatCard icon={<Shield />} value="100%" label="Satisfaction" />
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="text-center"
          >
            <Button
              onClick={() => navigate('/booking')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-6 text-lg font-bold inline-flex items-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.4)]"
            >
              BOOK YOUR GROOMING SESSION
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-black via-slate-950 to-black">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="font-serif text-4xl md:text-5xl font-bold mb-6 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
            >
              CHOOSE YOUR GROOMING PACKAGE
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-white/80 max-w-3xl mx-auto"
            >
              Every package includes premium products, expert service, and a guarantee you'll leave looking better than you arrived.
            </motion.p>
          </div>

          {/* Package Cards */}
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {MEN_PACKAGES.map((pkg, index) => (
              <PackageCard
                key={pkg.id}
                package={pkg}
                onBook={() => handleBookPackage(pkg.id)}
                index={index}
              />
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <CountdownTimer size="lg" className="justify-center mb-8" />
            <p className="text-white/60 text-sm mb-6">
              ⚡ Limited spots available. Book now before they're gone.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 px-4 bg-slate-950">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-4xl md:text-5xl font-bold text-center mb-12 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
          >
            WHY MEN CHOOSE ZAVIRA
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8">
            <BenefitCard
              icon={<Clock />}
              title="Time-Efficient"
              description="No wasted time. Quick 30-min sessions or comprehensive 90-min experiences. Your schedule, your choice."
            />
            <BenefitCard
              icon={<Star />}
              title="Expert Barbers"
              description="Trained specialists who understand men's grooming. Not a generic salon - this is for men only."
            />
            <BenefitCard
              icon={<Shield />}
              title="Satisfaction Guaranteed"
              description="Not happy with your cut? We'll fix it free or refund you 100%. No questions asked."
            />
            <BenefitCard
              icon={<TrendingUp />}
              title="Results-Focused"
              description="Walk in looking average. Walk out looking like you just stepped off a yacht. Guaranteed transformation."
            />
          </div>
        </div>
      </section>
    </div>
  );
};

// Package Card Component
interface PackageCardProps {
  package: typeof MEN_PACKAGES[0];
  onBook: () => void;
  index: number;
}

const PackageCard = ({ package: pkg, onBook, index }: PackageCardProps) => {
  const almostGone = pkg.remainingSpots <= 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.2 }}
      whileHover={{ scale: 1.02, y: -8 }}
      className="relative rounded-2xl border-2 border-white/10 hover:border-white/50 p-8 transition-all duration-300 bg-gradient-to-br from-slate-900/80 to-black/80 backdrop-blur"
    >
      {/* Badge */}
      <div className="mb-4">
        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-white/60 text-xs uppercase tracking-wider">
          {pkg.badge}
        </span>
      </div>

      {/* Almost Gone Indicator */}
      {almostGone && (
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full text-red-400 text-xs font-bold animate-pulse flex items-center gap-1">
            🔥 {pkg.remainingSpots} SPOTS LEFT
          </span>
        </div>
      )}

      {/* Headline */}
      <h3 className="font-serif text-3xl font-bold mb-2 drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
        {pkg.headline}
      </h3>

      {/* Tagline */}
      <p className="text-white font-semibold text-lg mb-6">
        {pkg.tagline}
      </p>

      {/* Pricing */}
      <div className="mb-6">
        <PriceAnchoring
          regularPrice={pkg.regularPrice}
          currentPrice={pkg.discountedPrice}
          size="xl"
          badgeText="LIMITED TIME"
        />
      </div>

      {/* Description */}
      <p className="text-white/70 mb-6 leading-relaxed">
        {pkg.description}
      </p>

      {/* Included Services */}
      <div className="mb-6">
        <h4 className="text-white font-bold mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-white" />
          What You Get:
        </h4>
        <ul className="space-y-2">
          {pkg.includedServices.map((service, idx) => (
            <li key={idx} className="flex items-start gap-2 text-white/80 text-sm">
              <span className="text-white mt-0.5">✓</span>
              <div>
                <span className="font-semibold">{service.name}</span>
                {service.duration && (
                  <span className="text-white/50"> ({service.duration})</span>
                )}
                {service.value && (
                  <span className="text-white/70"> - ${service.value} value</span>
                )}
                {service.detail && (
                  <span className="text-white/60"> - {service.detail}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Bonuses */}
      <div className="mb-8 p-4 bg-gradient-to-br from-white/5 to-transparent border border-white/20 rounded-lg">
        <h4 className="text-white font-bold mb-3 flex items-center gap-2">
          <Star className="w-5 h-5 text-white" />
          BONUS - You Also Get:
        </h4>
        <ul className="space-y-2">
          {pkg.bonuses.map((bonus, idx) => (
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

      {/* Availability */}
      <div className="mb-6 p-3 bg-white/5 border border-white/10 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/70 text-sm font-semibold">Availability:</span>
          <span className={`text-sm font-bold ${almostGone ? 'text-red-400' : 'text-white'}`}>
            {pkg.remainingSpots} of {pkg.limitedSpots} spots left
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${almostGone ? 'bg-red-500' : 'bg-white'}`}
            style={{ width: `${(pkg.remainingSpots / pkg.limitedSpots) * 100}%` }}
          />
        </div>
      </div>

      {/* CTA */}
      <Button
        onClick={onBook}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-6 text-lg font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)]"
      >
        {pkg.ctaText}
      </Button>

      {/* Trust Badge */}
      <p className="text-white/60 text-xs text-center mt-4">
        ✓ 100% Satisfaction Guaranteed • ✓ Book in 60 seconds
      </p>
    </motion.div>
  );
};

// Stat Card Component
const StatCard = ({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="p-6 bg-white/5 border border-white/10 rounded-lg text-center backdrop-blur"
  >
    <div className="flex justify-center mb-3 text-white">
      {icon}
    </div>
    <div className="text-3xl font-bold mb-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
      {value}
    </div>
    <div className="text-white/60 text-sm">
      {label}
    </div>
  </motion.div>
);

// Benefit Card Component
const BenefitCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    whileHover={{ scale: 1.02 }}
    className="p-6 bg-white/5 border border-white/10 rounded-lg backdrop-blur"
  >
    <div className="flex items-start gap-4">
      <div className="p-3 bg-white/10 border border-white/30 rounded-lg text-white flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-white/70 leading-relaxed">{description}</p>
      </div>
    </div>
  </motion.div>
);

export default ForMen;
