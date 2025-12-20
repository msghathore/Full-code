import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useStaffAuth } from './useStaffAuth';

export interface StaffMember extends Tables<'staff'> {
  availability?: Tables<'staff_availability'>[];
  totalBookings?: number;
  totalRevenue?: number;
}

export const useStaffData = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isStaffMember } = useStaffAuth();

  useEffect(() => {
    if (!isStaffMember) {
      setLoading(false);
      return;
    }

    const fetchStaffData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch staff members
        const { data: staffData, error: staffError } = await supabase
          .from('staff')
          .select('*')
          .order('name');

        if (staffError) throw staffError;

        // Fetch availability for each staff member
        const staffWithAvailability = await Promise.all(
          (staffData || []).map(async (staffMember) => {
            const { data: availability } = await supabase
              .from('staff_availability')
              .select('*')
              .eq('staff_id', staffMember.id)
              .eq('is_available', true);

            // Get booking count and revenue for the last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const { data: bookings } = await supabase
              .from('appointments')
              .select('total_amount')
              .eq('staff_id', staffMember.id)
              .gte('appointment_date', thirtyDaysAgo.toISOString().split('T')[0]);

            const totalBookings = bookings?.length || 0;
            const totalRevenue = bookings?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0;

            return {
              ...staffMember,
              availability: availability || [],
              totalBookings,
              totalRevenue,
            };
          })
        );

        setStaff(staffWithAvailability);
      } catch (err) {
        console.error('Error fetching staff data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch staff data');
        setStaff([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, [isStaffMember]);

  return {
    staff,
    loading,
    error,
    refetch: () => {
      if (isStaffMember) {
        setLoading(true);
        // Re-trigger the effect by updating a dependency
        setStaff([]);
      }
    },
  };
};