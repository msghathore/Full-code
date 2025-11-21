/**
 * SLOT ACTION POPOVER MENU - SUPABASE SERVICE FUNCTIONS
 * This file contains all the service functions for slot actions
 */

import { supabase } from '@/integrations/supabase/client';

export interface WaitlistEntry {
  id: string;
  staff_id: string;
  date: string;
  start_time: string;
  customer_name: string;
  customer_phone: string;
  notes?: string;
  created_at: string;
}

export interface StaffAvailability {
  id: string;
  staff_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface PersonalTask {
  id: string;
  staff_id: string;
  appointment_date: string;
  appointment_time: string;
  description: string;
  status: string;
  type: string; // Changed from specific union to string for compatibility
  created_at: string;
}

/**
 * WAITLIST FUNCTIONS
 */

// Add customer to waitlist
export const addToWaitlist = async (
  staffId: string,
  date: string,
  startTime: string,
  customerName: string,
  customerPhone: string,
  notes?: string
): Promise<{ data?: string; error?: any }> => {
  try {
    // FIXED: First try the RPC function, fall back to direct table insertion
    console.log('[DEBUG] Calling add_to_waitlist RPC with:', { staffId, date, startTime, customerName, customerPhone, notes });
    const { data, error } = await (supabase as any).rpc('add_to_waitlist', {
      p_staff_id: staffId,
      p_date: date,
      p_start_time: startTime,
      p_customer_name: customerName,
      p_customer_phone: customerPhone,
      p_notes: notes
    });
    console.log('[DEBUG] add_to_waitlist RPC result:', { data, error });

    if (error) {
      // If RPC doesn't exist, try direct table insertion
      console.log('[DEBUG] RPC function not found, trying direct table insertion');
      const { data: directData, error: directError } = await supabase
        .from('waitlists')
        .insert([{
          staff_id: staffId,
          date: date,
          start_time: startTime,
          customer_name: customerName,
          customer_phone: customerPhone,
          notes: notes
        }])
        .select('id')
        .single();

      if (directError) {
        throw new Error(`Database error: ${directError.message}`);
      }

      return { data: directData?.id, error: null };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    
    // Enhanced error message for user
    let errorMessage = 'Failed to add customer to waitlist';
    if (error.message.includes('does not exist') || error.message.includes('relation "public.waitlists" does not exist')) {
      errorMessage = 'Database not set up. Please run the slot action schema migration.';
    } else if (error.message.includes('JWT')) {
      errorMessage = 'Authentication required. Please log in again.';
    }
    
    return { data: null, error: { message: errorMessage, originalError: error } };
  }
};

// Get waitlist entries for a staff member
export const getWaitlistEntries = async (
  staffId?: string,
  date?: string
): Promise<{ data?: WaitlistEntry[]; error?: any }> => {
  try {
    // FIXED: Direct table query with fallback
    let query = supabase.from('waitlists').select('*');
    
    if (staffId) {
      query = query.eq('staff_id', staffId);
    }
    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query.order('created_at');

    if (error) {
      console.log('[DEBUG] Direct table query failed, trying RPC');
      // Try RPC as fallback
      try {
        const { data: rpcData, error: rpcError } = await (supabase as any).rpc('get_waitlist_entries', {
          p_staff_id: staffId || null,
          p_date: date || null
        });
        
        if (rpcError) throw rpcError;
        return { data: rpcData || [], error: null };
      } catch (rpcError) {
        console.error('RPC also failed:', rpcError);
        throw new Error(`Database error: ${rpcError.message}`);
      }
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching waitlist entries:', error);
    let errorMessage = 'Failed to fetch waitlist entries';
    if (error.message.includes('relation "public.waitlists" does not exist')) {
      errorMessage = 'Database not set up. Please run the slot action schema migration.';
    }
    return { data: null, error: { message: errorMessage, originalError: error } };
  }
};

// Direct waitlist table queries
export const insertWaitlistEntry = async (
  entry: Omit<WaitlistEntry, 'id' | 'created_at'>
): Promise<{ data?: WaitlistEntry; error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('waitlists')
      .insert([entry])
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error inserting waitlist entry:', error);
    return { data: null, error };
  }
};

export const updateWaitlistEntry = async (
  id: string,
  updates: Partial<WaitlistEntry>
): Promise<{ data?: WaitlistEntry; error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('waitlists')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error updating waitlist entry:', error);
    return { data: null, error };
  }
};

export const deleteWaitlistEntry = async (
  id: string
): Promise<{ error?: any }> => {
  try {
    const { error } = await supabase
      .from('waitlists')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    console.error('Error deleting waitlist entry:', error);
    return { error };
  }
};

/**
 * PERSONAL TASK FUNCTIONS
 */

// Create personal task
export const createPersonalTask = async (
  staffId: string,
  appointmentDate: string,
  appointmentTime: string,
  description: string,
  durationMinutes: number = 60
): Promise<{ data?: string; error?: any }> => {
  try {
    // FIXED: Try RPC first, fallback to direct insertion
    try {
      console.log('[DEBUG] Calling create_personal_task RPC with:', { staffId, appointmentDate, appointmentTime, description, durationMinutes });
      const { data, error } = await (supabase as any).rpc('create_personal_task', {
        p_staff_id: staffId,
        p_appointment_date: appointmentDate,
        p_appointment_time: appointmentTime,
        p_description: description,
        p_duration_minutes: durationMinutes
      });
      console.log('[DEBUG] create_personal_task RPC result:', { data, error });

      if (error) throw error;
      return { data, error: null };
    } catch (rpcError) {
      console.log('[DEBUG] RPC function not found, trying direct insertion');
      
      // Direct insertion fallback
      const { data: directData, error: directError } = await supabase
        .from('appointments')
        .insert([{
          staff_id: staffId,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          total_amount: 0,
          type: 'INTERNAL',
          description: description,
          status: 'confirmed'
        }])
        .select('id')
        .single();

      if (directError) {
        throw new Error(`Database error: ${directError.message}`);
      }

      return { data: directData?.id, error: null };
    }
  } catch (error) {
    console.error('Error creating personal task:', error);
    let errorMessage = 'Failed to create personal task';
    if (error.message.includes('relation "public.appointments" does not exist')) {
      errorMessage = 'Database not set up. Please run the slot action schema migration.';
    }
    return { data: null, error: { message: errorMessage, originalError: error } };
  }
};

// Get personal tasks for staff
export const getPersonalTasks = async (
  staffId: string,
  date?: string
): Promise<{ data?: PersonalTask[]; error?: any }> => {
  try {
    let query = supabase
      .from('appointments')
      .select('*')
      .eq('staff_id', staffId)
      .eq('type', 'INTERNAL');

    if (date) {
      query = query.eq('appointment_date', date);
    }

    const { data, error } = await query.order('appointment_time', { ascending: true });

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching personal tasks:', error);
    return { data: null, error };
  }
};

// Direct appointments table queries for internal tasks
export const insertPersonalTask = async (
  task: Omit<PersonalTask, 'id'>
): Promise<{ data?: PersonalTask; error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .insert([{
        ...task,
        customer_id: null,
        service_id: null,
        total_amount: 0,
        status: 'confirmed'
      }])
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error inserting personal task:', error);
    return { data: null, error };
  }
};

