-- Part 1: Fix the "Add Personal Task" Feature
-- This script addresses the mismatch between frontend camelCase parameters and backend lowercase function parameters
-- and fixes the staff_id data type issue in personal_tasks table

-- Step 1: Drop existing RPC functions with mismatched parameter names
DROP FUNCTION IF EXISTS public.create_personal_task(text, date, time, integer, text);
DROP FUNCTION IF EXISTS public.create_personal_task_uuid(text, date, time, integer, text);
DROP FUNCTION IF EXISTS public.get_personal_tasks(text, date);

-- Step 2: Fix the data type mismatch in personal_tasks table
-- Change staff_id from TEXT to UUID to match the application's UUID format
ALTER TABLE public.personal_tasks ALTER COLUMN staff_id TYPE UUID USING staff_id::UUID;

-- Step 3: Create new RPC function with camelCase parameter names to match frontend
CREATE OR REPLACE FUNCTION public.create_personal_task(
    staffId UUID,
    appointmentDate DATE,
    appointmentTime TIME,
    durationMinutes INTEGER,
    description TEXT
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_task_id BIGINT;
BEGIN
    INSERT INTO public.personal_tasks (
        staff_id,
        appointment_date,
        appointment_time,
        duration_minutes,
        description
    ) VALUES (
        staffId,
        appointmentDate,
        appointmentTime,
        durationMinutes,
        description
    ) RETURNING id INTO new_task_id;
    
    RETURN new_task_id;
END;
$$;

-- Step 4: Create matching get function with camelCase parameters
CREATE OR REPLACE FUNCTION public.get_personal_tasks(
    staffId UUID,
    appointmentDate DATE
)
RETURNS TABLE (
    id BIGINT,
    staff_id UUID,
    appointment_date DATE,
    appointment_time TIME,
    duration_minutes INTEGER,
    description TEXT,
    status TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pt.id,
        pt.staff_id,
        pt.appointment_date,
        pt.appointment_time,
        pt.duration_minutes,
        pt.description,
        pt.status,
        pt.created_at
    FROM public.personal_tasks pt
    WHERE pt.staff_id = staffId 
    AND pt.appointment_date = appointmentDate
    ORDER BY pt.appointment_time;
END;
$$;

-- Step 5: Ensure RLS policies are permissive enough for authenticated users
-- Drop existing restrictive policies if they exist and create new permissive ones
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.personal_tasks;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.personal_tasks;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.personal_tasks;

-- Create new permissive policies for authenticated users
CREATE POLICY "Enable all access for authenticated users on personal_tasks"
ON public.personal_tasks
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);