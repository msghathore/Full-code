-- Verification script to check if migration columns exist
-- Run this in Supabase SQL Editor to verify the structure

SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'services'
AND table_schema = 'public'
ORDER BY ordinal_position;
