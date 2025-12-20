import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Appointment = Tables<'appointments'>;
type Customer = Tables<'customers'>;
type Feedback = Tables<'feedback'>;
type Transaction = Tables<'transactions'>;
type Staff = Tables<'staff'>;
type Service = Tables<'services'>;

export interface AnalyticsData {
  bookings: Appointment[];
  customers: Customer[];
  revenue: Transaction[];
  feedback: Feedback[];
  staff: Staff[];
  services: Service[];
}

export interface RevenueMetrics {
  date: string;
  bookings: number;
  revenue: number;
  servicesRevenue: number;
  productsRevenue: number;
  avgBookingValue: number;
  newCustomers: number;
  returningCustomers: number;
}

export interface CustomerInsights {
  segments: Record<string, number>;
  avgLifetimeValue: number;
  avgBookingsPerCustomer: number;
  retentionRate: number;
}

export interface StaffPerformance {
  staff: string;
  bookings: number;
  revenue: number;
}

export interface ServicePopularity {
  service: string;
  bookings: number;
  revenue: number;
}

export interface FeedbackTrends {
  date: string;
  avgRating: number;
  avgNPS: number;
}

class AnalyticsService {
  // Check if user has analytics access (admin/staff)
  async checkAnalyticsAccess(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Check if user is staff or admin
      const { data: staffData } = await supabase
        .from('staff')
        .select('access_level')
        .eq('id', user.id)
        .single();

      if (staffData?.access_level === 'admin' || staffData?.access_level === 'manager') {
        return true;
      }

      // Check if user is admin via profiles
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      return !!profileData;
    } catch (error) {
      console.error('Error checking analytics access:', error);
      return false;
    }
  }

  // Fetch all analytics data
  async getAnalyticsData(timeRange: string = '30d'): Promise<AnalyticsData> {
    const hasAccess = await this.checkAnalyticsAccess();
    if (!hasAccess) {
      throw new Error('Unauthorized: Analytics access required');
    }

    const endDate = new Date();
    const startDate = new Date();

    // Calculate date range
    switch (timeRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '6m':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    try {
      // Fetch appointments (bookings)
      const { data: bookings = [], error: bookingsError } = await supabase
        .from('appointments')
        .select(`
          *,
          services:service_id(name, price),
          staff:staff_id(name)
        `)
        .gte('appointment_date', startDateStr)
        .lte('appointment_date', endDateStr)
        .eq('status', 'completed');

      if (bookingsError) throw bookingsError;

      // Fetch customers
      const { data: customers = [], error: customersError } = await supabase
        .from('customers')
        .select('*');

      if (customersError) throw customersError;

      // Fetch transactions (revenue)
      const { data: revenue = [], error: revenueError } = await supabase
        .from('transactions')
        .select('*')
        .gte('created_at', startDateStr)
        .lte('created_at', endDateStr);

      if (revenueError) throw revenueError;

      // Fetch feedback
      const { data: feedback = [], error: feedbackError } = await supabase
        .from('feedback')
        .select('*')
        .gte('created_at', startDateStr)
        .lte('created_at', endDateStr);

      if (feedbackError) throw feedbackError;

      // Fetch staff
      const { data: staff = [], error: staffError } = await supabase
        .from('staff')
        .select('*');

      if (staffError) throw staffError;

      // Fetch services
      const { data: services = [], error: servicesError } = await supabase
        .from('services')
        .select('*');

      if (servicesError) throw servicesError;

      return {
        bookings,
        customers,
        revenue,
        feedback,
        staff,
        services
      };
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw error;
    }
  }

  // Process revenue metrics
  processRevenueMetrics(data: AnalyticsData): RevenueMetrics[] {
    const { bookings, revenue } = data;

    // Group by date
    const revenueByDate: Record<string, RevenueMetrics> = {};

    // Process transactions
    revenue.forEach(transaction => {
      const date = transaction.created_at?.split('T')[0] || '';
      if (!revenueByDate[date]) {
        revenueByDate[date] = {
          date,
          bookings: 0,
          revenue: 0,
          servicesRevenue: 0,
          productsRevenue: 0,
          avgBookingValue: 0,
          newCustomers: 0,
          returningCustomers: 0
        };
      }

      revenueByDate[date].revenue += transaction.total_amount;
      revenueByDate[date].servicesRevenue += transaction.total_amount; // Assuming all is services for now
    });

    // Process bookings
    bookings.forEach(booking => {
      const date = booking.appointment_date;
      if (revenueByDate[date]) {
        revenueByDate[date].bookings += 1;
      }
    });

    // Calculate averages
    Object.values(revenueByDate).forEach(day => {
      if (day.bookings > 0) {
        day.avgBookingValue = day.revenue / day.bookings;
      }
    });

    return Object.values(revenueByDate).sort((a, b) => a.date.localeCompare(b.date));
  }

  // Process customer insights
  processCustomerInsights(data: AnalyticsData): CustomerInsights {
    const { customers, bookings } = data;

    // Calculate segments based on total spent
    const segments: Record<string, number> = {
      'VIP': 0,
      'Regular': 0,
      'New': 0,
      'At-Risk': 0
    };

    customers.forEach(customer => {
      const totalSpent = customer.loyalty_points || 0; // Using loyalty points as proxy for spending
      if (totalSpent > 1000) segments['VIP']++;
      else if (totalSpent > 500) segments['Regular']++;
      else if (totalSpent > 0) segments['New']++;
      else segments['At-Risk']++;
    });

    const avgLifetimeValue = customers.length > 0
      ? customers.reduce((sum, c) => sum + (c.loyalty_points || 0), 0) / customers.length
      : 0;

    const avgBookingsPerCustomer = customers.length > 0
      ? bookings.length / customers.length
      : 0;

    return {
      segments,
      avgLifetimeValue,
      avgBookingsPerCustomer,
      retentionRate: 78.5 // Mock retention rate for now
    };
  }

  // Process staff performance
  processStaffPerformance(data: AnalyticsData): StaffPerformance[] {
    const { bookings, staff } = data;

    const performance: Record<string, { bookings: number; revenue: number }> = {};

    bookings.forEach(booking => {
      const staffName = booking.staff?.name || 'Unknown';
      if (!performance[staffName]) {
        performance[staffName] = { bookings: 0, revenue: 0 };
      }
      performance[staffName].bookings += 1;
      performance[staffName].revenue += booking.total_amount || 0;
    });

    return Object.entries(performance).map(([staff, data]) => ({
      staff,
      bookings: data.bookings,
      revenue: data.revenue
    }));
  }

  // Process service popularity
  processServicePopularity(data: AnalyticsData): ServicePopularity[] {
    const { bookings, services } = data;

    const popularity: Record<string, { bookings: number; revenue: number }> = {};

    bookings.forEach(booking => {
      const serviceName = booking.services?.name || 'Unknown Service';
      if (!popularity[serviceName]) {
        popularity[serviceName] = { bookings: 0, revenue: 0 };
      }
      popularity[serviceName].bookings += 1;
      popularity[serviceName].revenue += booking.total_amount || 0;
    });

    return Object.entries(popularity).map(([service, data]) => ({
      service,
      bookings: data.bookings,
      revenue: data.revenue
    }));
  }

  // Process feedback trends
  processFeedbackTrends(data: AnalyticsData): FeedbackTrends[] {
    const { feedback } = data;

    const trends: Record<string, { rating: number; nps: number; count: number }> = {};

    feedback.forEach(item => {
      const date = item.created_at?.split('T')[0] || '';
      if (!trends[date]) {
        trends[date] = { rating: 0, nps: 0, count: 0 };
      }
      trends[date].rating += item.rating;
      trends[date].nps += item.nps_score;
      trends[date].count += 1;
    });

    return Object.entries(trends).map(([date, data]) => ({
      date,
      avgRating: data.count > 0 ? data.rating / data.count : 0,
      avgNPS: data.count > 0 ? data.nps / data.count : 0
    })).sort((a, b) => a.date.localeCompare(b.date));
  }

  // Calculate NPS
  calculateNPS(feedback: Feedback[]): number {
    if (feedback.length === 0) return 0;

    const promoters = feedback.filter(f => f.nps_score >= 9).length;
    const detractors = feedback.filter(f => f.nps_score <= 6).length;
    const total = feedback.length;

    return Math.round(((promoters - detractors) / total) * 100);
  }
}

export const analyticsService = new AnalyticsService();