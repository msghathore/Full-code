-- Update payments table constraint to include DEBIT and remove IOU
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_method_check;
ALTER TABLE payments ADD CONSTRAINT payments_method_check 
CHECK (method IN ('CASH', 'CHECK', 'CREDIT', 'DEBIT', 'GIFT_CERTIFICATE'));

-- Add comment explaining the change
COMMENT ON COLUMN payments.method IS 'Payment method: CASH, CHECK, CREDIT, DEBIT, or GIFT_CERTIFICATE';