// =====================================================
// REVIEW & SENTIMENT ANALYSIS SERVICE
// =====================================================

import { supabase } from '@/integrations/supabase/client';
import type {
  CustomerReview,
  ReviewAnalytics,
  ReviewResponseTemplate,
  PaginatedResponse
} from '@/types/enterprise';

// =====================================================
// SENTIMENT ANALYSIS (Simple NLP)
// =====================================================

// Positive and negative word lists for sentiment analysis
const POSITIVE_WORDS = [
  'amazing', 'awesome', 'beautiful', 'best', 'brilliant', 'clean', 'comfortable',
  'delighted', 'excellent', 'exceptional', 'fantastic', 'friendly', 'gorgeous',
  'great', 'happy', 'helpful', 'incredible', 'kind', 'love', 'loved', 'lovely',
  'nice', 'outstanding', 'perfect', 'pleased', 'polite', 'professional',
  'recommended', 'relaxing', 'satisfied', 'skilled', 'stunning', 'superb',
  'talented', 'thank', 'thanks', 'thorough', 'wonderful'
];

const NEGATIVE_WORDS = [
  'angry', 'annoyed', 'awful', 'bad', 'boring', 'broken', 'careless', 'cheap',
  'cold', 'disappointed', 'disappointing', 'dirty', 'disrespectful', 'dreadful',
  'expensive', 'frustrated', 'horrible', 'hurt', 'incompetent', 'late', 'long',
  'mediocre', 'messy', 'overpriced', 'painful', 'poor', 'rude', 'rushed',
  'slow', 'terrible', 'uncomfortable', 'unprofessional', 'wait', 'waited',
  'waiting', 'waste', 'worst', 'wrong'
];

const TOPIC_KEYWORDS: Record<string, string[]> = {
  'service_quality': ['service', 'treatment', 'work', 'result', 'outcome'],
  'staff_friendliness': ['friendly', 'nice', 'kind', 'rude', 'polite', 'welcoming'],
  'waiting_time': ['wait', 'waited', 'waiting', 'time', 'late', 'on time', 'prompt'],
  'cleanliness': ['clean', 'dirty', 'hygiene', 'sanitized', 'tidy', 'messy'],
  'value': ['price', 'expensive', 'cheap', 'worth', 'value', 'overpriced', 'affordable'],
  'atmosphere': ['atmosphere', 'ambiance', 'relaxing', 'comfortable', 'environment'],
  'skill': ['skilled', 'talented', 'expert', 'professional', 'experienced', 'amateur']
};

