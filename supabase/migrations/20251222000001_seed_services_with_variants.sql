-- Seed data for services with variant structure
-- Based on industry best practices for salon/spa service categorization
-- This migration reorganizes services into parent categories with specific variants

-- First, clear existing services
DELETE FROM public.services;

-- ============================================================================
-- HAIR SERVICES
-- ============================================================================

-- Women's Haircut (Parent)
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, is_parent, display_order) VALUES
('Women''s Haircut', 'Professional haircut with styling consultation, shampoo, and blow dry', 0.00, 60, 'Hair', true, true, 1);

-- Women's Haircut Variants
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, parent_service_id, display_order) VALUES
('Short Hair', 'Haircut for short length hair (above shoulders)', 65.00, 45, 'Hair', true, (SELECT id FROM public.services WHERE name = 'Women''s Haircut' AND is_parent = true), 1),
('Medium Hair', 'Haircut for medium length hair (shoulder to mid-back)', 75.00, 60, 'Hair', true, (SELECT id FROM public.services WHERE name = 'Women''s Haircut' AND is_parent = true), 2),
('Long Hair', 'Haircut for long hair (below mid-back)', 85.00, 75, 'Hair', true, (SELECT id FROM public.services WHERE name = 'Women''s Haircut' AND is_parent = true), 3);

-- Men's Haircut (Parent)
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, is_parent, display_order) VALUES
('Men''s Haircut', 'Classic men''s cut with styling', 0.00, 30, 'Hair', true, true, 2);

-- Men's Haircut Variants
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, parent_service_id, display_order) VALUES
('Short Hair', 'Classic short men''s haircut', 35.00, 25, 'Hair', true, (SELECT id FROM public.services WHERE name = 'Men''s Haircut' AND is_parent = true), 1),
('Medium Hair', 'Medium length men''s haircut with styling', 45.00, 30, 'Hair', true, (SELECT id FROM public.services WHERE name = 'Men''s Haircut' AND is_parent = true), 2),
('Long Hair', 'Long hair men''s cut with styling', 55.00, 40, 'Hair', true, (SELECT id FROM public.services WHERE name = 'Men''s Haircut' AND is_parent = true), 3);

-- Children's Haircut (Parent)
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, is_parent, display_order) VALUES
('Children''s Haircut', 'Haircut for children under 12', 0.00, 30, 'Hair', true, true, 3);

-- Children's Haircut Variants
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, parent_service_id, display_order) VALUES
('Short Hair', 'Children''s short haircut', 30.00, 20, 'Hair', true, (SELECT id FROM public.services WHERE name = 'Children''s Haircut' AND is_parent = true), 1),
('Medium Hair', 'Children''s medium length haircut', 35.00, 25, 'Hair', true, (SELECT id FROM public.services WHERE name = 'Children''s Haircut' AND is_parent = true), 2),
('Long Hair', 'Children''s long hair cut and style', 40.00, 30, 'Hair', true, (SELECT id FROM public.services WHERE name = 'Children''s Haircut' AND is_parent = true), 3);

-- Specialty Cuts (Parent)
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, is_parent, display_order) VALUES
('Specialty Cuts', 'Advanced cutting techniques and styles', 0.00, 60, 'Hair', true, true, 4);

-- Specialty Cuts Variants
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, parent_service_id, display_order) VALUES
('Precision Cut', 'Precision cutting technique for sharp, clean lines', 95.00, 60, 'Hair', true, (SELECT id FROM public.services WHERE name = 'Specialty Cuts' AND is_parent = true), 1),
('Razor Cut', 'Textured razor cutting for soft, flowing styles', 85.00, 60, 'Hair', true, (SELECT id FROM public.services WHERE name = 'Specialty Cuts' AND is_parent = true), 2),
('Bang Trim', 'Quick bang/fringe trim between cuts', 15.00, 15, 'Hair', true, (SELECT id FROM public.services WHERE name = 'Specialty Cuts' AND is_parent = true), 3);

-- Color Services (Parent)
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, is_parent, display_order) VALUES
('Color Services', 'Professional hair coloring services', 0.00, 120, 'Hair', true, true, 5);

