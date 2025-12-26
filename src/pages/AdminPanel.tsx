import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  verifyAdminPassword,
  isAdminAuthenticated,
  setAdminSession,
  clearAdminSession,
  updateAdminActivity,
  generateTempPassword,
  hashStaffPassword,
  ADMIN_SESSION_TIMEOUT
} from '@/lib/adminAuth';
import { getStaffColor, STAFF_COLOR_OPTIONS } from '@/lib/colorConstants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Lock,
  Users,
  Plus,
  Edit,
  Trash2,
  Info,
  Shield,
  History,
  LogOut,
  Eye,
  EyeOff,
  RefreshCw,
  Search,
  DollarSign,
  Calendar,
  Activity,
  Clock,
  Star,
  BarChart3,
  // Enterprise icons
  TrendingUp,
  Target,
  MessageSquare,
  Mail,
  Package,
  Brain,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Award,
  Zap,
  ShoppingCart,
  Send,
  PieChart,
  LayoutGrid
} from 'lucide-react';

// Enterprise Services
import * as crmService from '@/services/crmService';
import * as staffPerformanceService from '@/services/staffPerformanceService';
import * as demandForecastingService from '@/services/demandForecastingService';
import * as reviewService from '@/services/reviewService';
import * as marketingService from '@/services/marketingService';
import * as inventoryService from '@/services/inventoryService';
import * as recommendationService from '@/services/recommendationService';
import * as multiplayerScheduleService from '@/services/multiplayerScheduleService';
import * as offlineService from '@/services/offlineService';

// Enterprise Types
import type {
  CustomerProfile,
  StaffPerformanceMetrics,
  StaffGoal,
  DemandForecast,
  CustomerReview,
  MarketingCampaign,
  InventoryItem,
  ServiceRecommendation,
  SchedulePresence
} from '@/types/enterprise';

// Types
interface StaffMember {
  id: string;
  name: string;
  username: string;
  password: string | null;
  role: string;
  specialty: string;
  status: string;
  access_level: string;
  color: string;
  avatar: string | null;
  temp_password: string | null;
  created_at: string;
  updated_at: string;
}

// Helper to split full name into first/last
const splitName = (fullName: string): { firstName: string; lastName: string } => {
  const parts = (fullName || '').trim().split(' ');
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';
  return { firstName, lastName };
};

interface StaffPermissions {
  id: string;
  staff_id: string;
  inventory_access: boolean;
  read_only_mode: boolean;
  checkout_access: boolean;
  calendar_access: boolean;
  analytics_access: boolean;
  settings_access: boolean;
  customer_management_access: boolean;
}

