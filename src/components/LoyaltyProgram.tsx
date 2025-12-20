import { useState, useEffect } from 'react';
import { useUser, useAuth, SignIn } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Gift, Star, Trophy, Zap, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type LoyaltyReward = {
  id: string;
  name: string;
  description: string | null;
  points_required: number;
  category: 'service' | 'product' | 'experience';
  available: boolean;
};

export const LoyaltyProgram = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();

  const [userPoints, setUserPoints] = useState(0);
  const [userTier, setUserTier] = useState('Bronze');
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedeeming, setIsRedeeming] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      fetchUserData();
      fetchRewards();
    } else if (isLoaded && !user) {
      setIsLoading(false);
    }
  }, [user, isLoaded]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('loyalty_points')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user data:', error);
      } else {
        const points = profile?.loyalty_points || 0;
        setUserPoints(points);
        setUserTier(getTierFromPoints(points));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchRewards = async () => {
    try {
      // For now, use mock data until the table is created
      // In production, this would be:
      // const { data, error } = await supabase.from('loyalty_rewards').select('*').eq('available', true);
      const mockRewards: LoyaltyReward[] = [
        {
          id: '1',
          name: 'Free Hair Wash',
          description: 'Complimentary hair wash with any service',
          points_required: 500,
          category: 'service',
          available: true
        },
        {
          id: '2',
          name: '10% Off Next Service',
          description: 'Discount on your next appointment',
          points_required: 750,
          category: 'service',
          available: true
        },
        {
          id: '3',
          name: 'Luxury Spa Gift Set',
          description: 'Premium skincare products worth $50',
          points_required: 1000,
          category: 'product',
          available: true
        },
        {
          id: '4',
          name: 'VIP Experience',
          description: 'Exclusive access to new services and priority booking',
          points_required: 1500,
          category: 'experience',
          available: false
        }
      ];
      setRewards(mockRewards);
    } catch (error) {
      console.error('Error fetching rewards:', error);
    }
  };

  const getTierFromPoints = (points: number): string => {
    if (points >= 2000) return 'Platinum';
    if (points >= 1000) return 'Gold';
    if (points >= 500) return 'Silver';
    return 'Bronze';
  };

  const getTierInfo = (tier: string) => {
    const tiers = {
      Bronze: { min: 0, max: 499, color: 'bg-amber-600' },
      Silver: { min: 500, max: 999, color: 'bg-gray-400' },
      Gold: { min: 1000, max: 1999, color: 'bg-yellow-500' },
      Platinum: { min: 2000, max: Infinity, color: 'bg-rose-500' }
    };
    return tiers[tier as keyof typeof tiers];
  };

  const currentTier = getTierInfo(userTier);
  const nextTier = userTier === 'Platinum' ? null : getTierInfo(
    userTier === 'Bronze' ? 'Silver' : userTier === 'Silver' ? 'Gold' : 'Platinum'
  );

  const progressToNextTier = nextTier ? ((userPoints - currentTier.min) / (nextTier.min - currentTier.min)) * 100 : 100;

  const redeemReward = async (reward: LoyaltyReward) => {
    if (!user || userPoints < reward.points_required) return;

    setIsRedeeming(true);
    try {
      // Use the database function to redeem points
      const { data, error } = await supabase.rpc('redeem_loyalty_points', {
        p_user_id: user.id,
        p_points: reward.points_required,
        p_reward_type: reward.name
      });

      if (error) {
        console.error('Error redeeming reward:', error);
        alert('Failed to redeem reward. Please try again.');
      } else {
        // Update local state
        setUserPoints(prev => prev - reward.points_required);
        setUserTier(getTierFromPoints(userPoints - reward.points_required));
        alert(`Successfully redeemed ${reward.name}!`);
      }
    } catch (error) {
      console.error('Error redeeming reward:', error);
      alert('Failed to redeem reward. Please try again.');
    } finally {
      setIsRedeeming(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-serif luxury-glow mb-4">Zavira Loyalty Program</h1>
          <p className="text-muted-foreground text-lg mb-8">Earn points with every visit and unlock exclusive rewards</p>
        </div>

        <Card className="frosted-glass border-white/10 max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Sign In Required</CardTitle>
            <CardDescription className="text-center">
              Please sign in to view your loyalty points and available rewards.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <SignIn routing="path" path="/sign-in" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-serif luxury-glow mb-4">Zavira Loyalty Program</h1>
        <p className="text-muted-foreground text-lg">Earn points with every visit and unlock exclusive rewards</p>
      </div>

      {/* Points Balance & Tier */}
      <Card className="frosted-glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-400" />
            Your Loyalty Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{userPoints.toLocaleString()} Points</p>
              <Badge className={`${currentTier.color} text-white mt-2`}>
                {userTier} Member
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Current Tier</p>
              <p className="text-lg font-semibold">{userTier}</p>
            </div>
          </div>

          {nextTier && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to {userTier === 'Bronze' ? 'Silver' : userTier === 'Silver' ? 'Gold' : 'Platinum'}</span>
                <span>{Math.round(progressToNextTier)}%</span>
              </div>
              <Progress value={progressToNextTier} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {nextTier.min - userPoints} more points to reach next tier
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How to Earn Points */}
      <Card className="frosted-glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-violet-400" />
            How to Earn Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-violet-500/20 rounded-full flex items-center justify-center">
                  <span className="text-violet-400 font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium">Book a Service</p>
                  <p className="text-sm text-muted-foreground">Earn 100 points per $50 spent</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-violet-500/20 rounded-full flex items-center justify-center">
                  <span className="text-violet-400 font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium">Leave a Review</p>
                  <p className="text-sm text-muted-foreground">Earn 50 points for each review</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-violet-500/20 rounded-full flex items-center justify-center">
                  <span className="text-violet-400 font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium">Refer a Friend</p>
                  <p className="text-sm text-muted-foreground">Earn 200 points when they book</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-violet-500/20 rounded-full flex items-center justify-center">
                  <span className="text-violet-400 font-bold">4</span>
                </div>
                <div>
                  <p className="font-medium">Birthday Special</p>
                  <p className="text-sm text-muted-foreground">Double points on your birthday month</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Rewards */}
      <Card className="frosted-glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-green-400" />
            Available Rewards
          </CardTitle>
          <CardDescription>Redeem your points for exclusive benefits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rewards.map(reward => (
              <div
                key={reward.id}
                className={`p-4 border rounded-lg transition-all ${
                  reward.available
                    ? 'border-white/20 hover:border-white/40 bg-black/20'
                    : 'border-white/10 bg-black/10 opacity-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-white">{reward.name}</h3>
                    <p className="text-sm text-muted-foreground">{reward.description}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {reward.category}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm font-medium">{reward.points_required} points</span>
                  <Button
                    size="sm"
                    disabled={!reward.available || userPoints < reward.points_required || isRedeeming}
                    onClick={() => redeemReward(reward)}
                    className="luxury-button-hover"
                  >
                    {isRedeeming ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : userPoints >= reward.points_required ? (
                      'Redeem'
                    ) : (
                      'Not Enough'
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tier Benefits */}
      <Card className="frosted-glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            Tier Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-amber-600/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-amber-400 font-bold">B</span>
              </div>
              <h3 className="font-medium mb-1">Bronze</h3>
              <p className="text-xs text-muted-foreground">Base benefits</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-gray-400/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-gray-400 font-bold">S</span>
              </div>
              <h3 className="font-medium mb-1">Silver</h3>
              <p className="text-xs text-muted-foreground">Priority booking</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-yellow-400 font-bold">G</span>
              </div>
              <h3 className="font-medium mb-1">Gold</h3>
              <p className="text-xs text-muted-foreground">Exclusive discounts</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-rose-400 font-bold">P</span>
              </div>
              <h3 className="font-medium mb-1">Platinum</h3>
              <p className="text-xs text-muted-foreground">VIP experiences</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};