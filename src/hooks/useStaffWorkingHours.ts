import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useStaffWorkingHours = (date: Date) => {
  const [workingStaffIds, setWorkingStaffIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkingStaff = async () => {
      const dayOfWeek = date.getDay(); // 0-6

      const { data, error } = await supabase
        .from('staff_working_hours')
        .select('staff_id')
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true);

      if (!error && data) {
        setWorkingStaffIds(data.map(h => h.staff_id));
      }
      setLoading(false);
    };

    fetchWorkingStaff();
  }, [date]);

  return { workingStaffIds, loading };
};
