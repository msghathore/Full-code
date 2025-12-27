import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Calendar as CalendarIcon, Clock, User, Scissors, CheckCircle2, XCircle } from 'lucide-react';
import { format, parseISO, addDays } from 'date-fns';
import { toast } from 'sonner';

interface AppointmentDetails {
  id: string;
  appointment_date: string;
  appointment_time: string;
  full_name: string;
  email: string;
  phone: string;
  service: { name: string; duration_minutes: number; price: number };
  staff: { name: string };
}

export default function RescheduleAppointmentPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [success, setSuccess] = useState(false);

  // Reschedule form state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Verify token and load appointment on mount
  useEffect(() => {
    if (!token) {
      setError('Invalid link - no token provided');
      setVerifying(false);
      setLoading(false);
      return;
    }

    verifyTokenAndLoadAppointment();
  }, [token]);

  const verifyTokenAndLoadAppointment = async () => {
    try {
      // Verify the token
      const { data: verifyData, error: verifyError } = await supabase
        .rpc('verify_appointment_token', {
          p_token: token,
          p_action_type: 'reschedule'
        });

      if (verifyError) throw verifyError;

      if (!verifyData || verifyData.length === 0 || !verifyData[0].is_valid) {
        const errorMsg = verifyData?.[0]?.error_message || 'Invalid or expired link';
        setError(errorMsg);
        setVerifying(false);
        setLoading(false);
        return;
      }

      const appointmentId = verifyData[0].appointment_id;

      // Load appointment details
      const { data: aptData, error: aptError } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          appointment_time,
          full_name,
          email,
          phone,
          service:services(name, duration_minutes, price),
          staff:staff(name)
        `)
        .eq('id', appointmentId)
        .single();

      if (aptError) throw aptError;
      if (!aptData) throw new Error('Appointment not found');

      setAppointment(aptData as any);
      setVerifying(false);
      setLoading(false);
    } catch (err: any) {
      console.error('Error verifying token:', err);
      setError(err.message || 'Failed to verify link');
      setVerifying(false);
      setLoading(false);
    }
  };

  // Load available time slots when date is selected
  useEffect(() => {
    if (selectedDate && appointment) {
      loadAvailableSlots();
    }
  }, [selectedDate]);

  const loadAvailableSlots = async () => {
    if (!selectedDate || !appointment) return;

    setLoadingSlots(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');

      // Get booked appointments for this date
      const { data: bookedSlots, error } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('appointment_date', dateStr)
        .neq('status', 'CANCELLED');

      if (error) throw error;

      // Generate time slots (8 AM to 11 PM, every 30 minutes)
      const slots: string[] = [];
      for (let hour = 8; hour < 23; hour++) {
        for (let minute of [0, 30]) {
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

          // Check if slot is already booked
          const isBooked = bookedSlots?.some(b => b.appointment_time === time);
          if (!isBooked) {
            slots.push(time);
          }
        }
      }

      setAvailableSlots(slots);
    } catch (err: any) {
      console.error('Error loading slots:', err);
      toast.error('Failed to load available time slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime || !appointment || !token) {
      toast.error('Please select both a date and time');
      return;
    }

    setSubmitting(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');

      // Call the reschedule function
      const { data, error } = await supabase.rpc('reschedule_appointment', {
        p_original_appointment_id: appointment.id,
        p_new_date: dateStr,
        p_new_time: selectedTime,
        p_new_staff_id: null // Keep same staff
      });

      if (error) throw error;

      if (!data || !data.success) {
        throw new Error(data?.error || 'Failed to reschedule appointment');
      }

      // Mark token as used
      await supabase.rpc('mark_token_used', { p_token: token });

      setSuccess(true);
      toast.success('Appointment rescheduled successfully!');

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err: any) {
      console.error('Error rescheduling:', err);
      toast.error(err.message || 'Failed to reschedule appointment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || verifying) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Verifying your link...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-slate-900 border-red-500">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <CardTitle className="text-center text-white">Link Error</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button
              className="w-full mt-4"
              onClick={() => navigate('/')}
            >
              Return to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-slate-900 border-white">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <CardTitle className="text-center text-white">Successfully Rescheduled!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-300 space-y-4">
              <p>Your appointment has been rescheduled to:</p>
              <div className="bg-slate-800 p-4 rounded-lg">
                <p className="text-xl font-bold text-white">
                  {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
                </p>
                <p className="text-lg text-white">{selectedTime}</p>
              </div>
              <p className="text-sm">You will receive a confirmation email shortly.</p>
              <p className="text-sm text-gray-400">Redirecting to homepage...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
            Reschedule Your Appointment
          </h1>
          <p className="text-gray-400">Choose a new date and time for your appointment</p>
        </div>

        {/* Current Appointment Details */}
        {appointment && (
          <Card className="mb-8 bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Current Appointment</CardTitle>
              <CardDescription>This appointment will be cancelled and rescheduled</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-5 h-5 text-white" />
                  <div>
                    <p className="text-sm text-gray-400">Date</p>
                    <p className="text-white font-medium">
                      {format(parseISO(appointment.appointment_date), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-white" />
                  <div>
                    <p className="text-sm text-gray-400">Time</p>
                    <p className="text-white font-medium">{appointment.appointment_time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Scissors className="w-5 h-5 text-white" />
                  <div>
                    <p className="text-sm text-gray-400">Service</p>
                    <p className="text-white font-medium">{appointment.service.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-white" />
                  <div>
                    <p className="text-sm text-gray-400">Staff</p>
                    <p className="text-white font-medium">{appointment.staff.name}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reschedule Form */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Select New Date & Time</CardTitle>
            <CardDescription>Choose when you'd like to reschedule to</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Calendar */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Select Date
              </label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < addDays(new Date(), 0) || date.getDay() === 0} // Disable past dates and Sundays
                className="rounded-md border border-slate-700 bg-slate-800 text-white"
              />
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Select Time
                </label>
                {loadingSlots ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-white" />
                    <p className="text-sm text-gray-400 mt-2">Loading available times...</p>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      No available slots for this date. Please select another date.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2 max-h-64 overflow-y-auto p-2 bg-slate-800 rounded-lg">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot}
                        variant={selectedTime === slot ? 'default' : 'outline'}
                        className={`text-sm ${
                          selectedTime === slot
                            ? 'bg-white text-black hover:bg-white/90'
                            : 'bg-slate-700 text-white hover:bg-slate-600'
                        }`}
                        onClick={() => setSelectedTime(slot)}
                      >
                        {slot}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-lg py-6"
                onClick={handleReschedule}
                disabled={!selectedDate || !selectedTime || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Rescheduling...
                  </>
                ) : (
                  'Confirm Reschedule'
                )}
              </Button>
              <Button
                variant="ghost"
                className="w-full mt-2 text-gray-400 hover:text-white"
                onClick={() => navigate('/')}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
