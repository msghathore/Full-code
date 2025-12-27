import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Calendar as CalendarIcon, Clock, User, Scissors, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';

interface AppointmentDetails {
  id: string;
  appointment_date: string;
  appointment_time: string;
  full_name: string;
  email: string;
  phone: string;
  total_amount: number;
  deposit_amount: number;
  service: { name: string; duration_minutes: number; price: number };
  staff: { name: string };
}

export default function CancelAppointmentPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [success, setSuccess] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

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
          p_action_type: 'cancel'
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
          total_amount,
          deposit_amount,
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

  const handleCancelRequest = () => {
    setShowConfirmation(true);
  };

  const handleCancelConfirm = async () => {
    if (!appointment || !token) return;

    setSubmitting(true);
    try {
      // Call the cancel function
      const { data, error } = await supabase.rpc('cancel_appointment', {
        p_appointment_id: appointment.id,
        p_cancellation_reason: cancellationReason || 'Cancelled by customer',
        p_cancelled_by: 'customer'
      });

      if (error) throw error;

      if (!data || !data.success) {
        throw new Error(data?.error || 'Failed to cancel appointment');
      }

      // Mark token as used
      await supabase.rpc('mark_token_used', { p_token: token });

      setSuccess(true);
      toast.success('Appointment cancelled successfully');

      // Redirect after 5 seconds
      setTimeout(() => {
        navigate('/');
      }, 5000);
    } catch (err: any) {
      console.error('Error cancelling:', err);
      toast.error(err.message || 'Failed to cancel appointment');
    } finally {
      setSubmitting(false);
      setShowConfirmation(false);
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
            <CardTitle className="text-center text-white">Appointment Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-300 space-y-4">
              <p>Your appointment has been successfully cancelled.</p>

              {appointment && appointment.deposit_amount > 0 && (
                <Alert>
                  <AlertDescription>
                    <p className="font-medium mb-2">Regarding Your Deposit:</p>
                    <p className="text-sm">
                      A deposit of ${appointment.deposit_amount.toFixed(2)} was paid for this appointment.
                      Our team will contact you within 24 hours to process your refund according to our cancellation policy.
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              <div className="bg-slate-800 p-4 rounded-lg">
                <p className="text-sm text-gray-400">
                  You will receive a confirmation email shortly.
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  We hope to see you again soon at Zavira Salon & Spa!
                </p>
              </div>

              <p className="text-xs text-gray-500">Redirecting to homepage in 5 seconds...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
            Cancel Appointment
          </h1>
          <p className="text-gray-400">We're sorry to see you go</p>
        </div>

        {/* Appointment Details */}
        {appointment && (
          <Card className="mb-6 bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Appointment Details</CardTitle>
              <CardDescription>Please review before cancelling</CardDescription>
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

              {appointment.deposit_amount > 0 && (
                <Alert className="bg-white/10/20 border-white/30">
                  <AlertTriangle className="h-4 w-4 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                  <AlertDescription className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                    <strong>Deposit Paid:</strong> ${appointment.deposit_amount.toFixed(2)}
                    <br />
                    <span className="text-sm">Refunds are subject to our cancellation policy</span>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Cancellation Reason (Optional) */}
        {!showConfirmation && (
          <Card className="mb-6 bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Reason for Cancellation (Optional)</CardTitle>
              <CardDescription>Help us improve by letting us know why you're cancelling</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="e.g., Schedule conflict, Found another salon, Personal reasons..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white min-h-24"
                maxLength={500}
              />
              <p className="text-xs text-gray-400 mt-2">
                {cancellationReason.length}/500 characters
              </p>
            </CardContent>
          </Card>
        )}

        {/* Cancellation Policy */}
        {!showConfirmation && (
          <Card className="mb-6 bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Cancellation Policy</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-300 space-y-2">
              <p>• Cancellations made 24+ hours before appointment: <strong className="text-white">Full refund</strong></p>
              <p>• Cancellations made 12-24 hours before: <strong className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">50% refund</strong></p>
              <p>• Cancellations made less than 12 hours before: <strong className="text-red-400">No refund</strong></p>
              <p className="text-xs text-gray-400 mt-4">
                Refunds are processed within 5-7 business days
              </p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        {!showConfirmation ? (
          <div className="space-y-3">
            <Button
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold text-lg py-6"
              onClick={handleCancelRequest}
              disabled={submitting}
            >
              Cancel This Appointment
            </Button>
            <Button
              variant="outline"
              className="w-full border-slate-700 text-gray-300 hover:text-white hover:bg-slate-800"
              onClick={() => navigate('/')}
            >
              Never Mind, Keep Appointment
            </Button>
          </div>
        ) : (
          <Card className="bg-red-900/20 border-red-500">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Confirm Cancellation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">
                Are you absolutely sure you want to cancel this appointment? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold"
                  onClick={handleCancelConfirm}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Cancelling...
                    </>
                  ) : (
                    'Yes, Cancel Appointment'
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-slate-700 text-gray-300"
                  onClick={() => setShowConfirmation(false)}
                  disabled={submitting}
                >
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
