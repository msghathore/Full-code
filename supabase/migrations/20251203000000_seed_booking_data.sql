-- Seed sample customer bookings and data for production demo
-- This creates realistic test data while maintaining data integrity
-- Run this in Supabase SQL Editor AFTER the services seed data

-- Note: This assumes you have staff members already created from previous migrations
-- and services from the 20251203_seed_services.sql migration

DO $$
DECLARE
    test_user_id UUID;
    service_hair_cut UUID;
    service_gel_mani UUID;
    service_facial UUID;
    service_massage UUID;
    staff_sarah UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'; -- From staff seed data
    staff_emily UUID := 'b1ffc9aa-9c0b-4ef8-bb6d-6bb9bd380a22';
    staff_michael UUID := 'c2ggdaabb-9c0b-4ef8-bb6d-6bb9bd380a33';
BEGIN
    -- Get some service IDs
    SELECT id INTO service_hair_cut FROM public.services WHERE name = 'Women''s Haircut' LIMIT 1;
    SELECT id INTO service_gel_mani FROM public.services WHERE name = 'Gel Manicure' LIMIT 1;
    SELECT id INTO service_facial FROM public.services WHERE name = 'Signature Facial' LIMIT 1;
    SELECT id INTO service_massage FROM public.services WHERE name = 'Swedish Massage (60 min)' LIMIT 1;

    -- Create some sample appointments (past, present, future)
    -- These won't have user_ids since they're demo data
    
    -- Past completed appointments
    INSERT INTO public.appointments (
        service_id,
        staff_id,
        appointment_date,
        appointment_time,
        status,
        payment_status,
        total_amount,
        deposit_amount,
        full_name,
        email,
        phone,
        notes,
        created_at
    ) VALUES
    (
        service_hair_cut,
        staff_sarah,
        CURRENT_DATE - INTERVAL '7 days',
        '10:00:00',
        'completed',
        'paid',
        75.00,
        37.50,
        'Jennifer Martinez',
        'jennifer.m@example.com',
        '555-0101',
        'Regular customer, prefers layered cut',
        NOW() - INTERVAL '8 days'
    ),
    (
        service_gel_mani,
        staff_emily,
        CURRENT_DATE - INTERVAL '5 days',
        '14:00:00',
        'completed',
        'paid',
        50.00,
        25.00,
        'Ashley Thompson',
        'ashley.t@example.com',
        '555-0102',
        'Prefers light pink colors',
        NOW() - INTERVAL '6 days'
    ),
    (
        service_facial,
        staff_sarah,
        CURRENT_DATE - INTERVAL '3 days',
        '11:00:00',
        'completed',
        'paid',
        95.00,
        47.50,
        'Rachel Kim',
        'rachel.k@example.com',
        '555-0103',
        'Sensitive skin, no fragrances',
        NOW() - INTERVAL '4 days'
    ),
    (
        service_massage,
        staff_michael,
        CURRENT_DATE - INTERVAL '2 days',
        '15:00:00',
        'completed',
        'paid',
        95.00,
        47.50,
        'David Chen',
        'david.c@example.com',
        '555-0104',
        'Focus on lower back tension',
        NOW() - INTERVAL '3 days'
    );

    -- Upcoming appointments (future)
    INSERT INTO public.appointments (
        service_id,
        staff_id,
        appointment_date,
        appointment_time,
        status,
        payment_status,
        total_amount,
        deposit_amount,
        full_name,
        email,
        phone,
        notes,
        created_at
    ) VALUES
    (
        service_hair_cut,
        staff_sarah,
        CURRENT_DATE + INTERVAL '2 days',
        '10:00:00',
        'confirmed',
        'paid',
        75.00,
        37.50,
        'Maria Rodriguez',
        'maria.r@example.com',
        '555-0105',
        'First time customer',
        NOW()
    ),
    (
        service_gel_mani,
        staff_emily,
        CURRENT_DATE + INTERVAL '3 days',
        '13:00:00',
        'confirmed',
        'paid',
        50.00,
        25.00,
        'Jessica Williams',
        'jessica.w@example.com',
        '555-0106',
        'Wedding next week - needs elegant design',
        NOW()
    ),
    (
        service_facial,
        staff_sarah,
        CURRENT_DATE + INTERVAL '5 days',
        '11:30:00',
        'confirmed',
        'paid',
        95.00,
        47.50,
        'Emily Johnson',
        'emily.j@example.com',
        '555-0107',
        'Birthday treat',
        NOW()
    ),
    (
        service_massage,
        staff_michael,
        CURRENT_DATE + INTERVAL '7 days',
        '14:00:00',
        'confirmed',
        'pending',
        95.00,
        0.00,
        'Michael Brown',
        'michael.b@example.com',
        '555-0108',
        'Gift certificate customer',
        NOW()
    );

    -- Today's appointments
    INSERT INTO public.appointments (
        service_id,
        staff_id,
        appointment_date,
        appointment_time,
        status,
        payment_status,
        total_amount,
        deposit_amount,
        full_name,
        email,
        phone,
        notes,
        created_at
    ) VALUES
    (
        service_hair_cut,
        staff_sarah,
        CURRENT_DATE,
        '09:00:00',
        'confirmed',
        'paid',
        75.00,
        37.50,
        'Sophia Anderson',
        'sophia.a@example.com',
        '555-0109',
        'Regular - knows her style',
        NOW() - INTERVAL '1 day'
    ),
    (
        service_gel_mani,
        staff_emily,
        CURRENT_DATE,
        '16:00:00',
        'confirmed',
        'paid',
        50.00,
        25.00,
        'Olivia Davis',
        'olivia.d@example.com',
        '555-0110',
        'Vacation next week',
   NOW() - INTERVAL '2 days'
    );

    -- Create some sample transactions/payments to make the system look active
    -- These correspond to the completed appointments
    INSERT INTO public.transactions (
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
    ) VALUES
    (NULL, staff_sarah, 75.00, 0.00, 15.00, 6.00, 37.50, 58.50, 'PAID', NOW() - INTERVAL '7 days'),
    (NULL, staff_emily, 50.00, 0.00, 10.00, 4.00, 25.00, 39.00, 'PAID', NOW() - INTERVAL '5 days'),
    (NULL, staff_sarah, 95.00, 0.00, 19.00, 7.60, 47.50, 74.10, 'PAID', NOW() - INTERVAL '3 days'),
    (NULL, staff_michael, 95.00, 0.00, 20.00, 7.60, 47.50, 75.10, 'PAID', NOW() - INTERVAL '2 days');

