import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AvailabilitySlot {
  time: string;
  available: boolean;
  staffId?: string;
}

interface AvailabilityData {
  date: string;
  slots: AvailabilitySlot[];
  lastUpdated: Date;
  isLoading: boolean;
}

export function useRealtimeAvailability(selectedDate: Date | undefined, selectedStaff: string) {
  const [availability, setAvailability] = useState<AvailabilityData>({
    date: '',
    slots: [],
    lastUpdated: new Date(),
    isLoading: true,
  });

  const fetchAvailability = useCallback(async (date: Date, staffId: string) => {
    const timeSlots = ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00'];
    
    setAvailability(prev => ({ ...prev, isLoading: true }));

    try {
      const dateStr = date.toISOString().split('T')[0];
      
      // If no staff selected, show all slots as available for selection
      if (!staffId) {
        const slots = timeSlots.map(time => ({
          time,
          available: true,
          staffId: undefined,
        }));

        setAvailability({
          date: dateStr,
          slots,
          lastUpdated: new Date(),
          isLoading: false,
        });
        return;
      }
      
      // Query database for existing appointments
      const { data: existingAppointments, error } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('appointment_date', dateStr)
        .eq('staff_id', staffId)
        .neq('status', 'cancelled');
      
      if (error) {
        console.log('Database query failed:', error);
        // Show all slots as available if database query fails
        const slots = timeSlots.map(time => ({
          time,
          available: true,
          staffId: staffId,
        }));

        setAvailability({
          date: dateStr,
          slots,
          lastUpdated: new Date(),
          isLoading: false,
        });
        return;
      }

      // Check if there are any existing appointments for this staff on this date
      const bookedTimes = existingAppointments?.map(apt => apt.appointment_time) || [];
      
      if (bookedTimes.length === 0) {
        // No appointments yet - show all slots as available
        const slots = timeSlots.map(time => ({
          time,
          available: true,
          staffId: staffId,
        }));

        setAvailability({
          date: dateStr,
          slots,
          lastUpdated: new Date(),
          isLoading: false,
        });
      } else {
        // Some appointments exist - show realistic availability
        const slots = timeSlots.map(time => ({
          time,
          available: !bookedTimes.includes(time),
          staffId: staffId,
        }));

        setAvailability({
          date: dateStr,
          slots,
          lastUpdated: new Date(),
          isLoading: false,
        });
      }
    } catch (error) {
      console.log('Exception in fetchAvailability:', error);
      // Show all slots as available if exception occurs
      const slots = timeSlots.map(time => ({
        time,
        available: true,
        staffId: staffId,
      }));

      setAvailability({
        date: date.toISOString().split('T')[0],
        slots,
        lastUpdated: new Date(),
        isLoading: false,
      });
    }
  }, []);

  // Update availability when date or staff changes
  useEffect(() => {
    if (selectedDate && selectedStaff) {
      fetchAvailability(selectedDate, selectedStaff);
    }
  }, [selectedDate, selectedStaff, fetchAvailability]);

  // Periodic updates (every 30 seconds) for real-time feel
  useEffect(() => {
    if (!selectedDate || !selectedStaff) return;

    const interval = setInterval(() => {
      fetchAvailability(selectedDate, selectedStaff);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [selectedDate, selectedStaff, fetchAvailability]);

  const getAvailableSlots = () => {
    return availability.slots.filter(slot => slot.available);
  };

  const getTimeAgo = () => {
    const now = new Date();
    const diffMs = now.getTime() - availability.lastUpdated.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins === 1) return '1 minute ago';
    return `${diffMins} minutes ago`;
  };

  return {
    availability,
    getAvailableSlots,
    getTimeAgo,
    refreshAvailability: () => selectedDate && selectedStaff && fetchAvailability(selectedDate, selectedStaff),
  };
}