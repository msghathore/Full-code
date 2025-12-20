-- Add password_salt column to staff table
ALTER TABLE public.staff
  ADD COLUMN IF NOT EXISTS password_salt VARCHAR(255);

-- Add comment explaining the security model
COMMENT ON COLUMN public.staff.password_hash IS 'PBKDF2-SHA256 hashed password';
COMMENT ON COLUMN public.staff.password_salt IS 'Random salt for password hashing (32 chars hex)';
COMMENT ON COLUMN public.staff.temp_password IS 'Plain text temporary password for first login only';

-- Note: Existing passwords will need re-hashing
-- Staff with plain passwords will use legacy fallback until password reset