-- Color Services Variants
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, parent_service_id, display_order) VALUES
('Basic Color', 'Single process all-over color', 120.00, 90, 'Hair', true, (SELECT id FROM public.services WHERE name = 'Color Services' AND is_parent = true), 1),
('Full Color', 'Complete hair coloring with premium products', 150.00, 120, 'Hair', true, (SELECT id FROM public.services WHERE name = 'Color Services' AND is_parent = true), 2),
('Root Touch-Up', 'Color touch-up for regrowth', 85.00, 60, 'Hair', true, (SELECT id FROM public.services WHERE name = 'Color Services' AND is_parent = true), 3),
('Toner & Gloss', 'Gloss treatment to enhance color and shine', 65.00, 45, 'Hair', true, (SELECT id FROM public.services WHERE name = 'Color Services' AND is_parent = true), 4);

-- Highlights (Parent)
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, is_parent, display_order) VALUES
('Highlights', 'Highlighting services for dimension and brightness', 0.00, 120, 'Hair', true, true, 6);

-- Highlights Variants
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, parent_service_id, display_order) VALUES
('Partial Highlights', 'Highlights on top section and around face', 120.00, 90, 'Hair', true, (SELECT id FROM public.services WHERE name = 'Highlights' AND is_parent = true), 1),
('Full Highlights', 'Full head highlighting with toner', 180.00, 150, 'Hair', true, (SELECT id FROM public.services WHERE name = 'Highlights' AND is_parent = true), 2),
('Foil Highlights', 'Traditional foil highlighting technique', 140.00, 120, 'Hair', true, (SELECT id FROM public.services WHERE name = 'Highlights' AND is_parent = true), 3);

-- Balayage (Parent)
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, is_parent, display_order) VALUES
('Balayage', 'Hand-painted highlights for natural dimension', 0.00, 180, 'Hair', true, true, 7);

-- Balayage Variants
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, parent_service_id, display_order) VALUES
('Partial Balayage', 'Balayage on select sections', 180.00, 150, 'Hair', true, (SELECT id FROM public.services WHERE name = 'Balayage' AND is_parent = true), 1),
('Full Balayage', 'Full head balayage application', 250.00, 210, 'Hair', true, (SELECT id FROM public.services WHERE name = 'Balayage' AND is_parent = true), 2),
('Balayage Color Treatment', 'Complete balayage with color and treatment', 285.00, 180, 'Hair', true, (SELECT id FROM public.services WHERE name = 'Balayage' AND is_parent = true), 3);

-- Hair Repair Treatments (Parent)
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, is_parent, display_order) VALUES
('Hair Repair Treatments', 'Intensive treatments for damaged or compromised hair', 0.00, 60, 'Hair', true, true, 8);

-- Hair Treatments Variants
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, parent_service_id, display_order) VALUES
('Deep Conditioning', 'Intensive hydrating treatment', 50.00, 30, 'Hair', true, (SELECT id FROM public.services WHERE name = 'Hair Repair Treatments' AND is_parent = true), 1),
('Protein & Conditioning', 'Strengthening protein treatment', 65.00, 45, 'Hair', true, (SELECT id FROM public.services WHERE name = 'Hair Repair Treatments' AND is_parent = true), 2),
('Bond Building Treatments', 'Rebuilds broken hair bonds for strength', 95.00, 60, 'Hair', true, (SELECT id FROM public.services WHERE name = 'Hair Repair Treatments' AND is_parent = true), 3),
('Keratin Treatment', 'Smoothing treatment to reduce frizz', 300.00, 180, 'Hair', true, (SELECT id FROM public.services WHERE name = 'Hair Repair Treatments' AND is_parent = true), 4);

-- Extensions (Parent)
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, is_parent, display_order) VALUES
('Hair Extensions', 'Professional hair extension services', 0.00, 120, 'Hair', true, true, 9);

