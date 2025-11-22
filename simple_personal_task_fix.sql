-- Simple fix for personal task creation - creates just the RPC function
-- This addresses the immediate issue without complex schema changes

-- Create a simple RPC function for personal task creation
CREATE OR REPLACE FUNCTION create_personal_task(
    p_staff_id TEXT,
    p_appointment_date DATE,
    p_appointment_time TIME,
    p_description TEXT,
    p_duration_minutes INTEGER DEFAULT 60
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    task_id UUID;
BEGIN
    -- Get the first available customer and service IDs
    -- This avoids complex foreign key issues
    INSERT INTO public.appointments (
        customer_id,
        staff_id,
        service_id,
        appointment_date,
        appointment_time,
        total_amount,
        notes,
        status
    ) VALUES (
        (SELECT id FROM public.customers LIMIT 1),
        p_staff_id::UUID,
        (SELECT id FROM public.services LIMIT 1),
        p_appointment_date,
        p_appointment_time,
        0,
        'Personal Task: ' || p_description,
        'personal_task'
    ) RETURNING id INTO task_id;
    
    RETURN task_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create personal task: %', SQLERRM;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_personal_task(TEXT, DATE, TIME, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION create_personal_task(TEXT, DATE, TIME, TEXT, INTEGER) TO service_role;

-- Refresh PostgREST schema
NOTIFY pgrst, 'reload schema';