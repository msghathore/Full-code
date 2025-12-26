-- Create packages table for Grand Slam Offers
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT,
  description TEXT,
  package_type TEXT NOT NULL DEFAULT 'grand_slam',
  regular_price DECIMAL(10,2) NOT NULL,
  discounted_price DECIMAL(10,2) NOT NULL,
  savings_amount DECIMAL(10,2) NOT NULL,
  savings_percentage INTEGER NOT NULL,
  included_services TEXT[] NOT NULL DEFAULT '{}',
  bonus_items TEXT[] NOT NULL DEFAULT '{}',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  limited_quantity INTEGER,
  remaining_quantity INTEGER,
  expires_at TIMESTAMPTZ,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for active packages query
CREATE INDEX IF NOT EXISTS idx_packages_active_featured
  ON packages(is_active, is_featured DESC, discounted_price ASC);

-- Create index for slug lookup
CREATE INDEX IF NOT EXISTS idx_packages_slug
  ON packages(slug);

-- Insert sample Grand Slam packages
INSERT INTO packages (
  name, slug, tagline, description, package_type,
  regular_price, discounted_price, savings_amount, savings_percentage,
  included_services, bonus_items, is_featured, limited_quantity, remaining_quantity,
  expires_at
) VALUES
(
  'Hair Transformation Package',
  'hair-transformation',
  'Complete Hair Makeover',
  'Get a complete hair transformation including haircut, color, and deep conditioning treatment. Everything you need for gorgeous, healthy hair.',
  'grand_slam',
  500.00,
  299.00,
  201.00,
  40,
  ARRAY[
    'Premium Haircut & Style ($75)',
    'Full Color Treatment ($120)',
    'Deep Conditioning ($45)',
    'Blowout & Style ($60)',
    'Hair Consultation ($40)'
  ],
  ARRAY[
    'FREE Hair Care Product Kit ($60 value)',
    'FREE Touch-up Color (within 6 weeks)',
    'Priority Booking Access'
  ],
  true,
  20,
  20,
  NOW() + INTERVAL '7 days'
),
(
  'Ultimate Relaxation Spa Day',
  'spa-day-ultimate',
  'Full Day of Pampering',
  'Escape from stress with our ultimate spa package. Includes massage, facial, manicure, and pedicure.',
  'grand_slam',
  380.00,
  249.00,
  131.00,
  34,
  ARRAY[
    '90-Minute Deep Tissue Massage ($120)',
    'Luxury Facial Treatment ($85)',
    'Deluxe Manicure ($45)',
    'Spa Pedicure ($55)',
    'Aromatherapy Session ($35)'
  ],
  ARRAY[
    'FREE Glass of Champagne',
    'FREE Relaxation Tea & Snacks',
    'Complimentary Scalp Massage'
  ],
  true,
  15,
  15,
  NOW() + INTERVAL '7 days'
),
(
  'Bridal Beauty Bundle',
  'bridal-beauty-bundle',
  'Wedding Day Perfection',
  'Everything you need to look stunning on your special day. Trial session included!',
  'grand_slam',
  650.00,
  449.00,
  201.00,
  31,
  ARRAY[
    'Bridal Hair Trial ($80)',
    'Wedding Day Hair & Makeup ($180)',
    'Airbrush Makeup ($120)',
    'Lash Extensions ($95)',
    'Manicure & Pedicure ($90)',
    'Pre-Wedding Facial ($85)'
  ],
  ARRAY[
    'FREE Bridal Party Discount (20% off for bridesmaids)',
    'FREE Touch-up Kit for Wedding Day',
    'Dedicated Bridal Coordinator'
  ],
  false,
  10,
  10,
  NOW() + INTERVAL '30 days'
),
(
  'Glow Up Package',
  'glow-up-package',
  'Complete Beauty Makeover',
  'Transform your look with this comprehensive beauty package perfect for special occasions.',
  'grand_slam',
  420.00,
  279.00,
  141.00,
  34,
  ARRAY[
    'Haircut & Blowout ($95)',
    'Professional Makeup Application ($75)',
    'Eyebrow Shaping & Tint ($40)',
    'Luxury Facial ($85)',
    'Express Manicure ($35)',
    'Lash Lift & Tint ($65)'
  ],
  ARRAY[
    'FREE Makeup Touch-up Kit',
    'FREE Professional Photo Tips',
    '15% Off Next Visit'
  ],
  false,
  25,
  25,
  NOW() + INTERVAL '14 days'
);

-- Add RLS policies
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- Allow public read access for active packages
CREATE POLICY "Public can view active packages"
  ON packages
  FOR SELECT
  USING (is_active = true);

-- Staff can manage packages (if staff role exists)
CREATE POLICY "Staff can manage packages"
  ON packages
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_packages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_packages_updated_at ON packages;
CREATE TRIGGER trigger_update_packages_updated_at
  BEFORE UPDATE ON packages
  FOR EACH ROW
  EXECUTE FUNCTION update_packages_updated_at();

COMMENT ON TABLE packages IS 'Grand Slam offer packages with bundled services and discounts';
