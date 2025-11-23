-- Complete Payment System Fix
-- This migration fixes the missing customer tables and data issues

-- 1. Create customers table if it doesn't exist
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    loyalty_points INTEGER DEFAULT 0,
    last_visit DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create index for performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- 3. Insert the mock customer that frontend expects
INSERT INTO customers (id, name, email, phone, loyalty_points, last_visit)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Carol Wilson',
    'carol.wilson@example.com',
    '(555) 123-4567',
    0,
    '2024-11-15'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    last_visit = EXCLUDED.last_visit,
    updated_at = NOW();

-- 4. Add more sample customers for testing
INSERT INTO customers (id, name, email, phone, loyalty_points, last_visit)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'John Smith', 'john.smith@example.com', '(555) 234-5678', 150, '2024-11-10'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Sarah Johnson', 'sarah.johnson@example.com', '(555) 345-6789', 320, '2024-11-08'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Mike Davis', 'mike.davis@example.com', '(555) 456-7890', 75, '2024-11-12')
ON CONFLICT (id) DO NOTHING;

-- 5. Enable RLS (Row Level Security) for customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for customers (allow authenticated access)
CREATE POLICY "Allow authenticated users to read customers" ON customers
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert customers" ON customers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update customers" ON customers
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 7. Update the payments_method_check constraint to ensure it matches frontend expectations
-- First drop existing constraint if it exists with wrong name
DO $$
BEGIN
    -- Drop any existing constraint (different possible names)
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_method_check') THEN
        ALTER TABLE payments DROP CONSTRAINT payments_method_check;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_method_check_OLD') THEN
        ALTER TABLE payments DROP CONSTRAINT payments_method_check_OLD;
    END IF;
END $$;

-- 8. Add the correct constraint that matches frontend expectations
ALTER TABLE payments ADD CONSTRAINT payments_method_check
    CHECK (method IN ('CASH', 'CHECK', 'CREDIT', 'DEBIT', 'GIFT_CERTIFICATE'));

-- 9. Update transaction foreign key constraints to be more forgiving
-- Check if constraint exists and drop it first
DO $$
BEGIN
    -- Try to drop existing foreign key constraint (if exists)
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'transactions_customer_id_fkey') THEN
        ALTER TABLE transactions DROP CONSTRAINT transactions_customer_id_fkey;
    END IF;
END $$;

-- 10. Re-add the foreign key constraint with proper ON DELETE behavior
ALTER TABLE transactions ADD CONSTRAINT transactions_customer_id_fkey 
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;

-- 11. Update transaction_items foreign key constraints
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'transaction_items_transaction_id_fkey') THEN
        ALTER TABLE transaction_items DROP CONSTRAINT transaction_items_transaction_id_fkey;
    END IF;
END $$;

ALTER TABLE transaction_items ADD CONSTRAINT transaction_items_transaction_id_fkey 
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE;

-- 12. Grant necessary permissions
GRANT ALL ON customers TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 13. Update RLS for existing POS tables to allow authenticated access
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for all tables
CREATE POLICY "Allow authenticated users full access to transactions" ON transactions
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to transaction_items" ON transaction_items
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to payments" ON payments
    FOR ALL USING (auth.role() = 'authenticated');

-- 14. Final confirmation
DO $$
BEGIN
    RAISE NOTICE 'Customer tables and payment system successfully configured';
    RAISE NOTICE 'Sample customers inserted for testing';
    RAISE NOTICE 'Payment constraints updated to match frontend expectations';
    RAISE NOTICE 'Foreign key constraints updated with proper ON DELETE behavior';
END $$;