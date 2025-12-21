import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface OperatingHours {
  id: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

interface TimeSlot {
  time: string;
  display: string;
}

/**
 * Hook to fetch operating hours from the database
 * Returns operating hours for a specific day or all days
 */
export const useOperatingHours = (selectedDate?: Date) => {
  return useQuery({
    queryKey: ['operating-hours', selectedDate?.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('operating_hours')
        .select('*')
        .order('day_of_week');

      if (error) throw error;
      return data as OperatingHours[];
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
};

/**
 * Helper to get operating hours for a specific date
 */
export const getHoursForDate = (hours: OperatingHours[], date: Date) => {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  return hours.find(h => h.day_of_week === dayOfWeek);
};

/**
 * Helper to generate time slots based on operating hours
 */
export const generateTimeSlots = (
  openTime: string,
  closeTime: string
): TimeSlot[] => {
  const slots: TimeSlot[] = [];

  // Parse open and close times (format: "HH:MM:SS")
  const [openHour, openMin] = openTime.split(':').map(Number);
  const [closeHour, closeMin] = closeTime.split(':').map(Number);

  // Convert to minutes for easier calculation
  let currentMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;

  // Generate slots every 30 minutes
  while (currentMinutes <= closeMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const mins = currentMinutes % 60;

    // Format time as HH:MM
    const time = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

    // Format display time (12-hour format with AM/PM)
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const period = hours >= 12 ? 'PM' : 'AM';
    const display = `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;

    slots.push({ time, display });

    // Increment by 30 minutes
    currentMinutes += 30;
  }

  return slots;
};
