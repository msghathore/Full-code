-- Add team display fields to staff table
-- These fields are used for the public-facing Team page

-- Add bio field for staff description
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add team_image_url for higher quality team page photos
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS team_image_url TEXT;

-- Add flag to control which staff appear on the team page
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS display_on_team BOOLEAN DEFAULT true;

-- Add display order for team page sorting
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS team_display_order INTEGER DEFAULT 0;

-- Update existing staff with sample bios
UPDATE public.staff SET
    bio = 'With years of experience and a passion for excellence, bringing artistry and precision to every service.',
    display_on_team = true,
    team_display_order = 1
WHERE first_name = 'Sarah' AND last_name = 'Johnson';

UPDATE public.staff SET
    bio = 'Known for stunning nail art and attention to detail, creating beautiful designs that make clients feel special.',
    display_on_team = true,
    team_display_order = 2
WHERE first_name = 'Emily' AND last_name = 'Davis';

UPDATE public.staff SET
    bio = 'Combining therapeutic expertise with intuitive touch to deliver deeply relaxing and healing experiences.',
    display_on_team = true,
    team_display_order = 3
WHERE first_name = 'Michael' AND last_name = 'Chen';

UPDATE public.staff SET
    bio = 'Customizing every treatment to reveal natural radiance and vitality through expert skincare techniques.',
    display_on_team = true,
    team_display_order = 4
WHERE first_name = 'Jessica' AND last_name = 'Wilson';

-- Enable RLS read access for team display (public can view team members)
CREATE POLICY IF NOT EXISTS "Public can view team members" ON public.staff
    FOR SELECT
    USING (display_on_team = true AND status != 'offline');

COMMENT ON COLUMN public.staff.bio IS 'Staff biography shown on the public Team page';
COMMENT ON COLUMN public.staff.team_image_url IS 'High-quality image URL for Team page display';
COMMENT ON COLUMN public.staff.display_on_team IS 'Whether this staff member appears on the public Team page';
COMMENT ON COLUMN public.staff.team_display_order IS 'Display order on the Team page (lower numbers first)';
