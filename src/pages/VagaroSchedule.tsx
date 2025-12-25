import React, { useState, useEffect, useCallback } from 'react';
import { format, addDays, startOfWeek, addHours, setHours, setMinutes, parseISO, isSameDay } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ScheduleSidebar from '@/components/layout/ScheduleSidebar';
import ScheduleGrid from '@/components/schedule/ScheduleGrid';
import CreateAppointmentDialog from '@/components/CreateAppointmentDialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const VagaroSchedule = () => {
    const { toast } = useToast();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [staff, setStaff] = useState<any[]>([]);
    const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createModalData, setCreateModalData] = useState<{
        staffId: string;
        time: string;
    } | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editAppointmentData, setEditAppointmentData] = useState<any>(null);

    // Fetch staff from Supabase
    const fetchStaff = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('staff')
                .select('id, first_name, last_name, name, role, color, avatar, status')
                .neq('status', 'offline')
                .order('name');

            if (error) throw error;

            // Transform staff data to include full name
            const transformedStaff = (data || []).map(s => ({
                id: s.id,
                name: s.first_name && s.last_name ? `${s.first_name} ${s.last_name}` : s.name,
                role: s.role || 'Stylist',
                color: s.color || '#6b7280',
                avatar: s.avatar || '/images/client-1.jpg'
            }));

            setStaff(transformedStaff);
            // Select all staff by default
            setSelectedStaff(transformedStaff.map(s => s.id));
        } catch (error) {
            console.error('Error fetching staff:', error);
            toast({
                title: "Error",
                description: "Failed to fetch staff members",
                variant: "destructive",
            });
        }
    }, [toast]);

    // Fetch appointments from Supabase
    const fetchAppointments = useCallback(async () => {
        try {
            setLoading(true);
            const startDate = format(selectedDate, 'yyyy-MM-dd');

            console.log('Fetching appointments for:', startDate);

            const { data, error } = await supabase
                .from('appointments')
                .select(`
                  *,
                  services(name, duration_minutes, price),
                  staff(name, specialty)
                `)
                .eq('appointment_date', startDate)
                .order('appointment_time', { ascending: true });

            if (error) throw error;

            // Transform data to match Appointment interface if needed
            const transformedAppointments = (data || []).map(apt => ({
                 id: apt.id,
                 client_name: apt.full_name || 'Unknown Client',
                 service_name: apt.services?.name || 'Service',
                 start_time: apt.appointment_time,
                 end_time: calculateEndTime(apt.appointment_time, apt.services?.duration_minutes || 60),
                 duration_minutes: apt.services?.duration_minutes || 60,
                 price: apt.total_amount || apt.services?.price || 0,
                 status: (apt.status as any) || 'pending',
                 payment_status: (apt.payment_status as any) || 'pending',
                 staff_id: apt.staff_id,
                 staff_name: apt.staff?.name,
                 notes: apt.notes,
                 appointment_date: apt.appointment_date,
                 color: apt.staff_id ? staff.find(s => s.id === apt.staff_id)?.color : undefined
             }));


             setAppointments(transformedAppointments);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            toast({
                title: "Error",
                description: "Failed to fetch appointments",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [selectedDate, staff, toast]);

    // Helper to calculate end time
    const calculateEndTime = (startTime: string, durationMinutes: number) => {
        if (!startTime) return '00:00';
        const [hours, minutes] = startTime.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        date.setMinutes(date.getMinutes() + durationMinutes);
        return format(date, 'HH:mm');
    };

    // Fetch staff on mount
    useEffect(() => {
        fetchStaff();
    }, [fetchStaff]);

    // Fix scrolling and background on calendar page
    useEffect(() => {
        // Store original styles
        const originalBodyOverflowX = document.body.style.overflowX;
        const originalHtmlOverflowX = document.documentElement.style.overflowX;
        const originalHtmlHeight = document.documentElement.style.height;
        const originalBodyHeight = document.body.style.height;
        const originalBodyBg = document.body.style.backgroundColor;

        // Enable scrolling and fix backgrounds
        document.body.style.overflowX = 'auto';
        document.documentElement.style.overflowX = 'auto';
        document.documentElement.style.height = 'auto'; // Override height: 100% from index.css
        document.body.style.height = 'auto'; // Allow body to expand
        document.body.style.backgroundColor = 'white'; // White background for staff portal

        return () => {
            // Restore original styles on unmount
            document.body.style.overflowX = originalBodyOverflowX;
            document.documentElement.style.overflowX = originalHtmlOverflowX;
            document.documentElement.style.height = originalHtmlHeight;
            document.body.style.height = originalBodyHeight;
            document.body.style.backgroundColor = originalBodyBg;
        };
    }, []);

    useEffect(() => {
        if (staff.length > 0) {
            fetchAppointments();
        }

        // Set up real-time subscription
        const subscription = supabase
            .channel('appointments-changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'appointments' },
                () => fetchAppointments()
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [fetchAppointments, staff.length]);

    const handleStaffToggle = (staffId: string, isSelected: boolean) => {
        setSelectedStaff(prev =>
            isSelected
                ? [...prev, staffId]
                : prev.filter(id => id !== staffId)
        );
    };

    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
    };

    const handleCreateAppointment = (staffId: string, time: string) => {
        setCreateModalData({ staffId, time });
        setShowCreateModal(true);
    };

    const handleAppointmentCreated = () => {
        // Refresh appointments after creation
        fetchAppointments();
    };

    const handleAppointmentEdit = async (appointment: any) => {
        console.log('Editing appointment:', appointment);

        // Fetch fresh appointment data from database to ensure we have the latest
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select(`
                    *,
                    services(name, duration_minutes, price),
                    staff(name, specialty)
                `)
                .eq('id', appointment.id)
                .single();

            if (error) {
                console.error('Error fetching appointment for edit:', error);
                setEditAppointmentData(appointment);
            } else if (data) {
                const freshAppointment = {
                    id: data.id,
                    client_name: data.full_name || 'Unknown Client',
                    service_id: data.service_id,
                    service_name: data.services?.name || 'Service',
                    start_time: data.appointment_time,
                    end_time: calculateEndTime(data.appointment_time, data.services?.duration_minutes || 60),
                    duration_minutes: data.services?.duration_minutes || 60,
                    price: data.total_amount || data.services?.price || 0,
                    deposit_due: data.deposit_amount || 0,
                    email: data.email,
                    phone: data.phone,
                    status: data.status || 'pending',
                    payment_status: data.payment_status || 'pending',
                    staff_id: data.staff_id,
                    staff_name: data.staff?.name,
                    notes: data.notes,
                    appointment_date: data.appointment_date,
                    color: data.staff_id ? staff.find(s => s.id === data.staff_id)?.color : undefined
                };
                console.log('Using fresh appointment data:', freshAppointment);
                setEditAppointmentData(freshAppointment);
            }
        } catch (err) {
            console.error('Error in handleAppointmentEdit:', err);
            setEditAppointmentData(appointment);
        }

        setShowEditModal(true);
    };

    const handleAppointmentUpdated = () => {
        // Refresh appointments after update
        fetchAppointments();
    };

    const handleAppointmentDelete = async (appointmentId: string) => {
        if (!window.confirm('Are you sure you want to delete this appointment?')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('appointments')
                .delete()
                .eq('id', appointmentId);

            if (error) throw error;

            toast({
                title: "Appointment Deleted",
                description: "The appointment has been successfully deleted.",
            });

            // Refresh appointments
            fetchAppointments();
        } catch (error) {
            console.error('Error deleting appointment:', error);
            toast({
                title: "Error",
                description: "Failed to delete appointment",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="flex h-[calc(100vh-64px)] bg-white">
            {/* Left Sidebar */}
            <div className="w-[300px] h-[calc(100vh-64px)] flex-shrink-0 border-r bg-white">
                <ScheduleSidebar
                    employees={staff}
                    selectedEmployees={selectedStaff}
                    onEmployeeToggle={handleStaffToggle}
                    onDateChange={handleDateChange}
                />
            </div>

            {/* Main Schedule Grid */}
            <div className="flex-1 flex flex-col min-w-0 bg-white">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-black" />
                    </div>
                )}

                <ScheduleGrid
                    selectedDate={selectedDate}
                    staff={staff}
                    selectedStaff={selectedStaff}
                    appointments={appointments}
                    onDateChange={handleDateChange}
                    onAppointmentEdit={handleAppointmentEdit}
                    onAppointmentView={(apt) => console.log('View', apt)}
                    onAppointmentCheckIn={(apt) => console.log('Check-in', apt)}
                    onAppointmentDelete={handleAppointmentDelete}
                    onAppointmentUpdated={handleAppointmentUpdated}
                    onCreateAppointment={handleCreateAppointment}
                    className="h-full"
                />
            </div>

            {/* Create Appointment Modal */}
            <CreateAppointmentDialog
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    setCreateModalData(null);
                }}
                staff={staff}
                selectedDate={selectedDate}
                selectedTime={createModalData?.time}
                selectedStaffId={createModalData?.staffId}
                onAppointmentCreated={handleAppointmentCreated}
            />

            {/* Edit Appointment Modal */}
            <CreateAppointmentDialog
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setEditAppointmentData(null);
                }}
                staff={staff}
                selectedDate={selectedDate}
                appointmentToEdit={editAppointmentData}
                onAppointmentCreated={handleAppointmentUpdated}
            />
        </div>
    );
};

export default VagaroSchedule;
