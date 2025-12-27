import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Shield, Crown, Sparkles, Gift, Zap, Users, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { CountdownTimer, SocialProofNotification } from '@/components/hormozi';

interface MembershipTier {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  monthly_price: number;
  annual_price: number | null;
  credits_per_month: number;
  credit_value: number;
  rollover_credits: boolean;
  priority_booking: boolean;
  discount_percentage: number;
  max_guests: number;
  free_upgrades_per_month: number;
  house_calls_per_year: number;
  features: string[];
  display_order: number;
  is_active: boolean;
  badge: string | null;
}

export default function MembershipPage() {
  const navigate = useNavigate();

  const { data: tiers, isLoading } = useQuery({
    queryKey: ['membership-tiers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('membership_tiers')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as MembershipTier[];
    }
  });

  const basicTier = tiers?.[0];
  const eliteTier = tiers?.[1];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-black via-slate-950 to-black overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/30 rounded-full">
              <Crown className="w-5 h-5 text-white" />
              <span className="text-white font-bold text-sm uppercase tracking-wider">
                EXCLUSIVE MEMBERSHIP PROGRAM
              </span>
            </div>
          </div>

          <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-bold text-center mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">
            ZAVIRA VIP CLUB
          </h1>

          <p className="text-2xl md:text-3xl text-center text-white/90 max-w-4xl mx-auto mb-4">
            Stop Paying Full Price. Start Living Like Royalty.
          </p>

          <p className="text-xl text-center text-white/70 max-w-3xl mx-auto mb-8">
            One monthly payment. <span className="text-white font-bold">Unlimited luxury</span>.
            The smartest investment in yourself you'll ever make.
          </p>

          <div className="flex justify-center mb-12">
            <SocialProofNotification type="booked" />
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <StatCard icon={<Zap className="w-8 h-8" />} value="$200+" label="Value per month" subtext="Pay $149, Get $200+" />
            <StatCard icon={<Users className="w-8 h-8" />} value="500+" label="VIP Members" subtext="Join the elite club" />
            <StatCard icon={<Gift className="w-8 h-8" />} value="20-30%" label="Savings" subtext="Every. Single. Visit." />
          </div>

          <div className="text-center">
            <p className="text-white/60 mb-4">⚡ Limited spots available this month:</p>
            <CountdownTimer size="lg" className="justify-center" />
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-slate-950">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-center mb-4">Choose Your Level</h2>
          <p className="text-xl text-white/70 text-center mb-12">
            Both tiers pay for themselves in <span className="text-white font-bold">one visit</span>
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {basicTier && <MembershipCard tier={basicTier} onJoin={() => navigate('/booking')} />}
            {eliteTier && <MembershipCard tier={eliteTier} onJoin={() => navigate('/booking')} featured />}
          </div>

          <div className="mt-16 text-center p-8 bg-white/10 border-2 border-white/30 rounded-2xl max-w-4xl mx-auto">
            <CheckCircle2 className="w-16 h-16 text-white mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-3">30-DAY MONEY-BACK GUARANTEE</h3>
            <p className="text-white/80 max-w-2xl mx-auto">
              Try it for 30 days. If you don't absolutely love it, we'll refund every penny. No questions asked.
              You literally <span className="text-white font-bold">can't lose</span>.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-black">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-center mb-12">Common Questions</h2>
          <FAQSection />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-950 to-black">
        <div className="max-w-4xl mx-auto text-center">
          <Sparkles className="w-16 h-16 text-white mx-auto mb-6" />
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">Ready to Join the VIP Club?</h2>
          <p className="text-xl text-white/80 mb-8">
            Stop overpaying. Start saving. <span className="text-white font-bold">Join today</span>.
          </p>
          <Button
            onClick={() => navigate('/booking')}
            size="lg"
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-xl px-12 py-8 rounded-xl shadow-lg hover:shadow-emerald-500/50 transition-all"
          >
            <Crown className="w-6 h-6 mr-2" />
            BECOME A VIP MEMBER NOW
          </Button>
          <p className="text-white/40 text-sm mt-6">✓ Cancel anytime  •  ✓ 30-day guarantee  •  ✓ Join in 60 seconds</p>
        </div>
      </section>
    </div>
  );
}

