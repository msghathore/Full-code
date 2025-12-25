import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGroupBookings } from '@/hooks/useGroupBookings';
import {
  GroupBooking,
  GROUP_TYPE_LABELS,
  GROUP_TYPE_ICONS,
  PAYMENT_STATUS_LABELS,
} from '@/types/groupBooking';
import { supabase } from '@/integrations/supabase/client';
import EmailService from '@/lib/email-service';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SquarePaymentForm } from '@/components/SquarePaymentForm';
import { format, parseISO } from 'date-fns';
import {
  CreditCard,
  Calendar,
  Clock,
  Users,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function GroupBookingCheckout() {
  const { shareCode } = useParams<{ shareCode: string }>();
  const navigate = useNavigate();
  const { fetchByShareCode, recordDepositPayment, updateGroupStatus } = useGroupBookings();

  const [booking, setBooking] = useState<GroupBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const loadBooking = async () => {
      if (!shareCode) return;
      setLoading(true);
      const data = await fetchByShareCode(shareCode);
      setBooking(data);
      setLoading(false);
    };
    loadBooking();
  }, [shareCode, fetchByShareCode]);

  const handlePaymentSuccess = async (paymentResult: any) => {
    if (!booking) return;

    setProcessing(true);
    try {
      // Record the deposit payment
      const depositAmount = booking.deposit_required || 0;
      await recordDepositPayment(booking.id, depositAmount);

      // Update status to confirmed
      await updateGroupStatus(booking.id, 'confirmed');

      // Send staff notifications for group booking
      try {
        const { data: groupMembers } = await supabase
          .from('group_members')
          .select(`
            *,
            services (name),
            staff (email, name)
          `)
          .eq('group_booking_id', booking.id);

        if (groupMembers && groupMembers.length > 0) {
          const notificationPromises = groupMembers
            .filter(member => member.staff?.email)
            .map(async (member) => {
              try {
                await EmailService.sendStaffNotification({
                  staffEmail: member.staff.email,
                  staffName: member.staff.name,
                  customerName: member.member_name,
                  customerEmail: member.member_email || '',
                  customerPhone: member.member_phone || '',
                  serviceName: member.services?.name || 'Service',
                  appointmentDate: booking.booking_date,
                  appointmentTime: member.scheduled_time || booking.start_time,
                  isGroupBooking: true,
                  groupName: booking.group_name
                });
                console.log(`📧 Staff notification sent to: ${member.staff.email}`);
              } catch (emailError) {
                console.warn(`⚠️ Failed to notify staff ${member.staff.email}:`, emailError);
              }
            });

          await Promise.allSettled(notificationPromises);
          console.log(`✅ Staff notifications sent for ${groupMembers.length} group members`);
        }
      } catch (staffNotifyError) {
        console.warn('⚠️ Staff notifications failed (non-critical):', staffNotifyError);
      }

      setPaymentSuccess(true);
      toast.success('Payment successful! Your group booking is confirmed.');

      // Redirect to confirmation page after delay
      setTimeout(() => {
        navigate(`/group-booking/confirmation/${shareCode}`);
      }, 3000);
    } catch (err: any) {
      toast.error(`Payment processing failed: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentError = (error: string) => {
    toast.error(`Payment failed: ${error}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle>Booking Not Found</CardTitle>
            <CardDescription>
              This group booking doesn't exist or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/group-booking')} className="w-full">
              Create New Group Booking
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-green-800">Payment Successful!</CardTitle>
            <CardDescription>
              Your group booking has been confirmed. Redirecting...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (booking.payment_status === 'fully_paid' || booking.payment_status === 'deposit_paid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle>Already Paid</CardTitle>
            <CardDescription>
              This booking has already been paid. Status: {PAYMENT_STATUS_LABELS[booking.payment_status]}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(`/group-booking/confirmation/${shareCode}`)} className="w-full">
              View Booking Details
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Complete Your Payment
            </h1>
            <p className="text-gray-600">
              Pay the 50% deposit to confirm your group booking
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {GROUP_TYPE_ICONS[booking.group_type]}
                    {booking.group_name}
                  </CardTitle>
                  <CardDescription>Booking Summary</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span>{format(parseISO(booking.booking_date), 'MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span>{booking.start_time}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-400" />
                    <span>{booking.confirmed_members} members</span>
                  </div>

                  <Separator />

                  {/* Price breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${booking.subtotal_amount?.toFixed(2)}</span>
                    </div>
                    {booking.discount_percentage > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Group Discount ({booking.discount_percentage}%)</span>
                        <span>-${booking.discount_amount?.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>${booking.total_amount?.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment breakdown */}
              <Card className="border-pink-200 bg-pink-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Due Today
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Deposit (50%)</span>
                      <span className="font-bold text-xl">${booking.deposit_required?.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Remaining balance of ${booking.balance_due?.toFixed(2)} due at your appointment
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Security badge */}
              <div className="flex items-center gap-2 text-sm text-gray-600 justify-center">
                <Shield className="w-4 h-4" />
                <span>Secure payment powered by Square</span>
              </div>
            </div>

            {/* Payment Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                  <CardDescription>
                    Enter your card information to complete the booking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SquarePaymentForm
                    amount={booking.deposit_required || 0}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                    customerEmail={booking.lead_email}
                    customerName={booking.lead_name}
                    bookingDetails={{
                      type: 'group',
                      groupId: booking.id,
                      groupName: booking.group_name || '',
                      date: booking.booking_date,
                      time: booking.start_time,
                    }}
                  />
                </CardContent>
              </Card>

              {/* Cancellation policy */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Cancellation Policy</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>72 hours notice required for group bookings</li>
                  <li>Cancellations within 72 hours forfeit deposit</li>
                  <li>No-shows will be charged the full amount</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
