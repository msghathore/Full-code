import React, { useState, useEffect, useCallback } from 'react';
import { Navigation } from '@/components/Navigation';
import { 
  Calendar, 
  Users, 
  Clock, 
  Filter,
  Settings,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import LeftNav from '@/components/schedule/LeftNav';
import ScheduleGrid from '@/components/schedule/ScheduleGrid';
import AppointmentCard, { Appointment } from '@/components/schedule/AppointmentCard';
import { supabase } from '@/integrations/supabase/client';
import { format, isToday, parseISO } from 'date-fns';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  color: string;
  avatar?: string;
}

const VagaroSchedulePage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Mock data for demonstration
  const mockStaff: StaffMember[] = [
    { id: 'mock-staff-1', name: 'Sarah Johnson', role: 'Hair Stylist', color: '#f87171' },
    { id: 'mock-staff-2', name: 'Lisa Anderson', role: 'Color Specialist', color: '#60a5fa' },
    { id: 'mock-staff-3', name: 'Michael Chen', role: 'Nail Technician', color: '#c084fc' },
    { id: 'mock-staff-4', name: 'Alex Rivera', role: 'Tattoo Artist', color: '#34d399' },
    { id: 'mock-staff-5', name: 'Jordan Taylor', role: 'Esthetician', color: '#fbbf24' },
  ];

  const mockAppointments: Appointment[] = [
    {
      id: '1',
      client_name: 'Emma Wilson',
      service_name: 'Hair Cut & Style',
      start_time: '09:00',
      end_time: '10:30',
      duration_minutes: 90,
      price: 75,
      status: 'confirmed',
      notes: 'Prefers natural products',
      is_recurring: false,
      payment_status: 'paid',
      staff_id: 'mock-staff-1',
      staff_name: 'Sarah Johnson',
      color: '#f87171',
    },
    {
      id: '2',
      client_name: 'David Martinez',
      service_name: 'Hair Color',
      start_time: '11:00',
      end_time: '13:00',
      duration_minutes: 120,
      price: 120,
      status: 'confirmed',
      notes: 'First time client',
      is_recurring: false,
      payment_status: 'paid',
      staff_id: 'mock-staff-2',
      staff_name: 'Lisa Anderson',
      color: '#60a5fa',
    },
    {
      id: '3',
      client_name: 'Jessica Brown',
      service_name: 'Manicure',
      start_time: '14:00',
      end_time: '15:30',
      duration_minutes: 90,
      price: 45,
      status: 'pending',
      is_recurring: true,
      payment_status: 'pending',
      staff_id: 'mock-staff-3',
      staff_name: 'Michael Chen',
      color: '#c084fc',
    },
    {
      id: '4',
      client_name: 'Ryan Lee',
      service_name: 'Tattoo Consult',
      start_time: '16:00',
      end_time: '17:00',
      duration_minutes: 60,
      price: 85,
      status: 'confirmed',
      payment_status: 'paid',
      staff_id: 'mock-staff-4',
      staff_name: 'Alex Rivera',
      color: '#34d399',
    },
  ];

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from Supabase, fallback to mock data
      try {
        const [staffResponse, appointmentsResponse] = await Promise.all([
          supabase.from('staff').select('*').eq('is_active', true),
          supabase
            .from('appointments')
            .select(`
              *,
              staff:staff_id(name),
              services:service_id(name)
            `)
            .gte('appointment_date', format(selectedDate, 'yyyy-MM-01'))
            .lt('appointment_date', format(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1), 'yyyy-MM-dd'))
        ]);

        if (staffResponse.data) {
          const staffData = staffResponse.data.map((staff, index) => ({
            id: staff.id,
            name: staff.name,
            role: (staff as any).specialty || 'Staff',
            color: ['#f87171', '#60a5fa', '#c084fc', '#34d399', '#fbbf24', '#a855f7', '#ef4444'][index % 7],
            avatar: (staff as any).avatar_url,
          }));
          setStaff(staffData);
        }

        if (appointmentsResponse.data) {
          const appointmentsData = appointmentsResponse.data.map(apt => ({
            id: apt.id,
            client_name: (apt as any).full_name || 'Unknown Client',
            service_name: (apt as any).services?.name || 'Unknown Service',
            start_time: apt.appointment_time,
            end_time: apt.appointment_time, // Would need to calculate based on service duration
            duration_minutes: 60, // Default duration
            price: apt.total_amount || 0,
            status: (apt.status as any) || 'pending',
            notes: apt.notes,
            payment_status: (apt.payment_status as any) || 'pending',
            staff_id: apt.staff_id,
            staff_name: (apt as any).staff?.name,
          }));
          setAppointments(appointmentsData);
        }
      } catch (supabaseError) {
        console.warn('Supabase connection failed, using mock data:', supabaseError);
        // Use mock data as fallback
        setStaff(mockStaff);
        setAppointments(mockAppointments);
      }

      // Auto-select all staff initially
      if (staff.length === 0 && mockStaff.length > 0) {
        setSelectedStaff(mockStaff.map(s => s.id));
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load schedule data');
      toast({
        title: "Error",
        description: "Failed to load schedule data. Using demo data.",
        variant: "destructive",
      });
      // Fallback to mock data
      setStaff(mockStaff);
      setAppointments(mockAppointments);
      setSelectedStaff(mockStaff.map(s => s.id));
    } finally {
      setLoading(false);
    }
  }, [selectedDate, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStaffToggle = useCallback((staffId: string) => {
    setSelectedStaff(prev => 
      prev.includes(staffId) 
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  }, []);

  const handleDateChange = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handleAppointmentEdit = useCallback((appointment: Appointment) => {
    toast({
      title: "Edit Appointment",
      description: `Editing appointment for ${appointment.client_name}`,
    });
    // TODO: Open edit modal
  }, [toast]);

  const handleAppointmentView = useCallback((appointment: Appointment) => {
    toast({
      title: "View Appointment",
      description: `Viewing details for ${appointment.client_name}`,
    });
    // TODO: Open view modal
  }, [toast]);

  const handleAppointmentCheckIn = useCallback((appointment: Appointment) => {
    toast({
      title: "Check In",
      description: `${appointment.client_name} has been checked in`,
    });
    // TODO: Update appointment status
  }, [toast]);

  const handleCreateAppointment = useCallback((staffId: string, time: string) => {
    toast({
      title: "Create Appointment",
      description: `Creating appointment for ${staffId} at ${time}`,
    });
    // TODO: Open create appointment modal
  }, [toast]);

  const handleRefresh = useCallback(() => {
    loadData();
    toast({
      title: "Refreshed",
      description: "Schedule data has been refreshed",
    });
  }, [loadData, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-24 flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Loading schedule...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && staff.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-24 flex items-center justify-center h-96">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to Load Data</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={loadData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-16 flex h-screen">
        {/* Left Navigation Panel */}
        <LeftNav
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          staff={staff}
          selectedStaff={selectedStaff}
          onStaffToggle={handleStaffToggle}
        />
        
        {/* Main Schedule Grid */}
        <ScheduleGrid
          selectedDate={selectedDate}
          staff={staff}
          selectedStaff={selectedStaff}
          appointments={appointments}
          onDateChange={handleDateChange}
          onAppointmentEdit={handleAppointmentEdit}
          onAppointmentView={handleAppointmentView}
          onAppointmentCheckIn={handleAppointmentCheckIn}
          onCreateAppointment={handleCreateAppointment}
        />
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg"
          onClick={handleRefresh}
        >
          <RefreshCw className="h-6 w-6" />
        </Button>
      </div>

      {/* Status Bar */}
      <div className="fixed bottom-4 left-72 z-40">
        <Card className="px-4 py-2">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>{format(selectedDate, 'MMM d, yyyy')}</span>
              {isToday(selectedDate) && (
                <Badge variant="secondary" className="text-xs">Today</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span>{selectedStaff.length} staff</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>{appointments.length} appointments</span>
            </div>
            {error && (
              <div className="flex items-center gap-1 text-yellow-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-xs">Demo mode</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VagaroSchedulePage;