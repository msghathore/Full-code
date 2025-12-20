-- ============================================
-- COMBINED MIGRATION SCRIPT
-- Run this in Supabase SQL Editor
-- ============================================

-- MIGRATION 1: Add password columns
-- File: 20251217_add_password_salt.sql
-- ============================================
-- Add password_hash column if it doesn't exist
ALTER TABLE public.staff
  ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Add password_salt column if it doesn't exist
ALTER TABLE public.staff
  ADD COLUMN IF NOT EXISTS password_salt VARCHAR(255);

-- Add temp_password column if it doesn't exist
ALTER TABLE public.staff
  ADD COLUMN IF NOT EXISTS temp_password VARCHAR(255);

-- Add username column if it doesn't exist
ALTER TABLE public.staff
  ADD COLUMN IF NOT EXISTS username VARCHAR(100);

-- Populate usernames for existing staff who don't have one
UPDATE public.staff
SET username = LOWER(SUBSTRING(first_name, 1, 10)) || SUBSTRING(id::text, 1, 4)
WHERE username IS NULL;

-- Now add unique constraint
ALTER TABLE public.staff
  ADD CONSTRAINT staff_username_unique UNIQUE (username);

-- Add comments to columns
COMMENT ON COLUMN public.staff.password_hash IS 'PBKDF2-SHA256 hashed password';
COMMENT ON COLUMN public.staff.password_salt IS 'Random salt for password hashing (32 chars hex)';
COMMENT ON COLUMN public.staff.temp_password IS 'Plain text temporary password for first login only';

-- MIGRATION 2: Secure staff RLS policies
-- File: 20251217_secure_staff_rls.sql
-- ============================================
DROP POLICY IF EXISTS "staff_select_policy" ON public.staff;
DROP POLICY IF EXISTS "staff_insert_policy" ON public.staff;
DROP POLICY IF EXISTS "staff_update_policy" ON public.staff;
DROP POLICY IF EXISTS "staff_delete_policy" ON public.staff;

CREATE POLICY "staff_select_for_login" ON public.staff
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "staff_select_authenticated" ON public.staff
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "staff_modify_service_role_only" ON public.staff
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "staff_all_service_role" ON public.staff
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- MIGRATION 3: Add badge fields to appointments
-- File: 20251217_add_badge_fields.sql
-- ============================================
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS retention_status VARCHAR(10)
    CHECK (retention_status IN ('RR', 'RNR', 'NR', 'NNR'));

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20)
    CHECK (payment_status IN ('paid', 'deposit', 'package', 'membership', 'pending'))
    DEFAULT 'pending';

COMMENT ON COLUMN public.appointments.retention_status IS 'Customer retention tracking: RR=Return Request, RNR=Return Non-Request, NR=New Request, NNR=New Non-Request';
COMMENT ON COLUMN public.appointments.payment_status IS 'Payment status: paid, deposit, package, membership, or pending';

-- MIGRATION 4: Create staff working hours table
-- File: 20251217_add_working_hours.sql
-- ============================================
CREATE TABLE IF NOT EXISTS public.staff_working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(staff_id, day_of_week)
);

ALTER TABLE public.staff_working_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "working_hours_select_all" ON public.staff_working_hours
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "working_hours_modify_service_role" ON public.staff_working_hours
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Seed default working hours (Mon-Fri 8AM-6PM, Sat 9AM-5PM)
INSERT INTO public.staff_working_hours (staff_id, day_of_week, start_time, end_time)
SELECT
  s.id,
  dow,
  CASE WHEN dow = 6 THEN '09:00:00'::TIME ELSE '08:00:00'::TIME END,
  CASE WHEN dow = 6 THEN '17:00:00'::TIME ELSE '18:00:00'::TIME END
FROM public.staff s
CROSS JOIN generate_series(1, 6) dow
ON CONFLICT (staff_id, day_of_week) DO NOTHING;

-- ============================================
-- MIGRATIONS COMPLETE!
-- ============================================
SELECT 'All migrations completed successfully!' as status;
