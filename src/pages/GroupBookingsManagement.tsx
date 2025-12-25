import { useState, useEffect } from 'react';
import { useGroupBookings, useGroupPackages } from '@/hooks/useGroupBookings';
import {
  GroupBooking,
  GroupMember,
  GROUP_TYPE_LABELS,
  GROUP_TYPE_ICONS,
  GROUP_STATUS_LABELS,
  GROUP_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  MEMBER_STATUS_LABELS,
  GroupType,
  GroupStatus,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO, addDays } from 'date-fns';
import {
  Users,
  Calendar,
  DollarSign,
  Clock,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Copy,
  Mail,
  Phone,
  UserPlus,
  RefreshCw,
  Share2,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function GroupBookingsManagement() {
  const {
    groupBookings,
    loading,
    fetchGroupBookings,
    fetchGroupBookingById,
    createGroupBooking,
    updateGroupStatus,
    cancelGroupBooking,
    addGroupMember,
    updateGroupMember,
    removeGroupMember,
    updateMemberStatus,
    recordDepositPayment,
  } = useGroupBookings();

  const { packages, pricingTiers, getDiscountForSize } = useGroupPackages();

  const [selectedBooking, setSelectedBooking] = useState<GroupBooking | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [services, setServices] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);

  // Form state for creating new booking
  const [newBooking, setNewBooking] = useState({
    group_name: '',
    group_type: 'friends' as GroupType,
    lead_name: '',
    lead_email: '',
    lead_phone: '',
    total_members: 2,
    booking_date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    start_time: '10:00',
    scheduling_type: 'parallel',
    payment_type: 'single',
    special_requests: '',
  });

  // Form state for adding new member
  const [newMember, setNewMember] = useState({
    member_name: '',
    member_email: '',
    member_phone: '',
    service_id: '',
    staff_id: '',
    scheduled_time: '',
    notes: '',
  });

  // Fetch initial data
  useEffect(() => {
    fetchGroupBookings();
    fetchServices();
    fetchStaff();
  }, []);

  const fetchServices = async () => {
    const { data } = await supabase
      .from('services')
      .select('id, name, price, duration_minutes')
      .eq('is_active', true)
      .order('name');
    setServices(data || []);
  };

  const fetchStaff = async () => {
    const { data } = await supabase
      .from('staff')
      .select('id, first_name, last_name')
      .eq('status', 'active')
      .order('first_name');
    setStaff(data || []);
  };

  // Filter bookings
  const filteredBookings = groupBookings.filter((booking) => {
    const matchesSearch =
      booking.group_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.lead_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.lead_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.share_code?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesType = typeFilter === 'all' || booking.group_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Statistics
  const stats = {
    total: groupBookings.length,
    pending: groupBookings.filter((b) => b.status === 'pending').length,
    confirmed: groupBookings.filter((b) => b.status === 'confirmed').length,
    totalRevenue: groupBookings
      .filter((b) => b.status !== 'cancelled')
      .reduce((sum, b) => sum + (b.total_amount || 0), 0),
  };

  // Handle create booking
  const handleCreateBooking = async () => {
    const result = await createGroupBooking(newBooking);
    if (result) {
      setIsCreateDialogOpen(false);
      setNewBooking({
        group_name: '',
        group_type: 'friends',
        lead_name: '',
        lead_email: '',
        lead_phone: '',
        total_members: 2,
        booking_date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        start_time: '10:00',
        scheduling_type: 'parallel',
        payment_type: 'single',
        special_requests: '',
      });
      fetchGroupBookings();
    }
  };

  // Handle view booking details
  const handleViewBooking = async (booking: GroupBooking) => {
    const fullBooking = await fetchGroupBookingById(booking.id);
    if (fullBooking) {
      setSelectedBooking(fullBooking);
      setIsViewDialogOpen(true);
    }
  };

  // Handle add member
  const handleAddMember = async () => {
    if (!selectedBooking) return;

    const result = await addGroupMember({
      group_booking_id: selectedBooking.id,
      ...newMember,
      service_id: newMember.service_id || undefined,
      staff_id: newMember.staff_id || undefined,
    });

    if (result) {
      setIsAddMemberDialogOpen(false);
      setNewMember({
        member_name: '',
        member_email: '',
        member_phone: '',
        service_id: '',
        staff_id: '',
        scheduled_time: '',
        notes: '',
      });
      // Refresh the booking details
      const updated = await fetchGroupBookingById(selectedBooking.id);
      if (updated) setSelectedBooking(updated);
    }
  };

  // Handle copy share link
  const copyShareLink = (shareCode: string) => {
    const link = `${window.location.origin}/group-booking/join/${shareCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Share link copied to clipboard!');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Group Bookings</h1>
          <p className="text-muted-foreground">Manage group appointments and party bookings</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Group Booking
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or share code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="bridal">Bridal Party</SelectItem>
                <SelectItem value="birthday">Birthday</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
                <SelectItem value="friends">Friends</SelectItem>
                <SelectItem value="spa_day">Spa Day</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => fetchGroupBookings()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No group bookings found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Lead</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="font-medium">{booking.group_name || 'Unnamed Group'}</div>
                      <div className="text-xs text-muted-foreground">
                        {booking.share_code}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1">
                        {GROUP_TYPE_ICONS[booking.group_type]}
                        {GROUP_TYPE_LABELS[booking.group_type]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>{booking.lead_name}</div>
                      <div className="text-xs text-muted-foreground">{booking.lead_email}</div>
                    </TableCell>
                    <TableCell>
                      <div>{format(parseISO(booking.booking_date), 'MMM d, yyyy')}</div>
                      <div className="text-xs text-muted-foreground">{booking.start_time}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {booking.confirmed_members}/{booking.total_members}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">${booking.total_amount?.toFixed(2)}</div>
                      {booking.discount_percentage > 0 && (
                        <div className="text-xs text-green-600">
                          -{booking.discount_percentage}% off
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={GROUP_STATUS_COLORS[booking.status]}>
                        {GROUP_STATUS_LABELS[booking.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {PAYMENT_STATUS_LABELS[booking.payment_status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewBooking(booking)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyShareLink(booking.share_code)}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                        {booking.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateGroupStatus(booking.id, 'confirmed')}
                          >
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </Button>
                        )}
                        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => cancelGroupBooking(booking.id)}
                          >
                            <XCircle className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Group Booking Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Group Booking</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Group Name</Label>
              <Input
                value={newBooking.group_name}
                onChange={(e) => setNewBooking({ ...newBooking, group_name: e.target.value })}
                placeholder="e.g., Sarah's Bridal Party"
              />
            </div>
            <div className="space-y-2">
              <Label>Group Type</Label>
              <Select
                value={newBooking.group_type}
                onValueChange={(v) => setNewBooking({ ...newBooking, group_type: v as GroupType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(GROUP_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {GROUP_TYPE_ICONS[value as GroupType]} {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Lead Name *</Label>
              <Input
                value={newBooking.lead_name}
                onChange={(e) => setNewBooking({ ...newBooking, lead_name: e.target.value })}
                placeholder="Full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Lead Email *</Label>
              <Input
                type="email"
                value={newBooking.lead_email}
                onChange={(e) => setNewBooking({ ...newBooking, lead_email: e.target.value })}
                placeholder="email@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Lead Phone</Label>
              <Input
                value={newBooking.lead_phone}
                onChange={(e) => setNewBooking({ ...newBooking, lead_phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label>Total Members</Label>
              <Input
                type="number"
                min={2}
                max={20}
                value={newBooking.total_members}
                onChange={(e) => setNewBooking({ ...newBooking, total_members: parseInt(e.target.value) })}
              />
              {newBooking.total_members >= 2 && (
                <p className="text-xs text-green-600">
                  {getDiscountForSize(newBooking.total_members)}% group discount applies
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Booking Date</Label>
              <Input
                type="date"
                value={newBooking.booking_date}
                onChange={(e) => setNewBooking({ ...newBooking, booking_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                type="time"
                value={newBooking.start_time}
                onChange={(e) => setNewBooking({ ...newBooking, start_time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Scheduling Type</Label>
              <Select
                value={newBooking.scheduling_type}
                onValueChange={(v) => setNewBooking({ ...newBooking, scheduling_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parallel">Parallel (same time, different staff)</SelectItem>
                  <SelectItem value="sequential">Sequential (one after another)</SelectItem>
                  <SelectItem value="staggered">Staggered (overlapping)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Payment Type</Label>
              <Select
                value={newBooking.payment_type}
                onValueChange={(v) => setNewBooking({ ...newBooking, payment_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single (lead pays all)</SelectItem>
                  <SelectItem value="split">Split (each pays own)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Special Requests</Label>
              <Textarea
                value={newBooking.special_requests}
                onChange={(e) => setNewBooking({ ...newBooking, special_requests: e.target.value })}
                placeholder="Any special requirements or notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateBooking}
              disabled={!newBooking.lead_name || !newBooking.lead_email}
            >
              Create Group Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View/Edit Group Booking Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedBooking && (
                <>
                  {GROUP_TYPE_ICONS[selectedBooking.group_type]}
                  {selectedBooking.group_name || 'Group Booking'}
                  <Badge className={GROUP_STATUS_COLORS[selectedBooking.status]}>
                    {GROUP_STATUS_LABELS[selectedBooking.status]}
                  </Badge>
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <ScrollArea className="max-h-[70vh]">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="members">
                    Members ({selectedBooking.members?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="payment">Payment</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Share Code</Label>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded">
                          {selectedBooking.share_code}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyShareLink(selectedBooking.share_code)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Group Type</Label>
                      <p>{GROUP_TYPE_LABELS[selectedBooking.group_type]}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Date & Time</Label>
                      <p>
                        {format(parseISO(selectedBooking.booking_date), 'MMMM d, yyyy')} at{' '}
                        {selectedBooking.start_time}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Scheduling</Label>
                      <p className="capitalize">{selectedBooking.scheduling_type}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Lead Contact</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        {selectedBooking.lead_name}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        {selectedBooking.lead_email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        {selectedBooking.lead_phone || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {selectedBooking.special_requests && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2">Special Requests</h4>
                      <p className="text-muted-foreground">{selectedBooking.special_requests}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="members" className="space-y-4 mt-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      {selectedBooking.confirmed_members} of {selectedBooking.total_members} members
                      added
                    </p>
                    <Button size="sm" onClick={() => setIsAddMemberDialogOpen(true)}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Member
                    </Button>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Staff</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedBooking.members?.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {member.member_name}
                              {member.is_lead && (
                                <Badge variant="secondary" className="text-xs">
                                  Lead
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {member.member_email && (
                                <div className="text-muted-foreground">{member.member_email}</div>
                              )}
                              {member.member_phone && (
                                <div className="text-muted-foreground">{member.member_phone}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{member.service?.name || '-'}</TableCell>
                          <TableCell>
                            {member.staff
                              ? `${member.staff.first_name} ${member.staff.last_name}`
                              : '-'}
                          </TableCell>
                          <TableCell>${member.service_amount?.toFixed(2) || '0.00'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {MEMBER_STATUS_LABELS[member.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {member.status === 'pending' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => updateMemberStatus(member.id, 'confirmed')}
                                >
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                </Button>
                              )}
                              {member.status === 'confirmed' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => updateMemberStatus(member.id, 'checked_in')}
                                >
                                  <CheckCircle className="w-4 h-4 text-slate-900" />
                                </Button>
                              )}
                              {!member.is_lead && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={async () => {
                                    await removeGroupMember(member.id);
                                    const updated = await fetchGroupBookingById(selectedBooking.id);
                                    if (updated) setSelectedBooking(updated);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="payment" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Payment Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>${selectedBooking.subtotal_amount?.toFixed(2)}</span>
                        </div>
                        {selectedBooking.discount_percentage > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Group Discount ({selectedBooking.discount_percentage}%):</span>
                            <span>-${selectedBooking.discount_amount?.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold border-t pt-2">
                          <span>Total:</span>
                          <span>${selectedBooking.total_amount?.toFixed(2)}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Payment Status</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span>Deposit Required (50%):</span>
                          <span>${selectedBooking.deposit_required?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span>Deposit Paid:</span>
                          <span>${selectedBooking.deposit_paid?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-2">
                          <span>Balance Due:</span>
                          <span>${selectedBooking.balance_due?.toFixed(2)}</span>
                        </div>
                        <Badge className="mt-2">
                          {PAYMENT_STATUS_LABELS[selectedBooking.payment_status]}
                        </Badge>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </ScrollArea>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedBooking?.status === 'pending' && (
              <Button onClick={() => updateGroupStatus(selectedBooking.id, 'confirmed')}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm Booking
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Group Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Member Name *</Label>
              <Input
                value={newMember.member_name}
                onChange={(e) => setNewMember({ ...newMember, member_name: e.target.value })}
                placeholder="Full name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newMember.member_email}
                  onChange={(e) => setNewMember({ ...newMember, member_email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={newMember.member_phone}
                  onChange={(e) => setNewMember({ ...newMember, member_phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Service</Label>
              <Select
                value={newMember.service_id}
                onValueChange={(v) => setNewMember({ ...newMember, service_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - ${service.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Staff Member</Label>
              <Select
                value={newMember.staff_id}
                onValueChange={(v) => setNewMember({ ...newMember, staff_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Assign staff (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.first_name} {s.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={newMember.notes}
                onChange={(e) => setNewMember({ ...newMember, notes: e.target.value })}
                placeholder="Any notes for this member..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMemberDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember} disabled={!newMember.member_name}>
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
