-- Create membership tiers table (Hormozi-style value stacking)
CREATE TABLE IF NOT EXISTS membership_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  monthly_price DECIMAL(10,2) NOT NULL,
  annual_price DECIMAL(10,2), -- Discounted annual option
  credits_per_month INTEGER NOT NULL,
  credit_value DECIMAL(10,2) NOT NULL, -- Actual dollar value of credits
  rollover_credits BOOLEAN DEFAULT false,
  priority_booking BOOLEAN DEFAULT false,
  discount_percentage INTEGER DEFAULT 0,
  max_guests INTEGER DEFAULT 0,
  free_upgrades_per_month INTEGER DEFAULT 0,
  house_calls_per_year INTEGER DEFAULT 0,
  description TEXT,
  features JSONB, -- Array of feature descriptions
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  badge TEXT, -- "MOST POPULAR", "BEST VALUE", etc.
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create user memberships table
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

-- Create membership credit transactions table
CREATE TABLE IF NOT EXISTS membership_credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id UUID REFERENCES user_memberships(id) ON DELETE CASCADE,
  credits_change INTEGER NOT NULL, -- Positive for adds, negative for usage
  transaction_type TEXT CHECK (transaction_type IN ('monthly_credit', 'bonus', 'used', 'expired', 'refund', 'adjustment')),
  description TEXT,
  reference_id UUID, -- Could be appointment_id, payment_id, etc.
  reference_type TEXT, -- 'appointment', 'payment', 'bonus', etc.
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create membership perks usage tracking
CREATE TABLE IF NOT EXISTS membership_perk_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id UUID REFERENCES user_memberships(id) ON DELETE CASCADE,
  perk_type TEXT CHECK (perk_type IN ('free_upgrade', 'guest_booking', 'house_call', 'priority_booking')),
  used_at TIMESTAMP DEFAULT NOW(),
  appointment_id UUID REFERENCES appointments(id),
  description TEXT
);

-- Create indexes
CREATE INDEX idx_memberships_user ON user_memberships(user_id);
CREATE INDEX idx_memberships_status ON user_memberships(status);
CREATE INDEX idx_memberships_tier ON user_memberships(tier_id);
CREATE INDEX idx_membership_credits_membership ON membership_credit_transactions(membership_id);
CREATE INDEX idx_membership_perks_membership ON membership_perk_usage(membership_id);

-- Insert Hormozi-style irresistible membership tiers
INSERT INTO membership_tiers (
  name, slug, monthly_price, annual_price, credits_per_month, credit_value,
  rollover_credits, priority_booking, discount_percentage, max_guests,
  free_upgrades_per_month, house_calls_per_year, description, features, display_order, badge
) VALUES
(
  'Beauty Basic',
  'beauty-basic',
  79.00,
  790.00, -- Save $158/year (2 months free)
  100,
  120.00, -- $120 value for $79
  false,
  false,
  10,
  0,
  0,
  0,
  'Perfect for regular beauty maintenance',
  '["$100 in Monthly Credits", "10% Discount on All Services", "Mobile App Access", "Birthday Month Bonus ($25)", "Exclusive Member Offers"]'::jsonb,
  1,
  NULL
),
(
  'Glow Getter',
  'glow-getter',
  149.00,
  1490.00, -- Save $298/year (2 months free)
  250,
  350.00, -- $350 value for $149
  true,
  true,
  20,
  1,
  1,
  0,
  'For the beauty enthusiast who deserves VIP treatment',
  '["$250 in Monthly Credits", "20% Discount on All Services", "Credits Roll Over (Never Lose Value!)", "Priority Booking (Skip the Line)", "Bring 1 Guest at Member Prices", "Birthday Month Double Credits", "VIP-Only Flash Sales", "1 Free Upgrade per Month"]'::jsonb,
  2,
  'MOST POPULAR'
),
(
  'VIP Luxe',
  'vip-luxe',
  299.00,
  2990.00, -- Save $598/year (2 months free)
  600,
  900.00, -- $900 value for $299
  true,
  true,
  30,
  3,
  2,
  1,
  'Ultimate luxury experience with maximum savings',
  '["$600 in Monthly Credits", "30% Discount on All Services", "Credits Roll Over Forever", "Unlimited Priority Booking", "Bring 3 Guests at Member Prices", "Birthday Month TRIPLE Credits", "First Access to New Services", "2 Free Upgrades per Month", "1 Free House Call Service/Year", "Dedicated VIP Concierge", "Exclusive Member Events"]'::jsonb,
  3,
  'BEST VALUE'
);

-- Function to add monthly credits to active memberships
CREATE OR REPLACE FUNCTION add_monthly_membership_credits()
RETURNS INTEGER AS $$
DECLARE
  v_membership RECORD;
  v_credits_added INTEGER := 0;
  v_tier RECORD;
