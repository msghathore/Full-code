import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navigation } from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { 
  ShoppingBag, 
  Calendar, 
  Star, 
  Award, 
  Search, 
  Filter,
  Download,
  Eye,
  TrendingUp,
  Clock,
  DollarSign,
  Gift,
  Users,
  Bell,
  Settings,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Package,
  Camera,
  Heart,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

gsap.registerPlugin(ScrollTrigger);

const Dashboard = () => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [userProfile, setUserProfile] = useState({
    name: 'Loading...',
    email: 'Loading...',
    memberSince: '2022',
    avatar: '/images/client-1.jpg'
  });
  const { toast } = useToast();

  const loyaltyPoints = {
    current: 2847,
    available: 2456,
    pending: 391,
    lifetime: 5694,
    nextTier: 3000,
    progress: 78
  };

  const purchaseHistory = [
    {
      id: 'ORD-001',
      date: '2024-03-15',
      items: ['Luxury Hair Serum', 'Premium Face Cream'],
      total: 209,
      status: 'delivered',
      tracking: 'TRK123456789'
    },
    {
      id: 'ORD-002',
      date: '2024-03-10',
      items: ['Nail Polish Set', 'Hydrating Shampoo'],
      total: 110,
      status: 'in-transit',
      tracking: 'TRK987654321'
    },
    {
      id: 'ORD-003',
      date: '2024-03-05',
      items: ['Anti-Aging Serum'],
      total: 150,
      status: 'processing',
      tracking: null
    }
  ];

  const bookingHistory = [
    {
      id: 'BK-001',
      date: '2024-03-20',
      time: '14:30',
      service: 'Luxury Hair Styling',
      staff: 'Maria Rodriguez',
      duration: '90 min',
      price: 120,
      status: 'confirmed',
      location: 'Downtown Salon'
    },
    {
      id: 'BK-002',
      date: '2024-03-18',
      time: '16:00',
      service: 'Deep Tissue Massage',
      staff: 'David Chen',
      duration: '60 min',
      price: 95,
      status: 'completed',
      location: 'Spa Center'
    },
    {
      id: 'BK-003',
      date: '2024-03-25',
      time: '10:00',
      service: 'Facial Treatment',
      staff: 'Emma Wilson',
      duration: '75 min',
      price: 85,
      status: 'upcoming',
      location: 'Downtown Salon'
    }
  ];

  const loyaltyHistory = [
    {
      date: '2024-03-15',
      type: 'earned',
      points: 42,
      description: 'Purchase: Luxury Hair Serum',
      transactionId: 'LTP-001'
    },
    {
      date: '2024-03-12',
      type: 'redeemed',
      points: -150,
      description: 'Free Facial Treatment',
      transactionId: 'LTR-002'
    },
    {
      date: '2024-03-10',
      type: 'earned',
      points: 22,
      description: 'Service: Deep Tissue Massage',
      transactionId: 'LTP-003'
    }
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "not found"
          console.error('Error fetching profile:', profileError);
        }

        setUserProfile({
          name: profile?.full_name || `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || 'User',
          email: user.email || 'No email',
          memberSince: profile?.created_at ? new Date(profile.created_at).getFullYear().toString() : '2022',
          avatar: profile?.avatar_url || '/images/client-1.jpg'
        });
      }
    };

    fetchUserData();
  }, []);

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

    // Animate stats counter
    if (statsRef.current) {
      const stats = statsRef.current.querySelectorAll('.stat-value');
      stats.forEach((stat, index) => {
        gsap.fromTo(stat,
          { opacity: 0, scale: 0.8 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            delay: index * 0.1,
            ease: "back.out(1.7)"
          }
        );
      });
    }

    // Animate sidebar
    if (sidebarRef.current) {
      gsap.fromTo(sidebarRef.current,
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );
    }
  }, []);

  const animateCounter = (element: HTMLElement, end: number, duration: number = 2000) => {
    gsap.fromTo(element, 
      { innerText: 0 }, 
      {
        innerText: end,
        duration: duration / 1000,
        ease: "power2.out",
        snap: { innerText: 1 },
        onUpdate: function() {
          element.innerText = Math.floor(Number(element.innerText)).toLocaleString();
        }
      }
    );
  };

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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in-transit':
      case 'confirmed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'processing':
      case 'upcoming':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <div className="pt-24 px-4 md:px-8 flex gap-8">
        {/* Sidebar */}
        <div ref={sidebarRef} className="w-64 hidden lg:block">
          <Card className="frosted-glass border-white/10 sticky top-32">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={userProfile.avatar} />
                  <AvatarFallback className="bg-white/10 text-white">
                    {userProfile.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-serif text-lg luxury-glow">{userProfile.name}</h3>
                  <p className="text-sm text-muted-foreground">Member since {userProfile.memberSince}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{userProfile.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
              </div>
              
              <Separator className="bg-white/10" />
              
              <nav className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start hover:bg-white/10"
                  onClick={() => setActiveTab('overview')}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Overview
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start hover:bg-white/10"
                  onClick={() => setActiveTab('purchases')}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Purchase History
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start hover:bg-white/10"
                  onClick={() => setActiveTab('bookings')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Booking History
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start hover:bg-white/10"
                  onClick={() => setActiveTab('loyalty')}
                >
                  <Award className="h-4 w-4 mr-2" />
                  Loyalty Points
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start hover:bg-white/10"
                  onClick={() => setActiveTab('notifications')}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start hover:bg-white/10"
                  onClick={() => setActiveTab('settings')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div ref={dashboardRef} className="flex-1 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-serif luxury-glow mb-2">Customer Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {userProfile.name.split(' ')[0]}!</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Camera className="h-4 w-4 mr-2" />
                    Share Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="frosted-glass border-white/20">
                  <DialogHeader>
                    <DialogTitle>Share Your Profile</DialogTitle>
                    <DialogDescription>
                      Share your loyalty achievements and booking history with friends.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Button className="w-full">
                      <Share2 className="h-4 w-4 mr-2" />
                      Copy Share Link
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Quick Stats */}
          <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="frosted-glass border-white/10 hover:border-white/20 transition-all cursor-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Loyalty Points</p>
                    <p className="stat-value text-2xl font-bold luxury-glow">{loyaltyPoints.current.toLocaleString()}</p>
                  </div>
                  <Award className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="frosted-glass border-white/10 hover:border-white/20 transition-all cursor-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="stat-value text-2xl font-bold luxury-glow">23</p>
                  </div>
                  <ShoppingBag className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="frosted-glass border-white/10 hover:border-white/20 transition-all cursor-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Bookings</p>
                    <p className="stat-value text-2xl font-bold luxury-glow">12</p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="frosted-glass border-white/10 hover:border-white/20 transition-all cursor-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="stat-value text-2xl font-bold luxury-glow">$2,847</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="frosted-glass border-white/10">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white/10">Overview</TabsTrigger>
              <TabsTrigger value="purchases" className="data-[state=active]:bg-white/10">Purchases</TabsTrigger>
              <TabsTrigger value="bookings" className="data-[state=active]:bg-white/10">Bookings</TabsTrigger>
              <TabsTrigger value="loyalty" className="data-[state=active]:bg-white/10">Loyalty</TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-white/10">Notifications</TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-white/10">Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {purchaseHistory.slice(0, 3).map((purchase) => (
                      <div key={purchase.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <ShoppingBag className="h-5 w-5 text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium">{purchase.id}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(purchase.date)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(purchase.total)}</p>
                          <Badge className={getStatusColor(purchase.status)}>
                            {purchase.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Loyalty Progress */}
                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="h-5 w-5" />
                      Loyalty Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Next Tier</span>
                        <span className="text-sm">{loyaltyPoints.current} / {loyaltyPoints.nextTier}</span>
                      </div>
                      <Progress value={loyaltyPoints.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-2">
                        {loyaltyPoints.nextTier - loyaltyPoints.current} points to next tier
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <p className="text-lg font-bold luxury-glow">{loyaltyPoints.available}</p>
                        <p className="text-xs text-muted-foreground">Available</p>
                      </div>
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <p className="text-lg font-bold luxury-glow">{loyaltyPoints.pending}</p>
                        <p className="text-xs text-muted-foreground">Pending</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Purchase History Tab */}
            <TabsContent value="purchases" className="space-y-6">
              <Card className="frosted-glass border-white/10">
                <CardHeader>
                  <CardTitle>Purchase History</CardTitle>
                  <CardDescription>View and track all your product purchases</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          placeholder="Search orders..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-white/5 border-white/20"
                        />
                      </div>
                    </div>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-full sm:w-48 bg-white/5 border-white/20">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter status" />
                      </SelectTrigger>
                      <SelectContent className="frosted-glass border-white/20">
                        <SelectItem value="all">All Orders</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="in-transit">In Transit</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Order List */}
                  <div className="space-y-4">
                    {purchaseHistory.map((order) => (
                      <div key={order.id} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all cursor-hover">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold luxury-glow">{order.id}</h3>
                            <p className="text-sm text-muted-foreground">{formatDate(order.date)}</p>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between">
                              <span className="text-sm">{item}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                          <span className="font-semibold">{formatCurrency(order.total)}</span>
                          <div className="flex gap-2">
                            {order.tracking && (
                              <Button variant="outline" size="sm">
                                <Package className="h-4 w-4 mr-2" />
                                Track
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Booking History Tab */}
            <TabsContent value="bookings" className="space-y-6">
              <Card className="frosted-glass border-white/10">
                <CardHeader>
                  <CardTitle>Booking History</CardTitle>
                  <CardDescription>Manage your salon and spa appointments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {bookingHistory.map((booking) => (
                    <div key={booking.id} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all cursor-hover">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold luxury-glow">{booking.service}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(booking.date)} at {booking.time}
                          </p>
                          <p className="text-sm text-muted-foreground">{booking.location}</p>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Staff</p>
                          <p className="font-medium">{booking.staff}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Duration</p>
                          <p className="font-medium">{booking.duration}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Price</p>
                          <p className="font-medium">{formatCurrency(booking.price)}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Calendar className="h-4 w-4 mr-2" />
                          Reschedule
                        </Button>
                        <Button variant="outline" size="sm">
                          <Heart className="h-4 w-4 mr-2" />
                          Rate Service
                        </Button>
                        {booking.status === 'upcoming' && (
                          <Button variant="outline" size="sm" className="border-red-500/20 hover:bg-red-500/10 text-red-400">
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Loyalty Points Tab */}
            <TabsContent value="loyalty" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Loyalty Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <p className="text-4xl font-bold luxury-glow mb-2">{loyaltyPoints.current.toLocaleString()}</p>
                      <p className="text-muted-foreground">Current Points</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Available Points</span>
                        <span className="font-medium">{loyaltyPoints.available.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Pending Points</span>
                        <span className="font-medium">{loyaltyPoints.pending.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Lifetime Earned</span>
                        <span className="font-medium">{loyaltyPoints.lifetime.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-white/10">
                      <p className="text-sm text-muted-foreground mb-3">Quick Redeem Options</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm">
                          Free Facial (150 pts)
                        </Button>
                        <Button variant="outline" size="sm">
                          10% Off (200 pts)
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle>Point History</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loyaltyHistory.map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${transaction.type === 'earned' ? 'text-green-400' : 'text-red-400'}`}>
                            {transaction.type === 'earned' ? '+' : ''}{transaction.points} pts
                          </p>
                          <p className="text-xs text-muted-foreground">{transaction.transactionId}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card className="frosted-glass border-white/10">
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Manage your notification preferences and view recent alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Notification Preferences</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Appointment Reminders</p>
                          <p className="text-sm text-muted-foreground">Get notified about upcoming appointments</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Order Updates</p>
                          <p className="text-sm text-muted-foreground">Receive updates on your orders</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Promotional Offers</p>
                          <p className="text-sm text-muted-foreground">Stay updated with exclusive deals</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Loyalty Rewards</p>
                          <p className="text-sm text-muted-foreground">Notifications about points and rewards</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Recent Notifications</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <p className="font-medium">Appointment Confirmed</p>
                        <p className="text-sm text-muted-foreground">Your facial treatment on March 25th has been confirmed.</p>
                        <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <p className="font-medium">Order Shipped</p>
                        <p className="text-sm text-muted-foreground">Your order ORD-003 has been shipped and is on its way.</p>
                        <p className="text-xs text-muted-foreground mt-1">1 day ago</p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <p className="font-medium">Loyalty Points Earned</p>
                        <p className="text-sm text-muted-foreground">You earned 42 points from your recent purchase.</p>
                        <p className="text-xs text-muted-foreground mt-1">3 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card className="frosted-glass border-white/10">
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences and personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-white/70 mb-2 block">First Name</label>
                        <Input defaultValue="Sarah" className="bg-white/5 border-white/20" />
                      </div>
                      <div>
                        <label className="text-sm text-white/70 mb-2 block">Last Name</label>
                        <Input defaultValue="Johnson" className="bg-white/5 border-white/20" />
                      </div>
                      <div>
                        <label className="text-sm text-white/70 mb-2 block">Email</label>
                        <Input defaultValue={userProfile.email} className="bg-white/5 border-white/20" disabled />
                      </div>
                      <div>
                        <label className="text-sm text-white/70 mb-2 block">Phone</label>
                        <Input defaultValue="+1 (555) 123-4567" className="bg-white/5 border-white/20" />
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Security</h3>
                    <div className="space-y-4">
                      <Button variant="outline">
                        Change Password
                      </Button>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Two-Factor Authentication</p>
                          <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Privacy</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Profile Visibility</p>
                          <p className="text-sm text-muted-foreground">Make your profile visible to other users</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Data Sharing</p>
                          <p className="text-sm text-muted-foreground">Allow sharing of anonymized data for improvements</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button>Save Changes</Button>
                    <Button variant="outline">Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;