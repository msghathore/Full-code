import React from 'react';
import { useDrop } from 'react-dnd';
import { DRAG_TYPES } from '@/lib/dragTypes';
import DynamicAppointmentPill from './DynamicAppointmentPill';
import { format } from 'date-fns';

interface StaffMember {
  id: string;
  name: string;
  specialty: string | null;
  color: string;
}

interface Appointment {
  id: string;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  staff_id: string;
  status: 'requested' | 'accepted' | 'confirmed' | 'no_show' | 'ready_to_start' | 'in_progress' | 'completed' | 'cancelled' | 'personal_task';
  full_name: string;
  phone?: string;
  email?: string;
  total_amount?: number;
  notes?: string;
  is_recurring?: boolean;
  has_note?: boolean;
  form_required?: boolean;
  deposit_paid?: boolean;
  duration_minutes?: number;
}

interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
  display: string;
}

interface DroppableTimeSlotProps {
  staffMember: StaffMember;
  timeSlot: TimeSlot;
  timeIndex: number;
  selectedDate: Date;
  selectedSlot: { staffId: string; time: string } | null;
  hoveredSlot: { staffId: string; time: string } | null;
  slotAppointments: Appointment[];
  filteredStaff: StaffMember[];
  handleAppointmentDrop: (appointmentId: string, newTime: string, newStaffId: string, newDate: string) => void;
  handleSlotHover: (staffId: string, time: string) => void;
  handleSlotLeave: () => void;
  handleEmptySlotClick: (staffId: string, time: string, staffMember: StaffMember, event: React.MouseEvent) => void;
  setSelectedSlot: (slot: { staffId: string; time: string } | null) => void;
  setContextMenu: React.Dispatch<React.SetStateAction<{ x: number; y: number; appointment: Appointment } | null>>;
}

const DroppableTimeSlot: React.FC<DroppableTimeSlotProps> = ({
  staffMember,
  timeSlot,
  timeIndex,
  selectedDate,
  selectedSlot,
  hoveredSlot,
  slotAppointments,
  filteredStaff,
  handleAppointmentDrop,
  handleSlotHover,
  handleSlotLeave,
  handleEmptySlotClick,
  setSelectedSlot,
  setContextMenu
}) => {
  // Create react-dnd drop zone for this staff/time slot
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: DRAG_TYPES.APPOINTMENT,
    drop: (item: { appointmentId: string; originalAppointment: any }) => {
      handleAppointmentDrop(item.appointmentId, timeSlot.time, staffMember.id, format(selectedDate, 'yyyy-MM-dd'));
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [staffMember.id, timeSlot.time, selectedDate, handleAppointmentDrop]);

  return (
    <div
      key={`${staffMember.id}-${timeIndex}`}
      ref={drop}
      className={`
        flex-1 min-w-[140px] border-l-2 border-gray-200 p-1 relative bg-white transition-colors duration-200
        ${isOver && canDrop ? 'bg-blue-50 border-blue-300' : ''}
      `}
      onMouseEnter={() => handleSlotHover(staffMember.id, timeSlot.time)}
      onMouseLeave={handleSlotLeave}
    >
      {/* Persistent Selection Style */}
      {selectedSlot?.staffId === staffMember.id && selectedSlot?.time === timeSlot.time && (
        <div className="absolute inset-0 bg-gray-200 opacity-50 rounded pointer-events-none z-0"></div>
      )}
      
      {/* Show existing appointments with new DynamicAppointmentPill component */}
      {slotAppointments.map(appointment => {
        // Transform appointment for DynamicAppointmentPill compatibility
        const transformedAppointment = {
          id: appointment.id,
          service_name: appointment.service_name,
          start_time: appointment.appointment_time,
          end_time: appointment.appointment_time, // Will be calculated by DynamicAppointmentPill
          duration_minutes: appointment.duration_minutes || 60, // Use actual duration from appointment
          staff_id: appointment.staff_id,
          status: appointment.status,
          client_name: appointment.full_name,
          price: appointment.total_amount || 0,
          notes: appointment.notes,
          is_recurring: appointment.is_recurring || false,
          payment_status: 'paid' as const,
          staff_name: filteredStaff.find(s => s.id === appointment.staff_id)?.name || 'Unknown Staff'
        };
        
        return (
          <DynamicAppointmentPill
            key={appointment.id}
            appointment={transformedAppointment}
            staffMember={filteredStaff.find(s => s.id === appointment.staff_id)}
            originalAppointment={appointment}
            onClick={(event) => {
              setSelectedSlot({ staffId: appointment.staff_id, time: appointment.appointment_time });
              
              // Calculate proper position for context menu
              const rect = event.currentTarget.getBoundingClientRect();
              const viewportWidth = window.innerWidth;
              const viewportHeight = window.innerHeight;
              
              // Context menu dimensions (approximate)
              const MENU_WIDTH = 280;
              const MENU_HEIGHT = 400; // Approximate height with all items
              const GAP = 8;
              const ARROW_SIZE = 12; // w-3 h-3 = 12px
              const ARROW_HALF_SIZE = ARROW_SIZE / 2; // 6px
              
              // Calculate appointment center for perfect arrow alignment
              const appointmentCenterY = rect.top + (rect.height / 2);
              
              // Calculate position to the right of the appointment
              let x = rect.right + GAP;
              let y = appointmentCenterY - ARROW_HALF_SIZE;
              
              // If not enough space on the right, flip to the left
              if (x + MENU_WIDTH > viewportWidth) {
                x = rect.left - MENU_WIDTH - GAP;
              }
              
              // Ensure menu stays within viewport bounds
              if (y + MENU_HEIGHT > viewportHeight - 10) {
                y = viewportHeight - MENU_HEIGHT - 10;
              }
              
              if (y < 10) {
                y = 10;
              }
              
              setContextMenu({ x, y, appointment });
            }}
          />
        );
      })}
      
      {/* Show clickable booking area for empty slots */}
      {slotAppointments.length === 0 && (
        <div
          className={`
            slot-clickable min-h-[32px] rounded border border-dashed border-gray-200
            flex items-center justify-center cursor-pointer transition-all duration-200
            hover:border-gray-400 hover:bg-gray-100
            ${hoveredSlot?.staffId === staffMember.id && hoveredSlot?.time === timeSlot.time
              ? 'border-gray-400 bg-gray-100'
              : ''
            }
            ${selectedSlot?.staffId === staffMember.id && selectedSlot?.time === timeSlot.time
              ? 'border-blue-400 bg-blue-50'
              : ''
            }
          `}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('[DEBUG] Empty slot clicked:', { staffId: staffMember.id, time: timeSlot.time });
            handleEmptySlotClick(staffMember.id, timeSlot.time, staffMember, e);
            setSelectedSlot({ staffId: staffMember.id, time: timeSlot.time });
          }}
        >
          <div className="text-center">
            <div className="text-gray-400 text-xs transition-colors">
              {hoveredSlot?.staffId === staffMember.id && hoveredSlot?.time === timeSlot.time
                ? 'Click for actions'
                : selectedSlot?.staffId === staffMember.id && selectedSlot?.time === timeSlot.time
                ? 'Selected'
                : timeSlot.display
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DroppableTimeSlot;