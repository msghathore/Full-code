// =====================================================
// AUTOMATED MARKETING ENGINE SERVICE
// =====================================================

import { supabase } from '@/integrations/supabase/client';
import type {
  MarketingCampaign,
  CampaignAnalytics,
  CampaignRecipient,
  MarketingTrigger,
  MessageTemplate,
  CustomerProfile,
  CustomerSegment,
  PaginatedResponse
} from '@/types/enterprise';

// =====================================================
// CAMPAIGN MANAGEMENT
// =====================================================

export async function getCampaigns(
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    status?: string;
    campaign_type?: string;
    trigger_type?: string;
  }
): Promise<PaginatedResponse<MarketingCampaign>> {
  let query = supabase
    .from('marketing_campaigns')
    .select('*', { count: 'exact' });

  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.campaign_type) query = query.eq('campaign_type', filters.campaign_type);
  if (filters?.trigger_type) query = query.eq('trigger_type', filters.trigger_type);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data: data as MarketingCampaign[],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize)
  };
}

export async function getCampaignById(id: string): Promise<MarketingCampaign | null> {
  const { data, error } = await supabase
    .from('marketing_campaigns')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as MarketingCampaign;
}

export async function createCampaign(campaign: Partial<MarketingCampaign>): Promise<MarketingCampaign> {
  const { data, error } = await supabase
    .from('marketing_campaigns')
    .insert(campaign)
    .select()
    .single();

  if (error) throw error;

  // Create analytics record
  await supabase.from('campaign_analytics').insert({
    campaign_id: data.id
  });

  return data as MarketingCampaign;
}

export async function updateCampaign(
  id: string,
  updates: Partial<MarketingCampaign>
): Promise<MarketingCampaign> {
  const { data, error } = await supabase
    .from('marketing_campaigns')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as MarketingCampaign;
}

export async function deleteCampaign(id: string): Promise<void> {
  const { error } = await supabase
    .from('marketing_campaigns')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// =====================================================
// CAMPAIGN EXECUTION
// =====================================================

export async function startCampaign(id: string): Promise<MarketingCampaign> {
  const campaign = await getCampaignById(id);
  if (!campaign) throw new Error('Campaign not found');

  // Get target customers
  let customers: CustomerProfile[] = [];

  if (campaign.target_segment_id) {
    // Get customers from segment
    const { data } = await supabase
      .from('customer_segment_members')
      .select('customer:customer_profiles(*)')
      .eq('segment_id', campaign.target_segment_id);

    customers = data?.map(d => d.customer as CustomerProfile) || [];
  } else if (campaign.target_criteria) {
    // Query customers based on criteria
    let query = supabase.from('customer_profiles').select('*');

    const criteria = campaign.target_criteria;
    if (criteria.lifetime_value?.min !== undefined) {
      query = query.gte('lifetime_value', criteria.lifetime_value.min);
    }
    if (criteria.total_visits?.min !== undefined) {
      query = query.gte('total_visits', criteria.total_visits.min);
    }
    if (criteria.tags && criteria.tags.length > 0) {
      query = query.overlaps('tags', criteria.tags);
    }

    const { data } = await query;
    customers = (data as CustomerProfile[]) || [];
  }

  // Filter customers who opted out
  customers = customers.filter(c => {
    const prefs = c.communication_preferences;
    if (campaign.campaign_type === 'email') return prefs.email;
    if (campaign.campaign_type === 'sms') return prefs.sms;
    if (campaign.campaign_type === 'push') return prefs.push;
    return true;
  });

  // Create recipient records
  const recipients = customers.map(c => ({
    campaign_id: id,
    customer_id: c.id,
    status: 'pending' as const
  }));

  if (recipients.length > 0) {
    await supabase.from('campaign_recipients').insert(recipients);
  }

  // Update campaign status
  return updateCampaign(id, {
    status: 'active',
    started_at: new Date().toISOString()
  });
}

export async function sendCampaignMessages(campaignId: string): Promise<void> {
  const campaign = await getCampaignById(campaignId);
  if (!campaign) throw new Error('Campaign not found');

  // Get pending recipients
  const { data: recipients } = await supabase
    .from('campaign_recipients')
    .select('*, customer:customer_profiles(*)')
    .eq('campaign_id', campaignId)
    .eq('status', 'pending')
    .limit(100);

  if (!recipients || recipients.length === 0) {
    // No more recipients, complete campaign
    await updateCampaign(campaignId, {
      status: 'completed',
      completed_at: new Date().toISOString()
    });
    return;
  }

  // Process each recipient
  for (const recipient of recipients) {
    try {
      // Personalize content
      const personalizedContent = personalizeContent(
        campaign.content,
        recipient.customer as CustomerProfile
      );

      // Send message (mock - would integrate with actual email/SMS service)
      const sent = await sendMessage(
        campaign.campaign_type,
        recipient.customer.email,
        recipient.customer.phone,
        personalizedContent
      );

      // Update recipient status
      await supabase
        .from('campaign_recipients')
        .update({
          status: sent ? 'delivered' : 'failed',
          sent_at: new Date().toISOString(),
          delivered_at: sent ? new Date().toISOString() : null,
          error_message: sent ? null : 'Failed to send'
        })
        .eq('id', recipient.id);

    } catch (error) {
      await supabase
        .from('campaign_recipients')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('id', recipient.id);
    }
  }

  // Update analytics
  await updateCampaignAnalytics(campaignId);
}

function personalizeContent(
  content: { subject?: string; body: string },
  customer: CustomerProfile
): { subject?: string; body: string } {
  const variables: Record<string, string> = {
    first_name: customer.first_name || 'Valued Customer',
    last_name: customer.last_name || '',
    email: customer.email,
    full_name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Valued Customer'
  };

  let subject = content.subject || '';
  let body = content.body;

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'gi');
    subject = subject.replace(regex, value);
    body = body.replace(regex, value);
  });

  return { subject, body };
}

