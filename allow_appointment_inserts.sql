-- Allow anonymous users to insert appointments for demo purposes
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.appointments;

CREATE POLICY "Enable insert access for all users" ON public.appointments
    FOR INSERT
    WITH CHECK (true);

-- Also allow select for anon
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.appointments;

CREATE POLICY "Enable read access for all users" ON public.appointments
    FOR SELECT
    USING (true);