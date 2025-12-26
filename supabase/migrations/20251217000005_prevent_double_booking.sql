-- Migration: Prevent Double Booking
-- Adds a unique constraint to prevent duplicate appointments for the same staff member at the same time

-- First, check for and clean up any existing duplicate appointments
-- This query identifies duplicates but does NOT delete them automatically
-- Manual review recommended before applying constraint

-- View duplicates (for reference):
-- SELECT staff_id, appointment_date, appointment_time, COUNT(*) as count
-- FROM public.appointments
-- WHERE status != 'cancelled'
-- GROUP BY staff_id, appointment_date, appointment_time
-- HAVING COUNT(*) > 1;

-- Add partial unique index to prevent double bookings
-- This allows multiple cancelled appointments for the same time slot
-- But prevents duplicate active bookings
CREATE UNIQUE INDEX IF NOT EXISTS unique_staff_appointment_slot
ON public.appointments (staff_id, appointment_date, appointment_time)
WHERE status != 'cancelled';

-- Add comment explaining the constraint
COMMENT ON INDEX unique_staff_appointment_slot IS 'Prevents double booking: ensures each staff member can only have one active appointment per time slot. Cancelled appointments are excluded from this constraint.';
