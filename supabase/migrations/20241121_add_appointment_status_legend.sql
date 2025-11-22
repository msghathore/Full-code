-- Phase 1: Database Schema for Appointment Status & Legend System
-- Migration: Add appointment status enum and boolean flags for attributes

-- Create enum for appointment statuses with specific visual colors
CREATE TYPE appointment_status AS ENUM (
    'REQUESTED',
    'ACCEPTED', 
    'CONFIRMED',
    'NO_SHOW',
    'READY_TO_START',
    'IN_PROGRESS',
    'COMPLETE',
    'PERSONAL_TASK'
);

-- Add new columns to appointments table
ALTER TABLE public.appointments 
ADD COLUMN status_type appointment_status DEFAULT 'REQUESTED',
ADD COLUMN is_recurring boolean DEFAULT false,
ADD COLUMN is_bundle boolean DEFAULT false,
ADD COLUMN is_house_call boolean DEFAULT false,
ADD COLUMN has_note boolean DEFAULT false,
ADD COLUMN form_required boolean DEFAULT false,
ADD COLUMN deposit_paid boolean DEFAULT false;

-- Create index for better performance on the new status column
CREATE INDEX idx_appointments_status_type ON public.appointments(status_type);

-- Update existing appointments to have appropriate status types
-- Map old status to new status_type
UPDATE public.appointments SET 
    status_type = CASE 
        WHEN status = 'confirmed' THEN 'CONFIRMED'::appointment_status
        WHEN status = 'arrived' THEN 'READY_TO_START'::appointment_status
        WHEN status = 'in-progress' THEN 'IN_PROGRESS'::appointment_status
        WHEN status = 'completed' THEN 'COMPLETE'::appointment_status
        WHEN status = 'cancelled' THEN 'REQUESTED'::appointment_status  -- Reuse requested for cancelled
        WHEN status = 'no-show' THEN 'NO_SHOW'::appointment_status
        ELSE 'REQUESTED'::appointment_status
    END;

-- Create a view that includes the new status information
CREATE OR REPLACE VIEW public.appointments_detailed_view AS
SELECT 
    a.id,
    a.appointment_date,
    a.appointment_time,
    a.status,
    a.status_type,
    a.total_amount,
    a.notes,
    a.is_recurring,
    a.is_bundle,
    a.is_house_call,
    a.has_note,
    a.form_required,
    a.deposit_paid,
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

-- Function to get appointment visual properties (color, icons)
CREATE OR REPLACE FUNCTION public.get_appointment_visual_properties(status_type appointment_status)
RETURNS JSON AS $$
DECLARE
    status_colors JSON := '{"REQUESTED": "#D1C4E9", "ACCEPTED": "#90CAF9", "CONFIRMED": "#EF9A9A", "NO_SHOW": "#D32F2F", "READY_TO_START": "#1976D2", "IN_PROGRESS": "#388E3C", "COMPLETE": "#4CAF50", "PERSONAL_TASK": "#D7CCC8"}'::json;
BEGIN
    RETURN json_build_object(
        'backgroundColor', status_colors->status_type,
        'status', status_type,
        'statusLabel', CASE status_type
            WHEN 'REQUESTED' THEN 'Requested'
            WHEN 'ACCEPTED' THEN 'Accepted'
            WHEN 'CONFIRMED' THEN 'Confirmed'
            WHEN 'NO_SHOW' THEN 'No Show'
            WHEN 'READY_TO_START' THEN 'Ready to Start'
            WHEN 'IN_PROGRESS' THEN 'In Progress'
            WHEN 'COMPLETE' THEN 'Complete'
            WHEN 'PERSONAL_TASK' THEN 'Personal Task'
            ELSE 'Unknown'
        END
    );
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies for the new columns (if needed)
-- The new columns should inherit the same RLS policies as the main appointments table
-- No additional RLS policies needed as they follow the same table-level security

-- Grant necessary permissions
GRANT SELECT, UPDATE ON public.appointments TO authenticated;
GRANT SELECT ON public.appointments_detailed_view TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_appointment_visual_properties(appointment_status) TO authenticated;

COMMENT ON TYPE appointment_status IS 'Visual status for appointments with specific color coding for calendar display';