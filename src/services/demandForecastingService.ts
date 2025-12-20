// =====================================================
// AI DEMAND FORECASTING ENGINE SERVICE
// =====================================================

import { supabase } from '@/integrations/supabase/client';
import type {
  DemandHistory,
  DemandForecast,
  DynamicPricingRule,
  StaffingRecommendation,
  TimeSeriesData
} from '@/types/enterprise';

// =====================================================
// HISTORICAL DATA COLLECTION
// =====================================================

export async function recordDemandData(date: string, hour: number): Promise<void> {
  const dayOfWeek = new Date(date).getDay();

  // Get appointments for this hour
  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, services(category, price)')
    .eq('appointment_date', date)
    .gte('appointment_time', `${hour.toString().padStart(2, '0')}:00`)
    .lt('appointment_time', `${(hour + 1).toString().padStart(2, '0')}:00`);

  // Group by service category
  const byCategory: Record<string, { bookings: number; revenue: number; duration: number }> = {};

  appointments?.forEach(a => {
    const category = a.services?.category || 'general';
    if (!byCategory[category]) {
      byCategory[category] = { bookings: 0, revenue: 0, duration: 0 };
    }
    byCategory[category].bookings++;
    byCategory[category].revenue += a.total_amount || a.services?.price || 0;
    byCategory[category].duration += a.services?.duration || 60;
  });

  // Record data for each category
  for (const [category, data] of Object.entries(byCategory)) {
    await supabase.from('demand_history').upsert({
      date,
      hour,
      day_of_week: dayOfWeek,
      service_category: category,
      total_bookings: data.bookings,
      total_revenue: data.revenue,
      average_duration: data.bookings > 0 ? data.duration / data.bookings : 0,
      created_at: new Date().toISOString()
    }, { onConflict: 'date,hour,service_category' });
  }
}

export async function getDemandHistory(
  startDate: string,
  endDate: string,
  serviceCategory?: string
): Promise<DemandHistory[]> {
  let query = supabase
    .from('demand_history')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate);

  if (serviceCategory) {
    query = query.eq('service_category', serviceCategory);
  }

  const { data, error } = await query.order('date', { ascending: false });

  if (error) throw error;
  return data as DemandHistory[];
}

// =====================================================
// DEMAND FORECASTING (ML-like algorithm)
// =====================================================

interface ForecastFactors {
  dayOfWeek: number;
  hour: number;
  historicalAverage: number;
  trend: number;
  seasonality: number;
  dayOfMonth: number;
  isWeekend: boolean;
  isHoliday: boolean;
}

export async function generateForecast(
  targetDate: string,
  serviceCategory?: string
): Promise<DemandForecast[]> {
  const forecasts: DemandForecast[] = [];
  const targetDay = new Date(targetDate);
  const dayOfWeek = targetDay.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Get historical data for pattern analysis (last 90 days)
  const historyStartDate = new Date(targetDate);
  historyStartDate.setDate(historyStartDate.getDate() - 90);

  const history = await getDemandHistory(
    historyStartDate.toISOString().split('T')[0],
    new Date().toISOString().split('T')[0],
    serviceCategory
  );

  // Business hours (9 AM to 8 PM)
  for (let hour = 9; hour <= 20; hour++) {
    // Filter history for same day of week and hour
    const relevantHistory = history.filter(h =>
      h.day_of_week === dayOfWeek && h.hour === hour
    );

    // Calculate base prediction using weighted moving average
    const prediction = calculatePrediction(relevantHistory, {
      dayOfWeek,
      hour,
      isWeekend,
      dayOfMonth: targetDay.getDate()
    });

    // Calculate confidence interval
    const stdDev = calculateStdDev(relevantHistory.map(h => h.total_bookings));
    const confidence = Math.max(0.5, 1 - (stdDev / (prediction.value + 1)));

    forecasts.push({
      id: crypto.randomUUID(),
      forecast_date: targetDate,
      hour,
      service_category: serviceCategory || null,
      predicted_bookings: Math.round(prediction.value),
      confidence_low: Math.max(0, Math.round(prediction.value - stdDev)),
      confidence_high: Math.round(prediction.value + stdDev),
      confidence_score: confidence,
      factors: prediction.factors,
      model_version: '1.0',
      created_at: new Date().toISOString()
    });
  }

  // Save forecasts
  await supabase.from('demand_forecasts').upsert(
    forecasts.map(f => ({
      ...f,
      id: undefined // Let DB generate ID
    })),
    { onConflict: 'forecast_date,hour,service_category,model_version' }
  );

  return forecasts;
}

