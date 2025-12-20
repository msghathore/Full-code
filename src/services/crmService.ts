// =====================================================
// ADVANCED CUSTOMER CRM SERVICE
// =====================================================

import { supabase } from '@/integrations/supabase/client';
import type {
  CustomerProfile,
  CustomerInteraction,
  CustomerSegment,
  CustomerPurchase,
  SegmentCriteria,
  PaginatedResponse,
  CustomerLifecycleStage
} from '@/types/enterprise';

// =====================================================
// CUSTOMER PROFILE MANAGEMENT
// =====================================================

export async function getCustomerProfiles(
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    search?: string;
    lifecycle_stage?: string;
    tags?: string[];
    min_lifetime_value?: number;
    max_churn_risk?: number;
  }
): Promise<PaginatedResponse<CustomerProfile>> {
  let query = supabase
    .from('customer_profiles')
    .select('*, lifecycle_stage:customer_lifecycle_stages(*)', { count: 'exact' });

  // Apply filters
  if (filters?.search) {
    query = query.or(`email.ilike.%${filters.search}%,first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
  }

  if (filters?.lifecycle_stage) {
    query = query.eq('lifecycle_stage_id', filters.lifecycle_stage);
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.overlaps('tags', filters.tags);
  }

  if (filters?.min_lifetime_value !== undefined) {
    query = query.gte('lifetime_value', filters.min_lifetime_value);
  }

  if (filters?.max_churn_risk !== undefined) {
    query = query.lte('churn_risk_score', filters.max_churn_risk);
  }

  // Pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data: data as CustomerProfile[],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize)
  };
}

export async function getCustomerById(id: string): Promise<CustomerProfile | null> {
  const { data, error } = await supabase
    .from('customer_profiles')
    .select('*, lifecycle_stage:customer_lifecycle_stages(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as CustomerProfile;
}

export async function createCustomer(customer: Partial<CustomerProfile>): Promise<CustomerProfile> {
  const { data, error } = await supabase
    .from('customer_profiles')
    .insert(customer)
    .select('*, lifecycle_stage:customer_lifecycle_stages(*)')
    .single();

  if (error) throw error;
  return data as CustomerProfile;
}

export async function updateCustomer(id: string, updates: Partial<CustomerProfile>): Promise<CustomerProfile> {
  const { data, error } = await supabase
    .from('customer_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, lifecycle_stage:customer_lifecycle_stages(*)')
    .single();

  if (error) throw error;
  return data as CustomerProfile;
}

export async function deleteCustomer(id: string): Promise<void> {
  const { error } = await supabase
    .from('customer_profiles')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// =====================================================
// CUSTOMER INTERACTIONS
// =====================================================

export async function getCustomerInteractions(
  customerId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResponse<CustomerInteraction>> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('customer_interactions')
    .select('*', { count: 'exact' })
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data: data as CustomerInteraction[],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize)
  };
}

export async function addInteraction(interaction: Partial<CustomerInteraction>): Promise<CustomerInteraction> {
  const { data, error } = await supabase
    .from('customer_interactions')
    .insert(interaction)
    .select()
    .single();

  if (error) throw error;
  return data as CustomerInteraction;
}

export async function updateInteraction(id: string, updates: Partial<CustomerInteraction>): Promise<CustomerInteraction> {
  const { data, error } = await supabase
    .from('customer_interactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as CustomerInteraction;
}

// =====================================================
// CUSTOMER SEGMENTATION
// =====================================================

export async function getSegments(): Promise<CustomerSegment[]> {
  const { data, error } = await supabase
    .from('customer_segments')
    .select('*')
    .order('name');

  if (error) throw error;
  return data as CustomerSegment[];
}

export async function createSegment(segment: Partial<CustomerSegment>): Promise<CustomerSegment> {
  const { data, error } = await supabase
    .from('customer_segments')
    .insert(segment)
    .select()
    .single();

  if (error) throw error;

  // Update member count
  await updateSegmentMembers(data.id, segment.criteria!);

  return data as CustomerSegment;
}

export async function updateSegment(id: string, updates: Partial<CustomerSegment>): Promise<CustomerSegment> {
  const { data, error } = await supabase
    .from('customer_segments')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Re-calculate members if criteria changed
  if (updates.criteria) {
    await updateSegmentMembers(id, updates.criteria);
  }

  return data as CustomerSegment;
}

export async function deleteSegment(id: string): Promise<void> {
  // Delete members first
  await supabase.from('customer_segment_members').delete().eq('segment_id', id);

  const { error } = await supabase
    .from('customer_segments')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

async function updateSegmentMembers(segmentId: string, criteria: SegmentCriteria): Promise<void> {
  // Build query based on criteria
  let query = supabase.from('customer_profiles').select('id');

  if (criteria.lifetime_value?.min !== undefined) {
    query = query.gte('lifetime_value', criteria.lifetime_value.min);
  }
  if (criteria.lifetime_value?.max !== undefined) {
    query = query.lte('lifetime_value', criteria.lifetime_value.max);
  }
  if (criteria.total_visits?.min !== undefined) {
    query = query.gte('total_visits', criteria.total_visits.min);
  }
  if (criteria.total_visits?.max !== undefined) {
    query = query.lte('total_visits', criteria.total_visits.max);
  }
  if (criteria.average_spend?.min !== undefined) {
    query = query.gte('average_spend', criteria.average_spend.min);
  }
  if (criteria.average_spend?.max !== undefined) {
    query = query.lte('average_spend', criteria.average_spend.max);
  }
  if (criteria.tags && criteria.tags.length > 0) {
    query = query.overlaps('tags', criteria.tags);
  }
  if (criteria.lifecycle_stages && criteria.lifecycle_stages.length > 0) {
    query = query.in('lifecycle_stage_id', criteria.lifecycle_stages);
  }

  const { data: customers, error } = await query;
  if (error) throw error;

  // Clear existing members
  await supabase.from('customer_segment_members').delete().eq('segment_id', segmentId);

  // Add new members
  if (customers && customers.length > 0) {
    const members = customers.map(c => ({
      segment_id: segmentId,
      customer_id: c.id
    }));

    await supabase.from('customer_segment_members').insert(members);
  }

  // Update member count
  await supabase
    .from('customer_segments')
    .update({ member_count: customers?.length || 0 })
    .eq('id', segmentId);
}

export async function getSegmentMembers(
  segmentId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResponse<CustomerProfile>> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('customer_segment_members')
    .select('customer:customer_profiles(*)', { count: 'exact' })
    .eq('segment_id', segmentId)
    .range(from, to);

  if (error) throw error;

  const customers = data?.map(d => d.customer as CustomerProfile) || [];

  return {
    data: customers,
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize)
  };
}

// =====================================================
// LIFECYCLE STAGES
// =====================================================

export async function getLifecycleStages(): Promise<CustomerLifecycleStage[]> {
  const { data, error } = await supabase
    .from('customer_lifecycle_stages')
    .select('*')
    .order('sort_order');

  if (error) throw error;
  return data as CustomerLifecycleStage[];
}

export async function updateCustomerLifecycleStage(
  customerId: string,
  stageId: string
): Promise<CustomerProfile> {
  // Log the interaction
  await addInteraction({
    customer_id: customerId,
    interaction_type: 'note',
    subject: 'Lifecycle Stage Change',
    content: `Customer lifecycle stage updated`,
    metadata: { new_stage_id: stageId }
  });

  return updateCustomer(customerId, { lifecycle_stage_id: stageId });
}

// =====================================================
// CUSTOMER ANALYTICS
// =====================================================

export async function getCustomerAnalytics(customerId: string) {
  // Get purchase history
  const { data: purchases } = await supabase
    .from('customer_purchases')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  // Get interactions count by type
  const { data: interactions } = await supabase
    .from('customer_interactions')
    .select('interaction_type')
    .eq('customer_id', customerId);

  // Get reviews
  const { data: reviews } = await supabase
    .from('customer_reviews')
    .select('overall_rating, created_at')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  // Calculate metrics
  const totalSpent = purchases?.reduce((sum, p) => sum + p.total_amount, 0) || 0;
  const averageOrderValue = purchases?.length ? totalSpent / purchases.length : 0;
  const interactionsByType = interactions?.reduce((acc, i) => {
    acc[i.interaction_type] = (acc[i.interaction_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};
  const averageRating = reviews?.length
    ? reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length
    : null;

  // Monthly spending trend
  const monthlySpending = purchases?.reduce((acc, p) => {
    const month = new Date(p.created_at).toISOString().slice(0, 7);
    acc[month] = (acc[month] || 0) + p.total_amount;
    return acc;
  }, {} as Record<string, number>) || {};

  return {
    totalSpent,
    averageOrderValue,
    totalPurchases: purchases?.length || 0,
    interactionsByType,
    averageRating,
    totalReviews: reviews?.length || 0,
    monthlySpending,
    recentPurchases: purchases?.slice(0, 5) || []
  };
}

// =====================================================
// CHURN RISK MANAGEMENT
// =====================================================

export async function getAtRiskCustomers(
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResponse<CustomerProfile>> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('customer_profiles')
    .select('*, lifecycle_stage:customer_lifecycle_stages(*)', { count: 'exact' })
    .gte('churn_risk_score', 50)
    .order('churn_risk_score', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data: data as CustomerProfile[],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize)
  };
}

export async function calculateChurnRiskScore(customerId: string): Promise<number> {
  const { data: customer } = await supabase
    .from('customer_profiles')
    .select('last_visit_date, total_visits')
    .eq('id', customerId)
    .single();

  if (!customer) return 50;

  const daysSinceVisit = customer.last_visit_date
    ? Math.floor((Date.now() - new Date(customer.last_visit_date).getTime()) / (1000 * 60 * 60 * 24))
    : 90;

  // Get average gap between visits
  const { data: purchases } = await supabase
    .from('customer_purchases')
    .select('created_at')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: true });

  let avgGap = 30; // Default 30 days
  if (purchases && purchases.length > 1) {
    const gaps: number[] = [];
    for (let i = 1; i < purchases.length; i++) {
      const gap = Math.floor(
        (new Date(purchases[i].created_at).getTime() - new Date(purchases[i-1].created_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      gaps.push(gap);
    }
    avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  }

  // Calculate risk score (0-100)
  let riskScore = Math.min(100, (daysSinceVisit / avgGap) * 30);

  // Adjust based on total visits (more visits = lower base risk)
  if (customer.total_visits > 10) riskScore *= 0.8;
  else if (customer.total_visits > 5) riskScore *= 0.9;

  return Math.round(riskScore);
}

export async function updateAllChurnRiskScores(): Promise<void> {
  const { data: customers } = await supabase
    .from('customer_profiles')
    .select('id');

  if (!customers) return;

  for (const customer of customers) {
    const score = await calculateChurnRiskScore(customer.id);
    await supabase
      .from('customer_profiles')
      .update({ churn_risk_score: score })
      .eq('id', customer.id);
  }
}

// =====================================================
// CUSTOMER TAGS
// =====================================================

export async function addTagToCustomer(customerId: string, tag: string): Promise<CustomerProfile> {
  const customer = await getCustomerById(customerId);
  if (!customer) throw new Error('Customer not found');

  const tags = [...new Set([...(customer.tags || []), tag])];
  return updateCustomer(customerId, { tags });
}

export async function removeTagFromCustomer(customerId: string, tag: string): Promise<CustomerProfile> {
  const customer = await getCustomerById(customerId);
  if (!customer) throw new Error('Customer not found');

  const tags = (customer.tags || []).filter(t => t !== tag);
  return updateCustomer(customerId, { tags });
}

export async function getAllTags(): Promise<string[]> {
  const { data } = await supabase
    .from('customer_profiles')
    .select('tags');

  if (!data) return [];

  const allTags = data.flatMap(d => d.tags || []);
  return [...new Set(allTags)].sort();
}

// =====================================================
// CUSTOMER SEARCH
// =====================================================

export async function searchCustomers(query: string, limit: number = 10): Promise<CustomerProfile[]> {
  const { data, error } = await supabase
    .from('customer_profiles')
    .select('*, lifecycle_stage:customer_lifecycle_stages(*)')
    .or(`email.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%,phone.ilike.%${query}%`)
    .limit(limit);

  if (error) throw error;
  return data as CustomerProfile[];
}

// =====================================================
// CUSTOMER MERGE
// =====================================================

export async function mergeCustomers(
  primaryId: string,
  secondaryId: string
): Promise<CustomerProfile> {
  // Get both customers
  const [primary, secondary] = await Promise.all([
    getCustomerById(primaryId),
    getCustomerById(secondaryId)
  ]);

  if (!primary || !secondary) throw new Error('Customer not found');

  // Merge data (primary takes precedence)
  const merged: Partial<CustomerProfile> = {
    first_name: primary.first_name || secondary.first_name,
    last_name: primary.last_name || secondary.last_name,
    phone: primary.phone || secondary.phone,
    date_of_birth: primary.date_of_birth || secondary.date_of_birth,
    gender: primary.gender || secondary.gender,
    profile_image_url: primary.profile_image_url || secondary.profile_image_url,
    referral_source: primary.referral_source || secondary.referral_source,
    notes: [primary.notes, secondary.notes].filter(Boolean).join('\n\n'),
    tags: [...new Set([...(primary.tags || []), ...(secondary.tags || [])])],
    custom_fields: { ...secondary.custom_fields, ...primary.custom_fields },
    lifetime_value: primary.lifetime_value + secondary.lifetime_value,
    total_visits: primary.total_visits + secondary.total_visits
  };

  // Update primary customer
  await updateCustomer(primaryId, merged);

  // Move all interactions to primary
  await supabase
    .from('customer_interactions')
    .update({ customer_id: primaryId })
    .eq('customer_id', secondaryId);

  // Move all purchases to primary
  await supabase
    .from('customer_purchases')
    .update({ customer_id: primaryId })
    .eq('customer_id', secondaryId);

  // Move segment memberships
  await supabase
    .from('customer_segment_members')
    .update({ customer_id: primaryId })
    .eq('customer_id', secondaryId);

  // Delete secondary customer
  await deleteCustomer(secondaryId);

  // Log the merge
  await addInteraction({
    customer_id: primaryId,
    interaction_type: 'note',
    subject: 'Customer Merge',
    content: `Merged with customer ${secondary.email}`,
    metadata: { merged_customer_id: secondaryId, merged_email: secondary.email }
  });

  return getCustomerById(primaryId) as Promise<CustomerProfile>;
}

// =====================================================
// BULK OPERATIONS
// =====================================================

export async function bulkUpdateCustomers(
  customerIds: string[],
  updates: Partial<CustomerProfile>
): Promise<void> {
  const { error } = await supabase
    .from('customer_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .in('id', customerIds);

  if (error) throw error;
}

export async function bulkAddTag(customerIds: string[], tag: string): Promise<void> {
  for (const id of customerIds) {
    await addTagToCustomer(id, tag);
  }
}

export async function bulkRemoveTag(customerIds: string[], tag: string): Promise<void> {
  for (const id of customerIds) {
    await removeTagFromCustomer(id, tag);
  }
}

// =====================================================
// EXPORT
// =====================================================

export async function exportCustomers(
  filters?: {
    segment_id?: string;
    tags?: string[];
    lifecycle_stage?: string;
  }
): Promise<CustomerProfile[]> {
  let query = supabase.from('customer_profiles').select('*');

  if (filters?.segment_id) {
    const { data: members } = await supabase
      .from('customer_segment_members')
      .select('customer_id')
      .eq('segment_id', filters.segment_id);

    const ids = members?.map(m => m.customer_id) || [];
    query = query.in('id', ids);
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.overlaps('tags', filters.tags);
  }

  if (filters?.lifecycle_stage) {
    query = query.eq('lifecycle_stage_id', filters.lifecycle_stage);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data as CustomerProfile[];
}

export default {
  getCustomerProfiles,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerInteractions,
  addInteraction,
  updateInteraction,
  getSegments,
  createSegment,
  updateSegment,
  deleteSegment,
  getSegmentMembers,
  getLifecycleStages,
  updateCustomerLifecycleStage,
  getCustomerAnalytics,
  getAtRiskCustomers,
  calculateChurnRiskScore,
  updateAllChurnRiskScores,
  addTagToCustomer,
  removeTagFromCustomer,
  getAllTags,
  searchCustomers,
  mergeCustomers,
  bulkUpdateCustomers,
  bulkAddTag,
  bulkRemoveTag,
  exportCustomers
};
