-- =====================================================
-- GROUP BOOKING SYSTEM - COMPLETE DATABASE SCHEMA
-- =====================================================

-- 1. Group Pricing Tiers (discount levels based on group size)
CREATE TABLE IF NOT EXISTS group_pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  min_size INT NOT NULL,
  max_size INT,
  discount_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Group Packages (predefined packages for groups)
CREATE TABLE IF NOT EXISTS group_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  group_type VARCHAR(50), -- 'bridal', 'birthday', 'corporate', 'friends', 'spa_day'
  min_members INT DEFAULT 2,
  max_members INT DEFAULT 20,
  base_price DECIMAL(10,2),
  per_person_price DECIMAL(10,2),
  duration_minutes INT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Package Services (services included in each package)
CREATE TABLE IF NOT EXISTS group_package_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID REFERENCES group_packages(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT TRUE,
  is_included BOOLEAN DEFAULT TRUE, -- included in base price or add-on
  addon_price DECIMAL(10,2) DEFAULT 0,
  order_position INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Group Bookings Master Table
CREATE TABLE IF NOT EXISTS group_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Group identification
  group_name VARCHAR(255),
  group_type VARCHAR(50) NOT NULL DEFAULT 'friends', -- 'bridal', 'birthday', 'corporate', 'friends', 'spa_day', 'custom'
  package_id UUID REFERENCES group_packages(id),

  -- Lead booker information
  lead_customer_id UUID REFERENCES customers(id),
  lead_name VARCHAR(255) NOT NULL,
  lead_email VARCHAR(255) NOT NULL,
  lead_phone VARCHAR(50),

  -- Group details
  total_members INT NOT NULL DEFAULT 1,
  confirmed_members INT DEFAULT 0,

  -- Scheduling
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  scheduling_type VARCHAR(20) DEFAULT 'parallel', -- 'parallel', 'sequential', 'staggered'

  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, in_progress, completed, cancelled, no_show

  -- Financial
  subtotal_amount DECIMAL(10,2) DEFAULT 0,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  deposit_required DECIMAL(10,2) DEFAULT 0,
  deposit_paid DECIMAL(10,2) DEFAULT 0,
  balance_due DECIMAL(10,2) DEFAULT 0,
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, deposit_paid, fully_paid, refunded, partial_refund
  payment_type VARCHAR(20) DEFAULT 'single', -- 'single' (lead pays all), 'split' (each pays own)

  -- Policy settings
  cancellation_notice_hours INT DEFAULT 72,
  auto_gratuity_percentage DECIMAL(5,2) DEFAULT 0,

  -- Notes and requests
  special_requests TEXT,
  internal_notes TEXT,
  setup_requirements TEXT,

  -- Share functionality
  share_code VARCHAR(20) UNIQUE,
  share_link_active BOOLEAN DEFAULT TRUE,
  member_registration_deadline TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES staff(id),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT
);

-- 5. Group Members Table
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_booking_id UUID REFERENCES group_bookings(id) ON DELETE CASCADE,

  -- Member identification
  customer_id UUID REFERENCES customers(id),
  member_name VARCHAR(255) NOT NULL,
  member_email VARCHAR(255),
  member_phone VARCHAR(50),
  is_lead BOOLEAN DEFAULT FALSE,

  -- Service assignment
  service_id UUID REFERENCES services(id),
  staff_id UUID REFERENCES staff(id),
  scheduled_time TIME,
  duration_minutes INT,

  -- Financial (for split payments)
  service_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  final_amount DECIMAL(10,2) DEFAULT 0,
  deposit_amount DECIMAL(10,2) DEFAULT 0,
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, refunded

  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, checked_in, in_service, completed, no_show, cancelled
  checked_in_at TIMESTAMP WITH TIME ZONE,
  service_started_at TIMESTAMP WITH TIME ZONE,
  service_completed_at TIMESTAMP WITH TIME ZONE,

  -- Linked appointment (created when confirmed)
  appointment_id UUID REFERENCES appointments(id),

  -- Notes
  notes TEXT,
  special_requirements TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by VARCHAR(50) DEFAULT 'lead', -- 'lead', 'self', 'staff'
  registration_token VARCHAR(100) -- for self-registration
);

