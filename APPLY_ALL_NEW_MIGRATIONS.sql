-- ========================================
-- CONSOLIDATED NEW MIGRATIONS FOR ZAVIRA
-- Apply this in Supabase SQL Editor Dashboard
-- ========================================
-- Generated: December 26, 2025
-- Total migrations: 11
-- ========================================

-- MIGRATION 1: Appointment Tokens (Self-Service Cancellation/Rescheduling)
CREATE TABLE IF NOT EXISTS appointment_management_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  action_type TEXT CHECK (action_type IN ('cancel', 'reschedule', 'view')),
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tokens_appointment ON appointment_management_tokens(appointment_id);
CREATE INDEX IF NOT EXISTS idx_tokens_token ON appointment_management_tokens(token);
CREATE INDEX IF NOT EXISTS idx_tokens_expires ON appointment_management_tokens(expires_at);

CREATE OR REPLACE FUNCTION generate_appointment_token(
  p_appointment_id UUID,
  p_action_type TEXT,
  p_validity_hours INTEGER DEFAULT 72
)
RETURNS TEXT AS $$
DECLARE
  v_token TEXT;
BEGIN
  v_token := encode(gen_random_bytes(32), 'base64');
  v_token := replace(replace(replace(v_token, '/', '_'), '+', '-'), '=', '');

  INSERT INTO appointment_management_tokens (appointment_id, token, action_type, expires_at)
  VALUES (p_appointment_id, v_token, p_action_type, NOW() + (p_validity_hours || ' hours')::INTERVAL);

  RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION verify_appointment_token(p_token TEXT, p_action_type TEXT)
RETURNS TABLE (appointment_id UUID, is_valid BOOLEAN, error_message TEXT) AS $$
DECLARE
  v_token_record RECORD;
  v_appointment_record RECORD;
BEGIN
  SELECT * INTO v_token_record FROM appointment_management_tokens WHERE token = p_token AND action_type = p_action_type;

  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, FALSE, 'Invalid token';
    RETURN;
  END IF;

  IF v_token_record.used_at IS NOT NULL THEN
    RETURN QUERY SELECT NULL::UUID, FALSE, 'Token already used';
    RETURN;
  END IF;

  IF v_token_record.expires_at < NOW() THEN
    RETURN QUERY SELECT NULL::UUID, FALSE, 'Token has expired';
    RETURN;
  END IF;

  SELECT * INTO v_appointment_record FROM appointments WHERE id = v_token_record.appointment_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, FALSE, 'Appointment not found';
    RETURN;
  END IF;

  RETURN QUERY SELECT v_token_record.appointment_id, TRUE, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION mark_token_used(p_token TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE appointment_management_tokens SET used_at = NOW() WHERE token = p_token;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE appointment_management_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tokens are viewable by anyone with the token"
  ON appointment_management_tokens FOR SELECT USING (true);

CREATE POLICY "Only system can create tokens"
  ON appointment_management_tokens FOR INSERT WITH CHECK (false);

CREATE POLICY "Only system can update tokens"
  ON appointment_management_tokens FOR UPDATE USING (false);

-- MIGRATION 2: Late Arrival Tracking
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS late_arrival_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS arrived_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS no_show_reason TEXT,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS rescheduled_from_id UUID REFERENCES appointments(id),
ADD COLUMN IF NOT EXISTS rescheduled_to_id UUID REFERENCES appointments(id);

CREATE INDEX IF NOT EXISTS idx_appointments_late_arrivals ON appointments(late_arrival_minutes) WHERE late_arrival_minutes > 0;
CREATE INDEX IF NOT EXISTS idx_appointments_cancellations ON appointments(cancelled_at) WHERE cancelled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_rescheduled_from ON appointments(rescheduled_from_id);
CREATE INDEX IF NOT EXISTS idx_appointments_rescheduled_to ON appointments(rescheduled_to_id);

ALTER TABLE appointments DROP CONSTRAINT IF EXISTS check_late_arrival_valid;
ALTER TABLE appointments ADD CONSTRAINT check_late_arrival_valid CHECK ((status NOT IN ('NO_SHOW', 'CANCELLED') OR late_arrival_minutes = 0));

CREATE OR REPLACE FUNCTION mark_appointment_arrived(p_appointment_id UUID, p_minutes_late INTEGER DEFAULT 0)
RETURNS JSON AS $$
DECLARE
  v_appointment RECORD;
  v_new_status TEXT;
BEGIN
  SELECT * INTO v_appointment FROM appointments WHERE id = p_appointment_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Appointment not found');
  END IF;

  v_new_status := CASE WHEN p_minutes_late > 15 THEN 'IN_PROGRESS' ELSE 'READY_TO_START' END;

  UPDATE appointments SET arrived_at = NOW(), late_arrival_minutes = p_minutes_late, status = v_new_status, updated_at = NOW()
  WHERE id = p_appointment_id;

  RETURN json_build_object('success', true, 'appointment_id', p_appointment_id, 'arrived_at', NOW(), 'minutes_late', p_minutes_late, 'new_status', v_new_status);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION cancel_appointment(p_appointment_id UUID, p_cancellation_reason TEXT DEFAULT NULL, p_cancelled_by TEXT DEFAULT 'customer')
RETURNS JSON AS $$
DECLARE
  v_appointment RECORD;
BEGIN
  SELECT * INTO v_appointment FROM appointments WHERE id = p_appointment_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Appointment not found');
  END IF;

  IF v_appointment.status = 'CANCELLED' THEN
    RETURN json_build_object('success', false, 'error', 'Appointment is already cancelled');
  END IF;

  IF v_appointment.status IN ('COMPLETE', 'NO_SHOW') THEN
    RETURN json_build_object('success', false, 'error', 'Cannot cancel completed or no-show appointments');
  END IF;

  UPDATE appointments SET status = 'CANCELLED', cancelled_at = NOW(), cancellation_reason = p_cancellation_reason, updated_at = NOW()
  WHERE id = p_appointment_id;

  RETURN json_build_object('success', true, 'appointment_id', p_appointment_id, 'cancelled_at', NOW(), 'cancelled_by', p_cancelled_by);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION reschedule_appointment(p_original_appointment_id UUID, p_new_date DATE, p_new_time TIME, p_new_staff_id UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  v_original RECORD;
  v_new_appointment_id UUID;
  v_staff_id UUID;
BEGIN
  SELECT * INTO v_original FROM appointments WHERE id = p_original_appointment_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Original appointment not found');
  END IF;

  IF v_original.status IN ('CANCELLED', 'COMPLETE', 'NO_SHOW') THEN
    RETURN json_build_object('success', false, 'error', 'Cannot reschedule cancelled, completed, or no-show appointments');
  END IF;

  v_staff_id := COALESCE(p_new_staff_id, v_original.staff_id);

  INSERT INTO appointments (appointment_date, appointment_time, service_id, staff_id, user_id, full_name, email, phone, notes, total_amount, deposit_amount, payment_status, status, rescheduled_from_id)
  VALUES (p_new_date, p_new_time, v_original.service_id, v_staff_id, v_original.user_id, v_original.full_name, v_original.email, v_original.phone, 'Rescheduled from ' || v_original.appointment_date || ' ' || v_original.appointment_time || COALESCE('. ' || v_original.notes, ''), v_original.total_amount, v_original.deposit_amount, v_original.payment_status, 'REQUESTED', p_original_appointment_id)
  RETURNING id INTO v_new_appointment_id;

  UPDATE appointments SET status = 'CANCELLED', cancelled_at = NOW(), cancellation_reason = 'Rescheduled to ' || p_new_date || ' ' || p_new_time, rescheduled_to_id = v_new_appointment_id, updated_at = NOW()
  WHERE id = p_original_appointment_id;

  RETURN json_build_object('success', true, 'original_appointment_id', p_original_appointment_id, 'new_appointment_id', v_new_appointment_id, 'new_date', p_new_date, 'new_time', p_new_time);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- MIGRATION 3: Membership System (Hormozi-style)
CREATE TABLE IF NOT EXISTS membership_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  monthly_price DECIMAL(10,2) NOT NULL,
  annual_price DECIMAL(10,2),
  credits_per_month INTEGER NOT NULL,
  credit_value DECIMAL(10,2) NOT NULL,
  rollover_credits BOOLEAN DEFAULT false,
  priority_booking BOOLEAN DEFAULT false,
  discount_percentage INTEGER DEFAULT 0,
  max_guests INTEGER DEFAULT 0,
  free_upgrades_per_month INTEGER DEFAULT 0,
  house_calls_per_year INTEGER DEFAULT 0,
  description TEXT,
  features JSONB,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  badge TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_id UUID REFERENCES membership_tiers(id),
  status TEXT CHECK (status IN ('active', 'paused', 'cancelled', 'expired')) DEFAULT 'active',
  credits_balance INTEGER DEFAULT 0,
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'annual')) DEFAULT 'monthly',
  next_billing_date DATE,
  started_at TIMESTAMP DEFAULT NOW(),
  paused_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  cancellation_reason TEXT,
  last_billing_date DATE,
  total_paid DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS membership_credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id UUID REFERENCES user_memberships(id) ON DELETE CASCADE,
  credits_change INTEGER NOT NULL,
  transaction_type TEXT CHECK (transaction_type IN ('monthly_credit', 'bonus', 'used', 'expired', 'refund', 'adjustment')),
  description TEXT,
  reference_id UUID,
  reference_type TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS membership_perk_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id UUID REFERENCES user_memberships(id) ON DELETE CASCADE,
  perk_type TEXT CHECK (perk_type IN ('free_upgrade', 'guest_booking', 'house_call', 'priority_booking')),
  used_at TIMESTAMP DEFAULT NOW(),
  appointment_id UUID REFERENCES appointments(id),
  description TEXT
);

