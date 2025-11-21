import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navigation } from '@/components/Navigation';
import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Activity,
  UserCheck,
  UserX,
  Target,
  Zap,
  Settings,
  Download,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { mockDemandPatterns, mockStaff, mockBookings } from '@/lib/mock-bi-data';

gsap.registerPlugin(ScrollTrigger);

const StaffScheduling = () => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedWeek, setSelectedWeek] = useState('current');

  // Process demand patterns for visualization
  const weeklyDemand = mockDemandPatterns.reduce((acc, pattern) => {
    if (!acc[pattern.day]) {
      acc[pattern.day] = [];
    }
    acc[pattern.day].push({
      hour: pattern.hour,
      demand: pattern.demand,
      avgBookings: pattern.avgBookings
    });
    return acc;
  }, {} as Record<string, Array<{ hour: number; demand: number; avgBookings: number }>>);

  // Calculate optimal staffing levels
  const optimalStaffing = Object.entries(weeklyDemand).map(([day, hours]) => ({
    day,
    peakHours: hours.filter(h => h.demand > 70).length,
    highDemandHours: hours.filter(h => h.demand > 50 && h.demand <= 70).length,
    recommendedStaff: Math.max(2, Math.ceil(hours.reduce((sum, h) => sum + h.avgBookings, 0) / 3)),
    totalBookings: hours.reduce((sum, h) => sum + h.avgBookings, 0)
  }));

  // Staff utilization analysis
  const staffUtilization = mockStaff.map(staff => {
    const staffBookings = mockBookings.filter(b => b.staff === staff.name);
    const totalHours = Object.values(staff.availability).reduce((sum, slots) => sum + slots.length, 0);
    const bookedHours = staffBookings.length * 1.5; // Assume 1.5 hours per booking
    const utilizationRate = (bookedHours / totalHours) * 100;

    return {
      ...staff,
      bookedHours,
      totalHours,
      utilizationRate,
      efficiency: utilizationRate > 80 ? 'High' : utilizationRate > 60 ? 'Good' : 'Low'
    };
  });

  // Scheduling recommendations
  const schedulingRecommendations = [
    {
      day: 'Monday',
      time: '10:00 - 14:00',
      currentStaff: 2,
      recommendedStaff: 3,
      reason: 'Peak demand period',
      impact: 'High'
    },
    {
      day: 'Wednesday',
      time: '14:00 - 16:00',
      currentStaff: 1,
      recommendedStaff: 2,
      reason: 'High booking volume',
      impact: 'Medium'
    },
    {
      day: 'Saturday',
      time: '08:00 - 12:00',
      currentStaff: 3,
      recommendedStaff: 4,
      reason: 'Weekend peak hours',
      impact: 'High'
    },
    {
      day: 'Tuesday',
      time: '16:00 - 18:00',
      currentStaff: 2,
      recommendedStaff: 1,
      reason: 'Low demand period',
      impact: 'Low'
    }
  ];

  // Performance metrics
  const performanceMetrics = {
    avgUtilization: staffUtilization.reduce((sum, s) => sum + s.utilizationRate, 0) / staffUtilization.length,
    totalStaffHours: staffUtilization.reduce((sum, s) => sum + s.totalHours, 0),
    totalBookedHours: staffUtilization.reduce((sum, s) => sum + s.bookedHours, 0),
    schedulingEfficiency: 78.5,
    customerWaitTime: 8.2, // minutes
    staffOvertime: 12.3 // hours per week
  };

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

  const getEfficiencyColor = (efficiency: string) => {
    switch (efficiency) {
      case 'High': return 'bg-green-500/20 text-green-400';
      case 'Good': return 'bg-blue-500/20 text-blue-400';
      case 'Low': return 'bg-red-500/20 text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'bg-red-500/20 text-red-400';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'Low': return 'bg-green-500/20 text-green-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <div className="pt-24 px-4 md:px-8">
        <div ref={dashboardRef} className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-serif luxury-glow mb-2">Staff Scheduling</h1>
              <p className="text-muted-foreground">AI-powered scheduling optimization based on demand patterns</p>
            </div>
            <div className="flex gap-4">
              <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                <SelectTrigger className="w-32 bg-white/5 border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="frosted-glass border-white/20">
                  <SelectItem value="current">This Week</SelectItem>
                  <SelectItem value="next">Next Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Schedule
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="frosted-glass border-white/10 hover:border-white/20 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Staff Utilization</p>
                    <p className="text-2xl font-bold luxury-glow">{performanceMetrics.avgUtilization.toFixed(1)}%</p>
                    <p className="text-xs text-green-400">Target: 75-85%</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="frosted-glass border-white/10 hover:border-white/20 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Scheduling Efficiency</p>
                    <p className="text-2xl font-bold luxury-glow">{performanceMetrics.schedulingEfficiency}%</p>
                    <p className="text-xs text-muted-foreground">Optimal allocation</p>
                  </div>
                  <Target className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="frosted-glass border-white/10 hover:border-white/20 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Wait Time</p>
                    <p className="text-2xl font-bold luxury-glow">{performanceMetrics.customerWaitTime}min</p>
                    <p className="text-xs text-muted-foreground">Industry avg: 12min</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="frosted-glass border-white/10 hover:border-white/20 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Weekly Overtime</p>
                    <p className="text-2xl font-bold luxury-glow">{performanceMetrics.staffOvertime}h</p>
                    <p className="text-xs text-yellow-400">Can be optimized</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Scheduling Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="frosted-glass border-white/10">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white/10">Overview</TabsTrigger>
              <TabsTrigger value="demand-analysis" className="data-[state=active]:bg-white/10">Demand Analysis</TabsTrigger>
              <TabsTrigger value="staff-utilization" className="data-[state=active]:bg-white/10">Staff Utilization</TabsTrigger>
              <TabsTrigger value="recommendations" className="data-[state=active]:bg-white/10">Recommendations</TabsTrigger>
              <TabsTrigger value="schedule-builder" className="data-[state=active]:bg-white/10">Schedule Builder</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Demand Pattern */}
                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Weekly Demand Pattern
                    </CardTitle>
                    <CardDescription>Average demand by day of week</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={{}} className="h-[300px]">
                      <BarChart data={optimalStaffing}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="totalBookings" fill="hsl(var(--chart-primary))" name="Total Bookings" />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Staffing Recommendations */}
                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Optimal Staffing Levels
                    </CardTitle>
                    <CardDescription>Recommended staff count by day</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {optimalStaffing.map((day, index) => (
                        <div key={day.day} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{day.day}</p>
                              <p className="text-xs text-muted-foreground">{day.totalBookings} bookings</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{day.recommendedStaff} staff</p>
                            <p className="text-xs text-muted-foreground">{day.peakHours}h peak</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hourly Demand Heatmap */}
                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle>Hourly Demand Heatmap</CardTitle>
                    <CardDescription>Demand intensity throughout the week</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(weeklyDemand).map(([day, hours]) => (
                        <div key={day} className="flex items-center gap-2">
                          <span className="w-16 text-sm font-medium">{day.slice(0, 3)}</span>
                          <div className="flex-1 flex gap-1">
                            {hours.map((hour, index) => (
                              <div
                                key={index}
                                className="flex-1 h-6 rounded"
                                style={{
                                  backgroundColor: hour.demand > 70 ? 'hsl(var(--chart-error))' :
                                                 hour.demand > 50 ? 'hsl(var(--chart-warning))' :
                                                 hour.demand > 30 ? 'hsl(var(--chart-secondary))' : 'hsl(var(--premium-gray))',
                                  opacity: hour.demand / 100 + 0.2
                                }}
                                title={`${hour.hour}:00 - Demand: ${hour.demand}%`}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-4 text-xs text-muted-foreground">
                      <span>Low</span>
                      <span>Medium</span>
                      <span>High</span>
                      <span>Peak</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Optimize your scheduling instantly</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full" variant="outline">
                      <Zap className="h-4 w-4 mr-2" />
                      Auto-Optimize Schedule
                    </Button>
                    <Button className="w-full" variant="outline">
                      <UserCheck className="h-4 w-4 mr-2" />
                      Balance Workload
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Generate Next Week
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Adjust Parameters
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Demand Analysis Tab */}
            <TabsContent value="demand-analysis" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle>Peak Hours Analysis</CardTitle>
                    <CardDescription>When demand is highest throughout the day</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={{}} className="h-[400px]">
                      <AreaChart data={weeklyDemand.Monday || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" tickFormatter={(value) => `${value}:00`} />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="demand"
                          stroke="hsl(var(--chart-primary))"
                          fill="hsl(var(--chart-primary))"
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle>Demand Forecasting</CardTitle>
                    <CardDescription>Predictive demand analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Today's Peak Demand</span>
                          <span className="text-sm font-medium">2:00 PM - 4:00 PM</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Tomorrow's Forecast</span>
                          <span className="text-sm font-medium">High (78%)</span>
                        </div>
                        <Progress value={78} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Weekend Surge</span>
                          <span className="text-sm font-medium">Very High (92%)</span>
                        </div>
                        <Progress value={92} className="h-2" />
                      </div>

                      <div className="pt-4 border-t border-white/10">
                        <h4 className="font-medium mb-3">Demand Drivers</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Seasonal trends</span>
                            <span className="text-green-400">+15%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Marketing campaigns</span>
                            <span className="text-green-400">+8%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Weather impact</span>
                            <span className="text-red-400">-3%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Staff Utilization Tab */}
            <TabsContent value="staff-utilization" className="space-y-6">
              <Card className="frosted-glass border-white/10">
                <CardHeader>
                  <CardTitle>Staff Utilization Overview</CardTitle>
                  <CardDescription>Current workload distribution and efficiency</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[400px]">
                    <BarChart data={staffUtilization} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" width={100} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="utilizationRate" fill="hsl(var(--chart-primary))" name="Utilization %" />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staffUtilization.map((staff) => (
                  <Card key={staff.id} className="frosted-glass border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">{staff.name.split(' ').map(n => n[0]).join('')}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{staff.name}</h3>
                          <p className="text-sm text-muted-foreground">{staff.role}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Utilization</span>
                            <span>{staff.utilizationRate.toFixed(1)}%</span>
                          </div>
                          <Progress value={staff.utilizationRate} className="h-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Booked Hours</p>
                            <p className="font-medium">{staff.bookedHours.toFixed(1)}h</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Available Hours</p>
                            <p className="font-medium">{staff.totalHours}h</p>
                          </div>
                        </div>

                        <Badge className={getEfficiencyColor(staff.efficiency)}>
                          {staff.efficiency} Efficiency
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-6">
              <Card className="frosted-glass border-white/10">
                <CardHeader>
                  <CardTitle>AI Scheduling Recommendations</CardTitle>
                  <CardDescription>Optimized staffing suggestions based on demand patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Day & Time</TableHead>
                        <TableHead>Current Staff</TableHead>
                        <TableHead>Recommended</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Impact</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schedulingRecommendations.map((rec, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{rec.day}</p>
                              <p className="text-sm text-muted-foreground">{rec.time}</p>
                            </div>
                          </TableCell>
                          <TableCell>{rec.currentStaff}</TableCell>
                          <TableCell className="font-medium">{rec.recommendedStaff}</TableCell>
                          <TableCell>{rec.reason}</TableCell>
                          <TableCell>
                            <Badge className={getImpactColor(rec.impact)}>
                              {rec.impact}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              {rec.currentStaff < rec.recommendedStaff ? 'Add Staff' : 'Reduce Staff'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      Benefits of Optimization
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                      <span className="text-sm">Reduced customer wait times</span>
                      <span className="font-medium text-green-400">-35%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                      <span className="text-sm">Increased staff utilization</span>
                      <span className="font-medium text-green-400">+15%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                      <span className="text-sm">Higher customer satisfaction</span>
                      <span className="font-medium text-green-400">+22%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                      <span className="text-sm">Reduced operational costs</span>
                      <span className="font-medium text-green-400">-12%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      Potential Issues
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-yellow-500/10 rounded-lg">
                      <p className="text-sm font-medium">Staff burnout risk</p>
                      <p className="text-xs text-muted-foreground">Monitor utilization above 85%</p>
                    </div>
                    <div className="p-3 bg-yellow-500/10 rounded-lg">
                      <p className="text-sm font-medium">Training requirements</p>
                      <p className="text-xs text-muted-foreground">New staff may need onboarding</p>
                    </div>
                    <div className="p-3 bg-yellow-500/10 rounded-lg">
                      <p className="text-sm font-medium">Schedule conflicts</p>
                      <p className="text-xs text-muted-foreground">Check staff availability preferences</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Schedule Builder Tab */}
            <TabsContent value="schedule-builder" className="space-y-6">
              <Card className="frosted-glass border-white/10">
                <CardHeader>
                  <CardTitle>Interactive Schedule Builder</CardTitle>
                  <CardDescription>Drag and drop to create optimal schedules</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-8 gap-2 text-sm font-medium text-center">
                      <div></div>
                      {Array.from({ length: 12 }, (_, i) => (
                        <div key={i} className="p-2">{i + 8}:00</div>
                      ))}
                    </div>

                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                      <div key={day} className="grid grid-cols-8 gap-2 items-center">
                        <div className="font-medium text-sm">{day.slice(0, 3)}</div>
                        {Array.from({ length: 12 }, (_, hourIndex) => {
                          const hour = hourIndex + 8;
                          const demand = weeklyDemand[day]?.find(h => h.hour === hour)?.demand || 0;
                          const hasStaff = Math.random() > 0.3; // Mock staff assignment

                          return (
                            <div
                              key={hour}
                              className={`h-12 rounded border-2 cursor-pointer transition-all ${
                                hasStaff
                                  ? 'bg-blue-500/20 border-blue-500/50'
                                  : demand > 50
                                    ? 'bg-red-500/10 border-red-500/30 border-dashed'
                                    : 'bg-white/5 border-white/20 border-dashed'
                              } hover:border-white/50`}
                              title={`${day} ${hour}:00 - Demand: ${demand}%`}
                            >
                              {hasStaff && (
                                <div className="w-full h-full flex items-center justify-center text-xs">
                                  {['M', 'D', 'E', 'S'][Math.floor(Math.random() * 4)]}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}

                    <div className="flex gap-4 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500/20 border border-blue-500/50 rounded"></div>
                        <span className="text-sm">Staff Assigned</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500/10 border border-red-500/30 border-dashed rounded"></div>
                        <span className="text-sm">High Demand - Needs Staff</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <Button size="sm" className="w-full">
                            <Zap className="h-4 w-4 mr-2" />
                            Auto-Fill Schedule
                          </Button>
                        </div>
                      </div>
                    </div>
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

export default StaffScheduling;