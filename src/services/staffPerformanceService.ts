// =====================================================
// STAFF PERFORMANCE DASHBOARD SERVICE
// =====================================================

import { supabase } from '@/integrations/supabase/client';
import type {
  StaffPerformanceMetrics,
  StaffGoal,
  StaffCommission,
  StaffSchedule,
  StaffTimeOff,
  LeaderboardEntry,
  TimeSeriesData,
  PaginatedResponse
} from '@/types/enterprise';

// =====================================================
// PERFORMANCE METRICS
// =====================================================

export async function getStaffPerformanceMetrics(
  staffId: string,
  startDate: string,
  endDate: string
): Promise<StaffPerformanceMetrics[]> {
  const { data, error } = await supabase
    .from('staff_performance_metrics')
    .select('*')
    .eq('staff_id', staffId)
    .gte('metric_date', startDate)
    .lte('metric_date', endDate)
    .order('metric_date', { ascending: false });

  if (error) throw error;
  return data as StaffPerformanceMetrics[];
}

export async function getAggregatedMetrics(
  staffId: string,
  startDate: string,
  endDate: string
): Promise<{
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  totalRevenue: number;
  totalTips: number;
  productsSold: number;
  productRevenue: number;
  averageRating: number;
  reviewsReceived: number;
  newClients: number;
  returningClients: number;
  utilizationRate: number;
  rebookingRate: number;
}> {
  const metrics = await getStaffPerformanceMetrics(staffId, startDate, endDate);

  if (metrics.length === 0) {
    return {
      totalAppointments: 0,
      completedAppointments: 0,
      cancelledAppointments: 0,
      noShowAppointments: 0,
      totalRevenue: 0,
      totalTips: 0,
      productsSold: 0,
      productRevenue: 0,
      averageRating: 0,
      reviewsReceived: 0,
      newClients: 0,
      returningClients: 0,
      utilizationRate: 0,
      rebookingRate: 0
    };
  }

  const totals = metrics.reduce((acc, m) => ({
    totalAppointments: acc.totalAppointments + m.total_appointments,
    completedAppointments: acc.completedAppointments + m.completed_appointments,
    cancelledAppointments: acc.cancelledAppointments + m.cancelled_appointments,
    noShowAppointments: acc.noShowAppointments + m.no_show_appointments,
    totalRevenue: acc.totalRevenue + m.revenue_generated,
    totalTips: acc.totalTips + m.tips_received,
    productsSold: acc.productsSold + m.products_sold,
    productRevenue: acc.productRevenue + m.product_revenue,
    totalRating: acc.totalRating + (m.average_rating || 0) * m.reviews_received,
    reviewsReceived: acc.reviewsReceived + m.reviews_received,
    newClients: acc.newClients + m.new_clients_served,
    returningClients: acc.returningClients + m.returning_clients_served,
    totalUtilization: acc.totalUtilization + (m.utilization_rate || 0),
    totalRebooking: acc.totalRebooking + (m.rebooking_rate || 0)
  }), {
    totalAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    noShowAppointments: 0,
    totalRevenue: 0,
    totalTips: 0,
    productsSold: 0,
    productRevenue: 0,
    totalRating: 0,
    reviewsReceived: 0,
    newClients: 0,
    returningClients: 0,
    totalUtilization: 0,
    totalRebooking: 0
  });

  return {
    ...totals,
    averageRating: totals.reviewsReceived > 0 ? totals.totalRating / totals.reviewsReceived : 0,
    utilizationRate: metrics.length > 0 ? totals.totalUtilization / metrics.length : 0,
    rebookingRate: metrics.length > 0 ? totals.totalRebooking / metrics.length : 0
  };
}

export async function calculateDailyMetrics(staffId: string, date: string): Promise<void> {
  // Get appointments for the day
  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('staff_id', staffId)
    .eq('appointment_date', date);

  if (!appointments) return;

  const metrics = {
    staff_id: staffId,
    metric_date: date,
    total_appointments: appointments.length,
    completed_appointments: appointments.filter(a => a.status === 'completed').length,
    cancelled_appointments: appointments.filter(a => a.status === 'cancelled').length,
    no_show_appointments: appointments.filter(a => a.status === 'no_show').length,
    revenue_generated: appointments
      .filter(a => a.status === 'completed')
      .reduce((sum, a) => sum + (a.total_amount || 0), 0),
    tips_received: 0, // Would need tip data
    products_sold: 0, // Would need product sale data
    product_revenue: 0,
    new_clients_served: 0, // Would need to check customer history
    returning_clients_served: 0
  };

  // Upsert the metrics
  const { error } = await supabase
    .from('staff_performance_metrics')
    .upsert(metrics, { onConflict: 'staff_id,metric_date' });

  if (error) throw error;
}

