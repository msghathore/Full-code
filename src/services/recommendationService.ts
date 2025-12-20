// =====================================================
// AI SERVICE RECOMMENDER SERVICE
// =====================================================

import { supabase } from '@/integrations/supabase/client';
import type {
  ServiceRecommendation,
  CustomerServicePreference,
  ServiceBundle,
  RecommendationFeedback,
  CustomerProfile
} from '@/types/enterprise';

// =====================================================
// RECOMMENDATION ENGINE
// =====================================================

interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number;
  description?: string;
}

interface CustomerHistory {
  services_used: { service_id: string; count: number; last_date: string }[];
  total_spent: number;
  average_spend: number;
  preferred_staff: string[];
  visit_frequency: number; // visits per month
}

export async function generateRecommendations(
  customerId: string,
  limit: number = 5
): Promise<ServiceRecommendation[]> {
  // Get customer profile and history
  const [customer, history, preferences] = await Promise.all([
    getCustomerProfile(customerId),
    getCustomerHistory(customerId),
    getCustomerPreferences(customerId)
  ]);

  if (!customer) throw new Error('Customer not found');

  // Get all active services
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true);

  if (!services) return [];

  const recommendations: ServiceRecommendation[] = [];
  const usedServiceIds = new Set(history.services_used.map(s => s.service_id));

  // 1. Personalized recommendations based on history
  const personalizedRecs = generatePersonalizedRecs(
    services,
    history,
    preferences,
    usedServiceIds
  );
  recommendations.push(...personalizedRecs.map(r => ({
    ...r,
    customer_id: customerId,
    recommendation_type: 'personalized' as const
  })));

  // 2. Upsell recommendations (higher tier of used services)
  const upsellRecs = generateUpsellRecs(services, history);
  recommendations.push(...upsellRecs.map(r => ({
    ...r,
    customer_id: customerId,
    recommendation_type: 'upsell' as const
  })));

  // 3. Cross-sell recommendations (complementary services)
  const crossSellRecs = generateCrossSellRecs(services, history);
  recommendations.push(...crossSellRecs.map(r => ({
    ...r,
    customer_id: customerId,
    recommendation_type: 'cross_sell' as const
  })));

  // 4. Trending services
  const trendingRecs = await generateTrendingRecs(services, usedServiceIds);
  recommendations.push(...trendingRecs.map(r => ({
    ...r,
    customer_id: customerId,
    recommendation_type: 'trending' as const
  })));

  // 5. Next service prediction
  const nextServiceRec = await predictNextService(customerId, history, services);
  if (nextServiceRec) {
    recommendations.push({
      ...nextServiceRec,
      customer_id: customerId,
      recommendation_type: 'next_service' as const
    });
  }

  // Sort by score and deduplicate
  const uniqueRecs = deduplicateRecommendations(recommendations);
  const topRecs = uniqueRecs
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // Save recommendations
  for (const rec of topRecs) {
    await supabase.from('service_recommendations').insert({
      customer_id: rec.customer_id,
      service_id: rec.service_id,
      recommendation_type: rec.recommendation_type,
      score: rec.score,
      reasoning: rec.reasoning,
      factors: rec.factors,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    });
  }

  return topRecs;
}

async function getCustomerProfile(customerId: string): Promise<CustomerProfile | null> {
  const { data } = await supabase
    .from('customer_profiles')
    .select('*')
    .eq('id', customerId)
    .single();

  return data as CustomerProfile;
}

async function getCustomerHistory(customerId: string): Promise<CustomerHistory> {
  // Get appointments
  const { data: appointments } = await supabase
    .from('appointments')
    .select('service_id, staff_id, total_amount, appointment_date')
    .eq('customer_id', customerId)
    .eq('status', 'completed');

  if (!appointments || appointments.length === 0) {
    return {
      services_used: [],
      total_spent: 0,
      average_spend: 0,
      preferred_staff: [],
      visit_frequency: 0
    };
  }

  // Count services
  const serviceCounts: Record<string, { count: number; last_date: string }> = {};
  appointments.forEach(a => {
    if (a.service_id) {
      if (!serviceCounts[a.service_id]) {
        serviceCounts[a.service_id] = { count: 0, last_date: a.appointment_date };
      }
      serviceCounts[a.service_id].count++;
      if (a.appointment_date > serviceCounts[a.service_id].last_date) {
        serviceCounts[a.service_id].last_date = a.appointment_date;
      }
    }
  });

  // Count staff preferences
  const staffCounts: Record<string, number> = {};
  appointments.forEach(a => {
    if (a.staff_id) {
      staffCounts[a.staff_id] = (staffCounts[a.staff_id] || 0) + 1;
    }
  });

  // Calculate visit frequency (visits per month)
  const dates = appointments.map(a => new Date(a.appointment_date).getTime()).sort();
  const monthsSpan = (dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24 * 30) || 1;
  const visitFrequency = appointments.length / monthsSpan;

  return {
    services_used: Object.entries(serviceCounts).map(([service_id, data]) => ({
      service_id,
      count: data.count,
      last_date: data.last_date
    })),
    total_spent: appointments.reduce((sum, a) => sum + (a.total_amount || 0), 0),
    average_spend: appointments.reduce((sum, a) => sum + (a.total_amount || 0), 0) / appointments.length,
    preferred_staff: Object.entries(staffCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id),
    visit_frequency: visitFrequency
  };
}

