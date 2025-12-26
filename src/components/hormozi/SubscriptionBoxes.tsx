import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Package, Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface SubscriptionBox {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  monthly_price: number;
  retail_value: number;
  included_products: Array<{ name: string; value: number }>;
  image_url: string | null;
  is_active: boolean;
}

export const SubscriptionBoxes = () => {
  const navigate = useNavigate();

  const { data: boxes, isLoading } = useQuery({
    queryKey: ['subscription-boxes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_boxes')
        .select('*')
        .eq('is_active', true)
        .order('monthly_price', { ascending: true });

      if (error) throw error;
      return data as SubscriptionBox[];
    }
  });

  if (isLoading) {
    return null;
  }

  if (!boxes || boxes.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-black via-slate-950 to-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-6">
            <Package className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold text-sm uppercase tracking-wider">
              PRODUCT SUBSCRIPTIONS
            </span>
          </div>

          <h2 className="font-serif text-5xl md:text-6xl font-bold mb-6 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
            Never Run Out Again
          </h2>

          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Get your favorite salon products delivered monthly.
            <span className="text-emerald-400 font-bold"> Save 30-40%</span> vs. buying retail.
          </p>
        </div>

        {/* Boxes Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {boxes.map((box) => (
            <SubscriptionBoxCard key={box.id} box={box} onSubscribe={() => navigate('/booking')} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center p-8 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-2xl max-w-4xl mx-auto">
          <Sparkles className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-3">NEVER PAY FULL PRICE</h3>
          <p className="text-white/80 max-w-2xl mx-auto mb-6">
            Subscribe once, save forever. Cancel anytime. Skip or pause months. 100% flexible.
          </p>
          <Button
            onClick={() => navigate('/booking')}
            size="lg"
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-lg px-8 py-6 rounded-xl"
          >
            START SAVING TODAY
          </Button>
        </div>
      </div>
    </section>
  );
};

interface SubscriptionBoxCardProps {
  box: SubscriptionBox;
  onSubscribe: () => void;
}

const SubscriptionBoxCard = ({ box, onSubscribe }: SubscriptionBoxCardProps) => {
  const savings = box.retail_value - box.monthly_price;
  const savingsPercent = Math.round((savings / box.retail_value) * 100);

  return (
    <div className="group relative rounded-2xl border-2 border-white/10 p-6 transition-all duration-300 hover:border-emerald-500/50 hover:scale-105 bg-gradient-to-br from-slate-900/80 to-black/80 backdrop-blur">
      {/* Category Badge */}
      <div className="absolute -top-3 left-6 px-4 py-1 bg-black border border-white/20 rounded-full">
        <span className="text-white/60 text-xs uppercase tracking-wider">
          {box.category.replace('_', ' ')}
        </span>
      </div>

      {/* Box Name */}
      <div className="mt-4 mb-6">
        <h3 className="font-serif text-2xl font-bold mb-2 group-hover:text-emerald-400 transition-colors">
          {box.name}
        </h3>
        {box.description && (
          <p className="text-white/70 text-sm">
            {box.description}
          </p>
        )}
      </div>

      {/* Pricing */}
      <div className="mb-6 pb-6 border-b border-white/10">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl font-bold text-emerald-400">
            ${box.monthly_price.toFixed(0)}
          </span>
          <span className="text-white/60">/month</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/40 line-through text-sm">
            ${box.retail_value.toFixed(0)} retail
          </span>
          <span className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/50 rounded text-emerald-400 text-xs font-bold">
            SAVE {savingsPercent}%
          </span>
        </div>
      </div>

      {/* Included Products */}
      <div className="mb-6">
        <h4 className="text-white/80 font-semibold mb-3 text-sm uppercase tracking-wider">
          What's Inside:
        </h4>
        <ul className="space-y-2">
          {box.included_products.map((product, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-white/70">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span>
                {product.name} <span className="text-white/40">(${product.value})</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Button */}
      <Button
        onClick={onSubscribe}
        size="lg"
        className="w-full bg-white/10 hover:bg-emerald-500 border-2 border-white/20 hover:border-emerald-500 font-bold text-lg py-6 rounded-xl transition-all group-hover:bg-emerald-500 group-hover:border-emerald-500"
      >
        <TrendingUp className="w-5 h-5 mr-2" />
        SUBSCRIBE & SAVE
      </Button>

      <p className="text-center text-white/40 text-xs mt-3">
        Cancel or pause anytime
      </p>
    </div>
  );
};
