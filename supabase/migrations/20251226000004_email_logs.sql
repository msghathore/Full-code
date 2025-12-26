-- Migration: Email Logs and Campaign Management
-- Description: Track all email sends, opens, and clicks for automated campaigns
-- Author: Claude
-- Date: 2025-12-26

-- =============================================
-- EMAIL LOGS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Recipient information
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,

  -- Email details
  email_type TEXT NOT NULL CHECK (email_type IN (
    'welcome',
    'appointment_confirmation',
    'appointment_reminder',
    'abandoned_cart',
    'referral_invitation',
    'newsletter',
    'promotional',
    'transactional'
  )),

  -- Email metadata
  subject TEXT NOT NULL,
  template_data JSONB DEFAULT '{}',

  -- Delivery tracking
  sent_at TIMESTAMPTZ DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,

  -- Engagement metrics
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,

  -- Email provider details
  provider_message_id TEXT, -- From Resend/SendGrid
  provider_status TEXT,
  provider_error TEXT,

  -- Campaign tracking
  campaign_id TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- EMAIL CAMPAIGNS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Campaign details
  name TEXT NOT NULL,
  email_type TEXT NOT NULL,
  subject_line TEXT NOT NULL,

  -- Targeting
  target_audience JSONB DEFAULT '{}', -- Filters for recipients

  -- Scheduling
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,

  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft',
    'scheduled',
    'sending',
    'sent',
    'cancelled'
  )),

  -- Metrics
  total_recipients INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_bounced INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- EMAIL PREFERENCES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Customer reference
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,

  -- Subscription preferences
  subscribed_to_marketing BOOLEAN DEFAULT true,
  subscribed_to_reminders BOOLEAN DEFAULT true,
  subscribed_to_newsletters BOOLEAN DEFAULT true,

  -- Unsubscribe tracking
  unsubscribed_at TIMESTAMPTZ,
  unsubscribe_reason TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- INDEXES
-- =============================================

-- Email logs indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_email_logs_customer_id ON email_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_email_type ON email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_campaign_id ON email_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient_email ON email_logs(recipient_email);

-- Email campaigns indexes
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduled_at ON email_campaigns(scheduled_at);

-- Email preferences indexes
CREATE INDEX IF NOT EXISTS idx_email_preferences_customer_id ON email_preferences(customer_id);
CREATE INDEX IF NOT EXISTS idx_email_preferences_email ON email_preferences(email);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

-- Email logs policies
CREATE POLICY "Staff can view all email logs"
  ON email_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert email logs"
  ON email_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update email logs"
  ON email_logs FOR UPDATE
  USING (true);

-- Email campaigns policies
CREATE POLICY "Staff can view all campaigns"
  ON email_campaigns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can create campaigns"
  ON email_campaigns FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can update campaigns"
  ON email_campaigns FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );

-- Email preferences policies
CREATE POLICY "Users can view their own preferences"
  ON email_preferences FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own preferences"
  ON email_preferences FOR UPDATE
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view all preferences"
  ON email_preferences FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert preferences"
  ON email_preferences FOR INSERT
  WITH CHECK (true);

-- =============================================
-- TRIGGERS
-- =============================================

-- Update timestamp trigger for email_logs
CREATE OR REPLACE FUNCTION update_email_logs_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_email_logs_timestamp ON table_name;  -- Note: will be applied for the actual table
CREATE TRIGGER update_email_logs_timestamp
  BEFORE UPDATE ON email_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_email_logs_timestamp();

-- Update timestamp trigger for email_campaigns
DROP TRIGGER IF EXISTS update_email_campaigns_timestamp ON table_name;  -- Note: will be applied for the actual table
CREATE TRIGGER update_email_campaigns_timestamp
  BEFORE UPDATE ON email_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_email_logs_timestamp();

-- Update timestamp trigger for email_preferences
DROP TRIGGER IF EXISTS update_email_preferences_timestamp ON table_name;  -- Note: will be applied for the actual table
CREATE TRIGGER update_email_preferences_timestamp
  BEFORE UPDATE ON email_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_email_logs_timestamp();

-- Track open events
CREATE OR REPLACE FUNCTION track_email_open()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.opened_at IS NOT NULL AND OLD.opened_at IS NULL THEN
    NEW.open_count = OLD.open_count + 1;

    -- Update campaign metrics
    UPDATE email_campaigns
    SET total_opened = total_opened + 1
    WHERE id::text = NEW.campaign_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS track_email_open ON table_name;  -- Note: will be applied for the actual table
