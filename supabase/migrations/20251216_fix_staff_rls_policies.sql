-- Fix RLS policies for staff table to allow anon users to manage staff
-- The admin panel uses custom authentication, not Supabase Auth

-- First, ensure RLS is enabled
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_permissions ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on staff table
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.staff;
DROP POLICY IF EXISTS "Enable update access for admins" ON public.staff;
DROP POLICY IF EXISTS "Enable insert access for admins" ON public.staff;
DROP POLICY IF EXISTS "Enable delete access for admins" ON public.staff;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.staff;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.staff;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.staff;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.staff;
DROP POLICY IF EXISTS "Allow all access to staff" ON public.staff;
DROP POLICY IF EXISTS "staff_select_policy" ON public.staff;
DROP POLICY IF EXISTS "staff_insert_policy" ON public.staff;
DROP POLICY IF EXISTS "staff_update_policy" ON public.staff;
DROP POLICY IF EXISTS "staff_delete_policy" ON public.staff;

-- Create permissive policies for staff table
DROP POLICY IF EXISTS "staff_select_policy" ON public.staff;
CREATE POLICY "staff_select_policy" ON public.staff
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "staff_insert_policy" ON public.staff;
CREATE POLICY "staff_insert_policy" ON public.staff
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "staff_update_policy" ON public.staff;
CREATE POLICY "staff_update_policy" ON public.staff
    FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "staff_delete_policy" ON public.staff;
CREATE POLICY "staff_delete_policy" ON public.staff
    FOR DELETE
    TO anon, authenticated
    USING (true);

-- Drop ALL existing policies on staff_permissions table
DROP POLICY IF EXISTS "Enable write access for service role" ON public.staff_permissions;
DROP POLICY IF EXISTS "Enable write access for all users" ON public.staff_permissions;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.staff_permissions;
DROP POLICY IF EXISTS "staff_permissions_select_policy" ON public.staff_permissions;
DROP POLICY IF EXISTS "staff_permissions_insert_policy" ON public.staff_permissions;
DROP POLICY IF EXISTS "staff_permissions_update_policy" ON public.staff_permissions;
DROP POLICY IF EXISTS "staff_permissions_delete_policy" ON public.staff_permissions;

-- Create permissive policies for staff_permissions table
DROP POLICY IF EXISTS "staff_permissions_select_policy" ON public.staff_permissions;
CREATE POLICY "staff_permissions_select_policy" ON public.staff_permissions
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "staff_permissions_insert_policy" ON public.staff_permissions;
CREATE POLICY "staff_permissions_insert_policy" ON public.staff_permissions
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "staff_permissions_update_policy" ON public.staff_permissions;
CREATE POLICY "staff_permissions_update_policy" ON public.staff_permissions
    FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "staff_permissions_delete_policy" ON public.staff_permissions;
CREATE POLICY "staff_permissions_delete_policy" ON public.staff_permissions
    FOR DELETE
    TO anon, authenticated
    USING (true);