export const updatePersonalTask = async (
  id: string,
  updates: Partial<PersonalTask>
): Promise<{ data?: PersonalTask; error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('type', 'INTERNAL')
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error updating personal task:', error);
    return { data: null, error };
  }
};

export const deletePersonalTask = async (
  id: string
): Promise<{ error?: any }> => {
  try {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id)
      .eq('type', 'INTERNAL');

    if (error) throw error;

    return { error: null };
  } catch (error) {
    console.error('Error deleting personal task:', error);
    return { error };
  }
};

/**
 * STAFF AVAILABILITY FUNCTIONS
 */

// Update staff working hours
export const updateStaffWorkingHours = async (
  staffId: string,
  date: string,
  startTime: string,
  endTime: string,
  isAvailable: boolean = true
): Promise<{ data?: string; error?: any }> => {
  try {
    // FIXED: Try RPC first, fallback to direct insertion
    try {
      console.log('[DEBUG] Calling update_staff_working_hours RPC with:', { staffId, date, startTime, endTime, isAvailable });
      const { data, error } = await (supabase as any).rpc('update_staff_working_hours', {
        p_staff_id: staffId,
        p_date: date,
        p_start_time: startTime,
        p_end_time: endTime,
        p_is_available: isAvailable
      });
      console.log('[DEBUG] update_staff_working_hours RPC result:', { data, error });

      if (error) throw error;
      return { data, error: null };
    } catch (rpcError) {
      console.log('[DEBUG] RPC function not found, trying direct insertion');
      
      // Direct insertion with UPSERT
      const { data: directData, error: directError } = await supabase
        .from('staff_availability')
        .upsert([{
          staff_id: staffId,
          date: date,
          start_time: startTime,
          end_time: endTime,
          is_available: isAvailable
        }])
        .select('id')
        .single();

      if (directError) {
        throw new Error(`Database error: ${directError.message}`);
      }

      return { data: directData?.id, error: null };
    }
  } catch (error) {
    console.error('Error updating staff working hours:', error);
    let errorMessage = 'Failed to update working hours';
    if (error.message.includes('relation "public.staff_availability" does not exist')) {
      errorMessage = 'Database not set up. Please run the slot action schema migration.';
    }
    return { data: null, error: { message: errorMessage, originalError: error } };
  }
};