CREATE TRIGGER track_email_open
  BEFORE UPDATE ON email_logs
  FOR EACH ROW
  EXECUTE FUNCTION track_email_open();

-- Track click events
CREATE OR REPLACE FUNCTION track_email_click()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.clicked_at IS NOT NULL AND OLD.clicked_at IS NULL THEN
    NEW.click_count = OLD.click_count + 1;

    -- Update campaign metrics
    UPDATE email_campaigns
    SET total_clicked = total_clicked + 1
    WHERE id::text = NEW.campaign_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS track_email_click ON table_name;  -- Note: will be applied for the actual table
CREATE TRIGGER track_email_click
  BEFORE UPDATE ON email_logs
  FOR EACH ROW
  EXECUTE FUNCTION track_email_click();

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Get email engagement rate for a campaign
CREATE OR REPLACE FUNCTION get_campaign_metrics(campaign_uuid UUID)
RETURNS TABLE (
  total_sent BIGINT,
  total_delivered BIGINT,
  total_opened BIGINT,
  total_clicked BIGINT,
  delivery_rate NUMERIC,
  open_rate NUMERIC,
  click_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) AS total_sent,
    COUNT(*) FILTER (WHERE delivered_at IS NOT NULL) AS total_delivered,
    COUNT(*) FILTER (WHERE opened_at IS NOT NULL) AS total_opened,
    COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) AS total_clicked,
    ROUND(
      COUNT(*) FILTER (WHERE delivered_at IS NOT NULL)::NUMERIC /
      NULLIF(COUNT(*), 0) * 100,
      2
    ) AS delivery_rate,
    ROUND(
      COUNT(*) FILTER (WHERE opened_at IS NOT NULL)::NUMERIC /
      NULLIF(COUNT(*) FILTER (WHERE delivered_at IS NOT NULL), 0) * 100,
      2
    ) AS open_rate,
    ROUND(
      COUNT(*) FILTER (WHERE clicked_at IS NOT NULL)::NUMERIC /
      NULLIF(COUNT(*) FILTER (WHERE opened_at IS NOT NULL), 0) * 100,
      2
    ) AS click_rate
  FROM email_logs
  WHERE campaign_id = campaign_uuid::text;
END;
$$ LANGUAGE plpgsql;

-- Check if customer is subscribed to email type
CREATE OR REPLACE FUNCTION is_subscribed_to_emails(
  customer_email TEXT,
  email_category TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  is_subscribed BOOLEAN;
BEGIN
  SELECT
    CASE
      WHEN email_category = 'marketing' THEN subscribed_to_marketing
      WHEN email_category = 'reminders' THEN subscribed_to_reminders
      WHEN email_category = 'newsletters' THEN subscribed_to_newsletters
      ELSE true -- Transactional emails always allowed
    END INTO is_subscribed
  FROM email_preferences
  WHERE email = customer_email;

  -- If no preference record exists, default to subscribed
  RETURN COALESCE(is_subscribed, true);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SAMPLE DATA (for testing)
-- =============================================

-- Insert default email preferences for existing customers
INSERT INTO email_preferences (customer_id, email, subscribed_to_marketing, subscribed_to_reminders, subscribed_to_newsletters)
SELECT
  id,
  email,
  true,
  true,
  true
FROM customers
WHERE email IS NOT NULL
ON CONFLICT (email) DO NOTHING;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE email_logs IS 'Tracks all email sends and engagement metrics';
COMMENT ON TABLE email_campaigns IS 'Manages email marketing campaigns';
COMMENT ON TABLE email_preferences IS 'Stores customer email subscription preferences';

COMMENT ON COLUMN email_logs.email_type IS 'Type of email sent (welcome, reminder, etc.)';
COMMENT ON COLUMN email_logs.template_data IS 'JSON data used to render the email template';
COMMENT ON COLUMN email_logs.provider_message_id IS 'Unique ID from email service provider (Resend/SendGrid)';

COMMENT ON FUNCTION get_campaign_metrics IS 'Calculate engagement metrics for an email campaign';
COMMENT ON FUNCTION is_subscribed_to_emails IS 'Check if customer is subscribed to specific email category';
