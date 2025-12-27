import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, PartyPopper, Shield, Sparkles, Star, Users, Gift } from 'lucide-react';
import { CountdownTimer, SocialProofNotification } from '@/components/hormozi';
import { PriceAnchoring } from '@/components/PriceAnchoring';

/**
 * FOR GROUPS - LANDING PAGE
 *
 * HORMOZI PRINCIPLES:
 * - Fun, experience-focused copy
 * - Addresses group pain points (coordination, cost per person, boring parties)
 * - Social bonding value prop
 * - "Per person" pricing psychology
 * - Urgency for limited group slots
 */

const GROUP_PACKAGES = [
  {
    id: 'girlfriend-getaway',
    badge: '💅 PERFECT FOR GIRLFRIENDS',
    headline: 'The Girlfriend Getaway Package',
    tagline: 'Bond, Laugh, & Get Glam Together',
    description: 'Stop doing boring brunch. Give your girls an experience they\'ll talk about for YEARS. Private VIP suite, champagne, professional pampering for everyone. This is how queens celebrate friendship.',
    regularPrice: 1800,
    discountedPrice: 1350,
    savingsPercentage: 25,
    perPerson: 225,
    groupSize: 6,
    includedServices: [
      { name: '💇‍♀️ Signature Haircuts & Styling for 6', detail: 'any style they want' },
      { name: '💅 Luxury Manicures for All', detail: 'gel polish included' },
      { name: '💆‍♀️ Stress-Melting Massages', detail: '30 min each' },
      { name: '🥂 Champagne & Snack Bar', detail: 'unlimited during visit' },
      { name: '📸 Professional Group Photos', detail: 'capture the memories' },
      { name: '🏰 Private VIP Suite', detail: 'exclusive space, 4 hours' }
    ],
    bonuses: [
      { number: 1, name: 'FREE Beauty Gift Bags', detail: '$300 value - everyone takes home products' },
      { number: 2, name: 'Spotify Playlist Control', detail: 'you pick the vibe' },
      { number: 3, name: 'Birthday Girl Goes FREE', detail: 'she pays nothing' },
      { number: 4, name: 'Instagram-Worthy Setup', detail: 'perfect for content' }
    ],
    limitedSpots: 8,
    remainingSpots: 5,
    isFeatured: true,
    ctaText: 'BOOK GIRLFRIEND GETAWAY'
  },
  {
    id: 'bachelorette-bash',
    badge: '🎉 BEST FOR BACHELORETTE PARTIES',
    headline: 'The Bachelorette Bash',
    tagline: 'Her Last Fling Before The Ring',
    description: 'Give the bride-to-be a party she\'ll never forget. Matching robes, champagne toasts, full glam squad. The most Instagram-worthy bachelorette experience in the city. Zero stress, 100% fun.',
    regularPrice: 2400,
    discountedPrice: 1800,
    savingsPercentage: 25,
    perPerson: 225,
    groupSize: 8,
    includedServices: [
      { name: '💇‍♀️ Bridal Party Hair Styling', detail: 'bride gets priority' },
      { name: '💄 Professional Makeup for All', detail: 'party-ready glam' },
      { name: '🥂 Champagne Bar & Treats', detail: 'toast the bride' },
      { name: '👗 Matching Robes for Photos', detail: 'keep or return' },
      { name: '📸 Photo Shoot Package', detail: 'professional photographer' },
      { name: '🏰 Private Party Suite', detail: '5 hours exclusive' }
    ],
    bonuses: [
      { number: 1, name: 'Bride Gets FULL SERVICE FREE', detail: '$400 value - hair, makeup, massage' },
      { number: 2, name: 'Party Favors for All', detail: '$240 value' },
      { number: 3, name: 'Custom Playlist & Decorations', detail: 'we handle everything' },
      { number: 4, name: 'Bachelorette Game Pack', detail: 'fun activities included' }
    ],
    limitedSpots: 5,
    remainingSpots: 2,
    isFeatured: true,
    ctaText: 'BOOK BACHELORETTE BASH'
  },
  {
    id: 'birthday-celebration',
    badge: '🎂 PERFECT FOR BIRTHDAYS',
    headline: 'The Birthday Celebration Package',
    tagline: 'Make Them Feel Like Royalty',
    description: 'Tired of the same old birthday dinner? Give them an experience that screams "YOU\'RE SPECIAL." VIP treatment, pampering, and memories that last way longer than a cake.',
    regularPrice: 1500,
    discountedPrice: 1125,
    savingsPercentage: 25,
    perPerson: 225,
    groupSize: 5,
    includedServices: [
      { name: '💆‍♀️ Signature Spa Treatment for All', detail: 'customized per person' },
      { name: '💅 Luxury Manicure & Pedicure', detail: 'gel or regular' },
      { name: '🥂 Birthday Champagne Toast', detail: 'sparkling celebration' },
      { name: '🎂 Birthday Cake & Treats', detail: 'custom cake included' },
      { name: '🏰 Decorated Private Suite', detail: 'balloons & banners' }
    ],
    bonuses: [
      { number: 1, name: 'Birthday Guest Goes FREE', detail: 'they pay nothing' },
      { number: 2, name: 'Party Favor Gift Bags', detail: '$150 value' },
      { number: 3, name: 'Professional Birthday Photos', detail: 'memories forever' }
    ],
    limitedSpots: 10,
    remainingSpots: 8,
    ctaText: 'BOOK BIRTHDAY PARTY'
  },
  {
    id: 'corporate-team-bonding',
    badge: '💼 BEST FOR CORPORATE EVENTS',
    headline: 'The Corporate Team Bonding Experience',
    tagline: 'Team Building That Doesn\'t Suck',
    description: 'Skip the boring trust falls. Give your team an experience they\'ll actually enjoy. Professional pampering, private space, and bonding that doesn\'t feel forced. Great for corporate retreats, team rewards, or client appreciation.',
    regularPrice: 2000,
    discountedPrice: 1500,
    savingsPercentage: 25,
    perPerson: 187.50,
    groupSize: 8,
    includedServices: [
      { name: '💆‍♀️ Relaxation Massages for Team', detail: '30 min each - stress relief' },
      { name: '🧴 Premium Skincare Treatments', detail: 'professional facials' },
      { name: '☕ Coffee & Refreshments Bar', detail: 'professional setting' },
      { name: '🏰 Private Corporate Suite', detail: 'conducive to networking' },
      { name: '📊 Team Building Activities', detail: 'optional facilitated activities' }
    ],
    bonuses: [
      { number: 1, name: 'Corporate Invoice', detail: 'expense-friendly billing' },
      { number: 2, name: 'Branded Gift Bags', detail: 'add your company logo' },
      { number: 3, name: 'Flexible Scheduling', detail: 'evenings & weekends available' }
    ],
    limitedSpots: 6,
    remainingSpots: 4,
    ctaText: 'BOOK CORPORATE EVENT'
  }
];