// =====================================================
// LEADERBOARDS
// =====================================================

export async function getRevenueLeaderboard(
  startDate: string,
  endDate: string,
  limit: number = 10
): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('staff_performance_metrics')
    .select('staff_id, revenue_generated')
    .gte('metric_date', startDate)
    .lte('metric_date', endDate);

  if (error) throw error;

  // Aggregate by staff
  const staffRevenue: Record<string, number> = {};
  data?.forEach(m => {
    staffRevenue[m.staff_id] = (staffRevenue[m.staff_id] || 0) + m.revenue_generated;
  });

  // Get staff names
  const staffIds = Object.keys(staffRevenue);
  const { data: staff } = await supabase
    .from('staff')
    .select('id, first_name, last_name, avatar_url')
    .in('id', staffIds);

  // Build leaderboard
  const leaderboard = staffIds
    .map(id => ({
      staff_id: id,
      metric_value: staffRevenue[id],
      staff: staff?.find(s => s.id === id)
    }))
    .sort((a, b) => b.metric_value - a.metric_value)
    .slice(0, limit)
    .map((entry, index) => ({
      rank: index + 1,
      staff_id: entry.staff_id,
      staff_name: entry.staff ? `${entry.staff.first_name} ${entry.staff.last_name}` : 'Unknown',
      avatar_url: entry.staff?.avatar_url,
      metric_value: entry.metric_value,
      metric_label: 'Revenue'
    }));

  return leaderboard;
}

export async function getRatingsLeaderboard(
  startDate: string,
  endDate: string,
  limit: number = 10
): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('staff_performance_metrics')
    .select('staff_id, average_rating, reviews_received')
    .gte('metric_date', startDate)
    .lte('metric_date', endDate);

  if (error) throw error;

  // Aggregate by staff (weighted average)
  const staffRatings: Record<string, { totalRating: number; totalReviews: number }> = {};
  data?.forEach(m => {
    if (!staffRatings[m.staff_id]) {
      staffRatings[m.staff_id] = { totalRating: 0, totalReviews: 0 };
    }
    staffRatings[m.staff_id].totalRating += (m.average_rating || 0) * m.reviews_received;
    staffRatings[m.staff_id].totalReviews += m.reviews_received;
  });

  // Get staff names
  const staffIds = Object.keys(staffRatings);
  const { data: staff } = await supabase
    .from('staff')
    .select('id, first_name, last_name, avatar_url')
    .in('id', staffIds);

  // Build leaderboard
  const leaderboard = staffIds
    .filter(id => staffRatings[id].totalReviews > 0)
    .map(id => ({
      staff_id: id,
      metric_value: staffRatings[id].totalRating / staffRatings[id].totalReviews,
      staff: staff?.find(s => s.id === id)
    }))
    .sort((a, b) => b.metric_value - a.metric_value)
    .slice(0, limit)
    .map((entry, index) => ({
      rank: index + 1,
      staff_id: entry.staff_id,
      staff_name: entry.staff ? `${entry.staff.first_name} ${entry.staff.last_name}` : 'Unknown',
      avatar_url: entry.staff?.avatar_url,
      metric_value: Math.round(entry.metric_value * 10) / 10,
      metric_label: 'Rating'
    }));

  return leaderboard;
}

export async function getAppointmentsLeaderboard(
  startDate: string,
  endDate: string,
  limit: number = 10
): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('staff_performance_metrics')
    .select('staff_id, completed_appointments')
    .gte('metric_date', startDate)
    .lte('metric_date', endDate);

  if (error) throw error;

  // Aggregate by staff
  const staffAppointments: Record<string, number> = {};
  data?.forEach(m => {
    staffAppointments[m.staff_id] = (staffAppointments[m.staff_id] || 0) + m.completed_appointments;
  });

  // Get staff names
  const staffIds = Object.keys(staffAppointments);
  const { data: staff } = await supabase
    .from('staff')
    .select('id, first_name, last_name, avatar_url')
    .in('id', staffIds);

  // Build leaderboard
  const leaderboard = staffIds
    .map(id => ({
      staff_id: id,
      metric_value: staffAppointments[id],
      staff: staff?.find(s => s.id === id)
    }))
    .sort((a, b) => b.metric_value - a.metric_value)
    .slice(0, limit)
    .map((entry, index) => ({
      rank: index + 1,
      staff_id: entry.staff_id,
      staff_name: entry.staff ? `${entry.staff.first_name} ${entry.staff.last_name}` : 'Unknown',
      avatar_url: entry.staff?.avatar_url,
      metric_value: entry.metric_value,
      metric_label: 'Appointments'
    }));

  return leaderboard;
}

// =====================================================
// STAFF GOALS
// =====================================================

