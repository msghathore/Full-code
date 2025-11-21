-- Fix Row Level Security for Guest Appointments
-- Run this in your Supabase SQL Editor

-- First, let's see the current policies
SELECT * FROM pg_policies WHERE tablename = 'appointments';

-- Drop existing restrictive policies (if any)
DROP POLICY IF EXISTS "Users can only view their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can only insert their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can only update their own appointments" ON appointments;

-- Create NEW policies that allow guest bookings

-- Policy 1: Allow anyone to INSERT appointments (for guest bookings)
CREATE POLICY "Allow guest bookings" ON appointments
  FOR INSERT
  WITH CHECK (true);

-- Policy 2: Allow anyone to SELECT appointments (so you can view bookings)
CREATE POLICY "Allow viewing all appointments" ON appointments
  FOR SELECT
  USING (true);

-- Policy 3: Allow updates (for admin/staff)
CREATE POLICY "Allow updating appointments" ON appointments
  FOR UPDATE
  USING (true);

-- Make sure RLS is enabled on appointments table
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Also check and fix staff table if needed
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Create policy for staff table (public read access)
DROP POLICY IF EXISTS "Staff are viewable by everyone" ON staff;
CREATE POLICY "Allow public read access to staff" ON staff
  FOR SELECT
  USING (is_active = true);

-- Make sure services table allows public read
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Create policy for services table (public read access)
DROP POLICY IF EXISTS "Services are viewable by everyone" ON services;
CREATE POLICY "Allow public read access to services" ON services
  FOR SELECT
  USING (is_active = true);