function calculatePrediction(
  history: DemandHistory[],
  params: { dayOfWeek: number; hour: number; isWeekend: boolean; dayOfMonth: number }
): { value: number; factors: Record<string, number> } {
  if (history.length === 0) {
    return { value: 2, factors: { base: 1.0 } }; // Default prediction
  }

  // Weight recent data more heavily (exponential decay)
  const weights = history.map((_, i) => Math.exp(-i * 0.05));
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  // Weighted average of bookings
  const weightedSum = history.reduce((sum, h, i) =>
    sum + h.total_bookings * weights[i], 0
  );
  const baseValue = weightedSum / totalWeight;

  // Factors
  const factors: Record<string, number> = {
    base: 1.0
  };

  // Day of week adjustment
  const dayMultiplier = params.isWeekend ? 1.2 : 1.0; // Weekends typically busier
  factors.day_of_week = dayMultiplier;

  // Hour adjustment (peak hours: 10-12, 14-18)
  let hourMultiplier = 1.0;
  if (params.hour >= 10 && params.hour <= 12) hourMultiplier = 1.3;
  else if (params.hour >= 14 && params.hour <= 18) hourMultiplier = 1.2;
  else if (params.hour >= 19) hourMultiplier = 0.8;
  factors.hour = hourMultiplier;

  // End of month adjustment (payday effect)
  const monthEndMultiplier = params.dayOfMonth >= 25 || params.dayOfMonth <= 5 ? 1.15 : 1.0;
  factors.month_end = monthEndMultiplier;

  // Calculate trend (are bookings increasing or decreasing?)
  const recentAvg = history.slice(0, 4).reduce((s, h) => s + h.total_bookings, 0) / 4 || 0;
  const olderAvg = history.slice(4, 12).reduce((s, h) => s + h.total_bookings, 0) / 8 || recentAvg;
  const trendMultiplier = olderAvg > 0 ? Math.min(1.5, Math.max(0.5, recentAvg / olderAvg)) : 1.0;
  factors.trend = trendMultiplier;

  // Final prediction
  const finalValue = baseValue * dayMultiplier * hourMultiplier * monthEndMultiplier * trendMultiplier;

  return {
    value: Math.max(0, finalValue),
    factors
  };
}

