import React, { useState, useEffect, useMemo } from 'react';
import { format, addDays, parseISO } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  specialty?: string;
  role: 'admin' | 'senior' | 'junior';
}

interface Appointment {
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
}

interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
  display: string;
}

// Generate time slots from 8 AM to 12 AM (16 hours) in 15-minute intervals
const generateTimeSlots = (): TimeSlot[] => {
  const slots = [];
  for (let hour = 8; hour <= 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const displayHour = hour === 24 ? 0 : hour;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour12 = displayHour === 0 ? 12 : displayHour;
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        hour,
        minute,
        display: `${displayHour12}:${minute.toString().padStart(2, '0')} ${ampm}`
      });
    }
  }
  return slots;
};

interface MoveAppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  staff: StaffMember[];
  onMove: (appointmentId: string, newDate: string, newTime: string, newStaffId: string) => void;
}

const MoveAppointmentDialog: React.FC<MoveAppointmentDialogProps> = ({
  isOpen,
  onClose,
  appointment,
  staff,
  onMove
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [isMoving, setIsMoving] = useState(false);

  const timeSlots = useMemo(() => generateTimeSlots(), []);

  // Initialize form when appointment changes
  useEffect(() => {
    if (appointment) {
      setSelectedDate(appointment.appointment_date);
      setSelectedTime(appointment.appointment_time);
      setSelectedStaffId(appointment.staff_id);
    }
  }, [appointment]);

  // Get available time slots for the selected date and staff member
  const getAvailableTimeSlots = (): TimeSlot[] => {
    if (!selectedDate || !selectedStaffId) return timeSlots;
    
    // For now, return all time slots. In a real implementation,
    // you would filter out slots that are already booked for the selected staff member and date
    return timeSlots;
  };

  const handleMove = async () => {
    if (!appointment || !selectedDate || !selectedTime || !selectedStaffId) {
      return;
    }

    setIsMoving(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      await onMove(appointment.id, selectedDate, selectedTime, selectedStaffId);
      
      onClose();
    } catch (error) {
      console.error('Error moving appointment:', error);
    } finally {
      setIsMoving(false);
    }
  };

  const handleCancel = () => {
    onClose();
    // Reset form
    if (appointment) {
      setSelectedDate(appointment.appointment_date);
      setSelectedTime(appointment.appointment_time);
      setSelectedStaffId(appointment.staff_id);
    }
  };

  // Generate next 30 days for date selection
  const getAvailableDates = (): string[] => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = addDays(today, i);
      dates.push(format(date, 'yyyy-MM-dd'));
    }
    return dates;
  };

  const formatTime = (timeString: string) => {
    const [hour, minute] = timeString.split(':');
    const h = parseInt(hour);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minute} ${ampm}`;
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'MMM d, yyyy');
  };

  const selectedStaffMember = staff.find(s => s.id === selectedStaffId);
  const availableTimeSlots = getAvailableTimeSlots();

  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="bg-white border-gray-200 max-w-md w-[95vw] mx-auto rounded-xl shadow-2xl p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-black text-lg font-semibold">
            <ArrowRight className="h-5 w-5" />
            Move Appointment
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-sm">
            Change the date, time, or staff member for this appointment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Appointment Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Current Appointment
            </h3>
            
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Client:</span>
                <span className="text-black font-medium">{appointment.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="text-black font-medium">{appointment.service_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current Date:</span>
                <span className="text-black font-medium">{formatDate(appointment.appointment_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current Time:</span>
                <span className="text-black font-medium">{formatTime(appointment.appointment_time)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current Staff:</span>
                <span className="text-black font-medium">
                  {staff.find(s => s.id === appointment.staff_id)?.name || 'Unknown Staff'}
                </span>
              </div>
            </div>
          </div>

          {/* New Appointment Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              New Appointment Details
            </h3>

            {/* Date Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                New Date
              </label>
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger className="bg-white border-gray-300 focus:border-black focus:ring-black">
                  <SelectValue placeholder="Select a date" className="text-black" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 max-h-64">
                  {getAvailableDates().map((date) => (
                    <SelectItem key={date} value={date} className="text-black text-sm">
                      {formatDate(date)} {date === appointment.appointment_date ? '(Current)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Staff Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                <User className="h-4 w-4 inline mr-1" />
                New Staff Member
              </label>
              <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                <SelectTrigger className="bg-white border-gray-300 focus:border-black focus:ring-black">
                  <SelectValue placeholder="Select a staff member" className="text-black" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 max-h-48">
                  {staff.map((staffMember) => (
                    <SelectItem 
                      key={staffMember.id} 
                      value={staffMember.id} 
                      className="text-black text-sm"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{staffMember.name}</span>
                        <span className="text-xs text-gray-500">{staffMember.specialty}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedStaffMember && (
                <p className="text-xs text-gray-500 mt-1">
                  {selectedStaffMember.specialty}
                </p>
              )}
            </div>

            {/* Time Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                New Time
              </label>
              <Select value={selectedTime} onValueChange={setSelectedTime} disabled={!selectedStaffId}>
                <SelectTrigger className="bg-white border-gray-300 focus:border-black focus:ring-black">
                  <SelectValue placeholder="Select a time" className="text-black" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 max-h-48">
                  {availableTimeSlots.map((slot) => (
                    <SelectItem key={slot.time} value={slot.time} className="text-black text-sm">
                      {slot.display}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedStaffId && (
                <p className="text-xs text-gray-500 mt-1">
                  Please select a staff member first
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1 h-10 text-sm border-gray-300 text-black hover:bg-gray-100 active:bg-gray-200 bg-white"
              disabled={isMoving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMove}
              className="flex-1 h-10 text-sm bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isMoving || !selectedDate || !selectedTime || !selectedStaffId}
            >
              {isMoving ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Moving...
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Move Appointment
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MoveAppointmentDialog;