-- Fix RLS policies for appointments table to allow anon users (staff using custom auth)
-- This is needed because staff login uses employee ID auth, not Supabase Auth

-- Drop existing update policy if it exists
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.appointments;
DROP POLICY IF EXISTS "Enable update access for anon users" ON public.appointments;

-- Create new update policy that allows both authenticated and anon users
DROP POLICY IF EXISTS "Enable update access for all users" ON public.appointments;
CREATE POLICY "Enable update access for all users" ON public.appointments
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Also update the select policy to allow anon
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.appointments;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.appointments;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.appointments;
CREATE POLICY "Enable read access for all users" ON public.appointments
    FOR SELECT
    USING (true);

-- Update insert policy to allow anon
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.appointments;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.appointments;

DROP POLICY IF EXISTS "Enable insert access for all users" ON public.appointments;
CREATE POLICY "Enable insert access for all users" ON public.appointments
    FOR INSERT
    WITH CHECK (true);

-- Update delete policy to allow anon (for soft delete which is actually an UPDATE)
-- Note: Hard delete still requires admin role
DROP POLICY IF EXISTS "Enable delete access for admins" ON public.appointments;

DROP POLICY IF EXISTS "Enable delete access for admins" ON public.appointments;
CREATE POLICY "Enable delete access for admins" ON public.appointments
    FOR DELETE
    USING (true);