-- Extensions Variants
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, parent_service_id, display_order) VALUES
('Tape-In Extensions', 'Semi-permanent tape-in hair extensions', 400.00, 120, 'Hair', true, (SELECT id FROM public.services WHERE name = 'Hair Extensions' AND is_parent = true), 1),
('Sew-In/Weave', 'Traditional sew-in weft extensions', 350.00, 180, 'Hair', true, (SELECT id FROM public.services WHERE name = 'Hair Extensions' AND is_parent = true), 2),
('Fusion/Bonded Extensions', 'Individual strand bonded extensions', 600.00, 240, 'Hair', true, (SELECT id FROM public.services WHERE name = 'Hair Extensions' AND is_parent = true), 3),
('Gel Extensions', 'Gel-based hair extensions', 450.00, 150, 'Hair', true, (SELECT id FROM public.services WHERE name = 'Hair Extensions' AND is_parent = true), 4);

-- Styling (Parent)
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, is_parent, display_order) VALUES
('Hair Styling', 'Professional styling services', 0.00, 60, 'Hair', true, true, 10);

-- Styling Variants
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, parent_service_id, display_order) VALUES
('Blow-Dry/Styling', 'Professional blow dry and style', 55.00, 45, 'Hair', true, (SELECT id FROM public.services WHERE name = 'Hair Styling' AND is_parent = true), 1),
('Updos & Special Styles', 'Special occasion updo hairstyle', 85.00, 60, 'Hair', true, (SELECT id FROM public.services WHERE name = 'Hair Styling' AND is_parent = true), 2),
('Wedding/Bridal Hair', 'Bridal hairstyling with trial', 150.00, 90, 'Hair', true, (SELECT id FROM public.services WHERE name = 'Hair Styling' AND is_parent = true), 3),
('Braiding', 'Various braiding styles', 65.00, 60, 'Hair', true, (SELECT id FROM public.services WHERE name = 'Hair Styling' AND is_parent = true), 4);

-- Signature Services (Parent)
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, is_parent, display_order) VALUES
('Signature Haircut & Style', 'Premium haircut experience with master stylist', 0.00, 90, 'Hair', true, true, 11);

-- Signature Variants
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, parent_service_id, display_order) VALUES
('Consultation & Cut', 'In-depth consultation with signature cut', 125.00, 90, 'Hair', true, (SELECT id FROM public.services WHERE name = 'Signature Haircut & Style' AND is_parent = true), 1),
('Advanced Color Correction', 'Color correction for previous color issues', 200.00, 240, 'Hair', true, (SELECT id FROM public.services WHERE name = 'Signature Haircut & Style' AND is_parent = true), 2);

-- ============================================================================
-- NAIL SERVICES
-- ============================================================================

-- Manicure (Parent)
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, is_parent, display_order) VALUES
('Manicure', 'Professional manicure services', 0.00, 45, 'Nails', true, true, 1);

-- Manicure Variants
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, parent_service_id, display_order) VALUES
('Classic Manicure', 'Traditional manicure with regular polish', 35.00, 30, 'Nails', true, (SELECT id FROM public.services WHERE name = 'Manicure' AND is_parent = true), 1),
('Gel Manicure', 'Long-lasting gel polish manicure', 50.00, 45, 'Nails', true, (SELECT id FROM public.services WHERE name = 'Manicure' AND is_parent = true), 2),
('French Manicure', 'Classic French tip manicure', 45.00, 45, 'Nails', true, (SELECT id FROM public.services WHERE name = 'Manicure' AND is_parent = true), 3),
('Acrylic Nails', 'Full set of acrylic nails', 75.00, 90, 'Nails', true, (SELECT id FROM public.services WHERE name = 'Manicure' AND is_parent = true), 4);

-- Pedicure (Parent)
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, is_parent, display_order) VALUES
('Pedicure', 'Professional pedicure services', 0.00, 60, 'Nails', true, true, 2);

