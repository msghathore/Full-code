-- Direct application of lead magnets migration
-- This script can be run directly in Supabase SQL Editor

-- Lead Magnets System
-- Creates tables for lead magnets (downloadable resources) and tracks downloads

-- =====================================================
-- TABLE: lead_magnets
-- Stores downloadable resources (ebooks, checklists, etc.)
-- =====================================================

CREATE TABLE IF NOT EXISTS lead_magnets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  magnet_type TEXT NOT NULL CHECK (magnet_type IN ('ebook', 'checklist', 'video', 'template')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  preview_image TEXT, -- URL to preview/thumbnail image
  file_url TEXT, -- URL to downloadable file (could be Google Drive, Dropbox, etc.)
  benefits JSONB DEFAULT '[]'::jsonb, -- Array of benefit strings
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_lead_magnets_slug ON lead_magnets(slug);
CREATE INDEX IF NOT EXISTS idx_lead_magnets_active ON lead_magnets(is_active) WHERE is_active = true;

-- Updated timestamp trigger
CREATE TRIGGER update_lead_magnets_updated_at
  BEFORE UPDATE ON lead_magnets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: lead_magnet_downloads
-- Tracks who downloaded which lead magnet
-- =====================================================

CREATE TABLE IF NOT EXISTS lead_magnet_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_magnet_id UUID NOT NULL REFERENCES lead_magnets(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  downloaded_at TIMESTAMPTZ DEFAULT now(),

  -- Composite index for analytics queries
  CONSTRAINT unique_email_per_magnet UNIQUE (lead_magnet_id, customer_email)
);

-- Indexes for analytics and lookups
CREATE INDEX IF NOT EXISTS idx_lead_magnet_downloads_magnet_id ON lead_magnet_downloads(lead_magnet_id);
CREATE INDEX IF NOT EXISTS idx_lead_magnet_downloads_email ON lead_magnet_downloads(customer_email);
CREATE INDEX IF NOT EXISTS idx_lead_magnet_downloads_date ON lead_magnet_downloads(downloaded_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE lead_magnets ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_magnet_downloads ENABLE ROW LEVEL SECURITY;

-- Public can view active lead magnets
CREATE POLICY "Public can view active lead magnets"
  ON lead_magnets
  FOR SELECT
  USING (is_active = true);

-- Only authenticated admins can manage lead magnets
CREATE POLICY "Admins can manage lead magnets"
  ON lead_magnets
  FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'service_role'
    OR auth.uid() IN (
      SELECT user_id FROM staff_members WHERE role IN ('owner', 'manager')
    )
  );

-- Public can create download records (form submissions)
CREATE POLICY "Anyone can create download records"
  ON lead_magnet_downloads
  FOR INSERT
  WITH CHECK (true);

-- Users can view their own downloads
CREATE POLICY "Users can view own downloads"
  ON lead_magnet_downloads
  FOR SELECT
  USING (customer_email = auth.jwt() ->> 'email');

-- Admins can view all downloads for analytics
CREATE POLICY "Admins can view all downloads"
  ON lead_magnet_downloads
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'service_role'
    OR auth.uid() IN (
      SELECT user_id FROM staff_members WHERE role IN ('owner', 'manager')
    )
  );

-- =====================================================
-- SAMPLE DATA
-- Example lead magnet for testing
-- =====================================================

INSERT INTO lead_magnets (
  slug,
  magnet_type,
  title,
  description,
  benefits,
  is_active,
  preview_image
) VALUES (
  'ultimate-hair-care-guide',
  'ebook',
  'The Ultimate Hair Care Guide',
  'Discover professional secrets to maintain gorgeous, healthy hair at home. This comprehensive guide includes tips from our expert stylists.',
  '["Professional styling techniques", "Product recommendations from experts", "Daily maintenance routines", "Seasonal hair care tips", "Common mistakes to avoid"]'::jsonb,
  true,
  '/images/lead-magnets/hair-care-guide-preview.jpg'
) ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE lead_magnets IS 'Stores lead magnet resources (ebooks, checklists, videos, templates)';
COMMENT ON TABLE lead_magnet_downloads IS 'Tracks email captures from lead magnet downloads';

COMMENT ON COLUMN lead_magnets.slug IS 'URL-friendly identifier for the lead magnet';
COMMENT ON COLUMN lead_magnets.magnet_type IS 'Type: ebook, checklist, video, or template';
COMMENT ON COLUMN lead_magnets.benefits IS 'JSON array of benefit strings to display';
COMMENT ON COLUMN lead_magnet_downloads.customer_email IS 'Email captured from download form';