function calculateStdDev(values: number[]): number {
  if (values.length === 0) return 1;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const squareDiffs = values.map(v => Math.pow(v - avg, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
  return Math.sqrt(avgSquareDiff);
}

export async function getForecasts(
  startDate: string,
  endDate: string,
  serviceCategory?: string
): Promise<DemandForecast[]> {
  let query = supabase
    .from('demand_forecasts')
    .select('*')
    .gte('forecast_date', startDate)
    .lte('forecast_date', endDate);

  if (serviceCategory) {
    query = query.eq('service_category', serviceCategory);
  }

  const { data, error } = await query.order('forecast_date').order('hour');

  if (error) throw error;
  return data as DemandForecast[];
}

// =====================================================
// DYNAMIC PRICING
// =====================================================

export async function getDynamicPricingRules(): Promise<DynamicPricingRule[]> {
  const { data, error } = await supabase
    .from('dynamic_pricing_rules')
    .select('*')
    .eq('is_active', true)
    .order('priority', { ascending: false });

  if (error) throw error;
  return data as DynamicPricingRule[];
}

export async function createPricingRule(rule: Partial<DynamicPricingRule>): Promise<DynamicPricingRule> {
  const { data, error } = await supabase
    .from('dynamic_pricing_rules')
    .insert(rule)
    .select()
    .single();

  if (error) throw error;
  return data as DynamicPricingRule;
}

export async function updatePricingRule(
  id: string,
  updates: Partial<DynamicPricingRule>
): Promise<DynamicPricingRule> {
  const { data, error } = await supabase
    .from('dynamic_pricing_rules')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as DynamicPricingRule;
}

export async function deletePricingRule(id: string): Promise<void> {
  const { error } = await supabase
    .from('dynamic_pricing_rules')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function calculateDynamicPrice(
  basePrice: number,
  serviceId: string,
  date: string,
  time: string
): Promise<{ finalPrice: number; adjustment: number; ruleApplied?: string }> {
  const rules = await getDynamicPricingRules();
  const forecast = await getForecasts(date, date);
  const hour = parseInt(time.split(':')[0]);
  const relevantForecast = forecast.find(f => f.hour === hour);

  // Determine demand level
  let demandLevel: 'low' | 'medium' | 'high' = 'medium';
  if (relevantForecast) {
    const predicted = relevantForecast.predicted_bookings;
    if (predicted >= 5) demandLevel = 'high';
    else if (predicted <= 2) demandLevel = 'low';
  }

  // Calculate days ahead
  const daysAhead = Math.ceil(
    (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  // Find applicable rule
  for (const rule of rules) {
    // Check if rule applies to this service
    if (rule.service_id && rule.service_id !== serviceId) continue;

    // Check validity period
    if (rule.valid_from && new Date(rule.valid_from) > new Date()) continue;
    if (rule.valid_until && new Date(rule.valid_until) < new Date()) continue;

    // Check conditions
    const conditions = rule.conditions;

    if (conditions.demand_level && conditions.demand_level !== demandLevel) continue;

    if (conditions.days_ahead) {
      if (conditions.days_ahead.min !== undefined && daysAhead < conditions.days_ahead.min) continue;
      if (conditions.days_ahead.max !== undefined && daysAhead > conditions.days_ahead.max) continue;
    }

    if (conditions.day_of_week) {
      const dayOfWeek = new Date(date).getDay();
      if (!conditions.day_of_week.includes(dayOfWeek)) continue;
    }

    // Apply pricing adjustment
    let adjustment = 0;
    if (rule.price_adjustment_type === 'percentage') {
      adjustment = basePrice * (rule.price_adjustment_value / 100);
    } else {
      adjustment = rule.price_adjustment_value;
    }

    let finalPrice = basePrice + adjustment;

    // Apply min/max constraints
    if (rule.min_price !== null && finalPrice < rule.min_price) {
      finalPrice = rule.min_price;
    }
    if (rule.max_price !== null && finalPrice > rule.max_price) {
      finalPrice = rule.max_price;
    }

    return {
      finalPrice: Math.round(finalPrice * 100) / 100,
      adjustment: Math.round(adjustment * 100) / 100,
      ruleApplied: rule.name
    };
  }

  // No rule applied
  return { finalPrice: basePrice, adjustment: 0 };
}

// =====================================================
// STAFFING RECOMMENDATIONS
// =====================================================

export async function generateStaffingRecommendations(
  date: string
): Promise<StaffingRecommendation[]> {
  const recommendations: StaffingRecommendation[] = [];

  // Get forecasts for the day
  const forecasts = await getForecasts(date, date);

  // Get current staff schedules
  const dayOfWeek = new Date(date).getDay();
  const { data: schedules } = await supabase
    .from('staff_schedules')
    .select('*')
    .eq('day_of_week', dayOfWeek)
    .eq('is_available', true);

  // Average service duration (in hours)
  const avgServiceDuration = 1;

  // Group forecasts into time slots (2-hour blocks)
  const timeSlots = [
    { start: '09:00', end: '11:00', hours: [9, 10] },
    { start: '11:00', end: '13:00', hours: [11, 12] },
    { start: '13:00', end: '15:00', hours: [13, 14] },
    { start: '15:00', end: '17:00', hours: [15, 16] },
    { start: '17:00', end: '19:00', hours: [17, 18] },
    { start: '19:00', end: '21:00', hours: [19, 20] }
  ];

  for (const slot of timeSlots) {
    const slotForecasts = forecasts.filter(f => slot.hours.includes(f.hour));
    const totalPredicted = slotForecasts.reduce((sum, f) => sum + f.predicted_bookings, 0);

    // Calculate recommended staff (1 staff per 2 appointments in the slot)
    const recommended = Math.ceil(totalPredicted / (2 / avgServiceDuration));

    // Count current staff available for this slot
    const currentStaff = schedules?.filter(s => {
      const scheduleStart = parseInt(s.start_time.split(':')[0]);
      const scheduleEnd = parseInt(s.end_time.split(':')[0]);
      const slotStart = parseInt(slot.start.split(':')[0]);
      return scheduleStart <= slotStart && scheduleEnd >= slotStart + 2;
    }).length || 0;

    // Calculate confidence based on forecast confidence
    const avgConfidence = slotForecasts.length > 0
      ? slotForecasts.reduce((sum, f) => sum + (f.confidence_score || 0.5), 0) / slotForecasts.length
      : 0.5;

    recommendations.push({
      id: crypto.randomUUID(),
      recommendation_date: date,
      time_slot_start: slot.start,
      time_slot_end: slot.end,
      service_category: null,
      recommended_staff_count: Math.max(1, recommended),
      current_staff_count: currentStaff,
      expected_demand: totalPredicted,
      confidence_score: avgConfidence,
      status: 'pending',
      notes: recommended > currentStaff
        ? `Consider adding ${recommended - currentStaff} more staff`
        : undefined,
      created_at: new Date().toISOString()
    });
  }

  // Save recommendations
  await supabase.from('staffing_recommendations').upsert(recommendations);

  return recommendations;
}

export async function getStaffingRecommendations(
  date: string
): Promise<StaffingRecommendation[]> {
  const { data, error } = await supabase
    .from('staffing_recommendations')
    .select('*')
    .eq('recommendation_date', date)
    .order('time_slot_start');

  if (error) throw error;
  return data as StaffingRecommendation[];
}

export async function updateRecommendationStatus(
  id: string,
  status: 'accepted' | 'rejected',
  notes?: string
): Promise<StaffingRecommendation> {
  const { data, error } = await supabase
    .from('staffing_recommendations')
    .update({ status, notes })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as StaffingRecommendation;
}

// =====================================================
// ANALYTICS
// =====================================================

export async function getDemandTrend(days: number = 30): Promise<TimeSeriesData[]> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('demand_history')
    .select('date, total_bookings')
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0])
    .order('date');

  if (error) throw error;

  // Aggregate by date
  const byDate: Record<string, number> = {};
  data?.forEach(d => {
    byDate[d.date] = (byDate[d.date] || 0) + d.total_bookings;
  });

  return Object.entries(byDate)
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getPeakHoursAnalysis(days: number = 30): Promise<{ hour: number; avgBookings: number }[]> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('demand_history')
    .select('hour, total_bookings')
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0]);

  if (error) throw error;

  // Aggregate by hour
  const byHour: Record<number, { total: number; count: number }> = {};
  data?.forEach(d => {
    if (!byHour[d.hour]) {
      byHour[d.hour] = { total: 0, count: 0 };
    }
    byHour[d.hour].total += d.total_bookings;
    byHour[d.hour].count++;
  });

  return Object.entries(byHour)
    .map(([hour, data]) => ({
      hour: parseInt(hour),
      avgBookings: data.count > 0 ? data.total / data.count : 0
    }))
    .sort((a, b) => a.hour - b.hour);
}

