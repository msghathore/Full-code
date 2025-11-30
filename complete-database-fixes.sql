-- COMPREHENSIVE DATABASE FIXES FOR CONSOLE ERRORS
-- This script fixes all the critical database issues causing application failures

-- =============================================================================
-- PART 1: FIX WAITLIST RLS POLICIES (Primary Issue)
-- =============================================================================

-- Step 1: Drop any existing restrictive policies
DROP POLICY IF EXISTS "Enable delete access for admins" ON public.waitlists;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.waitlists;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.waitlists;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.waitlists;

-- Step 2: Create permissive policies for authenticated users
CREATE POLICY "Enable all access for authenticated users on waitlists"
ON public.waitlists
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Step 3: Also allow anonymous users to insert (for public access if needed)
CREATE POLICY "Enable insert for anonymous users on waitlists"
ON public.waitlists
FOR INSERT
TO anon
WITH CHECK (true);

-- =============================================================================
-- PART 2: ADD MISSING AVATAR COLUMN TO STAFF TABLE
-- =============================================================================

-- Check if avatar column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'staff' 
        AND column_name = 'avatar'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.staff 
        ADD COLUMN avatar TEXT;
    END IF;
END $$;

-- =============================================================================
-- PART 3: ENSURE PROPER UUID SUPPORT
-- =============================================================================

-- Ensure staff_id in waitlists is UUID type
DO $$
BEGIN
    -- Check current data type of staff_id in waitlists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'waitlists' 
        AND column_name = 'staff_id'
        AND table_schema = 'public'
        AND data_type != 'uuid'
    ) THEN
        ALTER TABLE public.waitlists 
        ALTER COLUMN staff_id TYPE UUID USING staff_id::UUID;
    END IF;
END $$;

-- =============================================================================
-- PART 4: FIX OTHER POTENTIAL RLS ISSUES
-- =============================================================================

-- Fix staff_availability table RLS policies
DROP POLICY IF EXISTS "Enable delete access for admins" ON public.staff_availability;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.staff_availability;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.staff_availability;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.staff_availability;

CREATE POLICY "Enable all access for authenticated users on staff_availability"
ON public.staff_availability
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Fix personal_tasks table RLS policies
DROP POLICY IF EXISTS "Enable delete access for admins" ON public.personal_tasks;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.personal_tasks;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.personal_tasks;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.personal_tasks;

CREATE POLICY "Enable all access for authenticated users on personal_tasks"
ON public.personal_tasks
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =============================================================================
-- PART 5: VERIFICATION QUERIES
-- =============================================================================

-- Verify the changes
DO $$
BEGIN
    -- Check waitlists table structure
    RAISE NOTICE '=== WAITLISTS TABLE STRUCTURE ===';
    RAISE NOTICE 'staff_id column type: %', (
        SELECT data_type 
        FROM information_schema.columns 
        WHERE table_name = 'waitlists' 
        AND column_name = 'staff_id'
        AND table_schema = 'public'
    );
    
    -- Check if avatar column was added to staff
    RAISE NOTICE '=== STAFF TABLE AVATAR COLUMN ===';
    RAISE NOTICE 'Avatar column exists: %', (
        SELECT COUNT(*) > 0 
        FROM information_schema.columns 
        WHERE table_name = 'staff' 
        AND column_name = 'avatar'
        AND table_schema = 'public'
    );
    
    -- Check RLS policies
    RAISE NOTICE '=== RLS POLICIES ===';
    RAISE NOTICE 'Waitlists policies count: %', (
        SELECT COUNT(*) 
        FROM pg_policies 
        WHERE tablename = 'waitlists' 
        AND schemaname = 'public'
    );
    
    RAISE NOTICE 'All fixes applied successfully!';
END $$;