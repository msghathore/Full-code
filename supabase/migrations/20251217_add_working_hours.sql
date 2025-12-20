-- Create staff working hours table
CREATE TABLE IF NOT EXISTS public.staff_working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun, 6=Sat
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(staff_id, day_of_week)
);

-- Enable RLS
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
  CASE WHEN dow = 6 THEN '09:00:00' ELSE '08:00:00' END,
  CASE WHEN dow = 6 THEN '17:00:00' ELSE '18:00:00' END
FROM public.staff s
CROSS JOIN generate_series(1, 6) dow  -- Mon-Sat (exclude Sun)
ON CONFLICT (staff_id, day_of_week) DO NOTHING;
