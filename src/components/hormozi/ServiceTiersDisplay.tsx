import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Star, Sparkles, ArrowRight, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface ServiceTier {
  id: string;
  tier_name: string;
  tier_level: number;
  min_price: number;
  max_price: number;
  tagline: string | null;
  description: string | null;
  features: string[];
  typical_services: string[];
  upgrade_benefits: string[];
  is_most_popular: boolean;
  display_order: number;
}

export const ServiceTiersDisplay = () => {
  const navigate = useNavigate();

  const { data: tiers, isLoading } = useQuery({
    queryKey: ['pricing-tiers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_tiers')
        .select('*')
        .order('tier_level', { ascending: true});

      if (error) throw error;
      return data as ServiceTier[];
    }
  });

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!tiers || tiers.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-black via-slate-950 to-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-6">
            <Star className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold text-sm uppercase tracking-wider">
              TRANSPARENT PRICING
            </span>
          </div>

          <h2 className="font-serif text-5xl md:text-6xl font-bold mb-6 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
            CHOOSE YOUR EXPERIENCE
          </h2>

          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-4">
            Every service at Zavira falls into one of three tiers.
            <span className="text-emerald-400 font-bold"> Know exactly what you're getting</span> before you book.
          </p>

          <p className="text-base text-white/60 max-w-2xl mx-auto">
            From quick essentials to ultimate luxury - we offer world-class service at every price point.
          </p>
        </div>

        {/* Tier Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {tiers.map((tier) => (
            <TierCard
              key={tier.id}
              tier={tier}
              onBook={() => navigate(`/booking?tier=${tier.tier_name.toLowerCase()}`)}
            />
          ))}
        </div>

        {/* Feature Comparison Matrix */}
        <div className="bg-gradient-to-br from-slate-900/80 to-black/80 backdrop-blur border-2 border-white/10 rounded-2xl p-8 mb-12">
          <h3 className="font-serif text-3xl font-bold mb-8 text-center drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
            What's Included at Each Tier
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 text-white/60 font-semibold text-sm uppercase tracking-wider">
                    Feature
                  </th>
                  {tiers.map((tier) => (
                    <th key={tier.id} className="text-center py-4 px-4">
                      <div className="font-serif text-lg text-white">
                        {tier.tier_name}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <ComparisonRow
                  feature="Service Quality"
                  values={['Professional', 'Premium', 'Master Level']}
                />
                <ComparisonRow
                  feature="Product Selection"
                  values={['Standard', 'Premium Brands', 'Top-Tier Luxury']}
                />
                <ComparisonRow
                  feature="Appointment Time"
                  values={['Standard', 'Extended', 'Maximum']}
                />
                <ComparisonRow
                  feature="Complimentary Beverages"
                  values={['Basic', 'Premium', 'Premium + Snacks']}
                />
                <ComparisonRow
                  feature="Stylist Selection"
                  values={['Available Staff', 'Senior Stylist', 'Master Artist']}
                />
                <ComparisonRow
                  feature="Loyalty Rewards"
                  values={['—', '10% Back', '15% Back']}
                />
                <ComparisonRow
                  feature="Priority Scheduling"
                  values={['—', 'Yes', 'VIP Access']}
                />
                <ComparisonRow
                  feature="Private Suite"
                  values={['—', '—', 'Yes']}
                />
                <ComparisonRow
                  feature="Concierge Service"
                  values={['—', '—', 'Yes']}
                />
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-white/80 text-lg mb-6">
            Ready to experience Zavira? Choose your tier and book your transformation.
          </p>
          <Button
            onClick={() => navigate('/booking')}
            size="lg"
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-emerald-500/50 transition-all"
          >
            Browse All Services
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

interface TierCardProps {
  tier: ServiceTier;
  onBook: () => void;
}

const TierCard = ({ tier, onBook }: TierCardProps) => {
  const isPremium = tier.is_most_popular;

  return (
    <div className={cn(
      "relative rounded-2xl border-2 p-8 transition-all duration-300 hover:scale-[1.02]",
      "bg-gradient-to-br from-slate-900/80 to-black/80 backdrop-blur",
      isPremium
        ? "border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
        : "border-white/10 hover:border-emerald-500/50"
    )}>
      {/* Most Popular Badge */}
      {isPremium && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full">
          <span className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            MOST POPULAR
          </span>
        </div>
      )}

      {/* Tier Level Indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          {Array.from({ length: tier.tier_level }).map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-emerald-500 text-emerald-500" />
          ))}
        </div>
      </div>

      {/* Tier Name & Tagline */}
      <h3 className="font-serif text-3xl font-bold mb-2 drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
        {tier.tier_name}
      </h3>
      {tier.tagline && (
        <p className="text-emerald-400 font-semibold text-lg mb-4">
          {tier.tagline}
        </p>
      )}

      {/* Price Range */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-white">
            ${tier.min_price.toFixed(0)}
          </span>
          <span className="text-white/60">-</span>
          <span className="text-4xl font-bold text-white">
            ${tier.max_price.toFixed(0)}
          </span>
        </div>
        <p className="text-white/60 text-sm mt-1">per service</p>
      </div>

      {/* Description */}
      {tier.description && (
        <p className="text-white/70 mb-6 text-sm leading-relaxed">
          {tier.description}
        </p>
      )}

      {/* Features */}
      <div className="mb-6">
        <h4 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">
          What's Included:
        </h4>
        <ul className="space-y-2">
          {tier.features.slice(0, 6).map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2 text-white/80 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Typical Services */}
      <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-lg">
        <h4 className="text-white/90 font-bold mb-3 text-sm uppercase tracking-wider">
          Example Services:
        </h4>
        <ul className="space-y-1.5">
          {tier.typical_services.slice(0, 4).map((service, idx) => (
            <li key={idx} className="text-white/70 text-xs leading-relaxed">
              • {service}
            </li>
          ))}
        </ul>
      </div>

      {/* Upgrade Benefits (only for Basic & Premium) */}
      {tier.tier_level < 3 && tier.upgrade_benefits.length > 0 && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
          <h4 className="text-emerald-400 font-bold mb-2 text-sm uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Upgrade Benefits:
          </h4>
          <ul className="space-y-1.5">
            {tier.upgrade_benefits.map((benefit, idx) => (
              <li key={idx} className="text-emerald-300 text-xs">
                → {benefit}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA Button */}
      <Button
        onClick={onBook}
        size="lg"
        className={cn(
          "w-full font-bold text-lg py-6 rounded-xl shadow-lg transition-all",
          isPremium
            ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-emerald-500/50"
            : "bg-white/10 hover:bg-white/20 border border-white/20"
        )}
      >
        Book {tier.tier_name}
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>

      <p className="text-center text-white/40 text-xs mt-3">
        ✓ Same-day availability  •  ✓ Book online instantly
      </p>
    </div>
  );
};

interface ComparisonRowProps {
  feature: string;
  values: string[];
}

const ComparisonRow = ({ feature, values }: ComparisonRowProps) => {
  return (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
      <td className="py-4 px-4 text-white/80 text-sm">
        {feature}
      </td>
      {values.map((value, idx) => (
        <td key={idx} className="py-4 px-4 text-center">
          {value === '—' ? (
            <span className="text-white/30 text-xl">—</span>
          ) : (
            <span className="text-white/90 text-sm font-medium">
              {value}
            </span>
          )}
        </td>
      ))}
    </tr>
  );
};
