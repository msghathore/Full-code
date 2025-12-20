import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Gift, Users, Copy, Share2, Trophy, Star, CheckCircle, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useAuth } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Referral = Tables<'referrals'>;
type ReferralReward = Tables<'referral_rewards'>;


export const ReferralProgram = () => {
   const { user, isLoaded: userLoaded } = useUser();
   const { isSignedIn } = useAuth();
   const [referrals, setReferrals] = useState<Referral[]>([]);
   const [rewards, setRewards] = useState<ReferralReward[]>([]);
   const [referralCode, setReferralCode] = useState('');
   const [newReferralEmail, setNewReferralEmail] = useState('');
   const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
   const [isLoading, setIsLoading] = useState(true);
   const { toast } = useToast();

   // Generate referral code based on user ID
   useEffect(() => {
     if (user?.id) {
       setReferralCode(`ZAVIRA${user.id.slice(-6).toUpperCase()}`);
     }
   }, [user?.id]);

   // Fetch referrals and rewards data
   useEffect(() => {
     if (!isSignedIn || !user?.id) {
       setIsLoading(false);
       return;
     }

     const fetchData = async () => {
       try {
         setIsLoading(true);

         // Fetch referrals
         const { data: referralsData, error: referralsError } = await supabase
           .from('referrals')
           .select('*')
           .eq('referrer_user_id', user.id)
           .order('created_at', { ascending: false });

         if (referralsError) throw referralsError;

         // Fetch rewards
         const { data: rewardsData, error: rewardsError } = await supabase
           .from('referral_rewards')
           .select('*')
           .eq('user_id', user.id)
           .order('points_required', { ascending: true });

         if (rewardsError) throw rewardsError;

         setReferrals(referralsData || []);
         setRewards(rewardsData || []);
       } catch (error) {
         console.error('Error fetching referral data:', error);
         toast({
           title: "Error",
           description: "Failed to load referral data. Please try again.",
           variant: "destructive",
         });
       } finally {
         setIsLoading(false);
       }
     };

     fetchData();
   }, [isSignedIn, user?.id, toast]);

   const totalReferrals = referrals.length;
  const completedReferrals = referrals.filter(r => r.status === 'completed' || r.status === 'rewarded').length;
  const totalPoints = referrals.reduce((sum, r) => sum + (r.rewardEarned || 0), 0);
  const availablePoints = totalPoints - rewards.filter(r => r.claimed).reduce((sum, r) => sum + r.pointsRequired, 0);

  const handleSendInvite = async () => {
    if (!newReferralEmail || !user?.id) {
      toast({
        title: "Email Required",
        description: "Please enter an email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if referral already exists
      const { data: existingReferral } = await supabase
        .from('referrals')
        .select('id')
        .eq('referrer_user_id', user.id)
        .eq('referred_email', newReferralEmail)
        .single();

      if (existingReferral) {
        toast({
          title: "Already Invited",
          description: "You've already sent an invitation to this email address.",
          variant: "destructive",
        });
        return;
      }

      // Create new referral
      const { error } = await supabase
        .from('referrals')
        .insert({
          referrer_user_id: user.id,
          referred_email: newReferralEmail,
          referral_code: referralCode,
          status: 'pending'
        });

      if (error) throw error;

      // Refresh referrals data
      const { data: updatedReferrals } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_user_id', user.id)
        .order('created_at', { ascending: false });

      setReferrals(updatedReferrals || []);

      toast({
        title: "Invitation Sent!",
        description: `Referral invitation sent to ${newReferralEmail}`,
      });

      setNewReferralEmail('');
      setIsInviteDialogOpen(false);
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard",
    });
  };

  const handleClaimReward = (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward || reward.claimed) return;

    if (availablePoints >= reward.pointsRequired) {
      setRewards(prev => prev.map(r =>
        r.id === rewardId ? { ...r, claimed: true } : r
      ));

      toast({
        title: "Reward Claimed!",
        description: `You've successfully claimed: ${reward.name}`,
      });
    } else {
      toast({
        title: "Insufficient Points",
        description: `You need ${reward.pointsRequired - availablePoints} more points to claim this reward.`,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'rewarded': return 'bg-blue-500/20 text-blue-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-serif text-white mb-4">Referral Program</h2>
        <p className="text-gray-300">Share the beauty experience and earn rewards for bringing friends to Zavira</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-black/50 border-white/10">
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-pink-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{totalReferrals}</div>
            <div className="text-sm text-gray-400">Total Referrals</div>
          </CardContent>
        </Card>

        <Card className="bg-black/50 border-white/10">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{completedReferrals}</div>
            <div className="text-sm text-gray-400">Completed</div>
          </CardContent>
        </Card>

        <Card className="bg-black/50 border-white/10">
          <CardContent className="p-6 text-center">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{totalPoints}</div>
            <div className="text-sm text-gray-400">Points Earned</div>
          </CardContent>
        </Card>

        <Card className="bg-black/50 border-white/10">
          <CardContent className="p-6 text-center">
            <Gift className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{availablePoints}</div>
            <div className="text-sm text-gray-400">Available Points</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Referral Code & Invitations */}
        <div className="space-y-6">
          <Card className="bg-black/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Share2 className="w-5 h-5 mr-2" />
                Your Referral Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <Input
                  value={referralCode}
                  readOnly
                  className="bg-black/30 border-white/10 text-white font-mono text-lg"
                />
                <Button onClick={handleCopyCode} variant="outline" className="border-pink-500 text-pink-400 hover:bg-pink-500/10">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                Share this code with friends. When they book their first service using your code, you both get rewarded!
              </p>

              <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-600 hover:to-amber-700">
                    <Share2 className="w-4 h-4 mr-2" />
                    Send Invitation
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-black/90 border-white/10">
                  <DialogHeader>
                    <DialogTitle className="text-white">Invite a Friend</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Friend's Email
                      </label>
                      <Input
                        type="email"
                        value={newReferralEmail}
                        onChange={(e) => setNewReferralEmail(e.target.value)}
                        placeholder="friend@example.com"
                        className="bg-black/50 border-white/10 text-white"
                      />
                    </div>
                    <Button
                      onClick={handleSendInvite}
                      className="w-full bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-600 hover:to-amber-700"
                    >
                      Send Invitation
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Referral List */}
          <Card className="bg-black/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Your Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {referrals.map((referral) => (
                  <div key={referral.id} className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                    <div>
                      <div className="font-medium text-white">{referral.name}</div>
                      <div className="text-sm text-gray-400">{referral.email}</div>
                      {referral.joinedDate && (
                        <div className="text-xs text-gray-500">Joined: {referral.joinedDate}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(referral.status)}>
                        {referral.status}
                      </Badge>
                      {referral.rewardEarned && (
                        <div className="text-sm text-yellow-400 mt-1">
                          +{referral.rewardEarned} points
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rewards */}
        <div>
          <Card className="bg-black/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                Available Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rewards.map((reward) => (
                  <div key={reward.id} className="p-4 bg-black/30 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-white">{reward.name}</h4>
                        <p className="text-sm text-gray-400">{reward.description}</p>
                      </div>
                      {reward.claimed && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Points needed: {reward.pointsRequired}</span>
                        <span className="text-yellow-400">{availablePoints}/{reward.pointsRequired}</span>
                      </div>
                      <Progress
                        value={(availablePoints / reward.pointsRequired) * 100}
                        className="h-2"
                      />
                    </div>

                    {!reward.claimed && (
                      <Button
                        onClick={() => handleClaimReward(reward.id)}
                        disabled={availablePoints < reward.pointsRequired}
                        className="w-full bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-600 hover:to-amber-700 disabled:opacity-50"
                      >
                        {availablePoints >= reward.pointsRequired ? 'Claim Reward' : 'Not Enough Points'}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* How it Works */}
          <Card className="bg-black/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                  <div>Share your referral code with friends</div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                  <div>Friends book their first service using your code</div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                  <div>You both earn 50 points when they complete their service</div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">4</div>
                  <div>Redeem points for exclusive rewards and discounts</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};