interface AuditLogEntry {
  id: string;
  staff_id: string | null;
  staff_name: string;
  action_type: string;
  page_accessed: string | null;
  details: string | null;
  ip_address: string | null;
  created_at: string;
}

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Data state
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [permissions, setPermissions] = useState<Record<string, StaffPermissions>>({});
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Analytics state (for Overview tab)
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [activeCustomers, setActiveCustomers] = useState(0);
  const [nps, setNps] = useState(0);
  const [recentBookings, setRecentBookings] = useState<Array<{
    id: string;
    date: string;
    service: string;
    customer: string;
    price: number;
  }>>([]);

  // Customers state
  const [customers, setCustomers] = useState<Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    loyalty_points: number;
    last_visit: string | null;
    created_at: string;
  }>>([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerFilter, setCustomerFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');
  const [customersLoading, setCustomersLoading] = useState(false);

  // Revenue state
  const [popularServices, setPopularServices] = useState<Array<{
    id: string;
    name: string;
    bookings: number;
    revenue: number;
  }>>([]);
  const [revenueByPeriod, setRevenueByPeriod] = useState<{
    today: number;
    thisWeek: number;
    thisMonth: number;
  }>({ today: 0, thisWeek: 0, thisMonth: 0 });

  // System status state
  const [systemStatus, setSystemStatus] = useState<{
    database: 'online' | 'offline' | 'checking';
    booking: 'online' | 'offline' | 'checking';
    payment: 'online' | 'offline' | 'checking';
    website: 'online' | 'offline' | 'checking';
  }>({
    database: 'checking',
    booking: 'checking',
    payment: 'checking',
    website: 'checking'
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'revenue' | 'staff' | 'audit' | 'content' | 'crm' | 'performance' | 'forecast' | 'reviews' | 'marketing' | 'inventory' | 'recommendations' | 'scheduling'>('overview');

  // Enterprise state
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState({ pending: 0, syncing: false });
  const [enterpriseStats, setEnterpriseStats] = useState({
    totalProfiles: 0,
    atRiskCustomers: 0,
    avgPerformance: 0,
    topPerformer: '',
    forecastAccuracy: 0,
    avgSentiment: 0,
    activeCampaigns: 0,
    lowStockItems: 0,
    pendingRecommendations: 0
  });
  const [crmProfiles, setCrmProfiles] = useState<CustomerProfile[]>([]);
  const [staffMetrics, setStaffMetrics] = useState<StaffPerformanceMetrics[]>([]);
  const [staffGoals, setStaffGoals] = useState<StaffGoal[]>([]);
  const [forecasts, setForecasts] = useState<DemandForecast[]>([]);
  const [customerReviews, setCustomerReviews] = useState<CustomerReview[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [recommendations, setRecommendations] = useState<ServiceRecommendation[]>([]);
  const [schedulePresence, setSchedulePresence] = useState<SchedulePresence[]>([]);
  const [enterpriseLoading, setEnterpriseLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    password: '',
    avatar: '',
    role: 'junior',
    specialty: '',
    color: 'blue'
  });

  // Activity tracking for session timeout
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleActivity = () => updateAdminActivity();
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    events.forEach(event => window.addEventListener(event, handleActivity));

    // Check session every 30 seconds
    const intervalId = setInterval(() => {
      if (!isAdminAuthenticated()) {
        setIsAuthenticated(false);
        toast({
          title: 'Session Expired',
          description: 'You have been logged out due to inactivity.',
          variant: 'destructive'
        });
      }
    }, 30000);

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      clearInterval(intervalId);
    };
  }, [isAuthenticated, toast]);

  // Check existing session on mount
  useEffect(() => {
    if (isAdminAuthenticated()) {
      setIsAuthenticated(true);
      fetchData();
      fetchAnalyticsData();
      checkSystemStatus();
      fetchCustomers();
      fetchRevenueData();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Refetch customers when filter changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchCustomers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerFilter, isAuthenticated]);

  // Fetch all data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch staff
      console.log('Fetching staff data...');
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('*')
        .order('created_at', { ascending: true });

      console.log('Staff data result:', { staffData, staffError });

      if (staffError) {
        console.error('Staff fetch error:', staffError);
        // Don't throw - just show empty state
        setStaff([]);
      } else {
        // Filter out any staff entries with missing required fields
        const validStaff = (staffData || []).filter(s => s.id && s.name);
        console.log('Valid staff entries:', validStaff.length);
        setStaff(validStaff);
      }

      // Fetch permissions
      const { data: permData, error: permError } = await supabase
        .from('staff_permissions')
        .select('*');

      if (permError) {
        console.log('Permissions table may not exist yet:', permError);
      } else {
        const permMap: Record<string, StaffPermissions> = {};
        permData?.forEach(p => {
          permMap[p.staff_id] = p;
        });
        setPermissions(permMap);
      }

      // Fetch audit log (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: auditData, error: auditError } = await supabase
        .from('access_audit_log')
        .select('*')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (auditError) {
        console.log('Audit log table may not exist yet:', auditError);
      } else {
        setAuditLog(auditData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data. Some tables may not exist yet.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch analytics data for Overview tab
  const fetchAnalyticsData = useCallback(async () => {
    try {
      // Fetch total revenue from transactions
      const { data: transactions, error: revenueError } = await supabase
        .from('transactions')
        .select('total_amount')
        .eq('status', 'completed');

      if (!revenueError && transactions) {
        const revenue = transactions.reduce((sum, t) => sum + (t.total_amount || 0), 0);
        setTotalRevenue(revenue);
      }

      // Fetch total bookings from appointments
      const { count: bookingsCount, error: bookingsError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'cancelled');

      if (!bookingsError) {
        setTotalBookings(bookingsCount || 0);
      }

      // Fetch active customers
      const { count: customersCount, error: customersError } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      if (!customersError) {
        setActiveCustomers(customersCount || 0);
      }

      // Fetch recent bookings (last 5)
      const { data: bookings, error: recentBookingsError } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          total_amount,
          full_name,
          services(name)
        `)
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!recentBookingsError && bookings) {
        const formattedBookings = bookings.map(booking => ({
          id: booking.id,
          date: booking.appointment_date,
          service: (booking.services as any)?.name || 'Unknown Service',
          customer: booking.full_name || 'Unknown Customer',
          price: booking.total_amount || 0
        }));
        setRecentBookings(formattedBookings);
      }

      // For NPS - set to 0 as feedback system not yet implemented
      setNps(0);

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    }
  }, []);

  // Check system status
  const checkSystemStatus = useCallback(async () => {
    setSystemStatus({
      database: 'checking',
      booking: 'checking',
      payment: 'checking',
      website: 'checking'
    });

    // Check database connection
    try {
      const { error } = await supabase.from('staff').select('id').limit(1);
      setSystemStatus(prev => ({ ...prev, database: error ? 'offline' : 'online' }));
    } catch {
      setSystemStatus(prev => ({ ...prev, database: 'offline' }));
    }

    // Check booking system (appointments table)
    try {
      const { error } = await supabase.from('appointments').select('id').limit(1);
      setSystemStatus(prev => ({ ...prev, booking: error ? 'offline' : 'online' }));
    } catch {
      setSystemStatus(prev => ({ ...prev, booking: 'offline' }));
    }

    // Check payment system (transactions table)
    try {
      const { error } = await supabase.from('transactions').select('id').limit(1);
      setSystemStatus(prev => ({ ...prev, payment: error ? 'offline' : 'online' }));
    } catch {
      setSystemStatus(prev => ({ ...prev, payment: 'offline' }));
    }

    // Check website (services table as proxy)
    try {
      const { error } = await supabase.from('services').select('id').limit(1);
      setSystemStatus(prev => ({ ...prev, website: error ? 'offline' : 'online' }));
    } catch {
      setSystemStatus(prev => ({ ...prev, website: 'offline' }));
    }
  }, []);

  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    setCustomersLoading(true);
    try {
      let query = supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply date filter
      const now = new Date();
      if (customerFilter === 'daily') {
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        query = query.gte('created_at', todayStart.toISOString());
      } else if (customerFilter === 'weekly') {
        const weekStart = new Date(now.setDate(now.getDate() - 7));
        query = query.gte('created_at', weekStart.toISOString());
      } else if (customerFilter === 'monthly') {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        query = query.gte('created_at', monthStart.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setCustomersLoading(false);
    }
  }, [customerFilter]);

  // Fetch revenue data
  const fetchRevenueData = useCallback(async () => {
    try {
      // Fetch popular services
      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select(`
          service_id,
          total_amount,
          services(id, name)
        `)
        .neq('status', 'cancelled');

      if (appointmentsData) {
        // Group by service
        const serviceStats: Record<string, { name: string; bookings: number; revenue: number }> = {};
        appointmentsData.forEach((apt: any) => {
          const serviceId = apt.service_id;
          const serviceName = apt.services?.name || 'Unknown Service';
          if (!serviceStats[serviceId]) {
            serviceStats[serviceId] = { name: serviceName, bookings: 0, revenue: 0 };
          }
          serviceStats[serviceId].bookings += 1;
          serviceStats[serviceId].revenue += apt.total_amount || 0;
        });

        // Convert to array and sort by bookings
        const popularServicesArray = Object.entries(serviceStats)
          .map(([id, stats]) => ({ id, ...stats }))
          .sort((a, b) => b.bookings - a.bookings)
          .slice(0, 5);

        setPopularServices(popularServicesArray);
      }

      // Calculate revenue by period
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - 7);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Today's revenue
      const { data: todayData } = await supabase
        .from('transactions')
        .select('total_amount')
        .eq('status', 'completed')
        .gte('created_at', todayStart.toISOString());

      const todayRevenue = todayData?.reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0;

      // This week's revenue
      const { data: weekData } = await supabase
        .from('transactions')
        .select('total_amount')
        .eq('status', 'completed')
        .gte('created_at', weekStart.toISOString());

      const weekRevenue = weekData?.reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0;

      // This month's revenue
      const { data: monthData } = await supabase
        .from('transactions')
        .select('total_amount')
        .eq('status', 'completed')
        .gte('created_at', monthStart.toISOString());

      const monthRevenue = monthData?.reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0;

      setRevenueByPeriod({
        today: todayRevenue,
        thisWeek: weekRevenue,
        thisMonth: monthRevenue
      });

    } catch (error) {
      console.error('Error fetching revenue data:', error);
    }
  }, []);

  // Handle admin login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    const isValid = await verifyAdminPassword(password);

    if (isValid) {
      setAdminSession();
      setIsAuthenticated(true);
      setPassword('');
      fetchData();
      fetchAnalyticsData();
      checkSystemStatus();
      fetchCustomers();
      fetchRevenueData();
      toast({
        title: 'Welcome, Admin',
        description: 'You have been successfully logged in.'
      });
    } else {
      toast({
        title: 'Access Denied',
        description: 'Incorrect password. Please try again.',
        variant: 'destructive'
      });
    }

    setIsLoggingIn(false);
  };

  // Handle logout
  const handleLogout = () => {
    clearAdminSession();
    setIsAuthenticated(false);
    toast({
      title: 'Logged Out',
      description: 'You have been logged out successfully.'
    });
  };

  // Toggle permission
  const handleTogglePermission = async (
    staffId: string,
    permission: keyof StaffPermissions,
    currentValue: boolean
  ) => {
    // Checkout access cannot be toggled off
    if (permission === 'checkout_access') {
      toast({
        title: 'Cannot Modify',
        description: 'Checkout access is always enabled for all staff.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const existingPerm = permissions[staffId];

      if (existingPerm) {
        // Update existing permission
        const { error } = await supabase
          .from('staff_permissions')
          .update({ [permission]: !currentValue })
          .eq('staff_id', staffId);

        if (error) throw error;
      } else {
        // Create new permission record
        const { error } = await supabase
          .from('staff_permissions')
          .insert({
            staff_id: staffId,
            [permission]: !currentValue
          });

        if (error) throw error;
      }

      // Update local state
      setPermissions(prev => ({
        ...prev,
        [staffId]: {
          ...prev[staffId],
          staff_id: staffId,
          [permission]: !currentValue
        } as StaffPermissions
      }));

      toast({
        title: 'Permission Updated',
        description: `${permission.replace(/_/g, ' ')} has been ${!currentValue ? 'enabled' : 'disabled'}.`
      });
    } catch (error) {
      console.error('Error updating permission:', error);
      toast({
        title: 'Error',
        description: 'Failed to update permission.',
        variant: 'destructive'
      });
    }
  };

  // Toggle staff visibility on Team page (status: available/offline)
  const handleToggleTeamPage = async (staffId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'offline' ? 'available' : 'offline';

      const { error } = await supabase
        .from('staff')
        .update({ status: newStatus })
        .eq('id', staffId);

      if (error) throw error;

      // Update local state
      setStaff(prev => prev.map(s =>
        s.id === staffId ? { ...s, status: newStatus } : s
      ));

      toast({
        title: 'Team Page Visibility Updated',
        description: `Staff member is now ${newStatus === 'offline' ? 'hidden from' : 'visible on'} the Team page.`
      });
    } catch (error) {
      console.error('Error updating team page visibility:', error);
      toast({
        title: 'Error',
        description: 'Failed to update team page visibility.',
        variant: 'destructive'
      });
    }
  };

  // Add new staff
  const handleAddStaff = async () => {
    try {
      const tempPassword = formData.password || generateTempPassword();
      const fullName = `${formData.first_name} ${formData.last_name}`.trim();
      const username = formData.first_name.toLowerCase().slice(0, 10) || `emp${staff.length + 1}`;

      // Hash the password
      const { hash, salt } = await hashStaffPassword(tempPassword);

      const { data, error } = await supabase
        .from('staff')
        .insert({
          name: fullName,
          first_name: formData.first_name,
          last_name: formData.last_name,
          username,
          password_hash: hash,
          password_salt: salt,
          temp_password: tempPassword,
          role: formData.role,
          specialty: formData.specialty || null,
          color: formData.color,
          avatar: formData.avatar || null,
          status: 'available',
          access_level: formData.role === 'admin' ? 'admin' : formData.role === 'senior' ? 'manager' : 'basic'
        })
        .select()
        .single();

      if (error) throw error;

      // Create default permissions
      if (data) {
        await supabase
          .from('staff_permissions')
          .insert({
            staff_id: data.id,
            inventory_access: formData.role === 'admin',
            read_only_mode: formData.role === 'junior',
            checkout_access: true,
            calendar_access: true,
            analytics_access: formData.role === 'admin' || formData.role === 'senior',
            settings_access: true,
            customer_management_access: formData.role !== 'junior'
          });
      }

      setShowAddModal(false);
      setFormData({ first_name: '', last_name: '', password: '', avatar: '', role: 'junior', specialty: '', color: 'blue' });
      fetchData();

      toast({
        title: 'Staff Added',
        description: `${fullName} has been added. Temporary password: ${tempPassword}`
      });
    } catch (error) {
      console.error('Error adding staff:', error);
      toast({
        title: 'Error',
        description: 'Failed to add staff member.',
        variant: 'destructive'
      });
    }
  };

  // Edit staff
  const handleEditStaff = async () => {
    if (!selectedStaff) return;

    try {
      const fullName = `${formData.first_name} ${formData.last_name}`.trim();

      // Generate username if staff doesn't have one
      const username = selectedStaff.username || formData.first_name.toLowerCase().slice(0, 10) || `emp${selectedStaff.id.slice(0, 4)}`;

      const updates: any = {
        name: fullName,
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: username,
        role: formData.role,
        specialty: formData.specialty,
        color: formData.color,
        avatar: formData.avatar || null,
        access_level: formData.role === 'admin' ? 'admin' : formData.role === 'senior' ? 'manager' : 'basic'
      };

      // Only hash password if provided
      if (formData.password) {
        const { hash, salt } = await hashStaffPassword(formData.password);
        updates.password_hash = hash;
        updates.password_salt = salt;
        updates.temp_password = formData.password;
      }

      const { error } = await supabase
        .from('staff')
        .update(updates)
        .eq('id', selectedStaff.id);

      if (error) throw error;

      setShowEditModal(false);
      setSelectedStaff(null);
      setFormData({ first_name: '', last_name: '', password: '', avatar: '', role: 'junior', specialty: '', color: 'blue' });
      fetchData();

      toast({
        title: 'Staff Updated',
        description: `${fullName} has been updated.`
      });
    } catch (error) {
      console.error('Error updating staff:', error);
      toast({
        title: 'Error',
        description: 'Failed to update staff member.',
        variant: 'destructive'
      });
    }
  };

  // Delete staff
  const handleDeleteStaff = async () => {
    if (!selectedStaff) return;

    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', selectedStaff.id);

      if (error) throw error;

      setShowDeleteDialog(false);
      setSelectedStaff(null);
      fetchData();

      toast({
        title: 'Staff Deleted',
        description: `${selectedStaff.name} has been removed.`
      });
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete staff member.',
        variant: 'destructive'
      });
    }
  };

  // Open edit modal
  const openEditModal = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember);
    const { firstName, lastName } = splitName(staffMember.name);
    setFormData({
      first_name: firstName,
      last_name: lastName,
      password: '',
      avatar: staffMember.avatar || '',
      role: staffMember.role,
      specialty: staffMember.specialty || '',
      color: staffMember.color
    });
    setShowEditModal(true);
  };

  // Filter staff by search
  const filteredStaff = staff.filter(s =>
    `${s.name} ${s.username}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get permission value with default
  const getPermission = (staffId: string, permission: keyof StaffPermissions): boolean => {
    const perm = permissions[staffId];
    if (!perm) {
      // Default values
      if (permission === 'checkout_access' || permission === 'calendar_access' || permission === 'settings_access') {
        return true;
      }
      return false;
    }
    return perm[permission] as boolean;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  // Format date for recent bookings
  const formatBookingDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4 text-black" data-theme="light" style={{ colorScheme: 'light', backgroundColor: 'white' }}>
        <Card className="w-full max-w-md border-gray-200 shadow-lg bg-white" style={{ backgroundColor: 'white', color: 'black' }}>
          <CardHeader className="text-center">
            <div className="mx-auto bg-slate-50 p-3 rounded-full w-fit mb-4">
              <Shield className="h-8 w-8 text-black" />
            </div>
            <CardTitle className="text-2xl text-black font-bold" style={{ color: 'black' }}>Admin Access</CardTitle>
            <CardDescription className="text-gray-600" style={{ color: '#4B5563' }}>
              Enter your admin password to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-center text-lg pr-10 border-gray-300 text-black bg-white"
                  style={{ backgroundColor: 'white', color: 'black' }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <Button
                type="submit"
                className="w-full bg-black hover:bg-slate-800 text-white"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? 'Verifying...' : 'Access Admin Panel'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main admin panel
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-white text-black" data-theme="light" style={{ colorScheme: 'light' }}>
        {/* Header */}
        <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-black" />
              <div>
                <h1 className="text-xl font-bold text-black">Admin Panel</h1>
                <p className="text-sm text-gray-500">Staff Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
                Session Active
              </Badge>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex gap-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'text-black border-b-2 border-gray-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="h-4 w-4 inline-block mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('customers')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'customers'
                    ? 'text-black border-b-2 border-gray-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users className="h-4 w-4 inline-block mr-2" />
                Customers
              </button>
              <button
                onClick={() => setActiveTab('revenue')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'revenue'
                    ? 'text-black border-b-2 border-gray-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <DollarSign className="h-4 w-4 inline-block mr-2" />
                Revenue
              </button>
              <button
                onClick={() => setActiveTab('staff')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'staff'
                    ? 'text-black border-b-2 border-gray-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Shield className="h-4 w-4 inline-block mr-2" />
                Staff Management
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'audit'
                    ? 'text-black border-b-2 border-gray-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <History className="h-4 w-4 inline-block mr-2" />
                Access History
              </button>

              {/* Enterprise Tabs Separator */}
              <div className="flex items-center px-2">
                <div className="h-6 w-px bg-gray-300" />
              </div>

              {/* Enterprise Tabs */}
              <button
                onClick={() => setActiveTab('crm')}
                className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'crm'
                    ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] border-b-2 border-white/30 bg-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users className="h-4 w-4 inline-block mr-2" />
                CRM
              </button>
              <button
                onClick={() => setActiveTab('performance')}
                className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'performance'
                    ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] border-b-2 border-white/30 bg-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Target className="h-4 w-4 inline-block mr-2" />
                Performance
              </button>
              <button
                onClick={() => setActiveTab('forecast')}
                className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'forecast'
                    ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] border-b-2 border-white/30 bg-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TrendingUp className="h-4 w-4 inline-block mr-2" />
                Forecast
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'reviews'
                    ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] border-b-2 border-white/30 bg-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MessageSquare className="h-4 w-4 inline-block mr-2" />
                Reviews
              </button>
              <button
                onClick={() => setActiveTab('marketing')}
                className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'marketing'
                    ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] border-b-2 border-white/30 bg-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Mail className="h-4 w-4 inline-block mr-2" />
                Marketing
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'inventory'
                    ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] border-b-2 border-white/30 bg-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Package className="h-4 w-4 inline-block mr-2" />
                Inventory
              </button>
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'recommendations'
                    ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] border-b-2 border-white/30 bg-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Brain className="h-4 w-4 inline-block mr-2" />
                AI
              </button>
              <button
                onClick={() => setActiveTab('scheduling')}
                className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'scheduling'
                    ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] border-b-2 border-white/30 bg-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <LayoutGrid className="h-4 w-4 inline-block mr-2" />
                Scheduling
              </button>

              {/* Online/Offline Status */}
              <div className="flex items-center px-3 ml-auto">
                {isOnline ? (
                  <Badge className="bg-green-100 text-green-700 border-green-300">
                    <Wifi className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-700 border-red-300">
                    <WifiOff className="h-3 w-3 mr-1" />
                    Offline
                  </Badge>
                )}
                {syncStatus.pending > 0 && (
                  <Badge className="ml-2 bg-yellow-100 text-yellow-700 border-yellow-300">
                    {syncStatus.pending} pending
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-black" />
            </div>
          ) : activeTab === 'overview' ? (
            <>
              {/* Overview Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-black">Business Overview</h2>
                  <p className="text-gray-600">Real-time business metrics and activity</p>
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-300">
                  Live Data
                </Badge>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="border-gray-200 bg-white hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Total Revenue</p>
                        <p className="text-2xl font-bold text-black">{formatCurrency(totalRevenue)}</p>
                        <p className="text-xs text-green-600">From completed transactions</p>
                      </div>
                      <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Total Bookings</p>
                        <p className="text-2xl font-bold text-black">{totalBookings}</p>
                        <p className="text-xs text-black">Non-cancelled appointments</p>
                      </div>
                      <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-black" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Active Customers</p>
                        <p className="text-2xl font-bold text-black">{activeCustomers}</p>
                        <p className="text-xs text-yellow-600">Registered customers</p>
                      </div>
                      <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Net Promoter Score</p>
                        <p className="text-2xl font-bold text-black">{nps}</p>
                        <p className="text-xs text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">Feedback system pending</p>
                      </div>
                      <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center">
                        <Star className="h-6 w-6 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity & System Status */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Bookings */}
                <Card className="border-gray-200 bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-black">
                      <Clock className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>Latest bookings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {recentBookings.length > 0 ? (
                      recentBookings.map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-slate-50 rounded-full flex items-center justify-center">
                              <Calendar className="h-4 w-4 text-black" />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-black">{booking.service}</p>
                              <p className="text-xs text-gray-500">
                                {booking.customer} - {formatBookingDate(booking.date)}
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700 border-green-300">
                            {formatCurrency(booking.price)}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No recent bookings</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* System Status */}
                <Card className="border-gray-200 bg-white">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-black">
                        <Activity className="h-5 w-5" />
                        System Status
                      </CardTitle>
                      <CardDescription>Current system health</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={checkSystemStatus}
                      className="border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Refresh
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-black">Database</span>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${
                            systemStatus.database === 'online' ? 'bg-green-500' :
                            systemStatus.database === 'offline' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
                          }`}></div>
                          <span className={`text-sm ${
                            systemStatus.database === 'online' ? 'text-green-600' :
                            systemStatus.database === 'offline' ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {systemStatus.database === 'checking' ? 'Checking...' : systemStatus.database === 'online' ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-black">Booking System</span>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${
                            systemStatus.booking === 'online' ? 'bg-green-500' :
                            systemStatus.booking === 'offline' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
                          }`}></div>
                          <span className={`text-sm ${
                            systemStatus.booking === 'online' ? 'text-green-600' :
                            systemStatus.booking === 'offline' ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {systemStatus.booking === 'checking' ? 'Checking...' : systemStatus.booking === 'online' ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-black">Payment Processing</span>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${
                            systemStatus.payment === 'online' ? 'bg-green-500' :
                            systemStatus.payment === 'offline' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
                          }`}></div>
                          <span className={`text-sm ${
                            systemStatus.payment === 'online' ? 'text-green-600' :
                            systemStatus.payment === 'offline' ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {systemStatus.payment === 'checking' ? 'Checking...' : systemStatus.payment === 'online' ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-black">Website/Services</span>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${
                            systemStatus.website === 'online' ? 'bg-green-500' :
                            systemStatus.website === 'offline' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
                          }`}></div>
                          <span className={`text-sm ${
                            systemStatus.website === 'online' ? 'text-green-600' :
                            systemStatus.website === 'offline' ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {systemStatus.website === 'checking' ? 'Checking...' : systemStatus.website === 'online' ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : activeTab === 'customers' ? (
            <>
              {/* Customers Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-black">Customer Management</h2>
                  <p className="text-gray-600">View and search all customers</p>
                </div>
                <div className="flex items-center gap-4">
                  {/* Filter Buttons */}
                  <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                    {(['all', 'daily', 'weekly', 'monthly'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setCustomerFilter(filter)}
                        className={`px-3 py-1 text-sm rounded transition-colors ${
                          customerFilter === filter
                            ? 'bg-white text-black shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {filter === 'all' ? 'All Time' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </button>
                    ))}
                  </div>
                  <Badge className="bg-gray-100 text-gray-700 border-gray-300">
                    {customers.length} customers
                  </Badge>
                </div>
              </div>

              {/* Customer Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search customers by name, email, or phone..."
                    value={customerSearchQuery}
                    onChange={(e) => setCustomerSearchQuery(e.target.value)}
                    className="pl-10 w-full max-w-md border-gray-300 text-black bg-white"
                    style={{ backgroundColor: 'white', color: 'black' }}
                  />
                </div>
              </div>

              {/* Customers Table */}
              <Card className="border-gray-200 bg-white">
                <Table className="bg-white">
                  <TableHeader className="bg-gray-100">
                    <TableRow className="bg-gray-100 hover:bg-gray-100">
                      <TableHead className="text-black font-semibold bg-gray-100">Name</TableHead>
                      <TableHead className="text-black font-semibold bg-gray-100">Email</TableHead>
                      <TableHead className="text-black font-semibold bg-gray-100">Phone</TableHead>
                      <TableHead className="text-black font-semibold bg-gray-100">Loyalty Points</TableHead>
                      <TableHead className="text-black font-semibold bg-gray-100">Last Visit</TableHead>
                      <TableHead className="text-black font-semibold bg-gray-100">Member Since</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white">
                    {customersLoading ? (
                      <TableRow className="bg-white hover:bg-white">
                        <TableCell colSpan={6} className="text-center py-12 bg-white">
                          <RefreshCw className="h-8 w-8 animate-spin text-black mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : customers
                      .filter(c =>
                        !customerSearchQuery ||
                        c.name?.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
                        c.email?.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
                        c.phone?.includes(customerSearchQuery)
                      )
                      .length === 0 ? (
                      <TableRow className="bg-white hover:bg-white">
                        <TableCell colSpan={6} className="text-center py-12 bg-white">
                          <div className="text-gray-500">
                            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No Customers Found</p>
                            <p className="text-sm mt-1">
                              {customerSearchQuery ? 'No customers match your search criteria.' : 'No customers registered yet.'}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      customers
                        .filter(c =>
                          !customerSearchQuery ||
                          c.name?.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
                          c.email?.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
                          c.phone?.includes(customerSearchQuery)
                        )
                        .map((customer) => (
                          <TableRow key={customer.id} className="bg-white hover:bg-gray-50">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-black font-medium">
                                  {customer.name?.[0]?.toUpperCase() || 'C'}
                                </div>
                                <span className="font-medium text-black">{customer.name || 'Unknown'}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-black">{customer.email || '-'}</TableCell>
                            <TableCell className="text-black">{customer.phone || '-'}</TableCell>
                            <TableCell>
                              <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
                                {customer.loyalty_points || 0} pts
                              </Badge>
                            </TableCell>
                            <TableCell className="text-black">
                              {customer.last_visit ? formatBookingDate(customer.last_visit) : 'Never'}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {formatBookingDate(customer.created_at)}
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </>
          ) : activeTab === 'revenue' ? (
            <>
              {/* Revenue Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-black">Revenue Analytics</h2>
                  <p className="text-gray-600">Track revenue and popular services</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchRevenueData}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh Data
                </Button>
              </div>

              {/* Revenue Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="border-gray-200 bg-white hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Today's Revenue</p>
                        <p className="text-2xl font-bold text-black">{formatCurrency(revenueByPeriod.today)}</p>
                        <p className="text-xs text-green-600">Completed transactions</p>
                      </div>
                      <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">This Week</p>
                        <p className="text-2xl font-bold text-black">{formatCurrency(revenueByPeriod.thisWeek)}</p>
                        <p className="text-xs text-black">Last 7 days</p>
                      </div>
                      <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-black" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">This Month</p>
                        <p className="text-2xl font-bold text-black">{formatCurrency(revenueByPeriod.thisMonth)}</p>
                        <p className="text-xs text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">Current month</p>
                      </div>
                      <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center">
                        <BarChart3 className="h-6 w-6 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Popular Services */}
              <Card className="border-gray-200 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-black">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Popular Services
                  </CardTitle>
                  <CardDescription>Top performing services by number of bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  {popularServices.length > 0 ? (
                    <div className="space-y-4">
                      {popularServices.map((service, index) => (
                        <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                              index === 0 ? 'bg-yellow-500' :
                              index === 1 ? 'bg-gray-400' :
                              index === 2 ? 'bg-white/10' : 'bg-slate-800'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-black">{service.name}</p>
                              <p className="text-sm text-gray-500">{service.bookings} bookings</p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700 border-green-300">
                            {formatCurrency(service.revenue)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No service data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : activeTab === 'staff' ? (
            <>
              {/* Staff Management Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search staff..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64 border-gray-300 text-black bg-white"
                      style={{ backgroundColor: 'white', color: 'black' }}
                    />
                  </div>
                  <Badge className="bg-gray-100 text-gray-700 border-gray-300">
                    {filteredStaff.length} staff members
                  </Badge>
                </div>
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="bg-black hover:bg-slate-800 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Staff
                </Button>
              </div>

              {/* Staff Table */}
              <Card className="border-gray-200 bg-white">
                <Table className="bg-white">
                  <TableHeader className="bg-gray-100">
                    <TableRow className="bg-gray-100 hover:bg-gray-100">
                      <TableHead className="text-black font-semibold bg-gray-100">Name</TableHead>
                      <TableHead className="text-black font-semibold bg-gray-100">Username</TableHead>
                      <TableHead className="text-black font-semibold bg-gray-100">Password</TableHead>
                      <TableHead className="text-black font-semibold bg-gray-100">Role</TableHead>
                      <TableHead className="text-black font-semibold bg-gray-100">Inventory Write</TableHead>
                      <TableHead className="text-black font-semibold bg-gray-100">Team Page</TableHead>
                      <TableHead className="text-black font-semibold bg-gray-100">
                        <div className="flex items-center gap-1">
                          Permissions
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs bg-gray-900 text-white p-3">
                              <p className="font-semibold mb-2">Permission Levels:</p>
                              <ul className="text-sm space-y-1">
                                <li><span className="text-green-400">Green</span> = Access Enabled</li>
                                <li><span className="text-gray-400">Gray</span> = Access Disabled</li>
                                <li>Checkout is always enabled for all staff</li>
                              </ul>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableHead>
                      <TableHead className="text-black font-semibold text-right bg-gray-100">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white">
                    {filteredStaff.length === 0 ? (
                      <TableRow className="bg-white hover:bg-white">
                        <TableCell colSpan={8} className="text-center py-12 bg-white">
                          <div className="text-gray-500">
                            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No Staff Members Found</p>
                            <p className="text-sm mt-1">
                              {staff.length === 0
                                ? 'Run the database migration to seed staff data, or add staff manually.'
                                : 'No staff match your search criteria.'}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredStaff.map((staffMember) => {
                      const { firstName, lastName } = splitName(staffMember.name);
                      return (
                      <TableRow key={staffMember.id} className="bg-white hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {staffMember.avatar ? (
                              <img
                                src={staffMember.avatar}
                                alt={staffMember.name}
                                className="w-10 h-10 rounded-full object-cover border-2"
                                style={{ borderColor: getStaffColor(staffMember.color) }}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${staffMember.avatar ? 'hidden' : ''}`}
                              style={{ backgroundColor: getStaffColor(staffMember.color) }}
                            >
                              {firstName?.[0] || ''}{lastName?.[0] || ''}
                            </div>
                            <div>
                              <p className="font-medium text-black">{staffMember.name || ''}</p>
                              <p className="text-sm text-gray-500">{staffMember.specialty || 'No specialty'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-black">{staffMember.username}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono text-gray-800">
                              {staffMember.temp_password || '••••••••'}
                            </code>
                            {staffMember.temp_password && (
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(staffMember.temp_password || '');
                                  toast({
                                    title: 'Copied',
                                    description: 'Password copied to clipboard'
                                  });
                                }}
                                className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700"
                                title="Copy password"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              staffMember.role === 'admin'
                                ? 'bg-white/10 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] border-white/30'
                                : staffMember.role === 'senior'
                                ? 'bg-slate-50 text-slate-700 border-slate-300'
                                : 'bg-gray-100 text-gray-700 border-gray-300'
                            }
                          >
                            {staffMember.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={getPermission(staffMember.id, 'inventory_access')}
                            onCheckedChange={() => handleTogglePermission(staffMember.id, 'inventory_access', getPermission(staffMember.id, 'inventory_access'))}
                            className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
                          />
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={staffMember.status !== 'offline'}
                            onCheckedChange={() => handleToggleTeamPage(staffMember.id, staffMember.status || 'available')}
                            className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger>
                              <button className="p-1 hover:bg-gray-100 rounded">
                                <Info className="h-4 w-4 text-black" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-gray-900 text-white p-3 max-w-xs">
                              <p className="font-semibold mb-2">{firstName || 'Staff'}'s Permissions:</p>
                              <ul className="text-sm space-y-1">
                                <li className="flex items-center gap-2">
                                  <span className={getPermission(staffMember.id, 'inventory_access') ? 'text-green-400' : 'text-gray-400'}>●</span>
                                  Inventory Write: {getPermission(staffMember.id, 'inventory_access') ? 'Enabled' : 'Disabled'}
                                </li>
                                <li className="flex items-center gap-2">
                                  <span className="text-green-400">●</span>
                                  Calendar, Checkout: Always Enabled
                                </li>
                              </ul>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(staffMember)}
                              className="border-gray-300 text-gray-700 hover:bg-gray-100"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedStaff(staffMember);
                                setShowDeleteDialog(true);
                              }}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )})}
                  </TableBody>
                </Table>
              </Card>
            </>
          ) : activeTab === 'audit' ? (
            <>
              {/* Audit Log */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-black mb-2">Access History</h2>
                <p className="text-gray-600">Staff access log for the last 7 days</p>
              </div>

              <Card className="border-gray-200 bg-white">
                <Table className="bg-white">
                  <TableHeader className="bg-gray-100">
                    <TableRow className="bg-gray-100 hover:bg-gray-100">
                      <TableHead className="text-black font-semibold bg-gray-100">Date/Time</TableHead>
                      <TableHead className="text-black font-semibold bg-gray-100">Staff Member</TableHead>
                      <TableHead className="text-black font-semibold bg-gray-100">Action</TableHead>
                      <TableHead className="text-black font-semibold bg-gray-100">Page/Feature</TableHead>
                      <TableHead className="text-black font-semibold bg-gray-100">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white">
                    {auditLog.length === 0 ? (
                      <TableRow className="bg-white hover:bg-white">
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500 bg-white">
                          No access history recorded yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      auditLog.map((entry) => (
                        <TableRow key={entry.id} className="bg-white hover:bg-gray-50">
                          <TableCell className="text-black">{formatDate(entry.created_at)}</TableCell>
                          <TableCell className="text-black">{entry.staff_name || 'Unknown'}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                entry.action_type === 'login'
                                  ? 'bg-green-100 text-green-700 border-green-300'
                                  : entry.action_type === 'logout'
                                  ? 'bg-gray-100 text-gray-700 border-gray-300'
                                  : entry.action_type === 'permission_denied'
                                  ? 'bg-red-100 text-red-700 border-red-300'
                                  : 'bg-slate-50 text-slate-700 border-slate-300'
                              }
                            >
                              {entry.action_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-black">{entry.page_accessed || '-'}</TableCell>
                          <TableCell className="text-gray-600">{entry.details || '-'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </>
          ) : activeTab === 'crm' ? (
            <>
              {/* CRM Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-black">Customer CRM</h2>
                  <p className="text-gray-600">Customer lifecycle management and segmentation</p>
                </div>
                <Button
                  onClick={async () => {
                    setEnterpriseLoading(true);
                    try {
                      const profiles = await crmService.getCustomerProfiles();
                      setCrmProfiles(profiles);
                    } catch (error) {
                      console.error('Error loading CRM:', error);
                    }
                    setEnterpriseLoading(false);
                  }}
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {/* CRM Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Profiles</p>
                        <p className="text-2xl font-bold text-black">{enterpriseStats.totalProfiles}</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center">
                        <Users className="h-5 w-5 text-black" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">At Risk</p>
                        <p className="text-2xl font-bold text-red-600">{enterpriseStats.atRiskCustomers}</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">VIP Customers</p>
                        <p className="text-2xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">{crmProfiles.filter(p => p.loyalty_tier === 'platinum').length}</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                        <Award className="h-5 w-5 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Avg Lifetime Value</p>
                        <p className="text-2xl font-bold text-green-600">
                          ${crmProfiles.length > 0 ? Math.round(crmProfiles.reduce((sum, p) => sum + (p.lifetime_value || 0), 0) / crmProfiles.length) : 0}
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* CRM Table */}
              <Card className="bg-white border-gray-200">
                <Table>
                  <TableHeader className="bg-gray-100">
                    <TableRow>
                      <TableHead className="text-black font-semibold">Customer</TableHead>
                      <TableHead className="text-black font-semibold">Stage</TableHead>
                      <TableHead className="text-black font-semibold">Loyalty Tier</TableHead>
                      <TableHead className="text-black font-semibold">Lifetime Value</TableHead>
                      <TableHead className="text-black font-semibold">Churn Risk</TableHead>
                      <TableHead className="text-black font-semibold">Last Visit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white">
                    {enterpriseLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-black" />
                        </TableCell>
                      </TableRow>
                    ) : crmProfiles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No customer profiles yet. Click Refresh to load data.
                        </TableCell>
                      </TableRow>
                    ) : (
                      crmProfiles.slice(0, 10).map((profile) => (
                        <TableRow key={profile.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium text-black">{profile.customer_id}</TableCell>
                          <TableCell>
                            <Badge className="bg-slate-50 text-slate-700">{profile.lifecycle_stage_id || 'New'}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              profile.loyalty_tier === 'platinum' ? 'bg-white/10 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' :
                              profile.loyalty_tier === 'gold' ? 'bg-yellow-100 text-yellow-700' :
                              profile.loyalty_tier === 'silver' ? 'bg-gray-100 text-gray-700' :
                              'bg-white/10 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]'
                            }>
                              {profile.loyalty_tier || 'Bronze'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-green-600 font-semibold">
                            ${profile.lifetime_value?.toFixed(2) || '0.00'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                (profile.churn_risk_score || 0) > 70 ? 'bg-red-500' :
                                (profile.churn_risk_score || 0) > 40 ? 'bg-yellow-500' : 'bg-green-500'
                              }`} />
                              {profile.churn_risk_score?.toFixed(0) || '0'}%
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {profile.last_visit_date ? new Date(profile.last_visit_date).toLocaleDateString() : 'Never'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </>
          ) : activeTab === 'performance' ? (
            <>
              {/* Performance Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-black">Staff Performance</h2>
                  <p className="text-gray-600">Track metrics, goals, and commissions</p>
                </div>
                <Button
                  onClick={async () => {
                    setEnterpriseLoading(true);
                    try {
                      const metrics = await staffPerformanceService.getStaffMetrics();
                      const goals = await staffPerformanceService.getStaffGoals();
                      setStaffMetrics(metrics);
                      setStaffGoals(goals);
                    } catch (error) {
                      console.error('Error loading performance:', error);
                    }
                    setEnterpriseLoading(false);
                  }}
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Avg Performance</p>
                        <p className="text-2xl font-bold text-black">{enterpriseStats.avgPerformance}%</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center">
                        <Target className="h-5 w-5 text-black" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Top Performer</p>
                        <p className="text-lg font-bold text-green-600">{enterpriseStats.topPerformer || 'N/A'}</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Award className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Active Goals</p>
                        <p className="text-2xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">{staffGoals.filter(g => g.status === 'active').length}</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Completed Goals</p>
                        <p className="text-2xl font-bold text-green-600">{staffGoals.filter(g => g.status === 'completed').length}</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Table */}
              <Card className="bg-white border-gray-200">
                <Table>
                  <TableHeader className="bg-gray-100">
                    <TableRow>
                      <TableHead className="text-black font-semibold">Staff</TableHead>
                      <TableHead className="text-black font-semibold">Appointments</TableHead>
                      <TableHead className="text-black font-semibold">Revenue</TableHead>
                      <TableHead className="text-black font-semibold">Avg Rating</TableHead>
                      <TableHead className="text-black font-semibold">Utilization</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white">
                    {enterpriseLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-black" />
                        </TableCell>
                      </TableRow>
                    ) : staffMetrics.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          No performance data yet. Click Refresh to load data.
                        </TableCell>
                      </TableRow>
                    ) : (
                      staffMetrics.slice(0, 10).map((metric) => (
                        <TableRow key={metric.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium text-black">{metric.staff_id}</TableCell>
                          <TableCell>{metric.appointments_completed || 0}</TableCell>
                          <TableCell className="text-green-600 font-semibold">
                            ${metric.revenue_generated?.toFixed(2) || '0.00'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              {metric.average_rating?.toFixed(1) || '0.0'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-black h-2 rounded-full"
                                  style={{ width: `${metric.utilization_rate || 0}%` }}
                                />
                              </div>
                              <span className="text-sm">{metric.utilization_rate?.toFixed(0) || 0}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </>
          ) : activeTab === 'forecast' ? (
            <>
              {/* Forecast Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-black">AI Demand Forecasting</h2>
                  <p className="text-gray-600">Predict demand and optimize staffing</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      setEnterpriseLoading(true);
                      try {
                        await demandForecastingService.generateForecasts('Hair', 7);
                        const forecastData = await demandForecastingService.getForecasts();
                        setForecasts(forecastData);
                        toast({ title: 'Forecasts generated successfully' });
                      } catch (error) {
                        console.error('Error generating forecast:', error);
                        toast({ title: 'Error generating forecasts', variant: 'destructive' });
                      }
                      setEnterpriseLoading(false);
                    }}
                    className="bg-white/10 hover:bg-white/10 text-white"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Generate Forecast
                  </Button>
                  <Button
                    onClick={async () => {
                      setEnterpriseLoading(true);
                      try {
                        const forecastData = await demandForecastingService.getForecasts();
                        setForecasts(forecastData);
                      } catch (error) {
                        console.error('Error loading forecasts:', error);
                      }
                      setEnterpriseLoading(false);
                    }}
                    variant="outline"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Forecast Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Forecast Accuracy</p>
                        <p className="text-2xl font-bold text-green-600">{enterpriseStats.forecastAccuracy}%</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Target className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Active Forecasts</p>
                        <p className="text-2xl font-bold text-black">{forecasts.length}</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-black" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Predicted Demand (7d)</p>
                        <p className="text-2xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                          {forecasts.reduce((sum, f) => sum + (f.predicted_appointments || 0), 0)}
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Forecast Table */}
              <Card className="bg-white border-gray-200">
                <Table>
                  <TableHeader className="bg-gray-100">
                    <TableRow>
                      <TableHead className="text-black font-semibold">Date</TableHead>
                      <TableHead className="text-black font-semibold">Category</TableHead>
                      <TableHead className="text-black font-semibold">Predicted Appointments</TableHead>
                      <TableHead className="text-black font-semibold">Predicted Revenue</TableHead>
                      <TableHead className="text-black font-semibold">Confidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white">
                    {enterpriseLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-black" />
                        </TableCell>
                      </TableRow>
                    ) : forecasts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          No forecasts yet. Click Generate Forecast to create predictions.
                        </TableCell>
                      </TableRow>
                    ) : (
                      forecasts.slice(0, 10).map((forecast) => (
                        <TableRow key={forecast.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium text-black">
                            {new Date(forecast.forecast_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-slate-50 text-slate-700">{forecast.service_category}</Badge>
                          </TableCell>
                          <TableCell>{forecast.predicted_appointments || 0}</TableCell>
                          <TableCell className="text-green-600 font-semibold">
                            ${forecast.predicted_revenue?.toFixed(2) || '0.00'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    (forecast.confidence_score || 0) > 80 ? 'bg-green-500' :
                                    (forecast.confidence_score || 0) > 60 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${forecast.confidence_score || 0}%` }}
                                />
                              </div>
                              <span className="text-sm">{forecast.confidence_score?.toFixed(0) || 0}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </>
          ) : activeTab === 'reviews' ? (
            <>
              {/* Reviews Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-black">Reviews & Sentiment</h2>
                  <p className="text-gray-600">Analyze customer feedback and sentiment</p>
                </div>
                <Button
                  onClick={async () => {
                    setEnterpriseLoading(true);
                    try {
                      const reviews = await reviewService.getReviews();
                      setCustomerReviews(reviews);
                    } catch (error) {
                      console.error('Error loading reviews:', error);
                    }
                    setEnterpriseLoading(false);
                  }}
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {/* Review Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Reviews</p>
                        <p className="text-2xl font-bold text-black">{customerReviews.length}</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-black" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Avg Rating</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {customerReviews.length > 0
                            ? (customerReviews.reduce((sum, r) => sum + r.rating, 0) / customerReviews.length).toFixed(1)
                            : '0.0'}
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Star className="h-5 w-5 text-yellow-600 fill-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Avg Sentiment</p>
                        <p className="text-2xl font-bold text-green-600">{enterpriseStats.avgSentiment}%</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Pending Response</p>
                        <p className="text-2xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                          {customerReviews.filter(r => r.status === 'pending').length}
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Reviews Table */}
              <Card className="bg-white border-gray-200">
                <Table>
                  <TableHeader className="bg-gray-100">
                    <TableRow>
                      <TableHead className="text-black font-semibold">Customer</TableHead>
                      <TableHead className="text-black font-semibold">Rating</TableHead>
                      <TableHead className="text-black font-semibold">Review</TableHead>
                      <TableHead className="text-black font-semibold">Sentiment</TableHead>
                      <TableHead className="text-black font-semibold">Status</TableHead>
                      <TableHead className="text-black font-semibold">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white">
                    {enterpriseLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-black" />
                        </TableCell>
                      </TableRow>
                    ) : customerReviews.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No reviews yet. Click Refresh to load data.
                        </TableCell>
                      </TableRow>
                    ) : (
                      customerReviews.slice(0, 10).map((review) => (
                        <TableRow key={review.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium text-black">{review.customer_id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {[1,2,3,4,5].map(i => (
                                <Star key={i} className={`h-4 w-4 ${i <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-gray-600">{review.review_text}</TableCell>
                          <TableCell>
                            <Badge className={
                              (review.sentiment_score || 0) > 0.6 ? 'bg-green-100 text-green-700' :
                              (review.sentiment_score || 0) > 0.4 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }>
                              {(review.sentiment_score || 0) > 0.6 ? 'Positive' :
                               (review.sentiment_score || 0) > 0.4 ? 'Neutral' : 'Negative'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              review.status === 'responded' ? 'bg-green-100 text-green-700' :
                              review.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }>
                              {review.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {new Date(review.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </>
          ) : activeTab === 'marketing' ? (
            <>
              {/* Marketing Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-black">Marketing Campaigns</h2>
                  <p className="text-gray-600">Automated email campaigns and triggers</p>
                </div>
                <div className="flex gap-2">
                  <Button className="bg-white/10 hover:bg-white/10 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    New Campaign
                  </Button>
                  <Button
                    onClick={async () => {
                      setEnterpriseLoading(true);
                      try {
                        const campaignData = await marketingService.getCampaigns();
                        setCampaigns(campaignData);
                      } catch (error) {
                        console.error('Error loading campaigns:', error);
                      }
                      setEnterpriseLoading(false);
                    }}
                    variant="outline"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Marketing Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Active Campaigns</p>
                        <p className="text-2xl font-bold text-green-600">{enterpriseStats.activeCampaigns}</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Sent</p>
                        <p className="text-2xl font-bold text-black">
                          {campaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0)}
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center">
                        <Send className="h-5 w-5 text-black" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Avg Open Rate</p>
                        <p className="text-2xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                          {campaigns.length > 0
                            ? (campaigns.reduce((sum, c) => sum + (c.open_rate || 0), 0) / campaigns.length).toFixed(1)
                            : '0'}%
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                        <Eye className="h-5 w-5 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Avg Conversion</p>
                        <p className="text-2xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                          {campaigns.length > 0
                            ? (campaigns.reduce((sum, c) => sum + (c.conversion_rate || 0), 0) / campaigns.length).toFixed(1)
                            : '0'}%
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                        <ShoppingCart className="h-5 w-5 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Campaigns Table */}
              <Card className="bg-white border-gray-200">
                <Table>
                  <TableHeader className="bg-gray-100">
                    <TableRow>
                      <TableHead className="text-black font-semibold">Campaign</TableHead>
                      <TableHead className="text-black font-semibold">Type</TableHead>
                      <TableHead className="text-black font-semibold">Status</TableHead>
                      <TableHead className="text-black font-semibold">Sent</TableHead>
                      <TableHead className="text-black font-semibold">Open Rate</TableHead>
                      <TableHead className="text-black font-semibold">Click Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white">
                    {enterpriseLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-black" />
                        </TableCell>
                      </TableRow>
                    ) : campaigns.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No campaigns yet. Create your first marketing campaign.
                        </TableCell>
                      </TableRow>
                    ) : (
                      campaigns.slice(0, 10).map((campaign) => (
                        <TableRow key={campaign.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium text-black">{campaign.name}</TableCell>
                          <TableCell>
                            <Badge className="bg-slate-50 text-slate-700">{campaign.campaign_type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                              campaign.status === 'scheduled' ? 'bg-yellow-100 text-yellow-700' :
                              campaign.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                              'bg-red-100 text-red-700'
                            }>
                              {campaign.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{campaign.sent_count || 0}</TableCell>
                          <TableCell>{campaign.open_rate?.toFixed(1) || 0}%</TableCell>
                          <TableCell>{campaign.click_rate?.toFixed(1) || 0}%</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </>
          ) : activeTab === 'inventory' ? (
            <>
              {/* Inventory Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-black">Inventory Management</h2>
                  <p className="text-gray-600">Stock levels and auto-reorder system</p>
                </div>
                <div className="flex gap-2">
                  <Button className="bg-white/10 hover:bg-white/10 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                  <Button
                    onClick={async () => {
                      setEnterpriseLoading(true);
                      try {
                        const items = await inventoryService.getInventoryItems();
                        setInventoryItems(items);
                      } catch (error) {
                        console.error('Error loading inventory:', error);
                      }
                      setEnterpriseLoading(false);
                    }}
                    variant="outline"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Inventory Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Items</p>
                        <p className="text-2xl font-bold text-black">{inventoryItems.length}</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center">
                        <Package className="h-5 w-5 text-black" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Low Stock</p>
                        <p className="text-2xl font-bold text-red-600">{enterpriseStats.lowStockItems}</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Value</p>
                        <p className="text-2xl font-bold text-green-600">
                          ${inventoryItems.reduce((sum, i) => sum + ((i.quantity_in_stock || 0) * (i.unit_cost || 0)), 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Auto-Reorder Active</p>
                        <p className="text-2xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                          {inventoryItems.filter(i => i.auto_reorder_enabled).length}
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Inventory Table */}
              <Card className="bg-white border-gray-200">
                <Table>
                  <TableHeader className="bg-gray-100">
                    <TableRow>
                      <TableHead className="text-black font-semibold">Item</TableHead>
                      <TableHead className="text-black font-semibold">SKU</TableHead>
                      <TableHead className="text-black font-semibold">Stock</TableHead>
                      <TableHead className="text-black font-semibold">Reorder Point</TableHead>
                      <TableHead className="text-black font-semibold">Unit Cost</TableHead>
                      <TableHead className="text-black font-semibold">Auto-Reorder</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white">
                    {enterpriseLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-black" />
                        </TableCell>
                      </TableRow>
                    ) : inventoryItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No inventory items yet. Click Refresh to load data.
                        </TableCell>
                      </TableRow>
                    ) : (
                      inventoryItems.slice(0, 10).map((item) => (
                        <TableRow key={item.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium text-black">{item.name}</TableCell>
                          <TableCell className="text-gray-600">{item.sku}</TableCell>
                          <TableCell>
                            <Badge className={
                              (item.quantity_in_stock || 0) <= (item.reorder_point || 0) ? 'bg-red-100 text-red-700' :
                              (item.quantity_in_stock || 0) <= ((item.reorder_point || 0) * 1.5) ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }>
                              {item.quantity_in_stock || 0} {item.unit}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.reorder_point || 0}</TableCell>
                          <TableCell className="text-green-600">${item.unit_cost?.toFixed(2) || '0.00'}</TableCell>
                          <TableCell>
                            {item.auto_reorder_enabled ? (
                              <Badge className="bg-green-100 text-green-700">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-700">
                                <XCircle className="h-3 w-3 mr-1" />
                                Disabled
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </>
          ) : activeTab === 'recommendations' ? (
            <>
              {/* AI Recommendations Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-black">AI Service Recommendations</h2>
                  <p className="text-gray-600">Personalized service suggestions for customers</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      setEnterpriseLoading(true);
                      try {
                        // Generate recommendations for a sample customer
                        toast({ title: 'Generating AI recommendations...' });
                        const recs = await recommendationService.getRecommendations();
                        setRecommendations(recs);
                        toast({ title: 'Recommendations loaded successfully' });
                      } catch (error) {
                        console.error('Error loading recommendations:', error);
                        toast({ title: 'Error loading recommendations', variant: 'destructive' });
                      }
                      setEnterpriseLoading(false);
                    }}
                    variant="outline"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* AI Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Pending Recommendations</p>
                        <p className="text-2xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">{enterpriseStats.pendingRecommendations}</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                        <Brain className="h-5 w-5 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Accepted Rate</p>
                        <p className="text-2xl font-bold text-green-600">
                          {recommendations.length > 0
                            ? ((recommendations.filter(r => r.status === 'accepted').length / recommendations.length) * 100).toFixed(1)
                            : '0'}%
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Avg Confidence</p>
                        <p className="text-2xl font-bold text-black">
                          {recommendations.length > 0
                            ? (recommendations.reduce((sum, r) => sum + (r.confidence_score || 0), 0) / recommendations.length * 100).toFixed(1)
                            : '0'}%
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center">
                        <Target className="h-5 w-5 text-black" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations Table */}
              <Card className="bg-white border-gray-200">
                <Table>
                  <TableHeader className="bg-gray-100">
                    <TableRow>
                      <TableHead className="text-black font-semibold">Customer</TableHead>
                      <TableHead className="text-black font-semibold">Service</TableHead>
                      <TableHead className="text-black font-semibold">Type</TableHead>
                      <TableHead className="text-black font-semibold">Confidence</TableHead>
                      <TableHead className="text-black font-semibold">Status</TableHead>
                      <TableHead className="text-black font-semibold">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white">
                    {enterpriseLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-black" />
                        </TableCell>
                      </TableRow>
                    ) : recommendations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No recommendations yet. AI will generate suggestions based on customer behavior.
                        </TableCell>
                      </TableRow>
                    ) : (
                      recommendations.slice(0, 10).map((rec) => (
                        <TableRow key={rec.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium text-black">{rec.customer_id}</TableCell>
                          <TableCell>{rec.service_id}</TableCell>
                          <TableCell>
                            <Badge className={
                              rec.recommendation_type === 'personalized' ? 'bg-white/10 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' :
                              rec.recommendation_type === 'upsell' ? 'bg-green-100 text-green-700' :
                              'bg-slate-50 text-slate-700'
                            }>
                              {rec.recommendation_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-white/10 h-2 rounded-full"
                                  style={{ width: `${(rec.confidence_score || 0) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm">{((rec.confidence_score || 0) * 100).toFixed(0)}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              rec.status === 'accepted' ? 'bg-green-100 text-green-700' :
                              rec.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }>
                              {rec.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {new Date(rec.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </>
          ) : activeTab === 'scheduling' ? (
            <>
              {/* Multiplayer Scheduling Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-black">Real-time Scheduling</h2>
                  <p className="text-gray-600">Multiplayer scheduling with conflict resolution</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {isOnline ? (
                      <Badge className="bg-green-100 text-green-700 border-green-300">
                        <Wifi className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 border-red-300">
                        <WifiOff className="h-3 w-3 mr-1" />
                        Offline
                      </Badge>
                    )}
                  </div>
                  <Button
                    onClick={async () => {
                      setEnterpriseLoading(true);
                      try {
                        const presence = multiplayerScheduleService.getActiveUsers();
                        setSchedulePresence(Array.from(presence.values()));
                      } catch (error) {
                        console.error('Error loading presence:', error);
                      }
                      setEnterpriseLoading(false);
                    }}
                    variant="outline"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Scheduling Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Active Users</p>
                        <p className="text-2xl font-bold text-green-600">{schedulePresence.length}</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Active Locks</p>
                        <p className="text-2xl font-bold text-yellow-600">0</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Lock className="h-5 w-5 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Pending Sync</p>
                        <p className="text-2xl font-bold text-black">{syncStatus.pending}</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center">
                        <RefreshCw className={`h-5 w-5 text-black ${syncStatus.syncing ? 'animate-spin' : ''}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Conflicts Resolved</p>
                        <p className="text-2xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">0</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Active Users Table */}
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg text-black">Active Schedule Users</CardTitle>
                </CardHeader>
                <Table>
                  <TableHeader className="bg-gray-100">
                    <TableRow>
                      <TableHead className="text-black font-semibold">User</TableHead>
                      <TableHead className="text-black font-semibold">Viewing Date</TableHead>
                      <TableHead className="text-black font-semibold">Status</TableHead>
                      <TableHead className="text-black font-semibold">Last Active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white">
                    {enterpriseLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-black" />
                        </TableCell>
                      </TableRow>
                    ) : schedulePresence.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                          No active users on the schedule right now.
                        </TableCell>
                      </TableRow>
                    ) : (
                      schedulePresence.map((presence) => (
                        <TableRow key={presence.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium text-black">{presence.staff_id}</TableCell>
                          <TableCell>{presence.current_view_date}</TableCell>
                          <TableCell>
                            <Badge className={
                              presence.status === 'active' ? 'bg-green-100 text-green-700' :
                              presence.status === 'idle' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }>
                              {presence.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {new Date(presence.last_seen).toLocaleTimeString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </>
          ) : null}
        </main>

        {/* Add Staff Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="bg-white border-gray-200 text-black" style={{ backgroundColor: 'white' }}>
            <DialogHeader>
              <DialogTitle className="text-black">Add New Staff Member</DialogTitle>
              <DialogDescription className="text-gray-600">
                Enter the details for the new staff member
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-black">First Name</label>
                  <Input
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="border-gray-300 text-black bg-white"
                    style={{ backgroundColor: 'white', color: 'black' }}
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-black">Last Name</label>
                  <Input
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="border-gray-300 text-black bg-white"
                    style={{ backgroundColor: 'white', color: 'black' }}
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-black">Password</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="border-gray-300 text-black bg-white"
                  style={{ backgroundColor: 'white', color: 'black' }}
                  placeholder="Leave empty for auto-generated password"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-black">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md text-black bg-white"
                    style={{ backgroundColor: 'white', color: 'black' }}
                  >
                    <option value="junior">Junior</option>
                    <option value="senior">Senior</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-black">Color</label>
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md text-black bg-white"
                    style={{ backgroundColor: 'white', color: 'black' }}
                  >
                    {STAFF_COLOR_OPTIONS.map(color => (
                      <option key={color.value} value={color.value}>{color.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-black">Specialty</label>
                <Input
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="border-gray-300 text-black bg-white"
                  style={{ backgroundColor: 'white', color: 'black' }}
                  placeholder="e.g., Hair Cutting, Styling"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-black">Profile Photo URL</label>
                <div className="flex gap-3 items-center">
                  {formData.avatar && (
                    <img
                      src={formData.avatar}
                      alt="Preview"
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                  <Input
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    className="border-gray-300 text-black bg-white flex-1"
                    style={{ backgroundColor: 'white', color: 'black' }}
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Enter a URL for the staff member's profile photo</p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
                className="border-gray-300 text-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddStaff}
                className="bg-black hover:bg-slate-800 text-white"
              >
                Add Staff
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Staff Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="bg-white border-gray-200 text-black" style={{ backgroundColor: 'white' }}>
            <DialogHeader>
              <DialogTitle className="text-black">Edit Staff Member</DialogTitle>
              <DialogDescription className="text-gray-600">
                Update the details for {selectedStaff?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-black">First Name</label>
                  <Input
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="border-gray-300 text-black bg-white"
                    style={{ backgroundColor: 'white', color: 'black' }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-black">Last Name</label>
                  <Input
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="border-gray-300 text-black bg-white"
                    style={{ backgroundColor: 'white', color: 'black' }}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-black">New Password (leave empty to keep current)</label>
                <div className="relative">
                  <Input
                    type={showEditPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="border-gray-300 text-black bg-white pr-10"
                    style={{ backgroundColor: 'white', color: 'black' }}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showEditPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-black">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md text-black bg-white"
                    style={{ backgroundColor: 'white', color: 'black' }}
                  >
                    <option value="junior">Junior</option>
                    <option value="senior">Senior</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-black">Color</label>
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md text-black bg-white"
                    style={{ backgroundColor: 'white', color: 'black' }}
                  >
                    {STAFF_COLOR_OPTIONS.map(color => (
                      <option key={color.value} value={color.value}>{color.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-black">Specialty</label>
                <Input
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="border-gray-300 text-black bg-white"
                  style={{ backgroundColor: 'white', color: 'black' }}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-black">Profile Photo URL</label>
                <div className="flex gap-3 items-center">
                  <div className="relative">
                    {formData.avatar ? (
                      <img
                        src={formData.avatar}
                        alt={selectedStaff?.name || 'Staff'}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                        onError={(e) => {
                          e.currentTarget.src = '/images/client-1.jpg';
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                        <span className="text-gray-500 text-xl font-semibold">
                          {formData.first_name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      value={formData.avatar}
                      onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                      className="border-gray-300 text-black bg-white"
                      style={{ backgroundColor: 'white', color: 'black' }}
                      placeholder="https://example.com/photo.jpg"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter a URL for the staff member's profile photo</p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
                className="border-gray-300 text-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditStaff}
                className="bg-black hover:bg-slate-800 text-white"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="bg-white border-gray-200" style={{ backgroundColor: 'white' }}>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-black">Delete Staff Member</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                Are you sure you want to delete {selectedStaff?.name}?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-gray-300 text-gray-700">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteStaff}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
};

export default AdminPanel;
