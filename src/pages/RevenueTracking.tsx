import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navigation } from '@/components/Navigation';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  Download,
  Filter,
  Calculator,
  Receipt,
  CreditCard,
  Banknote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { mockRevenue, getRevenueKPIs } from '@/lib/mock-bi-data';

gsap.registerPlugin(ScrollTrigger);

const RevenueTracking = () => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('6m');

  // Calculate comprehensive financial metrics
  const revenueKPIs = getRevenueKPIs(mockRevenue);

  // Monthly revenue data for charts
  const monthlyRevenue = mockRevenue.reduce((acc, day) => {
    const month = new Date(day.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    if (!acc[month]) {
      acc[month] = { month, revenue: 0, bookings: 0, services: 0, products: 0, count: 0 };
    }
    acc[month].revenue += day.revenue;
    acc[month].bookings += day.bookings;
    acc[month].services += day.servicesRevenue;
    acc[month].products += day.productsRevenue;
    acc[month].count += 1;
    return acc;
  }, {} as Record<string, any>);

  const monthlyData = Object.values(monthlyRevenue).map(item => ({
    ...item,
    avgRevenue: item.revenue / item.count,
    avgBookings: item.bookings / item.count
  }));

  // Revenue by service category
  const serviceRevenue = mockRevenue.reduce((acc, day) => {
    acc.services += day.servicesRevenue;
    acc.products += day.productsRevenue;
    return acc;
  }, { services: 0, products: 0 });

  const revenueBreakdown = [
    { name: 'Services', value: serviceRevenue.services, color: '#8884d8', percentage: Math.round((serviceRevenue.services / (serviceRevenue.services + serviceRevenue.products)) * 100) },
    { name: 'Products', value: serviceRevenue.products, color: '#82ca9d', percentage: Math.round((serviceRevenue.products / (serviceRevenue.services + serviceRevenue.products)) * 100) }
  ];

  // Profitability analysis (mock data)
  const profitabilityData = monthlyData.map(month => ({
    ...month,
    costs: month.revenue * 0.35, // Assume 35% cost of goods/services
    grossProfit: month.revenue * 0.65,
    netProfit: month.revenue * 0.45, // Assume additional expenses
    margin: 45 // 45% net profit margin
  }));

  // Key performance indicators
  const kpis = {
    totalRevenue: revenueKPIs.totalRevenue,
    totalBookings: revenueKPIs.totalBookings,
    avgRevenuePerDay: revenueKPIs.avgRevenuePerDay,
    avgBookingsPerDay: revenueKPIs.avgBookingsPerDay,
    growthRate: 12.5,
    profitMargin: 45,
    customerAcquisitionCost: 45,
    lifetimeValue: 1250,
    roi: 245,
    churnRate: 8.5,
    retentionRate: 91.5
  };

  // Budget vs Actual (mock comparison)
  const budgetData = monthlyData.map(month => ({
    month: month.month,
    actual: month.revenue,
    budget: month.revenue * 0.95, // Assume 5% under budget
    variance: (month.revenue - month.revenue * 0.95) / (month.revenue * 0.95) * 100
  }));

  // Cash flow analysis
  const cashFlowData = monthlyData.map((month, index) => ({
    month: month.month,
    inflow: month.revenue,
    outflow: month.revenue * 0.4, // Operating expenses
    netCashFlow: month.revenue * 0.6,
    cumulative: monthlyData.slice(0, index + 1).reduce((sum, m) => sum + (m.revenue * 0.6), 0)
  }));

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

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-green-400';
    if (variance < -10) return 'text-red-400';
    return 'text-yellow-400';
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <div className="pt-24 px-4 md:px-8">
        <div ref={dashboardRef} className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-serif luxury-glow mb-2">Revenue Analytics</h1>
              <p className="text-muted-foreground">Financial performance and KPI tracking</p>
            </div>
            <div className="flex gap-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32 bg-white/5 border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="frosted-glass border-white/20">
                  <SelectItem value="1m">Last month</SelectItem>
                  <SelectItem value="3m">Last 3 months</SelectItem>
                  <SelectItem value="6m">Last 6 months</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Key Financial Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="frosted-glass border-white/10 hover:border-white/20 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold luxury-glow">{formatCurrency(kpis.totalRevenue)}</p>
                    <p className="text-xs text-green-400">+{kpis.growthRate}% vs last period</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="frosted-glass border-white/10 hover:border-white/20 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Net Profit Margin</p>
                    <p className="text-2xl font-bold luxury-glow">{kpis.profitMargin}%</p>
                    <p className="text-xs text-muted-foreground">Industry avg: 35%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="frosted-glass border-white/10 hover:border-white/20 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Revenue/Day</p>
                    <p className="text-2xl font-bold luxury-glow">{formatCurrency(kpis.avgRevenuePerDay)}</p>
                    <p className="text-xs text-muted-foreground">{kpis.avgBookingsPerDay} bookings/day</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="frosted-glass border-white/10 hover:border-white/20 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Customer LTV</p>
                    <p className="text-2xl font-bold luxury-glow">{formatCurrency(kpis.lifetimeValue)}</p>
                    <p className="text-xs text-muted-foreground">CAC: {formatCurrency(kpis.customerAcquisitionCost)}</p>
                  </div>
                  <Target className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Analytics Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="frosted-glass border-white/10">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white/10">Overview</TabsTrigger>
              <TabsTrigger value="profitability" className="data-[state=active]:bg-white/10">Profitability</TabsTrigger>
              <TabsTrigger value="budget" className="data-[state=active]:bg-white/10">Budget vs Actual</TabsTrigger>
              <TabsTrigger value="forecast" className="data-[state=active]:bg-white/10">Forecasting</TabsTrigger>
              <TabsTrigger value="kpis" className="data-[state=active]:bg-white/10">KPIs</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trends */}
                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Revenue Trends
                    </CardTitle>
                    <CardDescription>Monthly revenue performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={{}} className="h-[300px]">
                      <AreaChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Revenue Breakdown */}
                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5" />
                      Revenue Sources
                    </CardTitle>
                    <CardDescription>Services vs Products breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={{}} className="h-[300px]">
                      <PieChart>
                        <Pie
                          data={revenueBreakdown}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percentage }) => `${name}: ${percentage}%`}
                        >
                          {revenueBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Performance */}
                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle>Monthly Performance</CardTitle>
                    <CardDescription>Revenue and booking comparison</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={{}} className="h-[300px]">
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="revenue" orientation="left" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                        <YAxis yAxisId="bookings" orientation="right" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar yAxisId="revenue" dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
                        <Bar yAxisId="bookings" dataKey="bookings" fill="#82ca9d" name="Bookings" />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Key Metrics Summary */}
                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle>Financial Health Indicators</CardTitle>
                    <CardDescription>Critical business metrics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-sm">Monthly Recurring Revenue</span>
                      <span className="font-medium">{formatCurrency(kpis.totalRevenue * 0.3)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-sm">Gross Margin</span>
                      <span className="font-medium">65%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-sm">Operating Expenses</span>
                      <span className="font-medium">{formatCurrency(kpis.totalRevenue * 0.2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-sm">Cash Flow Positive</span>
                      <span className="font-medium text-green-400">Yes</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-sm">Debt-to-Equity Ratio</span>
                      <span className="font-medium">0.15</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Profitability Tab */}
            <TabsContent value="profitability" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle>Profit & Loss Analysis</CardTitle>
                    <CardDescription>Monthly profitability breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={{}} className="h-[400px]">
                      <BarChart data={profitabilityData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="revenue" stackId="a" fill="#8884d8" name="Revenue" />
                        <Bar dataKey="costs" stackId="a" fill="#ff7300" name="Costs" />
                        <Bar dataKey="netProfit" stackId="b" fill="#82ca9d" name="Net Profit" />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle>Cost Analysis</CardTitle>
                    <CardDescription>Cost breakdown by category</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Staff Costs</span>
                        <span className="text-sm">35%</span>
                      </div>
                      <Progress value={35} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Product Costs</span>
                        <span className="text-sm">25%</span>
                      </div>
                      <Progress value={25} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Facility Costs</span>
                        <span className="text-sm">20%</span>
                      </div>
                      <Progress value={20} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Marketing</span>
                        <span className="text-sm">10%</span>
                      </div>
                      <Progress value={10} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Other Expenses</span>
                        <span className="text-sm">10%</span>
                      </div>
                      <Progress value={10} className="h-2" />
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <div className="flex justify-between">
                        <span className="font-medium">Total Costs</span>
                        <span className="font-medium">{formatCurrency(kpis.totalRevenue * 0.35)}</span>
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="font-medium">Net Profit</span>
                        <span className="font-medium text-green-400">{formatCurrency(kpis.totalRevenue * 0.45)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="frosted-glass border-white/10">
                <CardHeader>
                  <CardTitle>Profitability KPIs</CardTitle>
                  <CardDescription>Key profitability metrics and benchmarks</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Metric</TableHead>
                        <TableHead>Current Value</TableHead>
                        <TableHead>Industry Avg</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Gross Profit Margin</TableCell>
                        <TableCell>65%</TableCell>
                        <TableCell>60%</TableCell>
                        <TableCell><Badge className="bg-green-500/20 text-green-400">Above Avg</Badge></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Net Profit Margin</TableCell>
                        <TableCell>45%</TableCell>
                        <TableCell>35%</TableCell>
                        <TableCell><Badge className="bg-green-500/20 text-green-400">Above Avg</Badge></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Return on Investment</TableCell>
                        <TableCell>245%</TableCell>
                        <TableCell>180%</TableCell>
                        <TableCell><Badge className="bg-green-500/20 text-green-400">Excellent</Badge></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Customer Acquisition Cost</TableCell>
                        <TableCell>{formatCurrency(kpis.customerAcquisitionCost)}</TableCell>
                        <TableCell>{formatCurrency(65)}</TableCell>
                        <TableCell><Badge className="bg-green-500/20 text-green-400">Below Avg</Badge></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Customer Lifetime Value</TableCell>
                        <TableCell>{formatCurrency(kpis.lifetimeValue)}</TableCell>
                        <TableCell>{formatCurrency(950)}</TableCell>
                        <TableCell><Badge className="bg-green-500/20 text-green-400">Above Avg</Badge></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Budget vs Actual Tab */}
            <TabsContent value="budget" className="space-y-6">
              <Card className="frosted-glass border-white/10">
                <CardHeader>
                  <CardTitle>Budget vs Actual Performance</CardTitle>
                  <CardDescription>Monthly budget comparison and variance analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[400px]">
                    <BarChart data={budgetData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="budget" fill="#8884d8" name="Budget" />
                      <Bar dataKey="actual" fill="#82ca9d" name="Actual" />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle>Variance Analysis</CardTitle>
                    <CardDescription>Budget variance by month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {budgetData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <span className="font-medium">{item.month}</span>
                          <div className="text-right">
                            <p className={`font-medium ${getVarianceColor(item.variance)}`}>
                              {item.variance > 0 ? '+' : ''}{item.variance.toFixed(1)}%
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(item.actual - item.budget)} variance
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle>Budget Performance Summary</CardTitle>
                    <CardDescription>Overall budget achievement</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Budget Achievement</span>
                        <span className="text-sm">105.2%</span>
                      </div>
                      <Progress value={105.2} className="h-3" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatCurrency(budgetData.reduce((sum, item) => sum + item.actual, 0) -
                                       budgetData.reduce((sum, item) => sum + item.budget, 0))} over budget
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-500/10 rounded-lg">
                        <p className="text-lg font-bold text-green-400">4</p>
                        <p className="text-xs text-muted-foreground">Months Over Budget</p>
                      </div>
                      <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                        <p className="text-lg font-bold text-blue-400">2</p>
                        <p className="text-xs text-muted-foreground">Months Under Budget</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <p className="text-sm text-muted-foreground mb-2">Recommendations</p>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        <li>• Consider revising budget targets upward</li>
                        <li>• Review cost control measures</li>
                        <li>• Analyze high-performing months for insights</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Forecasting Tab */}
            <TabsContent value="forecast" className="space-y-6">
              <Card className="frosted-glass border-white/10">
                <CardHeader>
                  <CardTitle>Revenue Forecasting</CardTitle>
                  <CardDescription>Projected revenue for the next 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[400px]">
                    <LineChart data={[
                      ...monthlyData,
                      { month: 'Dec 2024', revenue: monthlyData[monthlyData.length - 1].revenue * 1.08 },
                      { month: 'Jan 2025', revenue: monthlyData[monthlyData.length - 1].revenue * 1.12 },
                      { month: 'Feb 2025', revenue: monthlyData[monthlyData.length - 1].revenue * 1.15 },
                      { month: 'Mar 2025', revenue: monthlyData[monthlyData.length - 1].revenue * 1.18 },
                      { month: 'Apr 2025', revenue: monthlyData[monthlyData.length - 1].revenue * 1.20 },
                      { month: 'May 2025', revenue: monthlyData[monthlyData.length - 1].revenue * 1.22 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#8884d8"
                        strokeWidth={3}
                        name="Historical"
                        strokeDasharray={monthlyData.length > 0 ? "0" : "5 5"}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#82ca9d"
                        strokeWidth={2}
                        name="Forecast"
                        strokeDasharray="5 5"
                        data={monthlyData.length > 0 ? [
                          monthlyData[monthlyData.length - 1],
                          { month: 'Dec 2024', revenue: monthlyData[monthlyData.length - 1].revenue * 1.08 },
                          { month: 'Jan 2025', revenue: monthlyData[monthlyData.length - 1].revenue * 1.12 },
                          { month: 'Feb 2025', revenue: monthlyData[monthlyData.length - 1].revenue * 1.15 },
                          { month: 'Mar 2025', revenue: monthlyData[monthlyData.length - 1].revenue * 1.18 },
                          { month: 'Apr 2025', revenue: monthlyData[monthlyData.length - 1].revenue * 1.20 },
                          { month: 'May 2025', revenue: monthlyData[monthlyData.length - 1].revenue * 1.22 }
                        ].slice(1) : []}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="frosted-glass border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <TrendingUp className="h-8 w-8 text-green-400" />
                      <div>
                        <h3 className="text-lg font-semibold">Conservative Growth</h3>
                        <p className="text-sm text-muted-foreground">8% monthly growth</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold luxury-glow">
                        {formatCurrency(monthlyData[monthlyData.length - 1]?.revenue * 1.08 || 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">Next month projection</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="frosted-glass border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Target className="h-8 w-8 text-blue-400" />
                      <div>
                        <h3 className="text-lg font-semibold">Moderate Growth</h3>
                        <p className="text-sm text-muted-foreground">15% monthly growth</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold luxury-glow">
                        {formatCurrency(monthlyData[monthlyData.length - 1]?.revenue * 1.15 || 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">Next month projection</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="frosted-glass border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <TrendingUp className="h-8 w-8 text-purple-400" />
                      <div>
                        <h3 className="text-lg font-semibold">Aggressive Growth</h3>
                        <p className="text-sm text-muted-foreground">22% monthly growth</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold luxury-glow">
                        {formatCurrency(monthlyData[monthlyData.length - 1]?.revenue * 1.22 || 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">Next month projection</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* KPIs Tab */}
            <TabsContent value="kpis" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle>Financial KPIs</CardTitle>
                    <CardDescription>Key financial performance indicators</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-white/5 rounded-lg">
                        <p className="text-xs text-muted-foreground">Revenue Growth</p>
                        <p className="text-lg font-bold text-green-400">+{kpis.growthRate}%</p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <p className="text-xs text-muted-foreground">Profit Margin</p>
                        <p className="text-lg font-bold">{kpis.profitMargin}%</p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <p className="text-xs text-muted-foreground">ROI</p>
                        <p className="text-lg font-bold">{kpis.roi}%</p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <p className="text-xs text-muted-foreground">CAC</p>
                        <p className="text-lg font-bold">{formatCurrency(kpis.customerAcquisitionCost)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle>Customer KPIs</CardTitle>
                    <CardDescription>Customer-related performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-white/5 rounded-lg">
                        <p className="text-xs text-muted-foreground">Customer LTV</p>
                        <p className="text-lg font-bold">{formatCurrency(kpis.lifetimeValue)}</p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <p className="text-xs text-muted-foreground">Retention Rate</p>
                        <p className="text-lg font-bold">{kpis.retentionRate}%</p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <p className="text-xs text-muted-foreground">Churn Rate</p>
                        <p className="text-lg font-bold text-red-400">{kpis.churnRate}%</p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <p className="text-xs text-muted-foreground">LTV/CAC Ratio</p>
                        <p className="text-lg font-bold text-green-400">{(kpis.lifetimeValue / kpis.customerAcquisitionCost).toFixed(1)}x</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="frosted-glass border-white/10">
                <CardHeader>
                  <CardTitle>KPI Trends & Targets</CardTitle>
                  <CardDescription>Performance against targets and historical trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>KPI</TableHead>
                        <TableHead>Current</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Trend</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Monthly Revenue</TableCell>
                        <TableCell>{formatCurrency(kpis.avgRevenuePerDay * 30)}</TableCell>
                        <TableCell>{formatCurrency(kpis.avgRevenuePerDay * 30 * 1.1)}</TableCell>
                        <TableCell><TrendingUp className="h-4 w-4 text-green-400" /></TableCell>
                        <TableCell><Badge className="bg-green-500/20 text-green-400">On Track</Badge></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Profit Margin</TableCell>
                        <TableCell>{kpis.profitMargin}%</TableCell>
                        <TableCell>40%</TableCell>
                        <TableCell><TrendingUp className="h-4 w-4 text-green-400" /></TableCell>
                        <TableCell><Badge className="bg-green-500/20 text-green-400">Exceeded</Badge></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Customer Retention</TableCell>
                        <TableCell>{kpis.retentionRate}%</TableCell>
                        <TableCell>85%</TableCell>
                        <TableCell><TrendingUp className="h-4 w-4 text-green-400" /></TableCell>
                        <TableCell><Badge className="bg-green-500/20 text-green-400">On Track</Badge></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Customer Acquisition Cost</TableCell>
                        <TableCell>{formatCurrency(kpis.customerAcquisitionCost)}</TableCell>
                        <TableCell>{formatCurrency(50)}</TableCell>
                        <TableCell><TrendingDown className="h-4 w-4 text-green-400" /></TableCell>
                        <TableCell><Badge className="bg-green-500/20 text-green-400">Below Target</Badge></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default RevenueTracking;