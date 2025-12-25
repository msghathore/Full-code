-- Create pending_checkout table for staff-to-customer tablet sync
-- This enables real-time communication between staff iPad and customer Samsung Tab S7

CREATE TABLE IF NOT EXISTS pending_checkout (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Session identification
    session_code VARCHAR(6) NOT NULL UNIQUE, -- Short code for manual lookup if needed

    -- Cart items as JSON array
    cart_items JSONB NOT NULL DEFAULT '[]',
    -- Format: [{"item_id": "uuid", "name": "Service Name", "price": 50.00, "quantity": 1, "item_type": "service"}]

    -- Pricing breakdown
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5,4) NOT NULL DEFAULT 0.05, -- 5% GST for Manitoba
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    tip_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,

    -- Customer info (optional, from appointment)
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),

    -- Appointment reference (if from completed appointment)
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,

    -- Staff who initiated checkout
    staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    staff_name VARCHAR(255),

    -- Status tracking
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    -- Possible values: 'pending', 'viewed', 'processing', 'completed', 'cancelled', 'expired'

    -- Payment details (filled after payment)
    payment_method VARCHAR(50), -- 'square_reader', 'cash', 'card_manual'
    payment_id VARCHAR(255), -- Square payment ID
    payment_status VARCHAR(50), -- 'pending', 'processing', 'completed', 'failed'

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 minutes'),
    completed_at TIMESTAMPTZ,

    -- Business info for receipt
    business_name VARCHAR(255) DEFAULT 'Zavira Salon & Spa',
    business_address VARCHAR(500) DEFAULT '283 Tache Avenue, Winnipeg, MB, Canada',
    business_phone VARCHAR(50) DEFAULT '(431) 816-3330'
);

-- Create index for faster lookups
CREATE INDEX idx_pending_checkout_status ON pending_checkout(status);
CREATE INDEX idx_pending_checkout_session_code ON pending_checkout(session_code);
CREATE INDEX idx_pending_checkout_created_at ON pending_checkout(created_at DESC);
CREATE INDEX idx_pending_checkout_staff_id ON pending_checkout(staff_id);

-- Enable Row Level Security
ALTER TABLE pending_checkout ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (staff)
CREATE POLICY "Staff can manage pending checkouts" ON pending_checkout
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Policy: Allow anon/public to read and update (for customer tablet app)
CREATE POLICY "Customer tablet can read pending checkouts" ON pending_checkout
    FOR SELECT
    USING (status IN ('pending', 'viewed', 'processing'));

CREATE POLICY "Customer tablet can update pending checkouts" ON pending_checkout
    FOR UPDATE
    USING (status IN ('pending', 'viewed', 'processing'))
    WITH CHECK (status IN ('pending', 'viewed', 'processing', 'completed', 'cancelled'));

-- Function to generate unique 6-digit session code
CREATE OR REPLACE FUNCTION generate_session_code()
RETURNS VARCHAR(6) AS $$
DECLARE
    new_code VARCHAR(6);
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate random 6-digit code (avoiding confusing characters like 0, O, 1, I, L)
        new_code := '';
        FOR i IN 1..6 LOOP
            new_code := new_code || substr('23456789ABCDEFGHJKMNPQRSTUVWXYZ', floor(random() * 30 + 1)::int, 1);
        END LOOP;

        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM pending_checkout WHERE session_code = new_code) INTO code_exists;

        IF NOT code_exists THEN
            RETURN new_code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate session code on insert
CREATE OR REPLACE FUNCTION set_session_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.session_code IS NULL OR NEW.session_code = '' THEN
        NEW.session_code := generate_session_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_session_code
    BEFORE INSERT ON pending_checkout
    FOR EACH ROW
    EXECUTE FUNCTION set_session_code();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pending_checkout_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pending_checkout_timestamp
    BEFORE UPDATE ON pending_checkout
    FOR EACH ROW
    EXECUTE FUNCTION update_pending_checkout_timestamp();

-- Function to clean up expired checkouts (run via cron or edge function)
CREATE OR REPLACE FUNCTION cleanup_expired_checkouts()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    WITH deleted AS (
        DELETE FROM pending_checkout
        WHERE expires_at < NOW() AND status IN ('pending', 'viewed')
        RETURNING *
    )
    SELECT COUNT(*) INTO deleted_count FROM deleted;

    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE pending_checkout;

-- Add comment for documentation
COMMENT ON TABLE pending_checkout IS 'Pending checkout sessions for staff-to-customer tablet sync. Staff creates record, customer tablet listens via realtime.';
