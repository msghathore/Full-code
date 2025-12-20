import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGroupBookings } from '@/hooks/useGroupBookings';
import {
  GroupBooking,
  GROUP_TYPE_LABELS,
  GROUP_TYPE_ICONS,
  GROUP_STATUS_LABELS,
  GROUP_STATUS_COLORS,
  MEMBER_STATUS_LABELS,
} from '@/types/groupBooking';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format, parseISO } from 'date-fns';
import {
  CheckCircle,
  Copy,
  Share2,
  Mail,
  Calendar,
  Clock,
  Users,
  CreditCard,
  ArrowRight,
  MessageSquare,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';

export default function GroupBookingConfirmation() {
  const { shareCode } = useParams<{ shareCode: string }>();
  const navigate = useNavigate();
  const { fetchByShareCode } = useGroupBookings();

  const [booking, setBooking] = useState<GroupBooking | null>(null);
  const [loading, setLoading] = useState(true);

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

  const shareLink = `${window.location.origin}/group-booking/join/${shareCode}`;

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success('Share link copied to clipboard!');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Join ${booking?.group_name || 'our group booking'}`);
    const body = encodeURIComponent(
      `You're invited to join our group booking at Zavira Beauty!\n\n` +
      `Group: ${booking?.group_name}\n` +
      `Date: ${booking?.booking_date ? format(parseISO(booking.booking_date), 'MMMM d, yyyy') : ''}\n` +
      `Time: ${booking?.start_time}\n\n` +
      `Click here to join and add your details:\n${shareLink}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(
      `Join our group booking at Zavira Beauty!\n\n` +
      `${GROUP_TYPE_ICONS[booking?.group_type || 'friends']} ${booking?.group_name}\n` +
      `Date: ${booking?.booking_date ? format(parseISO(booking.booking_date), 'MMMM d, yyyy') : ''}\n` +
      `Time: ${booking?.start_time}\n\n` +
      `Join here: ${shareLink}`
    );
    window.open(`https://wa.me/?text=${text}`);
  };

  const addToCalendar = () => {
    if (!booking) return;
    const startDate = `${booking.booking_date}T${booking.start_time}:00`;
    const title = encodeURIComponent(booking.group_name || 'Group Booking at Zavira Beauty');
    const details = encodeURIComponent(`Group booking confirmation\nShare code: ${booking.share_code}`);
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate.replace(/[-:]/g, '')}/${startDate.replace(/[-:]/g, '')}&details=${details}`;
    window.open(calendarUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading booking details...</div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Booking Not Found</CardTitle>
            <CardDescription>
              This group booking doesn't exist or the share link has expired.
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Group Booking Created!
            </h1>
            <p className="text-gray-600">
              Your group booking has been successfully created. Share the link below with your group members.
            </p>
          </div>

          {/* Booking Details Card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {GROUP_TYPE_ICONS[booking.group_type]}
                    {booking.group_name}
                  </CardTitle>
                  <CardDescription>
                    Confirmation Code: <code className="bg-gray-100 px-2 py-1 rounded">{booking.share_code}</code>
                  </CardDescription>
                </div>
                <Badge className={GROUP_STATUS_COLORS[booking.status]}>
                  {GROUP_STATUS_LABELS[booking.status]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">
                      {format(parseISO(booking.booking_date), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-medium">{booking.start_time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Group Size</p>
                    <p className="font-medium">
                      {booking.confirmed_members} / {booking.total_members} members
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="font-medium">${booking.total_amount?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              </div>

              {/* Members List */}
              {booking.members && booking.members.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-3">Group Members</h4>
                    <div className="space-y-2">
                      {booking.members.map(member => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{member.member_name}</span>
                            {member.is_lead && (
                              <Badge variant="secondary" className="text-xs">Lead</Badge>
                            )}
                          </div>
                          <Badge variant="outline">
                            {MEMBER_STATUS_LABELS[member.status]}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Share Card */}
          <Card className="mb-6 border-pink-200 bg-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Share with Your Group
              </CardTitle>
              <CardDescription>
                Send this link to your group members so they can join and add their details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={shareLink}
                  readOnly
                  className="bg-white"
                />
                <Button onClick={copyShareLink} variant="outline">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-3">
                <Button onClick={shareViaEmail} variant="outline" className="flex-1">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
                <Button onClick={shareViaWhatsApp} variant="outline" className="flex-1 bg-green-500 text-white hover:bg-green-600">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button onClick={addToCalendar} variant="outline" className="w-full">
              <Calendar className="w-4 h-4 mr-2" />
              Add to Google Calendar
            </Button>
            {booking.status === 'pending' && (
              <Button
                onClick={() => navigate(`/group-booking/checkout/${shareCode}`)}
                className="w-full bg-pink-600 hover:bg-pink-700"
              >
                Pay Deposit & Confirm
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
            <Link to="/">
              <Button variant="ghost" className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Info */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>A confirmation email has been sent to {booking.lead_email}</p>
            <p className="mt-1">Questions? Contact us at support@zavirabeauty.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
