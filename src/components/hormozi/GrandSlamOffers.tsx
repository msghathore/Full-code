import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CountdownTimer } from './CountdownTimer';
import { LimitedSpots } from './LimitedSpots';
import { SocialProofNotification } from './SocialProofNotification';
import { CheckCircle2, Sparkles, Gift, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { PriceAnchoring } from '@/components/PriceAnchoring';

interface Package {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  package_type: string;
  regular_price: number;
  discounted_price: number;
  savings_amount: number;
  savings_percentage: number;
  included_services: string[];
  bonus_items: string[];
  is_featured: boolean;
  limited_quantity: number | null;
  remaining_quantity: number | null;
  expires_at: string | null;
  image_url: string | null;
}

export const GrandSlamOffers = () => {
  const navigate = useNavigate();

  const { data: packages, isLoading } = useQuery({
    queryKey: ['grand-slam-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('discounted_price', { ascending: true });

      if (error) throw error;
      return data as Package[];
    }
  });

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!packages || packages.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-black via-slate-950 to-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-6">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold text-sm uppercase tracking-wider">
              LIMITED TIME OFFERS
            </span>
          </div>

          <h2 className="font-serif text-5xl md:text-6xl font-bold mb-6 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
            GRAND SLAM OFFERS
          </h2>

          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
            Irresistible value packages that would be crazy to pass up.
            <span className="text-emerald-400 font-bold"> Save hundreds</span> on your transformation today.
          </p>

          <SocialProofNotification type="booked" className="justify-center" />
        </div>

        {/* Packages Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} package={pkg} onBook={() => navigate('/booking')} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-white/60 text-sm mb-4">
            ⚡ These offers won't last forever. Book now before spots fill up.
          </p>
          <CountdownTimer size="lg" className="justify-center" />
        </div>
      </div>
    </section>
  );
};

interface PackageCardProps {
  package: Package;
  onBook: () => void;
}

const PackageCard = ({ package: pkg, onBook }: PackageCardProps) => {
  const hasExpiry = pkg.expires_at !== null;
  const hasLimitedSpots = pkg.limited_quantity !== null;

  return (
    <div className={cn(
      "relative rounded-2xl border-2 p-8 transition-all duration-300 hover:scale-[1.02]",
      "bg-gradient-to-br from-slate-900/80 to-black/80 backdrop-blur",
      pkg.is_featured
        ? "border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
        : "border-white/10 hover:border-emerald-500/50"
    )}>
      {/* Featured Badge */}
      {pkg.is_featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full">
          <span className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            BEST VALUE
          </span>
        </div>
      )}

      {/* Package Type Badge */}
      <div className="flex items-center justify-between mb-4">
        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-white/60 text-xs uppercase tracking-wider">
          {pkg.package_type.replace('_', ' ')}
        </span>
        {hasLimitedSpots && pkg.remaining_quantity! <= 5 && (
          <span className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full text-red-400 text-xs font-bold animate-pulse">
            🔥 ALMOST GONE
          </span>
        )}
      </div>

      {/* Package Name & Tagline */}
      <h3 className="font-serif text-3xl font-bold mb-2 drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
        {pkg.name}
      </h3>
      {pkg.tagline && (
        <p className="text-emerald-400 font-semibold text-lg mb-4">
          {pkg.tagline}
        </p>
      )}

      {/* Enhanced Pricing with Price Anchoring */}
      <div className="mb-6">
        <PriceAnchoring
          regularPrice={pkg.regular_price}
          currentPrice={pkg.discounted_price}
          size="xl"
          badgeText="LIMITED TIME"
        />

        {/* Value Proposition */}
        <div className="mt-4 p-3 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border border-emerald-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-emerald-400">
            <TrendingUp className="w-5 h-5" />
            <span className="font-bold">
              Total Value: ${pkg.regular_price.toFixed(0)} • You Pay: ${pkg.discounted_price.toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      {pkg.description && (
        <p className="text-white/70 mb-6">
          {pkg.description}
        </p>
      )}

      {/* Included Services */}
      <div className="mb-6">
        <h4 className="text-white font-bold mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          What's Included:
        </h4>
        <ul className="space-y-2">
          {pkg.included_services.map((service, idx) => (
            <li key={idx} className="flex items-start gap-2 text-white/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span>{service}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Bonus Items */}
      {pkg.bonus_items && pkg.bonus_items.length > 0 && (
        <div className="mb-6 p-4 bg-white/10/10 border border-white/30/30 rounded-lg">
          <h4 className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] font-bold mb-3 flex items-center gap-2">
            <Gift className="w-5 h-5" />
            BONUS - You Also Get:
          </h4>
          <ul className="space-y-2">
            {pkg.bonus_items.map((bonus, idx) => (
              <li key={idx} className="flex items-start gap-2 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                <Gift className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{bonus}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Limited Spots */}
      {hasLimitedSpots && (
        <LimitedSpots
          total={pkg.limited_quantity!}
          remaining={pkg.remaining_quantity!}
          className="mb-4"
        />
      )}

      {/* Countdown */}
      {hasExpiry && (
        <div className="mb-6">
          <CountdownTimer
            targetDate={new Date(pkg.expires_at!)}
            size="sm"
            className="justify-center"
          />
        </div>
      )}

      {/* CTA Button */}
      <Button
        onClick={onBook}
        size="lg"
        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-lg py-6 rounded-xl shadow-lg hover:shadow-emerald-500/50 transition-all"
      >
        <Clock className="w-5 h-5 mr-2" />
        CLAIM THIS OFFER NOW
      </Button>

      <p className="text-center text-white/40 text-sm mt-4">
        ✓ 100% Satisfaction Guaranteed  •  ✓ Book in 60 seconds
      </p>
    </div>
  );
};
