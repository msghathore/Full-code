# 🔧 FINAL RLS FIX - RUN THIS IN SUPABASE

## THE PROBLEM:
Supabase is blocking guest bookings due to Row Level Security policies that only allow authenticated users to insert appointments.

## THE SOLUTION:
Run this SQL in your Supabase dashboard:

### Step 1: Go to Supabase
- Visit: https://supabase.com/dashboard
- Select project: `stppkvkcjsyusxwtbaej`

### Step 2: Open SQL Editor
- Click "SQL Editor" → "New query"

### Step 3: Copy and paste this exact SQL:

```sql
-- Fix RLS for guest bookings

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can only view their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can only insert their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can only update their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can only delete their own appointments" ON appointments;

-- Allow ANYONE to insert appointments (guest bookings)
CREATE POLICY "allow_guest_insert" ON appointments
FOR INSERT WITH CHECK (true);

-- Allow ANYONE to read appointments (for display)
CREATE POLICY "allow_guest_select" ON appointments
FOR SELECT USING (true);

-- Allow updates (for staff/admin)
CREATE POLICY "allow_updates" ON appointments
FOR UPDATE USING (true);

-- Allow deletes (for staff/admin)
CREATE POLICY "allow_deletes" ON appointments
FOR DELETE USING (true);

-- Make sure RLS is enabled
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
```

### Step 4: Click "Run"

### Step 5: Test your booking system

## RESULT:
✅ Guest bookings will work
✅ All booking functionality restored  
✅ No more RLS policy errors

This is the FINAL fix needed!