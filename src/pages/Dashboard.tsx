import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuthWrapper } from '@/components/auth/AuthWrapper';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { getUserDashboardStats, getUserAppointments, getUserOrders, getLoyaltyProgress } from '@/lib/dashboard-data';
import type { DashboardStats, UserAppointment, UserOrder } from '@/lib/dashboard-data';

const Dashboard = () => {
   console.log('Dashboard component rendering');
   const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
   const [activeTab, setActiveTab] = useState('overview');
   const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
     loyaltyPoints: 0,
     totalOrders: 0,
     totalBookings: 0,
     totalSpent: 0
   });
   const [appointments, setAppointments] = useState<UserAppointment[]>([]);
   const [orders, setOrders] = useState<UserOrder[]>([]);
   const [loyaltyInfo, setLoyaltyInfo] = useState<any>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);

   const [userEmail, setUserEmail] = useState<string | null>(null);

   // Find or create the Supabase profile for this Clerk user
   useEffect(() => {
     const syncUserProfile = async () => {
       if (!clerkLoaded || !clerkUser) return;

       const email = clerkUser.primaryEmailAddress?.emailAddress;
       console.log('Dashboard: Clerk user email:', email);

       if (!email) return;
       setUserEmail(email);

       // Look up profile by email in profiles
       const { data: profile, error: profileError } = await supabase
         .from('profiles')
         .select('id')
         .eq('email', email)
         .single();

       if (profile) {
         console.log('Dashboard: Found existing profile by email:', profile.id);
         setSupabaseUserId(profile.id);
         return;
       }

       // Try to get from Supabase auth session
       const { data: { session } } = await supabase.auth.getSession();
       if (session?.user) {
         console.log('Dashboard: Using Supabase auth user:', session.user.id);
         setSupabaseUserId(session.user.id);
         return;
       }

       console.log('Dashboard: No Supabase profile found, will use email-based lookup');
       // Set a special marker to indicate email-based lookup
       setSupabaseUserId('email:' + email);
     };

     syncUserProfile();
   }, [clerkLoaded, clerkUser]);

   useEffect(() => {
     const fetchDashboardData = async () => {
       // Wait for user ID to be resolved
       if (!supabaseUserId) {
         console.log('Dashboard: Waiting for user ID...');
         return;
       }

       try {
         setLoading(true);
         setError(null);

         console.log('Dashboard: Fetching data for user ID:', supabaseUserId);

         // Fetch all dashboard data in parallel, passing the user ID
         const [stats, userAppointments, userOrders, loyaltyProgress] = await Promise.all([
           getUserDashboardStats(supabaseUserId),
           getUserAppointments(5, supabaseUserId),
           getUserOrders(5, supabaseUserId),
           getLoyaltyProgress(supabaseUserId)
         ]);

         setDashboardStats(stats);
         setAppointments(userAppointments);
         setOrders(userOrders);
         setLoyaltyInfo(loyaltyProgress);
       } catch (err) {
         console.error('Error fetching dashboard data:', err);
         setError('Failed to load dashboard data. Please try again.');
       } finally {
         setLoading(false);
       }
     };

     fetchDashboardData();
   }, [supabaseUserId]);

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-black text-white">

        <div className="pt-24 px-4 md:px-8">
          {/* Main Content */}
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-serif luxury-glow mb-2">Customer Dashboard</h1>
              <p className="text-muted-foreground">Welcome back!</p>
            </div>

            {/* Main Navigation Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="frosted-glass border-white/10 w-full justify-center gap-2 p-2">
                <TabsTrigger
                  value="overview"
                  className="relative px-6 py-3 text-white/60 transition-all duration-300 ease-out rounded-lg hover:text-white/80 hover:bg-white/10 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:shadow-[0_0_25px_rgba(255,255,255,0.6),0_0_50px_rgba(255,255,255,0.3)]"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="purchases"
                  className="relative px-6 py-3 text-white/60 transition-all duration-300 ease-out rounded-lg hover:text-white/80 hover:bg-white/10 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:shadow-[0_0_25px_rgba(255,255,255,0.6),0_0_50px_rgba(255,255,255,0.3)]"
                >
                  Purchases
                </TabsTrigger>
                <TabsTrigger
                  value="bookings"
                  className="relative px-6 py-3 text-white/60 transition-all duration-300 ease-out rounded-lg hover:text-white/80 hover:bg-white/10 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:shadow-[0_0_25px_rgba(255,255,255,0.6),0_0_50px_rgba(255,255,255,0.3)]"
                >
                  Bookings
                </TabsTrigger>
                <TabsTrigger
                  value="loyalty"
                  className="relative px-6 py-3 text-white/60 transition-all duration-300 ease-out rounded-lg hover:text-white/80 hover:bg-white/10 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:shadow-[0_0_25px_rgba(255,255,255,0.6),0_0_50px_rgba(255,255,255,0.3)]"
                >
                  Loyalty
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab Content */}
              <TabsContent value="overview" className="space-y-8">
                {/* Key Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="frosted-glass border-white/10">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Loyalty Points</p>
                        <p className="text-2xl font-bold luxury-glow">
                          {loading ? '...' : dashboardStats.loyaltyPoints.toLocaleString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="frosted-glass border-white/10">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Total Orders</p>
                        <p className="text-2xl font-bold luxury-glow">
                          {loading ? '...' : dashboardStats.totalOrders}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="frosted-glass border-white/10">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Bookings</p>
                        <p className="text-2xl font-bold luxury-glow">
                          {loading ? '...' : dashboardStats.totalBookings}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="frosted-glass border-white/10">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Total Spent</p>
                        <p className="text-2xl font-bold luxury-glow">
                          {loading ? '...' : `$${dashboardStats.totalSpent.toFixed(2)}`}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Dashboard Overview Section */}
                <div className="space-y-6">
                  <h2 className="text-3xl font-serif luxury-glow">Dashboard Overview</h2>
                  {loading ? (
                    <p className="text-muted-foreground">Loading your dashboard data...</p>
                  ) : error ? (
                    <p className="text-red-400">{error}</p>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        Welcome back! You have {dashboardStats.loyaltyPoints} loyalty points and have spent ${dashboardStats.totalSpent.toFixed(2)} with us.
                      </p>
                      {loyaltyInfo && (
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <h3 className="text-lg font-semibold mb-2">Loyalty Status</h3>
                          <p className="text-sm text-muted-foreground">
                            Current Tier: <span className="luxury-glow">{loyaltyInfo.currentTierName}</span>
                            {loyaltyInfo.nextTierName !== loyaltyInfo.currentTierName && (
                              <> • {loyaltyInfo.pointsToNextTier} points to {loyaltyInfo.nextTierName}</>
                            )}
                          </p>
                        </div>
                      )}
                      {appointments.length > 0 && (
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
                          <p className="text-sm text-muted-foreground">
                            Your next appointment: {appointments[0].service} on {new Date(appointments[0].date).toLocaleDateString()} at {appointments[0].time}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Purchases Tab Content */}
              <TabsContent value="purchases" className="space-y-6">
                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle>Order History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <p className="text-muted-foreground">Loading your orders...</p>
                    ) : orders.length > 0 ? (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div key={order.id} className="border-b border-white/10 pb-4 last:border-b-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold">{order.id}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(order.date).toLocaleDateString()} • {order.items.join(', ')}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">${order.amount.toFixed(2)}</p>
                                <p className="text-sm text-muted-foreground capitalize">{order.status}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No recent purchases found.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Bookings Tab Content */}
              <TabsContent value="bookings" className="space-y-6">
                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle>Booking History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <p className="text-muted-foreground">Loading your appointments...</p>
                    ) : appointments.length > 0 ? (
                      <div className="space-y-4">
                        {appointments.map((appointment) => (
                          <div key={appointment.id} className="border-b border-white/10 pb-4 last:border-b-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold">{appointment.service}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                                </p>
                                <p className="text-sm text-muted-foreground">with {appointment.staff}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">${appointment.price.toFixed(2)}</p>
                                <p className="text-sm text-muted-foreground capitalize">{appointment.status}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No upcoming or past bookings found.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Loyalty Tab Content */}
              <TabsContent value="loyalty" className="space-y-6">
                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle>Loyalty Program Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <p className="text-muted-foreground">Loading loyalty information...</p>
                    ) : loyaltyInfo ? (
                      <div className="space-y-4">
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <h3 className="text-lg font-semibold mb-2">Your Status</h3>
                          <p className="text-muted-foreground">
                            Current Tier: <span className="luxury-glow font-semibold">{loyaltyInfo.currentTierName}</span>
                          </p>
                          <p className="text-muted-foreground">
                            Points Available: <span className="luxury-glow font-semibold">{loyaltyInfo.available.toLocaleString()}</span>
                          </p>
                          {loyaltyInfo.nextTierName !== loyaltyInfo.currentTierName && (
                            <p className="text-muted-foreground">
                              Points to Next Tier: <span className="text-white font-semibold">{loyaltyInfo.pointsToNextTier.toLocaleString()}</span>
                            </p>
                          )}
                        </div>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <h3 className="text-lg font-semibold mb-2">How It Works</h3>
                          <p className="text-muted-foreground">Earn 1 point for every $1 spent! Redeem points for exclusive rewards and services.</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Earn 1 point for every $1 spent! Current Tier: Bronze.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
};

export default Dashboard;