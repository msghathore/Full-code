-- Migration to add service variants support
-- This allows services to have parent-child relationships for better categorization

-- Add parent_service_id column to support service variants
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS parent_service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_parent BOOLEAN DEFAULT false;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_services_parent ON public.services(parent_service_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category);
CREATE INDEX IF NOT EXISTS idx_services_display_order ON public.services(display_order);

-- Add comment to explain the structure
COMMENT ON COLUMN public.services.parent_service_id IS 'References parent service for variants (e.g., Women''s Haircut - Short would have parent Women''s Haircut)';
COMMENT ON COLUMN public.services.is_parent IS 'Indicates if this service is a parent category that contains variants';
COMMENT ON COLUMN public.services.display_order IS 'Order in which services/variants should be displayed';
