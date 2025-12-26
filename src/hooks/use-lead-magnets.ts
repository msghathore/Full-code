import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  LeadMagnet,
  LeadMagnetDownload,
  CreateLeadMagnetDownloadData
} from '@/types/lead-magnets';

/**
 * Hook to fetch all active lead magnets
 */
export const useLeadMagnets = () => {
  return useQuery({
    queryKey: ['lead-magnets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_magnets')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LeadMagnet[];
    },
  });
};

/**
 * Hook to fetch a single lead magnet by slug
 */
export const useLeadMagnet = (slug: string | undefined) => {
  return useQuery({
    queryKey: ['lead-magnet', slug],
    queryFn: async () => {
      if (!slug) return null;

      const { data, error } = await supabase
        .from('lead_magnets')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data as LeadMagnet;
    },
    enabled: !!slug,
  });
};

/**
 * Hook to fetch a single lead magnet by ID
 */
export const useLeadMagnetById = (id: string | undefined) => {
  return useQuery({
    queryKey: ['lead-magnet', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('lead_magnets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as LeadMagnet;
    },
    enabled: !!id,
  });
};

/**
 * Hook to create a lead magnet download record
 */
export const useCreateLeadMagnetDownload = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateLeadMagnetDownloadData) => {
      const { data: result, error } = await supabase
        .from('lead_magnet_downloads')
        .insert({
          lead_magnet_id: data.lead_magnet_id,
          customer_email: data.customer_email,
          customer_name: data.customer_name || null,
          customer_phone: data.customer_phone || null,
        })
        .select()
        .single();

      if (error) throw error;
      return result as LeadMagnetDownload;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-magnet-downloads'] });
      toast({
        title: 'Success!',
        description: 'Your download is ready!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process your download. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to fetch lead magnet downloads for analytics
 * (Admin only - requires RLS policies)
 */
export const useLeadMagnetDownloads = (leadMagnetId?: string) => {
  return useQuery({
    queryKey: ['lead-magnet-downloads', leadMagnetId],
    queryFn: async () => {
      let query = supabase
        .from('lead_magnet_downloads')
        .select('*, lead_magnets(title, slug)')
        .order('downloaded_at', { ascending: false });

      if (leadMagnetId) {
        query = query.eq('lead_magnet_id', leadMagnetId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
};

/**
 * Hook to get download count for a specific lead magnet
 */
export const useLeadMagnetDownloadCount = (leadMagnetId: string | undefined) => {
  return useQuery({
    queryKey: ['lead-magnet-download-count', leadMagnetId],
    queryFn: async () => {
      if (!leadMagnetId) return 0;

      const { count, error } = await supabase
        .from('lead_magnet_downloads')
        .select('*', { count: 'exact', head: true })
        .eq('lead_magnet_id', leadMagnetId);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!leadMagnetId,
  });
};
