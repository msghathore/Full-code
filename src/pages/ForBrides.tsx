import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Heart, Shield, Sparkles, Star, Users, Calendar } from 'lucide-react';
import { CountdownTimer, SocialProofNotification } from '@/components/hormozi';
import { PriceAnchoring } from '@/components/PriceAnchoring';

/**
 * FOR BRIDES - LANDING PAGE
 *
 * HORMOZI PRINCIPLES:
 * - Emotional, transformation-focused copy
 * - Addresses bridal-specific pain points (stress, perfection, once-in-a-lifetime)
 * - Before/After framing
 * - Social proof from real brides
 * - Guarantee-heavy (this day can't be redone)
 */

const BRIDAL_PACKAGES = [
  {
    id: 'bridal-beauty-bundle',
    badge: '👰 PERFECT FOR YOUR BIG DAY',
    headline: 'The Bridal Beauty Bundle',
    tagline: 'Look Flawless. Feel Confident. Stress-Free.',
    description: 'Your wedding day is once in a lifetime. You deserve to look absolutely breathtaking. Full glam hair, flawless makeup, and relaxation treatments. Walk down that aisle looking like a fairytale princess.',
    regularPrice: 850,
    discountedPrice: 649,
    savingsPercentage: 24,
    includedServices: [
      { name: '💇‍♀️ Bridal Hair Styling', duration: '90 min', value: 200 },
      { name: '💄 Professional Bridal Makeup', duration: '75 min', value: 180 },
      { name: '💅 Luxury Manicure & Pedicure', duration: '90 min', value: 120 },
      { name: '💆‍♀️ Pre-Wedding Stress Relief Massage', duration: '60 min', value: 150 },
      { name: '✨ Facial Glow Treatment', duration: '45 min', value: 110 },
      { name: '🧖‍♀️ Skin Radiance Prep', duration: '30 min', value: 90 }
    ],
    bonuses: [
      { number: 1, name: 'Emergency Touch-Up Kit', detail: '$80 value - yours to keep' },
      { number: 2, name: 'FREE Bridal Trial Session', detail: '$150 value - test your look' },
      { number: 3, name: 'Bridesmaid Group Discount', detail: '20% off for your party' },
      { number: 4, name: 'Wedding Day Coordinator', detail: 'on-call support all day' }
    ],
    limitedSpots: 8,
    remainingSpots: 5,
    isFeatured: true,
    ctaText: 'BOOK BRIDAL PACKAGE'
  },
  {
    id: 'bridal-trial-experience',
    badge: '💄 PERFECT FOR PLANNING',
    headline: 'The Bridal Trial Experience',
    tagline: 'Test Your Look Before The Big Day',
    description: 'No surprises on your wedding day. Test your hair, makeup, and look exactly how you want. Bring your inspiration photos. We perfect every detail until you cry happy tears.',
    regularPrice: 240,
    discountedPrice: 180,
    savingsPercentage: 25,
    includedServices: [
      { name: '💇‍♀️ Bridal Hair Trial', duration: '60 min', value: 120 },
      { name: '💄 Makeup Trial & Consultation', duration: '60 min', value: 120 }
    ],
    bonuses: [
      { number: 1, name: '$180 Credit Toward Full Bridal Package', detail: 'this trial is FREE if you book' },
      { number: 2, name: 'Personalized Bridal Beauty Timeline', detail: 'custom prep schedule' }
    ],
    limitedSpots: 15,
    remainingSpots: 12,
    ctaText: 'BOOK BRIDAL TRIAL'
  },
  {
    id: 'bridesmaids-party-package',
    badge: '💐 BEST FOR BRIDAL PARTIES',
    headline: 'The Bridesmaids Party Package',
    tagline: 'Your Whole Squad, Camera-Ready',
    description: 'Don\'t let your bridesmaids show up in wedding photos looking basic. Get your entire crew glammed up together. Champagne, laughter, and professional styling for everyone.',
    regularPrice: 2200,
    discountedPrice: 1650,
    savingsPercentage: 25,
    includedServices: [
      { name: '💇‍♀️ Hair Styling for 6 Bridesmaids', detail: 'any style they want' },
      { name: '💄 Professional Makeup for 6', detail: 'photo-ready perfection' },
      { name: '🥂 Champagne & Snacks', detail: 'celebrate together' },
      { name: '📸 Group Photo Session', detail: 'before the ceremony' }
    ],
    bonuses: [
      { number: 1, name: 'FREE Bride Hair & Makeup', detail: '$350 value - you get pampered free' },
      { number: 2, name: 'Touch-Up Kits for All', detail: '$240 value' },
      { number: 3, name: 'Reserved VIP Suite', detail: 'private space all morning' }
    ],
    limitedSpots: 5,
    remainingSpots: 3,
    isFeatured: true,
    ctaText: 'BOOK PARTY PACKAGE'
  }
];

