-- Create service_upsells table for booking upsell offers
-- This enables cross-selling and upselling during the booking flow

CREATE TABLE IF NOT EXISTS service_upsells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationship: Which service triggers this upsell
  parent_service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,

  -- Which service is being recommended
  upsell_service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,

  -- Upsell type: 'bundle', 'addon', 'upgrade', 'complementary'
  upsell_type TEXT NOT NULL DEFAULT 'addon' CHECK (upsell_type IN ('bundle', 'addon', 'upgrade', 'complementary')),

  -- Discount percentage (e.g., 20 for 20% off)
  discount_percentage INTEGER DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),

  -- Sales pitch text to display
  pitch_text TEXT NOT NULL,

  -- Display order (lower numbers appear first)
  display_order INTEGER DEFAULT 0,

  -- Active/inactive flag
  is_active BOOLEAN DEFAULT true,

  -- Conversion tracking
  times_shown INTEGER DEFAULT 0,
  times_accepted INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure we don't recommend a service to itself
  CONSTRAINT no_self_upsell CHECK (parent_service_id != upsell_service_id)
);

-- Create indexes for performance
CREATE INDEX idx_service_upsells_parent ON service_upsells(parent_service_id) WHERE is_active = true;
CREATE INDEX idx_service_upsells_display_order ON service_upsells(parent_service_id, display_order);

-- RLS Policies (allow public read for booking flow)
ALTER TABLE service_upsells ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read for active upsells"
  ON service_upsells
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Allow authenticated users to update stats"
  ON service_upsells
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_service_upsells_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER service_upsells_updated_at
  BEFORE UPDATE ON service_upsells
  FOR EACH ROW
  EXECUTE FUNCTION update_service_upsells_updated_at();

-- Sample data: Common upsell combinations
-- Haircut -> Deep Conditioning Treatment
INSERT INTO service_upsells (parent_service_id, upsell_service_id, upsell_type, discount_percentage, pitch_text, display_order)
SELECT
  s1.id,
  s2.id,
  'addon',
  20,
  'Add a deep conditioning treatment to restore moisture and shine - Save 20% when booked together!',
  1
FROM services s1
CROSS JOIN services s2
WHERE s1.name ILIKE '%haircut%'
  AND s2.name ILIKE '%condition%'
LIMIT 1;

-- Haircut -> Highlights
INSERT INTO service_upsells (parent_service_id, upsell_service_id, upsell_type, discount_percentage, pitch_text, display_order)
SELECT
  s1.id,
  s2.id,
  'addon',
  15,
  'Transform your look with highlights - Popular add-on! Save 15%',
  2
FROM services s1
CROSS JOIN services s2
WHERE s1.name ILIKE '%haircut%'
  AND s2.name ILIKE '%highlight%'
LIMIT 1;

-- Manicure -> Pedicure (Bundle)
INSERT INTO service_upsells (parent_service_id, upsell_service_id, upsell_type, discount_percentage, pitch_text, display_order)
SELECT
  s1.id,
  s2.id,
  'bundle',
  25,
  'Complete your spa day! Add a pedicure for the ultimate pampering experience - Save 25%',
  1
FROM services s1
CROSS JOIN services s2
WHERE s1.name ILIKE '%manicure%'
  AND s2.name ILIKE '%pedicure%'
LIMIT 1;

-- Facial -> Massage (Complementary)
INSERT INTO service_upsells (parent_service_id, upsell_service_id, upsell_type, discount_percentage, pitch_text, display_order)
SELECT
  s1.id,
  s2.id,
  'complementary',
  20,
  'Enhance your relaxation with a soothing massage - Perfect combination! Save 20%',
  1
FROM services s1
CROSS JOIN services s2
WHERE s1.name ILIKE '%facial%'
  AND s2.name ILIKE '%massage%'
LIMIT 1;

-- Color Services -> Toner & Gloss
INSERT INTO service_upsells (parent_service_id, upsell_service_id, upsell_type, discount_percentage, pitch_text, display_order)
SELECT
  s1.id,
  s2.id,
  'addon',
  15,
  'Lock in your color with professional toner & gloss treatment - Save 15%',
  1
FROM services s1
CROSS JOIN services s2
WHERE (s1.name ILIKE '%color%' OR s1.name ILIKE '%highlight%')
  AND s2.name ILIKE '%toner%'
LIMIT 1;

COMMENT ON TABLE service_upsells IS 'Upsell recommendations shown during booking flow to increase average order value';
COMMENT ON COLUMN service_upsells.upsell_type IS 'Type of upsell: bundle (multi-service package), addon (complementary service), upgrade (premium version), complementary (related service)';
COMMENT ON COLUMN service_upsells.pitch_text IS 'Persuasive text shown to customer explaining the value proposition';
COMMENT ON COLUMN service_upsells.times_shown IS 'Tracking metric: how many times this upsell was displayed';
COMMENT ON COLUMN service_upsells.times_accepted IS 'Tracking metric: how many times customer accepted this upsell';
