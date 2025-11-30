import React, { useState, useEffect, useCallback } from 'react';
import { format, addDays, startOfWeek, addHours, setHours, setMinutes, parseISO, isSameDay } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ScheduleSidebar from '@/components/layout/ScheduleSidebar';
import ScheduleGrid from '@/components/schedule/ScheduleGrid';
import CreateAppointmentDialog from '@/components/CreateAppointmentDialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// Staff data (matching actual database IDs)
const MOCK_STAFF = [
    { id: '40ff39ae-34b0-4d51-baaf-64cf276d37f7', name: 'Sarah Johnson', role: 'Senior Stylist', color: '#f87171', avatar: '/images/client-1.jpg' },
    { id: 'b6403223-b206-4dbb-a296-ba53823ecee6', name: 'Mike Chen', role: 'Senior Stylist', color: '#60a5fa', avatar: '/images/client-2.jpg' },
    { id: 'bc685d56-2e4a-4027-bc37-40712938722f', name: 'Emma Davis', role: 'Senior Stylist', color: '#c084fc', avatar: '/images/client-3.jpg' },
    { id: 'b30effc6-2fd0-49a6-ac12-4675bced187a', name: 'Alex Rivera', role: 'Junior Stylist', color: '#34d399', avatar: '/images/client-4.jpg' },
];

const VagaroSchedule = () => {
    const { toast } = useToast();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedStaff, setSelectedStaff] = useState<string[]>(MOCK_STAFF.map(s => s.id));
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createModalData, setCreateModalData] = useState<{
        staffId: string;
        time: string;
    } | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editAppointmentData, setEditAppointmentData] = useState<any>(null);

    // Fetch appointments from Supabase
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
                 color: apt.staff_id ? MOCK_STAFF.find(s => s.id === apt.staff_id)?.color : undefined
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
    }, [selectedDate, toast]);

    // Helper to calculate end time
    const calculateEndTime = (startTime: string, durationMinutes: number) => {
        if (!startTime) return '00:00';
        const [hours, minutes] = startTime.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        date.setMinutes(date.getMinutes() + durationMinutes);
        return format(date, 'HH:mm');
    };

    useEffect(() => {
        fetchAppointments();

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
    }, [fetchAppointments]);

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

    const handleAppointmentEdit = (appointment: any) => {
        setEditAppointmentData(appointment);
        setShowEditModal(true);
    };

    const handleAppointmentUpdated = () => {
        // Refresh appointments after update
        fetchAppointments();
    };

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white">
            {/* Left Sidebar */}
            <div className="w-[300px] flex-shrink-0 border-r bg-gray-50 overflow-y-auto">
                <ScheduleSidebar
                    selectedEmployees={selectedStaff}
                    onEmployeeToggle={handleStaffToggle}
                    onDateChange={handleDateChange}
                // Pass current date to sync mini calendar
                />
            </div>

            {/* Main Schedule Grid */}
            <div className="flex-1 flex flex-col min-w-0 bg-white">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                )}

                <ScheduleGrid
                    selectedDate={selectedDate}
                    staff={MOCK_STAFF}
                    selectedStaff={selectedStaff}
                    appointments={appointments}
                    onDateChange={handleDateChange}
                    onAppointmentEdit={handleAppointmentEdit}
                    onAppointmentView={(apt) => console.log('View', apt)}
                    onAppointmentCheckIn={(apt) => console.log('Check-in', apt)}
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
                staff={MOCK_STAFF}
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
                staff={MOCK_STAFF}
                selectedDate={selectedDate}
                appointmentToEdit={editAppointmentData}
                onAppointmentCreated={handleAppointmentUpdated}
            />
        </div>
    );
};

export default VagaroSchedule;