const ForBrides = () => {
  const navigate = useNavigate();

  const handleBookPackage = (packageId: string) => {
    // Find the full package object
    const selectedPkg = BRIDAL_PACKAGES.find(pkg => pkg.id === packageId);

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
              <Heart className="w-4 h-4" />
              BRIDAL BEAUTY SPECIALISTS
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-center mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]"
          >
            YOUR FAIRYTALE
            <br />
            <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
              STARTS WITH YOU
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl text-white/80 text-center max-w-4xl mx-auto mb-8 leading-relaxed"
          >
            This is the most important day of your life. You only get one shot.
            <br />
            <span className="text-white font-semibold">
              Look flawless. Feel confident. Stress-free bridal beauty guaranteed.
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
            <StatCard icon={<Heart />} value="350+" label="Brides Served" />
            <StatCard icon={<Star />} value="5.0/5" label="Bridal Rating" />
            <StatCard icon={<Calendar />} value="2-4" label="Hour Sessions" />
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
              BOOK YOUR BRIDAL PACKAGE
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
              CHOOSE YOUR BRIDAL PACKAGE
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-white/80 max-w-3xl mx-auto"
            >
              Every package includes a personal coordinator, touch-up kit, and our exclusive "Cry-Proof Guarantee" - if you don't cry happy tears, we redo it free.
            </motion.p>
          </div>

          {/* Package Cards */}
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {BRIDAL_PACKAGES.map((pkg, index) => (
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
              ⚡ Wedding season books fast. Secure your date before it's gone.
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
            WHY BRIDES CHOOSE ZAVIRA
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8">
            <BenefitCard
              icon={<Sparkles />}
              title="Flawless Execution"
              description="350+ brides trusted us with their big day. Zero disasters. 100% breathtaking results. Your day is safe with us."
            />
            <BenefitCard
              icon={<Heart />}
              title="Stress-Free Experience"
              description="No rushing. No chaos. Champagne, music, and a private suite. Enjoy getting ready - it's part of the magic."
            />
            <BenefitCard
              icon={<Shield />}
              title="Cry-Proof Guarantee"
              description="If you don't cry happy tears when you see yourself, we redo everything free. You WILL look perfect."
            />
            <BenefitCard
              icon={<Users />}
              title="Bridesmaids Included"
              description="Don't let your girls show up unprepared. We make your entire party camera-ready so every photo is perfect."
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-black">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-4xl md:text-5xl font-bold text-center mb-12 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
          >
            REAL BRIDES, REAL RESULTS
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="I cried when I saw myself. I've never felt so beautiful. Zavira made my dream come true."
              author="Sarah M."
              role="Bride, June 2024"
            />
            <TestimonialCard
              quote="The trial saved me! We adjusted everything perfectly. On my wedding day, I looked EXACTLY how I imagined."
              author="Emily R."
              role="Bride, September 2024"
            />
            <TestimonialCard
              quote="My bridesmaids still talk about how amazing they felt. Best decision booking the party package!"
              author="Jessica L."
              role="Bride, August 2024"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

// Package Card Component
interface PackageCardProps {
  package: typeof BRIDAL_PACKAGES[0];
  onBook: () => void;
  index: number;
}

const PackageCard = ({ package: pkg, onBook, index }: PackageCardProps) => {
  const almostGone = pkg.remainingSpots <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.2 }}
      whileHover={{ scale: 1.02, y: -8 }}
      className={`relative rounded-2xl border-2 p-8 transition-all duration-300 bg-gradient-to-br from-slate-900/80 to-black/80 backdrop-blur ${
        pkg.isFeatured
          ? 'border-white shadow-[0_0_30px_rgba(255,255,255,0.3)]'
          : 'border-white/10 hover:border-white/50'
      }`}
    >
      {/* Featured Badge */}
      {pkg.isFeatured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full">
          <span className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            MOST POPULAR
          </span>
        </div>
      )}

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
            🔥 {pkg.remainingSpots} DATES LEFT
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
          badgeText="BRIDAL SPECIAL"
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

      {/* Bonuses */}
      <div className="mb-8 p-4 bg-gradient-to-br from-white/5 to-transparent border border-white/20 rounded-lg">
        <h4 className="text-white font-bold mb-3 flex items-center gap-2">
          <Heart className="w-5 h-5 text-white" />
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
            {pkg.remainingSpots} of {pkg.limitedSpots} dates left
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
        ✓ Cry-Proof Guarantee • ✓ Book Your Date Now
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

// Testimonial Card Component
const TestimonialCard = ({ quote, author, role }: { quote: string; author: string; role: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    whileHover={{ scale: 1.02 }}
    className="p-6 bg-white/5 border border-white/10 rounded-lg backdrop-blur"
  >
    <div className="flex justify-center mb-4 text-white">
      <Star className="w-5 h-5 fill-current" />
      <Star className="w-5 h-5 fill-current" />
      <Star className="w-5 h-5 fill-current" />
      <Star className="w-5 h-5 fill-current" />
      <Star className="w-5 h-5 fill-current" />
    </div>
    <p className="text-white/80 mb-4 italic leading-relaxed">"{quote}"</p>
    <div className="text-center">
      <p className="text-white font-semibold">{author}</p>
      <p className="text-white/60 text-sm">{role}</p>
    </div>
  </motion.div>
);

export default ForBrides;
