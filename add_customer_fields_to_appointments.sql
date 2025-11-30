-- Add missing customer fields to appointments table
-- These fields are needed for the appointment creation form

ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add comment to explain the columns
COMMENT ON COLUMN public.appointments.full_name IS 'Customer full name for appointments';
COMMENT ON COLUMN public.appointments.email IS 'Customer email address';
COMMENT ON COLUMN public.appointments.phone IS 'Customer phone number';