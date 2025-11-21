# URGENT: Fix Database Schema Error

## Error: "email column not found" when booking

### Solution - Run This SQL in Supabase:

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `stppkvkcjsyusxwtbaej`

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New query"

3. **Paste and Run This SQL:**
```sql
-- Add missing columns to appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES staff(id),
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS location TEXT;
```

4. **Click "Run" to execute**

5. **Verify the columns exist:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'appointments';
```

## OR Alternative Quick Fix:

If you want the **fastest** solution, just add the email column:
```sql
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS email TEXT;
```

### After running this SQL:
- Refresh your booking page
- Try booking again
- The "email column not found" error will be gone

### Why This Happened:
The booking code tries to insert customer email but the database table was missing the email column.

## Status After Fix:
- ✅ Database schema corrected
- ✅ Booking will work
- ✅ Google Calendar API still separate issue (not needed for basic booking)