BEGIN
  FOR v_membership IN
    SELECT m.*, t.credits_per_month, t.name as tier_name
    FROM user_memberships m
    JOIN membership_tiers t ON m.tier_id = t.id
    WHERE m.status = 'active'
      AND m.next_billing_date <= CURRENT_DATE
  LOOP
    -- Add monthly credits
    UPDATE user_memberships
    SET
      credits_balance = credits_balance + v_membership.credits_per_month,
      next_billing_date = next_billing_date + INTERVAL '1 month',
      last_billing_date = CURRENT_DATE,
      updated_at = NOW()
    WHERE id = v_membership.id;

    -- Log the transaction
    INSERT INTO membership_credit_transactions (
      membership_id,
      credits_change,
      transaction_type,
      description
    ) VALUES (
      v_membership.id,
      v_membership.credits_per_month,
      'monthly_credit',
      'Monthly credit allocation for ' || v_membership.tier_name
    );

    v_credits_added := v_credits_added + 1;
  END LOOP;

  RETURN v_credits_added;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to use membership credits for appointment
CREATE OR REPLACE FUNCTION use_membership_credits(
  p_membership_id UUID,
  p_credits_to_use INTEGER,
  p_appointment_id UUID,
  p_description TEXT DEFAULT 'Service payment'
)
RETURNS JSON AS $$
DECLARE
  v_membership RECORD;
BEGIN
  -- Get membership
  SELECT * INTO v_membership
  FROM user_memberships
  WHERE id = p_membership_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Membership not found'
    );
  END IF;

  -- Check if membership is active
  IF v_membership.status != 'active' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Membership is not active'
    );
  END IF;

  -- Check if enough credits
  IF v_membership.credits_balance < p_credits_to_use THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient credits',
      'available', v_membership.credits_balance,
      'required', p_credits_to_use
    );
  END IF;

  -- Deduct credits
  UPDATE user_memberships
  SET
    credits_balance = credits_balance - p_credits_to_use,
    updated_at = NOW()
  WHERE id = p_membership_id;

  -- Log transaction
  INSERT INTO membership_credit_transactions (
    membership_id,
    credits_change,
    transaction_type,
    description,
    reference_id,
    reference_type
  ) VALUES (
    p_membership_id,
    -p_credits_to_use,
    'used',
    p_description,
    p_appointment_id,
    'appointment'
  );

  RETURN json_build_object(
    'success', true,
    'credits_used', p_credits_to_use,
    'new_balance', v_membership.credits_balance - p_credits_to_use
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's active membership
CREATE OR REPLACE FUNCTION get_user_active_membership(p_user_id UUID)
RETURNS TABLE (
  membership_id UUID,
  tier_name TEXT,
  tier_slug TEXT,
  credits_balance INTEGER,
  discount_percentage INTEGER,
  monthly_price DECIMAL,
  credit_value DECIMAL,
  priority_booking BOOLEAN,
  rollover_credits BOOLEAN,
  max_guests INTEGER,
  free_upgrades_per_month INTEGER,
  status TEXT,
  next_billing_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    t.name,
    t.slug,
    m.credits_balance,
    t.discount_percentage,
    t.monthly_price,
    t.credit_value,
    t.priority_booking,
    t.rollover_credits,
    t.max_guests,
    t.free_upgrades_per_month,
    m.status,
    m.next_billing_date
  FROM user_memberships m
  JOIN membership_tiers t ON m.tier_id = t.id
  WHERE m.user_id = p_user_id
    AND m.status = 'active'
  ORDER BY m.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE membership_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_perk_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for membership_tiers (public read)
CREATE POLICY "Membership tiers are viewable by everyone"
  ON membership_tiers FOR SELECT
  USING (is_active = true);

-- RLS Policies for user_memberships
CREATE POLICY "Users can view their own memberships"
  ON user_memberships FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memberships"
  ON user_memberships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memberships"
  ON user_memberships FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for credit transactions
CREATE POLICY "Users can view their own credit transactions"
  ON membership_credit_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_memberships
      WHERE id = membership_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for perk usage
CREATE POLICY "Users can view their own perk usage"
  ON membership_perk_usage FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_memberships
      WHERE id = membership_id AND user_id = auth.uid()
    )
  );

COMMENT ON TABLE membership_tiers IS 'Membership tier definitions with Hormozi-style value stacking';
COMMENT ON TABLE user_memberships IS 'User membership subscriptions and status';
COMMENT ON TABLE membership_credit_transactions IS 'Ledger of all membership credit transactions';
COMMENT ON TABLE membership_perk_usage IS 'Track usage of membership perks like free upgrades';