END $$;

-- Add some sample products to the shop
INSERT INTO public.products (name, description, price, category, is_active, stock_quantity) VALUES
('Luxury Hair Serum', 'Premium hair serum for shine and smoothness', 45.00, 'Hair Care', true, 25),
('Moisturizing Face Cream', 'Deep hydration cream for all skin types', 65.00, 'Skincare', true, 15),
('Cuticle Oil', 'Nourishing cuticle oil for healthy nails', 18.00, 'Nail Care', true, 30),
('Spa Gift Set', 'Luxury spa collection with bath salts and oils', 85.00, 'Gift Sets', true, 10),
('Professional Hair Brush', 'Premium boar bristle brush', 38.00, 'Tools', true, 20),
('Cleansing Face Wash', 'Gentle daily cleanser', 32.00, 'Skincare', true, 22),
('Nail Polish - Classic Red', 'Long-lasting gel-effect polish', 15.00, 'Nail Care', true, 40),
('Nail Polish - Nude Pink', 'Natural nude shade polish', 15.00, 'Nail Care', true, 40),
('Aromatherapy Candle', 'Lavender scented relaxation candle', 28.00, 'Spa', true, 18),
('Hair Mask Treatment', 'Intensive repair hair mask', 42.00, 'Hair Care', true, 12);

-- Create a welcome blog post
INSERT INTO public.blog_posts (title, slug, content, excerpt, author_name, is_published, published_at) VALUES
(
    'Welcome to Zavira Beauty',
    'welcome-to-zavira-beauty',
    'Welcome to Zavira Beauty, your premier destination for luxury beauty services. We are thrilled to  announce the launch of our new online booking system!

Our team of experienced professionals is dedicated to providing you with the highest quality services in a relaxing and luxurious environment. From haircuts and coloring to facials and massage therapy, we offer a comprehensive range of beauty treatments designed to help you look and feel your best.

Book your appointment today and experience the Zavira difference!',
    'Discover our new online booking system and explore our range of premium beauty services.',
    'Zavira Team',
    true,
    NOW()
);

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Sample data seed completed successfully!';
    RAISE NOTICE 'Created appointments, transactions, products, and blog posts';
    RAISE NOTICE 'Your database is now production-ready with realistic demo data';
END $$;