-- 6. Add group booking reference to appointments table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'group_booking_id') THEN
    ALTER TABLE appointments ADD COLUMN group_booking_id UUID REFERENCES group_bookings(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'is_group_appointment') THEN
    ALTER TABLE appointments ADD COLUMN is_group_appointment BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'group_member_id') THEN
    ALTER TABLE appointments ADD COLUMN group_member_id UUID REFERENCES group_members(id);
  END IF;
END $$;

-- 7. Add group booking settings to services table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'max_group_capacity') THEN
    ALTER TABLE services ADD COLUMN max_group_capacity INT DEFAULT 10;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'group_booking_enabled') THEN
    ALTER TABLE services ADD COLUMN group_booking_enabled BOOLEAN DEFAULT TRUE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'min_group_size') THEN
    ALTER TABLE services ADD COLUMN min_group_size INT DEFAULT 1;
  END IF;
END $$;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_group_bookings_date ON group_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_group_bookings_status ON group_bookings(status);
CREATE INDEX IF NOT EXISTS idx_group_bookings_lead_email ON group_bookings(lead_email);
CREATE INDEX IF NOT EXISTS idx_group_bookings_share_code ON group_bookings(share_code);
CREATE INDEX IF NOT EXISTS idx_group_bookings_type ON group_bookings(group_type);

CREATE INDEX IF NOT EXISTS idx_group_members_booking ON group_members(group_booking_id);
CREATE INDEX IF NOT EXISTS idx_group_members_email ON group_members(member_email);
CREATE INDEX IF NOT EXISTS idx_group_members_appointment ON group_members(appointment_id);

CREATE INDEX IF NOT EXISTS idx_appointments_group ON appointments(group_booking_id) WHERE group_booking_id IS NOT NULL;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

ALTER TABLE group_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_package_services ENABLE ROW LEVEL SECURITY;

-- Public can view active packages and pricing
CREATE POLICY "Anyone can view active group packages" ON group_packages
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Anyone can view active pricing tiers" ON group_pricing_tiers
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Anyone can view package services" ON group_package_services
  FOR SELECT USING (TRUE);

-- Public can create group bookings
CREATE POLICY "Anyone can create group bookings" ON group_bookings
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Anyone can view their own group bookings" ON group_bookings
  FOR SELECT USING (TRUE);

CREATE POLICY "Anyone can update group bookings" ON group_bookings
  FOR UPDATE USING (TRUE);

-- Group members policies
CREATE POLICY "Anyone can create group members" ON group_members
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Anyone can view group members" ON group_members
  FOR SELECT USING (TRUE);

CREATE POLICY "Anyone can update group members" ON group_members
  FOR UPDATE USING (TRUE);

CREATE POLICY "Anyone can delete group members" ON group_members
  FOR DELETE USING (TRUE);

-- Staff full access policies
CREATE POLICY "Staff can manage group packages" ON group_packages
  FOR ALL USING (TRUE);

CREATE POLICY "Staff can manage pricing tiers" ON group_pricing_tiers
  FOR ALL USING (TRUE);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Generate unique share code
CREATE OR REPLACE FUNCTION generate_share_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate share code on insert
CREATE OR REPLACE FUNCTION set_group_share_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.share_code IS NULL THEN
    NEW.share_code := generate_share_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_share_code ON group_bookings;
CREATE TRIGGER trigger_set_share_code
  BEFORE INSERT ON group_bookings
  FOR EACH ROW
  EXECUTE FUNCTION set_group_share_code();

-- Calculate group totals
CREATE OR REPLACE FUNCTION calculate_group_totals(p_group_id UUID)
RETURNS VOID AS $$
DECLARE
  v_subtotal DECIMAL(10,2);
  v_discount_pct DECIMAL(5,2);
  v_discount_amt DECIMAL(10,2);
  v_total DECIMAL(10,2);
  v_member_count INT;
  v_deposit DECIMAL(10,2);
