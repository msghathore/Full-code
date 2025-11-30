import React, { useState, useMemo, useCallback } from 'react';
import { format, addMinutes, setHours, setMinutes, isSameDay, parseISO, differenceInMinutes } from 'date-fns';
import { useDrag, useDrop } from 'react-dnd';
import { supabase } from '@/integrations/supabase/client';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  MoreHorizontal,
  Grid3X3,
  List,
  Users,
  Settings,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AppointmentCard, { Appointment } from './AppointmentCard';
import AppointmentPill from '@/components/AppointmentPill';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  color: string;
  avatar?: string;
}

interface ScheduleGridProps {
  selectedDate: Date;
  staff: StaffMember[];
  selectedStaff: string[];
  appointments: Appointment[];
  onDateChange: (date: Date) => void;
  onAppointmentEdit: (appointment: Appointment) => void;
  onAppointmentView: (appointment: Appointment) => void;
  onAppointmentCheckIn: (appointment: Appointment) => void;
  onCreateAppointment: (staffId: string, time: string) => void;
  className?: string;
}

const TIME_SLOTS = Array.from({ length: 64 }, (_, i) => {
  const hours = Math.floor(i / 4) + 8; // Start from 8 AM
  const minutes = (i % 4) * 15;
  return `${(hours % 24).toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
});

const HOUR_LABELS = Array.from({ length: 16 }, (_, i) => {
  const hour = (i + 8) % 24; // Start from 8 AM
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${hour12}:${'00'} ${ampm}`;
});

// React DnD Appointment Component
const DraggableAppointment: React.FC<{
  appointment: Appointment;
  staffMember: StaffMember;
  onEdit?: (appointment: Appointment) => void;
  onView?: (appointment: Appointment) => void;
  onCheckIn?: (appointment: Appointment) => void;
  style?: React.CSSProperties;
}> = ({ appointment, staffMember, onEdit, onView, onCheckIn, style }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'APPOINTMENT',
    item: {
      id: appointment.id,
      appointment,
      staffMember
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      style={{
        ...style,
        opacity: isDragging ? 0.6 : 1,
        cursor: 'grab',
        zIndex: isDragging ? 1000 : 2,
      }}
      className="touch-none"
    >
      <AppointmentPill
        appointment={appointment}
        staffMember={staffMember}
        onEdit={onEdit}
        onView={onView}
        onCheckIn={onCheckIn}
      />
    </div>
  );
};

// Drop zone component for time slots
const TimeSlotDropZone: React.FC<{
  time: string;
  staffId: string;
  onDrop: (appointmentId: string, staffId: string, time: string) => void;
  children: React.ReactNode;
}> = ({ time, staffId, onDrop, children }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'APPOINTMENT',
    drop: (item: any) => {
      onDrop(item.id, staffId, time);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`relative ${isOver && canDrop ? 'bg-blue-100 bg-opacity-50' : ''}`}
    >
      {children}
    </div>
  );
};

// Staff column drop zone
const StaffColumnDropZone: React.FC<{
  staffId: string;
  staffMember: StaffMember;
  appointments: Appointment[];
  onDrop: (appointmentId: string, targetStaffId: string) => void;
  onCreateAppointment: (staffId: string, time: string) => void;
  children: React.ReactNode;
}> = ({ staffId, staffMember, appointments, onDrop, onCreateAppointment, children }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'APPOINTMENT',
    drop: (item: any) => {
      onDrop(item.id, staffId);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`flex-1 border-r last:border-r-0 ${isOver && canDrop ? 'bg-blue-50 bg-opacity-30' : ''
        }`}
    >
      {children}
    </div>
  );
};

