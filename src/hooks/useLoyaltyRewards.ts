import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string | null;
  points_required: number;
  discount_amount: number | null;
  category: 'service' | 'product' | 'experience';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Hook to fetch loyalty rewards from the database
 * Only returns active rewards by default
 */
export const useLoyaltyRewards = () => {
  return useQuery({
    queryKey: ['loyalty-rewards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .eq('is_active', true)
        .order('points_required', { ascending: true });

      if (error) throw error;

      // Transform to match the component's expected format
      return (data as LoyaltyReward[]).map(reward => ({
        id: reward.id,
        name: reward.name,
        description: reward.description,
        points_required: reward.points_required,
        category: reward.category,
        available: reward.is_active,
      }));
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
