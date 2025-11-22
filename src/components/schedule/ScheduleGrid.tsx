import React, { useState, useMemo, useCallback } from 'react';
import { format, addMinutes, setHours, setMinutes, isSameDay, parseISO, differenceInMinutes } from 'date-fns';
import { 
  DndContext, 
  DragEndEvent, 
  DragStartEvent, 
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCenter
} from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  MoreHorizontal,
  Grid3X3,
  List,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import AppointmentCard, { Appointment } from './AppointmentCard';

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

const TIME_SLOTS = Array.from({ length: 96 }, (_, i) => {
  const hours = Math.floor(i / 4);
  const minutes = (i % 4) * 15;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
});

const HOUR_LABELS = Array.from({ length: 24 }, (_, i) => {
  return `${i.toString().padStart(2, '0')}:00`;
});

// Sortable appointment wrapper
const SortableAppointment: React.FC<{
  appointment: Appointment;
  staffColor: string;
  onEdit?: (appointment: Appointment) => void;
  onView?: (appointment: Appointment) => void;
  onCheckIn?: (appointment: Appointment) => void;
  style?: React.CSSProperties;
}> = ({ appointment, staffColor, onEdit, onView, onCheckIn, style }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: appointment.id,
    data: { appointment }
  });

  const style_transform = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        ...style_transform,
        opacity: isDragging ? 0.8 : 1,
      }}
      {...attributes}
      {...listeners}
    >
      <AppointmentCard
        appointment={appointment}
        staffColor={staffColor}
        onEdit={onEdit}
        onView={onView}
        onCheckIn={onCheckIn}
        className="cursor-move"
      />
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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragOverStaff, setDragOverStaff] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Filter appointments for selected date and staff
  const dayAppointments = useMemo(() => {
    return appointments.filter(apt => 
      isSameDay(parseISO(apt.start_time), selectedDate) &&
      selectedStaff.includes(apt.staff_id)
    );
  }, [appointments, selectedDate, selectedStaff]);

  // Group appointments by staff
  const appointmentsByStaff = useMemo(() => {
    const grouped: { [staffId: string]: Appointment[] } = {};
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

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setDragOverStaff(null);

    if (!over) return;

    const activeAppointment = dayAppointments.find(apt => apt.id === active.id);
    if (!activeAppointment) return;

    // Handle dropping on staff column
    if (over.id && typeof over.id === 'string' && selectedStaff.includes(over.id)) {
      const newStaffId = over.id;
      // Update appointment staff (this would need backend integration)
      console.log('Moving appointment to staff:', newStaffId);
      return;
    }

    // Handle dropping on time slot
    if (over.data?.current?.type === 'time-slot') {
      const newTime = over.data.current.time;
      const newStaffId = over.data.current.staffId;
      
      // Calculate new duration if needed
      const oldStart = parseISO(activeAppointment.start_time);
      const oldEnd = parseISO(activeAppointment.end_time);
      const duration = differenceInMinutes(oldEnd, oldStart);
      
      const newStart = setMinutes(setHours(selectedDate, parseInt(newTime.split(':')[0])), parseInt(newTime.split(':')[1]));
      const newEnd = addMinutes(newStart, duration);
      
      console.log('Moving appointment to time:', {
        newTime,
        newStaffId,
        newStart,
        newEnd
      });
      
      // Update appointment time and staff (this would need backend integration)
    }
  }, [dayAppointments, selectedDate, selectedStaff]);

  const handleDragOver = useCallback((event: any) => {
    const { over } = event;
    if (over && typeof over.id === 'string' && selectedStaff.includes(over.id)) {
      setDragOverStaff(over.id);
    } else {
      setDragOverStaff(null);
    }
  }, [selectedStaff]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    onDateChange(newDate);
  };

  const activeAppointment = activeId ? dayAppointments.find(apt => apt.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className={`flex-1 flex flex-col bg-white ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Badge variant="outline" className="text-xs">
              {dayAppointments.length} appointments
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDateChange(new Date())}
            >
              Today
            </Button>
            <Button variant="outline" size="sm">
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                if (selectedStaff.length > 0) {
                  onCreateAppointment(selectedStaff[0], '09:00');
                }
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex">
            {/* Time Column */}
            <div className="w-16 bg-gray-50 border-r flex-shrink-0">
              <div className="h-12 border-b bg-gray-100"></div>
              {HOUR_LABELS.map((hour, index) => (
                <div
                  key={index}
                  className="h-16 border-b border-gray-200 flex items-start justify-center pt-2 text-xs font-medium text-gray-500"
                >
                  {hour}
                </div>
              ))}
            </div>

            {/* Staff Columns */}
            <div className="flex-1 flex">
              {selectedStaff.map((staffId) => {
                const staffMember = staff.find(s => s.id === staffId);
                if (!staffMember) return null;

                return (
                  <div
                    key={staffId}
                    className={`flex-1 border-r last:border-r-0 ${
                      dragOverStaff === staffId ? 'bg-blue-50' : ''
                    }`}
                  >
                    {/* Staff Header */}
                    <div className="h-12 border-b bg-white flex items-center px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                          style={{ backgroundColor: staffMember.color }}
                        >
                          {staffMember.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">{staffMember.name}</h3>
                          <p className="text-xs text-gray-500">{staffMember.role}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto h-6 w-6 p-0"
                        onClick={() => onCreateAppointment(staffId, '09:00')}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Time Slots */}
                    <div className="relative">
                      {TIME_SLOTS.map((time, index) => (
                        <div
                          key={index}
                          className="h-16 border-b border-gray-100 hover:bg-gray-50 cursor-pointer relative group"
                          onClick={() => onCreateAppointment(staffId, time)}
                        >
                          {/* 15-minute intervals */}
                          {index % 4 !== 0 && (
                            <div className="absolute top-0 left-0 right-0 border-t border-gray-100" />
                          )}
                          
                          {/* Drop zone for time slots */}
                          <div
                            className="absolute inset-0"
                            data-type="time-slot"
                            data-staff-id={staffId}
                            data-time={time}
                          />
                        </div>
                      ))}

                      {/* Appointments */}
                      <SortableContext items={appointmentsByStaff[staffId]?.map(apt => apt.id) || []}>
                        {appointmentsByStaff[staffId]?.map((appointment) => (
                          <SortableAppointment
                            key={appointment.id}
                            appointment={appointment}
                            staffColor={staffMember.color}
                            onEdit={onAppointmentEdit}
                            onView={onAppointmentView}
                            onCheckIn={onAppointmentCheckIn}
                            style={{
                              position: 'absolute',
                              left: '8px',
                              right: '8px',
                              top: `${(parseInt(appointment.start_time.split(':')[0]) * 4 + parseInt(appointment.start_time.split(':')[1]) / 15) * 64}px`,
                              height: `${(appointment.duration_minutes / 15) * 64}px`,
                              zIndex: 2,
                            }}
                          />
                        ))}
                      </SortableContext>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="border-t bg-gray-50 p-4">
          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
              <span>Confirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
              <span>Cancelled</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3" />
              <span>{selectedStaff.length} staff selected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeAppointment ? (
          <AppointmentCard
            appointment={activeAppointment}
            staffColor={getStaffColor(activeAppointment.staff_id)}
            className="rotate-2 shadow-lg"
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default ScheduleGrid;