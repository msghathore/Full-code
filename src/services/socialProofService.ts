import { supabase } from '@/integrations/supabase/client';

export interface SocialProofData {
  bookingCount: number;
  reviewCount: number;
  memberCount: number;
  activities: RecentActivity[];
}

export interface RecentActivity {
  id: string;
  type: 'booking' | 'review' | 'signup';
  message: string;
  time: string;
  user?: string;
}

class SocialProofService {
  // Get booking count for current month
  async getBookingCount(): Promise<number> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startDateStr = startOfMonth.toISOString().split('T')[0];

      const { count, error } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('appointment_date', startDateStr)
        .eq('status', 'completed');

      if (error) {
        console.error('Error fetching booking count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getBookingCount:', error);
      return 0;
    }
  }

  // Get review count
  async getReviewCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('feedback')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error fetching review count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getReviewCount:', error);
      return 0;
    }
  }

  // Get member count
  async getMemberCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error fetching member count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getMemberCount:', error);
      return 0;
    }
  }

  // Get recent activities (bookings and reviews)
  async getRecentActivities(limit: number = 5): Promise<RecentActivity[]> {
    try {
      const activities: RecentActivity[] = [];

      // Get recent bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('appointments')
        .select(`
          id,
          created_at,
          customers:customer_id(first_name, last_name)
        `)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!bookingsError && bookings) {
        bookings.forEach(booking => {
          const customerName = booking.customers ?
            `${(booking.customers as any).first_name} ${(booking.customers as any).last_name}`.trim() :
            'Anonymous';

          activities.push({
            id: `booking-${booking.id}`,
            type: 'booking',
            message: 'Someone just booked a service',
            time: this.getRelativeTime(booking.created_at),
            user: customerName
          });
        });
      }

      // Get recent reviews
      const { data: reviews, error: reviewsError } = await supabase
        .from('feedback')
        .select(`
          id,
          created_at,
          rating,
          customers:customer_id(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!reviewsError && reviews) {
        reviews.forEach(review => {
          const customerName = review.customers ?
            `${(review.customers as any).first_name} ${(review.customers as any).last_name}`.trim() :
            'Anonymous';

          activities.push({
            id: `review-${review.id}`,
            type: 'review',
            message: `New ${review.rating}-star review added`,
            time: this.getRelativeTime(review.created_at),
            user: customerName
          });
        });
      }

      // Sort by time and take the most recent
      return activities
        .sort((a, b) => this.parseRelativeTime(b.time) - this.parseRelativeTime(a.time))
        .slice(0, limit);

    } catch (error) {
      console.error('Error in getRecentActivities:', error);
      return [];
    }
  }

  // Get all social proof data
  async getSocialProofData(): Promise<SocialProofData> {
    const [bookingCount, reviewCount, memberCount, activities] = await Promise.all([
      this.getBookingCount(),
      this.getReviewCount(),
      this.getMemberCount(),
      this.getRecentActivities()
    ]);

    return {
      bookingCount,
      reviewCount,
      memberCount,
      activities
    };
  }

  // Helper function to get relative time
  private getRelativeTime(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;

    return date.toLocaleDateString();
  }

  // Helper function to parse relative time for sorting
  private parseRelativeTime(timeString: string): number {
    if (timeString === 'Just now') return Date.now();

    const match = timeString.match(/(\d+)\s+(minutes?|hours?|days?)\s+ago/);
    if (!match) return 0;

    const value = parseInt(match[1]);
    const unit = match[2];

    const multipliers = {
      'minute': 60 * 1000,
      'minutes': 60 * 1000,
      'hour': 60 * 60 * 1000,
      'hours': 60 * 60 * 1000,
      'day': 24 * 60 * 60 * 1000,
      'days': 24 * 60 * 60 * 1000
    };

    return Date.now() - (value * (multipliers[unit as keyof typeof multipliers] || 0));
  }
}

export const socialProofService = new SocialProofService();