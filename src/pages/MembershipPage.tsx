import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Shield, TrendingUp, Sparkles, Crown, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface MembershipTier {
  id: string;
  name: string;
  slug: string;
  monthly_price: number;
  annual_price: number;
  credits_per_month: number;
  credit_value: number;
  rollover_credits: boolean;
  priority_booking: boolean;
  discount_percentage: number;
  max_guests: number;
  free_upgrades_per_month: number;
  house_calls_per_year: number;
  description: string;
  features: string[];
  badge: string | null;
  display_order: number;
}

export default function MembershipPage() {
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMembershipTiers();
  }, []);

  const loadMembershipTiers = async () => {
    try {
      const { data, error } = await supabase
        .from('membership_tiers')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setTiers(data || []);
    } catch (error) {
      console.error('Error loading tiers:', error);
      toast.error('Failed to load membership tiers');
    } finally {
      setLoading(false);
    }
  };

  const calculateROI = (creditValue: number, monthlyPrice: number) => {
    const roi = ((creditValue - monthlyPrice) / monthlyPrice * 100).toFixed(0);
    return `${roi}%`;
  };

  const calculateAnnualSavings = (monthlyPrice: number, annualPrice: number) => {
    const monthlyCost = monthlyPrice * 12;
    return monthlyCost - annualPrice;
  };

  const MembershipTierCard = ({ tier }: { tier: MembershipTier }) => {
    const roi = calculateROI(tier.credit_value, tier.monthly_price);
    const annualSavings = calculateAnnualSavings(tier.monthly_price, tier.annual_price);

    return (
      <Card className={`bg-slate-900 border-2 hover:border-emerald-500 transition-all hover:scale-105 ${tier.badge ? 'border-emerald-500 relative' : 'border-slate-700'}`}>
        {tier.badge && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
            <Badge className="bg-emerald-500 text-black font-bold px-6 py-2 text-sm">
              ⭐ {tier.badge}
            </Badge>
          </div>
        )}

        <CardHeader className="text-center pt-8">
          <CardTitle className="text-3xl font-serif text-white mb-2">
            {tier.name}
          </CardTitle>
          <CardDescription className="text-gray-400 mb-4">
            {tier.description}
          </CardDescription>

          <div className="space-y-2">
            <div className="text-5xl font-bold text-white">
              ${tier.monthly_price}
              <span className="text-lg text-gray-400">/mo</span>
            </div>
            <div className="inline-block bg-emerald-500 text-black px-4 py-2 rounded-lg font-bold">
              {roi} MORE VALUE
            </div>
            <p className="text-sm text-gray-400">
              Get ${tier.credit_value} worth of services
            </p>
            {tier.annual_price && (
              <p className="text-xs text-emerald-400">
                Save ${annualSavings.toFixed(0)}/year with annual plan
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-3">
            {tier.features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-lg py-6">
              Start Saving Now
            </Button>
            {tier.annual_price && (
              <Button variant="outline" className="w-full border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-black">
                Get Annual ({Math.round((annualSavings / (tier.monthly_price * 12)) * 100)}% off)
              </Button>
            )}
          </div>

          <p className="text-xs text-center text-gray-500">
            Cancel anytime. No contracts.
          </p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white py-20 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="w-12 h-12 text-emerald-500" />
            <h1 className="text-6xl font-serif drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
              Membership
            </h1>
          </div>
          <p className="text-3xl mb-4 text-emerald-400 font-bold flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8" />
            Never Pay Full Price Again
            <Sparkles className="w-8 h-8" />
          </p>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Save 10-30% on every service + get exclusive perks.
            The more you visit, the more you save.
          </p>
        </div>

        {/* Membership Tiers */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading membership options...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {tiers.map(tier => (
              <MembershipTierCard key={tier.id} tier={tier} />
            ))}
          </div>
        )}

        {/* Hormozi-style Guarantee */}
        <div className="bg-gradient-to-r from-emerald-900/30 to-emerald-700/30 border-2 border-emerald-500 rounded-lg p-12 text-center mb-8">
          <Shield className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-4xl font-bold mb-6 text-white">
            🛡️ 60-Day Money-Back Guarantee
          </h3>
          <p className="text-2xl mb-4 text-gray-200">
            Try any membership for 60 days. If you don't LOVE it,
            we'll refund every penny - no questions asked.
          </p>
          <p className="text-3xl font-bold text-emerald-400 mb-4">
            Plus, you keep all the credits you've used!
          </p>
          <p className="text-xl text-gray-300">
            You literally can't lose. Either you save money and love it,
            or you get your money back AND keep the value.
            <br />
            <strong className="text-white text-2xl">That's our promise.</strong>
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-900 border-slate-700 text-center p-6">
            <Zap className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h4 className="font-bold text-white mb-2">Instant Savings</h4>
            <p className="text-sm text-gray-400">Save 10-30% on every service from day one</p>
          </Card>

          <Card className="bg-slate-900 border-slate-700 text-center p-6">
            <Crown className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h4 className="font-bold text-white mb-2">VIP Treatment</h4>
            <p className="text-sm text-gray-400">Priority booking and exclusive perks</p>
          </Card>

          <Card className="bg-slate-900 border-slate-700 text-center p-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h4 className="font-bold text-white mb-2">No Contracts</h4>
            <p className="text-sm text-gray-400">Cancel anytime, no questions asked</p>
          </Card>

          <Card className="bg-slate-900 border-slate-700 text-center p-6">
            <TrendingUp className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h4 className="font-bold text-white mb-2">Credits Roll Over</h4>
            <p className="text-sm text-gray-400">Never lose value (Glow Getter & VIP Luxe)</p>
          </Card>
        </div>

        {/* Urgency */}
        <div className="text-center bg-amber-900/20 border-2 border-amber-500 rounded-lg p-8">
          <p className="text-2xl text-amber-400 font-bold flex items-center justify-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6" />
            ⚡ Limited Time: First 50 Members Get FREE $100 Welcome Bonus
          </p>
          <p className="text-lg text-gray-300">23 spots remaining</p>
        </div>

        {/* FAQ Teaser */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Still have questions?</h3>
          <p className="text-gray-400 mb-6">
            Our team is here to help you find the perfect membership tier.
          </p>
          <Button variant="outline" className="border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-black">
            Contact Us
          </Button>
        </div>
      </div>
    </div>
  );
}