-- Pedicure Variants
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, parent_service_id, display_order) VALUES
('Classic Pedicure', 'Relaxing pedicure with regular polish', 45.00, 45, 'Nails', true, (SELECT id FROM public.services WHERE name = 'Pedicure' AND is_parent = true), 1),
('Gel Pedicure', 'Premium pedicure with gel polish', 60.00, 60, 'Nails', true, (SELECT id FROM public.services WHERE name = 'Pedicure' AND is_parent = true), 2),
('Spa Pedicure', 'Luxury spa pedicure with massage and treatment', 75.00, 75, 'Nails', true, (SELECT id FROM public.services WHERE name = 'Pedicure' AND is_parent = true), 3),
('French Pedicure', 'Classic French tip pedicure', 55.00, 60, 'Nails', true, (SELECT id FROM public.services WHERE name = 'Pedicure' AND is_parent = true), 4);

-- Nail Enhancements (Parent)
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, is_parent, display_order) VALUES
('Nail Enhancements', 'Nail extensions and enhancements', 0.00, 90, 'Nails', true, true, 3);

-- Nail Enhancement Variants
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, parent_service_id, display_order) VALUES
('Acrylic Full Set', 'Full set of acrylic nail extensions', 75.00, 90, 'Nails', true, (SELECT id FROM public.services WHERE name = 'Nail Enhancements' AND is_parent = true), 1),
('Acrylic Fill', 'Acrylic nail fill and maintenance', 50.00, 60, 'Nails', true, (SELECT id FROM public.services WHERE name = 'Nail Enhancements' AND is_parent = true), 2),
('Polygel Nails', 'Lightweight polygel nail extensions', 85.00, 90, 'Nails', true, (SELECT id FROM public.services WHERE name = 'Nail Enhancements' AND is_parent = true), 3),
('Gel Extensions', 'Gel-based nail extensions', 80.00, 90, 'Nails', true, (SELECT id FROM public.services WHERE name = 'Nail Enhancements' AND is_parent = true), 4);

-- Nail Art & Add-ons (Parent)
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, is_parent, display_order) VALUES
('Nail Art & Add-ons', 'Custom nail art and design services', 0.00, 15, 'Nails', true, true, 4);

-- Nail Art Variants
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, parent_service_id, display_order) VALUES
('Nail Art (Per Nail)', 'Custom nail art per nail', 10.00, 5, 'Nails', true, (SELECT id FROM public.services WHERE name = 'Nail Art & Add-ons' AND is_parent = true), 1),
('Nail Art (Full Set)', 'Custom nail art on all nails', 50.00, 45, 'Nails', true, (SELECT id FROM public.services WHERE name = 'Nail Art & Add-ons' AND is_parent = true), 2),
('Chrome/Mirror Finish', 'Chrome or mirror powder finish', 20.00, 15, 'Nails', true, (SELECT id FROM public.services WHERE name = 'Nail Art & Add-ons' AND is_parent = true), 3);

-- ============================================================================
-- SKIN/FACIAL SERVICES
-- ============================================================================

-- Facials (Parent)
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, is_parent, display_order) VALUES
('Facial Treatments', 'Customized facial treatments for all skin types', 0.00, 60, 'Skin', true, true, 1);

-- Facial Variants
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, parent_service_id, display_order) VALUES
('Signature Facial', 'Customized facial for your skin type', 95.00, 60, 'Skin', true, (SELECT id FROM public.services WHERE name = 'Facial Treatments' AND is_parent = true), 1),
('Deep Cleansing Facial', 'Deep pore cleansing with extractions', 110.00, 75, 'Skin', true, (SELECT id FROM public.services WHERE name = 'Facial Treatments' AND is_parent = true), 2),
('Anti-Aging Facial', 'Targets fine lines and wrinkles', 135.00, 75, 'Skin', true, (SELECT id FROM public.services WHERE name = 'Facial Treatments' AND is_parent = true), 3),
('Hydrating Facial', 'Intensive hydration for dry skin', 100.00, 60, 'Skin', true, (SELECT id FROM public.services WHERE name = 'Facial Treatments' AND is_parent = true), 4),
('Acne Treatment Facial', 'Specialized treatment for acne-prone skin', 115.00, 75, 'Skin', true, (SELECT id FROM public.services WHERE name = 'Facial Treatments' AND is_parent = true), 5),
('Sensitive Skin Facials', 'Gentle treatment for sensitive skin', 100.00, 60, 'Skin', true, (SELECT id FROM public.services WHERE name = 'Facial Treatments' AND is_parent = true), 6);

