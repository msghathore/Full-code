import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type EmailCampaign = Tables<'email_campaigns'>;
export type EmailCampaignInsert = TablesInsert<'email_campaigns'>;
export type EmailCampaignUpdate = TablesUpdate<'email_campaigns'>;

export interface EmailCampaignFilters {
  status?: string;
  type?: string;
  search?: string;
}

export interface EmailCampaignStats {
  total: number;
  sent: number;
  scheduled: number;
  draft: number;
  totalRevenue: number;
  avgOpenRate: number;
  avgClickRate: number;
}

class EmailCampaignService {
  /**
   * Get all email campaigns with optional filtering
   */
  async getCampaigns(filters: EmailCampaignFilters = {}): Promise<EmailCampaign[]> {
    let query = supabase
      .from('email_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,subject.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching email campaigns:', error);
      throw new Error(`Failed to fetch email campaigns: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get a single email campaign by ID
   */
  async getCampaignById(id: string): Promise<EmailCampaign | null> {
    const { data, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Error fetching email campaign:', error);
      throw new Error(`Failed to fetch email campaign: ${error.message}`);
    }

    return data;
  }

  /**
   * Create a new email campaign
   */
  async createCampaign(campaign: EmailCampaignInsert): Promise<EmailCampaign> {
    const { data, error } = await supabase
      .from('email_campaigns')
      .insert(campaign)
      .select()
      .single();

    if (error) {
      console.error('Error creating email campaign:', error);
      throw new Error(`Failed to create email campaign: ${error.message}`);
    }

    return data;
  }

  /**
   * Update an existing email campaign
   */
  async updateCampaign(id: string, updates: EmailCampaignUpdate): Promise<EmailCampaign> {
    const { data, error } = await supabase
      .from('email_campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating email campaign:', error);
      throw new Error(`Failed to update email campaign: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete an email campaign
   */
  async deleteCampaign(id: string): Promise<void> {
    const { error } = await supabase
      .from('email_campaigns')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting email campaign:', error);
      throw new Error(`Failed to delete email campaign: ${error.message}`);
    }
  }

  /**
   * Get campaign statistics
   */
  async getCampaignStats(): Promise<EmailCampaignStats> {
    const { data: campaigns, error } = await supabase
      .from('email_campaigns')
      .select('*');

    if (error) {
      console.error('Error fetching campaign stats:', error);
      throw new Error(`Failed to fetch campaign stats: ${error.message}`);
    }

    if (!campaigns || campaigns.length === 0) {
      return {
        total: 0,
        sent: 0,
        scheduled: 0,
        draft: 0,
        totalRevenue: 0,
        avgOpenRate: 0,
        avgClickRate: 0,
      };
    }

    const sentCampaigns = campaigns.filter(c => c.sent_count && c.sent_count > 0);

    return {
      total: campaigns.length,
      sent: campaigns.filter(c => c.status === 'sent' || c.status === 'completed').length,
      scheduled: campaigns.filter(c => c.status === 'scheduled').length,
      draft: campaigns.filter(c => c.status === 'draft').length,
      totalRevenue: campaigns.reduce((sum, c) => sum + (c.revenue || 0), 0),
      avgOpenRate: sentCampaigns.length > 0
        ? Math.round(sentCampaigns.reduce((sum, c) => sum + (c.open_rate || 0), 0) / sentCampaigns.length * 10) / 10
        : 0,
      avgClickRate: sentCampaigns.length > 0
        ? Math.round(sentCampaigns.reduce((sum, c) => sum + (c.click_rate || 0), 0) / sentCampaigns.length * 10) / 10
        : 0,
    };
  }

  /**
   * Get customers for targeting (basic implementation)
   */
  async getCustomersForTargeting(): Promise<Array<{ id: string; name: string; email: string; segment: string }>> {
    const { data, error } = await supabase
      .from('customers')
      .select('id, name, email')
      .not('email', 'is', null);

    if (error) {
      console.error('Error fetching customers for targeting:', error);
      throw new Error(`Failed to fetch customers: ${error.message}`);
    }

    // Add segment logic (simplified)
    return (data || []).map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email!,
      segment: 'Regular', // This could be enhanced with actual segmentation logic
    }));
  }

  /**
   * Send a campaign (update status and sent_count)
   */
  async sendCampaign(id: string, sentCount: number): Promise<EmailCampaign> {
    const { data, error } = await supabase
      .from('email_campaigns')
      .update({
        status: 'sent',
        sent_count: sentCount,
        send_date: new Date().toISOString().split('T')[0],
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error sending email campaign:', error);
      throw new Error(`Failed to send email campaign: ${error.message}`);
    }

    return data;
  }

  /**
   * Update campaign performance metrics
   */
  async updateCampaignMetrics(
    id: string,
    metrics: { openRate?: number; clickRate?: number; conversionRate?: number; revenue?: number }
  ): Promise<EmailCampaign> {
    const { data, error } = await supabase
      .from('email_campaigns')
      .update(metrics)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating campaign metrics:', error);
      throw new Error(`Failed to update campaign metrics: ${error.message}`);
    }

    return data;
  }
}

// Export singleton instance
export const emailCampaignService = new EmailCampaignService();

// Export convenience functions
export const emailCampaignApi = {
  getAll: (filters?: EmailCampaignFilters) => emailCampaignService.getCampaigns(filters),
  getById: (id: string) => emailCampaignService.getCampaignById(id),
  create: (campaign: EmailCampaignInsert) => emailCampaignService.createCampaign(campaign),
  update: (id: string, updates: EmailCampaignUpdate) => emailCampaignService.updateCampaign(id, updates),
  delete: (id: string) => emailCampaignService.deleteCampaign(id),
  getStats: () => emailCampaignService.getCampaignStats(),
  getCustomersForTargeting: () => emailCampaignService.getCustomersForTargeting(),
  send: (id: string, sentCount: number) => emailCampaignService.sendCampaign(id, sentCount),
  updateMetrics: (id: string, metrics: { openRate?: number; clickRate?: number; conversionRate?: number; revenue?: number }) =>
    emailCampaignService.updateCampaignMetrics(id, metrics),
};