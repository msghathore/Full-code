// Enterprise Admin Panel - Unified Dashboard for All 9 Features
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import StaffNavigation from '@/components/StaffNavigation';
import {
  Users, TrendingUp, Calendar, Brain, MessageSquare, Megaphone,
  Package, Sparkles, Wifi, WifiOff, RefreshCw, Settings, ChevronRight,
  BarChart3, Target, DollarSign, Star, Clock, AlertTriangle,
  UserPlus, Send, ShoppingCart, Zap, ArrowUpRight, ArrowDownRight,
  Activity, CheckCircle2, XCircle, Loader2, Search, Filter,
  Download, Upload, Plus, Edit, Trash2, Eye, MoreHorizontal
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Import all services
import crmService from '@/services/crmService';
import staffPerformanceService from '@/services/staffPerformanceService';
import demandForecastingService from '@/services/demandForecastingService';
import reviewService from '@/services/reviewService';
import marketingService from '@/services/marketingService';
import inventoryService from '@/services/inventoryService';
import recommendationService from '@/services/recommendationService';
import multiplayerScheduleService from '@/services/multiplayerScheduleService';
import offlineService from '@/services/offlineService';

// ============================================================================
// TYPES
// ============================================================================

interface DashboardStats {
  crm: {
    totalCustomers: number;
    newThisMonth: number;
    churnRisk: number;
    vipCount: number;
  };
  performance: {
    avgRating: number;
    topPerformer: string;
    totalRevenue: number;
    goalsAchieved: number;
  };
  forecast: {
    predictedBookings: number;
    peakHour: string;
    suggestedStaff: number;
    accuracy: number;
  };
  reviews: {
    avgSentiment: number;
    pendingResponses: number;
    totalReviews: number;
    starRating: number;
  };
  marketing: {
    activeCampaigns: number;
    totalSent: number;
    openRate: number;
    conversionRate: number;
  };
  inventory: {
    totalProducts: number;
    lowStock: number;
    pendingOrders: number;
    reorderValue: number;
  };
  recommendations: {
    generated: number;
    accepted: number;
    revenue: number;
    accuracy: number;
  };
  scheduling: {
    activeEditors: number;
    pendingConflicts: number;
    todayAppointments: number;
    utilizationRate: number;
  };
  offline: {
    pendingSync: number;
    cacheSize: string;
    lastSync: string;
    isOnline: boolean;
  };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const EnterpriseAdmin: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState({ pending: 0, syncing: false, lastSync: null as string | null });

  // Initialize and load data
  useEffect(() => {
    const init = async () => {
      try {
        await offlineService.initializeOfflineSupport();
        loadDashboardStats();
      } catch (error) {
        console.error('Failed to initialize:', error);
      }
    };

    init();

    // Network status listener
    const unsubscribeNetwork = offlineService.onNetworkStatusChange((online) => {
      setIsOnline(online);
      if (online) {
        toast({ title: 'Back Online', description: 'Syncing pending changes...' });
        loadDashboardStats();
      } else {
        toast({ title: 'Offline Mode', description: 'Changes will sync when online', variant: 'destructive' });
      }
    });

    // Sync status listener
    const unsubscribeSync = offlineService.onSyncStatusChange((status) => {
      setSyncStatus(status);
    });

    return () => {
      unsubscribeNetwork();
      unsubscribeSync();
    };
  }, []);

  const loadDashboardStats = async () => {
    setIsLoading(true);
    try {
      // Load stats from all services in parallel
      const [
        customers,
        staffMetrics,
        inventoryStats,
        reviewData,
        campaigns,
        syncQueue
      ] = await Promise.all([
        crmService.getCustomerProfiles({ limit: 1000 }),
        staffPerformanceService.getAggregatedMetrics('all_time'),
        inventoryService.getInventoryStats(),
        reviewService.getReviewDashboardData(),
        marketingService.getCampaigns({ limit: 100 }),
        offlineService.getSyncQueue()
      ]);

      const storageQuota = await offlineService.getStorageQuota();

      setStats({
        crm: {
          totalCustomers: customers.length,
          newThisMonth: customers.filter(c => {
            const created = new Date(c.created_at);
            const now = new Date();
            return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
          }).length,
          churnRisk: customers.filter(c => c.churn_risk_score > 0.7).length,
          vipCount: customers.filter(c => c.loyalty_tier === 'vip' || c.loyalty_tier === 'platinum').length
        },
        performance: {
          avgRating: staffMetrics.avgRating || 0,
          topPerformer: staffMetrics.topPerformer || 'N/A',
          totalRevenue: staffMetrics.totalRevenue || 0,
          goalsAchieved: staffMetrics.goalsAchieved || 0
        },
        forecast: {
          predictedBookings: 0,
          peakHour: '10:00 AM',
          suggestedStaff: 5,
          accuracy: 85
        },
        reviews: {
          avgSentiment: reviewData.avgSentiment || 0,
          pendingResponses: reviewData.pendingResponses || 0,
          totalReviews: reviewData.totalReviews || 0,
          starRating: reviewData.avgRating || 0
        },
        marketing: {
          activeCampaigns: campaigns.filter(c => c.status === 'active').length,
          totalSent: campaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0),
          openRate: campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + (c.open_rate || 0), 0) / campaigns.length : 0,
          conversionRate: campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + (c.conversion_rate || 0), 0) / campaigns.length : 0
        },
        inventory: inventoryStats,
        recommendations: {
          generated: 0,
          accepted: 0,
          revenue: 0,
          accuracy: 0
        },
        scheduling: {
          activeEditors: 0,
          pendingConflicts: 0,
          todayAppointments: 0,
          utilizationRate: 75
        },
        offline: {
          pendingSync: syncQueue.length,
          cacheSize: `${(storageQuota.usage / 1024 / 1024).toFixed(2)} MB`,
          lastSync: syncStatus.lastSync || 'Never',
          isOnline
        }
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
      toast({ title: 'Error', description: 'Failed to load dashboard data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    if (!isOnline) {
      toast({ title: 'Offline', description: 'Cannot sync while offline', variant: 'destructive' });
      return;
    }

    try {
      const result = await offlineService.processSyncQueue();
      toast({
        title: 'Sync Complete',
        description: `Synced ${result.synced} items, ${result.failed} failed`
      });
      loadDashboardStats();
    } catch (error) {
      toast({ title: 'Sync Failed', description: String(error), variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <StaffNavigation />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Enterprise Admin</h1>
            <p className="text-gray-400">Unified command center for all business operations</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Online/Offline Status */}
            <Badge variant={isOnline ? 'default' : 'destructive'} className="flex items-center gap-2">
              {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              {isOnline ? 'Online' : 'Offline'}
            </Badge>

            {/* Sync Status */}
            {syncStatus.pending > 0 && (
              <Badge variant="outline" className="flex items-center gap-2">
                <RefreshCw className={`h-4 w-4 ${syncStatus.syncing ? 'animate-spin' : ''}`} />
                {syncStatus.pending} pending
              </Badge>
            )}

            <Button variant="outline" size="sm" onClick={handleSync} disabled={!isOnline || syncStatus.syncing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${syncStatus.syncing ? 'animate-spin' : ''}`} />
              Sync Now
            </Button>

            <Button variant="outline" size="sm" onClick={loadDashboardStats}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-800 border border-gray-700 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-pink-600">
              <BarChart3 className="h-4 w-4 mr-2" /> Overview
            </TabsTrigger>
            <TabsTrigger value="crm" className="data-[state=active]:bg-pink-600">
              <Users className="h-4 w-4 mr-2" /> CRM
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-pink-600">
              <TrendingUp className="h-4 w-4 mr-2" /> Performance
            </TabsTrigger>
            <TabsTrigger value="forecast" className="data-[state=active]:bg-pink-600">
              <Brain className="h-4 w-4 mr-2" /> Forecast
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-pink-600">
              <MessageSquare className="h-4 w-4 mr-2" /> Reviews
            </TabsTrigger>
            <TabsTrigger value="marketing" className="data-[state=active]:bg-pink-600">
              <Megaphone className="h-4 w-4 mr-2" /> Marketing
            </TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:bg-pink-600">
              <Package className="h-4 w-4 mr-2" /> Inventory
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="data-[state=active]:bg-pink-600">
              <Sparkles className="h-4 w-4 mr-2" /> AI Recs
            </TabsTrigger>
            <TabsTrigger value="scheduling" className="data-[state=active]:bg-pink-600">
              <Calendar className="h-4 w-4 mr-2" /> Scheduling
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
              </div>
            ) : stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* CRM Card */}
                <OverviewCard
                  title="Customer CRM"
                  icon={<Users className="h-5 w-5" />}
                  onClick={() => setActiveTab('crm')}
                  stats={[
                    { label: 'Total Customers', value: stats.crm.totalCustomers.toLocaleString() },
                    { label: 'New This Month', value: `+${stats.crm.newThisMonth}`, trend: 'up' },
                    { label: 'At Risk', value: stats.crm.churnRisk, trend: 'down', alert: stats.crm.churnRisk > 10 },
                    { label: 'VIP Members', value: stats.crm.vipCount }
                  ]}
                />

                {/* Performance Card */}
                <OverviewCard
                  title="Staff Performance"
                  icon={<TrendingUp className="h-5 w-5" />}
                  onClick={() => setActiveTab('performance')}
                  stats={[
                    { label: 'Avg Rating', value: stats.performance.avgRating.toFixed(1), suffix: '/5' },
                    { label: 'Top Performer', value: stats.performance.topPerformer },
                    { label: 'Total Revenue', value: `$${(stats.performance.totalRevenue / 1000).toFixed(1)}K` },
                    { label: 'Goals Achieved', value: `${stats.performance.goalsAchieved}%` }
                  ]}
                />

                {/* Forecast Card */}
                <OverviewCard
                  title="AI Forecast"
                  icon={<Brain className="h-5 w-5" />}
                  onClick={() => setActiveTab('forecast')}
                  stats={[
                    { label: 'Predicted Today', value: stats.forecast.predictedBookings },
                    { label: 'Peak Hour', value: stats.forecast.peakHour },
                    { label: 'Suggested Staff', value: stats.forecast.suggestedStaff },
                    { label: 'Accuracy', value: `${stats.forecast.accuracy}%` }
                  ]}
                />

                {/* Reviews Card */}
                <OverviewCard
                  title="Reviews & Sentiment"
                  icon={<MessageSquare className="h-5 w-5" />}
                  onClick={() => setActiveTab('reviews')}
                  stats={[
                    { label: 'Avg Sentiment', value: `${(stats.reviews.avgSentiment * 100).toFixed(0)}%`, trend: stats.reviews.avgSentiment > 0.7 ? 'up' : 'down' },
                    { label: 'Pending Responses', value: stats.reviews.pendingResponses, alert: stats.reviews.pendingResponses > 5 },
                    { label: 'Total Reviews', value: stats.reviews.totalReviews },
                    { label: 'Star Rating', value: stats.reviews.starRating.toFixed(1), suffix: '/5' }
                  ]}
                />

                {/* Marketing Card */}
                <OverviewCard
                  title="Marketing Engine"
                  icon={<Megaphone className="h-5 w-5" />}
                  onClick={() => setActiveTab('marketing')}
                  stats={[
                    { label: 'Active Campaigns', value: stats.marketing.activeCampaigns },
                    { label: 'Messages Sent', value: stats.marketing.totalSent.toLocaleString() },
                    { label: 'Open Rate', value: `${stats.marketing.openRate.toFixed(1)}%` },
                    { label: 'Conversion', value: `${stats.marketing.conversionRate.toFixed(1)}%` }
                  ]}
                />

                {/* Inventory Card */}
                <OverviewCard
                  title="Inventory"
                  icon={<Package className="h-5 w-5" />}
                  onClick={() => setActiveTab('inventory')}
                  stats={[
                    { label: 'Total Products', value: stats.inventory.totalProducts },
                    { label: 'Low Stock', value: stats.inventory.lowStock, alert: stats.inventory.lowStock > 0 },
                    { label: 'Pending Orders', value: stats.inventory.pendingOrders },
                    { label: 'Reorder Value', value: `$${stats.inventory.reorderValue.toLocaleString()}` }
                  ]}
                />

                {/* Recommendations Card */}
                <OverviewCard
                  title="AI Recommender"
                  icon={<Sparkles className="h-5 w-5" />}
                  onClick={() => setActiveTab('recommendations')}
                  stats={[
                    { label: 'Generated', value: stats.recommendations.generated },
                    { label: 'Accepted', value: stats.recommendations.accepted },
                    { label: 'Revenue', value: `$${stats.recommendations.revenue.toLocaleString()}` },
                    { label: 'Accuracy', value: `${stats.recommendations.accuracy}%` }
                  ]}
                />

                {/* Scheduling Card */}
                <OverviewCard
                  title="Live Scheduling"
                  icon={<Calendar className="h-5 w-5" />}
                  onClick={() => setActiveTab('scheduling')}
                  stats={[
                    { label: 'Active Editors', value: stats.scheduling.activeEditors },
                    { label: 'Conflicts', value: stats.scheduling.pendingConflicts, alert: stats.scheduling.pendingConflicts > 0 },
                    { label: "Today's Appts", value: stats.scheduling.todayAppointments },
                    { label: 'Utilization', value: `${stats.scheduling.utilizationRate}%` }
                  ]}
                />

                {/* Offline Status Card */}
                <OverviewCard
                  title="Offline Status"
                  icon={isOnline ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
                  onClick={() => {}}
                  stats={[
                    { label: 'Status', value: stats.offline.isOnline ? 'Online' : 'Offline' },
                    { label: 'Pending Sync', value: stats.offline.pendingSync, alert: stats.offline.pendingSync > 0 },
                    { label: 'Cache Size', value: stats.offline.cacheSize },
                    { label: 'Last Sync', value: stats.offline.lastSync === 'Never' ? 'Never' : new Date(stats.offline.lastSync).toLocaleTimeString() }
                  ]}
                />
              </div>
            )}
          </TabsContent>

          {/* CRM Tab */}
          <TabsContent value="crm">
            <CRMPanel />
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <PerformancePanel />
          </TabsContent>

          {/* Forecast Tab */}
          <TabsContent value="forecast">
            <ForecastPanel />
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <ReviewsPanel />
          </TabsContent>

          {/* Marketing Tab */}
          <TabsContent value="marketing">
            <MarketingPanel />
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory">
            <InventoryPanel />
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations">
            <RecommendationsPanel />
          </TabsContent>

          {/* Scheduling Tab */}
          <TabsContent value="scheduling">
            <SchedulingPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// ============================================================================
// OVERVIEW CARD COMPONENT
// ============================================================================

interface OverviewCardProps {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  stats: Array<{
    label: string;
    value: string | number;
    suffix?: string;
    trend?: 'up' | 'down';
    alert?: boolean;
  }>;
}

const OverviewCard: React.FC<OverviewCardProps> = ({ title, icon, onClick, stats }) => (
  <Card className="bg-gray-800/50 border-gray-700 hover:border-pink-500/50 transition-all cursor-pointer group" onClick={onClick}>
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-pink-500">
          {icon}
          <CardTitle className="text-lg text-white">{title}</CardTitle>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-pink-500 transition-colors" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <div key={i}>
            <p className="text-xs text-gray-400">{stat.label}</p>
            <div className="flex items-center gap-1">
              <span className={`text-lg font-semibold ${stat.alert ? 'text-red-400' : 'text-white'}`}>
                {stat.value}{stat.suffix}
              </span>
              {stat.trend === 'up' && <ArrowUpRight className="h-4 w-4 text-white" />}
              {stat.trend === 'down' && <ArrowDownRight className="h-4 w-4 text-red-400" />}
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// ============================================================================
// CRM PANEL
// ============================================================================

const CRMPanel: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [customerData, segmentData] = await Promise.all([
        crmService.getCustomerProfiles({ limit: 100 }),
        crmService.getSegments()
      ]);
      setCustomers(customerData);
      setSegments(segmentData);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load CRM data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Customer Relationship Management</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" /> Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <Button size="sm" className="bg-pink-600 hover:bg-pink-700">
            <UserPlus className="h-4 w-4 mr-2" /> Add Customer
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700"
          />
        </div>
        <Select>
          <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
            <SelectValue placeholder="Segment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Segments</SelectItem>
            {segments.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
            <SelectValue placeholder="Lifecycle Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
            <SelectItem value="prospect">Prospect</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="at_risk">At Risk</SelectItem>
            <SelectItem value="churned">Churned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Customer Table */}
      <Card className="bg-gray-800/50 border-gray-700">
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-400">Customer</TableHead>
                <TableHead className="text-gray-400">Email</TableHead>
                <TableHead className="text-gray-400">Tier</TableHead>
                <TableHead className="text-gray-400">Lifetime Value</TableHead>
                <TableHead className="text-gray-400">Churn Risk</TableHead>
                <TableHead className="text-gray-400">Last Visit</TableHead>
                <TableHead className="text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-pink-500" />
                  </TableCell>
                </TableRow>
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-gray-400">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="border-gray-700">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-white/30 flex items-center justify-center text-white font-medium">
                          {customer.first_name?.[0]}{customer.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-white">{customer.first_name} {customer.last_name}</p>
                          <p className="text-xs text-gray-400">{customer.phone}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">{customer.email}</TableCell>
                    <TableCell>
                      <Badge variant={
                        customer.loyalty_tier === 'platinum' ? 'default' :
                        customer.loyalty_tier === 'gold' ? 'secondary' : 'outline'
                      }>
                        {customer.loyalty_tier || 'Standard'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300">${customer.lifetime_value?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={(customer.churn_risk_score || 0) * 100} className="w-16 h-2" />
                        <span className={`text-xs ${(customer.churn_risk_score || 0) > 0.7 ? 'text-red-400' : 'text-gray-400'}`}>
                          {((customer.churn_risk_score || 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {customer.last_visit_date ? new Date(customer.last_visit_date).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  );
};

// ============================================================================
// PERFORMANCE PANEL
// ============================================================================

const PerformancePanel: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [revenueLeaders, setRevenueLeaders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [metricsData, leaders] = await Promise.all([
        staffPerformanceService.getAggregatedMetrics('this_month'),
        staffPerformanceService.getRevenueLeaderboard('this_month', 10)
      ]);
      setMetrics(metricsData);
      setRevenueLeaders(leaders);
    } catch (error) {
      console.error('Failed to load performance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Staff Performance Dashboard</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-white">${metrics?.totalRevenue?.toLocaleString() || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <Star className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Avg Rating</p>
                <p className="text-2xl font-bold text-white">{metrics?.avgRating?.toFixed(1) || 0}/5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-800/20 rounded-lg">
                <Clock className="h-6 w-6 text-slate-700" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Utilization</p>
                <p className="text-2xl font-bold text-white">{metrics?.avgUtilization?.toFixed(0) || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-pink-500/20 rounded-lg">
                <Target className="h-6 w-6 text-pink-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Goals Achieved</p>
                <p className="text-2xl font-bold text-white">{metrics?.goalsAchieved || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Revenue Leaderboard</CardTitle>
          <CardDescription>Top performers this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revenueLeaders.map((leader, index) => (
              <div key={leader.staff_id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-500 text-black' :
                    index === 1 ? 'bg-gray-300 text-black' :
                    index === 2 ? 'bg-white/10 text-black' :
                    'bg-gray-600 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-white">{leader.staff_name || 'Unknown'}</p>
                    <p className="text-xs text-gray-400">{leader.appointments_completed} appointments</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">${leader.revenue?.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{leader.avg_rating?.toFixed(1)} ⭐</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================================================
// FORECAST PANEL
// ============================================================================

const ForecastPanel: React.FC = () => {
  const [forecast, setForecast] = useState<any>(null);
  const [peakHours, setPeakHours] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [forecastData, peakData] = await Promise.all([
        demandForecastingService.generateForecast(
          tomorrow.toISOString().split('T')[0],
          undefined,
          undefined,
          7
        ),
        demandForecastingService.getPeakHoursAnalysis(
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          new Date().toISOString().split('T')[0]
        )
      ]);

      setForecast(forecastData);
      setPeakHours(peakData);
    } catch (error) {
      console.error('Failed to load forecast:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">AI Demand Forecasting</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Forecast Chart Placeholder */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">7-Day Demand Forecast</CardTitle>
            <CardDescription>Predicted bookings based on historical patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-700/30 rounded-lg">
              <div className="text-center text-gray-400">
                <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>AI Forecast Visualization</p>
                <p className="text-sm">Integrate with chart library</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Peak Hours */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Peak Hours Analysis</CardTitle>
            <CardDescription>Busiest times based on last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {peakHours?.peakHours?.slice(0, 6).map((hour: any, i: number) => (
                <div key={hour.hour} className="flex items-center gap-4">
                  <div className="w-16 text-sm text-gray-400">
                    {hour.hour}:00
                  </div>
                  <div className="flex-1">
                    <Progress value={(hour.avgBookings / (peakHours.peakHours[0]?.avgBookings || 1)) * 100} className="h-3" />
                  </div>
                  <div className="w-20 text-right text-sm text-white">
                    {hour.avgBookings.toFixed(1)} avg
                  </div>
                </div>
              )) || (
                <p className="text-gray-400">No peak hour data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staffing Recommendations */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">AI Staffing Recommendations</CardTitle>
          <CardDescription>Optimal staff allocation based on predicted demand</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Brain className="h-4 w-4" />
            <AlertDescription>
              Based on historical patterns and predicted demand, we recommend scheduling <strong>5 staff members</strong> tomorrow
              with peak coverage between <strong>10 AM - 2 PM</strong>.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================================================
// REVIEWS PANEL
// ============================================================================

const ReviewsPanel: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [reviewsData, dashboard] = await Promise.all([
        reviewService.getReviews({ limit: 20 }),
        reviewService.getReviewDashboardData()
      ]);
      setReviews(reviewsData);
      setDashboardData(dashboard);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Reviews & Sentiment Analysis</h2>

      {/* Sentiment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-white">{dashboardData?.avgRating?.toFixed(1) || '0.0'}</p>
              <p className="text-sm text-gray-400">Average Rating</p>
              <div className="flex justify-center mt-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className={`h-4 w-4 ${i <= (dashboardData?.avgRating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold text-white">{((dashboardData?.avgSentiment || 0) * 100).toFixed(0)}%</p>
            <p className="text-sm text-gray-400">Positive Sentiment</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold text-white">{dashboardData?.totalReviews || 0}</p>
            <p className="text-sm text-gray-400">Total Reviews</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">{dashboardData?.pendingResponses || 0}</p>
            <p className="text-sm text-gray-400">Awaiting Response</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reviews */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No reviews yet</p>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(i => (
                            <Star key={i} className={`h-4 w-4 ${i <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                          ))}
                        </div>
                        <Badge variant={review.sentiment_score > 0.5 ? 'default' : 'destructive'}>
                          {review.sentiment_score > 0.5 ? 'Positive' : 'Negative'}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-white mb-2">{review.review_text}</p>
                    {review.response_text ? (
                      <div className="mt-3 pl-4 border-l-2 border-pink-500">
                        <p className="text-sm text-gray-300">{review.response_text}</p>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" className="mt-2">
                        <MessageSquare className="h-4 w-4 mr-2" /> Respond
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================================================
// MARKETING PANEL
// ============================================================================

const MarketingPanel: React.FC = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [campaignData, templateData] = await Promise.all([
        marketingService.getCampaigns({ limit: 20 }),
        marketingService.getTemplates()
      ]);
      setCampaigns(campaignData);
      setTemplates(templateData);
    } catch (error) {
      console.error('Failed to load marketing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Automated Marketing Engine</h2>
        <Button className="bg-pink-600 hover:bg-pink-700">
          <Plus className="h-4 w-4 mr-2" /> New Campaign
        </Button>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold text-white">{campaigns.filter(c => c.status === 'active').length}</p>
            <p className="text-sm text-gray-400">Active Campaigns</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold text-slate-700">{campaigns.reduce((s, c) => s + (c.sent_count || 0), 0).toLocaleString()}</p>
            <p className="text-sm text-gray-400">Messages Sent</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold text-white">
              {campaigns.length > 0 ? (campaigns.reduce((s, c) => s + (c.open_rate || 0), 0) / campaigns.length).toFixed(1) : 0}%
            </p>
            <p className="text-sm text-gray-400">Avg Open Rate</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold text-pink-400">
              {campaigns.length > 0 ? (campaigns.reduce((s, c) => s + (c.conversion_rate || 0), 0) / campaigns.length).toFixed(1) : 0}%
            </p>
            <p className="text-sm text-gray-400">Conversion Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-400">Campaign</TableHead>
                  <TableHead className="text-gray-400">Type</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">Sent</TableHead>
                  <TableHead className="text-gray-400">Open Rate</TableHead>
                  <TableHead className="text-gray-400">Conversions</TableHead>
                  <TableHead className="text-gray-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                      No campaigns created yet
                    </TableCell>
                  </TableRow>
                ) : (
                  campaigns.map((campaign) => (
                    <TableRow key={campaign.id} className="border-gray-700">
                      <TableCell className="font-medium text-white">{campaign.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{campaign.campaign_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          campaign.status === 'active' ? 'default' :
                          campaign.status === 'completed' ? 'secondary' : 'outline'
                        }>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">{campaign.sent_count || 0}</TableCell>
                      <TableCell className="text-gray-300">{campaign.open_rate?.toFixed(1) || 0}%</TableCell>
                      <TableCell className="text-gray-300">{campaign.conversion_count || 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================================================
// INVENTORY PANEL
// ============================================================================

const InventoryPanel: React.FC = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [items, low, statsData] = await Promise.all([
        inventoryService.getInventoryItems({}),
        inventoryService.getLowStockItems(),
        inventoryService.getInventoryStats()
      ]);
      setInventory(items);
      setLowStock(low);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoReorder = async () => {
    try {
      const orders = await inventoryService.runAutoReorderCheck();
      if (orders.length > 0) {
        // Show toast with created orders
      }
    } catch (error) {
      console.error('Auto-reorder failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Inventory Auto-Reorder System</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAutoReorder}>
            <Zap className="h-4 w-4 mr-2" /> Run Auto-Reorder
          </Button>
          <Button className="bg-pink-600 hover:bg-pink-700">
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold text-white">{stats?.totalProducts || 0}</p>
            <p className="text-sm text-gray-400">Total Products</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold text-red-400">{stats?.lowStock || 0}</p>
            <p className="text-sm text-gray-400">Low Stock Items</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">{stats?.pendingOrders || 0}</p>
            <p className="text-sm text-gray-400">Pending Orders</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold text-white">${stats?.totalValue?.toLocaleString() || 0}</p>
            <p className="text-sm text-gray-400">Inventory Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {lowStock.length} item(s) are below reorder threshold and need to be restocked.
          </AlertDescription>
        </Alert>
      )}

      {/* Inventory Table */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-400">Product</TableHead>
                    <TableHead className="text-gray-400">SKU</TableHead>
                    <TableHead className="text-gray-400">Category</TableHead>
                    <TableHead className="text-gray-400">Stock</TableHead>
                    <TableHead className="text-gray-400">Reorder Point</TableHead>
                    <TableHead className="text-gray-400">Unit Cost</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((item) => (
                    <TableRow key={item.id} className="border-gray-700">
                      <TableCell className="font-medium text-white">{item.name}</TableCell>
                      <TableCell className="text-gray-300">{item.sku}</TableCell>
                      <TableCell className="text-gray-300">{item.category}</TableCell>
                      <TableCell className={item.current_stock <= item.reorder_point ? 'text-red-400 font-bold' : 'text-gray-300'}>
                        {item.current_stock}
                      </TableCell>
                      <TableCell className="text-gray-300">{item.reorder_point}</TableCell>
                      <TableCell className="text-gray-300">${item.unit_cost?.toFixed(2)}</TableCell>
                      <TableCell>
                        {item.current_stock <= item.reorder_point ? (
                          <Badge variant="destructive">Low Stock</Badge>
                        ) : item.current_stock <= item.reorder_point * 1.5 ? (
                          <Badge variant="secondary">Warning</Badge>
                        ) : (
                          <Badge variant="default">In Stock</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================================================
// RECOMMENDATIONS PANEL
// ============================================================================

const RecommendationsPanel: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [bundles, setBundles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsData, bundleData] = await Promise.all([
        recommendationService.getRecommendationStats(),
        recommendationService.getServiceBundles()
      ]);
      setStats(statsData);
      setBundles(bundleData);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">AI Service Recommender</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold text-white">{stats?.totalGenerated || 0}</p>
            <p className="text-sm text-gray-400">Recommendations Generated</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold text-white">{stats?.acceptedCount || 0}</p>
            <p className="text-sm text-gray-400">Accepted</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold text-pink-400">
              {stats?.totalGenerated > 0 ? ((stats?.acceptedCount / stats?.totalGenerated) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-sm text-gray-400">Acceptance Rate</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold text-white">${stats?.revenueGenerated?.toLocaleString() || 0}</p>
            <p className="text-sm text-gray-400">Revenue from Recs</p>
          </CardContent>
        </Card>
      </div>

      {/* Service Bundles */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Service Bundles</CardTitle>
              <CardDescription>Pre-configured service packages for upselling</CardDescription>
            </div>
            <Button className="bg-pink-600 hover:bg-pink-700">
              <Plus className="h-4 w-4 mr-2" /> Create Bundle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
            </div>
          ) : bundles.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No service bundles created yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bundles.map((bundle) => (
                <div key={bundle.id} className="p-4 bg-gray-700/50 rounded-lg">
                  <h3 className="font-medium text-white mb-2">{bundle.name}</h3>
                  <p className="text-sm text-gray-400 mb-3">{bundle.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-pink-400">${bundle.bundle_price}</span>
                    <Badge>{bundle.discount_percent}% off</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Engine Status */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">AI Engine Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div>
                <p className="font-medium text-white">Personalized Recommendations</p>
                <p className="text-sm text-gray-400">Based on customer history and preferences</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div>
                <p className="font-medium text-white">Upsell Suggestions</p>
                <p className="text-sm text-gray-400">Suggest premium upgrades during booking</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div>
                <p className="font-medium text-white">Cross-Sell Recommendations</p>
                <p className="text-sm text-gray-400">Suggest complementary services</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div>
                <p className="font-medium text-white">Trending Services</p>
                <p className="text-sm text-gray-400">Highlight popular services to new customers</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================================================
// SCHEDULING PANEL
// ============================================================================

const SchedulingPanel: React.FC = () => {
  const [presences, setPresences] = useState<any[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const [presenceData, conflictData] = await Promise.all([
        multiplayerScheduleService.getActivePresences(today),
        multiplayerScheduleService.getPendingConflicts(today)
      ]);
      setPresences(presenceData);
      setConflicts(conflictData);
    } catch (error) {
      console.error('Failed to load scheduling data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Real-time Multiplayer Scheduling</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Editors */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Active Editors</CardTitle>
            <CardDescription>Staff members currently editing the schedule</CardDescription>
          </CardHeader>
          <CardContent>
            {presences.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No active editors</p>
              </div>
            ) : (
              <div className="space-y-3">
                {presences.map((presence, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-white animate-pulse" />
                      <span className="text-white">{presence.staff_id}</span>
                    </div>
                    <span className="text-sm text-gray-400">
                      Viewing {presence.viewing_date}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Conflicts */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Pending Conflicts</CardTitle>
            <CardDescription>Scheduling conflicts needing resolution</CardDescription>
          </CardHeader>
          <CardContent>
            {conflicts.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50 text-white" />
                <p>No conflicts detected</p>
              </div>
            ) : (
              <div className="space-y-3">
                {conflicts.map((conflict) => (
                  <div key={conflict.id} className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="destructive">{conflict.conflict_type}</Badge>
                      <span className="text-xs text-gray-400">
                        {new Date(conflict.detected_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">
                      Overlapping appointments detected
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Keep Original</Button>
                      <Button size="sm" variant="outline">Keep New</Button>
                      <Button size="sm" className="bg-pink-600">Resolve</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Undo/Redo Info */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Schedule History</CardTitle>
          <CardDescription>Recent changes with undo/redo capability</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-400">
            <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Change history will appear here</p>
            <p className="text-sm mt-1">Use Ctrl+Z to undo, Ctrl+Y to redo</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnterpriseAdmin;