async function sendMessage(
  type: string,
  email: string,
  phone?: string,
  content: { subject?: string; body: string }
): Promise<boolean> {
  // Mock implementation - would integrate with actual services
  console.log(`Sending ${type} message:`, { email, phone, content });

  // Simulate success rate
  return Math.random() > 0.05; // 95% success rate
}

export async function pauseCampaign(id: string): Promise<MarketingCampaign> {
  return updateCampaign(id, { status: 'paused' });
}

export async function resumeCampaign(id: string): Promise<MarketingCampaign> {
  return updateCampaign(id, { status: 'active' });
}

// =====================================================
// CAMPAIGN ANALYTICS
// =====================================================

export async function getCampaignAnalytics(campaignId: string): Promise<CampaignAnalytics | null> {
  const { data, error } = await supabase
    .from('campaign_analytics')
    .select('*')
    .eq('campaign_id', campaignId)
    .single();

  if (error) throw error;
  return data as CampaignAnalytics;
}

export async function updateCampaignAnalytics(campaignId: string): Promise<CampaignAnalytics> {
  // Get recipient stats
  const { data: recipients } = await supabase
    .from('campaign_recipients')
    .select('status, opened_at, clicked_at, converted_at, conversion_value')
    .eq('campaign_id', campaignId);

  if (!recipients) throw new Error('No recipients found');

  const stats = {
    total_sent: recipients.filter(r => r.status !== 'pending').length,
    total_delivered: recipients.filter(r => ['delivered', 'sent'].includes(r.status)).length,
    total_opened: recipients.filter(r => r.opened_at).length,
    total_clicked: recipients.filter(r => r.clicked_at).length,
    total_converted: recipients.filter(r => r.converted_at).length,
    total_bounced: recipients.filter(r => r.status === 'bounced').length,
    revenue_generated: recipients.reduce((sum, r) => sum + (r.conversion_value || 0), 0)
  };

  const analytics = {
    ...stats,
    open_rate: stats.total_delivered > 0 ? (stats.total_opened / stats.total_delivered) * 100 : 0,
    click_rate: stats.total_opened > 0 ? (stats.total_clicked / stats.total_opened) * 100 : 0,
    conversion_rate: stats.total_clicked > 0 ? (stats.total_converted / stats.total_clicked) * 100 : 0,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('campaign_analytics')
    .update(analytics)
    .eq('campaign_id', campaignId)
    .select()
    .single();

  if (error) throw error;
  return data as CampaignAnalytics;
}

export async function trackOpen(campaignId: string, customerId: string): Promise<void> {
  await supabase
    .from('campaign_recipients')
    .update({ opened_at: new Date().toISOString() })
    .eq('campaign_id', campaignId)
    .eq('customer_id', customerId)
    .is('opened_at', null);

  await updateCampaignAnalytics(campaignId);
}

export async function trackClick(campaignId: string, customerId: string): Promise<void> {
  await supabase
    .from('campaign_recipients')
    .update({ clicked_at: new Date().toISOString() })
    .eq('campaign_id', campaignId)
    .eq('customer_id', customerId)
    .is('clicked_at', null);

  await updateCampaignAnalytics(campaignId);
}

export async function trackConversion(
  campaignId: string,
  customerId: string,
  value: number
): Promise<void> {
  await supabase
    .from('campaign_recipients')
    .update({
      converted_at: new Date().toISOString(),
      conversion_value: value
    })
    .eq('campaign_id', campaignId)
    .eq('customer_id', customerId);

  await updateCampaignAnalytics(campaignId);
}

// =====================================================
// AUTOMATED TRIGGERS
// =====================================================

export async function getTriggers(): Promise<MarketingTrigger[]> {
  const { data, error } = await supabase
    .from('marketing_triggers')
    .select('*')
    .order('name');

  if (error) throw error;
  return data as MarketingTrigger[];
}

export async function getActiveTriggers(): Promise<MarketingTrigger[]> {
  const { data, error } = await supabase
    .from('marketing_triggers')
    .select('*')
    .eq('is_active', true);

  if (error) throw error;
  return data as MarketingTrigger[];
}

export async function createTrigger(trigger: Partial<MarketingTrigger>): Promise<MarketingTrigger> {
  const { data, error } = await supabase
    .from('marketing_triggers')
    .insert(trigger)
    .select()
    .single();

  if (error) throw error;
  return data as MarketingTrigger;
}

export async function updateTrigger(
  id: string,
  updates: Partial<MarketingTrigger>
): Promise<MarketingTrigger> {
  const { data, error } = await supabase
    .from('marketing_triggers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as MarketingTrigger;
}

export async function deleteTrigger(id: string): Promise<void> {
  const { error } = await supabase
    .from('marketing_triggers')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function executeTrigger(
  triggerEvent: string,
  customerId: string,
  eventData?: Record<string, any>
): Promise<void> {
  // Get active triggers for this event
  const { data: triggers } = await supabase
    .from('marketing_triggers')
    .select('*')
    .eq('trigger_event', triggerEvent)
    .eq('is_active', true);

  if (!triggers || triggers.length === 0) return;

  // Get customer
  const { data: customer } = await supabase
    .from('customer_profiles')
    .select('*')
    .eq('id', customerId)
    .single();

  if (!customer) return;

  for (const trigger of triggers) {
    // Check conditions
    if (trigger.conditions) {
      // Add condition checking logic here
    }

    // Schedule or send message based on delay
    if (trigger.delay_minutes > 0) {
      // Would typically use a job queue for delayed messages
      console.log(`Scheduling message in ${trigger.delay_minutes} minutes`);
    } else {
      // Send immediately
      const content = personalizeContent(trigger.content, customer);
      await sendMessage(
        trigger.channel,
        customer.email,
        customer.phone,
        content
      );
    }

    // Update trigger stats
    await supabase
      .from('marketing_triggers')
      .update({ total_triggered: trigger.total_triggered + 1 })
      .eq('id', trigger.id);
  }
}

// Pre-defined trigger events
export const TRIGGER_EVENTS = {
  APPOINTMENT_COMPLETED: 'appointment_completed',
  BIRTHDAY: 'birthday',
  NO_VISIT_30_DAYS: 'no_visit_30_days',
  NO_VISIT_60_DAYS: 'no_visit_60_days',
  NO_VISIT_90_DAYS: 'no_visit_90_days',
  REVIEW_REQUESTED: 'review_requested',
  CART_ABANDONED: 'cart_abandoned',
  SIGNUP_WELCOME: 'signup_welcome',
  FIRST_VISIT: 'first_visit'
} as const;

// =====================================================
// MESSAGE TEMPLATES
// =====================================================

export async function getTemplates(
  type?: 'email' | 'sms' | 'push'
): Promise<MessageTemplate[]> {
  let query = supabase
    .from('message_templates')
    .select('*')
    .eq('is_active', true);

  if (type) query = query.eq('template_type', type);

  const { data, error } = await query.order('name');

  if (error) throw error;
  return data as MessageTemplate[];
}

export async function getTemplateById(id: string): Promise<MessageTemplate | null> {
  const { data, error } = await supabase
    .from('message_templates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as MessageTemplate;
}

export async function createTemplate(template: Partial<MessageTemplate>): Promise<MessageTemplate> {
  // Extract variables from template
  const variables = extractVariables(template.body || '');
  if (template.subject) {
    variables.push(...extractVariables(template.subject));
  }

  const { data, error } = await supabase
    .from('message_templates')
    .insert({ ...template, variables: [...new Set(variables)] })
    .select()
    .single();

  if (error) throw error;
  return data as MessageTemplate;
}

export async function updateTemplate(
  id: string,
  updates: Partial<MessageTemplate>
): Promise<MessageTemplate> {
  // Re-extract variables if content changed
  let variables = updates.variables;
  if (updates.body || updates.subject) {
    variables = extractVariables(updates.body || '');
    if (updates.subject) {
      variables.push(...extractVariables(updates.subject));
    }
    variables = [...new Set(variables)];
  }

  const { data, error } = await supabase
    .from('message_templates')
    .update({ ...updates, variables, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as MessageTemplate;
}

export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await supabase
    .from('message_templates')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

function extractVariables(text: string): string[] {
  const regex = /{{(\w+)}}/g;
  const matches = text.match(regex) || [];
  return matches.map(m => m.replace(/{{|}}/g, ''));
}

export async function previewTemplate(
  templateId: string,
  customerId?: string
): Promise<{ subject?: string; body: string }> {
  const template = await getTemplateById(templateId);
  if (!template) throw new Error('Template not found');

  let customer: CustomerProfile | null = null;
  if (customerId) {
    const { data } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('id', customerId)
      .single();
    customer = data as CustomerProfile;
  }

  // Use sample data if no customer
  const sampleCustomer: Partial<CustomerProfile> = customer || {
    first_name: 'Jane',
    last_name: 'Doe',
    email: 'jane.doe@example.com'
  };

  return personalizeContent(
    { subject: template.subject, body: template.body },
    sampleCustomer as CustomerProfile
  );
}

// =====================================================
// DASHBOARD DATA
// =====================================================

export async function getMarketingDashboardData(): Promise<{
  activeCampaigns: number;
  totalSent: number;
  averageOpenRate: number;
  averageClickRate: number;
  totalRevenue: number;
  recentCampaigns: (MarketingCampaign & { analytics: CampaignAnalytics })[];
  performanceByType: { type: string; openRate: number; clickRate: number }[];
}> {
  // Get active campaigns count
  const { count: activeCampaigns } = await supabase
    .from('marketing_campaigns')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  // Get all campaign analytics from last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: campaigns } = await supabase
    .from('marketing_campaigns')
    .select('*, analytics:campaign_analytics(*)')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false });

  const allCampaigns = campaigns || [];
  const analytics = allCampaigns.map(c => c.analytics).filter(Boolean);

  const totalSent = analytics.reduce((sum, a) => sum + (a?.total_sent || 0), 0);
  const totalOpened = analytics.reduce((sum, a) => sum + (a?.total_opened || 0), 0);
  const totalClicked = analytics.reduce((sum, a) => sum + (a?.total_clicked || 0), 0);
  const totalRevenue = analytics.reduce((sum, a) => sum + (a?.revenue_generated || 0), 0);

  const averageOpenRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
  const averageClickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;

  // Performance by type
  const byType: Record<string, { sent: number; opened: number; clicked: number }> = {};
  allCampaigns.forEach(c => {
    const type = c.campaign_type;
    if (!byType[type]) {
      byType[type] = { sent: 0, opened: 0, clicked: 0 };
    }
    byType[type].sent += c.analytics?.total_sent || 0;
    byType[type].opened += c.analytics?.total_opened || 0;
    byType[type].clicked += c.analytics?.total_clicked || 0;
  });

  const performanceByType = Object.entries(byType).map(([type, data]) => ({
    type,
    openRate: data.sent > 0 ? (data.opened / data.sent) * 100 : 0,
    clickRate: data.opened > 0 ? (data.clicked / data.opened) * 100 : 0
  }));

  return {
    activeCampaigns: activeCampaigns || 0,
    totalSent,
    averageOpenRate: Math.round(averageOpenRate * 10) / 10,
    averageClickRate: Math.round(averageClickRate * 10) / 10,
    totalRevenue,
    recentCampaigns: allCampaigns.slice(0, 5) as (MarketingCampaign & { analytics: CampaignAnalytics })[],
    performanceByType
  };
}

export default {
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  startCampaign,
  sendCampaignMessages,
  pauseCampaign,
  resumeCampaign,
  getCampaignAnalytics,
  updateCampaignAnalytics,
  trackOpen,
  trackClick,
  trackConversion,
  getTriggers,
  getActiveTriggers,
  createTrigger,
  updateTrigger,
  deleteTrigger,
  executeTrigger,
  TRIGGER_EVENTS,
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  previewTemplate,
  getMarketingDashboardData
};