BEGIN
  -- Get member count and subtotal
  SELECT COUNT(*), COALESCE(SUM(service_amount), 0)
  INTO v_member_count, v_subtotal
  FROM group_members
  WHERE group_booking_id = p_group_id;

  -- Get applicable discount tier
  SELECT COALESCE(discount_percentage, 0)
  INTO v_discount_pct
  FROM group_pricing_tiers
  WHERE is_active = TRUE
    AND v_member_count >= min_size
    AND (max_size IS NULL OR v_member_count <= max_size)
  ORDER BY discount_percentage DESC
  LIMIT 1;

  -- Calculate discount and total
  v_discount_amt := v_subtotal * (v_discount_pct / 100);
  v_total := v_subtotal - v_discount_amt;
  v_deposit := v_total * 0.5; -- 50% deposit

  -- Update group booking
  UPDATE group_bookings
  SET
    confirmed_members = v_member_count,
    subtotal_amount = v_subtotal,
    discount_percentage = v_discount_pct,
    discount_amount = v_discount_amt,
    total_amount = v_total,
    deposit_required = v_deposit,
    balance_due = v_total - deposit_paid,
    updated_at = NOW()
  WHERE id = p_group_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to recalculate totals when members change
CREATE OR REPLACE FUNCTION trigger_recalculate_group_totals()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM calculate_group_totals(OLD.group_booking_id);
    RETURN OLD;
  ELSE
    PERFORM calculate_group_totals(NEW.group_booking_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_member_totals ON group_members;
CREATE TRIGGER trigger_member_totals
  AFTER INSERT OR UPDATE OR DELETE ON group_members
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_group_totals();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_group_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_group_booking_updated ON group_bookings;
CREATE TRIGGER trigger_group_booking_updated
  BEFORE UPDATE ON group_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_group_timestamp();

DROP TRIGGER IF EXISTS trigger_group_member_updated ON group_members;
CREATE TRIGGER trigger_group_member_updated
  BEFORE UPDATE ON group_members
  FOR EACH ROW
  EXECUTE FUNCTION update_group_timestamp();

-- =====================================================
-- SEED DEFAULT DATA
-- =====================================================

-- Default pricing tiers
INSERT INTO group_pricing_tiers (name, min_size, max_size, discount_percentage, is_active) VALUES
  ('Small Group', 2, 3, 5.00, TRUE),
  ('Medium Group', 4, 6, 10.00, TRUE),
  ('Large Group', 7, 10, 15.00, TRUE),
  ('Extra Large Group', 11, NULL, 20.00, TRUE)
ON CONFLICT DO NOTHING;

-- Default group packages
INSERT INTO group_packages (name, description, group_type, min_members, max_members, per_person_price, duration_minutes, is_active) VALUES
  ('Bridal Bliss Package', 'Complete bridal party experience including hair styling, makeup, and mini manicures for the bride and her party.', 'bridal', 3, 12, 150.00, 180, TRUE),
  ('Birthday Glam Package', 'Celebrate in style with hair styling and makeup for the birthday star and friends.', 'birthday', 2, 10, 85.00, 120, TRUE),
  ('Spa Day Retreat', 'Relaxing spa day with facials, manicures, and pedicures for your group.', 'spa_day', 2, 8, 120.00, 150, TRUE),
  ('Corporate Wellness', 'Professional grooming services for your corporate team event.', 'corporate', 4, 20, 75.00, 90, TRUE),
  ('Girls Day Out', 'Fun and relaxing services for you and your friends.', 'friends', 2, 6, 95.00, 120, TRUE)
ON CONFLICT DO NOTHING;

-- =====================================================
-- VIEW FOR EASY QUERYING
-- =====================================================

CREATE OR REPLACE VIEW group_bookings_view AS
SELECT
  gb.*,
  gp.name as package_name,
  gp.description as package_description,
  COUNT(gm.id) as member_count,
  COUNT(CASE WHEN gm.status = 'confirmed' THEN 1 END) as confirmed_count,
  COUNT(CASE WHEN gm.status = 'checked_in' THEN 1 END) as checked_in_count,
  ARRAY_AGG(DISTINCT gm.member_name) FILTER (WHERE gm.member_name IS NOT NULL) as member_names
FROM group_bookings gb
LEFT JOIN group_packages gp ON gb.package_id = gp.id
LEFT JOIN group_members gm ON gb.id = gm.group_booking_id
GROUP BY gb.id, gp.name, gp.description;
