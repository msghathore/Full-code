import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Mail, MessageCircle, CheckCircle2, Gift, Users, DollarSign, Sparkles, Facebook, Twitter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SocialProofNotification } from '@/components/hormozi';

interface ReferralProgram {
  id: string;
  name: string;
  description: string | null;
  program_type: string;
  reward_type: string;
  reward_value: number;
  referee_reward_type: string | null;
  referee_reward_value: number | null;
  terms: string | null;
  min_purchase: number | null;
  max_referrals: number | null;
  is_active: boolean;
}

interface ReferralStats {
  total_referrals: number;
  successful_referrals: number;
  pending_referrals: number;
  total_rewards_earned: number;
  available_rewards: number;
}

export default function ReferralProgram() {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState(false);

  // Fetch active referral programs
  const { data: programs, isLoading: programsLoading } = useQuery({
    queryKey: ['referral-programs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('referral_programs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ReferralProgram[];
    }
  });

  // Get current user's referral code
  const { data: userSession } = useQuery({
    queryKey: ['user-session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    }
  });

  // Generate or fetch user's referral code
  const { data: referralCode } = useQuery({
    queryKey: ['referral-code', userSession?.user?.id],
    queryFn: async () => {
      if (!userSession?.user?.id) return null;

      // Check if user has a referral code
      const { data: profile } = await supabase
        .from('customer_profiles')
        .select('referral_code')
        .eq('user_id', userSession.user.id)
        .single();

      if (profile?.referral_code) {
        return profile.referral_code;
      }

      // Generate new referral code
      const code = `ZAVIRA${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Update profile with referral code
      const { error } = await supabase
        .from('customer_profiles')
        .update({ referral_code: code })
        .eq('user_id', userSession.user.id);

      if (error) throw error;
      return code;
    },
    enabled: !!userSession?.user?.id
  });

  // Fetch referral stats
  const { data: stats } = useQuery({
    queryKey: ['referral-stats', userSession?.user?.id],
    queryFn: async () => {
      if (!userSession?.user?.id) return null;

      // Get customer profile
      const { data: profile } = await supabase
        .from('customer_profiles')
        .select('id')
        .eq('user_id', userSession.user.id)
        .single();

      if (!profile) return null;

      // Get referral stats
      const { data: referrals } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_customer_id', profile.id);

      const totalReferrals = referrals?.length || 0;
      const successfulReferrals = referrals?.filter(r => r.status === 'completed').length || 0;
      const pendingReferrals = referrals?.filter(r => r.status === 'pending').length || 0;
      const totalRewardsEarned = referrals?.reduce((sum, r) => sum + (r.reward_earned || 0), 0) || 0;
      const availableRewards = referrals?.filter(r => r.status === 'completed' && !r.reward_claimed).reduce((sum, r) => sum + (r.reward_earned || 0), 0) || 0;

      return {
        total_referrals: totalReferrals,
        successful_referrals: successfulReferrals,
        pending_referrals: pendingReferrals,
        total_rewards_earned: totalRewardsEarned,
        available_rewards: availableRewards
      } as ReferralStats;
    },
    enabled: !!userSession?.user?.id
  });

  const mainProgram = programs?.[0];
  const referralLink = referralCode ? `${window.location.origin}/booking?ref=${referralCode}` : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedCode(true);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard"
    });
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent("Get $20 off at Zavira Salon & Spa!");
    const body = encodeURIComponent(`I love Zavira Salon & Spa and thought you might too! Use my referral link to get $20 off your first service:\n\n${referralLink}\n\nYou'll get $20 off, and I'll get $20 too!`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleShareSMS = () => {
    const message = encodeURIComponent(`Get $20 off at Zavira Salon & Spa with my referral link: ${referralLink}`);
    window.location.href = `sms:?body=${message}`;
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(referralLink);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`Get $20 off at Zavira Salon & Spa with my referral link!`);
    const url = encodeURIComponent(referralLink);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  if (programsLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
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
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
              <Gift className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400 font-bold text-sm uppercase tracking-wider">
                SHARE THE LOVE, EARN REWARDS
              </span>
            </div>
          </div>

          <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-bold text-center mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">
            Refer Friends
          </h1>

          <p className="text-2xl md:text-3xl text-center text-white/90 max-w-4xl mx-auto mb-4">
            {mainProgram?.reward_type === 'credit' && mainProgram?.reward_value && (
              <>You Get ${mainProgram.reward_value}. They Get ${mainProgram.referee_reward_value || mainProgram.reward_value}.</>
            )}
            {mainProgram?.reward_type === 'discount' && mainProgram?.reward_value && (
              <>You Get {mainProgram.reward_value}% Off. They Get {mainProgram.referee_reward_value || mainProgram.reward_value}% Off.</>
            )}
          </p>

          <p className="text-xl text-center text-white/70 max-w-3xl mx-auto mb-8">
            Share your love for Zavira with friends and family. When they book their first service,
            <span className="text-emerald-400 font-bold"> you both win</span>.
          </p>

          <div className="flex justify-center mb-12">
            <SocialProofNotification type="booked" />
          </div>
        </div>
      </section>

      {/* Referral Code Section */}
      {userSession?.user && (
        <section className="py-16 px-4 bg-gradient-to-b from-slate-950 to-black">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-slate-900/80 to-black/80 backdrop-blur border-2 border-emerald-500/30 rounded-2xl p-8 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
              <div className="text-center mb-8">
                <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3">Your Referral Code</h2>
                <p className="text-white/70">Share this code or link with friends</p>
              </div>

              {/* Referral Code Display */}
              <div className="bg-black/50 border-2 border-emerald-500/50 rounded-xl p-6 mb-6">
                <div className="text-center mb-4">
                  <div className="text-5xl font-bold text-emerald-400 tracking-wider mb-2">
                    {referralCode || 'Loading...'}
                  </div>
                  <div className="text-white/60 text-sm break-all">
                    {referralLink}
                  </div>
                </div>

                <Button
                  onClick={handleCopyLink}
                  size="lg"
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-lg py-6 rounded-xl transition-all"
                >
                  {copiedCode ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5 mr-2" />
                      Copy Referral Link
                    </>
                  )}
                </Button>
              </div>

              {/* Share Buttons */}
              <div className="mb-6">
                <p className="text-center text-white/60 text-sm mb-4">Or share directly:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    onClick={handleShareEmail}
                    variant="outline"
                    className="border-white/20 hover:border-emerald-500/50 hover:bg-emerald-500/10"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                  <Button
                    onClick={handleShareSMS}
                    variant="outline"
                    className="border-white/20 hover:border-emerald-500/50 hover:bg-emerald-500/10"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    SMS
                  </Button>
                  <Button
                    onClick={handleShareFacebook}
                    variant="outline"
                    className="border-white/20 hover:border-emerald-500/50 hover:bg-emerald-500/10"
                  >
                    <Facebook className="w-4 h-4 mr-2" />
                    Facebook
                  </Button>
                  <Button
                    onClick={handleShareTwitter}
                    variant="outline"
                    className="border-white/20 hover:border-emerald-500/50 hover:bg-emerald-500/10"
                  >
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </Button>
                </div>
              </div>

              {/* Stats Dashboard */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/10">
                  <StatCard
                    icon={<Users className="w-5 h-5" />}
                    value={stats.total_referrals.toString()}
                    label="Total Referrals"
                  />
                  <StatCard
                    icon={<CheckCircle2 className="w-5 h-5" />}
                    value={stats.successful_referrals.toString()}
                    label="Successful"
                  />
                  <StatCard
                    icon={<DollarSign className="w-5 h-5" />}
                    value={`$${stats.total_rewards_earned}`}
                    label="Total Earned"
                  />
                  <StatCard
                    icon={<Sparkles className="w-5 h-5" />}
                    value={`$${stats.available_rewards}`}
                    label="Available"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              step={1}
              icon={<Share2 className="w-8 h-8" />}
              title="Share Your Link"
              description="Send your unique referral link to friends via email, text, or social media."
            />
            <StepCard
              step={2}
              icon={<Users className="w-8 h-8" />}
              title="Friend Books"
              description="Your friend uses your link to book their first service at Zavira."
            />
            <StepCard
              step={3}
              icon={<Gift className="w-8 h-8" />}
              title="Both Get Rewards"
              description={mainProgram?.reward_type === 'credit'
                ? `You both receive $${mainProgram.reward_value} credit to use on future services!`
                : `You both get ${mainProgram?.reward_value}% off your next service!`
              }
            />
          </div>
        </div>
      </section>

      {/* Program Details Section */}
      {mainProgram && (
        <section className="py-16 px-4 bg-gradient-to-b from-slate-950 to-black">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-slate-900/60 to-black/60 border border-white/10 rounded-2xl p-8">
              <h3 className="font-serif text-3xl font-bold mb-6 text-center">Program Details</h3>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Your Reward</p>
                    <p className="text-white/70">
                      {mainProgram.reward_type === 'credit' && `$${mainProgram.reward_value} credit`}
                      {mainProgram.reward_type === 'discount' && `${mainProgram.reward_value}% discount`}
                      {mainProgram.reward_type === 'service' && 'Free service'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Friend's Reward</p>
                    <p className="text-white/70">
                      {mainProgram.referee_reward_type === 'credit' && `$${mainProgram.referee_reward_value} credit`}
                      {mainProgram.referee_reward_type === 'discount' && `${mainProgram.referee_reward_value}% discount`}
                      {(!mainProgram.referee_reward_type && mainProgram.reward_type === 'credit') && `$${mainProgram.reward_value} credit`}
                      {(!mainProgram.referee_reward_type && mainProgram.reward_type === 'discount') && `${mainProgram.reward_value}% discount`}
                    </p>
                  </div>
                </div>

                {mainProgram.min_purchase && (
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold mb-1">Minimum Purchase</p>
                      <p className="text-white/70">${mainProgram.min_purchase} minimum service value required</p>
                    </div>
                  </div>
                )}

                {mainProgram.max_referrals && (
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold mb-1">Maximum Referrals</p>
                      <p className="text-white/70">Earn rewards for up to {mainProgram.max_referrals} successful referrals</p>
                    </div>
                  </div>
                )}
              </div>

              {mainProgram.terms && (
                <div className="pt-6 border-t border-white/10">
                  <h4 className="font-semibold mb-3">Terms & Conditions</h4>
                  <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                    {mainProgram.terms}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <Sparkles className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            Start Earning Rewards Today
          </h2>
          <p className="text-xl text-white/80 mb-8">
            {!userSession?.user ? (
              <>Sign in to get your unique referral code and start sharing!</>
            ) : (
              <>Share your code with unlimited friends and earn rewards for every successful referral.</>
            )}
          </p>
          {!userSession?.user && (
            <Button
              onClick={() => window.location.href = '/auth'}
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-xl px-12 py-8 rounded-xl shadow-lg hover:shadow-emerald-500/50 transition-all"
            >
              <Gift className="w-6 h-6 mr-2" />
              GET MY REFERRAL CODE
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

const StatCard = ({ icon, value, label }: StatCardProps) => {
  return (
    <div className="text-center">
      <div className="text-emerald-400 flex justify-center mb-2">{icon}</div>
      <div className="text-2xl font-bold text-emerald-400 mb-1">{value}</div>
      <div className="text-white/60 text-xs">{label}</div>
    </div>
  );
};

interface StepCardProps {
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const StepCard = ({ step, icon, title, description }: StepCardProps) => {
  return (
    <div className="relative p-8 rounded-2xl bg-gradient-to-br from-slate-900/60 to-black/60 border border-white/10 text-center">
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center font-bold text-xl">
        {step}
      </div>
      <div className="text-emerald-400 flex justify-center mb-4 mt-4">{icon}</div>
      <h3 className="font-serif text-2xl font-bold mb-3">{title}</h3>
      <p className="text-white/70 leading-relaxed">{description}</p>
    </div>
  );
};
