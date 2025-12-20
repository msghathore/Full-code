-- Drop overly permissive policies
DROP POLICY IF EXISTS "staff_select_policy" ON public.staff;
DROP POLICY IF EXISTS "staff_insert_policy" ON public.staff;
DROP POLICY IF EXISTS "staff_update_policy" ON public.staff;
DROP POLICY IF EXISTS "staff_delete_policy" ON public.staff;

-- Allow read for login (anon users need to query by username)
CREATE POLICY "staff_select_for_login" ON public.staff
  FOR SELECT
  TO anon
  USING (true);

-- Allow authenticated read
CREATE POLICY "staff_select_authenticated" ON public.staff
  FOR SELECT
  TO authenticated
  USING (true);

-- Restrict modifications to service role only (admin panel uses service role key)
CREATE POLICY "staff_modify_service_role_only" ON public.staff
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- Service role can do anything (for admin panel)
CREATE POLICY "staff_all_service_role" ON public.staff
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
