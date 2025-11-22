-- Fix the finalize_transaction function to handle the frontend data format

-- First, ensure we have a staff table for the references
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT CHECK (role IN ('admin', 'senior', 'junior')),
    specialty TEXT,
    status TEXT CHECK (status IN ('available', 'busy', 'break', 'offline')) DEFAULT 'available',
    access_level TEXT CHECK (access_level IN ('full', 'limited', 'basic', 'admin', 'manager')) DEFAULT 'basic',
    color TEXT DEFAULT 'blue',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for staff table
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view all staff" ON staff
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert staff" ON staff
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Staff can update their own record" ON staff
    FOR UPDATE USING (auth.uid() = id);

-- Drop and recreate the finalize_transaction function with better handling
DROP FUNCTION IF EXISTS finalize_transaction(JSONB);

CREATE OR REPLACE FUNCTION finalize_transaction(
    transaction_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    transaction_id UUID;
    customer_id_param UUID;
    staff_id_param UUID;
    cart_items JSONB;
    payment_methods JSONB;
    total_amount_calc DECIMAL(10,2) := 0;
    discount_amount_calc DECIMAL(10,2) := 0;
    tip_amount_calc DECIMAL(10,2) := 0;
    tax_amount_calc DECIMAL(10,2) := 0;
    deposit_amount_calc DECIMAL(10,2) := 0;
    final_due_amount_calc DECIMAL(10,2) := 0;
    payment_amount_calc DECIMAL(10,2) := 0;
    item JSONB;
    payment JSONB;
    result JSONB;
BEGIN
    -- Extract parameters from JSON with better handling
    customer_id_param := NULL;
    IF transaction_data ? 'customer_id' THEN
        BEGIN
            customer_id_param := (transaction_data->>'customer_id')::UUID;
        EXCEPTION WHEN invalid_text_representation THEN
            -- Handle mock customer IDs by creating a dummy UUID
            customer_id_param := '00000000-0000-0000-0000-000000000001'::UUID;
        END;
    END IF;
    
    staff_id_param := NULL;
    IF transaction_data ? 'staff_id' THEN
        BEGIN
            staff_id_param := (transaction_data->>'staff_id')::UUID;
        EXCEPTION WHEN invalid_text_representation THEN
            -- Handle mock staff IDs by using a default staff or creating one
            SELECT id INTO staff_id_param FROM staff LIMIT 1;
            IF staff_id_param IS NULL THEN
                -- Create a default staff member if none exists
                INSERT INTO staff (name, username, role, specialty, status, access_level) 
                VALUES ('Default Staff', 'default', 'senior', 'General', 'available', 'full')
                RETURNING id INTO staff_id_param;
            END IF;
        END;
    END IF;
    
    cart_items := transaction_data->'cart_items';
    payment_methods := transaction_data->'payment_methods';
    tip_amount_calc := COALESCE((transaction_data->>'tip_amount')::DECIMAL(10,2), 0);
    
    -- Calculate totals from cart items
    FOR item IN SELECT * FROM jsonb_array_elements(cart_items)
    LOOP
        total_amount_calc := total_amount_calc + 
            ((item->>'price')::DECIMAL(10,2) * COALESCE((item->>'quantity')::INTEGER, 1));
        discount_amount_calc := discount_amount_calc + 
            COALESCE((item->>'discount')::DECIMAL(10,2), 0);
        deposit_amount_calc := deposit_amount_calc + 
            COALESCE((item->>'deposit_amount')::DECIMAL(10,2), 0);
    END LOOP;
    
    -- Calculate tax (assuming 5% tax rate)
    
    -- Create the transaction
    INSERT INTO transactions (
        customer_id,
        staff_id,
        total_amount,
        discount_amount,
        tip_amount,
        tax_amount,
        deposit_amount,
        final_due_amount,
        status,
        checkout_time
    ) VALUES (
        customer_id_param,
        staff_id_param,
        total_amount_calc,
        discount_amount_calc,
        tip_amount_calc,
        tax_amount_calc,
        deposit_amount_calc,
        final_due_amount_calc,
        CASE 
            WHEN payment_amount_calc >= final_due_amount_calc THEN 'PAID'
            ELSE 'PENDING'
        END,
        NOW()
    ) RETURNING id INTO transaction_id;
    
    -- Insert transaction items with better field mapping
    FOR item IN SELECT * FROM jsonb_array_elements(cart_items)
    LOOP
        INSERT INTO transaction_items (
            transaction_id,
            item_type,
            item_id,
            service_provider_id,
            quantity,
            price_per_unit,
            discount_applied
        ) VALUES (
            transaction_id,
            item->>'item_type',
            -- Handle both UUID and string item_ids by creating a deterministic UUID
            COALESCE(
                CASE 
                    WHEN item->>'item_id' ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
                    THEN (item->>'item_id')::UUID
                    ELSE ('00000000-0000-0000-0000-' || LPAD(EXTRACT(epoch FROM NOW())::bigint % 100000000, 8, '0'))::UUID
                END,
                gen_random_uuid()
            ),
            -- Handle provider_id field mapping
            CASE 
                WHEN item ? 'provider_id' THEN
                    CASE 
                        WHEN (item->>'provider_id') ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
                        THEN (item->>'provider_id')::UUID
                        ELSE staff_id_param  -- Use the transaction staff_id as fallback
                    END
                ELSE staff_id_param
            END,
            COALESCE((item->>'quantity')::INTEGER, 1),
            COALESCE((item->>'price')::DECIMAL(10,2), 0),
            COALESCE((item->>'discount')::DECIMAL(10,2), 0)
        );
    END LOOP;
    
    -- Insert payments
    FOR payment IN SELECT * FROM jsonb_array_elements(payment_methods)
    LOOP
        INSERT INTO payments (
            transaction_id,
            method,
            amount
        ) VALUES (
            transaction_id,
            payment->>'method',
            COALESCE((payment->>'amount')::DECIMAL(10,2), 0)
        );
    END LOOP;
    
    -- Return success result
    result := jsonb_build_object(
        'success', true,
        'transaction_id', transaction_id,
        'total_amount', total_amount_calc,
        'discount_amount', discount_amount_calc,
        'tax_amount', tax_amount_calc,
        'tip_amount', tip_amount_calc,
        'deposit_amount', deposit_amount_calc,
        'final_due_amount', final_due_amount_calc,
        'payment_amount', payment_amount_calc,
        'status', CASE 
            WHEN payment_amount_calc >= final_due_amount_calc THEN 'PAID'
            ELSE 'PENDING'
        END
    );
    
    RETURN result;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Return error result
        result := jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'detail', SQLSTATE
        );
        RETURN result;
