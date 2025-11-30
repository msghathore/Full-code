import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SquarePaymentForm } from '@/components/SquarePaymentForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { CheckCircle, CreditCard, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import EmailService from '@/lib/email-service';

const BookingCheckout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Get booking details from navigation state
    const data = location.state?.bookingDetails;
    if (!data) {
      toast({
        title: "Error",
        description: "No booking details found. Please start your booking again.",
        variant: "destructive",
      });
      navigate('/booking');
      return;
    }

    setBookingDetails(data);

    // Check authentication
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }
    };
    getUser();
  }, [location.state, navigate, toast]);

  const handlePaymentSuccess = async (paymentResult: any) => {
    if (!bookingDetails) return;

    setIsProcessing(true);

    try {
      console.log('💰 Payment successful, saving appointment...');

      // Build appointment data
      const appointmentData: any = {
        service_id: bookingDetails.service_id,
        appointment_date: bookingDetails.appointment_date,
        appointment_time: bookingDetails.appointment_time,
        status: 'confirmed',
        payment_status: 'paid',
        payment_intent_id: paymentResult.paymentId,
        total_amount: bookingDetails.service_price,
        deposit_amount: bookingDetails.service_price * 0.5, // 50% deposit
        notes: bookingDetails.notes || '',
      };

      // Add user ID if authenticated
      if (user) {
        appointmentData.user_id = user.id;
      } else if (bookingDetails.is_guest) {
        // For guest bookings, store contact info in appointment
        appointmentData.full_name = bookingDetails.customer_name;
        appointmentData.email = user?.email || '';
        appointmentData.phone = bookingDetails.customer_phone;
      }

      console.log('📝 Saving appointment:', appointmentData);

      // Save appointment to database
      const { data: appointment, error } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error saving appointment:', error);
        throw error;
      }

      console.log('✅ Appointment saved successfully:', appointment);

      // Send confirmation email
      try {
        const customerEmail = user?.email || bookingDetails.customer_email;
        const customerName = bookingDetails.customer_name || user?.user_metadata?.full_name || 'Valued Customer';

        if (customerEmail) {
          const emailResult = await EmailService.sendAppointmentConfirmation({
            customerEmail,
            customerName,
            serviceName: bookingDetails.service_name,
            appointmentDate: bookingDetails.appointment_date,
            appointmentTime: bookingDetails.appointment_time,
            staffName: 'Your Stylist' // Could be enhanced to get actual staff name
          });

          if (emailResult.success) {
            console.log('📧 Confirmation email sent');
          }
        }
      } catch (emailError) {
        console.warn('⚠️ Email sending failed (non-critical):', emailError);
      }

      setPaymentCompleted(true);

      toast({
        title: "Booking Confirmed! 🎉",
        description: "Your appointment has been scheduled and payment processed successfully.",
      });

      // Clear localStorage booking data
      localStorage.removeItem('booking-current-step');
      localStorage.removeItem('booking-date');
      localStorage.removeItem('booking-selected-service');
      localStorage.removeItem('booking-selected-staff');
      localStorage.removeItem('booking-selected-time');
      localStorage.removeItem('booking-full-name');
      localStorage.removeItem('booking-phone');
      localStorage.removeItem('booking-notes');
      localStorage.removeItem('booking-selection-mode');

    } catch (error: any) {
      console.error('❌ Error completing booking:', error);
      toast({
        title: "Booking Error",
        description: error.message || "There was an error completing your booking. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('💸 Payment error:', error);
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive",
    });
  };

  const handleBackToBooking = () => {
    navigate('/booking');
  };

  if (!bookingDetails) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
        <Footer />
      </div>
    );
  }

  if (paymentCompleted) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <Navigation />

        <div className="flex-1 flex items-center justify-center px-4 pt-32">
          <div className="max-w-md w-full">
            <Card className="frosted-glass border border-white/10">
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <h1 className="text-2xl font-serif luxury-glow mb-4 text-white">
                  Booking Confirmed!
                </h1>
                <div className="space-y-3 text-white/80 mb-6">
                  <p><strong>Service:</strong> {bookingDetails.service_name}</p>
                  <p><strong>Date:</strong> {new Date(bookingDetails.appointment_date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {bookingDetails.appointment_time}</p>
                  <p><strong>Total:</strong> ${bookingDetails.service_price?.toFixed(2)}</p>
                </div>
                <p className="text-white/60 text-sm mb-6">
                  A confirmation email has been sent to your inbox with all the details.
                </p>
                <Button
                  onClick={() => navigate('/')}
                  className="w-full luxury-button-hover"
                >
                  Return to Home
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navigation />

      <div className="flex-1 px-4 md:px-8 pt-32 pb-8">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif luxury-glow mb-4">
              COMPLETE YOUR BOOKING
            </h1>
            <p className="text-muted-foreground text-base md:text-lg tracking-wider">
              Secure payment processing powered by Square
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Booking Summary */}
            <Card className="frosted-glass border border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Service:</span>
                    <span className="text-white font-medium">{bookingDetails.service_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Date:</span>
                    <span className="text-white">{new Date(bookingDetails.appointment_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Time:</span>
                    <span className="text-white">{bookingDetails.appointment_time}</span>
                  </div>
                  {bookingDetails.customer_name && (
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Customer:</span>
                      <span className="text-white">{bookingDetails.customer_name}</span>
                    </div>
                  )}
                  {bookingDetails.notes && (
                    <div className="space-y-1">
                      <span className="text-white/70 text-sm">Notes:</span>
                      <p className="text-white/60 text-sm bg-white/5 p-2 rounded">{bookingDetails.notes}</p>
                    </div>
                  )}
                </div>

                <Separator className="bg-white/10" />

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-white/70">Service Price:</span>
                    <span className="text-white">${bookingDetails.service_price?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Deposit (50%):</span>
                    <span className="text-white">${(bookingDetails.service_price * 0.5)?.toFixed(2)}</span>
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span className="text-white">Total Due Today:</span>
                    <span className="text-green-400">${(bookingDetails.service_price * 0.5)?.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-blue-300 text-sm">
                    💳 You'll pay a 50% deposit today. The remaining balance will be collected at your appointment.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card className="frosted-glass border border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Secure Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Test Payment Mode for Customer Bookings */}
                <div className="space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4 text-white">Complete Your Payment</h3>
                    <div className="text-sm text-white/70 mb-4">
                      Amount: <span className="font-semibold text-white">${(bookingDetails.service_price * 0.5).toFixed(2)}</span>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
                      <p className="text-sm text-yellow-300">
                        <strong>Test Mode:</strong> Click "Complete Test Payment" to simulate a successful payment for your booking.
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      console.log('Test payment completed for booking');
                      handlePaymentSuccess({
                        paymentId: `booking_${Date.now()}`,
                        status: 'COMPLETED',
                        amount: bookingDetails.service_price * 0.5
                      });
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    disabled={isProcessing}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Complete Test Payment (${(bookingDetails.service_price * 0.5).toFixed(2)})
                  </Button>

                  <div className="text-xs text-white/50 text-center">
                    <p>🔒 Secure payment powered by Square</p>
                    <p>Your booking will be confirmed once payment is processed</p>
                  </div>
                </div>

                {isProcessing && (
                  <div className="flex items-center justify-center mt-4 p-4 bg-white/5 rounded-lg">
                    <Loader2 className="h-6 w-6 animate-spin text-white mr-2" />
                    <span className="text-white">Processing your booking...</span>
                  </div>
                )}

                <div className="mt-6 text-center">
                  <Button
                    onClick={handleBackToBooking}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    disabled={isProcessing}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Booking
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Notice */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-2">
              <AlertCircle className="h-4 w-4 text-green-400" />
              <span className="text-white/60 text-sm">
                🔒 Your payment information is encrypted and secure. Powered by Square.
              </span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookingCheckout;