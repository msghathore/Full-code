-- Customer Dashboard Backend Functions
-- Migration: Add tables and functions for customer dashboard features

-- Create user_preferences table for notification settings
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    appointment_reminders BOOLEAN DEFAULT true,
    order_updates BOOLEAN DEFAULT true,
    promotional_offers BOOLEAN DEFAULT false,
    loyalty_rewards BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service_ratings table for customer reviews
CREATE TABLE IF NOT EXISTS public.service_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(appointment_id, user_id)
);

-- Create notifications table for user notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('appointment', 'order', 'loyalty', 'promotion', 'system')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_preferences
CREATE POLICY "Users can view their own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for service_ratings
CREATE POLICY "Users can view their own ratings" ON service_ratings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ratings" ON service_ratings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" ON service_ratings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all ratings" ON service_ratings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM staff
            WHERE staff.id = auth.uid()
        )
    );

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_service_ratings_user_id ON service_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_service_ratings_appointment_id ON service_ratings(appointment_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Function to redeem loyalty points
CREATE OR REPLACE FUNCTION public.redeem_loyalty_points(
    p_user_id UUID,
    p_points INTEGER,
    p_reward_type TEXT
)
RETURNS JSON AS $$
DECLARE
    v_current_points INTEGER;
    v_new_points INTEGER;
    v_transaction_id UUID;
BEGIN
    -- Get current points
    SELECT loyalty_points INTO v_current_points
    FROM profiles
    WHERE id = p_user_id;

    -- Check if user has enough points
    IF v_current_points < p_points THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Insufficient points',
            'current_points', v_current_points,
            'required_points', p_points
        );
    END IF;

    -- Calculate new points
    v_new_points := v_current_points - p_points;

    -- Update user's loyalty points
    UPDATE profiles
    SET loyalty_points = v_new_points,
        updated_at = NOW()
    WHERE id = p_user_id;

    -- Create loyalty transaction record
    INSERT INTO loyalty_transactions (user_id, points_change, transaction_type, description, reference_type)
    VALUES (p_user_id, -p_points, 'redeemed', 'Redeemed: ' || p_reward_type, 'reward')
    RETURNING id INTO v_transaction_id;

    -- Create notification
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (
        p_user_id,
        'Points Redeemed',
        'You redeemed ' || p_points || ' points for ' || p_reward_type,
        'loyalty'
    );

    RETURN json_build_object(
        'success', true,
        'transaction_id', v_transaction_id,
        'previous_points', v_current_points,
        'new_points', v_new_points,
        'points_redeemed', p_points
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cancel appointment
CREATE OR REPLACE FUNCTION public.cancel_appointment(
    p_appointment_id UUID,
    p_user_id UUID,
    p_reason TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_appointment RECORD;
BEGIN
    -- Get appointment details
    SELECT * INTO v_appointment
    FROM appointments
    WHERE id = p_appointment_id AND user_id = p_user_id;

    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Appointment not found or unauthorized'
        );
    END IF;

    -- Check if appointment can be cancelled
    IF v_appointment.status IN ('completed', 'cancelled') THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Cannot cancel a ' || v_appointment.status || ' appointment'
        );
    END IF;

    -- Update appointment status
    UPDATE appointments
    SET status = 'cancelled',
        status_type = 'REQUESTED',
        notes = COALESCE(notes || E'\n', '') || 'Cancelled by customer' || 
                CASE WHEN p_reason IS NOT NULL THEN ': ' || p_reason ELSE '' END,
        updated_at = NOW()
    WHERE id = p_appointment_id;

    -- Create notification
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (
        p_user_id,
        'Appointment Cancelled',
        'Your appointment on ' || v_appointment.appointment_date || ' has been cancelled',
        'appointment'
    );

    RETURN json_build_object(
        'success', true,
        'appointment_id', p_appointment_id,
        'message', 'Appointment cancelled successfully'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reschedule appointment
CREATE OR REPLACE FUNCTION public.reschedule_appointment(
    p_appointment_id UUID,
    p_user_id UUID,
    p_new_date DATE,
    p_new_time TIME
)
RETURNS JSON AS $$
DECLARE
    v_appointment RECORD;
BEGIN
    -- Get appointment details
    SELECT * INTO v_appointment
    FROM appointments
    WHERE id = p_appointment_id AND user_id = p_user_id;

    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Appointment not found or unauthorized'
        );
    END IF;

    -- Check if appointment can be rescheduled
    IF v_appointment.status IN ('completed', 'cancelled') THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Cannot reschedule a ' || v_appointment.status || ' appointment'
        );
    END IF;

    -- Update appointment
    UPDATE appointments
    SET appointment_date = p_new_date,
        appointment_time = p_new_time,
        status = 'confirmed',
        status_type = 'CONFIRMED',
        notes = COALESCE(notes || E'\n', '') || 
                'Rescheduled from ' || v_appointment.appointment_date || ' ' || v_appointment.appointment_time,
        updated_at = NOW()
    WHERE id = p_appointment_id;

    -- Create notification
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (
        p_user_id,
        'Appointment Rescheduled',
        'Your appointment has been rescheduled to ' || p_new_date || ' at ' || p_new_time,
        'appointment'
    );

    RETURN json_build_object(
        'success', true,
        'appointment_id', p_appointment_id,
        'new_date', p_new_date,
        'new_time', p_new_time,
        'message', 'Appointment rescheduled successfully'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to rate service
CREATE OR REPLACE FUNCTION public.rate_service(
    p_appointment_id UUID,
    p_user_id UUID,
    p_rating INTEGER,
    p_review TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_appointment RECORD;
    v_rating_id UUID;
BEGIN
    -- Validate rating
    IF p_rating < 1 OR p_rating > 5 THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Rating must be between 1 and 5'
        );
    END IF;

    -- Get appointment details
    SELECT * INTO v_appointment
    FROM appointments
    WHERE id = p_appointment_id AND user_id = p_user_id;

    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Appointment not found or unauthorized'
        );
    END IF;

    -- Insert or update rating
    INSERT INTO service_ratings (appointment_id, user_id, rating, review)
    VALUES (p_appointment_id, p_user_id, p_rating, p_review)
    ON CONFLICT (appointment_id, user_id)
    DO UPDATE SET
        rating = p_rating,
        review = p_review,
        updated_at = NOW()
    RETURNING id INTO v_rating_id;

    -- Award loyalty points for rating (e.g., 10 points)
    UPDATE profiles
    SET loyalty_points = loyalty_points + 10,
        updated_at = NOW()
    WHERE id = p_user_id;

    -- Create loyalty transaction
    INSERT INTO loyalty_transactions (user_id, points_change, transaction_type, description, reference_id, reference_type)
    VALUES (p_user_id, 10, 'earned', 'Service rating bonus', v_rating_id::TEXT, 'rating');

    -- Create notification
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (
        p_user_id,
        'Thank You for Your Rating!',
        'You earned 10 loyalty points for rating your service',
        'loyalty'
    );

    RETURN json_build_object(
        'success', true,
        'rating_id', v_rating_id,
        'points_earned', 10,
        'message', 'Rating submitted successfully'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user profile
CREATE OR REPLACE FUNCTION public.update_user_profile(
    p_user_id UUID,
    p_full_name TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL,
    p_avatar_url TEXT DEFAULT NULL
)
RETURNS JSON AS $$
BEGIN
    -- Update profile
    UPDATE profiles
    SET full_name = COALESCE(p_full_name, full_name),
        phone = COALESCE(p_phone, phone),
        avatar_url = COALESCE(p_avatar_url, avatar_url),
        updated_at = NOW()
    WHERE id = p_user_id;

    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Profile not found'
        );
    END IF;

    RETURN json_build_object(
        'success', true,
        'message', 'Profile updated successfully'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update notification preferences
CREATE OR REPLACE FUNCTION public.update_notification_preferences(
    p_user_id UUID,
    p_appointment_reminders BOOLEAN DEFAULT NULL,
    p_order_updates BOOLEAN DEFAULT NULL,
    p_promotional_offers BOOLEAN DEFAULT NULL,
    p_loyalty_rewards BOOLEAN DEFAULT NULL
)
RETURNS JSON AS $$
BEGIN
    -- Insert or update preferences
    INSERT INTO user_preferences (
        user_id,
        appointment_reminders,
        order_updates,
        promotional_offers,
        loyalty_rewards
    )
    VALUES (
        p_user_id,
        COALESCE(p_appointment_reminders, true),
        COALESCE(p_order_updates, true),
        COALESCE(p_promotional_offers, false),
        COALESCE(p_loyalty_rewards, true)
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
        appointment_reminders = COALESCE(p_appointment_reminders, user_preferences.appointment_reminders),
        order_updates = COALESCE(p_order_updates, user_preferences.order_updates),
        promotional_offers = COALESCE(p_promotional_offers, user_preferences.promotional_offers),
        loyalty_rewards = COALESCE(p_loyalty_rewards, user_preferences.loyalty_rewards),
        updated_at = NOW();

    RETURN json_build_object(
        'success', true,
        'message', 'Preferences updated successfully'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user_preferences updated_at
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_ratings_updated_at
    BEFORE UPDATE ON service_ratings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON user_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE ON service_ratings TO authenticated;
GRANT SELECT, UPDATE ON notifications TO authenticated;
GRANT EXECUTE ON FUNCTION redeem_loyalty_points(UUID, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_appointment(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION reschedule_appointment(UUID, UUID, DATE, TIME) TO authenticated;
GRANT EXECUTE ON FUNCTION rate_service(UUID, UUID, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_profile(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_notification_preferences(UUID, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN) TO authenticated;
