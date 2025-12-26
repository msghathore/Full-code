-- Create terminal_checkouts table to track Square Terminal payments
CREATE TABLE IF NOT EXISTS terminal_checkouts (
    id TEXT PRIMARY KEY, -- Square checkout ID
    device_id TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'CAD',
    status TEXT NOT NULL DEFAULT 'PENDING',
    reference_id TEXT,
    appointment_id UUID REFERENCES appointments(id),
    customer_id UUID REFERENCES customers(id),
    staff_id UUID REFERENCES staff(id),
    cart_items JSONB,
    tip_amount DECIMAL(10, 2) DEFAULT 0,
    payment_id TEXT, -- Square payment ID after completion
    transaction_id UUID REFERENCES transactions(id),
    cancel_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_terminal_checkouts_status ON terminal_checkouts(status);
CREATE INDEX IF NOT EXISTS idx_terminal_checkouts_device ON terminal_checkouts(device_id);
CREATE INDEX IF NOT EXISTS idx_terminal_checkouts_appointment ON terminal_checkouts(appointment_id);
CREATE INDEX IF NOT EXISTS idx_terminal_checkouts_created ON terminal_checkouts(created_at DESC);

-- Create terminal_devices table to track paired devices
CREATE TABLE IF NOT EXISTS terminal_devices (
    id TEXT PRIMARY KEY, -- Square device ID
    name TEXT NOT NULL DEFAULT 'Square Terminal',
    code TEXT, -- Pairing code
    status TEXT DEFAULT 'UNPAIRED',
    location_id TEXT,
    product_type TEXT DEFAULT 'TERMINAL_API',
    is_default BOOLEAN DEFAULT false,
    paired_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for terminal_checkouts
ALTER TABLE terminal_checkouts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own checkouts
CREATE POLICY "Staff can view terminal checkouts"
    ON terminal_checkouts FOR SELECT
    TO authenticated
    USING (true);

-- Allow service role full access
CREATE POLICY "Service role has full access to terminal_checkouts"
    ON terminal_checkouts FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Allow anon to insert (for webhook)
CREATE POLICY "Webhook can insert terminal checkouts"
    ON terminal_checkouts FOR INSERT
    TO anon
    WITH CHECK (true);

-- Allow anon to update (for webhook)
CREATE POLICY "Webhook can update terminal checkouts"
    ON terminal_checkouts FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

-- RLS Policies for terminal_devices
ALTER TABLE terminal_devices ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view devices
CREATE POLICY "Staff can view terminal devices"
    ON terminal_devices FOR SELECT
    TO authenticated
    USING (true);

-- Allow service role full access
CREATE POLICY "Service role has full access to terminal_devices"
    ON terminal_devices FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_terminal_checkout_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update timestamp
DROP TRIGGER IF EXISTS terminal_checkout_updated ON terminal_checkouts;
CREATE TRIGGER terminal_checkout_updated
    BEFORE UPDATE ON terminal_checkouts
    FOR EACH ROW
    EXECUTE FUNCTION update_terminal_checkout_timestamp();

-- Add comment for documentation
COMMENT ON TABLE terminal_checkouts IS 'Tracks Square Terminal checkout sessions for in-person payments';
COMMENT ON TABLE terminal_devices IS 'Tracks paired Square Terminal devices';
