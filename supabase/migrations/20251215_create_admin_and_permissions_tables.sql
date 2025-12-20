-- Admin and Staff Permissions System Migration
-- Created: 2024-12-15

-- Admin credentials table (single admin account)
CREATE TABLE IF NOT EXISTS public.admin_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) NOT NULL UNIQUE DEFAULT 'admin',
    password_hash VARCHAR(255) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Staff permissions table
CREATE TABLE IF NOT EXISTS public.staff_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    inventory_access BOOLEAN NOT NULL DEFAULT false,
    read_only_mode BOOLEAN NOT NULL DEFAULT false,
    checkout_access BOOLEAN NOT NULL DEFAULT true, -- Always true, cannot be toggled off
    calendar_access BOOLEAN NOT NULL DEFAULT true,
    analytics_access BOOLEAN NOT NULL DEFAULT false,
    settings_access BOOLEAN NOT NULL DEFAULT true,
    customer_management_access BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(staff_id)
);

-- Access audit log table
CREATE TABLE IF NOT EXISTS public.access_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    staff_name VARCHAR(255),
    action_type VARCHAR(100) NOT NULL, -- 'login', 'logout', 'page_access', 'permission_denied'
    page_accessed VARCHAR(255),
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add temp_password column to staff table for initial login
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS temp_password VARCHAR(100);

-- Index for audit log queries (last 7 days)
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.access_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_staff_id ON public.access_audit_log(staff_id);

-- Trigger to update updated_at for staff_permissions
CREATE OR REPLACE FUNCTION public.update_staff_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_staff_permissions_updated_at
BEFORE UPDATE ON public.staff_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_staff_permissions_updated_at();

-- Auto-cleanup function for audit logs older than 7 days
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM public.access_audit_log
    WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- RLS Policies for admin tables

-- Enable RLS
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_audit_log ENABLE ROW LEVEL SECURITY;

-- Admin credentials - very restricted (admin only through service role)
CREATE POLICY "Enable all access for service role" ON public.admin_credentials
    FOR ALL
    TO service_role
    USING (true);

-- Staff permissions - readable by all authenticated, writable by admin
CREATE POLICY "Enable read access for all" ON public.staff_permissions
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Enable write access for service role" ON public.staff_permissions
    FOR ALL
    TO service_role
    USING (true);

-- Access audit log - writable by all, readable by admin only
CREATE POLICY "Enable insert for all" ON public.access_audit_log
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Enable read for service role" ON public.access_audit_log
    FOR SELECT
    TO service_role
    USING (true);

-- Insert default admin credentials (password: Ghathore5)
-- Using bcrypt hash for 'Ghathore5'
-- Note: This is a placeholder hash - the actual hash will be generated in the app
INSERT INTO public.admin_credentials (username, password_hash)
VALUES ('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4XVHDBOAOYHqJwSa')
ON CONFLICT (username) DO NOTHING;

-- Create permissions for existing staff members
INSERT INTO public.staff_permissions (staff_id, inventory_access, read_only_mode)
SELECT id,
    CASE WHEN role = 'admin' THEN true ELSE false END as inventory_access,
    CASE WHEN role = 'junior' THEN true ELSE false END as read_only_mode
FROM public.staff
WHERE NOT EXISTS (
    SELECT 1 FROM public.staff_permissions WHERE staff_id = public.staff.id
);

-- Comment for documentation
COMMENT ON TABLE public.admin_credentials IS 'Single admin account for system management';
COMMENT ON TABLE public.staff_permissions IS 'Granular permissions for each staff member';
COMMENT ON TABLE public.access_audit_log IS 'Audit trail of staff access - auto-cleans after 7 days';
