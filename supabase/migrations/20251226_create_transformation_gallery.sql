-- Create transformation gallery table for before/after showcase
-- Migration: 20251226_create_transformation_gallery
-- Purpose: Store before/after transformation images with categories and filters

-- Create transformation_gallery table
CREATE TABLE IF NOT EXISTS public.transformation_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_category TEXT NOT NULL CHECK (service_category IN ('Hair', 'Nails', 'Spa', 'Makeup', 'Skin Care', 'All')),
  before_image_url TEXT NOT NULL,
  after_image_url TEXT NOT NULL,
  description TEXT,
  customer_consent BOOLEAN DEFAULT true NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create index for faster category filtering
CREATE INDEX IF NOT EXISTS idx_transformation_gallery_category
ON public.transformation_gallery(service_category);

-- Create index for featured items
CREATE INDEX IF NOT EXISTS idx_transformation_gallery_featured
ON public.transformation_gallery(is_featured) WHERE is_featured = true;

-- Create index for display order
CREATE INDEX IF NOT EXISTS idx_transformation_gallery_display_order
ON public.transformation_gallery(display_order);

-- Enable Row Level Security
ALTER TABLE public.transformation_gallery ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public to read transformations (for public gallery)
CREATE POLICY "Public can view transformations"
ON public.transformation_gallery
FOR SELECT
TO public
USING (true);

-- Policy: Only authenticated staff can insert transformations
CREATE POLICY "Staff can insert transformations"
ON public.transformation_gallery
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Only authenticated staff can update transformations
CREATE POLICY "Staff can update transformations"
ON public.transformation_gallery
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Only authenticated staff can delete transformations
CREATE POLICY "Staff can delete transformations"
ON public.transformation_gallery
FOR DELETE
TO authenticated
USING (true);

-- Add helpful comment
COMMENT ON TABLE public.transformation_gallery IS 'Stores before/after transformation images for gallery showcase';

-- Seed with placeholder data using Unsplash images
INSERT INTO public.transformation_gallery (service_category, before_image_url, after_image_url, description, is_featured, display_order)
VALUES
  -- Featured Hair Transformations
  ('Hair',
   'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=800&h=600&fit=crop',
   'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=800&h=600&fit=crop',
   'Vibrant balayage transformation with dimensional highlights',
   true,
   1),

  ('Hair',
   'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&h=600&fit=crop',
   'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=800&h=600&fit=crop',
   'Complete color correction and styling for damaged hair',
   true,
   2),

  ('Hair',
   'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&h=600&fit=crop',
   'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800&h=600&fit=crop',
   'Platinum blonde transformation with Olaplex treatment',
   false,
   3),

  -- Nail Transformations
  ('Nails',
   'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=600&fit=crop',
   'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=800&h=600&fit=crop',
   'French manicure with gel extension and nail art',
   true,
   4),

  ('Nails',
   'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&h=600&fit=crop',
   'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=600&fit=crop',
   'Natural to glamorous acrylic nail transformation',
   false,
   5),

  -- Spa & Skin Care Transformations
  ('Spa',
   'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&h=600&fit=crop',
   'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=600&fit=crop',
   'Deep tissue massage with aromatherapy relaxation',
   false,
   6),

  ('Skin Care',
   'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&h=600&fit=crop',
   'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800&h=600&fit=crop',
   'Hydrating facial with visible glow improvement',
   true,
   7),

  -- Makeup Transformations
  ('Makeup',
   'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=800&h=600&fit=crop',
   'https://images.unsplash.com/photo-1534101414323-d1e0e09edfb5?w=800&h=600&fit=crop',
   'Bridal makeup transformation with airbrush finish',
   true,
   8),

  ('Makeup',
   'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop',
   'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&h=600&fit=crop',
   'Glamorous evening makeup with contouring',
   false,
   9),

  -- Additional Hair Transformations
  ('Hair',
   'https://images.unsplash.com/photo-1522337094846-8a818192de1f?w=800&h=600&fit=crop',
   'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=600&fit=crop',
   'Hair extension blending with natural color match',
   false,
   10),

  ('Hair',
   'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&h=600&fit=crop',
   'https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?w=800&h=600&fit=crop',
   'Bold color change from brunette to copper',
   false,
   11);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_transformation_gallery_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
CREATE TRIGGER update_transformation_gallery_updated_at
BEFORE UPDATE ON public.transformation_gallery
FOR EACH ROW
EXECUTE FUNCTION public.update_transformation_gallery_updated_at();
