import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Crown, Filter, ChevronDown, Sparkles, TrendingUp, CheckCircle2, Gift, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PriceAnchoring } from '@/components/PriceAnchoring';
import { SocialProofNotification } from '@/components/hormozi';

/**
 * ALEX HORMOZI'S PACKAGE CATEGORIZATION SYSTEM
 *
 * Organized by CATEGORY (not gender):
 * 1. NEW CLIENT OFFERS
 * 2. TRANSFORMATION PACKAGES
 * 3. PREMIUM EXPERIENCES
 * 4. SPECIAL OCCASIONS
 * 5. GENDER-SPECIFIC
 *
 * With smart filtering: Price, Gender, Occasion, Category
 */

// All Packages - Hormozi-Style Copy
const ALL_PACKAGES = [
  // ===== NEW CLIENT OFFERS =====
  {
    id: 'new-client-vip',
    category: 'NEW CLIENT OFFERS',
    gender: 'unisex',
    occasion: 'first-visit',
    headline: 'The First-Timer\'s Transformation',
    tagline: 'Look $240 Better for $149',
    description: 'Walk in stressed and uncertain. Walk out glowing, confident, and ready to conquer.',
    regularPrice: 240,
    discountedPrice: 149,
    savings: 91,
    savingsPercent: 38,
    included: [
      'Signature Haircut & Style (60 min)',
      'Stress-Melting Massage (30 min)',
      'Age-Defying Facial (45 min)'
    ],
    bonuses: [
      '$60 Take-Home Product Kit',
      'VIP Fast-Track Booking',
      '10% Lifetime Discount Code'
    ],
    spots: 42,
    totalSpots: 50,
    isFeatured: true
  },
  {
    id: 'first-timer-glow',
    category: 'NEW CLIENT OFFERS',
    gender: 'unisex',
    occasion: 'first-visit',
    headline: 'First-Timer Glow-Up Package',
    tagline: 'Your Best First Impression',
    regularPrice: 220,
    discountedPrice: 129,
    savings: 91,
    savingsPercent: 41,
    included: [
      'Express Haircut & Style (45 min)',
      'Mini Facial (30 min)',
      'Manicure & Polish (30 min)'
    ],
    bonuses: [
      'Free scalp treatment',
      '15% off next visit',
      'Priority rebooking'
    ],
    spots: 28,
    totalSpots: 30,
    isFeatured: false
  },

  // ===== TRANSFORMATION PACKAGES =====
  {
    id: 'complete-makeover',
    category: 'TRANSFORMATION PACKAGES',
    gender: 'female',
    occasion: 'transformation',
    headline: 'The Complete Makeover',
    tagline: 'Bad Hair to Best Hair',
    description: 'Stop hiding under hats. Start turning heads. Get the hair you\'ve been dreaming about for YEARS.',
    regularPrice: 500,
    discountedPrice: 299,
    savings: 201,
    savingsPercent: 40,
    included: [
      'Premium Haircut & Style (60 min)',
      'Full Color Treatment (120 min)',
      'Deep Conditioning Repair (30 min)',
      'Professional Blowout & Style (45 min)',
      'Expert Hair Consultation (30 min)'
    ],
    bonuses: [
      'FREE Hair Care Product Kit ($60 value)',
      'FREE Touch-up Color within 6 weeks ($80 value)',
      'Priority Booking Access'
    ],
    spots: 18,
    totalSpots: 20,
    isFeatured: true
  },
  {
    id: 'spa-day-escape',
    category: 'TRANSFORMATION PACKAGES',
    gender: 'unisex',
    occasion: 'relaxation',
    headline: 'The Stress-Eraser Package',
    tagline: 'From Burnout to Blissed Out',
    description: 'Escape from stress with our ultimate spa package. Includes massage, facial, manicure, and pedicure.',
    regularPrice: 380,
    discountedPrice: 249,
    savings: 131,
    savingsPercent: 34,
    included: [
      '90-Minute Deep Tissue Massage ($120)',
      'Luxury Facial Treatment ($85)',
      'Deluxe Manicure ($45)',
      'Spa Pedicure ($55)',
      'Aromatherapy Session ($35)'
    ],
    bonuses: [
      'FREE Glass of Champagne',
      'FREE Relaxation Tea & Snacks',
      'Complimentary Scalp Massage'
    ],
    spots: 15,
    totalSpots: 15,
    isFeatured: false
  },
  {
    id: 'glow-up-package',
    category: 'TRANSFORMATION PACKAGES',
    gender: 'female',
    occasion: 'special-occasion',
    headline: 'The Glow-Up Package',
    tagline: 'Complete Beauty Makeover',
    description: 'Transform your look with this comprehensive beauty package perfect for special occasions.',
    regularPrice: 420,
    discountedPrice: 279,
    savings: 141,
    savingsPercent: 34,
    included: [
      'Haircut & Blowout ($95)',
      'Professional Makeup Application ($75)',
      'Eyebrow Shaping & Tint ($40)',
      'Luxury Facial ($85)',
      'Express Manicure ($35)',
      'Lash Lift & Tint ($65)'
    ],
    bonuses: [
      'FREE Makeup Touch-up Kit',
      'FREE Professional Photo Tips',
      '15% Off Next Visit'
    ],
    spots: 25,
    totalSpots: 25,
    isFeatured: false
  },

  // ===== PREMIUM EXPERIENCES =====
  {
    id: '3-month-transformation',
    category: 'PREMIUM EXPERIENCES',
    gender: 'unisex',
    occasion: 'commitment',
    headline: '3-Month Transformation Journey',
    tagline: 'Your Journey to Radiance - 40% Savings',
    description: 'This isn\'t just beauty treatments. This is a 90-day commitment to becoming the best version of yourself.',
    regularPrice: 1347,
    discountedPrice: 797,
    savings: 550,
    savingsPercent: 41,
    included: [
      '3 Months of Unlimited Services (up to $449/month)',
      'Personalized Beauty Consultation',
      'Monthly Check-ins with Master Stylist',
      'Before & After Photo Shoot'
    ],
    bonuses: [
      'Free Product Starter Kit ($150 value)',
      'VIP Priority Booking',
      'Exclusive Transformation Photo Shoot ($200 value)'
    ],
    spots: 7,
    totalSpots: 10,
    isFeatured: true
  },

  // ===== SPECIAL OCCASIONS =====
  {
    id: 'bridal-beauty-bundle',
    category: 'SPECIAL OCCASIONS',
    gender: 'female',
    occasion: 'wedding',
    headline: 'Bridal Beauty Bundle',
    tagline: 'Wedding Day Perfection',
    description: 'Everything you need to look stunning on your special day. Trial session included!',
    regularPrice: 650,
    discountedPrice: 449,
    savings: 201,
    savingsPercent: 31,
    included: [
      'Bridal Hair Trial ($80)',
      'Wedding Day Hair & Makeup ($180)',
      'Airbrush Makeup ($120)',
      'Lash Extensions ($95)',
      'Manicure & Pedicure ($90)',
      'Pre-Wedding Facial ($85)'
    ],
    bonuses: [
      'FREE Bridal Party Discount (20% off for bridesmaids)',
      'FREE Touch-up Kit for Wedding Day',
      'Dedicated Bridal Coordinator'
    ],
    spots: 10,
    totalSpots: 10,
    isFeatured: false
  },
  {
    id: 'bridal-party-bundle',
    category: 'SPECIAL OCCASIONS',
    gender: 'female',
    occasion: 'wedding',
    headline: 'Bridal Party Luxury Bundle',
    tagline: 'Make Your Day Perfect - Save $500+',
    description: 'Everything your bridal party needs for the big day',
    regularPrice: 2000,
    discountedPrice: 1499,
    savings: 501,
    savingsPercent: 25,
    included: [
      'Bride: Hair + Makeup + Massage',
      '4 Bridesmaids: Hair + Makeup each',
      'Trial run 1 week before'
    ],
    bonuses: [
      'Champagne and refreshments',
      'Professional photography session',
      'Complimentary touch-up kit'
    ],
    spots: 5,
    totalSpots: 5,
    isFeatured: true
  },
  {
    id: 'girlfriend-getaway',
    category: 'SPECIAL OCCASIONS',
    gender: 'female',
    occasion: 'group',
    headline: 'Girlfriend Getaway Package',
    tagline: 'Bring Your BFF - Both Get 25% Off!',
    description: 'Book with a friend and both save big',
    regularPrice: 260,
    discountedPrice: 195,
    savings: 65,
    savingsPercent: 25,
    included: [
      '2x Women\'s Haircuts',
      '2x 30-min Massages',
      '2x Express Facials'
    ],
    bonuses: [
      'Complimentary tea and snacks',
      'Photo session together',
      'Next visit: 15% off for both'
    ],
    spots: 20,
    totalSpots: 20,
    isFeatured: false
  },

  // ===== GENDER-SPECIFIC =====
  {
    id: 'mens-executive',
    category: 'GENDER-SPECIFIC',
    gender: 'male',
    occasion: 'grooming',
    headline: 'The Executive Grooming Experience',
    tagline: 'Look Like a Million. Feel Like a Boss.',
    description: 'Everything a successful man needs. Haircut, hot towel shave, facial, and massage.',
    regularPrice: 220,
    discountedPrice: 179,
    savings: 41,
    savingsPercent: 19,
    included: [
      'Executive Haircut & Style (45 min)',
      'Hot Towel Shave & Beard Trim (30 min)',
      'Men\'s Facial & Grooming (30 min)',
      'Shoulder & Neck Massage (20 min)'
    ],
    bonuses: [
      'Complimentary beard oil',
      'VIP scheduling',
      'Monthly maintenance discount'
    ],
    spots: 12,
    totalSpots: 15,
    isFeatured: false
  },
  {
    id: 'womens-signature',
    category: 'GENDER-SPECIFIC',
    gender: 'female',
    occasion: 'pampering',
    headline: 'Women\'s Signature Experience',
    tagline: 'The Ultimate Self-Care Day',
    description: 'A full day dedicated to you. Hair, nails, skin, and total relaxation.',
    regularPrice: 380,
    discountedPrice: 249,
    savings: 131,
    savingsPercent: 34,
    included: [
      'Women\'s Haircut & Style (60 min)',
      'Full Set Manicure & Pedicure (90 min)',
      'Signature Facial (60 min)',
      'Relaxation Massage (45 min)'
    ],
    bonuses: [
      'Champagne & chocolates',
      'Take-home gift bag',
      'Member pricing on products'
    ],
    spots: 10,
    totalSpots: 12,
    isFeatured: false
  }
];

