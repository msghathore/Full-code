-- Create appointment management tokens table for self-service cancellation/rescheduling
CREATE TABLE IF NOT EXISTS appointment_management_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  action_type TEXT CHECK (action_type IN ('cancel', 'reschedule', 'view')),
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for efficient lookups
CREATE INDEX idx_tokens_appointment ON appointment_management_tokens(appointment_id);
CREATE INDEX idx_tokens_token ON appointment_management_tokens(token);
CREATE INDEX idx_tokens_expires ON appointment_management_tokens(expires_at);

-- Function to generate secure tokens
CREATE OR REPLACE FUNCTION generate_appointment_token(
  p_appointment_id UUID,
  p_action_type TEXT,
  p_validity_hours INTEGER DEFAULT 72
)
RETURNS TEXT AS $$
DECLARE
  v_token TEXT;
BEGIN
  -- Generate a secure random token
  v_token := encode(gen_random_bytes(32), 'base64');
  -- Remove URL-unsafe characters
  v_token := replace(replace(replace(v_token, '/', '_'), '+', '-'), '=', '');

  -- Insert the token
  INSERT INTO appointment_management_tokens (
    appointment_id,
    token,
    action_type,
    expires_at
  ) VALUES (
    p_appointment_id,
    v_token,
    p_action_type,
    NOW() + (p_validity_hours || ' hours')::INTERVAL
  );

  RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify and get appointment by token
CREATE OR REPLACE FUNCTION verify_appointment_token(
  p_token TEXT,
  p_action_type TEXT
)
RETURNS TABLE (
  appointment_id UUID,
  is_valid BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  v_token_record RECORD;
  v_appointment_record RECORD;
BEGIN
  -- Find the token
  SELECT * INTO v_token_record
  FROM appointment_management_tokens
  WHERE token = p_token
    AND action_type = p_action_type;

  -- Check if token exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, FALSE, 'Invalid token';
    RETURN;
  END IF;

  -- Check if token has already been used
  IF v_token_record.used_at IS NOT NULL THEN
    RETURN QUERY SELECT NULL::UUID, FALSE, 'Token already used';
    RETURN;
  END IF;

  -- Check if token has expired
  IF v_token_record.expires_at < NOW() THEN
    RETURN QUERY SELECT NULL::UUID, FALSE, 'Token has expired';
    RETURN;
  END IF;

  -- Check if appointment still exists and is valid for this action
  SELECT * INTO v_appointment_record
  FROM appointments
  WHERE id = v_token_record.appointment_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, FALSE, 'Appointment not found';
    RETURN;
  END IF;

  -- For cancellation, don't allow if already cancelled or completed
  IF p_action_type = 'cancel' AND v_appointment_record.status IN ('CANCELLED', 'COMPLETE', 'NO_SHOW') THEN
    RETURN QUERY SELECT NULL::UUID, FALSE, 'Appointment cannot be cancelled (status: ' || v_appointment_record.status || ')';
    RETURN;
  END IF;

  -- For rescheduling, don't allow if already cancelled or completed
  IF p_action_type = 'reschedule' AND v_appointment_record.status IN ('CANCELLED', 'COMPLETE', 'NO_SHOW') THEN
    RETURN QUERY SELECT NULL::UUID, FALSE, 'Appointment cannot be rescheduled (status: ' || v_appointment_record.status || ')';
    RETURN;
  END IF;

  -- Token is valid
  RETURN QUERY SELECT v_token_record.appointment_id, TRUE, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark token as used
CREATE OR REPLACE FUNCTION mark_token_used(p_token TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE appointment_management_tokens
  SET used_at = NOW()
  WHERE token = p_token;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE appointment_management_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Tokens are viewable by anyone with the token"
  ON appointment_management_tokens FOR SELECT
  USING (true);

CREATE POLICY "Only system can create tokens"
  ON appointment_management_tokens FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Only system can update tokens"
  ON appointment_management_tokens FOR UPDATE
  USING (false);
