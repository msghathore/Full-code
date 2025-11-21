import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Star, Calendar, TrendingUp } from 'lucide-react';

interface RecentActivity {
  id: string;
  type: 'booking' | 'review' | 'signup';
  message: string;
  time: string;
  user?: string;
}

const mockActivities: RecentActivity[] = [
  {
    id: '1',
    type: 'booking',
    message: 'Someone just booked a facial treatment',
    time: '2 minutes ago',
    user: 'Anonymous'
  },
  {
    id: '2',
    type: 'review',
    message: 'New 5-star review: "Amazing experience!"',
    time: '5 minutes ago',
    user: 'Sarah M.'
  },
  {
    id: '3',
    type: 'booking',
    message: 'Hair styling appointment booked',
    time: '8 minutes ago',
    user: 'Anonymous'
  },
  {
    id: '4',
    type: 'signup',
    message: 'New member joined the loyalty program',
    time: '12 minutes ago',
    user: 'Anonymous'
  },
  {
    id: '5',
    type: 'review',
    message: 'New 5-star review: "Best salon in town!"',
    time: '15 minutes ago',
    user: 'John D.'
  }
];

export const SocialProof = () => {
  const [bookingCount, setBookingCount] = useState(1247);
  const [reviewCount, setReviewCount] = useState(856);
  const [memberCount, setMemberCount] = useState(2156);
  const [activities, setActivities] = useState(mockActivities);

  // Simulate live counters
  useEffect(() => {
    const interval = setInterval(() => {
      setBookingCount(prev => prev + Math.floor(Math.random() * 3));
      setReviewCount(prev => prev + Math.floor(Math.random() * 2));
      setMemberCount(prev => prev + Math.floor(Math.random() * 5));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Simulate new activities
  useEffect(() => {
    const interval = setInterval(() => {
      const newActivity: RecentActivity = {
        id: Date.now().toString(),
        type: Math.random() > 0.5 ? 'booking' : 'review',
        message: Math.random() > 0.5
          ? 'Someone just booked a service'
          : 'New 5-star review added',
        time: 'Just now',
        user: 'Anonymous'
      };

      setActivities(prev => [newActivity, ...prev.slice(0, 4)]);
    }, 45000); // New activity every 45 seconds

    return () => clearInterval(interval);
  }, []);

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
        return <TrendingUp className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="py-16 bg-black/50">
      <div className="container mx-auto px-4">
        {/* Live Counters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="frosted-glass border-white/10 text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-blue-400 mr-2" />
                <span className="text-3xl font-bold text-white">{formatNumber(bookingCount)}</span>
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
                <span className="text-3xl font-bold text-white">{formatNumber(reviewCount)}</span>
              </div>
              <p className="text-muted-foreground">Happy Reviews</p>
              <Badge className="mt-2 bg-yellow-500/20 text-yellow-400">
                <Star className="w-3 h-3 mr-1" />
                4.9/5
              </Badge>
            </CardContent>
          </Card>

          <Card className="frosted-glass border-white/10 text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-purple-400 mr-2" />
                <span className="text-3xl font-bold text-white">{formatNumber(memberCount)}</span>
              </div>
              <p className="text-muted-foreground">Loyal Members</p>
              <Badge className="mt-2 bg-purple-500/20 text-purple-400">
                <Users className="w-3 h-3 mr-1" />
                Growing
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Feed */}
        <Card className="frosted-glass border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center mb-6">
              <TrendingUp className="w-6 h-6 text-green-400 mr-2" />
              <h3 className="text-xl font-serif luxury-glow">Recent Activity</h3>
              <Badge className="ml-auto bg-green-500/20 text-green-400 text-xs">
                Live Feed
              </Badge>
            </div>

            <div className="space-y-4">
              {activities.map(activity => (
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
              ))}
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                Join thousands of satisfied customers • Activity updates every few minutes
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};