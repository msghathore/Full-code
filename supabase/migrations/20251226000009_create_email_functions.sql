-- Migration: Create Email Functions
-- Description: Create the metric and subscription check functions for email system
-- Author: Claude
-- Date: 2025-12-26

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
