-- Add reminder tracking to appointments table
-- This column tracks whether the 24-hour reminder email has been sent

-- Add reminder_sent column if it doesn't exist
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN appointments.reminder_sent IS 'Tracks whether 24-hour reminder email has been sent to customer';

-- Create index for efficient reminder queries
-- This index helps the send-appointment-reminders function find relevant appointments quickly
CREATE INDEX IF NOT EXISTS idx_appointments_reminder_lookup
ON appointments(appointment_date, status, reminder_sent)
WHERE status IN ('confirmed', 'accepted') AND reminder_sent = FALSE;

COMMENT ON INDEX idx_appointments_reminder_lookup IS 'Optimizes queries for finding appointments that need reminders';

-- Add index for appointment status changes (for status change notifications)
CREATE INDEX IF NOT EXISTS idx_appointments_status_tracking
ON appointments(id, status, updated_at);

COMMENT ON INDEX idx_appointments_status_tracking IS 'Helps track appointment status changes for notifications';
