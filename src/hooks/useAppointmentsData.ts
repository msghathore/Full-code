import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useStaffAuth } from './useStaffAuth';

export interface AppointmentWithDetails extends Tables<'appointments'> {
  service?: Tables<'services'>;
  customer?: Tables<'customers'>;
  staff?: Tables<'staff'>;
}

export const useAppointmentsData = (dateRange?: { start: string; end: string }) => {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isStaffMember } = useStaffAuth();

  useEffect(() => {
    if (!isStaffMember) {
      setLoading(false);
      return;
    }

    const fetchAppointmentsData = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('appointments')
          .select(`
            *,
            service:services(*),
            customer:customers(*),
            staff:staff(*)
          `)
          .order('appointment_date', { ascending: true })
          .order('appointment_time', { ascending: true });

        // Apply date range filter if provided
        if (dateRange) {
          query = query
            .gte('appointment_date', dateRange.start)
            .lte('appointment_date', dateRange.end);
        } else {
          // Default to current week
          const today = new Date();
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);

          query = query
            .gte('appointment_date', startOfWeek.toISOString().split('T')[0])
            .lte('appointment_date', endOfWeek.toISOString().split('T')[0]);
        }

        const { data: appointmentsData, error: appointmentsError } = await query;

        if (appointmentsError) throw appointmentsError;

        setAppointments(appointmentsData || []);
      } catch (err) {
        console.error('Error fetching appointments data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch appointments data');
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentsData();
  }, [isStaffMember, dateRange]);

  const refetch = () => {
    if (isStaffMember) {
      setLoading(true);
      // Re-trigger the effect by updating a dependency
      setAppointments([]);
    }
  };

  return {
    appointments,
    loading,
    error,
    refetch,
  };
};