async function getCustomerPreferences(customerId: string): Promise<CustomerServicePreference[]> {
  const { data } = await supabase
    .from('customer_service_preferences')
    .select('*')
    .eq('customer_id', customerId);

  return (data || []) as CustomerServicePreference[];
}

function generatePersonalizedRecs(
  services: Service[],
  history: CustomerHistory,
  preferences: CustomerServicePreference[],
  usedServiceIds: Set<string>
): Partial<ServiceRecommendation>[] {
  const recommendations: Partial<ServiceRecommendation>[] = [];

  // Get categories customer likes
  const categoryPrefs: Record<string, number> = {};
  preferences.forEach(p => {
    categoryPrefs[p.service_category] = p.preference_score || 0;
  });

  // Also infer from history
  history.services_used.forEach(s => {
    const service = services.find(svc => svc.id === s.service_id);
    if (service) {
      categoryPrefs[service.category] = (categoryPrefs[service.category] || 0) + s.count * 0.1;
    }
  });

  // Find services in preferred categories that customer hasn't tried
  services.forEach(service => {
    if (usedServiceIds.has(service.id)) return;

    const categoryPref = categoryPrefs[service.category] || 0;
    if (categoryPref > 0) {
      const score = Math.min(1, categoryPref * 0.3 + 0.4);
      recommendations.push({
        id: crypto.randomUUID(),
        service_id: service.id,
        score,
        reasoning: `Based on your preference for ${service.category} services`,
        factors: { category_preference: categoryPref, novelty: 0.3 },
        created_at: new Date().toISOString()
      });
    }
  });

  return recommendations.slice(0, 3);
}

function generateUpsellRecs(
  services: Service[],
  history: CustomerHistory
): Partial<ServiceRecommendation>[] {
  const recommendations: Partial<ServiceRecommendation>[] = [];

  // Group services by category with price tiers
  const categoryTiers: Record<string, Service[]> = {};
  services.forEach(s => {
    if (!categoryTiers[s.category]) {
      categoryTiers[s.category] = [];
    }
    categoryTiers[s.category].push(s);
  });

  // Sort each category by price
  Object.values(categoryTiers).forEach(tier => {
    tier.sort((a, b) => a.price - b.price);
  });

  // Find upsell opportunities
  history.services_used.forEach(used => {
    const usedService = services.find(s => s.id === used.service_id);
    if (!usedService) return;

    const tier = categoryTiers[usedService.category];
    if (!tier) return;

    // Find next tier up
    const currentIndex = tier.findIndex(s => s.id === usedService.id);
    const nextTier = tier[currentIndex + 1];

    if (nextTier && !history.services_used.some(u => u.service_id === nextTier.id)) {
      const priceDiff = nextTier.price - usedService.price;
      const affordability = priceDiff <= history.average_spend * 0.3 ? 0.8 : 0.5;

      recommendations.push({
        id: crypto.randomUUID(),
        service_id: nextTier.id,
        score: 0.7 * affordability,
        reasoning: `Upgrade from ${usedService.name} - enhanced experience`,
        factors: {
          upsell_value: priceDiff,
          affordability,
          category_familiarity: used.count * 0.1
        },
        created_at: new Date().toISOString()
      });
    }
  });

  return recommendations.slice(0, 2);
}

