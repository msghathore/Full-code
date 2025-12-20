-- SECURITY: Secure RLS Policies for Production
-- This migration tightens RLS policies to prevent unauthorized access

-- Staff table: Only authenticated staff can read their own data
DROP POLICY IF EXISTS "Enable read access for all users" ON public.staff;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.staff;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.staff;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.staff;

-- Staff can read their own data and admins can read all
CREATE POLICY "Staff can read own data" ON public.staff
    FOR SELECT
    TO authenticated
    USING (
        auth.uid()::text = id
        OR EXISTS (
            SELECT 1 FROM public.staff s
            WHERE s.id = auth.uid()::text
            AND s.role = 'admin'
        )
    );

-- Only admins can insert new staff
CREATE POLICY "Only admins can create staff" ON public.staff
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.staff s
            WHERE s.id = auth.uid()::text
            AND s.role = 'admin'
        )
    );

-- Staff can update their own profile, admins can update anyone
CREATE POLICY "Staff can update own data" ON public.staff
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid()::text = id
        OR EXISTS (
            SELECT 1 FROM public.staff s
            WHERE s.id = auth.uid()::text
            AND s.role = 'admin'
        )
    )
    WITH CHECK (
        auth.uid()::text = id
        OR EXISTS (
            SELECT 1 FROM public.staff s
            WHERE s.id = auth.uid()::text
            AND s.role = 'admin'
        )
    );

-- Only admins can delete staff
CREATE POLICY "Only admins can delete staff" ON public.staff
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.staff s
            WHERE s.id = auth.uid()::text
            AND s.role = 'admin'
        )
    );

-- Appointments: Staff can only see appointments assigned to them or all if admin
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.appointments;
DROP POLICY IF EXISTS "Authenticated users can insert appointments" ON public.appointments;

-- Public can read appointments (for booking calendar)
CREATE POLICY "Public can view appointment times" ON public.appointments
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Authenticated users can create appointments
CREATE POLICY "Authenticated can create appointments" ON public.appointments
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Only assigned staff or admins can update appointments
CREATE POLICY "Staff can update assigned appointments" ON public.appointments
    FOR UPDATE
    TO authenticated
    USING (
        staff_id = auth.uid()::text
        OR EXISTS (
            SELECT 1 FROM public.staff s
            WHERE s.id = auth.uid()::text
            AND s.role = 'admin'
        )
    );

-- Services: Public read, admin write
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.services;

CREATE POLICY "Public can view services" ON public.services
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Only admins can modify services" ON public.services
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.staff s
            WHERE s.id = auth.uid()::text
            AND s.role = 'admin'
        )
    );

-- Customers: Staff can read customers they've served, admins can read all
CREATE POLICY "Staff can view their customers" ON public.customers
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.appointments a
            WHERE a.email = customers.email
            AND (
                a.staff_id = auth.uid()::text
                OR EXISTS (
                    SELECT 1 FROM public.staff s
                    WHERE s.id = auth.uid()::text
                    AND s.role = 'admin'
                )
            )
        )
    );

-- Access audit log: Only admins can read
DROP POLICY IF EXISTS "Anyone can insert audit logs" ON public.access_audit_log;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.access_audit_log;

-- Anyone can insert audit logs (for tracking)
CREATE POLICY "Insert audit logs" ON public.access_audit_log
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Only admins can view audit logs
CREATE POLICY "Admins view audit logs" ON public.access_audit_log
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.staff s
            WHERE s.id = auth.uid()::text
            AND s.role = 'admin'
        )
    );

-- Add comment to indicate this migration was applied
COMMENT ON SCHEMA public IS 'Secure RLS policies applied on 2025-12-18';
