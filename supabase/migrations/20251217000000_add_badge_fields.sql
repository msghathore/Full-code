-- Add retention and payment status to appointments
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS retention_status VARCHAR(10)
    CHECK (retention_status IN ('RR', 'RNR', 'NR', 'NNR'));

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20)
    CHECK (payment_status IN ('paid', 'deposit', 'package', 'membership', 'pending'))
    DEFAULT 'pending';

-- Add comment explaining the badge system
COMMENT ON COLUMN public.appointments.retention_status IS 'Customer retention tracking: RR=Return Request, RNR=Return Non-Request, NR=New Request, NNR=New Non-Request';
COMMENT ON COLUMN public.appointments.payment_status IS 'Payment status: paid, deposit, package, membership, or pending';
