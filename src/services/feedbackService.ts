import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Feedback = Tables<'feedback'>;
export type FeedbackInsert = TablesInsert<'feedback'>;
export type FeedbackUpdate = TablesUpdate<'feedback'>;

export interface FeedbackWithCustomer extends Feedback {
  customers?: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  } | null;
}

export interface FeedbackAnalytics {
  service_name: string;
  total_feedback: number;
  avg_rating: number;
  avg_nps: number;
  promoters: number;
  passives: number;
  detractors: number;
  nps_score: number;
}

export interface FeedbackSummary {
  totalFeedback: number;
  averageRating: number;
  npsScore: number;
  promoterCount: number;
  passiveCount: number;
  detractorCount: number;
  serviceBreakdown: FeedbackAnalytics[];
  recentFeedback: FeedbackWithCustomer[];
}

class FeedbackService {
  // Get all feedback with optional filtering
  async getAll(options: {
    service?: string;
    customerId?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<FeedbackWithCustomer[]> {
    let query = supabase
      .from('feedback')
      .select(`
        *,
        customers (
          id,
          name,
          email,
          phone
        )
      `)
      .order('created_at', { ascending: false });

    if (options.service) {
      query = query.eq('service_name', options.service);
    }

    if (options.customerId) {
      query = query.eq('customer_id', options.customerId);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, (options.offset + (options.limit || 50)) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching feedback:', error);
      throw new Error(`Failed to fetch feedback: ${error.message}`);
    }

    return data || [];
  }

  // Get feedback by ID
  async getById(id: string): Promise<FeedbackWithCustomer | null> {
    const { data, error } = await supabase
      .from('feedback')
      .select(`
        *,
        customers (
          id,
          name,
          email,
          phone
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Error fetching feedback by ID:', error);
      throw new Error(`Failed to fetch feedback: ${error.message}`);
    }

    return data;
  }

  // Create new feedback
  async create(feedback: FeedbackInsert): Promise<Feedback> {
    const { data, error } = await supabase
      .from('feedback')
      .insert(feedback)
      .select()
      .single();

    if (error) {
      console.error('Error creating feedback:', error);
      throw new Error(`Failed to create feedback: ${error.message}`);
    }

    return data;
  }

  // Update feedback
  async update(id: string, updates: FeedbackUpdate): Promise<Feedback> {
    const { data, error } = await supabase
      .from('feedback')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating feedback:', error);
      throw new Error(`Failed to update feedback: ${error.message}`);
    }

    return data;
  }

  // Delete feedback
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('feedback')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting feedback:', error);
      throw new Error(`Failed to delete feedback: ${error.message}`);
    }
  }

  // Get feedback summary and analytics
  async getSummary(timeRange?: string): Promise<FeedbackSummary> {
    // Get all feedback
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (feedbackError) {
      console.error('Error fetching feedback summary:', feedbackError);
      throw new Error(`Failed to fetch feedback summary: ${feedbackError.message}`);
    }

    const feedback = feedbackData || [];

    // Calculate metrics
    const totalFeedback = feedback.length;
    const averageRating = totalFeedback > 0
      ? feedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback
      : 0;

    const promoterCount = feedback.filter(f => f.nps_score >= 9).length;
    const passiveCount = feedback.filter(f => f.nps_score >= 7 && f.nps_score <= 8).length;
    const detractorCount = feedback.filter(f => f.nps_score <= 6).length;

    const npsScore = totalFeedback > 0
      ? Math.round(((promoterCount - detractorCount) / totalFeedback) * 100)
      : 0;

    // Service breakdown
    const serviceMap = new Map<string, { ratings: number[]; npsScores: number[] }>();

    feedback.forEach(f => {
      if (!serviceMap.has(f.service_name)) {
        serviceMap.set(f.service_name, { ratings: [], npsScores: [] });
      }
      const serviceData = serviceMap.get(f.service_name)!;
      serviceData.ratings.push(f.rating);
      serviceData.npsScores.push(f.nps_score);
    });

    const serviceBreakdown: FeedbackAnalytics[] = Array.from(serviceMap.entries()).map(([service, data]) => {
      const total = data.ratings.length;
      const avgRating = total > 0 ? data.ratings.reduce((a, b) => a + b, 0) / total : 0;
      const avgNps = total > 0 ? data.npsScores.reduce((a, b) => a + b, 0) / total : 0;
      const promoters = data.npsScores.filter(score => score >= 9).length;
      const passives = data.npsScores.filter(score => score >= 7 && score <= 8).length;
      const detractors = data.npsScores.filter(score => score <= 6).length;
      const npsScore = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;

      return {
        service_name: service,
        total_feedback: total,
        avg_rating: Math.round(avgRating * 10) / 10,
        avg_nps: Math.round(avgNps),
        promoters,
        passives,
        detractors,
        nps_score: npsScore
      };
    });

    // Recent feedback (last 10)
    const recentFeedback = await this.getAll({ limit: 10 });

    return {
      totalFeedback,
      averageRating: Math.round(averageRating * 10) / 10,
      npsScore,
      promoterCount,
      passiveCount,
      detractorCount,
      serviceBreakdown,
      recentFeedback
    };
  }

  // Get feedback trends over time
  async getTrends(days: number = 30): Promise<Array<{
    date: string;
    nps: number;
    avgRating: number;
    total: number;
  }>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('feedback')
      .select('created_at, nps_score, rating')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching feedback trends:', error);
      throw new Error(`Failed to fetch feedback trends: ${error.message}`);
    }

    const feedback = data || [];

    // Group by date
    const dateMap = new Map<string, { npsScores: number[]; ratings: number[] }>();

    feedback.forEach(f => {
      const date = new Date(f.created_at).toISOString().split('T')[0];
      if (!dateMap.has(date)) {
        dateMap.set(date, { npsScores: [], ratings: [] });
      }
      const dayData = dateMap.get(date)!;
      dayData.npsScores.push(f.nps_score);
      dayData.ratings.push(f.rating);
    });

    // Convert to array and sort by date
    const trends = Array.from(dateMap.entries())
      .map(([date, data]) => {
        const total = data.npsScores.length;
        const promoters = data.npsScores.filter(score => score >= 9).length;
        const detractors = data.npsScores.filter(score => score <= 6).length;
        const nps = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;
        const avgRating = total > 0 ? data.ratings.reduce((a, b) => a + b, 0) / total : 0;

        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          nps,
          avgRating: Math.round(avgRating * 10) / 10,
          total
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return trends;
  }

  // Search feedback
  async search(query: string, service?: string): Promise<FeedbackWithCustomer[]> {
    let dbQuery = supabase
      .from('feedback')
      .select(`
        *,
        customers (
          id,
          name,
          email,
          phone
        )
      `)
      .or(`comment.ilike.%${query}%,service_name.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (service && service !== 'all') {
      dbQuery = dbQuery.eq('service_name', service);
    }

    const { data, error } = await dbQuery;

    if (error) {
      console.error('Error searching feedback:', error);
      throw new Error(`Failed to search feedback: ${error.message}`);
    }

    return data || [];
  }
}

export const feedbackService = new FeedbackService();

// Helper functions for NPS calculation
export const calculateNPS = (feedback: Feedback[]): number => {
  if (feedback.length === 0) return 0;

  const promoters = feedback.filter(f => f.nps_score >= 9).length;
  const detractors = feedback.filter(f => f.nps_score <= 6).length;

  return Math.round(((promoters - detractors) / feedback.length) * 100);
};

// Helper function to determine promoter type
export const getPromoterType = (npsScore: number): 'promoter' | 'passive' | 'detractor' => {
  if (npsScore >= 9) return 'promoter';
  if (npsScore >= 7) return 'passive';
  return 'detractor';
};