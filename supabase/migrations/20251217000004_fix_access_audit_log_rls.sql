-- Allow anon to read access_audit_log for admin panel
-- (Admin panel uses custom auth, not Supabase auth, so it gets anon role)

-- First, check if policy exists and drop if so
DROP POLICY IF EXISTS "Allow anon to read access_audit_log" ON access_audit_log;

-- Create policy to allow anon read access
CREATE POLICY "Allow anon to read access_audit_log"
ON access_audit_log
FOR SELECT
TO anon
USING (true);
