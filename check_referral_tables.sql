-- Check if referral tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('referral_programs', 'referrals');

-- Check referral_programs columns
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'referral_programs'
ORDER BY ordinal_position;

-- Check referrals columns  
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'referrals'
ORDER BY ordinal_position;
