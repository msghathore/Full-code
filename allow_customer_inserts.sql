-- Allow anonymous users to insert customers for appointment creation
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.customers;

CREATE POLICY "Enable insert access for all users" ON public.customers
    FOR INSERT
    WITH CHECK (true);

-- Also allow select for anon
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.customers;

CREATE POLICY "Enable read access for all users" ON public.customers
    FOR SELECT
    USING (true);