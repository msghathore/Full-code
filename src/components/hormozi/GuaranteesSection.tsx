import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Shield, CheckCircle, Clock, DollarSign, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Guarantee {
  id: string;
  guarantee_type: string;
  title: string;
  description: string;
  icon: string | null;
  terms: string | null;
  is_active: boolean;
  display_order: number;
}

export const GuaranteesSection = () => {
  const { data: guarantees, isLoading } = useQuery({
    queryKey: ['guarantees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guarantees')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as Guarantee[];
    }
  });

  if (isLoading) {
    return null;
  }

  if (!guarantees || guarantees.length === 0) {
    return null;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'satisfaction':
        return <CheckCircle className="w-8 h-8" />;
      case 'on_time':
        return <Clock className="w-8 h-8" />;
      case 'price_match':
        return <DollarSign className="w-8 h-8" />;
      case 'results':
        return <Star className="w-8 h-8" />;
      default:
        return <Shield className="w-8 h-8" />;
    }
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-slate-950 to-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-6">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold text-sm uppercase tracking-wider">
              RISK-FREE GUARANTEE
            </span>
          </div>

          <h2 className="font-serif text-5xl md:text-6xl font-bold mb-6 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
            Our Promises To You
          </h2>

          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            We stand behind every service with
            <span className="text-emerald-400 font-bold"> ironclad guarantees</span>.
            Your satisfaction is our obsession.
          </p>
        </div>

        {/* Guarantees Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {guarantees.map((guarantee) => (
            <GuaranteeCard key={guarantee.id} guarantee={guarantee} getIcon={getIcon} />
          ))}
        </div>

        {/* Bottom Statement */}
        <div className="text-center p-8 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-emerald-500/10 border-2 border-emerald-500/30 rounded-2xl">
          <Shield className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-3">
            100% RISK-FREE
          </h3>
          <p className="text-white/80 max-w-2xl mx-auto">
            You literally <span className="text-emerald-400 font-bold">can't lose</span>.
            Either you love your experience, or we'll make it right—no questions asked.
            That's how confident we are in our work.
          </p>
        </div>
      </div>
    </section>
  );
};

interface GuaranteeCardProps {
  guarantee: Guarantee;
  getIcon: (type: string) => JSX.Element;
}

const GuaranteeCard = ({ guarantee, getIcon }: GuaranteeCardProps) => {
  return (
    <div className="group relative p-6 rounded-xl border-2 border-white/10 bg-gradient-to-br from-slate-900/80 to-black/80 backdrop-blur hover:border-emerald-500/50 transition-all duration-300">
      {/* Icon */}
      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-400 group-hover:scale-110 transition-transform">
        {guarantee.icon ? <span className="text-3xl">{guarantee.icon}</span> : getIcon(guarantee.guarantee_type)}
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold mb-3 group-hover:text-emerald-400 transition-colors">
        {guarantee.title}
      </h3>

      {/* Description */}
      <p className="text-white/70 text-sm leading-relaxed mb-4">
        {guarantee.description}
      </p>

      {/* Terms (if available) */}
      {guarantee.terms && (
        <details className="text-white/50 text-xs">
          <summary className="cursor-pointer hover:text-white/70 transition-colors">
            Terms & conditions
          </summary>
          <p className="mt-2 pl-2 border-l-2 border-white/10">
            {guarantee.terms}
          </p>
        </details>
      )}
    </div>
  );
};
