import { motion } from 'framer-motion';
import { Crown, TrendingUp, Users, Gift, Sparkles, CheckCircle2, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { SocialProofNotification } from './SocialProofNotification';
import { CountdownTimer } from './CountdownTimer';

/**
 * HORMOZI PRINCIPLE: VIP Membership = Recurring Revenue = The Real Money
 * This section should be LOUD, PROMINENT, and above everything else
 *
 * Messaging Focus:
 * - Stop paying full price
 * - Save 20-30% on EVERY visit
 * - One payment, unlimited luxury
 * - This is the smartest investment in yourself
 */

export const VIPMembershipHero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-20 px-4 bg-gradient-to-b from-slate-950 via-black to-slate-950 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/30 rounded-full">
            <Crown className="w-5 h-5 text-white" />
            <span className="text-white font-bold text-sm uppercase tracking-wider">
              THE SMARTEST DECISION YOU'LL MAKE
            </span>
          </div>
        </motion.div>

        {/* Main Headline - Hormozi-style: Outcome-based, not feature-based */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-6"
        >
          <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] mb-4">
            STOP PAYING FULL PRICE
          </h2>
          <h3 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
            Join ZAVIRA VIP Club
          </h3>
        </motion.div>

        {/* Subheadline - The Hook */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mb-8"
        >
          <p className="text-2xl md:text-3xl text-white/90 max-w-4xl mx-auto mb-4">
            One monthly payment. <span className="text-white font-bold">Unlimited luxury</span>.
          </p>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            The smartest investment in yourself you'll ever make.
          </p>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex justify-center mb-12"
        >
          <SocialProofNotification type="joined" />
        </motion.div>

        {/* Value Props - The Numbers That Matter */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12"
        >
          <StatCard
            icon={<Zap className="w-8 h-8" />}
            value="$200+"
            label="Value per month"
            subtext="Pay $149, Get $200+"
          />
          <StatCard
            icon={<Users className="w-8 h-8" />}
            value="500+"
            label="VIP Members"
            subtext="Join the elite club"
          />
          <StatCard
            icon={<Gift className="w-8 h-8" />}
            value="20-30%"
            label="Savings"
            subtext="Every. Single. Visit."
          />
        </motion.div>

        {/* The Two Tiers - Simple Choice */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 1 }}
          className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12"
        >
          {/* Basic VIP */}
          <div className="relative rounded-2xl border-2 border-white/20 p-8 bg-gradient-to-br from-slate-900/80 to-black/80 backdrop-blur hover:border-white/50 transition-all duration-300">
            <div className="mb-6">
              <h4 className="text-2xl font-serif font-bold mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]">
                Basic VIP
              </h4>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">$149</span>
                <span className="text-white/60">/month</span>
              </div>
              <p className="text-white/70 mt-2">Perfect for regular visits</p>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                '20% off all services',
                '$150 monthly credits',
                'Priority booking access',
                'Skip the waitlist',
                'Free birthday upgrade',
                'Rollover unused credits'
              ].map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2 text-white/80">
                  <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => navigate('/membership')}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-6 text-lg font-bold"
            >
              Join Basic VIP
            </Button>
          </div>

          {/* Elite VIP - Featured */}
          <div className="relative rounded-2xl border-2 border-white p-8 bg-gradient-to-br from-white/20 to-black/80 backdrop-blur shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            {/* Best Value Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-white to-white/90 rounded-full">
              <span className="text-black font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                BEST VALUE
              </span>
            </div>

            <div className="mb-6 mt-4">
              <h4 className="text-2xl font-serif font-bold mb-2 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                Elite VIP
              </h4>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">$249</span>
                <span className="text-white/60">/month</span>
              </div>
              <p className="text-white mt-2 font-semibold">Ultimate luxury experience</p>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                '30% off all services',
                '$300 monthly credits',
                'VIP Fast-Track Booking',
                'Free monthly upgrade',
                '2 House calls per year',
                'Unlimited guest passes',
                'Exclusive member events',
                'Lifetime loyalty rewards'
              ].map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2 text-white">
                  <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <span className="font-medium">{benefit}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => navigate('/membership')}
              className="w-full bg-white hover:bg-white/90 text-black py-6 text-lg font-bold shadow-[0_0_20px_rgba(255,255,255,0.4)]"
            >
              Join Elite VIP
            </Button>
          </div>
        </motion.div>

        {/* Urgency - Limited Spots */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-center"
        >
          <p className="text-white/60 mb-4 flex items-center justify-center gap-2">
            <Zap className="w-5 h-5 text-white" />
            Limited spots available this month
          </p>
          <CountdownTimer size="lg" className="justify-center mb-8" />

          <Button
            onClick={() => navigate('/membership')}
            variant="outline"
            className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-6 text-lg font-semibold transition-all rounded-full inline-flex items-center gap-2"
          >
            See Full Membership Benefits
            <ArrowRight className="w-5 h-5" />
          </Button>
        </motion.div>

        {/* Guarantee */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="text-center mt-12"
        >
          <p className="text-white/80 text-sm">
            ✓ Cancel anytime • ✓ 100% Satisfaction Guaranteed • ✓ No long-term contracts
          </p>
        </motion.div>
      </div>
    </section>
  );
};

// Stat Card Component
interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  subtext: string;
}

const StatCard = ({ icon, value, label, subtext }: StatCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="relative rounded-xl border border-white/10 p-6 bg-gradient-to-br from-white/5 to-transparent backdrop-blur text-center"
    >
      <div className="flex justify-center mb-4 text-white">
        {icon}
      </div>
      <div className="text-4xl font-bold mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]">
        {value}
      </div>
      <div className="text-lg font-semibold mb-1 text-white/90">
        {label}
      </div>
      <div className="text-sm text-white/60">
        {subtext}
      </div>
    </motion.div>
  );
};
