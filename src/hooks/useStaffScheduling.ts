import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useStaffAuth } from './useStaffAuth';

export interface StaffAvailabilityUpdate {
  staff_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export const useStaffScheduling = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isStaffMember } = useStaffAuth();

  const updateStaffAvailability = async (updates: StaffAvailabilityUpdate[]) => {
    if (!isStaffMember) {
      setError('Access denied: Staff member authentication required');
      return { success: false, error: 'Access denied' };
    }

    try {
      setLoading(true);
      setError(null);

      // Process each availability update
      const results = await Promise.all(
        updates.map(async (update) => {
          const { data, error } = await supabase
            .from('staff_availability')
            .upsert({
              staff_id: update.staff_id,
              date: update.date,
              start_time: update.start_time,
              end_time: update.end_time,
              is_available: update.is_available,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'staff_id,date,start_time'
            })
            .select();

          if (error) throw error;
          return data;
        })
      );

      return { success: true, data: results };
    } catch (err) {
      console.error('Error updating staff availability:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update staff availability';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const createPersonalTask = async (taskData: {
    staff_id: string;
    appointment_date: string;
    appointment_time: string;
    description: string;
    duration_minutes: number;
  }) => {
    if (!isStaffMember) {
      setError('Access denied: Staff member authentication required');
      return { success: false, error: 'Access denied' };
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .rpc('create_personal_task_uuid', {
          appointmentdate: taskData.appointment_date,
          appointmenttime: taskData.appointment_time,
          description: taskData.description,
          durationminutes: taskData.duration_minutes,
          staffid: taskData.staff_id,
        });

      if (error) throw error;

      return { success: true, data };
    } catch (err) {
      console.error('Error creating personal task:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create personal task';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStaff = async (appointmentId: string, staffId: string) => {
    if (!isStaffMember) {
      setError('Access denied: Staff member authentication required');
      return { success: false, error: 'Access denied' };
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('appointments')
        .update({
          staff_id: staffId,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId)
        .select();

      if (error) throw error;

      return { success: true, data };
    } catch (err) {
      console.error('Error updating appointment staff:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update appointment staff';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getStaffWorkingHours = async (date: string, staffId: string) => {
    if (!isStaffMember) {
      setError('Access denied: Staff member authentication required');
      return { success: false, data: [] };
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .rpc('get_staff_working_hours', {
          p_date: date,
          p_staff_id: staffId,
        });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (err) {
      console.error('Error getting staff working hours:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to get staff working hours';
      setError(errorMessage);
      return { success: false, data: [], error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateStaffWorkingHours = async (
    date: string,
    staffId: string,
    startTime: string,
    endTime: string,
    isAvailable: boolean = true
  ) => {
    if (!isStaffMember) {
      setError('Access denied: Staff member authentication required');
      return { success: false, error: 'Access denied' };
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .rpc('update_staff_working_hours', {
          p_date: date,
          p_end_time: endTime,
          p_is_available: isAvailable,
          p_staff_id: staffId,
          p_start_time: startTime,
        });

      if (error) throw error;

      return { success: true, data };
    } catch (err) {
      console.error('Error updating staff working hours:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update staff working hours';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const optimizeSchedule = async (dateRange: { start: string; end: string }) => {
    if (!isStaffMember) {
      setError('Access denied: Staff member authentication required');
      return { success: false, error: 'Access denied' };
    }

    try {
      setLoading(true);
      setError(null);

      // This would be a complex algorithm to optimize scheduling
      // For now, we'll implement a basic version that balances workload

      // Get all staff and their current assignments
      const { data: staffData } = await supabase
        .from('staff')
        .select('id, name');

      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select('staff_id, appointment_date')
        .gte('appointment_date', dateRange.start)
        .lte('appointment_date', dateRange.end);

      // Calculate current workload distribution
      const workloadMap = new Map<string, number>();
      staffData?.forEach(staff => {
        const staffAppointments = appointmentsData?.filter(app => app.staff_id === staff.id) || [];
        workloadMap.set(staff.id, staffAppointments.length);
      });

      // Find overloaded and underloaded staff
      const avgWorkload = Array.from(workloadMap.values()).reduce((sum, w) => sum + w, 0) / workloadMap.size;
      const overloaded = Array.from(workloadMap.entries()).filter(([, workload]) => workload > avgWorkload * 1.2);
      const underloaded = Array.from(workloadMap.entries()).filter(([, workload]) => workload < avgWorkload * 0.8);

      // Generate recommendations
      const recommendations = [];

      for (const [staffId, workload] of overloaded) {
        const staff = staffData?.find(s => s.id === staffId);
        recommendations.push({
          type: 'reduce',
          staffId,
          staffName: staff?.name,
          currentWorkload: workload,
          recommendedWorkload: Math.round(avgWorkload),
          reason: 'Overloaded - consider redistributing appointments'
        });
      }

      for (const [staffId, workload] of underloaded) {
        const staff = staffData?.find(s => s.id === staffId);
        recommendations.push({
          type: 'increase',
          staffId,
          staffName: staff?.name,
          currentWorkload: workload,
          recommendedWorkload: Math.round(avgWorkload),
          reason: 'Underloaded - can take more appointments'
        });
      }

      return { success: true, data: recommendations };
    } catch (err) {
      console.error('Error optimizing schedule:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to optimize schedule';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    updateStaffAvailability,
    createPersonalTask,
    updateAppointmentStaff,
    getStaffWorkingHours,
    updateStaffWorkingHours,
    optimizeSchedule,
  };
};