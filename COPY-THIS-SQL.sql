-- Fix RLS for guest bookings - COPY THIS EXACT SQL:

CREATE POLICY "allow_guest_insert" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_guest_select" ON appointments FOR SELECT USING (true);
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;