-- Advanced Skin Treatments (Parent)
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, is_parent, display_order) VALUES
('Advanced Skin Treatments', 'Professional advanced skin treatments', 0.00, 60, 'Skin', true, true, 2);

-- Advanced Treatment Variants
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, parent_service_id, display_order) VALUES
('Chemical Peels', 'Professional chemical peel for skin renewal', 125.00, 45, 'Skin', true, (SELECT id FROM public.services WHERE name = 'Advanced Skin Treatments' AND is_parent = true), 1),
('Microdermabrasion', 'Exfoliation to improve skin texture', 110.00, 60, 'Skin', true, (SELECT id FROM public.services WHERE name = 'Advanced Skin Treatments' AND is_parent = true), 2),
('Dermaplaning', 'Exfoliation and peach fuzz removal', 95.00, 45, 'Skin', true, (SELECT id FROM public.services WHERE name = 'Advanced Skin Treatments' AND is_parent = true), 3),
('LED Light Therapy', 'Light therapy for various skin concerns', 85.00, 30, 'Skin', true, (SELECT id FROM public.services WHERE name = 'Advanced Skin Treatments' AND is_parent = true), 4);

-- ============================================================================
-- MASSAGE SERVICES
-- ============================================================================

-- Massage Therapy (Parent)
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, is_parent, display_order) VALUES
('Massage Therapy', 'Professional therapeutic massage services', 0.00, 60, 'Massage', true, true, 1);

-- Massage Variants
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, parent_service_id, display_order) VALUES
('Swedish Massage (60 min)', 'Relaxing full-body Swedish massage', 95.00, 60, 'Massage', true, (SELECT id FROM public.services WHERE name = 'Massage Therapy' AND is_parent = true), 1),
('Swedish Massage (90 min)', 'Extended relaxing Swedish massage', 130.00, 90, 'Massage', true, (SELECT id FROM public.services WHERE name = 'Massage Therapy' AND is_parent = true), 2),
('Deep Tissue Massage (60 min)', 'Therapeutic deep tissue massage', 110.00, 60, 'Massage', true, (SELECT id FROM public.services WHERE name = 'Massage Therapy' AND is_parent = true), 3),
('Deep Tissue Massage (90 min)', 'Extended deep tissue massage', 150.00, 90, 'Massage', true, (SELECT id FROM public.services WHERE name = 'Massage Therapy' AND is_parent = true), 4),
('Hot Stone Massage', 'Massage with heated stones', 120.00, 75, 'Massage', true, (SELECT id FROM public.services WHERE name = 'Massage Therapy' AND is_parent = true), 5),
('Aromatherapy Massage', 'Massage with essential oils', 105.00, 60, 'Massage', true, (SELECT id FROM public.services WHERE name = 'Massage Therapy' AND is_parent = true), 6),
('Sports Massage', 'Targeted massage for athletes', 115.00, 60, 'Massage', true, (SELECT id FROM public.services WHERE name = 'Massage Therapy' AND is_parent = true), 7),
('Prenatal Massage', 'Gentle massage for expecting mothers', 105.00, 60, 'Massage', true, (SELECT id FROM public.services WHERE name = 'Massage Therapy' AND is_parent = true), 8),
('Lymphatic Drainage', 'Gentle massage to support lymphatic system', 110.00, 60, 'Massage', true, (SELECT id FROM public.services WHERE name = 'Massage Therapy' AND is_parent = true), 9),
('Specialized Therapy', 'Customized therapeutic massage', 120.00, 75, 'Massage', true, (SELECT id FROM public.services WHERE name = 'Massage Therapy' AND is_parent = true), 10);

-- ============================================================================
-- WAXING SERVICES
-- ============================================================================

-- Facial Waxing (Parent)
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, is_parent, display_order) VALUES
('Facial Waxing', 'Professional facial hair removal', 0.00, 15, 'Waxing', true, true, 1);

