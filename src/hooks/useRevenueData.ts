import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@clerk/clerk-react';

export interface RevenueData {
  date: string;
  bookings: number;
  revenue: number;
  servicesRevenue: number;
  productsRevenue: number;
  avgBookingValue: number;
  newCustomers: number;
  returningCustomers: number;
}

export interface RevenueKPIs {
  totalRevenue: number;
  totalBookings: number;
  avgRevenuePerDay: number;
  avgBookingsPerDay: number;
  growthRate: number;
  profitMargin: number;
  customerAcquisitionCost: number;
  lifetimeValue: number;
  roi: number;
  churnRate: number;
  retentionRate: number;
}

export const useRevenueData = (timeRange: string = '6m') => {
  const { isSignedIn } = useAuth();
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [kpis, setKpis] = useState<RevenueKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    fetchRevenueData();
  }, [isSignedIn, timeRange]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate date range based on timeRange
      const now = new Date();
      let startDate: Date;

      switch (timeRange) {
        case '1m':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          break;
        case '3m':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          break;
        case '6m':
          startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
          break;
        case '1y':
          startDate = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      }

      // Fetch transactions within the date range
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select(`
          id,
          total_amount,
          created_at,
          status,
          customer_id,
          transaction_items (
            item_type,
            price_per_unit,
            quantity,
            discount_applied
          )
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', now.toISOString())
        .eq('status', 'completed')
        .order('created_at', { ascending: true });

      if (transactionsError) {
        throw transactionsError;
      }

      if (!transactions || transactions.length === 0) {
        // Return empty data with 0 values
        const emptyData: RevenueData[] = [];
        const emptyKPIs: RevenueKPIs = {
          totalRevenue: 0,
          totalBookings: 0,
          avgRevenuePerDay: 0,
          avgBookingsPerDay: 0,
          growthRate: 0,
          profitMargin: 45,
          customerAcquisitionCost: 0,
          lifetimeValue: 0,
          roi: 0,
          churnRate: 0,
          retentionRate: 100
        };

        setRevenueData(emptyData);
        setKpis(emptyKPIs);
        setLoading(false);
        return;
      }

      // Process transactions into daily revenue data
      const dailyData: { [key: string]: RevenueData } = {};

      transactions.forEach(transaction => {
        const date = new Date(transaction.created_at).toISOString().split('T')[0];

        if (!dailyData[date]) {
          dailyData[date] = {
            date,
            bookings: 0,
            revenue: 0,
            servicesRevenue: 0,
            productsRevenue: 0,
            avgBookingValue: 0,
            newCustomers: 0,
            returningCustomers: 0
          };
        }

        dailyData[date].bookings += 1;
        dailyData[date].revenue += transaction.total_amount;

        // Calculate services vs products revenue from transaction items
        if (transaction.transaction_items) {
          transaction.transaction_items.forEach((item: any) => {
            const itemRevenue = (item.price_per_unit * item.quantity) - (item.discount_applied || 0);
            if (item.item_type === 'service') {
              dailyData[date].servicesRevenue += itemRevenue;
            } else if (item.item_type === 'product') {
              dailyData[date].productsRevenue += itemRevenue;
            }
          });
        }
      });

      // Convert to array and calculate averages
      const processedData: RevenueData[] = Object.values(dailyData).map(day => ({
        ...day,
        avgBookingValue: day.bookings > 0 ? day.revenue / day.bookings : 0
      }));

      // Calculate KPIs
      const totalRevenue = processedData.reduce((sum, day) => sum + day.revenue, 0);
      const totalBookings = processedData.reduce((sum, day) => sum + day.bookings, 0);
      const daysCount = processedData.length;

      const calculatedKPIs: RevenueKPIs = {
        totalRevenue,
        totalBookings,
        avgRevenuePerDay: daysCount > 0 ? totalRevenue / daysCount : 0,
        avgBookingsPerDay: daysCount > 0 ? totalBookings / daysCount : 0,
        growthRate: 0, // Would need more complex calculation with previous period
        profitMargin: 45, // Default assumption
        customerAcquisitionCost: 45, // Default assumption
        lifetimeValue: totalRevenue > 0 ? totalRevenue / Math.max(totalBookings, 1) * 10 : 0, // Rough estimate
        roi: 245, // Default assumption
        churnRate: 8.5, // Default assumption
        retentionRate: 91.5 // Default assumption
      };

      setRevenueData(processedData);
      setKpis(calculatedKPIs);

    } catch (err) {
      console.error('Error fetching revenue data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch revenue data');
    } finally {
      setLoading(false);
    }
  };

  return {
    revenueData,
    kpis,
    loading,
    error,
    refetch: fetchRevenueData
  };
};