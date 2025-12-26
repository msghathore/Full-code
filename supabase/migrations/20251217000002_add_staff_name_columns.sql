-- Add first_name and last_name columns to staff table
-- Split existing 'name' into first_name and last_name

-- Add new columns
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS password_salt TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'junior';
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'available';
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS access_level TEXT DEFAULT 'basic';
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS color TEXT DEFAULT 'blue';
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS avatar TEXT;

-- Split existing 'name' field into first_name and last_name
UPDATE public.staff
SET
  first_name = COALESCE(SPLIT_PART(name, ' ', 1), name),
  last_name = CASE
    WHEN SPLIT_PART(name, ' ', 2) != '' THEN SPLIT_PART(name, ' ', 2)
    ELSE ''
  END,
  username = COALESCE(username, LOWER(SPLIT_PART(name, ' ', 1)))
WHERE first_name IS NULL;

-- Make first_name required after migration
ALTER TABLE public.staff ALTER COLUMN first_name SET NOT NULL;
