-- Create the RPC function for finalizing transactions
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
    -- Extract parameters from JSON
    customer_id_param := (transaction_data->>'customer_id')::UUID;
    staff_id_param := (transaction_data->>'staff_id')::UUID;
    cart_items := transaction_data->'cart_items';
    payment_methods := transaction_data->'payment_methods';
    tip_amount_calc := COALESCE((transaction_data->>'tip_amount')::DECIMAL(10,2), 0);
    
    -- Calculate totals from cart items
    FOR item IN SELECT * FROM jsonb_array_elements(cart_items)
    LOOP
        total_amount_calc := total_amount_calc + 
            ((item->>'price')::DECIMAL(10,2) * (item->>'quantity')::INTEGER);
        discount_amount_calc := discount_amount_calc + 
            COALESCE((item->>'discount')::DECIMAL(10,2), 0);
        deposit_amount_calc := deposit_amount_calc + 
            COALESCE((item->>'deposit_amount')::DECIMAL(10,2), 0);
    END LOOP;
    
    -- Calculate tax (assuming 5% tax rate)
    tax_amount_calc := (total_amount_calc - discount_amount_calc) * 0.05;
    
    -- Calculate total due amount
    final_due_amount_calc := total_amount_calc - discount_amount_calc + tax_amount_calc + tip_amount_calc - deposit_amount_calc;
    
    -- Calculate total payment amount
    FOR payment IN SELECT * FROM jsonb_array_elements(payment_methods)
    LOOP
        payment_amount_calc := payment_amount_calc + (payment->>'amount')::DECIMAL(10,2);
    END LOOP;
    
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
    
    -- Insert transaction items
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
            (item->>'item_id')::UUID,
            CASE 
                WHEN item ? 'service_provider_id' 
                THEN (item->>'service_provider_id')::UUID 
                ELSE NULL 
            END,
            (item->>'quantity')::INTEGER,
            (item->>'price')::DECIMAL(10,2),
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
            (payment->>'amount')::DECIMAL(10,2)
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION finalize_transaction(JSONB) TO authenticated;