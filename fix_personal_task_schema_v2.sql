-- Fix for personal task creation - creates missing RPC functions (V2 - handles existing policies)
-- This addresses the 'staff_id' column issue and missing RPC functions

-- Create RPC function for personal task creation
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
    internal_customer_id UUID;
    internal_service_id UUID;
BEGIN
    -- Get or create internal customer for personal tasks
    SELECT id INTO internal_customer_id 
    FROM public.customers 
    WHERE email = 'internal@personal.task' 
    LIMIT 1;
    
    IF internal_customer_id IS NULL THEN
        INSERT INTO public.customers (first_name, last_name, email, phone)
        VALUES ('Internal', 'Personal Task', 'internal@personal.task', '000-000-0000')
        RETURNING id INTO internal_customer_id;
    END IF;
    
    -- Get or create internal service for personal tasks
    SELECT id INTO internal_service_id 
    FROM public.services 
    WHERE name = 'Personal Task' 
    LIMIT 1;
    
    IF internal_service_id IS NULL THEN
        INSERT INTO public.services (name, description, duration, price, color)
        VALUES ('Personal Task', 'Internal personal task', 60, 0, 'gray')
        RETURNING id INTO internal_service_id;
    END IF;
    
    -- Create the personal task as an appointment
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
        internal_customer_id,
        p_staff_id::UUID,
        internal_service_id,
        p_appointment_date,
        p_appointment_time,
        0,
        p_description,
        'confirmed'
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

-- Also create the add_to_waitlist function if missing
CREATE OR REPLACE FUNCTION add_to_waitlist(
    p_staff_id TEXT,
    p_date DATE,
    p_start_time TIME,
    p_customer_name TEXT,
    p_customer_phone TEXT,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    waitlist_id UUID;
BEGIN
    INSERT INTO public.waitlists (
        staff_id,
        date,
        start_time,
        customer_name,
        customer_phone,
        notes
    ) VALUES (
        p_staff_id::UUID,
        p_date,
        p_start_time,
        p_customer_name,
        p_customer_phone,
        p_notes
    ) RETURNING id INTO waitlist_id;
    
    RETURN waitlist_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to add to waitlist: %', SQLERRM;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION add_to_waitlist(TEXT, DATE, TIME, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION add_to_waitlist(TEXT, DATE, TIME, TEXT, TEXT, TEXT) TO service_role;

-- Create the staff_availability table if missing (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'staff_availability') THEN
        CREATE TABLE public.staff_availability (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
            date DATE NOT NULL,
            start_time TIME NOT NULL,
            end_time TIME NOT NULL,
            is_available BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            UNIQUE(staff_id, date)
        );
        
        -- Enable RLS
        ALTER TABLE public.staff_availability ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policies (drop existing first to avoid conflicts)
        DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.staff_availability;
        DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.staff_availability;
        DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.staff_availability;
        DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.staff_availability;
        
        CREATE POLICY "Enable read access for authenticated users" ON public.staff_availability
            FOR SELECT TO authenticated USING (true);
        
        CREATE POLICY "Enable insert access for authenticated users" ON public.staff_availability
            FOR INSERT TO authenticated WITH CHECK (true);
        
        CREATE POLICY "Enable update access for authenticated users" ON public.staff_availability
            FOR UPDATE TO authenticated USING (true);
        
        CREATE POLICY "Enable delete access for authenticated users" ON public.staff_availability
            FOR DELETE TO authenticated USING (true);
        
        -- Create trigger for updated_at
        DROP TRIGGER IF EXISTS update_staff_availability_updated_at ON public.staff_availability;
        CREATE TRIGGER update_staff_availability_updated_at 
            BEFORE UPDATE ON public.staff_availability
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END
$$;

-- Create the waitlists table if missing (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'waitlists') THEN
        CREATE TABLE public.waitlists (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
            date DATE NOT NULL,
            start_time TIME NOT NULL,
            customer_name VARCHAR(255) NOT NULL,
            customer_phone VARCHAR(20) NOT NULL,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
        
        -- Enable RLS
        ALTER TABLE public.waitlists ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policies (drop existing first to avoid conflicts)
        DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.waitlists;
        DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.waitlists;
        DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.waitlists;
        DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.waitlists;
        
        CREATE POLICY "Enable read access for authenticated users" ON public.waitlists
            FOR SELECT TO authenticated USING (true);
        
        CREATE POLICY "Enable insert access for authenticated users" ON public.waitlists
            FOR INSERT TO authenticated WITH CHECK (true);
        
        CREATE POLICY "Enable update access for authenticated users" ON public.waitlists
            FOR UPDATE TO authenticated USING (true);
        
        CREATE POLICY "Enable delete access for authenticated users" ON public.waitlists
            FOR DELETE TO authenticated USING (true);
        
        -- Create trigger for updated_at
        DROP TRIGGER IF EXISTS update_waitlists_updated_at ON public.waitlists;
        CREATE TRIGGER update_waitlists_updated_at 
            BEFORE UPDATE ON public.waitlists
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END
$$;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';