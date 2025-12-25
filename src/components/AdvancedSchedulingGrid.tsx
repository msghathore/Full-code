import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Calendar,
  Clock,
  Users,
  User,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  PlayCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  AlertTriangle,
  UserCheck,
  UserX,
  Zap,
  GripVertical,
  Star,
  DollarSign,
  Shield,
  Smartphone,
  Wifi,
  WifiOff,
  HelpCircle,
  Settings,
  Crown,
  Gift,
  MessageSquare,
  CreditCard,
  Apple,
  MapPin
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format, addDays, startOfWeek, addHours, setHours, setMinutes, parseISO, isSameDay, differenceInHours, differenceInMinutes } from 'date-fns';

type Appointment = Tables<'appointments'> & {
  services?: { name: string; duration_minutes: number };
  staff?: { name: string; specialty: string | null };
  customer_history_notes?: string;
  payment_status?: string;
  staff_preference?: boolean;
  special_instructions?: string;
};

type StaffMember = {
  id: string;
  name: string;
  username: string;
  password: string;
  role: 'admin' | 'senior' | 'junior';
  specialty: string | null;
  avatar?: string;
  status: 'available' | 'busy' | 'break' | 'offline';
  access_level: 'full' | 'limited' | 'basic';
};

type TimeSlot = {
  time: string;
  hour: number;
  minute: number;
  display: string;
};