export async function getStaffGoals(staffId: string): Promise<StaffGoal[]> {
  const { data, error } = await supabase
    .from('staff_goals')
    .select('*')
    .eq('staff_id', staffId)
    .order('period_start', { ascending: false });

  if (error) throw error;
  return data as StaffGoal[];
}

export async function getActiveGoals(staffId: string): Promise<StaffGoal[]> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('staff_goals')
    .select('*')
    .eq('staff_id', staffId)
    .eq('status', 'active')
    .lte('period_start', today)
    .gte('period_end', today);

  if (error) throw error;
  return data as StaffGoal[];
}

export async function createGoal(goal: Partial<StaffGoal>): Promise<StaffGoal> {
  const { data, error } = await supabase
    .from('staff_goals')
    .insert(goal)
    .select()
    .single();

  if (error) throw error;
  return data as StaffGoal;
}

export async function updateGoal(id: string, updates: Partial<StaffGoal>): Promise<StaffGoal> {
  const { data, error } = await supabase
    .from('staff_goals')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as StaffGoal;
}

export async function updateGoalProgress(goalId: string): Promise<StaffGoal> {
  const { data: goal } = await supabase
    .from('staff_goals')
    .select('*')
    .eq('id', goalId)
    .single();

  if (!goal) throw new Error('Goal not found');

  // Calculate current value based on goal type
  let currentValue = 0;
  const metrics = await getStaffPerformanceMetrics(
    goal.staff_id,
    goal.period_start,
    goal.period_end
  );

  switch (goal.goal_type) {
    case 'revenue':
      currentValue = metrics.reduce((sum, m) => sum + m.revenue_generated, 0);
      break;
    case 'appointments':
      currentValue = metrics.reduce((sum, m) => sum + m.completed_appointments, 0);
      break;
    case 'reviews':
      currentValue = metrics.reduce((sum, m) => sum + m.reviews_received, 0);
      break;
    case 'products':
      currentValue = metrics.reduce((sum, m) => sum + m.products_sold, 0);
      break;
    case 'rebooking':
      currentValue = metrics.length > 0
        ? metrics.reduce((sum, m) => sum + (m.rebooking_rate || 0), 0) / metrics.length
        : 0;
      break;
  }

  // Check if goal achieved
  const status = currentValue >= goal.target_value ? 'achieved' : 'active';

  return updateGoal(goalId, { current_value: currentValue, status });
}

// =====================================================
// COMMISSIONS
// =====================================================

