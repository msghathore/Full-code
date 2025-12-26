-- Create exit_intent_conversions table for tracking popup performance
CREATE TABLE IF NOT EXISTS exit_intent_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT,
  offer_claimed BOOLEAN DEFAULT false,
  shown_at TIMESTAMPTZ DEFAULT now(),
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for analytics queries
CREATE INDEX IF NOT EXISTS idx_exit_intent_conversions_shown_at ON exit_intent_conversions(shown_at);
CREATE INDEX IF NOT EXISTS idx_exit_intent_conversions_claimed ON exit_intent_conversions(offer_claimed) WHERE offer_claimed = true;
CREATE INDEX IF NOT EXISTS idx_exit_intent_conversions_email ON exit_intent_conversions(customer_email) WHERE customer_email IS NOT NULL;

-- Add trigger to set claimed_at timestamp
CREATE OR REPLACE FUNCTION set_exit_intent_claimed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.offer_claimed = true AND OLD.offer_claimed = false THEN
    NEW.claimed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_exit_intent_claimed_at ON table_name;  -- Note: will be applied for the actual table
CREATE TRIGGER trigger_exit_intent_claimed_at
  BEFORE UPDATE ON exit_intent_conversions
  FOR EACH ROW
  EXECUTE FUNCTION set_exit_intent_claimed_at();

-- Enable RLS
ALTER TABLE exit_intent_conversions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous inserts (for tracking)
DROP POLICY IF EXISTS "Allow anonymous insert for tracking" ON exit_intent_conversions;
CREATE POLICY "Allow anonymous insert for tracking" ON exit_intent_conversions
  FOR INSERT
  WITH CHECK (true);

-- Policy: Staff can view all conversions
DROP POLICY IF EXISTS "Staff can view all conversions" ON exit_intent_conversions;
CREATE POLICY "Staff can view all conversions" ON exit_intent_conversions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff_members
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Create analytics view for conversion rate
CREATE OR REPLACE VIEW exit_intent_analytics AS
SELECT
  DATE(shown_at) as date,
  COUNT(*) as total_shown,
  COUNT(*) FILTER (WHERE offer_claimed = true) as total_claimed,
  ROUND(
    (COUNT(*) FILTER (WHERE offer_claimed = true)::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
    2
  ) as conversion_rate_percent,
  COUNT(DISTINCT customer_email) FILTER (WHERE offer_claimed = true) as unique_emails
FROM exit_intent_conversions
GROUP BY DATE(shown_at)
ORDER BY date DESC;

-- Grant access to analytics view for staff
GRANT SELECT ON exit_intent_analytics TO authenticated;

COMMENT ON TABLE exit_intent_conversions IS 'Tracks exit intent popup shows and conversions for marketing analytics';
COMMENT ON VIEW exit_intent_analytics IS 'Daily conversion rate analytics for exit intent popup';