export default function PackagesPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedGender, setSelectedGender] = useState<string>('ALL');
  const [priceFilter, setPriceFilter] = useState<string>('ALL');

  // Filter packages
  const filteredPackages = ALL_PACKAGES.filter(pkg => {
    const categoryMatch = selectedCategory === 'ALL' || pkg.category === selectedCategory;
    const genderMatch = selectedGender === 'ALL' || pkg.gender === selectedGender || pkg.gender === 'unisex';
    const priceMatch =
      priceFilter === 'ALL' ||
      (priceFilter === 'UNDER_200' && pkg.discountedPrice < 200) ||
      (priceFilter === '200_500' && pkg.discountedPrice >= 200 && pkg.discountedPrice < 500) ||
      (priceFilter === 'OVER_500' && pkg.discountedPrice >= 500);

    return categoryMatch && genderMatch && priceMatch;
  });

  // Categories for filtering
  const categories = [
    'ALL',
    'NEW CLIENT OFFERS',
    'TRANSFORMATION PACKAGES',
    'PREMIUM EXPERIENCES',
    'SPECIAL OCCASIONS',
    'GENDER-SPECIFIC'
  ];

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/30 rounded-full mb-6">
            <Crown className="w-5 h-5 text-white" />
            <span className="text-white font-bold text-sm uppercase tracking-wider">
              ALL PACKAGES
            </span>
          </div>

          <h1 className="font-serif text-6xl md:text-7xl font-bold drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] mb-6">
            COMPLETE PACKAGE CATALOG
          </h1>

          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
            Every package. Every option. Every transformation. All in one place.
            <span className="text-white font-bold"> Find your perfect fit.</span>
          </p>

          <SocialProofNotification type="booked" className="justify-center" />
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12 p-6 bg-gradient-to-br from-slate-900/80 to-black/80 backdrop-blur border border-white/10 rounded-2xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-white" />
            <h3 className="text-white font-bold text-lg">Filter Packages</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="text-white/70 text-sm mb-2 block">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-white/5 border border-white/20 text-white rounded-lg px-4 py-3 focus:border-white focus:outline-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-black">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender Filter */}
            <div>
              <label className="text-white/70 text-sm mb-2 block">Gender</label>
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="w-full bg-white/5 border border-white/20 text-white rounded-lg px-4 py-3 focus:border-white focus:outline-none"
              >
                <option value="ALL" className="bg-black">All</option>
                <option value="unisex" className="bg-black">Unisex</option>
                <option value="female" className="bg-black">For Women</option>
                <option value="male" className="bg-black">For Men</option>
              </select>
            </div>

            {/* Price Filter */}
            <div>
              <label className="text-white/70 text-sm mb-2 block">Price Range</label>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="w-full bg-white/5 border border-white/20 text-white rounded-lg px-4 py-3 focus:border-white focus:outline-none"
              >
                <option value="ALL" className="bg-black">All Prices</option>
                <option value="UNDER_200" className="bg-black">Under $200</option>
                <option value="200_500" className="bg-black">$200 - $500</option>
                <option value="OVER_500" className="bg-black">$500+</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-white/60 text-sm">
            Showing {filteredPackages.length} of {ALL_PACKAGES.length} packages
          </div>
        </motion.div>

        {/* Packages Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPackages.map((pkg, index) => (
            <PackageCard
              key={pkg.id}
              package={pkg}
              index={index}
              onBook={() => {
                // Store complete package object for booking flow
                const packageForBooking = {
                  id: pkg.id,
                  name: pkg.headline,
                  regular_price: pkg.regularPrice,
                  discounted_price: pkg.discountedPrice,
                  savings_amount: pkg.savings,
                  description: pkg.description
                };

                localStorage.setItem('selectedPackage', JSON.stringify(packageForBooking));
                navigate('/booking?package=' + pkg.id);
              }}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredPackages.length === 0 && (
          <div className="text-center py-20">
            <p className="text-white/60 text-lg">No packages match your filters. Try adjusting your search.</p>
          </div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mt-16"
        >
          <Button
            onClick={() => navigate('/membership')}
            variant="cta"
            className="px-8 py-6 text-lg font-bold inline-flex items-center gap-2"
          >
            Or Join VIP Membership (Save 20-30% Forever)
            <Crown className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

// Package Card Component
interface PackageCardProps {
  package: typeof ALL_PACKAGES[0];
  index: number;
  onBook: () => void;
}

const PackageCard = ({ package: pkg, index, onBook }: PackageCardProps) => {
  const almostGone = pkg.spots <= 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className={`relative rounded-2xl border-2 p-6 bg-gradient-to-br from-slate-900/80 to-black/80 backdrop-blur transition-all ${
        pkg.isFeatured
          ? 'border-white shadow-[0_0_30px_rgba(255,255,255,0.3)]'
          : 'border-white/10 hover:border-white/50'
      }`}
    >
      {/* Badge */}
      {pkg.isFeatured && (
        <div className="absolute -top-3 left-4 px-4 py-1 bg-emerald-500 rounded-full">
          <span className="text-white font-bold text-xs uppercase">Best Value</span>
        </div>
      )}

      {/* Category Tag */}
      <div className="mb-3">
        <span className="text-white/50 text-xs uppercase tracking-wider">{pkg.category}</span>
      </div>

      {/* Headline */}
      <h3 className="font-serif text-2xl font-bold mb-2 drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
        {pkg.headline}
      </h3>

      {/* Tagline */}
      <p className="text-white font-semibold mb-4">{pkg.tagline}</p>

      {/* Pricing */}
      <div className="mb-4">
        <PriceAnchoring
          regularPrice={pkg.regularPrice}
          currentPrice={pkg.discountedPrice}
          size="lg"
        />
      </div>

      {/* Description */}
      {pkg.description && (
        <p className="text-white/70 text-sm mb-4 leading-relaxed">{pkg.description}</p>
      )}

      {/* Spots Left */}
      {almostGone && (
        <div className="mb-4 px-3 py-2 bg-red-500/20 border border-red-500/50 rounded-lg">
          <span className="text-red-400 font-bold text-sm">🔥 Only {pkg.spots} spots left!</span>
        </div>
      )}

      {/* CTA */}
      <Button
        onClick={onBook}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 font-bold"
      >
        Book Now - Save ${pkg.savings}
      </Button>

      <p className="text-white/50 text-xs text-center mt-3">
        ✓ 100% Satisfaction Guaranteed
      </p>
    </motion.div>
  );
};
