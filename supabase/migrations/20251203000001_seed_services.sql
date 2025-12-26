-- Seed data for services table
-- This migration creates realistic beauty salon services for production use
-- Run this in Supabase SQL Editor

-- First, clear any existing services if needed (optional - comment out if you want to keep existing)
-- DELETE FROM public.services;

-- Hair Services
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active) VALUES
('Women''s Haircut', 'Professional haircut with styling consultation, shampoo, and blow dry', 75.00, 60, 'Hair', true),
('Men''s Haircut', 'Classic men''s cut with styling', 45.00, 30, 'Hair', true),
('Full Color', 'Complete hair coloring service with consultation', 150.00, 120, 'Hair', true),
('Partial Highlights', 'Partial highlight application with toner', 120.00, 90, 'Hair', true),
('Full Highlights', 'Full head highlighting with toner and gloss', 180.00, 150, 'Hair', true),
('Balayage', 'Hand-painted highlights for natural-looking dimension', 200.00, 180, 'Hair', true),
('Hair Treatments', 'Deep conditioning treatment for damaged hair', 50.00, 30, 'Hair', true),
('Keratin Treatment', 'Smoothing treatment to reduce frizz for up to 3 months', 300.00, 180, 'Hair', true),
('Blowout Styling', 'Professional blow dry and styling', 55.00, 45, 'Hair', true),
('Updo Styling', 'Special occasion updo hairstyle', 85.00, 60, 'Hair', true),

-- Nail Services
('Classic Manicure', 'Traditional manicure with polish', 35.00, 30, 'Nails', true),
('Gel Manicure', 'Long-lasting gel polish manicure', 50.00, 45, 'Nails', true),
('Classic Pedicure', 'Relaxing pedicure with regular polish', 45.00, 45, 'Nails', true),
('Gel Pedicure', 'Premium pedicure with gel polish finish', 60.00, 60, 'Nails', true),
('Acrylic Full Set', 'Full set of acrylic nail extensions', 75.00, 90, 'Nails', true),
('Acrylic Fill', 'Acrylic nail fill and maintenance', 50.00, 60, 'Nails', true),
('Nail Art (Add-on)', 'Custom nail art designs per nail', 10.00, 15, 'Nails', true),
('French Manicure', 'Classic French tip manicure', 45.00, 45, 'Nails', true),

-- Facial & Skin Services
('Signature Facial', 'Customized facial treatment for all skin types', 95.00, 60, 'Facial', true),
('Deep Cleansing Facial', 'Deep pore cleansing with extractions', 110.00, 75, 'Facial', true),
('Anti-Aging Facial', 'Rejuvenating facial targeting fine lines and wrinkles', 135.00, 75, 'Facial', true),
('Hydrating Facial', 'Intensive hydration treatment for dry skin', 100.00, 60, 'Facial', true),
('Acne Treatment Facial', 'Specialized facial for acne-prone skin', 115.00, 75, 'Facial', true),
('Chemical Peel', 'Professional chemical peel for skin renewal', 125.00, 45, 'Facial', true),
('Microdermabrasion', 'Exfoliation treatment to improve skin texture', 110.00, 60, 'Facial', true),
('LED Light Therapy', 'Light therapy treatment for various skin concerns', 85.00, 30, 'Facial', true),

-- Waxing Services
('Eyebrow Wax', 'Professional eyebrow shaping and waxing', 25.00, 15, 'Waxing', true),
('Upper Lip Wax', 'Quick and gentle upper lip hair removal', 15.00, 10, 'Waxing', true),
('Chin Wax', 'Chin and jawline hair removal', 18.00, 10, 'Waxing', true),
('Full Face Wax', 'Complete facial waxing service', 50.00, 30, 'Waxing', true),
('Underarm Wax', 'Underarm hair removal', 25.00, 15, 'Waxing', true),
('Bikini Wax', 'Basic bikini line waxing', 45.00, 30, 'Waxing', true),
('Brazilian Wax', 'Full Brazilian waxing service', 70.00, 45, 'Waxing', true),
('Leg Wax (Half)', 'Lower leg waxing', 40.00, 30, 'Waxing', true),
('Leg Wax (Full)', 'Full leg waxing service', 70.00, 45, 'Waxing', true),

-- Massage & Spa Services
('Swedish Massage (60 min)', 'Relaxing full-body Swedish massage', 95.00, 60, 'Massage', true),
('Swedish Massage (90 min)', 'Extended relaxing Swedish massage', 130.00, 90, 'Massage', true),
('Deep Tissue Massage (60 min)', 'Therapeutic deep tissue massage', 110.00, 60, 'Massage', true),
('Deep Tissue Massage (90 min)', 'Extended deep tissue massage', 150.00, 90, 'Massage', true),
('Hot Stone Massage', 'Massage therapy with heated stones', 120.00, 75, 'Massage', true),
('Aromatherapy Massage', 'Massage with essential oils', 105.00, 60, 'Massage', true),
('Prenatal Massage', 'Gentle massage for expecting mothers', 105.00, 60, 'Massage', true),
('Back & Shoulder Massage', 'Targeted massage for upper body tension', 60.00, 30, 'Massage', true),

-- Makeup Services
('Makeup Application', 'Professional makeup application for any occasion', 75.00, 60, 'Makeup', true),
('Bridal Makeup', 'Special bridal makeup with trial session', 150.00, 90, 'Makeup', true),
('Makeup Lesson', 'One-on-one makeup application lesson', 85.00, 75, 'Makeup', true),
('Lash Extensions', 'Semi-permanent individual lash extensions', 150.00, 120, 'Makeup', true),
('Lash Extension Fill', 'Touch-up for existing lash extensions', 75.00, 60, 'Makeup', true),
('Lash Lift & Tint', 'Natural lash lifting and tinting service', 85.00, 60, 'Makeup', true),
('Eyebrow Tinting', 'Professional eyebrow tinting', 30.00, 20, 'Makeup', true),

-- Special Packages (Premium Services)
('Bridal Package', 'Complete bridal beauty package: hair, makeup, nails, and facial', 450.00, 300, 'Package', true),
('Spa Day Package', 'Full day of pampering: massage, facial, mani/pedi', 350.00, 240, 'Package', true),
('Mom & Daughter Spa', 'Bonding spa experience with manicures and facials', 200.00, 120, 'Package', true),
('Gentlemen''s Grooming Package', 'Complete men''s grooming: haircut, facial, and massage', 180.00, 120, 'Package', true);

-- Add a special consultation service
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active) VALUES
('Beauty Consultation', 'Complimentary consultation to discuss your beauty goals', 0.00, 30, 'Consultation', true);

-- Update the created_at timestamps to show a variety of dates
UPDATE public.services SET created_at = NOW() - INTERVAL '30 days' WHERE category = 'Hair';
UPDATE public.services SET created_at = NOW() - INTERVAL '20 days' WHERE category = 'Nails';
UPDATE public.services SET created_at = NOW() - INTERVAL '15 days' WHERE category = 'Facial';
UPDATE public.services SET created_at = NOW() - INTERVAL '10 days' WHERE category = 'Waxing';
UPDATE public.services SET created_at = NOW() - INTERVAL '5 days' WHERE category = 'Massage';
UPDATE public.services SET created_at = NOW() WHERE category IN ('Makeup', 'Package', 'Consultation');
