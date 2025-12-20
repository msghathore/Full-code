-- =====================================================
-- SLOT ACTION POPOVER MENU - DATABASE SCHEMA CHANGES
-- =====================================================

-- Phase 1: Modify appointments table to support Internal Tasks
-- =====================================================
-- SLOT ACTION POPOVER MENU - DATABASE SCHEMA CHANGES
-- =====================================================

-- Phase 1: Modify appointments table to support Internal Tasks
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS type text DEFAULT 'CLIENT' CHECK (type IN ('CLIENT', 'INTERNAL'));

ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS description text;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_type ON public.appointments(type);

-- Phase 2: Create waitlists table
CREATE TABLE IF NOT EXISTS public.waitlists (
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

-- Phase 3: Create staff_availability table for working hours
CREATE TABLE IF NOT EXISTS public.staff_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL DEFAULT '08:00:00',
    end_time TIME NOT NULL DEFAULT '18:00:00',
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(staff_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_waitlists_staff_date ON public.waitlists(staff_id, date);
CREATE INDEX IF NOT EXISTS idx_waitlists_date ON public.waitlists(date);
CREATE INDEX IF NOT EXISTS idx_staff_availability_staff_date ON public.staff_availability(staff_id, date);
CREATE INDEX IF NOT EXISTS idx_staff_availability_date ON public.staff_availability(date);

-- Enable RLS on new tables
ALTER TABLE public.waitlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies for waitlists
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.waitlists;
CREATE POLICY "Enable read access for authenticated users" ON public.waitlists
    FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.waitlists;
CREATE POLICY "Enable update access for authenticated users" ON public.waitlists
    FOR UPDATE
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.waitlists;
CREATE POLICY "Enable insert access for authenticated users" ON public.waitlists
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Enable delete access for admins" ON public.waitlists;
CREATE POLICY "Enable delete access for admins" ON public.waitlists
    FOR DELETE
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

-- RLS Policies for staff_availability
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.staff_availability;
CREATE POLICY "Enable read access for authenticated users" ON public.staff_availability
    FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.staff_availability;
CREATE POLICY "Enable update access for authenticated users" ON public.staff_availability
    FOR UPDATE
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.staff_availability;
CREATE POLICY "Enable insert access for authenticated users" ON public.staff_availability
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Enable delete access for admins" ON public.staff_availability;
CREATE POLICY "Enable delete access for admins" ON public.staff_availability
    FOR DELETE
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

-- Create triggers for updating updated_at columns on new tables
DROP TRIGGER IF EXISTS update_waitlists_updated_at ON public.waitlists;
CREATE TRIGGER update_waitlists_updated_at
    BEFORE UPDATE ON public.waitlists
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_staff_availability_updated_at ON public.staff_availability;
CREATE TRIGGER update_staff_availability_updated_at
    BEFORE UPDATE ON public.staff_availability
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- HELPER FUNCTIONS FOR SLOT ACTIONS
-- =====================================================

-- Function to check for appointment conflicts including internal tasks
DROP FUNCTION IF EXISTS public.check_appointment_conflict_with_internal(UUID, DATE, TIME, UUID);
CREATE OR REPLACE FUNCTION public.check_appointment_conflict_with_internal(
    p_staff_id UUID,
    p_appointment_date DATE,
    p_appointment_time TIME,
    p_exclude_appointment_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    conflict_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.appointments
        WHERE staff_id = p_staff_id
        AND appointment_date = p_appointment_date
        AND appointment_time = p_appointment_time
        AND status NOT IN ('cancelled', 'no-show')
        AND (p_exclude_appointment_id IS NULL OR id != p_exclude_appointment_id)
    ) INTO conflict_exists;
    
    RETURN conflict_exists;
END;
$$ LANGUAGE plpgsql;

-- Function to get all waitlist entries for a staff member on a specific date
DROP FUNCTION IF EXISTS public.get_waitlist_entries(UUID, DATE);
CREATE OR REPLACE FUNCTION public.get_waitlist_entries(
    p_staff_id UUID DEFAULT NULL,
    p_date DATE DEFAULT NULL
)
RETURNS TABLE(
    id UUID,
    staff_id UUID,
    date DATE,
    start_time TIME,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        w.id,
        w.staff_id,
        w.date,
        w.start_time,
        w.customer_name,
        w.customer_phone,
        w.notes,
        w.created_at
    FROM public.waitlists w
    WHERE (p_staff_id IS NULL OR w.staff_id = p_staff_id)
    AND (p_date IS NULL OR w.date = p_date)
    ORDER BY w.created_at;
END;
$$ LANGUAGE plpgsql;

-- Function to create personal task (internal appointment)
DROP FUNCTION IF EXISTS public.create_personal_task(UUID, DATE, TIME, TEXT, INTEGER);
CREATE OR REPLACE FUNCTION public.create_personal_task(
    p_staff_id UUID,
    p_appointment_date DATE,
    p_appointment_time TIME,
    p_description TEXT,
    p_duration_minutes INTEGER DEFAULT 60
)
RETURNS UUID AS $$
DECLARE
    task_uuid UUID;
    conflict_check BOOLEAN;
BEGIN
    -- Check for conflicts with existing appointments
    SELECT public.check_appointment_conflict_with_internal(
        p_staff_id,
        p_appointment_date,
        p_appointment_time
    ) INTO conflict_check;
    
    IF conflict_check THEN
        RAISE EXCEPTION 'Time slot conflict: Staff member is already booked at this time';
    END IF;
    
    -- Create internal appointment as personal task
    INSERT INTO public.appointments (
        customer_id, -- Will be null for internal tasks
        staff_id,
        service_id, -- Will be null for internal tasks
        appointment_date,
        appointment_time,
        total_amount,
        type,
        description,
        status
    )
    VALUES (
        NULL, -- No customer for internal tasks
        p_staff_id,
        NULL, -- No service for internal tasks
        p_appointment_date,
        p_appointment_time,
        0, -- No cost for internal tasks
        'INTERNAL',
        p_description,
        'confirmed'
    )
    RETURNING id INTO task_uuid;
    
    RETURN task_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to add customer to waitlist
DROP FUNCTION IF EXISTS public.add_to_waitlist(UUID, DATE, TIME, VARCHAR, VARCHAR, TEXT);
CREATE OR REPLACE FUNCTION public.add_to_waitlist(
    p_staff_id UUID,
    p_date DATE,
    p_start_time TIME,
    p_customer_name VARCHAR(255),
    p_customer_phone VARCHAR(20),
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    waitlist_uuid UUID;
BEGIN
    INSERT INTO public.waitlists (
        staff_id,
        date,
        start_time,
        customer_name,
        customer_phone,
        notes
    )
    VALUES (
        p_staff_id,
        p_date,
        p_start_time,
        p_customer_name,
        p_customer_phone,
        p_notes
    )
    RETURNING id INTO waitlist_uuid;
    
    RETURN waitlist_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to update staff working hours for a specific date
DROP FUNCTION IF EXISTS public.update_staff_working_hours(UUID, DATE, TIME, TIME, BOOLEAN);
CREATE OR REPLACE FUNCTION public.update_staff_working_hours(
    p_staff_id UUID,
    p_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_is_available BOOLEAN DEFAULT true
)
RETURNS UUID AS $$
DECLARE
    availability_uuid UUID;
BEGIN
    INSERT INTO public.staff_availability (
        staff_id,
        date,
        start_time,
        end_time,
        is_available
    )
    VALUES (
        p_staff_id,
        p_date,
        p_start_time,
        p_end_time,
        p_is_available
    )
    ON CONFLICT (staff_id, date)
    DO UPDATE SET
        start_time = p_start_time,
        end_time = p_end_time,
        is_available = p_is_available,
        updated_at = now()
    RETURNING id INTO availability_uuid;
    
    RETURN availability_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to get staff working hours for a specific date
DROP FUNCTION IF EXISTS public.get_staff_working_hours(UUID, DATE);
CREATE OR REPLACE FUNCTION public.get_staff_working_hours(
    p_staff_id UUID,
    p_date DATE
)
RETURNS TABLE(
    id UUID,
    start_time TIME,
    end_time TIME,
    is_available BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sa.id,
        sa.start_time,
        sa.end_time,
        sa.is_available
    FROM public.staff_availability sa
    WHERE sa.staff_id = p_staff_id
    AND sa.date = p_date;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SAMPLE DATA INSERTION (OPTIONAL)
-- =====================================================
-- The following section for sample data insertion has been removed to prevent errors
-- related to the 'public.staff' table not existing or being inaccessible.
-- This section is optional and does not affect the core schema changes.

-- Grant necessary permissions (adjust as needed for your setup)
-- These might already exist in your current setup

COMMENT ON TABLE public.waitlists IS 'Stores customer waitlist entries for appointment slots';
COMMENT ON TABLE public.staff_availability IS 'Stores staff working hours and availability for specific dates';
COMMENT ON COLUMN public.appointments.type IS 'Distinguishes between CLIENT appointments and INTERNAL personal tasks';
COMMENT ON COLUMN public.appointments.description IS 'Additional notes/description for internal tasks';