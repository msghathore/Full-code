import { supabase } from '@/integrations/supabase/client';

export interface StaffAvailability {
  staff_id: string;
  staff_name: string;
  specialty?: string;
  available_slots: TimeSlot[];
  is_available: boolean;
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

export interface SchedulingRecommendation {
  recommended_type: 'parallel' | 'sequential' | 'staggered';
  reason: string;
  available_staff_count: number;
  total_duration_minutes: number;
  estimated_end_time: string;
  member_schedule: MemberScheduleSlot[];
  warnings: string[];
}

export interface MemberScheduleSlot {
  member_index: number;
  staff_id: string;
  staff_name: string;
  start_time: string;
  end_time: string;
  service_duration: number;
}

export interface GroupSchedulingInput {
  booking_date: string;
  start_time: string;
  total_members: number;
  service_duration_minutes?: number; // Average service duration
  preferred_scheduling_type?: 'parallel' | 'sequential' | 'staggered';
}

/**
 * Get available staff for a specific date and time
 */
export async function getAvailableStaff(
  date: string,
  startTime: string,
  durationMinutes: number = 60
): Promise<StaffAvailability[]> {
  try {
    // Get all active staff
    const { data: allStaff, error: staffError } = await supabase
      .from('staff')
      .select('id, first_name, last_name, specialty, is_active')
      .eq('is_active', true);

    if (staffError) throw staffError;

    // Get existing appointments for the date
    const { data: appointments, error: aptError } = await supabase
      .from('appointments')
      .select('staff_id, appointment_time, services(duration_minutes)')
      .eq('appointment_date', date)
      .neq('status', 'cancelled');

    if (aptError) throw aptError;

    // Parse start time to minutes
    const [startHour, startMin] = startTime.split(':').map(Number);
    const requestedStartMinutes = startHour * 60 + startMin;
    const requestedEndMinutes = requestedStartMinutes + durationMinutes;

    // Check each staff's availability
    const staffAvailability: StaffAvailability[] = (allStaff || []).map(staff => {
      const staffAppointments = (appointments || []).filter(apt => apt.staff_id === staff.id);

      // Check if any appointment overlaps with requested time
      const hasConflict = staffAppointments.some(apt => {
        const [aptHour, aptMin] = (apt.appointment_time || '09:00').split(':').map(Number);
        const aptStartMinutes = aptHour * 60 + aptMin;
        const aptDuration = apt.services?.duration_minutes || 60;
        const aptEndMinutes = aptStartMinutes + aptDuration;

        // Check for overlap
        return requestedStartMinutes < aptEndMinutes && requestedEndMinutes > aptStartMinutes;
      });

      return {
        staff_id: staff.id,
        staff_name: `${staff.first_name} ${staff.last_name}`,
        specialty: staff.specialty,
        available_slots: [], // Can be expanded for detailed slot info
        is_available: !hasConflict,
      };
    });

    return staffAvailability;
  } catch (error) {
    console.error('Error getting available staff:', error);
    return [];
  }
}

/**
 * Get smart scheduling recommendation based on group size and staff availability
 */
export async function getSchedulingRecommendation(
  input: GroupSchedulingInput
): Promise<SchedulingRecommendation> {
  const { booking_date, start_time, total_members, service_duration_minutes = 60 } = input;

  // Get available staff
  const staffAvailability = await getAvailableStaff(booking_date, start_time, service_duration_minutes);
  const availableStaff = staffAvailability.filter(s => s.is_available);
  const availableStaffCount = availableStaff.length;

  const warnings: string[] = [];
  let recommended_type: 'parallel' | 'sequential' | 'staggered' = 'parallel';
  let reason = '';
  let member_schedule: MemberScheduleSlot[] = [];

  // Parse start time
  const [startHour, startMin] = start_time.split(':').map(Number);
  const startMinutes = startHour * 60 + startMin;

  // Calculate scheduling based on staff availability
  if (availableStaffCount === 0) {
    warnings.push('⚠️ No staff available at this time. Please choose a different time slot.');
    recommended_type = 'sequential';
    reason = 'No staff available - consider rescheduling';
  } else if (availableStaffCount >= total_members) {
    // Enough staff for parallel scheduling
    recommended_type = 'parallel';
    reason = `${availableStaffCount} staff available - all members can be served simultaneously`;

    // Assign each member to a different staff
    for (let i = 0; i < total_members; i++) {
      const staff = availableStaff[i % availableStaffCount];
      const endMinutes = startMinutes + service_duration_minutes;
      member_schedule.push({
        member_index: i + 1,
        staff_id: staff.staff_id,
        staff_name: staff.staff_name,
        start_time: start_time,
        end_time: minutesToTime(endMinutes),
        service_duration: service_duration_minutes,
      });
    }
  } else if (availableStaffCount >= Math.ceil(total_members / 2)) {
    // Half or more staff available - use staggered
    recommended_type = 'staggered';
    reason = `Only ${availableStaffCount} staff available for ${total_members} members - staggered scheduling recommended`;
    warnings.push(`💡 With ${availableStaffCount} staff, members will be staggered 30 minutes apart.`);

    // Stagger appointments 30 minutes apart
    const staggerInterval = 30;
    for (let i = 0; i < total_members; i++) {
      const staff = availableStaff[i % availableStaffCount];
      const memberStartMinutes = startMinutes + (Math.floor(i / availableStaffCount) * staggerInterval);
      const memberEndMinutes = memberStartMinutes + service_duration_minutes;

      member_schedule.push({
        member_index: i + 1,
        staff_id: staff.staff_id,
        staff_name: staff.staff_name,
        start_time: minutesToTime(memberStartMinutes),
        end_time: minutesToTime(memberEndMinutes),
        service_duration: service_duration_minutes,
      });
    }
  } else {
    // Very limited staff - sequential
    recommended_type = 'sequential';
    reason = `Only ${availableStaffCount} staff available - sequential scheduling required`;
    warnings.push(`⏰ With limited staff, the group will take approximately ${Math.ceil(total_members / availableStaffCount) * service_duration_minutes} minutes total.`);

    // Sequential scheduling
    for (let i = 0; i < total_members; i++) {
      const staff = availableStaff[i % availableStaffCount];
      const memberStartMinutes = startMinutes + (Math.floor(i / availableStaffCount) * service_duration_minutes);
      const memberEndMinutes = memberStartMinutes + service_duration_minutes;

      member_schedule.push({
        member_index: i + 1,
        staff_id: staff.staff_id,
        staff_name: staff.staff_name,
        start_time: minutesToTime(memberStartMinutes),
        end_time: minutesToTime(memberEndMinutes),
        service_duration: service_duration_minutes,
      });
    }
  }

  // Calculate total duration and end time
  const lastSchedule = member_schedule[member_schedule.length - 1];
  const total_duration_minutes = lastSchedule
    ? timeToMinutes(lastSchedule.end_time) - startMinutes
    : service_duration_minutes;
  const estimated_end_time = lastSchedule?.end_time || minutesToTime(startMinutes + service_duration_minutes);

  return {
    recommended_type,
    reason,
    available_staff_count: availableStaffCount,
    total_duration_minutes,
    estimated_end_time,
    member_schedule,
    warnings,
  };
}

/**
 * Check if a specific date/time has capacity for a group
 */
export async function checkGroupCapacity(
  date: string,
  startTime: string,
  memberCount: number,
  serviceDuration: number = 60
): Promise<{
  hasCapacity: boolean;
  availableStaff: number;
  message: string;
  suggestedAlternatives?: { date: string; time: string; availableStaff: number }[];
}> {
  const staffAvailability = await getAvailableStaff(date, startTime, serviceDuration);
  const availableCount = staffAvailability.filter(s => s.is_available).length;

  if (availableCount >= memberCount) {
    return {
      hasCapacity: true,
      availableStaff: availableCount,
      message: `✅ Full capacity available! ${availableCount} staff members can serve your group of ${memberCount} simultaneously.`,
    };
  } else if (availableCount > 0) {
    return {
      hasCapacity: true,
      availableStaff: availableCount,
      message: `⚡ Partial capacity: ${availableCount} staff available. Your group of ${memberCount} can be served with staggered scheduling.`,
    };
  } else {
    // Try to find alternative times
    const alternatives = await findAlternativeSlots(date, memberCount, serviceDuration);
    return {
      hasCapacity: false,
      availableStaff: 0,
      message: `❌ No staff available at ${startTime}. Please choose a different time.`,
      suggestedAlternatives: alternatives,
    };
  }
}

/**
 * Find alternative time slots with availability
 */
async function findAlternativeSlots(
  date: string,
  memberCount: number,
  serviceDuration: number
): Promise<{ date: string; time: string; availableStaff: number }[]> {
  const alternatives: { date: string; time: string; availableStaff: number }[] = [];
  const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  for (const time of times) {
    const staff = await getAvailableStaff(date, time, serviceDuration);
    const available = staff.filter(s => s.is_available).length;
    if (available >= Math.ceil(memberCount / 2)) {
      alternatives.push({ date, time, availableStaff: available });
    }
    if (alternatives.length >= 3) break;
  }

  return alternatives;
}

/**
 * Auto-assign staff to group members based on availability and specialty
 */
export async function autoAssignStaff(
  bookingDate: string,
  startTime: string,
  members: { id: string; service_id?: string }[],
  schedulingType: 'parallel' | 'sequential' | 'staggered'
): Promise<Map<string, { staff_id: string; scheduled_time: string }>> {
  const assignments = new Map<string, { staff_id: string; scheduled_time: string }>();

  // Get available staff
  const staffAvailability = await getAvailableStaff(bookingDate, startTime);
  const availableStaff = staffAvailability.filter(s => s.is_available);

  if (availableStaff.length === 0) {
    return assignments; // No staff available
  }

  const [startHour, startMin] = startTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMin;
  const defaultDuration = 60;

  members.forEach((member, index) => {
    const staffIndex = index % availableStaff.length;
    const staff = availableStaff[staffIndex];

    let memberStartMinutes = startMinutes;

    if (schedulingType === 'sequential') {
      memberStartMinutes = startMinutes + (Math.floor(index / availableStaff.length) * defaultDuration);
    } else if (schedulingType === 'staggered') {
      memberStartMinutes = startMinutes + (Math.floor(index / availableStaff.length) * 30);
    }

    assignments.set(member.id, {
      staff_id: staff.staff_id,
      scheduled_time: minutesToTime(memberStartMinutes),
    });
  });

  return assignments;
}

// Helper functions
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function timeToMinutes(time: string): number {
  const [hours, mins] = time.split(':').map(Number);
  return hours * 60 + mins;
}

/**
 * Format schedule for display
 */
export function formatScheduleTimeline(schedule: MemberScheduleSlot[]): string[] {
  return schedule.map(slot =>
    `Member ${slot.member_index}: ${slot.start_time} - ${slot.end_time} with ${slot.staff_name}`
  );
}