CREATE INDEX IF NOT EXISTS idx_memberships_user ON user_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_status ON user_memberships(status);
CREATE INDEX IF NOT EXISTS idx_memberships_tier ON user_memberships(tier_id);
CREATE INDEX IF NOT EXISTS idx_membership_credits_membership ON membership_credit_transactions(membership_id);
CREATE INDEX IF NOT EXISTS idx_membership_perks_membership ON membership_perk_usage(membership_id);

INSERT INTO membership_tiers (name, slug, monthly_price, annual_price, credits_per_month, credit_value, rollover_credits, priority_booking, discount_percentage, max_guests, free_upgrades_per_month, house_calls_per_year, description, features, display_order, badge)
VALUES
('Beauty Basic', 'beauty-basic', 79.00, 790.00, 100, 120.00, false, false, 10, 0, 0, 0, 'Perfect for regular beauty maintenance', '["$100 in Monthly Credits", "10% Discount on All Services", "Mobile App Access", "Birthday Month Bonus ($25)", "Exclusive Member Offers"]'::jsonb, 1, NULL),
('Glow Getter', 'glow-getter', 149.00, 1490.00, 250, 350.00, true, true, 20, 1, 1, 0, 'For the beauty enthusiast who deserves VIP treatment', '["$250 in Monthly Credits", "20% Discount on All Services", "Credits Roll Over (Never Lose Value!)", "Priority Booking (Skip the Line)", "Bring 1 Guest at Member Prices", "Birthday Month Double Credits", "VIP-Only Flash Sales", "1 Free Upgrade per Month"]'::jsonb, 2, 'MOST POPULAR'),
('VIP Luxe', 'vip-luxe', 299.00, 2990.00, 600, 900.00, true, true, 30, 3, 2, 1, 'Ultimate luxury experience with maximum savings', '["$600 in Monthly Credits", "30% Discount on All Services", "Credits Roll Over Forever", "Unlimited Priority Booking", "Bring 3 Guests at Member Prices", "Birthday Month TRIPLE Credits", "First Access to New Services", "2 Free Upgrades per Month", "1 Free House Call Service/Year", "Dedicated VIP Concierge", "Exclusive Member Events"]'::jsonb, 3, 'BEST VALUE')
ON CONFLICT DO NOTHING;

ALTER TABLE membership_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_perk_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Membership tiers are viewable by everyone" ON membership_tiers;
CREATE POLICY "Membership tiers are viewable by everyone" ON membership_tiers FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Users can view their own memberships" ON user_memberships;
CREATE POLICY "Users can view their own memberships" ON user_memberships FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own memberships" ON user_memberships;
CREATE POLICY "Users can insert their own memberships" ON user_memberships FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own memberships" ON user_memberships;
CREATE POLICY "Users can update their own memberships" ON user_memberships FOR UPDATE USING (auth.uid() = user_id);

-- MIGRATION 4: Glen Knowledge Base (RAG)
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS glen_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS glen_knowledge_embedding_idx ON glen_knowledge_base USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS glen_knowledge_content_idx ON glen_knowledge_base USING GIN (to_tsvector('english', content));

-- MIGRATION 5: Service Tiers (Pricing)
CREATE TABLE IF NOT EXISTS public.pricing_tiers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tier_name TEXT NOT NULL UNIQUE CHECK (tier_name IN ('Basic', 'Premium', 'Luxury')),
    tier_level INTEGER NOT NULL UNIQUE CHECK (tier_level BETWEEN 1 AND 3),
    min_price DECIMAL(10,2) NOT NULL,
    max_price DECIMAL(10,2) NOT NULL,
    tagline TEXT,
    description TEXT,
    features TEXT[] NOT NULL DEFAULT '{}',
    typical_services TEXT[] NOT NULL DEFAULT '{}',
    upgrade_benefits TEXT[] NOT NULL DEFAULT '{}',
    is_most_popular BOOLEAN DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pricing_tiers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Pricing tiers are viewable by everyone" ON public.pricing_tiers;
CREATE POLICY "Pricing tiers are viewable by everyone" ON public.pricing_tiers FOR SELECT USING (true);

-- MIGRATION 6: Service Upsells
CREATE TABLE IF NOT EXISTS service_upsells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  upsell_service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  upsell_type TEXT NOT NULL DEFAULT 'addon' CHECK (upsell_type IN ('bundle', 'addon', 'upgrade', 'complementary')),
  discount_percentage INTEGER DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  pitch_text TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  times_shown INTEGER DEFAULT 0,
  times_accepted INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT no_self_upsell CHECK (parent_service_id != upsell_service_id)
);

CREATE INDEX IF NOT EXISTS idx_service_upsells_parent ON service_upsells(parent_service_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_service_upsells_display_order ON service_upsells(parent_service_id, display_order);

ALTER TABLE service_upsells ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read for active upsells" ON service_upsells;
CREATE POLICY "Allow public read for active upsells" ON service_upsells FOR SELECT TO public USING (is_active = true);

DROP POLICY IF EXISTS "Allow authenticated users to update stats" ON service_upsells;
CREATE POLICY "Allow authenticated users to update stats" ON service_upsells FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- MIGRATION 7: Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_photo_url TEXT,
  service_category TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  testimonial_text TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(is_featured, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testimonials_verified ON testimonials(is_verified, created_at DESC);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view testimonials" ON testimonials;
CREATE POLICY "Anyone can view testimonials" ON testimonials FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert testimonials" ON testimonials;
CREATE POLICY "Authenticated users can insert testimonials" ON testimonials FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update testimonials" ON testimonials;
CREATE POLICY "Authenticated users can update testimonials" ON testimonials FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete testimonials" ON testimonials;
CREATE POLICY "Authenticated users can delete testimonials" ON testimonials FOR DELETE TO authenticated USING (true);

-- MIGRATION 8: Email Logs
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID,
  customer_email TEXT NOT NULL,
  email_type TEXT NOT NULL,
  subject TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  bounce_reason TEXT,
  campaign_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_customer_id ON email_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_customer_email ON email_logs(customer_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_campaign_id ON email_logs(campaign_id);

CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  total_recipients INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_bounced INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID,
  email TEXT UNIQUE NOT NULL,
  subscribed_to_marketing BOOLEAN DEFAULT true,
  subscribed_to_reminders BOOLEAN DEFAULT true,
  subscribed_to_newsletters BOOLEAN DEFAULT true,
  unsubscribed_at TIMESTAMPTZ,
  unsubscribe_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_preferences_email ON email_preferences(email);
CREATE INDEX IF NOT EXISTS idx_email_preferences_customer_id ON email_preferences(customer_id);

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own email logs" ON email_logs;
CREATE POLICY "Users can view their own email logs" ON email_logs FOR SELECT USING (customer_id = auth.uid() OR customer_email = auth.jwt() ->> 'email');

DROP POLICY IF EXISTS "Users can view their own email preferences" ON email_preferences;
CREATE POLICY "Users can view their own email preferences" ON email_preferences FOR SELECT USING (customer_id = auth.uid() OR email = auth.jwt() ->> 'email');

DROP POLICY IF EXISTS "Users can update their own email preferences" ON email_preferences;
CREATE POLICY "Users can update their own email preferences" ON email_preferences FOR UPDATE USING (customer_id = auth.uid() OR email = auth.jwt() ->> 'email');

-- MIGRATION 9: Lead Magnets
CREATE TABLE IF NOT EXISTS lead_magnets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  magnet_type TEXT NOT NULL CHECK (magnet_type IN ('ebook', 'checklist', 'video', 'template')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  preview_image TEXT,
  file_url TEXT,
  benefits JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_magnets_slug ON lead_magnets(slug);
CREATE INDEX IF NOT EXISTS idx_lead_magnets_active ON lead_magnets(is_active);

CREATE TABLE IF NOT EXISTS lead_magnet_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_magnet_id UUID NOT NULL REFERENCES lead_magnets(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  downloaded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lead_magnet_id, customer_email)
);

CREATE INDEX IF NOT EXISTS idx_lead_magnet_downloads_email ON lead_magnet_downloads(customer_email);
CREATE INDEX IF NOT EXISTS idx_lead_magnet_downloads_magnet ON lead_magnet_downloads(lead_magnet_id);

ALTER TABLE lead_magnets ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_magnet_downloads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lead magnets are viewable by everyone" ON lead_magnets;
CREATE POLICY "Lead magnets are viewable by everyone" ON lead_magnets FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can record a download" ON lead_magnet_downloads;
CREATE POLICY "Anyone can record a download" ON lead_magnet_downloads FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own downloads" ON lead_magnet_downloads;
CREATE POLICY "Users can view their own downloads" ON lead_magnet_downloads FOR SELECT USING (customer_email = auth.jwt() ->> 'email');

-- MIGRATION 10: Referral Program
CREATE TABLE IF NOT EXISTS referral_program (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_customer_id UUID,
  referrer_email TEXT NOT NULL,
  referrer_name TEXT,
  referral_code TEXT UNIQUE NOT NULL,
  referee_email TEXT,
  referee_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded', 'cancelled')),
  referrer_reward_amount DECIMAL(10,2) DEFAULT 20.00,
  referee_reward_amount DECIMAL(10,2) DEFAULT 20.00,
  referred_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  rewarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_code ON referral_program(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_referrer ON referral_program(referrer_email);
CREATE INDEX IF NOT EXISTS idx_referral_referee ON referral_program(referee_email);

ALTER TABLE referral_program ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own referrals" ON referral_program;
CREATE POLICY "Users can view their own referrals" ON referral_program FOR SELECT USING (referrer_email = auth.jwt() ->> 'email' OR referee_email = auth.jwt() ->> 'email');

DROP POLICY IF EXISTS "Users can create referrals" ON referral_program;
CREATE POLICY "Users can create referrals" ON referral_program FOR INSERT WITH CHECK (referrer_email = auth.jwt() ->> 'email');

-- MIGRATION 11: Exit Intent Tracking
CREATE TABLE IF NOT EXISTS exit_intent_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  page_url TEXT NOT NULL,
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  popup_shown BOOLEAN DEFAULT false,
  email_captured TEXT,
  converted BOOLEAN DEFAULT false,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_exit_intent_session ON exit_intent_events(session_id);
CREATE INDEX IF NOT EXISTS idx_exit_intent_triggered ON exit_intent_events(triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_exit_intent_converted ON exit_intent_events(converted);

ALTER TABLE exit_intent_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can log exit intent events" ON exit_intent_events;
CREATE POLICY "Anyone can log exit intent events" ON exit_intent_events FOR INSERT WITH CHECK (true);

-- ========================================
-- ALL MIGRATIONS APPLIED SUCCESSFULLY!
-- ========================================
