-- Create promo_codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_purchase_amount DECIMAL(10,2) DEFAULT 0,
  max_discount_amount DECIMAL(10,2),
  usage_limit INTEGER,
  usage_count INTEGER NOT NULL DEFAULT 0,
  per_user_limit INTEGER DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  applicable_to TEXT[] DEFAULT '{}', -- service IDs or package IDs
  excluded_items TEXT[] DEFAULT '{}',
  source TEXT, -- 'exit_intent', 'lead_magnet', 'manual', etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create promo_code_redemptions table
CREATE TABLE IF NOT EXISTS promo_code_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  customer_id UUID, -- Reference to customers table if exists
  appointment_id UUID, -- Reference to appointments table
  discount_amount DECIMAL(10,2) NOT NULL,
  original_amount DECIMAL(10,2) NOT NULL,
  final_amount DECIMAL(10,2) NOT NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_promo_code_redemptions_code ON promo_code_redemptions(promo_code_id);
CREATE INDEX IF NOT EXISTS idx_promo_code_redemptions_customer ON promo_code_redemptions(customer_email);

-- Enable RLS
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_redemptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view active promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Staff can manage promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Users can view own redemptions" ON promo_code_redemptions;
DROP POLICY IF EXISTS "Users can create redemptions" ON promo_code_redemptions;
DROP POLICY IF EXISTS "Staff can view all redemptions" ON promo_code_redemptions;

-- RLS Policies for promo_codes
CREATE POLICY "Public can view active promo codes"
  ON promo_codes
  FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "Staff can manage promo codes"
  ON promo_codes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for promo_code_redemptions
CREATE POLICY "Users can view own redemptions"
  ON promo_code_redemptions
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create redemptions"
  ON promo_code_redemptions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Staff can view all redemptions"
  ON promo_code_redemptions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to update promo code usage count
CREATE OR REPLACE FUNCTION increment_promo_code_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE promo_codes
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE id = NEW.promo_code_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment usage count on redemption
DROP TRIGGER IF EXISTS trigger_increment_promo_usage ON promo_code_redemptions;
CREATE TRIGGER trigger_increment_promo_usage
  AFTER INSERT ON promo_code_redemptions
  FOR EACH ROW
  EXECUTE FUNCTION increment_promo_code_usage();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_promo_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_promo_codes_updated_at ON promo_codes;
CREATE TRIGGER trigger_update_promo_codes_updated_at
  BEFORE UPDATE ON promo_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_promo_codes_updated_at();

-- Insert common promo codes
INSERT INTO promo_codes (
  code, description, discount_type, discount_value,
  min_purchase_amount, per_user_limit, source, expires_at
) VALUES
(
  'WELCOME20',
  '20% off for exit intent popup claims',
  'percentage',
  20,
  50.00,
  1,
  'exit_intent',
  NOW() + INTERVAL '90 days'
),
(
  'FIRSTVISIT15',
  '15% off first appointment',
  'percentage',
  15,
  75.00,
  1,
  'lead_magnet',
  NOW() + INTERVAL '60 days'
),
(
  'LOYAL25',
  '25% off for loyal customers',
  'percentage',
  25,
  100.00,
  NULL, -- Unlimited uses per user
  'manual',
  NULL -- No expiration
),
(
  'NEWYEAR50',
  '$50 off any service over $150',
  'fixed_amount',
  50.00,
  150.00,
  1,
  'manual',
  NOW() + INTERVAL '30 days'
),
(
  'REFERRAL10',
  '$10 off for referrals',
  'fixed_amount',
  10.00,
  30.00,
  1,
  'referral',
  NOW() + INTERVAL '365 days'
)
ON CONFLICT (code) DO NOTHING;

COMMENT ON TABLE promo_codes IS 'Promotional discount codes for bookings';
COMMENT ON TABLE promo_code_redemptions IS 'Tracks usage of promo codes';