// Get staff working hours
export const getStaffWorkingHours = async (
  staffId: string,
  date: string
): Promise<{ data?: StaffAvailability; error?: any }> => {
  try {
    // FIXED: Try RPC first, fallback to direct query
    try {
      const { data, error } = await (supabase as any).rpc('get_staff_working_hours', {
        p_staff_id: staffId,
        p_date: date
      });

      if (error) throw error;
      return { data: data?.[0] || null, error: null };
    } catch (rpcError) {
      console.log('[DEBUG] RPC function not found, trying direct query');
      
      // Direct table query fallback
      const { data: directData, error: directError } = await supabase
        .from('staff_availability')
        .select('*')
        .eq('staff_id', staffId)
        .eq('date', date)
        .single();

      if (directError) {
        // If no record found, return null instead of error
        if (directError.code === 'PGRST116') {
          return { data: null, error: null };
        }
        throw new Error(`Database error: ${directError.message}`);
      }

      return { data: directData, error: null };
    }
  } catch (error) {
    console.error('Error fetching staff working hours:', error);
    return { data: null, error };
  }
};

// Direct staff_availability table queries
export const insertStaffAvailability = async (
  availability: Omit<StaffAvailability, 'id'>
): Promise<{ data?: StaffAvailability; error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('staff_availability')
      .insert([availability])
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error inserting staff availability:', error);
    return { data: null, error };
  }
};

export const updateStaffAvailability = async (
  id: string,
  updates: Partial<StaffAvailability>
): Promise<{ data?: StaffAvailability; error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('staff_availability')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error updating staff availability:', error);
    return { data: null, error };
  }
};

export const getStaffAvailabilityForDate = async (
  staffId: string,
  date: string
): Promise<{ data?: StaffAvailability; error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('staff_availability')
      .select('*')
      .eq('staff_id', staffId)
      .eq('date', date)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching staff availability for date:', error);
    return { data: null, error };
  }
};

/**
 * BULK BOOKING FUNCTIONS
 */

// Check availability for multiple time slots
export const checkMultipleAvailability = async (
  staffId: string,
  appointmentDate: string,
  timeSlots: string[]
): Promise<{ data?: { timeSlot: string; available: boolean }[]; error?: any }> => {
  try {
    const results = await Promise.all(
      timeSlots.map(async (timeSlot) => {
        // FIXED: Try RPC first, fallback to direct query
        let conflict = false;
        try {
          const { data, error } = await (supabase as any).rpc('check_appointment_conflict_with_internal', {
            p_staff_id: staffId,
            p_appointment_date: appointmentDate,
            p_appointment_time: timeSlot
          });

          if (error) throw error;
          conflict = !!data;
        } catch (rpcError) {
          console.log('[DEBUG] RPC not found, using direct query');
          // Fallback to direct appointment query
          const { data: appointmentData, error: queryError } = await supabase
            .from('appointments')
            .select('id')
            .eq('staff_id', staffId)
            .eq('appointment_date', appointmentDate)
            .eq('appointment_time', timeSlot)
            .neq('status', 'cancelled');

          if (!queryError && appointmentData && appointmentData.length > 0) {
            conflict = true;
          }
        }

        return {
          timeSlot,
          available: !conflict
        };
      })
    );

    return { data: results, error: null };
  } catch (error) {
    console.error('Error checking multiple availability:', error);
    return { data: null, error };
  }
};