interface MembershipCardProps {
  tier: MembershipTier;
  onJoin: () => void;
  featured?: boolean;
}

const MembershipCard = ({ tier, onJoin, featured = false }: MembershipCardProps) => {
  const monthlySavings = (tier.credit_value * tier.credits_per_month) - tier.monthly_price;
  const annualSavings = tier.annual_price ? (tier.monthly_price * 12) - tier.annual_price : 0;

  return (
    <div className={cn(
      "relative rounded-2xl border-2 p-8 transition-all duration-300",
      "bg-gradient-to-br from-slate-900/80 to-black/80 backdrop-blur",
      featured ? "border-white shadow-[0_0_40px_rgba(255,255,255,0.4)] scale-105" : "border-white/10 hover:border-white/50"
    )}>
      {featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-white/90 to-white/80 rounded-full">
          <span className="text-black font-bold text-sm uppercase tracking-wider">{tier.badge || "MOST POPULAR"}</span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="font-serif text-3xl font-bold mb-2">{tier.name}</h3>
        <p className="text-white/70">{tier.description}</p>
      </div>

      <div className="text-center mb-8 pb-8 border-b border-white/10">
        <div className="flex items-baseline justify-center gap-2 mb-2">
          <span className="text-5xl font-bold text-white">${tier.monthly_price.toFixed(0)}</span>
          <span className="text-white/60">/month</span>
        </div>
        <div className="text-white font-semibold">SAVE ${monthlySavings.toFixed(0)}/month</div>
        {tier.annual_price && (
          <div className="mt-3 text-sm text-white/60">Or ${tier.annual_price.toFixed(0)}/year (Save ${annualSavings.toFixed(0)})</div>
        )}
      </div>

      <ul className="space-y-4 mb-8">
        {tier.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
            <span className="text-white/90">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={onJoin}
        size="lg"
        className={cn(
          "w-full font-bold text-lg py-6 rounded-xl transition-all",
          featured
            ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-emerald-500/50"
            : "bg-white/10 hover:bg-white/20 border-2 border-white/20"
        )}
      >
        {featured ? <Crown className="w-5 h-5 mr-2" /> : <Zap className="w-5 h-5 mr-2" />}
        JOIN {tier.name}
      </Button>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  subtext: string;
}

const StatCard = ({ icon, value, label, subtext }: StatCardProps) => {
  return (
    <div className="p-6 rounded-xl bg-gradient-to-br from-slate-900/60 to-black/60 border border-white/10 text-center">
      <div className="text-white flex justify-center mb-3">{icon}</div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-white font-semibold mb-1">{label}</div>
      <div className="text-white/60 text-sm">{subtext}</div>
    </div>
  );
};

const FAQSection = () => {
  const faqs = [
    {
      q: "How does the membership work?",
      a: "Pay one monthly fee, get access to services worth 2-3X what you pay. Use your monthly credits on any service, get massive discounts on everything else, and enjoy VIP perks like priority booking."
    },
    {
      q: "Can I cancel anytime?",
      a: "Absolutely. No contracts, no commitments. Cancel anytime with one click. We're so confident you'll love it that we make it easy to leave (but you won't want to)."
    },
    {
      q: "What if I don't use my monthly credits?",
      a: "Basic tier: Use it or lose it. Platinum tier: Credits roll over! Save them up for bigger treatments or share with friends."
    },
    {
      q: "Is this really worth it?",
      a: "If you visit us even once per month, you SAVE money with membership. Most members save $500-$1,200 per year. Plus priority booking, discounts, and VIP treatment? It's a no-brainer."
    },
    {
      q: "Can I bring friends?",
      a: "Yes! VIP members get exclusive 'Bring a Friend' discounts. Platinum members can bring unlimited friends and everyone saves."
    }
  ];

  return (
    <div className="space-y-6">
      {faqs.map((faq, idx) => (
        <details key={idx} className="group p-6 rounded-xl bg-gradient-to-br from-slate-900/60 to-black/60 border border-white/10 cursor-pointer">
          <summary className="text-lg font-bold flex items-center justify-between">
            <span>{faq.q}</span>
            <span className="text-white group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <p className="mt-4 text-white/70 leading-relaxed">{faq.a}</p>
        </details>
      ))}
    </div>
  );
};
