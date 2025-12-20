-- Google Calendar Sync Tables Migration
-- This migration creates the necessary tables for Google Calendar integration

-- Table to store Google Calendar OAuth credentials
CREATE TABLE IF NOT EXISTS public.staff_google_calendar_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    google_calendar_id TEXT NOT NULL,
    access_token_encrypted TEXT NOT NULL,
    refresh_token_encrypted TEXT NOT NULL,
    token_expires_at TIMESTAMPTZ NOT NULL,
    calendar_sync_enabled BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(staff_id, google_calendar_id)
);

-- Table to track calendar event mappings
CREATE TABLE IF NOT EXISTS public.calendar_event_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    google_event_id TEXT NOT NULL,
    staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    sync_status TEXT DEFAULT 'active' CHECK (sync_status IN ('active', 'deleted', 'error')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(appointment_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_staff_google_calendar_integrations_staff_id
    ON public.staff_google_calendar_integrations(staff_id);
CREATE INDEX IF NOT EXISTS idx_calendar_event_mappings_appointment_id
    ON public.calendar_event_mappings(appointment_id);
CREATE INDEX IF NOT EXISTS idx_calendar_event_mappings_staff_id
    ON public.calendar_event_mappings(staff_id);
CREATE INDEX IF NOT EXISTS idx_calendar_event_mappings_google_event_id
    ON public.calendar_event_mappings(google_event_id);

-- Enable RLS
ALTER TABLE public.staff_google_calendar_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_event_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for staff_google_calendar_integrations
CREATE POLICY "Staff can manage own calendar integration"
ON public.staff_google_calendar_integrations FOR ALL
USING (staff_id = (auth.jwt() ->> 'staff_id')::UUID);

CREATE POLICY "Staff can read own calendar integration"
ON public.staff_google_calendar_integrations FOR SELECT
USING (staff_id = (auth.jwt() ->> 'staff_id')::UUID);

-- RLS Policies for calendar_event_mappings
CREATE POLICY "Staff can manage own event mappings"
ON public.calendar_event_mappings FOR ALL
USING (staff_id = (auth.jwt() ->> 'staff_id')::UUID);

CREATE POLICY "Staff can read own event mappings"
ON public.calendar_event_mappings FOR SELECT
USING (staff_id = (auth.jwt() ->> 'staff_id')::UUID);

-- Add updated_at triggers for new tables
CREATE TRIGGER update_staff_google_calendar_integrations_updated_at
BEFORE UPDATE ON public.staff_google_calendar_integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_calendar_event_mappings_updated_at
BEFORE UPDATE ON public.calendar_event_mappings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get staff's Google Calendar integration status
CREATE OR REPLACE FUNCTION public.get_staff_calendar_integration_status(p_staff_id UUID)
RETURNS TABLE(
    integration_exists BOOLEAN,
    calendar_id TEXT,
    sync_enabled BOOLEAN,
    last_sync_at TIMESTAMPTZ
) AS $$
DECLARE
    result RECORD;
BEGIN
    SELECT
        CASE WHEN EXISTS (
            SELECT 1 FROM public.staff_google_calendar_integrations
            WHERE staff_id = p_staff_id
        ) THEN true ELSE false END as integration_exists,
        gci.google_calendar_id,
        gci.calendar_sync_enabled,
        gci.last_sync_at
    INTO result
    FROM public.staff_google_calendar_integrations gci
    WHERE gci.staff_id = p_staff_id;
    
    IF result IS NULL THEN
        result := ROW(false, null, false, null);
    END IF;
    
    RETURN QUERY SELECT result.integration_exists, result.calendar_id, result.sync_enabled, result.last_sync_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete staff's Google Calendar integration
CREATE OR REPLACE FUNCTION public.delete_staff_calendar_integration(p_staff_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    integration_exists BOOLEAN := false;
BEGIN
    -- Check if integration exists
    IF EXISTS (SELECT 1 FROM public.staff_google_calendar_integrations WHERE staff_id = p_staff_id) THEN
        integration_exists := true;
        
        -- Delete calendar event mappings first (due to CASCADE)
        DELETE FROM public.calendar_event_mappings WHERE staff_id = p_staff_id;
        
        -- Delete the integration
        DELETE FROM public.staff_google_calendar_integrations WHERE staff_id = p_staff_id;
    END IF;
    
    RETURN integration_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT ALL ON public.staff_google_calendar_integrations TO authenticated;
GRANT ALL ON public.calendar_event_mappings TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_staff_calendar_integration_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_staff_calendar_integration(UUID) TO authenticated;