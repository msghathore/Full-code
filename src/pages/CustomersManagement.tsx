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
  UserPlus,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

gsap.registerPlugin(ScrollTrigger);

type CustomerWithStats = Tables<'customers'> & {
  totalSpent: number;
  totalBookings: number;
  segment: 'VIP' | 'Regular' | 'New' | 'Inactive';
  rating: number;
  recentBookings?: Array<{
    service: string;
    date: string;
    amount: number;
  }>;
};

const CustomersManagement = () => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('all');
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      if (!session) {
        setError('Please log in to access customer management.');
        setLoading(false);
        return;
      }
      fetchCustomers();
    };
    checkAuth();
  }, []);

  // Fetch customers with stats
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (customersError) throw customersError;

      // For each customer, calculate stats
      const customersWithStats: CustomerWithStats[] = await Promise.all(
        (customersData || []).map(async (customer) => {
          // Get total spent and bookings from transactions
          const { data: transactions } = await supabase
            .from('transactions')
            .select('total_amount')
            .eq('customer_id', customer.id);

          const totalSpent = transactions?.reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0;
          const totalBookings = transactions?.length || 0;

          // Determine segment based on loyalty points and activity
          let segment: 'VIP' | 'Regular' | 'New' | 'Inactive' = 'Regular';
          if ((customer.loyalty_points || 0) >= 1000) {
            segment = 'VIP';
          } else if (totalBookings === 0) {
            segment = 'New';
          } else if (!customer.last_visit || new Date(customer.last_visit) < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) {
            segment = 'Inactive';
          }

          // Mock rating for now (could be calculated from feedback)
          const rating = 4.5;

          return {
            ...customer,
            totalSpent,
            totalBookings,
            segment,
            rating,
            recentBookings: [] // Could fetch recent appointments here
          };
        })
      );

      setCustomers(customersWithStats);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get customer insights
  const getCustomerInsights = (customers: CustomerWithStats[]) => {
    const segments = customers.reduce((acc, customer) => {
      acc[customer.segment] = (acc[customer.segment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { segments };
  };

  const customerInsights = getCustomerInsights(customers);

  // Filter customers based on search and segment
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()));
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
  }, [customers]);

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

  const getSegmentColor = (segment: string) => {
    switch (segment.toLowerCase()) {
      case 'vip':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
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

  const CustomerCard = ({ customer }: { customer: CustomerWithStats }) => (
    <Card className="frosted-glass border-white/10 hover:border-white/20 transition-all">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src="" />
              <AvatarFallback className="bg-white/10 text-white">
                {customer.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold luxury-glow text-lg">{customer.name}</h3>
              <p className="text-sm text-muted-foreground">{customer.email || 'No email'}</p>
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
            <Award className="h-5 w-5 mx-auto mb-1 text-amber-400" />
            <p className="text-lg font-bold luxury-glow">{customer.loyalty_points || 0}</p>
            <p className="text-xs text-muted-foreground">Points</p>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <p className="text-lg font-bold luxury-glow">
              {customer.last_visit ? formatDate(customer.last_visit) : 'Never'}
            </p>
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
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-white/10 text-white">
                      {customer.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold luxury-glow">{customer.name}</h3>
                    <p className="text-muted-foreground">{customer.email || 'No email'}</p>
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
                        <span className="text-sm">{customer.email || 'No email'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{customer.phone || 'No phone'}</span>
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
                        <span className="font-medium">{customer.loyalty_points || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Member Since</span>
                        <span className="font-medium">{formatDate(customer.created_at || '')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Recent Activity</h4>
                  <div className="space-y-2">
                    {customer.recentBookings && customer.recentBookings.length > 0 ? (
                      customer.recentBookings.slice(0, 3).map((booking, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{booking.service}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(booking.date)}</p>
                          </div>
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            {formatCurrency(booking.amount)}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No recent bookings</p>
                    )}
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

  if (!isAuthenticated) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="frosted-glass border-white/10 max-w-md">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
              <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
              <p className="text-muted-foreground">
                Please log in to access customer management features.
              </p>
            </CardContent>
          </Card>
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
            <h1 className="text-4xl font-serif luxury-glow mb-2">Customers Management</h1>
            <p className="text-muted-foreground">Manage customer profiles and relationships</p>
          </div>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <Card className="frosted-glass border-white/10">
            <CardContent className="p-12 text-center">
              <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-white" />
              <p className="text-muted-foreground">Loading customers...</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="frosted-glass border-white/10">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
              <h3 className="text-lg font-medium mb-2">Error Loading Customers</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchCustomers} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Customer Insights */}
        {!loading && !error && (
          <>
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
                        {customers.length > 0 ? Math.round((count / customers.length) * 100) : 0}% of total
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

            {filteredCustomers.length === 0 && !loading && (
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
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default CustomersManagement;