-- Facial Waxing Variants
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, parent_service_id, display_order) VALUES
('Eyebrow Wax', 'Professional eyebrow shaping', 25.00, 15, 'Waxing', true, (SELECT id FROM public.services WHERE name = 'Facial Waxing' AND is_parent = true), 1),
('Upper Lip Wax', 'Quick upper lip hair removal', 15.00, 10, 'Waxing', true, (SELECT id FROM public.services WHERE name = 'Facial Waxing' AND is_parent = true), 2),
('Chin Wax', 'Chin and jawline hair removal', 18.00, 10, 'Waxing', true, (SELECT id FROM public.services WHERE name = 'Facial Waxing' AND is_parent = true), 3),
('Full Face Wax', 'Complete facial waxing service', 50.00, 30, 'Waxing', true, (SELECT id FROM public.services WHERE name = 'Facial Waxing' AND is_parent = true), 4);

-- Body Waxing (Parent)
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, is_parent, display_order) VALUES
('Body Waxing', 'Professional body hair removal services', 0.00, 30, 'Waxing', true, true, 2);

-- Body Waxing Variants
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, parent_service_id, display_order) VALUES
('Underarm Wax', 'Underarm hair removal', 25.00, 15, 'Waxing', true, (SELECT id FROM public.services WHERE name = 'Body Waxing' AND is_parent = true), 1),
('Bikini Wax', 'Basic bikini line waxing', 45.00, 30, 'Waxing', true, (SELECT id FROM public.services WHERE name = 'Body Waxing' AND is_parent = true), 2),
('Brazilian Wax', 'Full Brazilian waxing service', 70.00, 45, 'Waxing', true, (SELECT id FROM public.services WHERE name = 'Body Waxing' AND is_parent = true), 3),
('Half Leg Wax', 'Lower leg waxing', 40.00, 30, 'Waxing', true, (SELECT id FROM public.services WHERE name = 'Body Waxing' AND is_parent = true), 4),
('Full Leg Wax', 'Full leg waxing service', 70.00, 45, 'Waxing', true, (SELECT id FROM public.services WHERE name = 'Body Waxing' AND is_parent = true), 5),
('Torso Wax', 'Chest or back waxing', 55.00, 40, 'Waxing', true, (SELECT id FROM public.services WHERE name = 'Body Waxing' AND is_parent = true), 6);

-- Hair Removal - Threading (Parent)
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, is_parent, display_order) VALUES
('Hair Removal - Threading', 'Precise hair removal using threading technique', 0.00, 15, 'Waxing', true, true, 3);

-- Threading Variants
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, parent_service_id, display_order) VALUES
('Eyebrow Threading', 'Precise eyebrow shaping with thread', 22.00, 15, 'Waxing', true, (SELECT id FROM public.services WHERE name = 'Hair Removal - Threading' AND is_parent = true), 1),
('Upper Lip Threading', 'Upper lip hair removal with thread', 12.00, 10, 'Waxing', true, (SELECT id FROM public.services WHERE name = 'Hair Removal - Threading' AND is_parent = true), 2);

-- ============================================================================
-- TATTOO SERVICES
-- ============================================================================

-- Tattoo (Parent)
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, is_parent, display_order) VALUES
('Tattoo Services', 'Professional tattoo artistry', 0.00, 60, 'Tattoo', true, true, 1);

-- Tattoo Variants
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, parent_service_id, display_order) VALUES
('Tattoo by Size', 'Pricing based on tattoo size', 150.00, 120, 'Tattoo', true, (SELECT id FROM public.services WHERE name = 'Tattoo Services' AND is_parent = true), 1),
('Tattoo by Type', 'Custom tattoo work - pricing varies', 200.00, 180, 'Tattoo', true, (SELECT id FROM public.services WHERE name = 'Tattoo Services' AND is_parent = true), 2),
('Tattoo Consultation & Design', 'Design consultation for custom tattoo', 50.00, 60, 'Tattoo', true, (SELECT id FROM public.services WHERE name = 'Tattoo Services' AND is_parent = true), 3),
('Custom Tattoo Session', 'Extended custom tattoo session', 400.00, 240, 'Tattoo', true, (SELECT id FROM public.services WHERE name = 'Tattoo Services' AND is_parent = true), 4);

