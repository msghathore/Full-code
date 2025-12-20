import { supabase } from '@/integrations/supabase/client';

/**
 * Dashboard Statistics Interface
 */
export interface DashboardStats {
    loyaltyPoints: number;
    totalOrders: number;
    totalBookings: number;
    totalSpent: number;
}

/**
 * User Profile Interface
 */
export interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    memberSince: string;
    avatar: string;
}

/**
 * Appointment/Booking Interface
 */
export interface UserAppointment {
    id: string;
    date: string;
    time: string;
    service: string;
    staff: string;
    duration: number;
    price: number;
    status: string;
    location?: string;
}

/**
 * Order Interface
 */
export interface UserOrder {
    id: string;
    date: string;
    amount: number;
    status: string;
    items: string[];
    tracking?: string;
}

/**
 * Loyalty Transaction Interface
 */
export interface LoyaltyTransaction {
    id: string;
    date: string;
    type: 'earned' | 'redeemed';
    points: number;
    description: string;
    transactionId: string;
}

/**
 * Get complete user profile with phone number
 */
export async function getUserProfile(): Promise<UserProfile | null> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        // Get profile data (includes phone and loyalty_points)
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        return {
            id: user.id,
            name: profile?.full_name ||
                `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() ||
                'User',
            email: user.email || '',
            phone: profile?.phone || '+1 (555) 123-4567',
            memberSince: profile?.created_at
                ? new Date(profile.created_at).getFullYear().toString()
                : new Date(user.created_at || Date.now()).getFullYear().toString(),
            avatar: profile?.avatar_url || '/images/client-1.jpg'
        };
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
}

/**
 * Get user dashboard statistics
 * @param userIdOrEmail - User ID or email prefixed with "email:" for email-based lookup
 */
export async function getUserDashboardStats(userIdOrEmail?: string): Promise<DashboardStats> {
    try {
        let userId = userIdOrEmail;
        let userEmail: string | null = null;

        // Check if this is an email-based lookup
        if (userId?.startsWith('email:')) {
            userEmail = userId.substring(6);
            userId = null;
            console.log('Dashboard: Using email-based lookup for:', userEmail);
        }

        // If no ID or email provided, try Supabase auth as fallback
        if (!userId && !userEmail) {
            const { data: { user } } = await supabase.auth.getUser();
            userId = user?.id;
        }

        if (!userId && !userEmail) {
            console.log('Dashboard: No user ID or email available');
            return {
                loyaltyPoints: 0,
                totalOrders: 0,
                totalBookings: 0,
                totalSpent: 0
            };
        }

        console.log('Dashboard: Fetching stats for:', userId || userEmail);

        let loyaltyPoints = 0;
        let bookingsCount = 0;
        let appointmentTotal = 0;

        // Valid statuses that count as "completed" for loyalty points and total spent
        const completedStatuses = ['completed', 'confirmed', 'accepted', 'in_progress'];

        if (userId) {
            // Get loyalty points from profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('loyalty_points')
                .eq('id', userId)
                .single();

            loyaltyPoints = profile?.loyalty_points || 0;

            // Get total bookings by user_id
            const { count } = await supabase
                .from('appointments')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            bookingsCount = count || 0;

            // Get appointments with status to calculate total spent (only completed ones)
            const { data: appointmentSpend } = await supabase
                .from('appointments')
                .select('total_amount, status')
                .eq('user_id', userId);

            // Only count completed/confirmed/accepted/in_progress appointments for total spent
            const completedAppointments = appointmentSpend?.filter(a =>
                completedStatuses.includes(a.status)
            ) || [];
            appointmentTotal = completedAppointments.reduce((sum, a) => sum + Number(a.total_amount || 0), 0);

            // If no profile loyalty points, calculate from completed appointments
            if (!loyaltyPoints && completedAppointments.length > 0) {
                loyaltyPoints = Math.floor(appointmentTotal);
            }
        } else if (userEmail) {
            // Email-based lookup - check for profile by email first
            const { data: profileByEmail } = await supabase
                .from('profiles')
                .select('loyalty_points')
                .ilike('email', userEmail)
                .single();

            // Get total bookings by email (case-insensitive)
            const { count } = await supabase
                .from('appointments')
                .select('*', { count: 'exact', head: true })
                .ilike('email', userEmail);

            bookingsCount = count || 0;

            // Get appointments with status
            const { data: appointmentSpend } = await supabase
                .from('appointments')
                .select('total_amount, status')
                .ilike('email', userEmail);

            // Only count completed/confirmed/accepted/in_progress appointments for total spent
            const completedAppointments = appointmentSpend?.filter(a =>
                completedStatuses.includes(a.status)
            ) || [];
            appointmentTotal = completedAppointments.reduce((sum, a) => sum + Number(a.total_amount || 0), 0);

            // Calculate loyalty points: 1 point per $1 spent on completed appointments
            // Use profile points if exists, otherwise calculate from completed appointments
            if (profileByEmail?.loyalty_points) {
                loyaltyPoints = profileByEmail.loyalty_points;
            } else {
                loyaltyPoints = Math.floor(appointmentTotal);
            }

            console.log('Dashboard: Completed appointments:', completedAppointments.length, 'Total:', appointmentTotal, 'Points:', loyaltyPoints);
        }

        // Get total orders (always by user_id for now)
        const { data: orders } = userId ? await supabase
            .from('orders')
            .select('total_amount, status')
            .eq('user_id', userId) : { data: [] };

        const completedOrders = orders?.filter(o => o.status === 'completed' || o.status === 'delivered') || [];
        const orderTotal = completedOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
        const totalOrders = completedOrders.length;

        const stats = {
            loyaltyPoints,
            totalOrders,
            totalBookings: bookingsCount,
            totalSpent: orderTotal + appointmentTotal
        };

        console.log('Dashboard: Stats retrieved:', stats);

        return stats;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
            loyaltyPoints: 0,
            totalOrders: 0,
            totalBookings: 0,
            totalSpent: 0
        };
    }
}

/**
 * Get user appointments/bookings
 * @param limit - Optional limit on number of results
 * @param userIdOrEmail - User ID or email prefixed with "email:" for email-based lookup
 */
export async function getUserAppointments(limit?: number, userIdOrEmail?: string): Promise<UserAppointment[]> {
    try {
        let userId = userIdOrEmail;
        let userEmail: string | null = null;

        // Check if this is an email-based lookup
        if (userId?.startsWith('email:')) {
            userEmail = userId.substring(6);
            userId = null;
        }

        if (!userId && !userEmail) {
            const { data: { user } } = await supabase.auth.getUser();
            userId = user?.id;
        }

        if (!userId && !userEmail) return [];

        // Build query based on lookup type
        let query = supabase
            .from('appointments')
            .select(`
        id,
        appointment_date,
        appointment_time,
        status,
        total_amount,
        notes,
        service:services(name, duration_minutes),
        staff:staff(name)
      `)
            .order('appointment_date', { ascending: false });

        // Filter by user_id or email
        if (userId) {
            query = query.eq('user_id', userId);
        } else if (userEmail) {
            query = query.eq('email', userEmail);
        }

        if (limit) {
            query = query.limit(limit);
        }

        const { data: appointments, error } = await query;

        if (error) {
            console.log('Dashboard: Appointments query error:', error.message);
        }

        console.log('Dashboard: Found', appointments?.length || 0, 'appointments');

        return (appointments || []).map(apt => ({
            id: apt.id,
            date: apt.appointment_date,
            time: apt.appointment_time,
            service: apt.service?.name || 'Unknown Service',
            staff: apt.staff?.name || 'Unknown Staff',
            duration: apt.service?.duration_minutes || 0,
            price: Number(apt.total_amount || 0),
            status: apt.status || 'pending',
            location: 'Zavira Salon'
        }));
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return [];
    }
}

/**
 * Get user orders (product purchases)
 * @param limit - Optional limit on number of results
 * @param clerkUserId - Optional Clerk user ID to use instead of Supabase auth
 */
export async function getUserOrders(limit?: number, clerkUserId?: string): Promise<UserOrder[]> {
    try {
        let userId = clerkUserId;

        if (!userId) {
            const { data: { user } } = await supabase.auth.getUser();
            userId = user?.id;
        }

        if (!userId) return [];

        // Build query
        let query = supabase
            .from('orders')
            .select(`
        id,
        total_amount,
        status,
        created_at,
        order_items(
          product:products(name)
        )
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (limit) {
            query = query.limit(limit);
        }

        const { data: orders } = await query;

        return (orders || []).map(order => {
            const items = order.order_items?.map((item: any) => item.product?.name).filter(Boolean) || [];

            return {
                id: `ORD-${order.id.substring(0, 8).toUpperCase()}`,
                date: order.created_at,
                amount: Number(order.total_amount),
                status: order.status || 'processing',
                items,
                tracking: order.status === 'shipped' ? `TRK${order.id.substring(0, 12).toUpperCase()}` : undefined
            };
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
}

/**
 * Get loyalty points history
 * @param limit - Optional limit on number of results
 * @param clerkUserId - Optional Clerk user ID to use instead of Supabase auth
 */
export async function getUserLoyaltyHistory(limit: number = 10, clerkUserId?: string): Promise<LoyaltyTransaction[]> {
    try {
        let userId = clerkUserId;

        if (!userId) {
            const { data: { user } } = await supabase.auth.getUser();
            userId = user?.id;
        }

        if (!userId) return [];

        const { data: transactions } = await supabase
            .from('loyalty_transactions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        return (transactions || []).map(tx => ({
            id: tx.id,
            date: tx.created_at || new Date().toISOString(),
            type: tx.transaction_type === 'earned' ? 'earned' : 'redeemed',
            points: Math.abs(tx.points_change),
            description: tx.description || 'Loyalty points transaction',
            transactionId: `LT-${tx.id.substring(0, 8).toUpperCase()}`
        }));
    } catch (error) {
        console.error('Error fetching loyalty history:', error);
        return [];
    }
}

