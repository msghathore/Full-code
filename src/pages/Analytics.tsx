import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navigation } from '@/components/Navigation';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Star,
  Target,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Clock,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import {
  mockBookings,
  mockCustomers,
  mockRevenue,
  mockFeedback,
  getCustomerInsights,
  calculateNPS
} from '@/lib/mock-bi-data';

gsap.registerPlugin(ScrollTrigger);

const Analytics = () => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  // Process booking trends data
  const bookingTrends = mockRevenue.map(r => ({
    date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    bookings: r.bookings,
    revenue: r.revenue / 100, // Scale for chart
    newCustomers: r.newCustomers
  }));

  // Process service popularity
  const servicePopularity = mockBookings.reduce((acc, booking) => {
    acc[booking.service] = (acc[booking.service] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const serviceData = Object.entries(servicePopularity).map(([service, count]) => ({
    service,
    bookings: count,
    revenue: mockBookings.filter(b => b.service === service).reduce((sum, b) => sum + b.price, 0)
  }));

  // Process customer segments
  const customerSegments = Object.entries(getCustomerInsights(mockCustomers).segments).map(([segment, count]) => ({
    segment,
    count,
    percentage: Math.round((count / mockCustomers.length) * 100)
  }));

  // Process staff performance
  const staffPerformance = mockBookings.reduce((acc, booking) => {
    if (!acc[booking.staff]) {
      acc[booking.staff] = { bookings: 0, revenue: 0 };
    }
    acc[booking.staff].bookings += 1;
    acc[booking.staff].revenue += booking.price;
    return acc;
  }, {} as Record<string, { bookings: number; revenue: number }>);

  const staffData = Object.entries(staffPerformance).map(([staff, data]) => ({
    staff,
    bookings: data.bookings,
    revenue: data.revenue
  }));

  // Process feedback trends
  const feedbackTrends = mockFeedback.reduce((acc, feedback) => {
    const date = feedback.date;
    if (!acc[date]) {
      acc[date] = { date, rating: 0, count: 0, nps: 0 };
    }
    acc[date].rating += feedback.rating;
    acc[date].nps += feedback.npsScore;
    acc[date].count += 1;
    return acc;
  }, {} as Record<string, { date: string; rating: number; count: number; nps: number }>);

  const feedbackData = Object.values(feedbackTrends).map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    avgRating: Math.round((item.rating / item.count) * 10) / 10,
    avgNPS: Math.round(item.nps / item.count)
  }));

  // Chart configurations
  const bookingChartConfig = {
    bookings: {
      label: "Bookings",
      color: "hsl(var(--chart-1))",
    },
    revenue: {
      label: "Revenue ($)",
      color: "hsl(var(--chart-2))",
    },
  };

  const serviceChartConfig = {
    bookings: {
      label: "Bookings",
      color: "hsl(var(--chart-1))",
    },
  };

  const segmentColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

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

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <div className="pt-24 px-4 md:px-8">
        <div ref={dashboardRef} className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-serif luxury-glow mb-2">Business Analytics</h1>
              <p className="text-muted-foreground">Data-driven insights for your beauty salon</p>
            </div>
            <div className="flex gap-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32 bg-white/5 border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="frosted-glass border-white/20">
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="6m">Last 6 months</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card className="frosted-glass border-white/10 hover:border-white/20 transition-all">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-lg md:text-2xl font-bold luxury-glow">
                      {formatCurrency(mockRevenue.reduce((sum, r) => sum + r.revenue, 0))}
                    </p>
                    <p className="text-xs text-green-400">+12.5% from last month</p>
                  </div>
                  <DollarSign className="h-6 w-6 md:h-8 md:w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="frosted-glass border-white/10 hover:border-white/20 transition-all">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Total Bookings</p>
                    <p className="text-lg md:text-2xl font-bold luxury-glow">
                      {mockRevenue.reduce((sum, r) => sum + r.bookings, 0)}
                    </p>
                    <p className="text-xs text-blue-400">+8.2% from last month</p>
                  </div>
                  <Calendar className="h-6 w-6 md:h-8 md:w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="frosted-glass border-white/10 hover:border-white/20 transition-all">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Net Promoter Score</p>
                    <p className="text-lg md:text-2xl font-bold luxury-glow">
                      {calculateNPS(mockFeedback)}
                    </p>
                    <p className="text-xs text-purple-400">Based on {mockFeedback.length} reviews</p>
                  </div>
                  <Star className="h-6 w-6 md:h-8 md:w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="frosted-glass border-white/10 hover:border-white/20 transition-all">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Active Customers</p>
                    <p className="text-lg md:text-2xl font-bold luxury-glow">
                      {mockCustomers.length}
                    </p>
                    <p className="text-xs text-yellow-400">78.5% retention rate</p>
                  </div>
                  <Users className="h-6 w-6 md:h-8 md:w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="frosted-glass border-white/10">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white/10">Overview</TabsTrigger>
              <TabsTrigger value="bookings" className="data-[state=active]:bg-white/10">Bookings</TabsTrigger>
              <TabsTrigger value="customers" className="data-[state=active]:bg-white/10">Customers</TabsTrigger>
              <TabsTrigger value="revenue" className="data-[state=active]:bg-white/10">Revenue</TabsTrigger>
              <TabsTrigger value="staff" className="data-[state=active]:bg-white/10">Staff Performance</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Booking Trends */}
                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Booking Trends
                    </CardTitle>
                    <CardDescription>Daily booking volume over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={bookingChartConfig} className="h-[200px] md:h-[300px]">
                      <LineChart data={bookingTrends.slice(-30)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" fontSize={10} />
                        <YAxis fontSize={10} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="bookings"
                          stroke="var(--color-bookings)"
                          strokeWidth={2}
                          dot={{ fill: 'var(--color-bookings)' }}
                        />
                      </LineChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Customer Segments */}
                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5" />
                      Customer Segments
                    </CardTitle>
                    <CardDescription>Distribution of customer segments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={{}} className="h-[200px] md:h-[300px]">
                      <PieChart>
                        <Pie
                          data={customerSegments}
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          dataKey="count"
                          label={({ segment, percentage }) => `${segment}: ${percentage}%`}
                          fontSize={10}
                        >
                          {customerSegments.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={segmentColors[index % segmentColors.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Service Popularity */}
                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Service Popularity
                    </CardTitle>
                    <CardDescription>Most booked services</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={serviceChartConfig} className="h-[200px] md:h-[300px]">
                      <BarChart data={serviceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="service" angle={-45} textAnchor="end" height={60} fontSize={10} />
                        <YAxis fontSize={10} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="bookings" fill="var(--color-bookings)" />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Revenue vs Bookings */}
                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Revenue Trends
                    </CardTitle>
                    <CardDescription>Revenue and booking correlation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={bookingChartConfig} className="h-[200px] md:h-[300px]">
                      <AreaChart data={bookingTrends.slice(-30)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" fontSize={10} />
                        <YAxis fontSize={10} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stackId="1"
                          stroke="var(--color-revenue)"
                          fill="var(--color-revenue)"
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle>Booking Volume by Day</CardTitle>
                    <CardDescription>Daily booking patterns</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={bookingChartConfig} className="h-[400px]">
                      <BarChart data={bookingTrends.slice(-14)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="bookings" fill="var(--color-bookings)" />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle>Service Distribution</CardTitle>
                    <CardDescription>Booking distribution by service type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {serviceData.map((service, index) => (
                        <div key={service.service} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: segmentColors[index % segmentColors.length] }}
                            />
                            <span className="text-sm">{service.service}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{service.bookings} bookings</p>
                            <p className="text-xs text-muted-foreground">{formatCurrency(service.revenue)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Customers Tab */}
            <TabsContent value="customers" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {customerSegments.map((segment, index) => (
                  <Card key={segment.segment} className="frosted-glass border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Badge
                          className="text-white"
                          style={{ backgroundColor: segmentColors[index % segmentColors.length] }}
                        >
                          {segment.segment}
                        </Badge>
                        <Users className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold luxury-glow">{segment.count}</p>
                        <p className="text-sm text-muted-foreground">customers ({segment.percentage}%)</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="frosted-glass border-white/10">
                <CardHeader>
                  <CardTitle>Customer Satisfaction Trends</CardTitle>
                  <CardDescription>Average ratings and NPS over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[300px]">
                    <LineChart data={feedbackData.slice(-30)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 10]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="avgRating"
                        stroke="#8884d8"
                        strokeWidth={2}
                        name="Avg Rating"
                      />
                      <Line
                        type="monotone"
                        dataKey="avgNPS"
                        stroke="#82ca9d"
                        strokeWidth={2}
                        name="Avg NPS"
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Revenue Tab */}
            <TabsContent value="revenue" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle>Revenue Breakdown</CardTitle>
                    <CardDescription>Services vs Products revenue</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={{}} className="h-[300px]">
                      <PieChart>
                        <Pie
                          data={[
                            {
                              name: 'Services',
                              value: mockRevenue.reduce((sum, r) => sum + r.servicesRevenue, 0),
                              fill: '#8884d8'
                            },
                            {
                              name: 'Products',
                              value: mockRevenue.reduce((sum, r) => sum + r.productsRevenue, 0),
                              fill: '#82ca9d'
                            }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle>Key Performance Indicators</CardTitle>
                    <CardDescription>Important business metrics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-sm">Average Booking Value</span>
                      <span className="font-medium">
                        {formatCurrency(mockRevenue.reduce((sum, r) => sum + r.avgBookingValue, 0) / mockRevenue.length)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-sm">Monthly Growth Rate</span>
                      <span className="font-medium text-green-400">+12.5%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-sm">Customer Acquisition Cost</span>
                      <span className="font-medium">{formatCurrency(45)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-sm">Lifetime Customer Value</span>
                      <span className="font-medium">{formatCurrency(1250)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Staff Performance Tab */}
            <TabsContent value="staff" className="space-y-6">
              <Card className="frosted-glass border-white/10">
                <CardHeader>
                  <CardTitle>Staff Performance Metrics</CardTitle>
                  <CardDescription>Bookings and revenue by staff member</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[400px]">
                    <BarChart data={staffData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="staff" type="category" width={100} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="bookings" fill="#8884d8" name="Bookings" />
                      <Bar dataKey="revenue" fill="#82ca9d" name="Revenue ($)" />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staffData.map((staff, index) => (
                  <Card key={staff.staff} className="frosted-glass border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Award className="h-8 w-8 text-yellow-400" />
                        <div>
                          <h3 className="font-semibold">{staff.staff}</h3>
                          <p className="text-sm text-muted-foreground">Staff Member</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Bookings</span>
                          <span className="font-medium">{staff.bookings}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Revenue</span>
                          <span className="font-medium">{formatCurrency(staff.revenue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Avg per Booking</span>
                          <span className="font-medium">{formatCurrency(staff.revenue / staff.bookings)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Analytics;