function generateCrossSellRecs(
  services: Service[],
  history: CustomerHistory
): Partial<ServiceRecommendation>[] {
  // Define complementary service categories
  const complementary: Record<string, string[]> = {
    'Hair': ['Nails', 'Facial', 'Makeup'],
    'Nails': ['Pedicure', 'Facial', 'Hair'],
    'Facial': ['Massage', 'Hair', 'Skincare'],
    'Massage': ['Facial', 'Body Treatment', 'Skincare'],
    'Skincare': ['Facial', 'Makeup'],
    'Makeup': ['Hair', 'Nails', 'Skincare']
  };

  const recommendations: Partial<ServiceRecommendation>[] = [];
  const usedCategories = new Set(
    history.services_used
      .map(u => services.find(s => s.id === u.service_id)?.category)
      .filter(Boolean)
  );

  usedCategories.forEach(category => {
    const related = complementary[category!] || [];
    related.forEach(relatedCat => {
      if (usedCategories.has(relatedCat)) return;

      const relatedServices = services.filter(s => s.category === relatedCat);
      if (relatedServices.length > 0) {
        // Pick a service in the customer's price range
        const affordableService = relatedServices.find(s => s.price <= history.average_spend * 1.2);
        if (affordableService) {
          recommendations.push({
            id: crypto.randomUUID(),
            service_id: affordableService.id,
            score: 0.65,
            reasoning: `Pairs well with your ${category} appointments`,
            factors: {
              complementary_score: 0.7,
              price_fit: affordableService.price / history.average_spend
            },
            created_at: new Date().toISOString()
          });
        }
      }
    });
  });

  return recommendations.slice(0, 2);
}

async function generateTrendingRecs(
  services: Service[],
  usedServiceIds: Set<string>
): Promise<Partial<ServiceRecommendation>[]> {
  // Get booking counts from last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: recentBookings } = await supabase
    .from('appointments')
    .select('service_id')
    .gte('appointment_date', thirtyDaysAgo.toISOString().split('T')[0])
    .eq('status', 'completed');

  if (!recentBookings) return [];

  // Count by service
  const counts: Record<string, number> = {};
  recentBookings.forEach(b => {
    if (b.service_id) {
      counts[b.service_id] = (counts[b.service_id] || 0) + 1;
    }
  });

  // Sort by popularity
  const trending = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .filter(([id]) => !usedServiceIds.has(id));

  const maxCount = trending[0]?.[1] || 1;

  return trending.slice(0, 2).map(([serviceId, count]) => ({
    id: crypto.randomUUID(),
    service_id: serviceId,
    score: 0.5 + (count / maxCount) * 0.3,
    reasoning: 'Popular choice among our customers',
    factors: { popularity: count, trend_score: count / maxCount },
    created_at: new Date().toISOString()
  }));
}

async function predictNextService(
  customerId: string,
  history: CustomerHistory,
  services: Service[]
): Promise<Partial<ServiceRecommendation> | null> {
  if (history.services_used.length === 0) return null;

  // Find service that's "due" based on typical frequency
  const now = new Date();
  let bestService: { service: Service; score: number; daysSince: number } | null = null;

  for (const used of history.services_used) {
    const service = services.find(s => s.id === used.service_id);
    if (!service) continue;

    const lastDate = new Date(used.last_date);
    const daysSince = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    // Estimate typical interval based on service type
    const typicalIntervals: Record<string, number> = {
      'Hair': 42, // 6 weeks
      'Nails': 14, // 2 weeks
      'Facial': 28, // 4 weeks
      'Massage': 21, // 3 weeks
      'Skincare': 28
    };

    const typicalInterval = typicalIntervals[service.category] || 30;
    const overdue = daysSince - typicalInterval;

    if (overdue > 0) {
      const score = Math.min(1, 0.6 + (overdue / typicalInterval) * 0.4);
      if (!bestService || score > bestService.score) {
        bestService = { service, score, daysSince };
      }
    }
  }

  if (!bestService) return null;

  return {
    id: crypto.randomUUID(),
    service_id: bestService.service.id,
    score: bestService.score,
    reasoning: `It's been ${bestService.daysSince} days since your last ${bestService.service.name}`,
    factors: {
      days_since_last: bestService.daysSince,
      frequency_match: bestService.score
    },
    created_at: new Date().toISOString()
  };
}

function deduplicateRecommendations(
  recommendations: Partial<ServiceRecommendation>[]
): Partial<ServiceRecommendation>[] {
  const seen = new Map<string, Partial<ServiceRecommendation>>();

  recommendations.forEach(rec => {
    const existing = seen.get(rec.service_id!);
    if (!existing || rec.score! > existing.score!) {
      seen.set(rec.service_id!, rec);
    }
  });

  return Array.from(seen.values());
}

