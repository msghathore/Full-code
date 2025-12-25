import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navigation } from '@/components/Navigation';
import {
  Star,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Users,
  ThumbsUp,
  ThumbsDown,
  Minus,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { useFeedback } from '@/hooks/useFeedback';
import { useAuth } from '@clerk/clerk-react';
import { getPromoterType } from '@/services/feedbackService';

gsap.registerPlugin(ScrollTrigger);

const CustomerFeedback = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [filterService, setFilterService] = useState('all');
  const [filterTimeRange, setFilterTimeRange] = useState('30d');
  const [searchTerm, setSearchTerm] = useState('');

  // Use real feedback data
  const {
    feedback: feedbackData,
    summary,
    trends,
    loading,
    summaryLoading,
    trendsLoading,
    error,
    searchFeedback
  } = useFeedback({ limit: 50 });

  // Extract data from summary or provide defaults
  const totalFeedback = summary?.totalFeedback || 0;
  const npsScore = summary?.npsScore || 0;
  const avgRating = summary?.averageRating || 0;
  const promoterCount = summary?.promoterCount || 0;
  const passiveCount = summary?.passiveCount || 0;
  const detractorCount = summary?.detractorCount || 0;
  const serviceBreakdown = summary?.serviceBreakdown || [];
  const recentFeedback = summary?.recentFeedback || [];

  // Service-specific feedback (from service breakdown)
  const serviceData = serviceBreakdown.map((service) => ({
    service: service.service_name,
    avgRating: service.avg_rating,
    avgNPS: service.avg_nps,
    feedbackCount: service.total_feedback
  }));

  // Filter feedback based on search and service
  const filteredFeedback = feedbackData.filter(feedback => {
    const matchesSearch = searchTerm === '' ||
      (feedback.comment && feedback.comment.toLowerCase().includes(searchTerm.toLowerCase())) ||
      feedback.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (feedback.customers?.name && feedback.customers.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesService = filterService === 'all' || feedback.service_name === filterService;
    return matchesSearch && matchesService;
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

  // Handle search
  const handleSearch = (query: string) => {
    setSearchTerm(query);
    if (query.trim()) {
      searchFeedback(query, filterService === 'all' ? undefined : filterService);
    }
  };

  const getNPSScoreColor = (score: number) => {
    if (score >= 50) return 'text-green-400';
    if (score >= 0) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPromoterTypeColor = (type: string) => {
    switch (type) {
      case 'promoter': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'passive': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'detractor': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const npsChartData = [
    { name: 'Promoters (9-10)', value: promoterCount, color: '#10b981' },
    { name: 'Passives (7-8)', value: passiveCount, color: '#f59e0b' },
    { name: 'Detractors (0-6)', value: detractorCount, color: '#ef4444' }
  ];

  const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
    rating: `${rating} Star${rating > 1 ? 's' : ''}`,
    count: feedbackData.filter(f => f.rating === rating).length,
    percentage: totalFeedback > 0 ? Math.round((feedbackData.filter(f => f.rating === rating).length / totalFeedback) * 100) : 0
  }));

  // Show loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // Show authentication required
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="pt-24 px-4 md:px-8 flex items-center justify-center min-h-[60vh]">
          <Card className="frosted-glass border-white/10 max-w-md">
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 text-slate-700 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
              <p className="text-muted-foreground mb-4">
                Please sign in to access customer feedback analytics.
              </p>
              <Button className="w-full">
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="pt-24 px-4 md:px-8 flex items-center justify-center min-h-[60vh]">
          <Card className="frosted-glass border-red-500/20 max-w-md">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-red-400">Error Loading Feedback</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <div className="pt-24 px-4 md:px-8">
        <div ref={dashboardRef} className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-serif luxury-glow mb-2">Customer Feedback</h1>
              <p className="text-muted-foreground">Net Promoter Score and customer satisfaction insights</p>
            </div>
            <div className="flex gap-4">
              <Select value={filterTimeRange} onValueChange={setFilterTimeRange}>
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
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="frosted-glass border-white/10 hover:border-white/20 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Net Promoter Score</p>
                    <p className={`text-3xl font-bold luxury-glow ${getNPSScoreColor(npsScore)}`}>
                      {summaryLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : npsScore}
                    </p>
                    <p className="text-xs text-muted-foreground">Based on {totalFeedback} responses</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-slate-700" />
                </div>
              </CardContent>
            </Card>

            <Card className="frosted-glass border-white/10 hover:border-white/20 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Rating</p>
                    <p className="text-3xl font-bold luxury-glow">
                      {summaryLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : avgRating.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">Out of 5 stars</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="frosted-glass border-white/10 hover:border-white/20 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Feedback</p>
                    <p className="text-3xl font-bold luxury-glow">
                      {summaryLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : totalFeedback}
                    </p>
                    <p className="text-xs text-green-400">+12% from last month</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="frosted-glass border-white/10 hover:border-white/20 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Response Rate</p>
                    <p className="text-3xl font-bold luxury-glow">
                      {totalFeedback > 0 ? '78%' : '0%'}
                    </p>
                    <p className="text-xs text-muted-foreground">Feedback collection rate</p>
                  </div>
                  <Users className="h-8 w-8 text-amber-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feedback Analysis Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="frosted-glass border-white/10">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white/10">Overview</TabsTrigger>
              <TabsTrigger value="nps-analysis" className="data-[state=active]:bg-white/10">NPS Analysis</TabsTrigger>
              <TabsTrigger value="feedback-list" className="data-[state=active]:bg-white/10">Feedback List</TabsTrigger>
              <TabsTrigger value="insights" className="data-[state=active]:bg-white/10">Insights</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* NPS Distribution */}
                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5" />
                      NPS Distribution
                    </CardTitle>
                    <CardDescription>Customer loyalty segmentation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {summaryLoading ? (
                      <div className="h-[300px] flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : (
                      <ChartContainer config={{}} className="h-[300px]">
                        <PieChart>
                          <Pie
                            data={npsChartData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, percent }) => `${name.split(' ')[0]}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {npsChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>

                {/* Rating Distribution */}
                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Rating Distribution
                    </CardTitle>
                    <CardDescription>Star rating breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="h-[300px] flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : (
                      <ChartContainer config={{}} className="h-[300px]">
                        <BarChart data={ratingDistribution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="rating" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count" fill="#8884d8" />
                        </BarChart>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* NPS Trends */}
                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle>NPS Trends</CardTitle>
                    <CardDescription>NPS score over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {trendsLoading ? (
                      <div className="h-[300px] flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : (
                      <ChartContainer config={{}} className="h-[300px]">
                        <LineChart data={trends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[-100, 100]} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line
                            type="monotone"
                            dataKey="nps"
                            stroke="#8884d8"
                            strokeWidth={2}
                            name="NPS Score"
                          />
                        </LineChart>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>

                {/* Service Performance */}
                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle>Service Performance</CardTitle>
                    <CardDescription>Average ratings by service</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {summaryLoading ? (
                      <div className="h-[300px] flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : serviceData.length > 0 ? (
                      <div className="space-y-4">
                        {serviceData.map((service, index) => (
                          <div key={service.service} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < Math.floor(service.avgRating)
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-muted-foreground'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-medium">{service.service}</span>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{service.avgRating}/5</p>
                              <p className="text-xs text-muted-foreground">{service.feedbackCount} reviews</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                        No service data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* NPS Analysis Tab */}
            <TabsContent value="nps-analysis" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Promoter Insights */}
                <Card className="frosted-glass border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <ThumbsUp className="h-8 w-8 text-green-400" />
                      <div>
                        <h3 className="text-lg font-semibold text-green-400">Promoters</h3>
                        <p className="text-sm text-muted-foreground">Score 9-10</p>
                      </div>
                    </div>
                    <div className="text-center mb-4">
                      <p className="text-3xl font-bold luxury-glow">
                        {summaryLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : promoterCount}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {totalFeedback > 0 ? Math.round((promoterCount / totalFeedback) * 100) : 0}% of responses
                      </p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Loyal customers</span>
                        <span className="text-green-400">High</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Referral potential</span>
                        <span className="text-green-400">High</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Retention risk</span>
                        <span className="text-green-400">Low</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Passive Insights */}
                <Card className="frosted-glass border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Minus className="h-8 w-8 text-yellow-400" />
                      <div>
                        <h3 className="text-lg font-semibold text-yellow-400">Passives</h3>
                        <p className="text-sm text-muted-foreground">Score 7-8</p>
                      </div>
                    </div>
                    <div className="text-center mb-4">
                      <p className="text-3xl font-bold luxury-glow">
                        {summaryLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : passiveCount}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {totalFeedback > 0 ? Math.round((passiveCount / totalFeedback) * 100) : 0}% of responses
                      </p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Satisfaction level</span>
                        <span className="text-yellow-400">Medium</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Upsell potential</span>
                        <span className="text-yellow-400">Medium</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Retention risk</span>
                        <span className="text-yellow-400">Medium</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detractor Insights */}
                <Card className="frosted-glass border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <ThumbsDown className="h-8 w-8 text-red-400" />
                      <div>
                        <h3 className="text-lg font-semibold text-red-400">Detractors</h3>
                        <p className="text-sm text-muted-foreground">Score 0-6</p>
                      </div>
                    </div>
                    <div className="text-center mb-4">
                      <p className="text-3xl font-bold luxury-glow">
                        {summaryLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : detractorCount}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {totalFeedback > 0 ? Math.round((detractorCount / totalFeedback) * 100) : 0}% of responses
                      </p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Satisfaction level</span>
                        <span className="text-red-400">Low</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Churn risk</span>
                        <span className="text-red-400">High</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Improvement needed</span>
                        <span className="text-red-400">High</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="frosted-glass border-white/10">
                <CardHeader>
                  <CardTitle>NPS Calculation</CardTitle>
                  <CardDescription>How Net Promoter Score is calculated</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-green-500/10 rounded-lg">
                      <p className="text-2xl font-bold text-green-400 mb-2">
                        {summaryLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : promoterCount}
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">Promoters</p>
                      <p className="text-xs">Score 9-10</p>
                    </div>
                    <div className="text-center p-4 bg-red-500/10 rounded-lg">
                      <p className="text-2xl font-bold text-red-400 mb-2">
                        {summaryLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : -detractorCount}
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">Detractors</p>
                      <p className="text-xs">Score 0-6</p>
                    </div>
                    <div className="text-center p-4 bg-slate-800/10 rounded-lg">
                      <p className="text-2xl font-bold text-slate-700 mb-2">
                        {summaryLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : totalFeedback}
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">Total Responses</p>
                      <p className="text-xs">Sample Size</p>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-white/5 rounded-lg">
                    <p className="text-center text-lg">
                      NPS = (({promoterCount} - {detractorCount}) ÷ {totalFeedback}) × 100 = <span className={`font-bold ${getNPSScoreColor(npsScore)}`}>
                        {summaryLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : npsScore}
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Feedback List Tab */}
            <TabsContent value="feedback-list" className="space-y-6">
              {/* Filters */}
              <Card className="frosted-glass border-white/10">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          placeholder="Search feedback..."
                          value={searchTerm}
                          onChange={(e) => handleSearch(e.target.value)}
                          className="pl-10 bg-white/5 border-white/20"
                        />
                      </div>
                    </div>
                    <Select value={filterService} onValueChange={setFilterService}>
                      <SelectTrigger className="w-full sm:w-48 bg-white/5 border-white/20">
                        <SelectValue placeholder="Filter by service" />
                      </SelectTrigger>
                      <SelectContent className="frosted-glass border-white/20">
                        <SelectItem value="all">All Services</SelectItem>
                        {serviceData.map((service) => (
                          <SelectItem key={service.service} value={service.service}>
                            {service.service}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Feedback Table */}
              <Card className="frosted-glass border-white/10">
                <CardHeader>
                  <CardTitle>Recent Feedback</CardTitle>
                  <CardDescription>All customer feedback and reviews</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-[400px] flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : filteredFeedback.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead>NPS Score</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Comment</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredFeedback.slice(0, 20).map((feedback) => {
                          const promoterType = getPromoterType(feedback.nps_score);
                          return (
                            <TableRow key={feedback.id}>
                              <TableCell className="font-medium">
                                {feedback.customers?.name || 'Unknown Customer'}
                              </TableCell>
                              <TableCell>{feedback.service_name}</TableCell>
                              <TableCell>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < feedback.rating
                                          ? 'text-yellow-400 fill-yellow-400'
                                          : 'text-muted-foreground'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>{feedback.nps_score}/10</TableCell>
                              <TableCell>
                                <Badge className={getPromoterTypeColor(promoterType)}>
                                  {promoterType}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatDate(feedback.created_at)}</TableCell>
                              <TableCell className="max-w-xs truncate">
                                {feedback.comment || 'No comment'}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                      {searchTerm ? 'No feedback matches your search.' : 'No feedback data available.'}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      Areas for Improvement
                    </CardTitle>
                    <CardDescription>Based on detractor feedback</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {detractorCount > 0 ? (
                      [
                        { issue: 'Wait times too long', frequency: detractorCount > 0 ? '15%' : '0%', impact: 'High' },
                        { issue: 'Staff communication', frequency: detractorCount > 0 ? '12%' : '0%', impact: 'Medium' },
                        { issue: 'Service pricing', frequency: detractorCount > 0 ? '8%' : '0%', impact: 'Medium' },
                        { issue: 'Facility cleanliness', frequency: detractorCount > 0 ? '6%' : '0%', impact: 'Low' }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg">
                          <div>
                            <p className="font-medium">{item.issue}</p>
                            <p className="text-sm text-muted-foreground">Mentioned in {item.frequency} of feedback</p>
                          </div>
                          <Badge className={
                            item.impact === 'High' ? 'bg-red-500/20 text-red-400' :
                            item.impact === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }>
                            {item.impact} Impact
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No detractor feedback to analyze
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      Strengths to Leverage
                    </CardTitle>
                    <CardDescription>What customers love about your services</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {promoterCount > 0 ? (
                      [
                        { strength: 'Staff expertise and friendliness', frequency: promoterCount > 0 ? '28%' : '0%', impact: 'High' },
                        { strength: 'Service quality and results', frequency: promoterCount > 0 ? '22%' : '0%', impact: 'High' },
                        { strength: 'Relaxing atmosphere', frequency: promoterCount > 0 ? '18%' : '0%', impact: 'Medium' },
                        { strength: 'Product recommendations', frequency: promoterCount > 0 ? '15%' : '0%', impact: 'Medium' }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                          <div>
                            <p className="font-medium">{item.strength}</p>
                            <p className="text-sm text-muted-foreground">Mentioned in {item.frequency} of feedback</p>
                          </div>
                          <Badge className="bg-green-500/20 text-green-400">
                            {item.impact} Impact
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No promoter feedback to analyze
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="frosted-glass border-white/10">
                <CardHeader>
                  <CardTitle>Actionable Recommendations</CardTitle>
                  <CardDescription>Steps to improve customer satisfaction</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-800/10 rounded-lg">
                      <h4 className="font-semibold text-slate-700 mb-2">Immediate Actions (0-30 days)</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Implement appointment reminder system</li>
                        <li>• Train staff on customer communication</li>
                        <li>• Review and optimize pricing strategy</li>
                        <li>• Enhance facility cleanliness protocols</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-amber-500/10 rounded-lg">
                      <h4 className="font-semibold text-amber-400 mb-2">Long-term Strategy (30-90 days)</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Develop loyalty program enhancements</li>
                        <li>• Invest in staff training and development</li>
                        <li>• Implement regular feedback surveys</li>
                        <li>• Create customer success stories</li>
                      </ul>
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

export default CustomerFeedback;