// Create multiple appointments (for recurring bookings)
export const createMultipleAppointments = async (
  appointments: Array<{
    staffId: string;
    customerId: string;
    serviceId: string;
    date: string;
    time: string;
    amount: number;
    notes?: string;
  }>
): Promise<{ data?: string[]; error?: any }> => {
  try {
    const appointmentIds: string[] = [];

    for (const appointment of appointments) {
      // Check availability first
      let conflict = false;
      try {
        console.log('[DEBUG] Checking conflict for multiple appointments with RPC:', { staffId: appointment.staffId, date: appointment.date, time: appointment.time });
        const { data: conflictData, error: conflictError } = await (supabase as any).rpc('check_appointment_conflict_with_internal', {
          p_staff_id: appointment.staffId,
          p_appointment_date: appointment.date,
          p_appointment_time: appointment.time
        });
        console.log('[DEBUG] Conflict check RPC result:', { conflictData, conflictError });

        if (conflictError) throw conflictError;
        conflict = !!conflictData;
      } catch (rpcError) {
        console.log('[DEBUG] RPC not found, using direct query');
        // Fallback to direct query
        const { data: appointmentData, error: queryError } = await supabase
          .from('appointments')
          .select('id')
          .eq('staff_id', appointment.staffId)
          .eq('appointment_date', appointment.date)
          .eq('appointment_time', appointment.time)
          .neq('status', 'cancelled');

        if (!queryError && appointmentData && appointmentData.length > 0) {
          conflict = true;
        }
      }

      if (conflict) {
        throw new Error(`Time slot conflict for ${appointment.time} on ${appointment.date}`);
      }

      // Create appointment
      console.log('[DEBUG] Inserting multiple appointments directly with:', appointment);
      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          customer_id: appointment.customerId,
          staff_id: appointment.staffId,
          service_id: appointment.serviceId,
          appointment_date: appointment.date,
          appointment_time: appointment.time,
          total_amount: appointment.amount,
          notes: appointment.notes,
          type: 'CLIENT',
          status: 'confirmed'
        }])
        .select('id')
        .single();
      console.log('[DEBUG] Direct insertion result for multiple appointments:', { data, error });

      if (error) throw error;
      if (data) appointmentIds.push(data.id);
    }

    return { data: appointmentIds, error: null };
  } catch (error) {
    console.error('Error creating multiple appointments:', error);
    return { data: null, error };
  }
};

/**
 * UTILITY FUNCTIONS
 */

// Check if time slot is available
export const isTimeSlotAvailable = async (
  staffId: string,
  date: string,
  time: string
): Promise<{ data?: boolean; error?: any }> => {
  try {
    // FIXED: Try RPC first, fallback to direct query
    try {
      const { data, error } = await (supabase as any).rpc('check_appointment_conflict_with_internal', {
        p_staff_id: staffId,
        p_appointment_date: date,
        p_appointment_time: time
      });

      if (error) throw error;
      return { data: !data, error: null };
    } catch (rpcError) {
      console.log('[DEBUG] RPC not found, using direct query');
      
      // Fallback to direct query
      const { data: appointmentData, error: queryError } = await supabase
        .from('appointments')
        .select('id')
        .eq('staff_id', staffId)
        .eq('appointment_date', date)
        .eq('appointment_time', time)
        .neq('status', 'cancelled');

      if (queryError) {
        throw new Error(`Database error: ${queryError.message}`);
      }

      return { data: !appointmentData || appointmentData.length === 0, error: null };
    }
  } catch (error) {
    console.error('Error checking time slot availability:', error);
    return { data: null, error };
  }
};

// Get all waitlist and task indicators for a specific date
export const getSlotIndicators = async (
  staffId: string,
  date: string,
  timeSlots: string[]
): Promise<{ 
  data?: {
    timeSlot: string;
    hasWaitlist: boolean;
    hasPersonalTask: boolean;
    waitlistCount: number;
  }[];
  error?: any 
}> => {
  try {
    const results = await Promise.all(
      timeSlots.map(async (timeSlot) => {
        // Check waitlist entries
        const { data: waitlistData } = await supabase
          .from('waitlists')
          .select('id')
          .eq('staff_id', staffId)
          .eq('date', date)
          .eq('start_time', timeSlot);

        // Check personal tasks
        const { data: personalTaskData } = await supabase
          .from('appointments')
          .select('id')
          .eq('staff_id', staffId)
          .eq('appointment_date', date)
          .eq('appointment_time', timeSlot)
          .eq('type', 'INTERNAL');

        return {
          timeSlot,
          hasWaitlist: waitlistData && waitlistData.length > 0,
          hasPersonalTask: personalTaskData && personalTaskData.length > 0,
          waitlistCount: waitlistData?.length || 0
        };
      })
    );

    return { data: results, error: null };
  } catch (error) {
    console.error('Error getting slot indicators:', error);
    return { data: null, error };
  }
};