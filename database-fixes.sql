-- Zavira Salon Booking System Database Fixes
-- Run these commands in your Supabase SQL editor

-- Create staff table
CREATE TABLE staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Staff are viewable by everyone" ON staff
  FOR SELECT USING (is_active = true);

-- Add missing fields to appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES staff(id),
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS location TEXT;

-- Insert sample staff data
INSERT INTO staff (name, specialty) VALUES
('Sarah Johnson', 'Hair Stylist'),
('Michael Chen', 'Nail Technician'), 
('Emma Williams', 'Skin Specialist'),
('David Martinez', 'Massage Therapist'),
('Lisa Anderson', 'Hair Color Specialist'),
('James Wilson', 'Barber & Stylist'),
('Amanda Davis', 'Esthetician'),
('Robert Taylor', 'Massage Therapist');

-- Update existing appointments that might be missing required fields
-- (This is safe and won't affect existing data)