export function analyzeSentiment(text: string): {
  score: number;
  label: 'positive' | 'neutral' | 'negative';
  keyPhrases: string[];
  topics: string[];
} {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);

  // Count positive and negative words
  let positiveCount = 0;
  let negativeCount = 0;

  words.forEach(word => {
    if (POSITIVE_WORDS.includes(word)) positiveCount++;
    if (NEGATIVE_WORDS.includes(word)) negativeCount++;
  });

  // Calculate sentiment score (-1 to 1)
  const totalSentimentWords = positiveCount + negativeCount;
  let score = 0;
  if (totalSentimentWords > 0) {
    score = (positiveCount - negativeCount) / totalSentimentWords;
  }

  // Determine label
  let label: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (score > 0.2) label = 'positive';
  else if (score < -0.2) label = 'negative';

  // Extract key phrases (simple approach: look for adjective + noun patterns)
  const keyPhrases: string[] = [];
  POSITIVE_WORDS.concat(NEGATIVE_WORDS).forEach(word => {
    if (lowerText.includes(word)) {
      // Get surrounding context
      const regex = new RegExp(`\\b(\\w+\\s)?${word}(\\s\\w+)?\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        matches.slice(0, 3).forEach(m => keyPhrases.push(m.trim()));
      }
    }
  });

  // Extract topics
  const topics: string[] = [];
  Object.entries(TOPIC_KEYWORDS).forEach(([topic, keywords]) => {
    if (keywords.some(kw => lowerText.includes(kw))) {
      topics.push(topic);
    }
  });

  return {
    score: Math.round(score * 100) / 100,
    label,
    keyPhrases: [...new Set(keyPhrases)].slice(0, 5),
    topics: [...new Set(topics)]
  };
}

// =====================================================
// REVIEW MANAGEMENT
// =====================================================

export async function getReviews(
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    staff_id?: string;
    service_id?: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
    min_rating?: number;
    needs_response?: boolean;
    platform?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<PaginatedResponse<CustomerReview>> {
  let query = supabase
    .from('customer_reviews')
    .select('*', { count: 'exact' });

  if (filters?.staff_id) query = query.eq('staff_id', filters.staff_id);
  if (filters?.service_id) query = query.eq('service_id', filters.service_id);
  if (filters?.sentiment) query = query.eq('sentiment_label', filters.sentiment);
  if (filters?.min_rating) query = query.gte('overall_rating', filters.min_rating);
  if (filters?.needs_response) query = query.is('response_text', null);
  if (filters?.platform) query = query.eq('platform', filters.platform);
  if (filters?.startDate) query = query.gte('created_at', filters.startDate);
  if (filters?.endDate) query = query.lte('created_at', filters.endDate);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data: data as CustomerReview[],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize)
  };
}

export async function getReviewById(id: string): Promise<CustomerReview | null> {
  const { data, error } = await supabase
    .from('customer_reviews')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as CustomerReview;
}

export async function createReview(review: Partial<CustomerReview>): Promise<CustomerReview> {
  // Analyze sentiment if review text provided
  let sentimentData = {};
  if (review.review_text) {
    const analysis = analyzeSentiment(review.review_text);
    sentimentData = {
      sentiment_score: analysis.score,
      sentiment_label: analysis.label,
      key_phrases: analysis.keyPhrases,
      topics: analysis.topics
    };
  }

  const { data, error } = await supabase
    .from('customer_reviews')
    .insert({ ...review, ...sentimentData })
    .select()
    .single();

  if (error) throw error;
  return data as CustomerReview;
}

export async function updateReview(
  id: string,
  updates: Partial<CustomerReview>
): Promise<CustomerReview> {
  // Re-analyze sentiment if review text changed
  let sentimentData = {};
  if (updates.review_text) {
    const analysis = analyzeSentiment(updates.review_text);
    sentimentData = {
      sentiment_score: analysis.score,
      sentiment_label: analysis.label,
      key_phrases: analysis.keyPhrases,
      topics: analysis.topics
    };
  }

  const { data, error } = await supabase
    .from('customer_reviews')
    .update({ ...updates, ...sentimentData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as CustomerReview;
}

export async function respondToReview(
  id: string,
  response: string,
  responderId: string
): Promise<CustomerReview> {
  const { data, error } = await supabase
    .from('customer_reviews')
    .update({
      response_text: response,
      response_by: responderId,
      response_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as CustomerReview;
}

export async function deleteReview(id: string): Promise<void> {
  const { error } = await supabase
    .from('customer_reviews')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// =====================================================
// RESPONSE TEMPLATES
// =====================================================

export async function getResponseTemplates(): Promise<ReviewResponseTemplate[]> {
  const { data, error } = await supabase
    .from('review_response_templates')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data as ReviewResponseTemplate[];
}

export async function getSuggestedResponse(
  review: CustomerReview
): Promise<{ template: ReviewResponseTemplate; response: string } | null> {
  const templates = await getResponseTemplates();

  // Find matching template based on sentiment and rating
  const matchingTemplate = templates.find(t => {
    // Match sentiment
    if (t.sentiment_type !== review.sentiment_label) return false;

    // Match rating range if specified
    if (t.rating_range) {
      // Parse range like "[1,3)" or "[4,6)"
      const match = t.rating_range.match(/\[(\d+),(\d+)\)/);
      if (match) {
        const min = parseInt(match[1]);
        const max = parseInt(match[2]);
        if (review.overall_rating < min || review.overall_rating >= max) return false;
      }
    }

    return true;
  });

  if (!matchingTemplate) return null;

  // Replace variables in template
  let response = matchingTemplate.template_text;

  // Replace known variables
  const variables: Record<string, string> = {
    customer_name: 'Valued Customer', // Would need to fetch customer name
    service_name: 'your service', // Would need to fetch service name
    staff_name: 'our team' // Would need to fetch staff name
  };

  matchingTemplate.variables.forEach(variable => {
    response = response.replace(new RegExp(`{{${variable}}}`, 'g'), variables[variable] || '');
  });

  // Update usage count
  await supabase
    .from('review_response_templates')
    .update({ usage_count: matchingTemplate.usage_count + 1 })
    .eq('id', matchingTemplate.id);

  return { template: matchingTemplate, response };
}

export async function createResponseTemplate(
  template: Partial<ReviewResponseTemplate>
): Promise<ReviewResponseTemplate> {
  const { data, error } = await supabase
    .from('review_response_templates')
    .insert(template)
    .select()
    .single();

  if (error) throw error;
  return data as ReviewResponseTemplate;
}

export async function updateResponseTemplate(
  id: string,
  updates: Partial<ReviewResponseTemplate>
): Promise<ReviewResponseTemplate> {
  const { data, error } = await supabase
    .from('review_response_templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as ReviewResponseTemplate;
}

// =====================================================
// ANALYTICS
// =====================================================

export async function calculateReviewAnalytics(
  periodType: 'daily' | 'weekly' | 'monthly',
  periodStart: string,
  staffId?: string,
  serviceId?: string
): Promise<ReviewAnalytics> {
  // Get period end date
  const startDate = new Date(periodStart);
  let endDate = new Date(startDate);
  switch (periodType) {
    case 'daily':
      endDate.setDate(endDate.getDate() + 1);
      break;
    case 'weekly':
      endDate.setDate(endDate.getDate() + 7);
      break;
    case 'monthly':
      endDate.setMonth(endDate.getMonth() + 1);
      break;
  }

  // Build query
  let query = supabase
    .from('customer_reviews')
    .select('*')
    .gte('created_at', periodStart)
    .lt('created_at', endDate.toISOString());

  if (staffId) query = query.eq('staff_id', staffId);
  if (serviceId) query = query.eq('service_id', serviceId);

  const { data: reviews, error } = await query;
  if (error) throw error;

  if (!reviews || reviews.length === 0) {
    return {
      id: crypto.randomUUID(),
      period_type: periodType,
      period_start: periodStart,
      period_end: endDate.toISOString().split('T')[0],
      staff_id: staffId,
      service_id: serviceId,
      total_reviews: 0,
      average_rating: 0,
      positive_count: 0,
      neutral_count: 0,
      negative_count: 0,
      average_sentiment: 0,
      top_positive_topics: [],
      top_negative_topics: [],
      response_rate: 0,
      average_response_time: 0,
      nps_score: 0,
      created_at: new Date().toISOString()
    };
  }

  // Calculate metrics
  const totalReviews = reviews.length;
  const averageRating = reviews.reduce((sum, r) => sum + r.overall_rating, 0) / totalReviews;

  const positiveCount = reviews.filter(r => r.sentiment_label === 'positive').length;
  const neutralCount = reviews.filter(r => r.sentiment_label === 'neutral').length;
  const negativeCount = reviews.filter(r => r.sentiment_label === 'negative').length;

  const averageSentiment = reviews.reduce((sum, r) => sum + (r.sentiment_score || 0), 0) / totalReviews;

  // Count topics
  const positiveTopic: Record<string, number> = {};
  const negativeTopic: Record<string, number> = {};

  reviews.forEach(r => {
    const topics = r.topics || [];
    if (r.sentiment_label === 'positive') {
      topics.forEach((t: string) => {
        positiveTopic[t] = (positiveTopic[t] || 0) + 1;
      });
    } else if (r.sentiment_label === 'negative') {
      topics.forEach((t: string) => {
        negativeTopic[t] = (negativeTopic[t] || 0) + 1;
      });
    }
  });

  const topPositiveTopics = Object.entries(positiveTopic)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic]) => topic);

  const topNegativeTopics = Object.entries(negativeTopic)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic]) => topic);

  // Response metrics
  const respondedReviews = reviews.filter(r => r.response_text);
  const responseRate = (respondedReviews.length / totalReviews) * 100;

  // Calculate average response time
  let totalResponseTime = 0;
  let responseCount = 0;
  respondedReviews.forEach(r => {
    if (r.response_at) {
      const createdAt = new Date(r.created_at).getTime();
      const respondedAt = new Date(r.response_at).getTime();
      totalResponseTime += (respondedAt - createdAt) / (1000 * 60 * 60); // hours
      responseCount++;
    }
  });
  const averageResponseTime = responseCount > 0 ? totalResponseTime / responseCount : 0;

  // Calculate NPS (Net Promoter Score)
  // Promoters: 5 stars, Passives: 4 stars, Detractors: 1-3 stars
  const promoters = reviews.filter(r => r.overall_rating === 5).length;
  const detractors = reviews.filter(r => r.overall_rating <= 3).length;
  const npsScore = ((promoters - detractors) / totalReviews) * 100;

  const analytics: ReviewAnalytics = {
    id: crypto.randomUUID(),
    period_type: periodType,
    period_start: periodStart,
    period_end: endDate.toISOString().split('T')[0],
    staff_id: staffId,
    service_id: serviceId,
    total_reviews: totalReviews,
    average_rating: Math.round(averageRating * 100) / 100,
    positive_count: positiveCount,
    neutral_count: neutralCount,
    negative_count: negativeCount,
    average_sentiment: Math.round(averageSentiment * 100) / 100,
    top_positive_topics: topPositiveTopics,
    top_negative_topics: topNegativeTopics,
    response_rate: Math.round(responseRate * 100) / 100,
    average_response_time: Math.round(averageResponseTime * 10) / 10,
    nps_score: Math.round(npsScore),
    created_at: new Date().toISOString()
  };

  // Store analytics
  await supabase.from('review_analytics').upsert(analytics, {
    onConflict: 'period_type,period_start,staff_id,service_id'
  });

  return analytics;
}

export async function getReviewAnalytics(
  startDate: string,
  endDate: string,
  periodType?: 'daily' | 'weekly' | 'monthly',
  staffId?: string
): Promise<ReviewAnalytics[]> {
  let query = supabase
    .from('review_analytics')
    .select('*')
    .gte('period_start', startDate)
    .lte('period_end', endDate);

  if (periodType) query = query.eq('period_type', periodType);
  if (staffId) query = query.eq('staff_id', staffId);

  const { data, error } = await query.order('period_start', { ascending: false });

  if (error) throw error;
  return data as ReviewAnalytics[];
}

// =====================================================
// DASHBOARD DATA
// =====================================================

export async function getReviewDashboardData(): Promise<{
  totalReviews: number;
  averageRating: number;
  positivePercentage: number;
  pendingResponses: number;
  npsScore: number;
  recentReviews: CustomerReview[];
  ratingDistribution: number[];
  sentimentTrend: { date: string; positive: number; negative: number }[];
}> {
  // Get recent reviews
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: reviews } = await supabase
    .from('customer_reviews')
    .select('*')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false });

  const allReviews = reviews || [];

  // Calculate metrics
  const totalReviews = allReviews.length;
  const averageRating = totalReviews > 0
    ? allReviews.reduce((sum, r) => sum + r.overall_rating, 0) / totalReviews
    : 0;

  const positiveCount = allReviews.filter(r => r.sentiment_label === 'positive').length;
  const positivePercentage = totalReviews > 0 ? (positiveCount / totalReviews) * 100 : 0;

  const pendingResponses = allReviews.filter(r => !r.response_text && r.is_public).length;

  // NPS
  const promoters = allReviews.filter(r => r.overall_rating === 5).length;
  const detractors = allReviews.filter(r => r.overall_rating <= 3).length;
  const npsScore = totalReviews > 0 ? ((promoters - detractors) / totalReviews) * 100 : 0;

  // Rating distribution
  const ratingDistribution = [1, 2, 3, 4, 5].map(rating =>
    allReviews.filter(r => r.overall_rating === rating).length
  );

  // Sentiment trend (daily)
  const sentimentByDate: Record<string, { positive: number; negative: number }> = {};
  allReviews.forEach(r => {
    const date = r.created_at.split('T')[0];
    if (!sentimentByDate[date]) {
      sentimentByDate[date] = { positive: 0, negative: 0 };
    }
    if (r.sentiment_label === 'positive') sentimentByDate[date].positive++;
    if (r.sentiment_label === 'negative') sentimentByDate[date].negative++;
  });

  const sentimentTrend = Object.entries(sentimentByDate)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalReviews,
    averageRating: Math.round(averageRating * 10) / 10,
    positivePercentage: Math.round(positivePercentage),
    pendingResponses,
    npsScore: Math.round(npsScore),
    recentReviews: allReviews.slice(0, 5) as CustomerReview[],
    ratingDistribution,
    sentimentTrend
  };
}

// =====================================================
// ALERTS
// =====================================================

export async function checkForNegativeReviewAlerts(): Promise<CustomerReview[]> {
  // Find negative reviews from the last 24 hours without responses
  const oneDayAgo = new Date();
  oneDayAgo.setHours(oneDayAgo.getHours() - 24);

  const { data, error } = await supabase
    .from('customer_reviews')
    .select('*')
    .eq('sentiment_label', 'negative')
    .is('response_text', null)
    .gte('created_at', oneDayAgo.toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as CustomerReview[];
}

export default {
  analyzeSentiment,
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  respondToReview,
  deleteReview,
  getResponseTemplates,
  getSuggestedResponse,
  createResponseTemplate,
  updateResponseTemplate,
  calculateReviewAnalytics,
  getReviewAnalytics,
  getReviewDashboardData,
  checkForNegativeReviewAlerts
};
