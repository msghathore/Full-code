import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useStaffAuth } from './useStaffAuth';

export interface BookingData {
  id: string;
  date: string;
  time: string;
  service: string;
  staff: string;
  customer: string;
  phone: string;
  email: string;
  price: number;
  duration: number;
  status: string;
  notes?: string;
}

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isStaffMember } = useStaffAuth();

  const fetchAppointments = async () => {
    if (!isStaffMember) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch appointments with joined services and staff data
      const { data, error: fetchError } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          appointment_time,
          full_name,
          email,
          phone,
          notes,
          status,
          total_amount,
          services:service_id (
            name,
            duration_minutes,
            price
          ),
          staff:staff_id (
            name
          )
        `)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Map the data to the expected format
      const mappedAppointments: BookingData[] = (data || []).map(appointment => ({
        id: appointment.id,
        date: appointment.appointment_date,
        time: appointment.appointment_time,
        service: appointment.services?.name || 'Unknown Service',
        staff: appointment.staff?.name || 'Unknown Staff',
        customer: appointment.full_name || 'Unknown Customer',
        phone: appointment.phone || '',
        email: appointment.email || '',
        price: appointment.total_amount || 0,
        duration: appointment.services?.duration_minutes || 60,
        status: appointment.status || 'pending',
        notes: appointment.notes || undefined,
      }));

      setAppointments(mappedAppointments);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) throw error;

      // Update local state
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId
            ? { ...apt, status: newStatus }
            : apt
        )
      );

      return { success: true };
    } catch (err) {
      console.error('Error updating appointment status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update appointment');
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [isStaffMember]);

  return {
    appointments,
    loading,
    error,
    refetch: fetchAppointments,
    updateAppointmentStatus,
  };
};