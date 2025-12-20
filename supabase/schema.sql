-- Staff Scheduling System Database Schema
-- This file contains all the necessary tables, views, and functions for the staff scheduling system

-- Drop existing tables if they exist (for development purposes)
-- In production, use migrations instead of DROP statements

-- Staff table
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'senior', 'junior')),
    specialty VARCHAR(255),
    avatar_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'busy', 'break', 'offline')),
    access_level VARCHAR(50) NOT NULL DEFAULT 'basic' CHECK (access_level IN ('full', 'limited', 'basic', 'admin', 'manager')),
    color VARCHAR(50) NOT NULL DEFAULT 'blue',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Services table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL, -- Duration in minutes
    price DECIMAL(10, 2) NOT NULL,
    color VARCHAR(50) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Customers table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'arrived', 'in-progress', 'completed', 'cancelled', 'no-show')),
    total_amount DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('card', 'cash', 'online')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    stripe_payment_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inventory table
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    current_stock INTEGER NOT NULL DEFAULT 0,
    min_stock_level INTEGER NOT NULL DEFAULT 0,
    max_stock_level INTEGER NOT NULL DEFAULT 100,
    unit_cost DECIMAL(10, 2) NOT NULL,
    supplier VARCHAR(255),
    last_restocked DATE,
    expiration_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'in-stock' CHECK (status IN ('in-stock', 'low-stock', 'out-of-stock', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inventory transactions table (for tracking changes)
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID NOT NULL REFERENCES public.inventory(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('restock', 'usage', 'adjustment')),
    quantity INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Appointments services junction table (in case a service can include sub-services)
CREATE TABLE IF NOT EXISTS public.appointments_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(appointment_id, service_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_staff ON public.appointments(staff_id);
CREATE INDEX IF NOT EXISTS idx_appointments_customer ON public.appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON public.inventory(category);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON public.inventory(status);

-- Create views for common queries

-- View for appointments with customer and staff details
CREATE OR REPLACE VIEW public.appointments_view AS
SELECT 
    a.id,
    a.appointment_date,
    a.appointment_time,
    a.status,
    a.total_amount,
    a.notes,
    c.id AS customer_id,
    c.first_name AS customer_first_name,
    c.last_name AS customer_last_name,
    c.email AS customer_email,
    c.phone AS customer_phone,
    s.id AS staff_id,
    s.first_name AS staff_first_name,
    s.last_name AS staff_last_name,
    s.role AS staff_role,
    svc.id AS service_id,
    svc.name AS service_name,
    svc.duration AS service_duration,
    svc.price AS service_price,
    a.created_at,
    a.updated_at
FROM public.appointments a
JOIN public.customers c ON a.customer_id = c.id
JOIN public.staff s ON a.staff_id = s.id
JOIN public.services svc ON a.service_id = svc.id;
-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating updated_at columns
CREATE TRIGGER update_staff_updated_at 
BEFORE UPDATE ON public.staff
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at 
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at 
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at 
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at 
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at 
BEFORE UPDATE ON public.inventory
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- RLS (Row Level Security) Policies

-- Enable RLS on all tables
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments_services ENABLE ROW LEVEL SECURITY;

-- Staff policies
CREATE POLICY "Enable read access for authenticated users" ON public.staff
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable update access for admins" ON public.staff
    FOR UPDATE
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Enable insert access for admins" ON public.staff
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Enable delete access for admins" ON public.staff
    FOR DELETE
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

-- Services policies
CREATE POLICY "Enable read access for authenticated users" ON public.services
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable update access for admins" ON public.services
    FOR UPDATE
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Enable insert access for admins" ON public.services
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Enable delete access for admins" ON public.services
    FOR DELETE
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

-- Customers policies
CREATE POLICY "Enable read access for authenticated users" ON public.customers
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable update access for authenticated users" ON public.customers
    FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.customers
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Appointments policies
CREATE POLICY "Enable read access for authenticated users" ON public.appointments
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable update access for authenticated users" ON public.appointments
    FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.appointments
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable delete access for admins" ON public.appointments
    FOR DELETE
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

-- Payments policies
CREATE POLICY "Enable read access for authenticated users" ON public.payments
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable update access for admins" ON public.payments
    FOR UPDATE
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Enable insert access for admins" ON public.payments
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Inventory policies
CREATE POLICY "Enable read access for authenticated users" ON public.inventory
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable update access for authenticated users" ON public.inventory
    FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert access for admins" ON public.inventory
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Enable delete access for admins" ON public.inventory
    FOR DELETE
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

-- Inventory transactions policies
CREATE POLICY "Enable read access for authenticated users" ON public.inventory_transactions
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.inventory_transactions
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Appointments_services policies
CREATE POLICY "Enable read access for authenticated users" ON public.appointments_services
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.appointments_services
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Functions for common operations

-- Function to check for appointment conflicts
CREATE OR REPLACE FUNCTION public.check_appointment_conflict(
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

-- Function to get available time slots for a staff member on a specific date
CREATE OR REPLACE FUNCTION public.get_available_time_slots(
    p_staff_id UUID,
    p_appointment_date DATE,
    p_start_time TIME DEFAULT '08:00:00',
    p_end_time TIME DEFAULT '18:00:00',
    p_interval_minutes INTEGER DEFAULT 30
)
RETURNS TABLE(time_slot TIME) AS $$
DECLARE
    slot_time TIME;
BEGIN
    -- Create a temporary table for all possible time slots
    CREATE TEMP TABLE IF NOT EXISTS all_time_slots (time_slot TIME);
    DELETE FROM all_time_slots;
    
    -- Generate all possible time slots
    slot_time := p_start_time;
    WHILE slot_time <= p_end_time LOOP
        INSERT INTO all_time_slots (time_slot) VALUES (slot_time);
        slot_time := slot_time + (p_interval_minutes || ' minutes')::INTERVAL;
    END LOOP;
    
    -- Return only available slots
    RETURN QUERY
    SELECT a.time_slot
    FROM all_time_slots a
    WHERE NOT EXISTS (
        SELECT 1 
        FROM public.appointments 
        WHERE staff_id = p_staff_id
        AND appointment_date = p_appointment_date
        AND appointment_time = a.time_slot
        AND status NOT IN ('cancelled', 'no-show')
    )
    ORDER BY a.time_slot;
    
    DROP TABLE IF EXISTS all_time_slots;
END;
$$ LANGUAGE plpgsql;

-- Function to create a new appointment with validation
CREATE OR REPLACE FUNCTION public.create_appointment(
    p_customer_id UUID,
    p_staff_id UUID,
    p_service_id UUID,
    p_appointment_date DATE,
    p_appointment_time TIME,
    p_total_amount DECIMAL,
    p_notes TEXT DEFAULT NULL,
    p_create_customer_if_not_exists BOOLEAN DEFAULT false
)
RETURNS UUID AS $$
DECLARE
    customer_uuid UUID;
    appointment_uuid UUID;
    conflict_check BOOLEAN;
    service_duration INTEGER;
BEGIN
    -- Check if customer exists or should be created
    IF p_create_customer_if_not_exists THEN
        SELECT id INTO customer_uuid FROM public.customers WHERE id = p_customer_id;
        
        IF customer_uuid IS NULL THEN
            -- If customer doesn't exist, we'll use the provided ID
            -- (assuming it's a new UUID generated on the client side)
            customer_uuid := p_customer_id;
            
            INSERT INTO public.customers (id, first_name, last_name, email, phone)
            VALUES (
                customer_uuid,
                'New',
                'Customer',
                'customer@example.com',
                '000-000-0000'
            );
        END IF;
    ELSE
        customer_uuid := p_customer_id;
        
        -- Verify customer exists
        IF NOT EXISTS (SELECT 1 FROM public.customers WHERE id = customer_uuid) THEN
            RAISE EXCEPTION 'Customer does not exist';
        END IF;
    END IF;
    
    -- Check for conflicts
    SELECT public.check_appointment_conflict(p_staff_id, p_appointment_date, p_appointment_time)
    INTO conflict_check;
    
    IF conflict_check THEN
        RAISE EXCEPTION 'Time slot conflict: Staff member is already booked at this time';
    END IF;
    
    -- Get service duration
    SELECT duration INTO service_duration FROM public.services WHERE id = p_service_id;
    
    IF service_duration IS NULL THEN
        RAISE EXCEPTION 'Service does not exist';
    END IF;
    
    -- Create appointment
    INSERT INTO public.appointments (
        customer_id,
        staff_id,
        service_id,
        appointment_date,
        appointment_time,
        total_amount,
        notes
    )
    VALUES (
        customer_uuid,
        p_staff_id,
        p_service_id,
        p_appointment_date,
        p_appointment_time,
        p_total_amount,
        p_notes
    )
    RETURNING id INTO appointment_uuid;
    
    -- Create appointment-service relationship
    INSERT INTO public.appointments_services (appointment_id, service_id, quantity, price)
    VALUES (appointment_uuid, p_service_id, 1, p_total_amount);
    
    RETURN appointment_uuid;
END;
$$ LANGUAGE plpgsql;