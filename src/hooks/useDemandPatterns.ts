import { useState, useEffect, useMemo } from 'react';
import { useAppointmentsData } from './useAppointmentsData';
import { useStaffAuth } from './useStaffAuth';

export interface DemandPattern {
  day: string;
  hour: number;
  demand: number; // 0-100
  avgBookings: number;
}

export const useDemandPatterns = (weeksToAnalyze: number = 4) => {
  const [demandPatterns, setDemandPatterns] = useState<DemandPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isStaffMember } = useStaffAuth();

  // Calculate date range for analysis (last N weeks)
  const dateRange = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - (weeksToAnalyze * 7));

    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    };
  }, [weeksToAnalyze]);

  const { appointments, loading: appointmentsLoading, error: appointmentsError } = useAppointmentsData(dateRange);

  useEffect(() => {
    if (!isStaffMember) {
      setLoading(false);
      return;
    }

    if (appointmentsLoading) {
      setLoading(true);
      return;
    }

    if (appointmentsError) {
      setError(appointmentsError);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Initialize demand patterns for all days and hours
      const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

      const patterns: DemandPattern[] = [];

      daysOfWeek.forEach(day => {
        hours.forEach(hour => {
          // Count appointments for this day/hour combination across all weeks
          const matchingAppointments = appointments.filter(appointment => {
            const appointmentDate = new Date(appointment.appointment_date);
            const appointmentDay = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });
            const appointmentHour = parseInt(appointment.appointment_time.split(':')[0]);

            return appointmentDay === day && appointmentHour === hour;
          });

          // Calculate demand based on booking frequency
          const avgBookings = matchingAppointments.length / weeksToAnalyze;
          const demand = Math.min(100, Math.max(0, avgBookings * 20)); // Scale to 0-100

          patterns.push({
            day,
            hour,
            demand: Math.round(demand),
            avgBookings: Math.round(avgBookings * 10) / 10, // Round to 1 decimal
          });
        });
      });

      setDemandPatterns(patterns);
    } catch (err) {
      console.error('Error calculating demand patterns:', err);
      setError(err instanceof Error ? err.message : 'Failed to calculate demand patterns');
      setDemandPatterns([]);
    } finally {
      setLoading(false);
    }
  }, [appointments, appointmentsLoading, appointmentsError, isStaffMember, weeksToAnalyze]);

  return {
    demandPatterns,
    loading,
    error,
  };
};