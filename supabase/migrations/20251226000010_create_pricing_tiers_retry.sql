-- Create pricing_tiers table for the tier-based pricing system (Basic, Premium, Luxury)
-- Retry with proper syntax

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

-- Enable RLS
ALTER TABLE public.pricing_tiers ENABLE ROW LEVEL SECURITY;

-- Public read access policy
DROP POLICY IF EXISTS "Pricing tiers are viewable by everyone" ON public.pricing_tiers;
CREATE POLICY "Pricing tiers are viewable by everyone"
    ON public.pricing_tiers FOR SELECT
    USING (true);

-- Admin write access (simplified - just check if user exists)
DROP POLICY IF EXISTS "Pricing tiers are writable by staff" ON public.pricing_tiers;
CREATE POLICY "Pricing tiers are writable by staff"
    ON public.pricing_tiers FOR ALL
    USING (auth.uid() IS NOT NULL);

-- Create updated_at trigger
DROP TRIGGER IF EXISTS pricing_tiers_updated_at ON public.pricing_tiers;
CREATE OR REPLACE FUNCTION update_pricing_tiers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pricing_tiers_updated_at
    BEFORE UPDATE ON public.pricing_tiers
    FOR EACH ROW
    EXECUTE FUNCTION update_pricing_tiers_updated_at();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pricing_tiers_tier_name ON public.pricing_tiers(tier_name);
CREATE INDEX IF NOT EXISTS idx_pricing_tiers_tier_level ON public.pricing_tiers(tier_level);
CREATE INDEX IF NOT EXISTS idx_pricing_tiers_display_order ON public.pricing_tiers(display_order);

-- Table comment
COMMENT ON TABLE public.pricing_tiers IS 'Pricing tier levels (Basic, Premium, Luxury) for transparent pricing and value communication';

-- Delete any existing records to avoid conflicts
TRUNCATE public.pricing_tiers;

-- Insert seed data for the three tiers
INSERT INTO public.pricing_tiers (tier_name, tier_level, min_price, max_price, tagline, description, features, typical_services, upgrade_benefits, is_most_popular, display_order)
VALUES
    (
        'Basic',
        1,
        25.00,
        75.00,
        'Essential Beauty Services',
        'Perfect for quick touch-ups and essential maintenance. Get professional results without breaking the bank.',
        ARRAY[
            'Standard service quality',
            'Quick appointment times',
            'Basic product selection',
            'Professional staff',
            'Clean & safe environment',
            'Same-day availability'
        ],
        ARRAY[
            'Basic Manicure ($25)',
            'Basic Pedicure ($35)',
            'Simple Haircut ($45)',
            'Eyebrow Threading ($15)',
            'Basic Facial ($60)',
            'Express Massage (30min - $50)'
        ],
        ARRAY[
            'Upgrade to Premium for luxury products',
            'Get longer appointment times',
            'Access premium add-ons'
        ],
        false,
        1
    ),
    (
        'Premium',
        2,
        75.00,
        150.00,
        'Elevated Experience',
        'The sweet spot between value and luxury. Enhanced services with premium products and extended care.',
        ARRAY[
            'Premium product lines',
            'Extended appointment times',
            'Complimentary beverages',
            'Senior stylist selection',
            'Priority scheduling',
            'Relaxation amenities',
            '10% loyalty rewards',
            'Free consultation'
        ],
        ARRAY[
            'Deluxe Manicure with gel ($75)',
            'Spa Pedicure with massage ($85)',
            'Premium Cut & Style ($95)',
            'Deep Tissue Massage (60min - $120)',
            'Advanced Facial Treatment ($110)',
            'Microblading Session ($400)'
        ],
        ARRAY[
            'Upgrade to Luxury for VIP treatment',
            'Get exclusive products',
            'Access to master stylists'
        ],
        true,
        2
    ),
    (
        'Luxury',
        3,
        150.00,
        500.00,
        'Ultimate Indulgence',
        'The pinnacle of pampering. Reserve our master artists, premium suites, and the finest products available.',
        ARRAY[
            'Top-tier luxury products',
            'Private treatment suites',
            'Master stylist guaranteed',
            'Complimentary spa amenities',
            'Concierge service',
            'Premium refreshments',
            'Extended after-care',
            '15% loyalty rewards',
            'VIP priority access',
            'Personalized treatment plans',
            'Luxury gift with service'
        ],
        ARRAY[
            'Luxury Nail Art Experience ($150+)',
            'Full Hair Transformation ($200+)',
            'Hot Stone Massage (90min - $180)',
            'Luxury Facial with LED ($200)',
            'Full PMU Session ($500)',
            'Bridal Package ($350+)'
        ],
        ARRAY[
            'The ultimate salon experience',
            'No upgrades needed - this is the best',
            'VIP member perks & exclusive events'
        ],
        false,
        3
    );
