-- Fix RLS policies for staff table to allow anon users
-- Staff management uses admin panel with custom auth (not Supabase Auth)

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.staff;
DROP POLICY IF EXISTS "Enable update access for admins" ON public.staff;
DROP POLICY IF EXISTS "Enable insert access for admins" ON public.staff;
DROP POLICY IF EXISTS "Enable delete access for admins" ON public.staff;

-- Create new policies that allow anon access (admin panel uses custom auth)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.staff;
CREATE POLICY "Enable read access for all users" ON public.staff
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Enable insert access for all users" ON public.staff;
CREATE POLICY "Enable insert access for all users" ON public.staff
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update access for all users" ON public.staff;
CREATE POLICY "Enable update access for all users" ON public.staff
    FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Enable delete access for all users" ON public.staff;
CREATE POLICY "Enable delete access for all users" ON public.staff
    FOR DELETE
    TO anon, authenticated
    USING (true);

-- Also fix staff_permissions policies to allow anon write access
DROP POLICY IF EXISTS "Enable write access for service role" ON public.staff_permissions;

DROP POLICY IF EXISTS "Enable write access for all users" ON public.staff_permissions;
CREATE POLICY "Enable write access for all users" ON public.staff_permissions
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Clear existing staff data that may have invalid UUIDs
DELETE FROM public.staff_permissions;
DELETE FROM public.staff;

-- Insert fresh staff data with valid UUIDs
INSERT INTO public.staff (
    id,
    first_name,
    last_name,
    username,
    password_hash,
    role,
    specialty,
    status,
    access_level,
    color,
    temp_password,
    created_at,
    updated_at
) VALUES
(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Sarah',
    'Johnson',
    'EMP001',
    'admin123',
    'admin',
    'Hair Cutting, Styling, Color',
    'available',
    'admin',
    'blue',
    'admin123',
    NOW(),
    NOW()
),
(
    'b1ffca00-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Emily',
    'Davis',
    'EMP002',
    'emily123',
    'senior',
    'Manicures, Pedicures, Nail Art',
    'available',
    'manager',
    'emerald',
    'emily123',
    NOW(),
    NOW()
),
(
    'c2ffdb11-9c0b-4ef8-bb6d-6bb9bd380a33',
    'Michael',
    'Chen',
    'EMP003',
    'michael123',
    'senior',
    'Massage Therapy, Spa Treatments',
    'available',
    'manager',
    'purple',
    'michael123',
    NOW(),
    NOW()
),
(
    'd3ffec22-9c0b-4ef8-bb6d-6bb9bd380a44',
    'Jessica',
    'Wilson',
    'EMP004',
    'jessica123',
    'junior',
    'Facial Treatments, Waxing',
    'available',
    'basic',
    'pink',
    'jessica123',
    NOW(),
    NOW()
);

-- Create permissions for the new staff members
INSERT INTO public.staff_permissions (
    staff_id,
    inventory_access,
    read_only_mode,
    checkout_access,
    calendar_access,
    analytics_access,
    settings_access,
    customer_management_access
)
SELECT
    id,
    CASE WHEN role = 'admin' THEN true ELSE false END,
    CASE WHEN role = 'junior' THEN true ELSE false END,
    true,
    true,
    CASE WHEN role IN ('admin', 'senior') THEN true ELSE false END,
    true,
    CASE WHEN role != 'junior' THEN true ELSE false END
FROM public.staff;

-- Verify data was inserted
DO $$
DECLARE
    staff_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO staff_count FROM public.staff;
    RAISE NOTICE 'Staff table now has % records', staff_count;
END $$;
