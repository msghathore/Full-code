import { useState, useEffect, useCallback } from 'react';
import { googleCalendar } from '@/lib/google-calendar';

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
  googleCalendarConnected: boolean;
}

export function useGoogleCalendarAvailability(
  selectedDate: Date | undefined, 
  selectedStaff: string
) {
  const [availability, setAvailability] = useState<AvailabilityData>({
    date: '',
    slots: [],
    lastUpdated: new Date(),
    isLoading: true,
    googleCalendarConnected: googleCalendar.isConfigured(),
  });

  const fetchAvailability = useCallback(async (date: Date, staffId: string) => {
    // Check if Google Calendar API is configured
    if (!googleCalendar.isConfigured()) {
      console.log('Google Calendar API not configured, showing fallback availability');
      
      // Show all slots as available when Google Calendar is not configured
      const timeSlots = ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00'];
      const slots = timeSlots.map(time => ({
        time,
        available: true,
        staffId: staffId || undefined,
      }));

      setAvailability({
        date: date.toISOString().split('T')[0],
        slots,
        lastUpdated: new Date(),
        isLoading: false,
        googleCalendarConnected: false,
      });
      return;
    }

    setAvailability(prev => ({ ...prev, isLoading: true }));

    try {
      const dateStr = date.toISOString().split('T')[0];
      
      // Use Google Calendar ID based on staff selection
      // In a real implementation, each staff member would have their own calendar ID
      const staffCalendarId = selectedStaff 
        ? `staff_${selectedStaff}@zavirasalon.com` 
        : 'primary';

      console.log('🔍 Fetching availability from Google Calendar for:', { dateStr, staffCalendarId });
      
      const availabilityData = await googleCalendar.getAvailabilityForDate(
        date,
        staffCalendarId
      );

      console.log('✅ Google Calendar availability fetched:', availabilityData);

      setAvailability({
        ...availabilityData,
        isLoading: false,
        googleCalendarConnected: true,
      });
    } catch (error) {
      console.error('❌ Error fetching Google Calendar availability:', error);
      
      // Fallback to showing all slots as available
      const timeSlots = ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00'];
      const slots = timeSlots.map(time => ({
        time,
        available: true,
        staffId: staffId || undefined,
      }));

      setAvailability({
        date: date.toISOString().split('T')[0],
        slots,
        lastUpdated: new Date(),
        isLoading: false,
        googleCalendarConnected: false,
      });
    }
  }, [selectedStaff]);

  // Update availability when date or staff changes
  useEffect(() => {
    if (selectedDate) {
      fetchAvailability(selectedDate, selectedStaff);
    }
  }, [selectedDate, selectedStaff, fetchAvailability]);

  // Periodic updates every 60 seconds for real-time feel
  useEffect(() => {
    if (!selectedDate || !googleCalendar.isConfigured()) return;

    const interval = setInterval(() => {
      fetchAvailability(selectedDate, selectedStaff);
    }, 60000); // 60 seconds

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

  const refreshAvailability = () => {
    if (selectedDate) {
      fetchAvailability(selectedDate, selectedStaff);
    }
  };

  return {
    availability,
    getAvailableSlots,
    getTimeAgo,
    refreshAvailability,
    googleCalendarStatus: googleCalendar.getStatus(),
  };
}