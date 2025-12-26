-- =====================================================
-- ZAVIRA REFERRAL PROGRAM DATABASE MIGRATION
-- Complete referral system with programs and tracking
-- =====================================================

-- =====================================================
-- REFERRAL PROGRAMS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS referral_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    program_type TEXT DEFAULT 'standard', -- 'standard', 'tiered', 'promotional'
    reward_type TEXT NOT NULL, -- 'credit', 'discount', 'service'
    reward_value DECIMAL(10,2) NOT NULL, -- dollar amount or percentage
    referee_reward_type TEXT, -- reward type for the friend being referred
    referee_reward_value DECIMAL(10,2), -- reward value for the friend
    terms TEXT, -- terms and conditions
    min_purchase DECIMAL(10,2), -- minimum purchase required
    max_referrals INTEGER, -- max referrals per user (NULL = unlimited)
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- REFERRALS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_code TEXT NOT NULL, -- the code used
    program_id UUID REFERENCES referral_programs(id) ON DELETE SET NULL,
    referrer_customer_id UUID REFERENCES customer_profiles(id) ON DELETE SET NULL, -- person who referred
    referee_customer_id UUID REFERENCES customer_profiles(id) ON DELETE SET NULL, -- person who was referred
    referee_email TEXT, -- email of person being referred (before they sign up)
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'expired', 'cancelled'
    reward_earned DECIMAL(10,2) DEFAULT 0, -- amount earned by referrer
    referee_reward_earned DECIMAL(10,2) DEFAULT 0, -- amount earned by referee
    reward_claimed BOOLEAN DEFAULT FALSE,
    reward_claimed_at TIMESTAMPTZ,
    referee_first_appointment_id UUID, -- first appointment that triggered the reward
    referee_first_appointment_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ, -- when the referral was successfully completed
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ADD REFERRAL CODE TO CUSTOMER PROFILES
-- =====================================================

-- Add referral_code column to customer_profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'customer_profiles'
        AND column_name = 'referral_code'
    ) THEN
        ALTER TABLE customer_profiles ADD COLUMN referral_code TEXT UNIQUE;
    END IF;
END $$;

-- Add referred_by_code column to track how customer was referred
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'customer_profiles'
        AND column_name = 'referred_by_code'
    ) THEN
        ALTER TABLE customer_profiles ADD COLUMN referred_by_code TEXT;
    END IF;
END $$;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_customer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee ON referrals(referee_customer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referral_programs_active ON referral_programs(is_active);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_referral_code ON customer_profiles(referral_code) WHERE referral_code IS NOT NULL;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE referral_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Public can view active referral programs
CREATE POLICY "Public can view active programs" ON referral_programs
    FOR SELECT USING (is_active = TRUE);

-- Admin can manage programs
CREATE POLICY "Admin full access to programs" ON referral_programs
    FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- Users can view their own referrals
CREATE POLICY "Users view own referrals" ON referrals
    FOR SELECT USING (
        referrer_customer_id IN (
            SELECT id FROM customer_profiles WHERE user_id = auth.uid()
        ) OR
        referee_customer_id IN (
            SELECT id FROM customer_profiles WHERE user_id = auth.uid()
        )
    );

-- Users can create referrals
CREATE POLICY "Authenticated users can create referrals" ON referrals
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Staff and admin can manage all referrals
CREATE POLICY "Staff can manage referrals" ON referrals
    FOR ALL USING (auth.jwt()->>'role' IN ('admin', 'staff'));

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to automatically complete referral when referee's first appointment is completed
CREATE OR REPLACE FUNCTION complete_referral_on_appointment()
RETURNS TRIGGER AS $$
DECLARE
    v_referral RECORD;
    v_program RECORD;
BEGIN
    -- Only process completed appointments
    IF NEW.status != 'completed' THEN
        RETURN NEW;
    END IF;

    -- Check if this is a referee's first completed appointment
    SELECT r.*, p.*
    INTO v_referral, v_program
    FROM referrals r
    JOIN referral_programs p ON r.program_id = p.id
    WHERE r.referee_customer_id = NEW.customer_id
    AND r.status = 'pending'
    AND r.referee_first_appointment_id IS NULL
    LIMIT 1;

    IF FOUND THEN
        -- Check if appointment meets minimum purchase requirement
        IF v_program.min_purchase IS NULL OR NEW.total_amount >= v_program.min_purchase THEN
            -- Complete the referral
            UPDATE referrals
            SET
                status = 'completed',
                referee_first_appointment_id = NEW.id,
                referee_first_appointment_date = NEW.appointment_date,
                completed_at = NOW(),
                reward_earned = v_program.reward_value,
                referee_reward_earned = COALESCE(v_program.referee_reward_value, v_program.reward_value),
                updated_at = NOW()
            WHERE id = v_referral.id;

            -- TODO: Create credit entries for both referrer and referee
            -- This would integrate with a credits/rewards table when implemented
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to complete referral on appointment completion
DROP TRIGGER IF EXISTS trigger_complete_referral ON appointments;
CREATE TRIGGER trigger_complete_referral
    AFTER UPDATE ON appointments
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'completed')
    EXECUTE FUNCTION complete_referral_on_appointment();

