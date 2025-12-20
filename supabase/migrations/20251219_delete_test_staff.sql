-- Delete test/inappropriate staff entries from the database
-- Run this in Supabase SQL Editor

-- Delete by email and name patterns
DELETE FROM public.staff
WHERE email = 'ssimardeep84@gmail.com'
   OR name ILIKE '%bbc big black%'
   OR name ILIKE '%monu lalu%'
   OR specialty ILIKE '%testing%';

-- Fix name capitalization for micky Chen -> Micky Chen
UPDATE public.staff
SET first_name = 'Micky'
WHERE first_name ILIKE 'micky';

-- Verify deletion - this should return empty if successful
SELECT id, first_name, last_name, name, email, specialty
FROM public.staff
WHERE email = 'ssimardeep84@gmail.com'
   OR name ILIKE '%bbc%'
   OR name ILIKE '%monu%'
   OR specialty ILIKE '%testing%';