// =====================================================
// RECOMMENDATION RETRIEVAL
// =====================================================

export async function getCustomerRecommendations(
  customerId: string,
  limit: number = 5
): Promise<ServiceRecommendation[]> {
  // Get active recommendations
  const { data, error } = await supabase
    .from('service_recommendations')
    .select('*')
    .eq('customer_id', customerId)
    .eq('is_shown', false)
    .gt('expires_at', new Date().toISOString())
    .order('score', { ascending: false })
    .limit(limit);

  if (error) throw error;

  // If no recommendations, generate new ones
  if (!data || data.length === 0) {
    return generateRecommendations(customerId, limit);
  }

  return data as ServiceRecommendation[];
}

export async function markRecommendationShown(id: string): Promise<void> {
  await supabase
    .from('service_recommendations')
    .update({ is_shown: true, shown_at: new Date().toISOString() })
    .eq('id', id);
}

export async function recordRecommendationAccepted(
  id: string,
  appointmentId?: string
): Promise<void> {
  await supabase
    .from('service_recommendations')
    .update({
      is_accepted: true,
      accepted_at: new Date().toISOString()
    })
    .eq('id', id);

  // Record feedback
  const { data: rec } = await supabase
    .from('service_recommendations')
    .select('customer_id')
    .eq('id', id)
    .single();

  if (rec) {
    await supabase.from('recommendation_feedback').insert({
      recommendation_id: id,
      customer_id: rec.customer_id,
      feedback_type: 'accepted'
    });
  }
}

export async function recordRecommendationRejected(
  id: string,
  reason?: string
): Promise<void> {
  const { data: rec } = await supabase
    .from('service_recommendations')
    .select('customer_id')
    .eq('id', id)
    .single();

  if (rec) {
    await supabase.from('recommendation_feedback').insert({
      recommendation_id: id,
      customer_id: rec.customer_id,
      feedback_type: 'rejected',
      feedback_reason: reason
    });
  }
}

// =====================================================
// SERVICE BUNDLES
// =====================================================

export async function getServiceBundles(activeOnly: boolean = true): Promise<ServiceBundle[]> {
  let query = supabase.from('service_bundles').select('*');

  if (activeOnly) {
    const today = new Date().toISOString().split('T')[0];
    query = query
      .eq('is_active', true)
      .or(`valid_from.is.null,valid_from.lte.${today}`)
      .or(`valid_until.is.null,valid_until.gte.${today}`);
  }

  const { data, error } = await query.order('name');

  if (error) throw error;
  return data as ServiceBundle[];
}