/**
 * Get loyalty progress information
 * @param clerkUserId - Optional Clerk user ID to use instead of Supabase auth
 */
export async function getLoyaltyProgress(clerkUserId?: string) {
    const stats = await getUserDashboardStats(clerkUserId);
    const currentPoints = stats.loyaltyPoints;

    // Define tier thresholds
    const tiers = [
        { name: 'Bronze', threshold: 0 },
        { name: 'Silver', threshold: 1000 },
        { name: 'Gold', threshold: 3000 },
        { name: 'Platinum', threshold: 5000 }
    ];

    // Find current and next tier
    let currentTier = tiers[0];
    let nextTier = tiers[1];

    for (let i = 0; i < tiers.length; i++) {
        if (currentPoints >= tiers[i].threshold) {
            currentTier = tiers[i];
            nextTier = tiers[i + 1] || tiers[i]; // Stay at max tier if reached
        }
    }

    const pointsToNextTier = nextTier.threshold - currentPoints;
    const progress = nextTier.threshold > 0
        ? Math.min(100, (currentPoints / nextTier.threshold) * 100)
        : 100;

    return {
        current: currentPoints,
        available: currentPoints, // All points are available for now
        pending: 0, // No pending points system yet
        lifetime: currentPoints, // Same as current for now
        nextTier: nextTier.threshold,
        nextTierName: nextTier.name,
        currentTierName: currentTier.name,
        progress: Math.round(progress),
        pointsToNextTier: Math.max(0, pointsToNextTier)
    };
}