export async function getForecastAccuracy(days: number = 30): Promise<number> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get forecasts and actuals
  const [forecasts, history] = await Promise.all([
    getForecasts(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]),
    getDemandHistory(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0])
  ]);

  if (forecasts.length === 0) return 0;

  let totalError = 0;
  let count = 0;

  forecasts.forEach(f => {
    const actual = history.find(h =>
      h.date === f.forecast_date &&
      h.hour === f.hour &&
      h.service_category === f.service_category
    );

    if (actual) {
      const error = Math.abs(f.predicted_bookings - actual.total_bookings);
      const mape = actual.total_bookings > 0
        ? error / actual.total_bookings
        : error > 0 ? 1 : 0;
      totalError += mape;
      count++;
    }
  });

  // Return accuracy as 1 - MAPE
  const mape = count > 0 ? totalError / count : 0;
  return Math.max(0, Math.min(100, (1 - mape) * 100));
}

export default {
  recordDemandData,
  getDemandHistory,
  generateForecast,
  getForecasts,
  getDynamicPricingRules,
  createPricingRule,
  updatePricingRule,
  deletePricingRule,
  calculateDynamicPrice,
  generateStaffingRecommendations,
  getStaffingRecommendations,
  updateRecommendationStatus,
  getDemandTrend,
  getPeakHoursAnalysis,
  getForecastAccuracy
};
