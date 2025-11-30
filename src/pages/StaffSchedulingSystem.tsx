import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, Phone, Mail } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { toast } from '@/hooks/use-toast';
// import { useTheme } from '@/hooks/use-theme';

// Export types for use in other components
export interface StaffMember {
  id: string;
  name: string;
  username: string;
  password: string;
  role: 'admin' | 'senior' | 'junior';
  specialty: string | null;
  avatar?: string;
  status: 'available' | 'busy' | 'break' | 'offline';
  access_level: 'full' | 'limited' | 'basic' | 'admin' | 'manager';
  color: string;
}

export interface Appointment {
  id: string;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  staff_id: string;
  status: 'requested' | 'accepted' | 'confirmed' | 'no_show' | 'ready_to_start' | 'in_progress' | 'complete' | 'personal_task';
  full_name: string;
  phone?: string;
  email?: string;
  total_amount?: number;
  notes?: string;
}

interface StaffSchedulingSystemProps {
  isLegendOpen?: boolean;
  setIsLegendOpen?: (open: boolean) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (authenticated: boolean) => void;
}

// Simple time formatting utility
export const formatTime = (timeString: string) => {
  const [hour, minute] = timeString.split(':');
  const h = parseInt(hour);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minute} ${ampm}`;
};

// Simple mock data
const mockStaff: StaffMember[] = [
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: 'Sarah Johnson',
    username: 'EMP001',
    password: 'demo123',
    role: 'admin',
    specialty: 'Hair Cutting, Styling, Color',
    avatar: '',
    status: 'available',
    access_level: 'admin',
    color: 'blue'
  },
  {
    id: 'b1ffc9aa-9c0b-4ef8-bb6d-6bb9bd380a22',
    name: 'Emily Davis',
    username: 'EMP002',
    password: 'demo123',
    role: 'senior',
    specialty: 'Manicures, Pedicures, Nail Art',
    avatar: '',
    status: 'available',
    access_level: 'manager',
    color: 'emerald'
  }
];

const mockAppointments: Appointment[] = [
  {
    id: '1',
    service_name: 'Hair Cut & Style',
    appointment_date: format(new Date(), 'yyyy-MM-dd'),
    appointment_time: '10:00',
    staff_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    status: 'confirmed',
    full_name: 'John Doe',
    phone: '+1-555-0123',
    email: 'john@example.com',
    total_amount: 75,
    notes: 'Regular cut, prefers layered style'
  }
];

const StaffSchedulingSystem: React.FC<StaffSchedulingSystemProps> = ({
  isAuthenticated,
  setIsAuthenticated
}) => {
  // const { setTheme } = useTheme();
  const navigate = useNavigate();

  // State management
  const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(null);
  const [employeeId, setEmployeeId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    firstName: '',
    lastName: '',
    customerPhone: '',
    customerEmail: '',
    service: '',
    notes: ''
  });

  // Initialize data
  useEffect(() => {
    setStaff(mockStaff);
    setAppointments(mockAppointments);
  }, []);

  // Authentication function
  const authenticate = () => {
    const foundStaff = mockStaff.find(s => s.username === employeeId);
    if (foundStaff) {
      setCurrentStaff(foundStaff);
      setIsAuthenticated(true);
      // setTheme('light'); // Removed to avoid dependency issues
      toast({
        title: "Access Granted",
        description: `Welcome ${foundStaff.name}!`,
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid employee ID. Use EMP001 or EMP002",
        variant: "destructive",
      });
    }
  };

  // Logout function
  const logout = () => {
    setCurrentStaff(null);
    setEmployeeId('');
    setIsAuthenticated(false);
    // setTheme('dark'); // Removed to avoid dependency issues
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  // Navigate date function
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = direction === 'prev'
      ? addDays(selectedDate, -1)
      : addDays(selectedDate, 1);
    setSelectedDate(newDate);
  };

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return appointments.filter(apt => apt.appointment_date === dateString);
  };

  // Handle booking form submission
  const handleBookingSubmit = async () => {
    const newAppointment: Appointment = {
      id: `APT-${Date.now()}`,
      service_name: bookingForm.service,
      appointment_date: format(selectedDate, 'yyyy-MM-dd'),
      appointment_time: '14:00', // Default time
      staff_id: currentStaff?.id || '',
      status: 'confirmed',
      full_name: `${bookingForm.firstName} ${bookingForm.lastName}`,
      phone: bookingForm.customerPhone,
      email: bookingForm.customerEmail,
      total_amount: 75,
      notes: bookingForm.notes
    };

    setAppointments(prev => [...prev, newAppointment]);
    setShowBookingDialog(false);
    setBookingForm({
      firstName: '',
      lastName: '',
      customerPhone: '',
      customerEmail: '',
      service: '',
      notes: ''
    });

    toast({
      title: "Appointment Booked",
      description: `${newAppointment.full_name} has been scheduled successfully.`,
    });
  };

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return (
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-black mb-2">Staff Login</h1>
              <p className="text-gray-600">Enter your employee ID to access the scheduling system</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ID
                </label>
                <Input
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="Enter employee ID (e.g., EMP001)"
                  className="text-black"
                />
              </div>

              <Button 
                onClick={authenticate}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Sign In
              </Button>

              <div className="text-center text-sm text-gray-500">
                <p>Demo IDs: EMP001, EMP002</p>
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  // Main scheduling interface
  const todaysAppointments = getAppointmentsForDate(selectedDate);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 text-black">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-black">Staff Scheduling</h1>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate('prev')}
                >
                  ←
                </Button>
                <span className="text-sm font-medium min-w-[200px] text-center">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate('next')}
                >
                  →
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {currentStaff?.name}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBookingDialog(true)}
              >
                Book Appointment
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Staff Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {staff.map(member => {
              const memberAppointments = todaysAppointments.filter(apt => apt.staff_id === member.id);
              return (
                <div key={member.id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-black">{member.name}</h3>
                      <p className="text-sm text-gray-600">{member.specialty}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Today's Appointments:</span>
                      <span className="font-medium">{memberAppointments.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        member.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {member.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Appointments List */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-black">Today's Appointments</h2>
            </div>
            <div className="p-4">
              {todaysAppointments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No appointments scheduled for today</p>
              ) : (
                <div className="space-y-3">
                  {todaysAppointments.map(appointment => {
                    const staffMember = staff.find(s => s.id === appointment.staff_id);
                    return (
                      <div key={appointment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Clock className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-black">{appointment.full_name}</p>
                            <p className="text-sm text-gray-600">{appointment.service_name}</p>
                            <p className="text-xs text-gray-500">
                              {formatTime(appointment.appointment_time)} • {staffMember?.name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-black">${appointment.total_amount}</p>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'requested' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Booking Dialog */}
        <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
          <DialogContent className="bg-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-black">Book New Appointment</DialogTitle>
              <DialogDescription>
                Schedule a new appointment for {format(selectedDate, 'MMM d, yyyy')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">First Name</label>
                  <Input
                    value={bookingForm.firstName}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Last Name</label>
                  <Input
                    value={bookingForm.lastName}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Service</label>
                <Select value={bookingForm.service} onValueChange={(value) => setBookingForm(prev => ({ ...prev, service: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hair Cut & Style">Hair Cut & Style</SelectItem>
                    <SelectItem value="Manicure">Manicure</SelectItem>
                    <SelectItem value="Pedicure">Pedicure</SelectItem>
                    <SelectItem value="Massage">Massage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Phone</label>
                <Input
                  value={bookingForm.customerPhone}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                  placeholder="(123) 456-7890"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
                <Input
                  value={bookingForm.customerEmail}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                  placeholder="customer@email.com"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowBookingDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleBookingSubmit}
                >
                  Book Appointment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Help Dialog */}
        {showHelp && (
          <Dialog open={showHelp} onOpenChange={setShowHelp}>
            <DialogContent className="bg-white max-w-md">
              <DialogHeader>
                <DialogTitle className="text-black">Staff Dashboard Guide</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-black mb-2">Quick Start</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• View today's appointments on the main dashboard</li>
                    <li>• Use date navigation to view other days</li>
                    <li>• Click "Book Appointment" to schedule new appointments</li>
                    <li>• Staff status shows availability and current workload</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-black mb-2">Demo Information</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Employee IDs: EMP001, EMP002</li>
                    <li>• All appointments are stored locally</li>
                    <li>• This is a simplified version for testing</li>
                  </ul>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </TooltipProvider>
  );
};

export default StaffSchedulingSystem;