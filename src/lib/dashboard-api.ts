import { supabase } from '@/integrations/supabase/client';

/**
 * Redeem loyalty points for a reward
 */
export async function redeemLoyaltyPoints(
  userId: string,
  points: number,
  rewardType: string
) {
  const { data, error } = await supabase.rpc('redeem_loyalty_points', {
    p_user_id: userId,
    p_points: points,
    p_reward_type: rewardType,
  });

  if (error) {
    console.error('Error redeeming loyalty points:', error);
    throw error;
  }

  return data;
}

/**
 * Cancel an appointment
 */
export async function cancelAppointment(
  appointmentId: string,
  userId: string,
  reason?: string
) {
  const { data, error } = await supabase.rpc('cancel_appointment', {
    p_appointment_id: appointmentId,
    p_user_id: userId,
    p_reason: reason || null,
  });

  if (error) {
    console.error('Error cancelling appointment:', error);
    throw error;
  }

  return data;
}

/**
 * Reschedule an appointment
 */
export async function rescheduleAppointment(
  appointmentId: string,
  userId: string,
  newDate: string,
  newTime: string
) {
  const { data, error } = await supabase.rpc('reschedule_appointment', {
    p_appointment_id: appointmentId,
    p_user_id: userId,
    p_new_date: newDate,
    p_new_time: newTime,
  });

  if (error) {
    console.error('Error rescheduling appointment:', error);
    throw error;
  }

  return data;
}

/**
 * Rate a service after appointment
 */
export async function rateService(
  appointmentId: string,
  userId: string,
  rating: number,
  review?: string
) {
  const { data, error } = await supabase.rpc('rate_service', {
    p_appointment_id: appointmentId,
    p_user_id: userId,
    p_rating: rating,
    p_review: review || null,
  });

  if (error) {
    console.error('Error rating service:', error);
    throw error;
  }

  return data;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  profileData: {
    fullName?: string;
    phone?: string;
    avatarUrl?: string;
  }
) {
  const { data, error } = await supabase.rpc('update_user_profile', {
    p_user_id: userId,
    p_full_name: profileData.fullName || null,
    p_phone: profileData.phone || null,
    p_avatar_url: profileData.avatarUrl || null,
  });

  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }

  return data;
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: {
    appointmentReminders?: boolean;
    orderUpdates?: boolean;
    promotionalOffers?: boolean;
    loyaltyRewards?: boolean;
  }
) {
  const { data, error } = await supabase.rpc('update_notification_preferences', {
    p_user_id: userId,
    p_appointment_reminders: preferences.appointmentReminders ?? null,
    p_order_updates: preferences.orderUpdates ?? null,
    p_promotional_offers: preferences.promotionalOffers ?? null,
    p_loyalty_rewards: preferences.loyaltyRewards ?? null,
  });

  if (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }

  return data;
}

/**
 * Get user notification preferences
 */
export async function getUserPreferences(userId: string) {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user preferences:', error);
    throw error;
  }

  return data;
}

/**
 * Get user notifications
 */
export async function getUserNotifications(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }

  return data || [];
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Get tracking URL for an order (placeholder - integrate with your shipping provider)
 */
export function getTrackingUrl(orderId: string, trackingNumber?: string): string {
  if (!trackingNumber) {
    return '#';
  }
  
  // Example: USPS tracking URL
  // You can customize this based on your shipping provider
  return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
}
