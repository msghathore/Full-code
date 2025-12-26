-- Add late arrival tracking and additional appointment lifecycle fields
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS late_arrival_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS arrived_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS no_show_reason TEXT,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS rescheduled_from_id UUID REFERENCES appointments(id),
ADD COLUMN IF NOT EXISTS rescheduled_to_id UUID REFERENCES appointments(id);

-- Create index for analytics on late arrivals
CREATE INDEX IF NOT EXISTS idx_appointments_late_arrivals
ON appointments(late_arrival_minutes)
WHERE late_arrival_minutes > 0;

-- Create index for cancellations
CREATE INDEX IF NOT EXISTS idx_appointments_cancellations
ON appointments(cancelled_at)
WHERE cancelled_at IS NOT NULL;

-- Create index for reschedule chains
CREATE INDEX IF NOT EXISTS idx_appointments_rescheduled_from
ON appointments(rescheduled_from_id);

CREATE INDEX IF NOT EXISTS idx_appointments_rescheduled_to
ON appointments(rescheduled_to_id);

-- Add constraint: can't be late if no-show or cancelled
ALTER TABLE appointments
DROP CONSTRAINT IF EXISTS check_late_arrival_valid;

ALTER TABLE appointments
ADD CONSTRAINT check_late_arrival_valid
CHECK (
  (status NOT IN ('NO_SHOW', 'CANCELLED') OR late_arrival_minutes = 0)
);

-- Function to mark appointment as arrived
CREATE OR REPLACE FUNCTION mark_appointment_arrived(
  p_appointment_id UUID,
  p_minutes_late INTEGER DEFAULT 0
)
RETURNS JSON AS $$
DECLARE
  v_appointment RECORD;
  v_new_status TEXT;
BEGIN
  -- Get the appointment
  SELECT * INTO v_appointment
  FROM appointments
  WHERE id = p_appointment_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Appointment not found'
    );
  END IF;

  -- Determine new status based on lateness
  IF p_minutes_late > 15 THEN
    v_new_status := 'IN_PROGRESS'; -- If very late, start service immediately
  ELSE
    v_new_status := 'READY_TO_START'; -- Ready to begin
  END IF;

  -- Update the appointment
  UPDATE appointments
  SET
    arrived_at = NOW(),
    late_arrival_minutes = p_minutes_late,
    status = v_new_status,
    updated_at = NOW()
  WHERE id = p_appointment_id;

  RETURN json_build_object(
    'success', true,
    'appointment_id', p_appointment_id,
    'arrived_at', NOW(),
    'minutes_late', p_minutes_late,
    'new_status', v_new_status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cancel appointment with reason
CREATE OR REPLACE FUNCTION cancel_appointment(
  p_appointment_id UUID,
  p_cancellation_reason TEXT DEFAULT NULL,
  p_cancelled_by TEXT DEFAULT 'customer'
)
RETURNS JSON AS $$
DECLARE
  v_appointment RECORD;
BEGIN
  -- Get the appointment
  SELECT * INTO v_appointment
  FROM appointments
  WHERE id = p_appointment_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Appointment not found'
    );
  END IF;

  -- Check if already cancelled
  IF v_appointment.status = 'CANCELLED' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Appointment is already cancelled'
    );
  END IF;

  -- Check if already completed
  IF v_appointment.status IN ('COMPLETE', 'NO_SHOW') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Cannot cancel completed or no-show appointments'
    );
  END IF;

  -- Cancel the appointment
  UPDATE appointments
  SET
    status = 'CANCELLED',
    cancelled_at = NOW(),
    cancellation_reason = p_cancellation_reason,
    updated_at = NOW()
  WHERE id = p_appointment_id;

  RETURN json_build_object(
    'success', true,
    'appointment_id', p_appointment_id,
    'cancelled_at', NOW(),
    'cancelled_by', p_cancelled_by
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create rescheduled appointment
CREATE OR REPLACE FUNCTION reschedule_appointment(
  p_original_appointment_id UUID,
  p_new_date DATE,
  p_new_time TIME,
  p_new_staff_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_original RECORD;
  v_new_appointment_id UUID;
  v_staff_id UUID;
BEGIN
  -- Get original appointment
  SELECT * INTO v_original
  FROM appointments
  WHERE id = p_original_appointment_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Original appointment not found'
    );
  END IF;

  -- Check if can be rescheduled
  IF v_original.status IN ('CANCELLED', 'COMPLETE', 'NO_SHOW') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Cannot reschedule cancelled, completed, or no-show appointments'
    );
  END IF;

  -- Use new staff if provided, otherwise keep original
  v_staff_id := COALESCE(p_new_staff_id, v_original.staff_id);

  -- Create new appointment
  INSERT INTO appointments (
    appointment_date,
    appointment_time,
    service_id,
    staff_id,
    user_id,
    full_name,
    email,
    phone,
    notes,
    total_amount,
    deposit_amount,
    payment_status,
    status,
    rescheduled_from_id
  ) VALUES (
    p_new_date,
    p_new_time,
    v_original.service_id,
    v_staff_id,
    v_original.user_id,
    v_original.full_name,
    v_original.email,
    v_original.phone,
    'Rescheduled from ' || v_original.appointment_date || ' ' || v_original.appointment_time || COALESCE('. ' || v_original.notes, ''),
    v_original.total_amount,
    v_original.deposit_amount,
    v_original.payment_status,
    'REQUESTED',
    p_original_appointment_id
  ) RETURNING id INTO v_new_appointment_id;

  -- Update original appointment to show it was rescheduled
  UPDATE appointments
  SET
    status = 'CANCELLED',
    cancelled_at = NOW(),
    cancellation_reason = 'Rescheduled to ' || p_new_date || ' ' || p_new_time,
    rescheduled_to_id = v_new_appointment_id,
    updated_at = NOW()
  WHERE id = p_original_appointment_id;

  RETURN json_build_object(
    'success', true,
    'original_appointment_id', p_original_appointment_id,
    'new_appointment_id', v_new_appointment_id,
    'new_date', p_new_date,
    'new_time', p_new_time
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for appointment analytics including late arrivals
CREATE OR REPLACE VIEW appointment_analytics AS
SELECT
  DATE_TRUNC('day', appointment_date::timestamp) as date,
  COUNT(*) as total_appointments,
  COUNT(*) FILTER (WHERE status = 'COMPLETE') as completed,
  COUNT(*) FILTER (WHERE status = 'CANCELLED') as cancelled,
  COUNT(*) FILTER (WHERE status = 'NO_SHOW') as no_shows,
  COUNT(*) FILTER (WHERE late_arrival_minutes > 0) as late_arrivals,
  AVG(late_arrival_minutes) FILTER (WHERE late_arrival_minutes > 0) as avg_late_minutes,
  COUNT(*) FILTER (WHERE late_arrival_minutes > 15) as very_late_arrivals,
  SUM(total_amount) FILTER (WHERE status = 'COMPLETE') as revenue
FROM appointments
GROUP BY DATE_TRUNC('day', appointment_date::timestamp)
ORDER BY date DESC;

COMMENT ON VIEW appointment_analytics IS 'Daily appointment statistics including late arrival metrics';
