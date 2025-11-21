import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AdminLayout from '@/components/AdminLayout';
import {
  Users,
  Search,
  Filter,
  Eye,
  Edit,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Star,
  Award,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { mockCustomers, getCustomerInsights } from '@/lib/mock-bi-data';

gsap.registerPlugin(ScrollTrigger);

const CustomersManagement = () => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('all');

  // Get customer insights
  const customerInsights = getCustomerInsights(mockCustomers);

  // Filter customers based on search and segment
  const filteredCustomers = mockCustomers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSegment = segmentFilter === 'all' || customer.segment === segmentFilter;
    return matchesSearch && matchesSegment;
  });

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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSegmentColor = (segment: string) => {
    switch (segment.toLowerCase()) {
      case 'vip':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'regular':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'new':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'inactive':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const CustomerCard = ({ customer }: { customer: any }) => (
    <Card className="frosted-glass border-white/10 hover:border-white/20 transition-all">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={customer.avatar} />
              <AvatarFallback className="bg-white/10 text-white">
                {customer.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold luxury-glow text-lg">{customer.name}</h3>
              <p className="text-sm text-muted-foreground">{customer.email}</p>
              <Badge className={getSegmentColor(customer.segment)} style={{ marginTop: '4px' }}>
                {customer.segment}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 mb-1">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium">{customer.rating}/5</span>
            </div>
            <p className="text-xs text-muted-foreground">{customer.totalBookings} bookings</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <DollarSign className="h-5 w-5 mx-auto mb-1 text-green-400" />
            <p className="text-lg font-bold luxury-glow">{formatCurrency(customer.totalSpent)}</p>
            <p className="text-xs text-muted-foreground">Total Spent</p>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <Calendar className="h-5 w-5 mx-auto mb-1 text-blue-400" />
            <p className="text-lg font-bold luxury-glow">{customer.totalBookings}</p>
            <p className="text-xs text-muted-foreground">Bookings</p>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <Award className="h-5 w-5 mx-auto mb-1 text-purple-400" />
            <p className="text-lg font-bold luxury-glow">{customer.loyaltyPoints}</p>
            <p className="text-xs text-muted-foreground">Points</p>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <p className="text-lg font-bold luxury-glow">{customer.lastVisit}</p>
            <p className="text-xs text-muted-foreground">Last Visit</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="frosted-glass border-white/20 max-w-2xl">
              <DialogHeader>
                <DialogTitle>Customer Profile</DialogTitle>
                <DialogDescription>
                  Detailed information for {customer.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={customer.avatar} />
                    <AvatarFallback className="bg-white/10 text-white">
                      {customer.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold luxury-glow">{customer.name}</h3>
                    <p className="text-muted-foreground">{customer.email}</p>
                    <Badge className={getSegmentColor(customer.segment)}>
                      {customer.segment} Customer
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{customer.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Account Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Spent</span>
                        <span className="font-medium">{formatCurrency(customer.totalSpent)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Bookings</span>
                        <span className="font-medium">{customer.totalBookings}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Loyalty Points</span>
                        <span className="font-medium">{customer.loyaltyPoints}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Member Since</span>
                        <span className="font-medium">{formatDate(customer.joinDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Recent Activity</h4>
                  <div className="space-y-2">
                    {customer.recentBookings?.slice(0, 3).map((booking: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{booking.service}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(booking.date)}</p>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          {formatCurrency(booking.amount)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Contact
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <div ref={dashboardRef} className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif luxury-glow mb-2">Customers Management</h1>
            <p className="text-muted-foreground">Manage customer profiles and relationships</p>
          </div>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>

        {/* Customer Insights */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Object.entries(customerInsights.segments).map(([segment, count]) => (
            <Card key={segment} className="frosted-glass border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge className={getSegmentColor(segment)}>
                    {segment}
                  </Badge>
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold luxury-glow">{count}</p>
                  <p className="text-sm text-muted-foreground">customers</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((count / mockCustomers.length) * 100)}% of total
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="frosted-glass border-white/10">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/5 border-white/20"
                  />
                </div>
              </div>
              <Select value={segmentFilter} onValueChange={setSegmentFilter}>
                <SelectTrigger className="w-full sm:w-48 bg-white/5 border-white/20">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by segment" />
                </SelectTrigger>
                <SelectContent className="frosted-glass border-white/20">
                  <SelectItem value="all">All Segments</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Customer List */}
        <div className="space-y-4">
          {filteredCustomers.map((customer) => (
            <CustomerCard key={customer.id} customer={customer} />
          ))}
        </div>

        {filteredCustomers.length === 0 && (
          <Card className="frosted-glass border-white/10">
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No customers found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default CustomersManagement;