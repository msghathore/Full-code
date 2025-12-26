-- Fix: Drop the loyalty points trigger that causes errors when updating appointment status to 'completed'
-- The trigger tries to insert into loyalty_transactions with a null user_id for walk-in customers,
-- which violates the NOT NULL constraint on user_id.

-- Drop the trigger if it exists (the trigger name may vary, try common patterns)
DROP TRIGGER IF EXISTS award_loyalty_points_on_appointment_completed ON appointments;
DROP TRIGGER IF EXISTS loyalty_points_on_appointment_complete ON appointments;
DROP TRIGGER IF EXISTS add_loyalty_points_on_completion ON appointments;
DROP TRIGGER IF EXISTS appointment_completed_loyalty_trigger ON appointments;

-- Also drop the associated function if it exists
DROP FUNCTION IF EXISTS award_appointment_loyalty_points() CASCADE;
DROP FUNCTION IF EXISTS handle_appointment_completion() CASCADE;
DROP FUNCTION IF EXISTS add_loyalty_points_for_appointment() CASCADE;

-- If loyalty points need to be awarded, it should be done explicitly in the application code
-- after verifying the customer has a valid user_id, not automatically via trigger
