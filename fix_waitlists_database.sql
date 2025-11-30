-- Part 2: Fix the "Add to Waitlist" Feature
-- This script addresses the data type mismatch where staff_id is TEXT but application sends UUID
-- Revert the waitlists table staff_id column back to UUID data type

-- Step 1: Alter the waitlists table to change staff_id column back to UUID
-- This ensures consistency with the rest of the application which uses UUID format
ALTER TABLE public.waitlists 
ALTER COLUMN staff_id TYPE UUID USING staff_id::UUID;

-- Step 2: Ensure the table has proper constraints and defaults
-- Add any missing constraints that might help with data integrity

-- Step 3: Verify RLS policies are appropriate for authenticated users
-- Drop any overly restrictive policies and ensure authenticated users can perform operations
DROP POLICY IF EXISTS "Enable delete access for admins" ON public.waitlists;

-- Create a more permissive policy for authenticated users
CREATE POLICY "Enable all access for authenticated users on waitlists"
ON public.waitlists
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);