-- Function to track referral on customer signup
CREATE OR REPLACE FUNCTION track_referral_on_signup()
RETURNS TRIGGER AS $$
DECLARE
    v_referrer_id UUID;
    v_program_id UUID;
BEGIN
    -- Check if customer signed up with a referral code
    IF NEW.referred_by_code IS NOT NULL THEN
        -- Find the referrer
        SELECT id INTO v_referrer_id
        FROM customer_profiles
        WHERE referral_code = NEW.referred_by_code;

        IF FOUND THEN
            -- Get active referral program
            SELECT id INTO v_program_id
            FROM referral_programs
            WHERE is_active = TRUE
            AND (valid_from IS NULL OR valid_from <= NOW())
            AND (valid_until IS NULL OR valid_until >= NOW())
            ORDER BY created_at DESC
            LIMIT 1;

            IF FOUND THEN
                -- Create referral record
                INSERT INTO referrals (
                    referral_code,
                    program_id,
                    referrer_customer_id,
                    referee_customer_id,
                    referee_email,
                    status
                ) VALUES (
                    NEW.referred_by_code,
                    v_program_id,
                    v_referrer_id,
                    NEW.id,
                    NEW.email,
                    'pending'
                );
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to track referral on customer signup
DROP TRIGGER IF EXISTS trigger_track_referral_signup ON customer_profiles;
CREATE TRIGGER trigger_track_referral_signup
    AFTER INSERT ON customer_profiles
    FOR EACH ROW
    EXECUTE FUNCTION track_referral_on_signup();

-- =====================================================
-- SEED DATA - DEFAULT REFERRAL PROGRAM
-- =====================================================

INSERT INTO referral_programs (
    name,
    description,
    program_type,
    reward_type,
    reward_value,
    referee_reward_type,
    referee_reward_value,
    terms,
    min_purchase,
    is_active
) VALUES (
    'Refer a Friend - $20 for Both',
    'Share the love and earn rewards! Refer a friend to Zavira and you both get $20 off.',
    'standard',
    'credit',
    20.00,
    'credit',
    20.00,
    E'Terms & Conditions:\n\n1. Both referrer and referee must be registered Zavira customers.\n2. Referee must be a new customer (first time booking at Zavira).\n3. Rewards are issued after the referee completes their first appointment.\n4. Minimum service value of $50 required for rewards to be issued.\n5. Referral credits expire 12 months from issue date.\n6. Credits cannot be redeemed for cash.\n7. Zavira reserves the right to modify or cancel this program at any time.\n8. Fraudulent referrals will result in account suspension and forfeiture of rewards.',
    50.00,
    TRUE
) ON CONFLICT DO NOTHING;

COMMIT;