export async function getBundleById(id: string): Promise<ServiceBundle | null> {
  const { data, error } = await supabase
    .from('service_bundles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as ServiceBundle;
}

export async function createBundle(bundle: Partial<ServiceBundle>): Promise<ServiceBundle> {
  // Calculate savings if individual price provided
  let savingsData = {};
  if (bundle.individual_price && bundle.bundle_price) {
    const savings = bundle.individual_price - bundle.bundle_price;
    savingsData = {
      savings_amount: savings,
      savings_percentage: (savings / bundle.individual_price) * 100
    };
  }

  const { data, error } = await supabase
    .from('service_bundles')
    .insert({ ...bundle, ...savingsData })
    .select()
    .single();

  if (error) throw error;
  return data as ServiceBundle;
}

export async function updateBundle(
  id: string,
  updates: Partial<ServiceBundle>
): Promise<ServiceBundle> {
  // Recalculate savings if prices changed
  let savingsData = {};
  if (updates.individual_price || updates.bundle_price) {
    const bundle = await getBundleById(id);
    const individualPrice = updates.individual_price || bundle?.individual_price;
    const bundlePrice = updates.bundle_price || bundle?.bundle_price;

    if (individualPrice && bundlePrice) {
      const savings = individualPrice - bundlePrice;
      savingsData = {
        savings_amount: savings,
        savings_percentage: (savings / individualPrice) * 100
      };
    }
  }

  const { data, error } = await supabase
    .from('service_bundles')
    .update({ ...updates, ...savingsData })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as ServiceBundle;
}

export async function deleteBundle(id: string): Promise<void> {
  const { error } = await supabase
    .from('service_bundles')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function recommendBundles(customerId: string): Promise<ServiceBundle[]> {
  const history = await getCustomerHistory(customerId);
  const bundles = await getServiceBundles();

  // Filter bundles that include services the customer uses
  const relevantBundles = bundles.filter(bundle => {
    const bundleServiceIds = bundle.services.map(s => s.service_id);
    return history.services_used.some(used =>
      bundleServiceIds.includes(used.service_id)
    );
  });

  // Sort by savings
  return relevantBundles.sort((a, b) => (b.savings_amount || 0) - (a.savings_amount || 0));
}

// =====================================================
// CUSTOMER PREFERENCES
// =====================================================

export async function updateCustomerPreferences(
  customerId: string,
  preferences: Partial<CustomerServicePreference>[]
): Promise<void> {
  for (const pref of preferences) {
    await supabase.from('customer_service_preferences').upsert({
      customer_id: customerId,
      service_category: pref.service_category,
      preference_score: pref.preference_score,
      updated_at: new Date().toISOString()
    }, { onConflict: 'customer_id,service_category' });
  }
}

export async function learnFromBooking(
  customerId: string,
  serviceId: string,
  staffId?: string,
  timeSlot?: string
): Promise<void> {
  // Get service category
  const { data: service } = await supabase
    .from('services')
    .select('category')
    .eq('id', serviceId)
    .single();

  if (!service) return;

  // Update preferences
  const { data: existing } = await supabase
    .from('customer_service_preferences')
    .select('*')
    .eq('customer_id', customerId)
    .eq('service_category', service.category)
    .single();

  const currentScore = existing?.preference_score || 0;
  const currentVisits = existing?.visit_count || 0;
  const currentTimeSlots = existing?.preferred_time_slots || [];
  const currentStaff = existing?.preferred_staff_ids || [];

  await supabase.from('customer_service_preferences').upsert({
    customer_id: customerId,
    service_category: service.category,
    preference_score: Math.min(1, currentScore + 0.1),
    visit_count: currentVisits + 1,
    last_visit: new Date().toISOString().split('T')[0],
    preferred_time_slots: timeSlot
      ? [...new Set([...currentTimeSlots, timeSlot])].slice(-5)
      : currentTimeSlots,
    preferred_staff_ids: staffId
      ? [...new Set([...currentStaff, staffId])].slice(-3)
      : currentStaff,
    updated_at: new Date().toISOString()
  }, { onConflict: 'customer_id,service_category' });
}

// =====================================================
// ANALYTICS
// =====================================================

export async function getRecommendationStats(): Promise<{
  totalRecommendations: number;
  acceptanceRate: number;
  conversionRate: number;
  topRecommendedServices: { service_id: string; count: number }[];
  topAcceptedServices: { service_id: string; count: number }[];
}> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: recommendations } = await supabase
    .from('service_recommendations')
    .select('service_id, is_shown, is_accepted')
    .gte('created_at', thirtyDaysAgo.toISOString());

  if (!recommendations || recommendations.length === 0) {
    return {
      totalRecommendations: 0,
      acceptanceRate: 0,
      conversionRate: 0,
      topRecommendedServices: [],
      topAcceptedServices: []
    };
  }

  const shown = recommendations.filter(r => r.is_shown);
  const accepted = recommendations.filter(r => r.is_accepted);

  // Count by service
  const recommendedCounts: Record<string, number> = {};
  const acceptedCounts: Record<string, number> = {};

  recommendations.forEach(r => {
    recommendedCounts[r.service_id] = (recommendedCounts[r.service_id] || 0) + 1;
    if (r.is_accepted) {
      acceptedCounts[r.service_id] = (acceptedCounts[r.service_id] || 0) + 1;
    }
  });

  return {
    totalRecommendations: recommendations.length,
    acceptanceRate: shown.length > 0 ? (accepted.length / shown.length) * 100 : 0,
    conversionRate: recommendations.length > 0 ? (accepted.length / recommendations.length) * 100 : 0,
    topRecommendedServices: Object.entries(recommendedCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([service_id, count]) => ({ service_id, count })),
    topAcceptedServices: Object.entries(acceptedCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([service_id, count]) => ({ service_id, count }))
  };
}

export default {
  generateRecommendations,
  getCustomerRecommendations,
  markRecommendationShown,
  recordRecommendationAccepted,
  recordRecommendationRejected,
  getServiceBundles,
  getBundleById,
  createBundle,
  updateBundle,
  deleteBundle,
  recommendBundles,
  updateCustomerPreferences,
  learnFromBooking,
  getRecommendationStats
};
