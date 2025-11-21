-- =====================================================
-- CHECK YOUR CURRENT DATABASE STRUCTURE
-- =====================================================

-- Check what tables you currently have
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check the structure of your staff-related table (if it exists)
-- If you find your staff table, replace 'your_staff_table_name' below
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'your_staff_table_name' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Alternative: Check if you have an appointments table and see its structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'appointments' 
AND table_schema = 'public'
ORDER BY ordinal_position;