const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  selectedDate,
  staff,
  selectedStaff,
  appointments,
  onDateChange,
  onAppointmentEdit,
  onAppointmentView,
  onAppointmentCheckIn,
  onCreateAppointment,
  className = '',
}) => {
  // Debug logs removed

  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);
  const [dragOverStaff, setDragOverStaff] = useState<string | null>(null);

  // Filter appointments for selected date and staff
  const dayAppointments = useMemo(() => {
    return appointments.filter(apt =>
      isSameDay(parseISO(apt.appointment_date || apt.start_time), selectedDate) &&
      (apt.staff_id === null || selectedStaff.includes(apt.staff_id))
    );
  }, [appointments, selectedDate, selectedStaff]);

  // Group appointments by staff
  const appointmentsByStaff = useMemo(() => {
    const grouped: { [staffId: string]: Appointment[] } = {};
    // Include unassigned appointments (staff_id: null)
    grouped['unassigned'] = dayAppointments.filter(apt => apt.staff_id === null);
    // Include assigned appointments
    selectedStaff.forEach(staffId => {
      grouped[staffId] = dayAppointments.filter(apt => apt.staff_id === staffId);
    });
    return grouped;
  }, [dayAppointments, selectedStaff]);

  const getStaffColor = (staffId: string) => {
    const staffMember = staff.find(s => s.id === staffId);
    return staffMember?.color || '#6b7280';
  };

  const getStaffName = (staffId: string) => {
    const staffMember = staff.find(s => s.id === staffId);
    return staffMember?.name || 'Unknown';
  };

  // Handle dropping appointment on time slot
  const handleTimeSlotDrop = useCallback(async (appointmentId: string, staffId: string, time: string) => {
    console.log('🔄 DRAG EVENT: handleTimeSlotDrop called', { appointmentId, staffId, time });

    const appointment = dayAppointments.find(apt => apt.id === appointmentId);
    if (!appointment) {
      console.log('❌ DRAG EVENT: Appointment not found', appointmentId);
      return;
    }

    console.log('📅 DRAG EVENT: Found appointment', appointment);

    // Calculate new duration if needed
    const oldStart = parseISO(appointment.start_time);
    const oldEnd = parseISO(appointment.end_time);
    const duration = differenceInMinutes(oldEnd, oldStart);

    const newStart = setMinutes(setHours(selectedDate, parseInt(time.split(':')[0])), parseInt(time.split(':')[1]));
    const newEnd = addMinutes(newStart, duration);

    console.log('⏰ DRAG EVENT: Calculated new times', {
      appointmentId,
      time,
      staffId,
      oldStart: oldStart.toISOString(),
      oldEnd: oldEnd.toISOString(),
      newStart: newStart.toISOString(),
      newEnd: newEnd.toISOString()
    });

    try {
      // Update appointment in Supabase
      const { data, error } = await supabase
        .from('appointments')
        .update({
          staff_id: staffId,
          appointment_time: time,
          appointment_date: format(selectedDate, 'yyyy-MM-dd')
        })
        .eq('id', appointmentId)
        .select();

      if (error) {
        console.error('❌ DRAG EVENT: Failed to update appointment', error);
        throw error;
      }

      console.log('✅ DRAG EVENT: Successfully updated appointment', data);

      // The real-time subscription will trigger a re-fetch automatically
    } catch (error) {
      console.error('❌ DRAG EVENT: Error updating appointment', error);
    }
  }, [dayAppointments, selectedDate]);

  // Handle dropping appointment on staff column
  const handleStaffDrop = useCallback(async (appointmentId: string, targetStaffId: string) => {
    console.log('🔄 DRAG EVENT: handleStaffDrop called', { appointmentId, targetStaffId });

    const appointment = dayAppointments.find(apt => apt.id === appointmentId);
    if (!appointment) {
      console.log('❌ DRAG EVENT: Appointment not found', appointmentId);
      return;
    }

    if (appointment.staff_id === targetStaffId) {
      console.log('⚠️ DRAG EVENT: Appointment already assigned to this staff', appointmentId);
      return;
    }

    console.log('👤 DRAG EVENT: Moving appointment to staff', {
      appointmentId,
      fromStaff: appointment.staff_id,
      toStaff: targetStaffId
    });

    try {
      // Update appointment staff in Supabase
      const { data, error } = await supabase
        .from('appointments')
        .update({
          staff_id: targetStaffId
        })
        .eq('id', appointmentId)
        .select();

      if (error) {
        console.error('❌ DRAG EVENT: Failed to update appointment staff', error);
        throw error;
      }

      console.log('✅ DRAG EVENT: Successfully updated appointment staff', data);

      // The real-time subscription will trigger a re-fetch automatically
    } catch (error) {
      console.error('❌ DRAG EVENT: Error updating appointment staff', error);
    }
  }, [dayAppointments]);

  // Handle appointment resize
  const handleAppointmentResize = useCallback((appointmentId: string, newDuration: number) => {
    const appointment = dayAppointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;

    console.log('Resizing appointment:', {
      appointmentId,
      oldDuration: appointment.duration_minutes,
      newDuration,
      serviceName: appointment.service_name
    });

    // Update appointment duration (this would need backend integration)
    // Example: updateAppointment(appointmentId, {
    //   duration_minutes: newDuration,
    //   end_time: new Date(new Date(appointment.start_time).getTime() + newDuration * 60000).toISOString()
    // });
  }, [dayAppointments]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    onDateChange(newDate);
  };

  return (
    <div className={`flex-1 flex flex-col bg-white ${className}`}>
      {/* Compact Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-white">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('prev')}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold text-gray-900">
              {format(selectedDate, 'EEEE, MMM d')}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('next')}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
            {dayAppointments.length} appointments
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDateChange(new Date())}
            className="h-8 text-xs"
          >
            Today
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              if (selectedStaff.length > 0) {
                onCreateAppointment(selectedStaff[0], '09:00');
              }
            }}
            className="h-8 text-xs bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-3 w-3 mr-1" />
            New
          </Button>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="flex-1 overflow-auto">
        <div className="h-full" style={{
          display: 'grid',
          gridTemplateColumns: `64px 1fr ${selectedStaff.map(() => '1fr').join(' ')}`,
          gridTemplateRows: '40px 1fr'
        }}>
          {/* Time Column Header */}
          <div className="bg-gray-100 border-b border-r" style={{ gridColumn: '1', gridRow: '1' }}></div>

          {/* Unassigned Appointments Column Header */}
          <div
            className="bg-orange-50 border-b border-r flex items-center px-3 shadow-sm"
            style={{
              gridColumn: '2',
              gridRow: '1'
            }}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm flex-shrink-0 bg-orange-100">
                <AvatarFallback className="text-orange-600 text-sm font-medium">
                  ?
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm text-gray-900 truncate">
                  Unassigned
                </h3>
                <p className="text-xs text-gray-500 truncate">
                  Needs Staff
                </p>
              </div>
            </div>
          </div>

          {/* Staff Column Headers */}
          {selectedStaff.map((staffId, index) => {
            const staffMember = staff.find(s => s.id === staffId);
            if (!staffMember) return null;

            return (
              <div
                key={staffId}
                className="bg-white border-b border-r flex items-center px-3 shadow-sm"
                style={{
                  gridColumn: `${index + 3}`,
                  gridRow: '1'
                }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm flex-shrink-0">
                    <AvatarImage
                      src={staffMember.avatar || '/images/client-1.jpg'}
                      alt={staffMember.name}
                    />
                    <AvatarFallback
                      className="text-white text-sm font-medium"
                      style={{ backgroundColor: staffMember.color }}
                    >
                      {staffMember.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-gray-900 truncate">
                      {staffMember.name}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      {staffMember.role}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-7 w-7 p-0 hover:bg-gray-100 flex-shrink-0"
                  onClick={() => onCreateAppointment(staffId, '09:00')}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            );
          })}

          {/* Time Column */}
          <div className="bg-gray-50 border-r" style={{ gridColumn: '1', gridRow: '2' }}>
            {HOUR_LABELS.map((hour, index) => (
              <div
                key={index}
                className="h-[30px] border-b border-gray-200 flex items-start justify-center pt-1 text-xs font-medium text-gray-500"
              >
                {hour}
              </div>
            ))}
          </div>

          {/* Unassigned Appointments Grid Cell */}
          <div
            className="relative border-r border-gray-200 overflow-hidden bg-orange-50/30"
            style={{
              gridColumn: '2',
              gridRow: '2'
            }}
          >
            {/* Time Slots for Unassigned */}
            {TIME_SLOTS.map((time, timeIndex) => (
              <div
                key={`unassigned-${timeIndex}`}
                className="h-[30px] border-b border-gray-100 hover:bg-orange-50/50 cursor-pointer relative group"
              >
                {/* 15-minute intervals */}
                {timeIndex % 4 !== 0 && (
                  <div className="absolute top-0 left-0 right-0 border-t border-gray-100" />
                )}
              </div>
            ))}

            {/* Unassigned Appointments */}
            {appointmentsByStaff['unassigned']?.map((appointment) => (
              <DraggableAppointment
                key={appointment.id}
                appointment={appointment}
                staffMember={{
                  id: 'unassigned',
                  name: 'Unassigned',
                  role: 'Needs Staff',
                  color: '#f97316',
                  avatar: undefined
                }}
                onEdit={onAppointmentEdit}
                onView={onAppointmentView}
                onCheckIn={onAppointmentCheckIn}
                style={{
                  position: 'absolute',
                  left: '4px',
                  right: '4px',
                  top: `${((parseInt(appointment.start_time.split(':')[0]) - 8) * 4 + parseInt(appointment.start_time.split(':')[1]) / 15) * 30}px`,
                  height: `${Math.max((appointment.duration_minutes / 15) * 30, 20)}px`,
                  maxWidth: 'calc(100% - 8px)',
                  overflow: 'hidden',
                }}
              />
            ))}
          </div>

          {/* Staff Grid Cells */}
          {selectedStaff.map((staffId, index) => {
            const staffMember = staff.find(s => s.id === staffId);
            if (!staffMember) return null;

            return (
              <StaffColumnDropZone
                key={staffId}
                staffId={staffId}
                staffMember={staffMember}
                appointments={appointmentsByStaff[staffId] || []}
                onDrop={handleStaffDrop}
                onCreateAppointment={onCreateAppointment}
              >
                <div
                  className="relative border-r border-gray-200 overflow-hidden"
                  style={{
                    gridColumn: `${index + 3}`,
                    gridRow: '2'
                  }}
                >
                  {/* Time Slots */}
                  {TIME_SLOTS.map((time, timeIndex) => (
                    <TimeSlotDropZone
                      key={timeIndex}
                      time={time}
                      staffId={staffId}
                      onDrop={handleTimeSlotDrop}
                    >
                      <div
                        className="h-[30px] border-b border-gray-100 hover:bg-gray-50 cursor-pointer relative group"
                        onClick={() => onCreateAppointment(staffId, time)}
                      >
                        {/* 15-minute intervals */}
                        {timeIndex % 4 !== 0 && (
                          <div className="absolute top-0 left-0 right-0 border-t border-gray-100" />
                        )}
                      </div>
                    </TimeSlotDropZone>
                  ))}

                  {/* Appointments with Fixed Grid Positioning */}
                  {appointmentsByStaff[staffId]?.map((appointment) => (
                    <DraggableAppointment
                      key={appointment.id}
                      appointment={appointment}
                      staffMember={staffMember}
                      onEdit={onAppointmentEdit}
                      onView={onAppointmentView}
                      onCheckIn={onAppointmentCheckIn}
                      style={{
                        position: 'absolute',
                        left: '4px',
                        right: '4px',
                        top: `${((parseInt(appointment.start_time.split(':')[0]) - 8) * 4 + parseInt(appointment.start_time.split(':')[1]) / 15) * 30}px`,
                        height: `${Math.max((appointment.duration_minutes / 15) * 30, 20)}px`,
                        maxWidth: 'calc(100% - 8px)',
                        overflow: 'hidden',
                      }}
                    />
                  ))}
                </div>
              </StaffColumnDropZone>
            );
          })}
        </div>
      </div>

      {/* Enhanced Legend with Larger Icons */}
      <div className="border-t bg-gray-50 p-3">
        <div className="flex items-center gap-8 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-300 rounded-lg shadow-sm"></div>
            <span className="font-medium text-gray-700">Confirmed</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-300 rounded-lg shadow-sm"></div>
            <span className="font-medium text-gray-700">Pending</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-300 rounded-lg shadow-sm"></div>
            <span className="font-medium text-gray-700">Completed</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-gradient-to-br from-red-100 to-red-200 border-2 border-red-300 rounded-lg shadow-sm"></div>
            <span className="font-medium text-gray-700">Cancelled</span>
          </div>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-gray-700">{selectedStaff.length} staff selected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleGrid;