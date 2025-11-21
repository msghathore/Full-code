import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Gift, Star, Trophy, Zap } from 'lucide-react';

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  category: 'service' | 'product' | 'experience';
  available: boolean;
}

const mockRewards: Reward[] = [
  {
    id: '1',
    name: 'Free Hair Wash',
    description: 'Complimentary hair wash with any service',
    pointsRequired: 500,
    category: 'service',
    available: true
  },
  {
    id: '2',
    name: '10% Off Next Service',
    description: 'Discount on your next appointment',
    pointsRequired: 750,
    category: 'service',
    available: true
  },
  {
    id: '3',
    name: 'Luxury Spa Gift Set',
    description: 'Premium skincare products worth $50',
    pointsRequired: 1000,
    category: 'product',
    available: true
  },
  {
    id: '4',
    name: 'VIP Experience',
    description: 'Exclusive access to new services and priority booking',
    pointsRequired: 1500,
    category: 'experience',
    available: false
  }
];

export const LoyaltyProgram = () => {
  const [userPoints, setUserPoints] = useState(650);
  const [userTier, setUserTier] = useState('Silver'); // Bronze, Silver, Gold, Platinum

  const getTierInfo = (tier: string) => {
    const tiers = {
      Bronze: { min: 0, max: 499, color: 'bg-amber-600' },
      Silver: { min: 500, max: 999, color: 'bg-gray-400' },
      Gold: { min: 1000, max: 1999, color: 'bg-yellow-500' },
      Platinum: { min: 2000, max: Infinity, color: 'bg-purple-500' }
    };
    return tiers[tier as keyof typeof tiers];
  };

  const currentTier = getTierInfo(userTier);
  const nextTier = userTier === 'Platinum' ? null : getTierInfo(
    userTier === 'Bronze' ? 'Silver' : userTier === 'Silver' ? 'Gold' : 'Platinum'
  );

  const progressToNextTier = nextTier ? ((userPoints - currentTier.min) / (nextTier.min - currentTier.min)) * 100 : 100;

  const redeemReward = (reward: Reward) => {
    if (userPoints >= reward.pointsRequired) {
      setUserPoints(prev => prev - reward.pointsRequired);
      // In real app, this would call an API
      alert(`Successfully redeemed ${reward.name}!`);
    }
  };

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
            <Zap className="w-6 h-6 text-blue-400" />
            How to Earn Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <span className="text-blue-400 font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium">Book a Service</p>
                  <p className="text-sm text-muted-foreground">Earn 100 points per $50 spent</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <span className="text-blue-400 font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium">Leave a Review</p>
                  <p className="text-sm text-muted-foreground">Earn 50 points for each review</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <span className="text-blue-400 font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium">Refer a Friend</p>
                  <p className="text-sm text-muted-foreground">Earn 200 points when they book</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <span className="text-blue-400 font-bold">4</span>
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
            {mockRewards.map(reward => (
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
                  <span className="text-sm font-medium">{reward.pointsRequired} points</span>
                  <Button
                    size="sm"
                    disabled={!reward.available || userPoints < reward.pointsRequired}
                    onClick={() => redeemReward(reward)}
                    className="luxury-button-hover"
                  >
                    {userPoints >= reward.pointsRequired ? 'Redeem' : 'Not Enough'}
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
            <Trophy className="w-6 h-6 text-purple-400" />
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
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-purple-400 font-bold">P</span>
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