-- ============================================================================
-- PIERCING SERVICES
-- ============================================================================

INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, is_parent, display_order) VALUES
('Ear Piercing', 'Professional ear piercing service', 40.00, 20, 'Piercing', true, false, 1),
('Body Piercing', 'Professional body piercing service', 60.00, 30, 'Piercing', true, false, 2);

-- ============================================================================
-- EYEBROW & LASH SERVICES
-- ============================================================================

-- Eyebrow Services (Parent)
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, is_parent, display_order) VALUES
('Eyebrow Services', 'Professional eyebrow shaping and enhancement', 0.00, 30, 'Eyebrow', true, true, 1);

-- Eyebrow Variants
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, parent_service_id, display_order) VALUES
('Eyebrow Shaping/Wax', 'Professional eyebrow shaping', 25.00, 15, 'Eyebrow', true, (SELECT id FROM public.services WHERE name = 'Eyebrow Services' AND is_parent = true), 1),
('Eyebrow Tinting', 'Professional eyebrow tinting', 30.00, 20, 'Eyebrow', true, (SELECT id FROM public.services WHERE name = 'Eyebrow Services' AND is_parent = true), 2),
('Eyebrow Lamination', 'Eyebrow lamination for fuller brows', 65.00, 45, 'Eyebrow', true, (SELECT id FROM public.services WHERE name = 'Eyebrow Services' AND is_parent = true), 3);

-- Lash Services (Parent)
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, is_parent, display_order) VALUES
('Lash Services', 'Professional eyelash enhancement services', 0.00, 90, 'Lash', true, true, 1);

-- Lash Variants
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, parent_service_id, display_order) VALUES
('Lash Extensions', 'Semi-permanent individual lash extensions', 150.00, 120, 'Lash', true, (SELECT id FROM public.services WHERE name = 'Lash Services' AND is_parent = true), 1),
('Lash Extension Fill', 'Touch-up for existing extensions', 75.00, 60, 'Lash', true, (SELECT id FROM public.services WHERE name = 'Lash Services' AND is_parent = true), 2),
('Lash Lift & Tint', 'Natural lash lifting and tinting', 85.00, 60, 'Lash', true, (SELECT id FROM public.services WHERE name = 'Lash Services' AND is_parent = true), 3);

-- ============================================================================
-- PMU (PERMANENT MAKEUP) SERVICES
-- ============================================================================

-- PMU (Parent)
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, is_parent, display_order) VALUES
('Permanent Makeup (PMU)', 'Semi-permanent cosmetic tattooing', 0.00, 120, 'PMU', true, true, 1);

-- PMU Variants
INSERT INTO public.services (name, description, price, duration_minutes, category, is_active, parent_service_id, display_order) VALUES
('Microblading', 'Hair-stroke eyebrow tattooing', 400.00, 150, 'PMU', true, (SELECT id FROM public.services WHERE name = 'Permanent Makeup (PMU)' AND is_parent = true), 1),
('Permanent Eyeliner', 'Semi-permanent eyeliner application', 350.00, 120, 'PMU', true, (SELECT id FROM public.services WHERE name = 'Permanent Makeup (PMU)' AND is_parent = true), 2),
('PMU Specialty Services', 'Custom PMU services and corrections', 450.00, 180, 'PMU', true, (SELECT id FROM public.services WHERE name = 'Permanent Makeup (PMU)' AND is_parent = true), 3);

-- Update timestamps
UPDATE public.services SET created_at = NOW() - INTERVAL '30 days' WHERE category = 'Hair';
UPDATE public.services SET created_at = NOW() - INTERVAL '20 days' WHERE category = 'Nails';
UPDATE public.services SET created_at = NOW() - INTERVAL '15 days' WHERE category = 'Skin';
UPDATE public.services SET created_at = NOW() - INTERVAL '10 days' WHERE category = 'Waxing';
UPDATE public.services SET created_at = NOW() - INTERVAL '5 days' WHERE category = 'Massage';
UPDATE public.services SET created_at = NOW() WHERE category IN ('Tattoo', 'Piercing', 'Eyebrow', 'Lash', 'PMU');