const ForGroups = () => {
  const navigate = useNavigate();

  const handleBookPackage = (packageId: string) => {
    // Find the full package object
    const selectedPkg = GROUP_PACKAGES.find(pkg => pkg.id === packageId);

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
              <PartyPopper className="w-4 h-4" />
              GROUP PARTY EXPERIENCES
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-center mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]"
          >
            STOP DOING BORING
            <br />
            <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
              START MAKING MEMORIES
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl text-white/80 text-center max-w-4xl mx-auto mb-8 leading-relaxed"
          >
            Ditch the same old brunch. Skip the basic party bus.
            <br />
            <span className="text-white font-semibold">
              Give your group an experience they'll ACTUALLY remember and thank you for.
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
            <StatCard icon={<Users />} value="800+" label="Groups Hosted" />
            <StatCard icon={<Star />} value="5.0/5" label="Party Rating" />
            <StatCard icon={<PartyPopper />} value="3-5" label="Hour Parties" />
            <StatCard icon={<Shield />} value="100%" label="Fun Guaranteed" />
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
              BOOK YOUR GROUP PARTY
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
              CHOOSE YOUR GROUP EXPERIENCE
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-white/80 max-w-3xl mx-auto"
            >
              Every package includes a private VIP suite, dedicated coordinator, and the "Best Party Ever Guarantee" - if it's not the best party they've had, we refund 100%.
            </motion.p>
          </div>

          {/* Package Cards */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {GROUP_PACKAGES.map((pkg, index) => (
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
              ⚡ Limited group slots available. Book now before weekends sell out.
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
            WHY GROUPS CHOOSE ZAVIRA
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8">
            <BenefitCard
              icon={<PartyPopper />}
              title="Zero Coordination Stress"
              description="We handle everything. You just show up. Dedicated coordinator manages timing, services, and keeps the party flowing."
            />
            <BenefitCard
              icon={<Users />}
              title="Private VIP Experience"
              description="Your own private suite. No strangers. No distractions. Just your group having the time of their lives."
            />
            <BenefitCard
              icon={<Shield />}
              title="Best Party Ever Guarantee"
              description="If it's not the best party experience they've ever had, we refund 100%. We've NEVER had to do this. You're safe."
            />
            <BenefitCard
              icon={<Gift />}
              title="Insane Value Per Person"
              description="$225 per person for 4+ hours of VIP pampering, champagne, treats, and memories. Compare that to boring brunch."
            />
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 px-4 bg-black">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-4xl md:text-5xl font-bold text-center mb-12 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
          >
            REAL GROUPS, REAL REACTIONS
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="Best bachelorette party EVER. The bride cried happy tears. Everyone looked AMAZING. 10/10 would do again!"
              author="Megan S."
              role="Bachelorette Party Host"
            />
            <TestimonialCard
              quote="We do this every year for my birthday now. The girls already booked next year's date. That's how good it is."
              author="Ashley K."
              role="Birthday Girl Squad"
            />
            <TestimonialCard
              quote="Our team actually bonded. No awkward trust falls. Just relaxation, laughter, and real connection. HR loved it."
              author="David M."
              role="Corporate Team Lead"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

// Package Card Component
interface PackageCardProps {
  package: typeof GROUP_PACKAGES[0];
  onBook: () => void;
  index: number;
}

const PackageCard = ({ package: pkg, onBook, index }: PackageCardProps) => {
  const almostGone = pkg.remainingSpots <= 2;

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
      <div className="flex items-center justify-between mb-4">
        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-white/60 text-xs uppercase tracking-wider">
          {pkg.badge}
        </span>
        {almostGone && (
          <span className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full text-red-400 text-xs font-bold animate-pulse flex items-center gap-1">
            🔥 {pkg.remainingSpots} SLOTS LEFT
          </span>
        )}
      </div>

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
          badgeText="GROUP SPECIAL"
        />

        {/* Per Person Pricing */}
        <div className="mt-4 p-3 bg-gradient-to-r from-white/10 to-white/10 border border-white/30 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-sm">Per Person (Group of {pkg.groupSize}):</span>
            <span className="text-white font-bold text-lg">${pkg.perPerson.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-white/70 mb-6 leading-relaxed">
        {pkg.description}
      </p>

      {/* Included Services */}
      <div className="mb-6">
        <h4 className="text-white font-bold mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-white" />
          What Your Group Gets:
        </h4>
        <ul className="space-y-2">
          {pkg.includedServices.map((service, idx) => (
            <li key={idx} className="flex items-start gap-2 text-white/80 text-sm">
              <span className="text-white mt-0.5">✓</span>
              <div>
                <span className="font-semibold">{service.name}</span>
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
          <Gift className="w-5 h-5 text-white" />
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
            {pkg.remainingSpots} of {pkg.limitedSpots} slots left
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
        ✓ Best Party Ever Guarantee • ✓ Book Your Date Now
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

export default ForGroups;
