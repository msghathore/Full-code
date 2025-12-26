-- Fix POS payments table constraint to include DEBIT
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_method_check;
ALTER TABLE payments ADD CONSTRAINT payments_method_check
CHECK (method IN ('CASH', 'CHECK', 'CREDIT', 'DEBIT', 'GIFT_CERTIFICATE'));