// Generate time slots from 8 AM to 12 AM (16 hours) in 15-minute intervals
const generateTimeSlots = (): TimeSlot[] => {
  const slots = [];
  for (let hour = 8; hour <= 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const displayHour = hour === 24 ? 0 : hour;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour12 = displayHour === 0 ? 12 : displayHour > 12 ? displayHour - 12 : displayHour;
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

// SECURITY: Staff data should be loaded from database with proper authentication
// Mock staff for UI demo only - NO REAL CREDENTIALS
const mockStaff: StaffMember[] = [
  { id: '1', name: 'Sarah Johnson', username: 'sarah', password: '', role: 'senior', specialty: 'Hair Styling', status: 'available', access_level: 'full' },
  { id: '2', name: 'Mike Chen', username: 'mike', password: '', role: 'senior', specialty: 'Nails', status: 'busy', access_level: 'full' },
  { id: '3', name: 'Emma Davis', username: 'emma', password: '', role: 'junior', specialty: 'Massage', status: 'available', access_level: 'limited' },
  { id: '4', name: 'Alex Rivera', username: 'alex', password: '', role: 'junior', specialty: 'Facials', status: 'break', access_level: 'basic' }
];

const AdvancedSchedulingGrid = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Data state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>(mockStaff);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isOnline, setIsOnline] = useState(true);

  // Refs
  const gridRef = useRef<HTMLDivElement>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate time slots
  const timeSlots = useMemo(() => generateTimeSlots(), []);
  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [selectedDate]);

  // SECURITY: Authentication should be done via secure backend API, not client-side password comparison
  // This is a demo placeholder - real auth uses StaffLogin.tsx with proper hashing
  const authenticate = async () => {
    // In production, this should call the backend authentication endpoint
    console.warn('SECURITY: This demo authentication should not be used in production');
    const foundStaff = staff.find(s => s.username === username);
    if (foundStaff) {
      setCurrentStaff(foundStaff);
      setIsAuthenticated(true);
      setUsername('');
      setPassword('');
      toast({
        title: "Access Granted",
        description: `Welcome ${foundStaff.name}!`,
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid username or password",
        variant: "destructive",
      });
    }
  };

  // Fetch appointments for selected date range
  const fetchAppointments = useCallback(async () => {
    console.log(`--- Fetching Appointments ---`);
    console.log(`Selected Date: ${selectedDate.toISOString()}`);
    const startDate = format(selectedDate, 'yyyy-MM-dd');
    const endDate = format(addDays(selectedDate, 6), 'yyyy-MM-dd');
    console.log(`Date Range: ${startDate} to ${endDate}`);
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          services(name, duration_minutes),
          staff(name, specialty)
        `)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (error) {
        console.error('Error fetching appointments:', error);
        throw error;
      }

      console.log('Data received from fetch:', data);
      setAppointments(data || []);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // Update appointment status
  const updateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (error) throw error;

      // Update local state
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId
            ? { ...apt, status: newStatus, updated_at: new Date().toISOString() }
            : apt
        )
      );

      toast({
        title: "Success",
        description: `Status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  // Reschedule appointment
  const rescheduleAppointment = async (appointmentId: string, newDate: string, newTime: string, newStaffId?: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          appointment_date: newDate,
          appointment_time: newTime,
          staff_id: newStaffId,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (error) throw error;

      // Update local state
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId
            ? {
              ...apt,
              appointment_date: newDate,
              appointment_time: newTime,
              staff_id: newStaffId,
              updated_at: new Date().toISOString()
            }
            : apt
        )
      );

      toast({
        title: "Success",
        description: "Appointment rescheduled successfully",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to reschedule appointment",
        variant: "destructive",
      });
    }
  };

  // Handle drag and drop
  const handleDragStart = (e: React.DragEvent, appointment: Appointment) => {
    setDraggedAppointment(appointment);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetDate: string, targetStaffId: string) => {
    e.preventDefault();

    if (!draggedAppointment) return;

    // Calculate time from drop position
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top - 48; // Subtract header height (approx 48px)
    const pixelsPerHour = 80; // Increased height for better visibility of 15m slots
    const startHour = 8;

    const hoursFromStart = Math.max(0, y / pixelsPerHour);
    const totalMinutes = hoursFromStart * 60;

    // Round to nearest 15 minutes
    const roundedMinutes = Math.round(totalMinutes / 15) * 15;

    const newHour = startHour + Math.floor(roundedMinutes / 60);
    const newMinute = roundedMinutes % 60;

    const targetTime = `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`;

    rescheduleAppointment(draggedAppointment.id, targetDate, targetTime, targetStaffId);
    setDraggedAppointment(null);
  };

  // Get appointments for specific staff and time slot
  const getAppointmentsForSlot = (staffId: string, date: Date, time: string) => {
    const apts = appointments.filter(apt =>
      apt.staff_id === staffId &&
      apt.appointment_date === format(date, 'yyyy-MM-dd') &&
      apt.appointment_time === time
    );
    console.log(`getAppointmentsForSlot - Staff: ${staffId}, Time: ${time}. Found ${apts.length} appointments.`);
    return apts;
  };

  // Get status color and styling
  const getStatusConfig = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return {
          bgColor: 'bg-slate-50 border-slate-300 text-slate-800',
          icon: CheckCircle,
          label: 'Confirmed'
        };
      case 'arrived':
        return {
          bgColor: 'bg-green-100 border-green-300 text-green-800',
          icon: UserCheck,
          label: 'Arrived'
        };
      case 'in-progress':
        return {
          bgColor: 'bg-yellow-100 border-yellow-300 text-yellow-800',
          icon: PlayCircle,
          label: 'In Progress'
        };
      case 'completed':
        return {
          bgColor: 'bg-slate-50 border-slate-300 text-slate-800',
          icon: CheckCircle,
          label: 'Completed'
        };
      case 'cancelled':
        return {
          bgColor: 'bg-red-100 border-red-300 text-red-800',
          icon: XCircle,
          label: 'Cancelled'
        };
      default:
        return {
          bgColor: 'bg-gray-100 border-gray-300 text-gray-800',
          icon: Clock,
          label: 'Pending'
        };
    }
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    const [hour, minute] = timeString.split(':');
    const h = parseInt(hour);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minute} ${ampm}`;
  };

  // Format currency
  const formatCurrency = (amount: number | null) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount || 0);
  };

  // Navigation functions
  const navigateDate = (direction: 'prev' | 'next') => {
    const days = viewMode === 'day' ? 1 : 7;
    const newDate = direction === 'prev'
      ? addDays(selectedDate, -days)
      : addDays(selectedDate, days);
    setSelectedDate(newDate);
  };

  // Auto-refresh setup
  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();

      // Auto-refresh every 30 seconds
      refreshIntervalRef.current = setInterval(fetchAppointments, 30000);

      // Set up real-time subscriptions
      const subscription = supabase
        .channel('appointments-changes')
        .on('postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'appointments'
          },
          (payload) => {
            console.log('Real-time update:', payload);
            fetchAppointments();
          }
        )
        .subscribe();

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
        subscription.unsubscribe();
      };
    }
  }, [isAuthenticated, fetchAppointments]);

  // Online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check-in functions
  const handleCheckIn = (appointment: Appointment) => {
    updateStatus(appointment.id, 'arrived');
  };

  const handleStartService = (appointment: Appointment) => {
    updateStatus(appointment.id, 'in-progress');
  };

  const handleCompleteService = (appointment: Appointment) => {
    updateStatus(appointment.id, 'completed');
    // Trigger Google Reviews integration here
    triggerGoogleReview(appointment);
  };

  // Google Reviews integration
  const triggerGoogleReview = async (appointment: Appointment) => {
    // This would integrate with Google My Business API
    console.log('Triggering Google review for appointment:', appointment.id);
    toast({
      title: "Review Request Sent",
      description: "Customer will receive a review request via SMS",
    });
  };

  // NFC check-in simulation
  const handleNFCCheckIn = (appointmentId: string) => {
    toast({
      title: "Customer Checked In",
      description: "NFC tap recorded successfully",
    });
    updateStatus(appointmentId, 'arrived');
  };

  // Emergency coverage
  const handleEmergencyCoverage = () => {
    const availableStaff = staff.filter(s => s.status === 'available' && s.role === 'senior');
    if (availableStaff.length > 0) {
      toast({
        title: "Emergency Coverage",
        description: `${availableStaff[0].name} is available for backup`,
      });
    } else {
      toast({
        title: "No Backup Available",
        description: "All senior staff are currently busy",
        variant: "destructive",
      });
    }
  };

  // Authentication screen
  // if (!isAuthenticated) {
  //   return (
  //     <div className="min-h-screen bg-white flex items-center justify-center p-4">
  //       <Card className="w-full max-w-md shadow-lg border-gray-200">
  //         <CardHeader className="text-center">
  //           <CardTitle className="text-2xl font-bold text-black mb-2">
  //             Professional Salon Dashboard
  //           </CardTitle>
  //           <p className="text-gray-600">
  //             Sign in to access the advanced scheduling system
  //           </p>
  //         </CardHeader>
  //         <CardContent className="space-y-6">
  //           <div className="space-y-4">
  //             <div>
  //               <Input
  //                 placeholder="Username"
  //                 value={username}
  //                 onChange={(e) => setUsername(e.target.value)}
  //                 className="text-center border-gray-300"
  //               />
  //             </div>
  //             <div>
  //               <Input
  //                 type="password"
  //                 placeholder="Password"
  //                 value={password}
  //                 onChange={(e) => setPassword(e.target.value)}
  //                 className="text-center border-gray-300"
  //               />
  //             </div>
  //           </div>
  //           <Button
  //             onClick={authenticate}
  //             className="w-full bg-black hover:bg-gray-800 text-white"
  //           >
  //             Sign In
  //           </Button>
  //           <div className="text-center">
  //             <p className="text-sm text-gray-500">
  //               Use staff credentials to login
  //             </p>
  //           </div>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   );
  // }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button onClick={() => navigateDate('prev')} variant="ghost" size="icon">
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <h2 className="text-lg font-semibold">
                {format(selectedDate, 'MMMM yyyy')}
              </h2>
              <Button onClick={() => navigateDate('next')} variant="ghost" size="icon">
                <ChevronRight className="h-6 w-6" />
              </Button>
              <Button onClick={() => setSelectedDate(new Date())} variant="outline" size="sm">
                Today
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                Last updated: {format(lastRefresh, 'h:mm a')}
              </span>
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
          <div className="flex justify-around py-2 border-t border-gray-200">
            {weekDays.map(day => (
              <div key={day.toString()} className="text-center">
                <p className="text-xs text-gray-500">{format(day, 'EEE')}</p>
                <p className={`font-semibold text-lg ${isSameDay(day, selectedDate) ? 'text-black' : ''}`}>
                  {format(day, 'd')}
                </p>
              </div>
            ))}
          </div>
        </header>

        {/* Main Calendar Grid */}
        <main className="flex flex-1 overflow-hidden">
          {/* Time Gutter */}
          <div className="w-16 flex-shrink-0">
            {timeSlots.map(slot => (
              <div key={slot.time} className="h-20 text-right pr-2 text-xs text-gray-500 border-r border-gray-200 relative">
                <span className="absolute -top-2 right-2 bg-gray-100 px-1">{slot.minute === 0 ? slot.display : ''}</span>
              </div>
            ))}
          </div>

          {/* Staff Columns */}
          <div ref={gridRef} className="flex-1 grid grid-cols-3 gap-px bg-gray-200">
            {staff.map(staffMember => (
              <div
                key={staffMember.id}
                className="bg-white relative min-h-[1280px]" // 16 hours * 80px
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, format(selectedDate, 'yyyy-MM-dd'), staffMember.id)}
              >
                <div className="text-center py-4 border-b border-gray-200 sticky top-0 bg-white z-10 shadow-sm">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                      {staffMember.avatar ? (
                        <img src={staffMember.avatar} alt={staffMember.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-50 text-black font-bold text-xl">
                          {staffMember.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <p className="font-semibold text-lg">{staffMember.name.split(' ')[0]}</p>
                  </div>
                </div>

                {/* Grid Lines */}
                <div className="absolute inset-0 pointer-events-none">
                  {timeSlots.map(slot => (
                    <div key={slot.time} className={`h-20 border-b ${slot.minute === 0 ? 'border-gray-200' : 'border-gray-50 border-dashed'}`} />
                  ))}
                </div>

                {/* Appointments */}
                <div className="relative h-full">
                  {getAppointmentsForSlot(staffMember.id, selectedDate, 'all').map(appointment => {
                    // Calculate top position based on 80px per hour
                    const startHour = 8;
                    const aptHour = parseInt(appointment.appointment_time.slice(0, 2));
                    const aptMinute = parseInt(appointment.appointment_time.slice(3, 5));
                    const top = ((aptHour - startHour) * 60 + aptMinute) / 60 * 80;

                    // Calculate height
                    const height = (appointment.services?.duration_minutes || 60) / 60 * 80;

                    return (
                      <div
                        key={appointment.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, appointment)}
                        onClick={() => setSelectedAppointment(appointment)}
                        style={{ top: `${top}px`, height: `${height}px` }}
                        className="absolute left-2 right-2 p-2 rounded-lg shadow-md cursor-pointer text-white bg-black hover:bg-slate-800 transition-colors z-20 overflow-hidden"
                      >
                        <p className="font-semibold text-sm truncate">{appointment.full_name}</p>
                        <p className="text-xs truncate opacity-90">{appointment.services?.name}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
};

export default AdvancedSchedulingGrid;