export async function getStaffCommissions(
  staffId: string,
  startDate?: string,
  endDate?: string
): Promise<StaffCommission[]> {
  let query = supabase
    .from('staff_commissions')
    .select('*')
    .eq('staff_id', staffId);

  if (startDate) {
    query = query.gte('created_at', startDate);
  }
  if (endDate) {
    query = query.lte('created_at', endDate);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data as StaffCommission[];
}

export async function calculateCommission(
  staffId: string,
  appointmentId: string,
  amount: number,
  commissionType: 'service' | 'product' | 'tip',
  rate: number = 0.4 // 40% default
): Promise<StaffCommission> {
  const commissionAmount = amount * rate;

  const { data, error } = await supabase
    .from('staff_commissions')
    .insert({
      staff_id: staffId,
      commission_type: commissionType,
      source_id: appointmentId,
      amount: commissionAmount,
      rate: rate * 100,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return data as StaffCommission;
}

export async function approveCommission(id: string): Promise<StaffCommission> {
  const { data, error } = await supabase
    .from('staff_commissions')
    .update({ status: 'approved' })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as StaffCommission;
}

export async function markCommissionPaid(id: string): Promise<StaffCommission> {
  const { data, error } = await supabase
    .from('staff_commissions')
    .update({
      status: 'paid',
      paid_date: new Date().toISOString().split('T')[0]
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as StaffCommission;
}

export async function getPendingCommissions(): Promise<StaffCommission[]> {
  const { data, error } = await supabase
    .from('staff_commissions')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as StaffCommission[];
}

// =====================================================
// SCHEDULES
// =====================================================

export async function getStaffSchedule(staffId: string): Promise<StaffSchedule[]> {
  const { data, error } = await supabase
    .from('staff_schedules')
    .select('*')
    .eq('staff_id', staffId)
    .order('day_of_week');

  if (error) throw error;
  return data as StaffSchedule[];
}

export async function updateStaffSchedule(
  staffId: string,
  schedules: Partial<StaffSchedule>[]
): Promise<StaffSchedule[]> {
  // Delete existing schedules
  await supabase
    .from('staff_schedules')
    .delete()
    .eq('staff_id', staffId);

  // Insert new schedules
  const schedulesWithStaffId = schedules.map(s => ({
    ...s,
    staff_id: staffId
  }));

  const { data, error } = await supabase
    .from('staff_schedules')
    .insert(schedulesWithStaffId)
    .select();

  if (error) throw error;
  return data as StaffSchedule[];
}

// =====================================================
// TIME OFF
// =====================================================

export async function getTimeOffRequests(
  staffId?: string,
  status?: 'pending' | 'approved' | 'denied'
): Promise<StaffTimeOff[]> {
  let query = supabase
    .from('staff_time_off')
    .select('*');

  if (staffId) {
    query = query.eq('staff_id', staffId);
  }
  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('start_date', { ascending: false });

  if (error) throw error;
  return data as StaffTimeOff[];
}

export async function requestTimeOff(request: Partial<StaffTimeOff>): Promise<StaffTimeOff> {
  const { data, error } = await supabase
    .from('staff_time_off')
    .insert(request)
    .select()
    .single();

  if (error) throw error;
  return data as StaffTimeOff;
}

export async function approveTimeOff(
  id: string,
  approverId: string
): Promise<StaffTimeOff> {
  const { data, error } = await supabase
    .from('staff_time_off')
    .update({
      status: 'approved',
      approved_by: approverId,
      approved_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as StaffTimeOff;
}

export async function denyTimeOff(
  id: string,
  approverId: string,
  notes?: string
): Promise<StaffTimeOff> {
  const { data, error } = await supabase
    .from('staff_time_off')
    .update({
      status: 'denied',
      approved_by: approverId,
      approved_at: new Date().toISOString(),
      notes
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as StaffTimeOff;
}

// =====================================================
// UTILIZATION
// =====================================================

export async function calculateUtilizationRate(
  staffId: string,
  date: string
): Promise<number> {
  // Get staff schedule for the day
  const dayOfWeek = new Date(date).getDay();
  const { data: schedule } = await supabase
    .from('staff_schedules')
    .select('*')
    .eq('staff_id', staffId)
    .eq('day_of_week', dayOfWeek)
    .single();

  if (!schedule || !schedule.is_available) return 0;

  // Calculate available minutes
  const startMinutes = timeToMinutes(schedule.start_time);
  const endMinutes = timeToMinutes(schedule.end_time);
  let availableMinutes = endMinutes - startMinutes;

  // Subtract break time
  if (schedule.break_start && schedule.break_end) {
    const breakStart = timeToMinutes(schedule.break_start);
    const breakEnd = timeToMinutes(schedule.break_end);
    availableMinutes -= (breakEnd - breakStart);
  }

  // Get appointments for the day
  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, services(duration)')
    .eq('staff_id', staffId)
    .eq('appointment_date', date)
    .in('status', ['confirmed', 'completed']);

  if (!appointments || appointments.length === 0) return 0;

  // Calculate booked minutes
  const bookedMinutes = appointments.reduce((sum, a) => {
    return sum + (a.services?.duration || 60);
  }, 0);

  return Math.min(100, (bookedMinutes / availableMinutes) * 100);
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// =====================================================
// TRENDS
// =====================================================

export async function getRevenueTrend(
  staffId: string,
  days: number = 30
): Promise<TimeSeriesData[]> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const metrics = await getStaffPerformanceMetrics(
    staffId,
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0]
  );

  return metrics.map(m => ({
    date: m.metric_date,
    value: m.revenue_generated
  })).reverse();
}

export async function getAppointmentsTrend(
  staffId: string,
  days: number = 30
): Promise<TimeSeriesData[]> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const metrics = await getStaffPerformanceMetrics(
    staffId,
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0]
  );

  return metrics.map(m => ({
    date: m.metric_date,
    value: m.completed_appointments
  })).reverse();
}

export async function getRatingTrend(
  staffId: string,
  days: number = 30
): Promise<TimeSeriesData[]> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const metrics = await getStaffPerformanceMetrics(
    staffId,
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0]
  );

  return metrics
    .filter(m => m.average_rating !== null)
    .map(m => ({
      date: m.metric_date,
      value: m.average_rating || 0
    })).reverse();
}

export default {
  getStaffPerformanceMetrics,
  getAggregatedMetrics,
  calculateDailyMetrics,
  getRevenueLeaderboard,
  getRatingsLeaderboard,
  getAppointmentsLeaderboard,
  getStaffGoals,
  getActiveGoals,
  createGoal,
  updateGoal,
  updateGoalProgress,
  getStaffCommissions,
  calculateCommission,
  approveCommission,
  markCommissionPaid,
  getPendingCommissions,
  getStaffSchedule,
  updateStaffSchedule,
  getTimeOffRequests,
  requestTimeOff,
  approveTimeOff,
  denyTimeOff,
  calculateUtilizationRate,
  getRevenueTrend,
  getAppointmentsTrend,
  getRatingTrend
};
