import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AdminLayout from '@/components/AdminLayout';
import {
  Calendar,
  Search,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Phone,
  Mail,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAppointments } from '@/hooks/useAppointments';
import { useStaffAuth } from '@/hooks/useStaffAuth';

gsap.registerPlugin(ScrollTrigger);

const BookingsManagement = () => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  const { isStaffMember, isLoaded: authLoaded } = useStaffAuth();
  const { appointments, loading, error, updateAppointmentStatus } = useAppointments();

  // Filter bookings based on search and status
  const filteredBookings = appointments.filter(booking => {
    const matchesSearch = booking.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          booking.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Separate bookings by status for tabs
  const pendingBookings = filteredBookings.filter(b => b.status === 'pending');
  const confirmedBookings = filteredBookings.filter(b => b.status === 'confirmed');
  const completedBookings = filteredBookings.filter(b => b.status === 'completed');
  const cancelledBookings = filteredBookings.filter(b => b.status === 'cancelled');

  useEffect(() => {
    // Animate dashboard entrance
    if (dashboardRef.current) {
      gsap.fromTo(dashboardRef.current.children,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out"
        }
      );
    }
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const BookingCard = ({ booking }: { booking: any }) => (
    <Card className="frosted-glass border-white/10 hover:border-white/20 transition-all">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold luxury-glow text-lg">{booking.service}</h3>
            <p className="text-sm text-muted-foreground">
              {formatDate(booking.date)} at {booking.time}
            </p>
          </div>
          <Badge className={getStatusColor(booking.status)}>
            {booking.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{booking.customer}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{booking.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{booking.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{booking.duration} min</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-lg font-bold luxury-glow">
            {formatCurrency(booking.price)}
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
              </DialogTrigger>
              <DialogContent className="frosted-glass border-white/20">
                <DialogHeader>
                  <DialogTitle>Booking Details</DialogTitle>
                  <DialogDescription>
                    Complete information for booking #{booking.id}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-white/70">Service</label>
                      <p className="font-medium">{booking.service}</p>
                    </div>
                    <div>
                      <label className="text-sm text-white/70">Staff</label>
                      <p className="font-medium">{booking.staff}</p>
                    </div>
                    <div>
                      <label className="text-sm text-white/70">Date & Time</label>
                      <p className="font-medium">{formatDate(booking.date)} at {booking.time}</p>
                    </div>
                    <div>
                      <label className="text-sm text-white/70">Duration</label>
                      <p className="font-medium">{booking.duration} minutes</p>
                    </div>
                    <div>
                      <label className="text-sm text-white/70">Price</label>
                      <p className="font-medium">{formatCurrency(booking.price)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-white/70">Status</label>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                  {booking.notes && (
                    <div>
                      <label className="text-sm text-white/70">Notes</label>
                      <p className="text-sm bg-white/5 p-3 rounded">{booking.notes}</p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            {booking.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-500/20 hover:bg-green-500/10 text-green-400"
                  onClick={() => updateAppointmentStatus(booking.id, 'confirmed')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-500/20 hover:bg-red-500/10 text-red-400"
                  onClick={() => updateAppointmentStatus(booking.id, 'cancelled')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Show loading state while auth is loading
  if (!authLoaded) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  // Show access denied if not staff member
  if (!isStaffMember) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to access this page. Staff access required.
            </AlertDescription>
          </Alert>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div ref={dashboardRef} className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif luxury-glow mb-2">Bookings Management</h1>
            <p className="text-muted-foreground">Manage all salon appointments and bookings</p>
          </div>
          <Button>
            <Calendar className="h-4 w-4 mr-2" />
            New Booking
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
            <span>Loading appointments...</span>
          </div>
        )}

        {/* Filters */}
        <Card className="frosted-glass border-white/10">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by customer or service..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/5 border-white/20"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 bg-white/5 border-white/20">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="frosted-glass border-white/20">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="frosted-glass border-white/10">
            <TabsTrigger value="all" className="data-[state=active]:bg-white/10">
              All ({filteredBookings.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-white/10">
              Pending ({pendingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="confirmed" className="data-[state=active]:bg-white/10">
              Confirmed ({confirmedBookings.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-white/10">
              Completed ({completedBookings.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="data-[state=active]:bg-white/10">
              Cancelled ({cancelledBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredBookings.length === 0 && !loading ? (
              <div className="text-center py-8 text-muted-foreground">
                No appointments found.
              </div>
            ) : (
              filteredBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingBookings.length === 0 && !loading ? (
              <div className="text-center py-8 text-muted-foreground">
                No pending appointments.
              </div>
            ) : (
              pendingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>

          <TabsContent value="confirmed" className="space-y-4">
            {confirmedBookings.length === 0 && !loading ? (
              <div className="text-center py-8 text-muted-foreground">
                No confirmed appointments.
              </div>
            ) : (
              confirmedBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedBookings.length === 0 && !loading ? (
              <div className="text-center py-8 text-muted-foreground">
                No completed appointments.
              </div>
            ) : (
              completedBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            {cancelledBookings.length === 0 && !loading ? (
              <div className="text-center py-8 text-muted-foreground">
                No cancelled appointments.
              </div>
            ) : (
              cancelledBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default BookingsManagement;