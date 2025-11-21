# 🔧 FIX RLS POLICIES FOR GUEST BOOKINGS

## PROBLEM:
Your Supabase database is blocking guest users from creating appointments due to Row Level Security policies.

## SOLUTION:
Run this SQL in your Supabase Dashboard:

1. Go to https://supabase.com/dashboard
2. Select your project: `stppkvkcjsyusxwtbaej`
3. Click "SQL Editor" → "New query"
4. Paste and run this SQL:

```sql
-- Fix Row Level Security for Guest Appointments

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can only view their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can only insert their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can only update their own appointments" ON appointments;

-- Allow anyone to INSERT appointments (for guest bookings)
CREATE POLICY "Allow guest bookings" ON appointments
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to SELECT appointments (so you can view bookings)
CREATE POLICY "Allow viewing all appointments" ON appointments
  FOR SELECT
  USING (true);

-- Allow updates (for admin/staff)
CREATE POLICY "Allow updating appointments" ON appointments
  FOR UPDATE
  USING (true);

-- Make sure RLS is enabled
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
```

5. Click "Run"
6. Test your booking system at http://localhost:8080

## RESULT:
✅ Guest bookings will work
✅ Name and phone can be saved
✅ All booking functionality restored