import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGroupBookings } from '@/hooks/useGroupBookings';
import {
  GroupBooking,
  GROUP_TYPE_LABELS,
  GROUP_TYPE_ICONS,
  MEMBER_STATUS_LABELS,
} from '@/types/groupBooking';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import {
  Users,
  Calendar,
  Clock,
  CheckCircle,
  User,
  Mail,
  Phone,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Maximum number of members allowed in a group booking (must match GroupBooking.tsx)
const MAX_GROUP_MEMBERS = 20;

export default function GroupBookingJoin() {
  const { shareCode } = useParams<{ shareCode: string }>();
  const navigate = useNavigate();
  const { fetchByShareCode, addGroupMember } = useGroupBookings();

  const [booking, setBooking] = useState<GroupBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [joined, setJoined] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceId: '',
    notes: '',
  });

  // Check if user already joined
  const [existingMember, setExistingMember] = useState<any>(null);

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

  useEffect(() => {
    const fetchServices = async () => {
      const { data } = await supabase
        .from('services')
        .select('id, name, price, duration_minutes, category')
        .eq('is_active', true)
        .order('category', { ascending: true });
      setServices(data || []);
    };
    fetchServices();
  }, []);

  // Check if email already exists in the group
  useEffect(() => {
    if (booking?.members && formData.email) {
      const existing = booking.members.find(
        m => m.member_email?.toLowerCase() === formData.email.toLowerCase()
      );
      setExistingMember(existing || null);
    }
  }, [booking, formData.email]);

  const handleSubmit = async () => {
    if (!booking || !formData.name || !formData.email) {
      toast.error('Please fill in your name and email');
      return;
    }

    if (existingMember) {
      toast.error('You have already joined this group');
      return;
    }

    // Double-check the member limit before submitting
    const currentCount = booking.members?.length || 0;
    const maxAllowed = Math.min(booking.total_members, MAX_GROUP_MEMBERS);
    if (currentCount >= maxAllowed) {
      toast.error('This group has reached its maximum capacity');
      return;
    }

    setSubmitting(true);
    try {
      const result = await addGroupMember({
        group_booking_id: booking.id,
        member_name: formData.name,
        member_email: formData.email,
        member_phone: formData.phone,
        service_id: formData.serviceId || undefined,
        notes: formData.notes,
      });

      if (result) {
        setJoined(true);
        toast.success('You have successfully joined the group!');
      }
    } catch (err: any) {
      toast.error(`Failed to join: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white">
        <div className="animate-pulse text-gray-500">Loading group details...</div>
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
            <CardTitle>Group Not Found</CardTitle>
            <CardDescription>
              This group booking doesn't exist or the share link has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!booking.share_link_active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
            <CardTitle>Registration Closed</CardTitle>
            <CardDescription>
              This group is no longer accepting new members. Please contact the group organizer.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (joined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle>You're In!</CardTitle>
            <CardDescription>
              You have successfully joined {booking.group_name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>{format(parseISO(booking.booking_date), 'MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>{booking.start_time}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 text-center">
              A confirmation email has been sent to {formData.email}
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/')} variant="outline" className="w-full">
              Go to Homepage
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Calculate spots remaining, enforcing the maximum limit
  const currentMemberCount = booking.members?.length || 0;
  const maxAllowed = Math.min(booking.total_members, MAX_GROUP_MEMBERS);
  const spotsRemaining = maxAllowed - currentMemberCount;

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">
              {GROUP_TYPE_ICONS[booking.group_type]}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Join {booking.group_name}
            </h1>
            <p className="text-gray-600">
              You've been invited to join this {GROUP_TYPE_LABELS[booking.group_type]}
            </p>
          </div>

          {/* Booking Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Booking Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-pink-500" />
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">
                      {format(parseISO(booking.booking_date), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-slate-900" />
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-medium">{booking.start_time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-sm text-gray-500">Group Size</p>
                    <p className="font-medium">
                      {currentMemberCount} / {maxAllowed} joined
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Organized By</p>
                    <p className="font-medium">{booking.lead_name}</p>
                  </div>
                </div>
              </div>

              {/* Current members */}
              {booking.members && booking.members.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Current Members</p>
                    <div className="flex flex-wrap gap-2">
                      {booking.members.map(member => (
                        <Badge key={member.id} variant="secondary">
                          {member.member_name}
                          {member.is_lead && ' (Organizer)'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Spots remaining warning */}
          {spotsRemaining <= 2 && spotsRemaining > 0 && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-orange-600" />
              <p className="text-orange-800">
                Only {spotsRemaining} spot{spotsRemaining === 1 ? '' : 's'} remaining!
              </p>
            </div>
          )}

          {spotsRemaining <= 0 ? (
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="text-center">
                <CardTitle className="text-red-800">Group is Full</CardTitle>
                <CardDescription className="text-red-600">
                  This group has reached its maximum capacity. Please contact the organizer.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            /* Join Form */
            <Card>
              <CardHeader>
                <CardTitle>Join This Group</CardTitle>
                <CardDescription>
                  Fill in your details to join the group booking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      <User className="w-4 h-4 inline mr-1" />
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      required
                      className={cn(existingMember && 'border-red-500')}
                    />
                    {existingMember && (
                      <p className="text-sm text-red-600">
                        This email is already registered in this group
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone (Optional)
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service">Choose Your Service</Label>
                  <Select
                    value={formData.serviceId}
                    onValueChange={v => setFormData({ ...formData, serviceId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map(service => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} - ${service.price} ({service.duration_minutes} min)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Special Requests (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any allergies, preferences, or special requirements..."
                    rows={3}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !formData.name || !formData.email || !!existingMember}
                  className="w-full bg-pink-600 hover:bg-pink-700"
                >
                  {submitting ? 'Joining...' : 'Join Group'}
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Footer info */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Questions? Contact the organizer at {booking.lead_email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
