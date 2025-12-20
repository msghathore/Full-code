import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Star, Calendar, TrendingUp } from 'lucide-react';
import { socialProofService, type RecentActivity } from '@/services/socialProofService';

export const SocialProof = () => {
  const [bookingCount, setBookingCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [memberCount, setMemberCount] = useState(0);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await socialProofService.getSocialProofData();

        setBookingCount(data.bookingCount);
        setReviewCount(data.reviewCount);
        setMemberCount(data.memberCount);
        setActivities(data.activities);
      } catch (err) {
        console.error('Error fetching social proof data:', err);
        setError('Failed to load social proof data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update data periodically
  useEffect(() => {
    if (isLoading) return;

    const interval = setInterval(async () => {
      try {
        const data = await socialProofService.getSocialProofData();
        setBookingCount(data.bookingCount);
        setReviewCount(data.reviewCount);
        setMemberCount(data.memberCount);
        setActivities(data.activities);
      } catch (err) {
        console.error('Error updating social proof data:', err);
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isLoading]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Calendar className="w-4 h-4 text-blue-400" />;
      case 'review':
        return <Star className="w-4 h-4 text-yellow-400" />;
      case 'signup':
        return <Users className="w-4 h-4 text-green-400" />;
      default:
        return <TrendingUp className="w-4 h-4 text-amber-400" />;
    }
  };

  if (error) {
    return (
      <div className="py-16 bg-black/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">Unable to load social proof data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-black/50">
      <div className="container mx-auto px-4">
        {/* SOCIAL PROOF STATISTICS DISABLED - Remove comment to re-enable when ready */}
        {/* Live Counters */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="frosted-glass border-white/10 text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-blue-400 mr-2" />
                <span className="text-3xl font-bold text-white">
                  {isLoading ? '...' : formatNumber(bookingCount)}
                </span>
              </div>
              <p className="text-muted-foreground">Bookings This Month</p>
              <Badge className="mt-2 bg-green-500/20 text-green-400">
                <TrendingUp className="w-3 h-3 mr-1" />
                Live
              </Badge>
            </CardContent>
          </Card>

          <Card className="frosted-glass border-white/10 text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <Star className="w-8 h-8 text-yellow-400 mr-2" />
                <span className="text-3xl font-bold text-white">
                  {isLoading ? '...' : formatNumber(reviewCount)}
                </span>
              </div>
              <p className="text-muted-foreground">Happy Reviews</p>
              <Badge className="mt-2 bg-yellow-500/20 text-yellow-400">
                <Star className="w-3 h-3 mr-1" />
                {reviewCount > 0 ? '4.9/5' : 'No reviews yet'}
              </Badge>
            </CardContent>
          </Card>

          <Card className="frosted-glass border-white/10 text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-amber-400 mr-2" />
                <span className="text-3xl font-bold text-white">
                  {isLoading ? '...' : formatNumber(memberCount)}
                </span>
              </div>
              <p className="text-muted-foreground">Loyal Members</p>
              <Badge className="mt-2 bg-amber-500/20 text-amber-400">
                <Users className="w-3 h-3 mr-1" />
                {memberCount > 0 ? 'Growing' : 'New community'}
              </Badge>
            </CardContent>
          </Card>
        </div> */}

        {/* Recent Activity Feed */}
        {/* <Card className="frosted-glass border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center mb-6">
              <TrendingUp className="w-6 h-6 text-green-400 mr-2" />
              <h3 className="text-xl font-serif luxury-glow">Recent Activity</h3>
              <Badge className="ml-auto bg-green-500/20 text-green-400 text-xs">
                Live Feed
              </Badge>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading recent activity...</p>
                </div>
              ) : activities.length > 0 ? (
                activities.map(activity => (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No recent activity yet</p>
                </div>
              )}
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                {activities.length > 0
                  ? 'Join thousands of satisfied customers • Activity updates every few minutes'
                  : 'Be the first to book a service and leave a review!'
                }
              </p>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
};