END;
$$;

-- Grant execute permission to authenticated users and service_role
GRANT EXECUTE ON FUNCTION finalize_transaction(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION finalize_transaction(JSONB) TO service_role;

-- Insert some sample staff data for testing
INSERT INTO staff (name, username, role, specialty, status, access_level, color) VALUES
('Sarah Johnson', 'sarah', 'senior', 'Hair Styling', 'available', 'admin', 'blue'),
('Mike Chen', 'mike', 'senior', 'Nails', 'busy', 'manager', 'emerald'),
('Emma Davis', 'emma', 'junior', 'Massage', 'available', 'full', 'purple'),
('Alex Rivera', 'alex', 'junior', 'Facials', 'break', 'basic', 'pink')
ON CONFLICT (username) DO NOTHING;

-- Notify PostgREST to reload the schema
NOTIFY pgrst, 'reload schema';
    tax_amount_calc := (total_amount_calc - discount_amount_calc) * 0.05;
    
    -- Calculate total due amount
    final_due_amount_calc := total_amount_calc - discount_amount_calc + tax_amount_calc + tip_amount_calc - deposit_amount_calc;
    
    -- Calculate total payment amount
    FOR payment IN SELECT * FROM jsonb_array_elements(payment_methods)
    LOOP
        payment_amount_calc := payment_amount_calc + COALESCE((payment->>'amount')::DECIMAL(10,2), 0);
    END LOOP;