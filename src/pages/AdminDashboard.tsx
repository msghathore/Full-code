import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AdminLayout from '@/components/AdminLayout';
import {
  BarChart3,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  Clock,
  Star
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  mockBookings,
  mockCustomers,
  mockRevenue,
  mockFeedback,
  calculateNPS
} from '@/lib/mock-bi-data';

gsap.registerPlugin(ScrollTrigger);

const AdminDashboard = () => {
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Calculate key metrics
  const totalRevenue = mockRevenue.reduce((sum, r) => sum + r.revenue, 0);
  const totalBookings = mockRevenue.reduce((sum, r) => sum + r.bookings, 0);
  const activeCustomers = mockCustomers.length;
  const nps = calculateNPS(mockFeedback);

  // Recent activity
  const recentBookings = mockBookings.slice(0, 5);
  const recentRevenue = mockRevenue.slice(-7);

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
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <AdminLayout>
      <div ref={dashboardRef} className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif luxury-glow mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome to your business management center</p>
          </div>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            Live Data
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="frosted-glass border-white/10 hover:border-white/20 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold luxury-glow">{formatCurrency(totalRevenue)}</p>
                  <p className="text-xs text-green-400">+12.5% from last month</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="frosted-glass border-white/10 hover:border-white/20 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl font-bold luxury-glow">{totalBookings}</p>
                  <p className="text-xs text-blue-400">+8.2% from last month</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="frosted-glass border-white/10 hover:border-white/20 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Customers</p>
                  <p className="text-2xl font-bold luxury-glow">{activeCustomers}</p>
                  <p className="text-xs text-yellow-400">78.5% retention rate</p>
                </div>
                <Users className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="frosted-glass border-white/10 hover:border-white/20 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Net Promoter Score</p>
                  <p className="text-2xl font-bold luxury-glow">{nps}</p>
                  <p className="text-xs text-purple-400">Based on {mockFeedback.length} reviews</p>
                </div>
                <Star className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card className="frosted-glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                    <p className="text-sm font-medium">View Bookings</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <Users className="h-6 w-6 mx-auto mb-2 text-green-400" />
                    <p className="text-sm font-medium">Manage Customers</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-400" />
                    <p className="text-sm font-medium">View Analytics</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer" onClick={() => window.location.href = '/admin/services'}>
                  <CardContent className="p-4 text-center">
                    <Activity className="h-6 w-6 mx-auto mb-2 text-orange-400" />
                    <p className="text-sm font-medium">Manage Services</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-yellow-400" />
                    <p className="text-sm font-medium">Revenue Report</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="frosted-glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest bookings and updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{booking.service}</p>
                      <p className="text-xs text-muted-foreground">
                        {booking.customer} • {formatDate(booking.date)}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    {formatCurrency(booking.price)}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="frosted-glass border-white/10">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system health and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-green-400">Online</span>
                </div>
                <p className="text-sm text-muted-foreground">Booking System</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-green-400">Online</span>
                </div>
                <p className="text-sm text-muted-foreground">Payment Processing</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-green-400">Online</span>
                </div>
                <p className="text-sm text-muted-foreground">Database</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;