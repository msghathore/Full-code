// Drag and Drop Types for the Calendar System
export const DRAG_TYPES = {
  APPOINTMENT: 'appointment'
} as const;

export interface DragAppointmentData {
  id: string;
  appointment: {
    id: string;
    service_name: string;
    appointment_date: string;
    appointment_time: string;
    staff_id: string;
    status: string;
    full_name: string;
    phone?: string;
    email?: string;
    total_amount?: number;
    notes?: string;
  };
}

export interface DropAppointmentData {
  appointmentId: string;
  newTime: string;
  newStaffId: string;
  newDate: string;
}