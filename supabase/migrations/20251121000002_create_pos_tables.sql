-- Create transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    tip_amount DECIMAL(10,2) DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    deposit_amount DECIMAL(10,2) DEFAULT 0.00,
    final_due_amount DECIMAL(10,2) DEFAULT 0.00,
    status TEXT CHECK (status IN ('PAID', 'PENDING', 'CANCELLED')) DEFAULT 'PENDING',
    checkout_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transaction_items table
CREATE TABLE transaction_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    item_type TEXT CHECK (item_type IN ('SERVICE', 'PRODUCT', 'GIFT', 'PACKAGE')) NOT NULL,
    item_id UUID NOT NULL, -- references services, products, packages tables
    service_provider_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    quantity INTEGER DEFAULT 1,
    price_per_unit DECIMAL(10,2) DEFAULT 0.00,
    discount_applied DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    method TEXT CHECK (method IN ('CASH', 'CHECK', 'CREDIT', 'GIFT_CERTIFICATE', 'IOU')) NOT NULL,
    amount DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX idx_transactions_staff_id ON transactions(staff_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_checkout_time ON transactions(checkout_time);
CREATE INDEX idx_transaction_items_transaction_id ON transaction_items(transaction_id);
CREATE INDEX idx_transaction_items_item_type ON transaction_items(item_type);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Transactions policies
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
CREATE POLICY "Users can view their own transactions" ON transactions
    FOR SELECT USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Staff can view all transactions" ON transactions;
CREATE POLICY "Staff can view all transactions" ON transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM staff
            WHERE staff.id = auth.uid()
            AND staff.role IN ('admin', 'manager', 'staff')
        )
    );

DROP POLICY IF EXISTS "Staff can create transactions" ON transactions;
CREATE POLICY "Staff can create transactions" ON transactions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM staff
            WHERE staff.id = auth.uid()
            AND staff.role IN ('admin', 'manager', 'staff')
        )
    );

DROP POLICY IF EXISTS "Staff can update transactions" ON transactions;
CREATE POLICY "Staff can update transactions" ON transactions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM staff
            WHERE staff.id = auth.uid()
            AND staff.role IN ('admin', 'manager', 'staff')
        )
    );

-- Transaction items policies
DROP POLICY IF EXISTS "Users can view their transaction items" ON transaction_items;
CREATE POLICY "Users can view their transaction items" ON transaction_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM transactions
            WHERE transactions.id = transaction_items.transaction_id
            AND transactions.customer_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can view all transaction items" ON transaction_items;
CREATE POLICY "Staff can view all transaction items" ON transaction_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM staff
            WHERE staff.id = auth.uid()
            AND staff.role IN ('admin', 'manager', 'staff')
        )
    );

DROP POLICY IF EXISTS "Staff can create transaction items" ON transaction_items;
CREATE POLICY "Staff can create transaction items" ON transaction_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM staff
            WHERE staff.id = auth.uid()
            AND staff.role IN ('admin', 'manager', 'staff')
        )
    );

DROP POLICY IF EXISTS "Staff can update transaction items" ON transaction_items;
CREATE POLICY "Staff can update transaction items" ON transaction_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM staff
            WHERE staff.id = auth.uid()
            AND staff.role IN ('admin', 'manager', 'staff')
        )
    );

-- Payments policies
DROP POLICY IF EXISTS "Users can view their payments" ON payments;
CREATE POLICY "Users can view their payments" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM transactions
            WHERE transactions.id = payments.transaction_id
            AND transactions.customer_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Staff can view all payments" ON payments;
CREATE POLICY "Staff can view all payments" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM staff
            WHERE staff.id = auth.uid()
            AND staff.role IN ('admin', 'manager', 'staff')
        )
    );

DROP POLICY IF EXISTS "Staff can create payments" ON payments;
CREATE POLICY "Staff can create payments" ON payments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM staff
            WHERE staff.id = auth.uid()
            AND staff.role IN ('admin', 'manager', 'staff')
        )
    );

DROP POLICY IF EXISTS "Staff can update payments" ON payments;
CREATE POLICY "Staff can update payments" ON payments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM staff
            WHERE staff.id = auth.uid()
            AND staff.role IN ('admin', 'manager', 'staff')
        )
    );
