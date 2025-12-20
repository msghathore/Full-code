-- =====================================================
-- PRODUCTS AND REVIEWS MIGRATION
-- Creates real salon/spa products with reviews
-- =====================================================

-- Drop existing products and recreate with more fields
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS ingredients TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS usage_instructions TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS average_rating DECIMAL(2,1) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_price DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create product_reviews table
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    review_text TEXT NOT NULL,
    is_verified_purchase BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);

-- Enable RLS on product_reviews
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_reviews
CREATE POLICY "Anyone can view approved reviews" ON product_reviews
    FOR SELECT USING (is_approved = true);

CREATE POLICY "Anyone can insert reviews" ON product_reviews
    FOR INSERT WITH CHECK (true);

-- Update products RLS to allow staff management
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
CREATE POLICY "Anyone can view products" ON products
    FOR SELECT USING (true);

CREATE POLICY "Staff can insert products" ON products
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff can update products" ON products
    FOR UPDATE USING (true);

CREATE POLICY "Staff can delete products" ON products
    FOR DELETE USING (true);

-- Clear existing products and insert real salon/spa products
DELETE FROM products;

-- Insert Hair Care Products
INSERT INTO products (id, name, description, price, category, image_url, is_active, stock_quantity, sku, brand, weight, ingredients, usage_instructions, average_rating, review_count, featured)
VALUES
    ('11111111-1111-1111-1111-111111111101', 'Luxury Argan Oil Hair Serum', 'Professional-grade hair serum infused with 100% pure Moroccan argan oil and vitamin E. Instantly tames frizz, adds brilliant shine, and protects against heat damage up to 450°F. Perfect for all hair types.', 89.00, 'Hair Care', '/images/product-1.jpg', true, 25, 'HC-ARGAN-001', 'Zavira Professional', '100ml / 3.4 fl oz', 'Argan Oil, Vitamin E, Cyclomethicone, Dimethicone, Fragrance', 'Apply 2-3 drops to damp or dry hair. Focus on mid-lengths and ends. Style as desired.', 4.8, 47, true),

    ('11111111-1111-1111-1111-111111111102', 'Keratin Repair Shampoo', 'Sulfate-free deep cleansing shampoo enriched with keratin protein complex. Rebuilds damaged hair from within, restores elasticity, and provides long-lasting moisture. Color-safe formula.', 65.00, 'Hair Care', '/images/product-4.jpg', true, 30, 'HC-KERAT-002', 'Zavira Professional', '300ml / 10.1 fl oz', 'Aqua, Keratin, Aloe Vera Extract, Panthenol, Glycerin, Coconut Oil', 'Massage into wet hair and scalp. Rinse thoroughly. Follow with conditioner for best results.', 4.6, 38, false),

    ('11111111-1111-1111-1111-111111111103', 'Volumizing Root Boost Spray', 'Lightweight volumizing spray that lifts roots for all-day body and bounce. Heat-activated formula provides flexible hold without stiffness. Adds thickness to fine, limp hair.', 45.00, 'Hair Care', '/images/product-1.jpg', true, 40, 'HC-VOLUM-003', 'Zavira Professional', '200ml / 6.7 fl oz', 'Aqua, VP/VA Copolymer, Hydrolyzed Wheat Protein, Biotin, Panthenol', 'Spray onto damp roots. Blow dry while lifting hair at roots for maximum volume.', 4.4, 29, false),

    ('11111111-1111-1111-1111-111111111104', 'Deep Conditioning Hair Mask', 'Intensive weekly treatment that penetrates deep into the hair shaft. Repairs extreme damage, restores moisture balance, and leaves hair silky soft. Contains quinoa protein and shea butter.', 75.00, 'Hair Care', '/images/product-1.jpg', true, 20, 'HC-MASK-004', 'Zavira Professional', '250ml / 8.4 fl oz', 'Shea Butter, Quinoa Protein, Argan Oil, Coconut Oil, Honey Extract', 'Apply to clean, damp hair. Leave on for 5-10 minutes. Rinse thoroughly. Use weekly.', 4.9, 52, true);

-- Insert Skin Care Products
INSERT INTO products (id, name, description, price, category, image_url, is_active, stock_quantity, sku, brand, weight, ingredients, usage_instructions, average_rating, review_count, featured)
VALUES
    ('11111111-1111-1111-1111-111111111201', 'Premium Hyaluronic Face Cream', 'Advanced anti-aging moisturizer with triple-weight hyaluronic acid complex. Plumps fine lines, locks in 72-hour hydration, and creates a smooth canvas for makeup. Dermatologist tested.', 120.00, 'Skin Care', '/images/product-2.jpg', true, 15, 'SC-HYAL-001', 'Zavira Luxe', '50ml / 1.7 fl oz', 'Hyaluronic Acid (3 weights), Vitamin C, Niacinamide, Squalane, Peptides', 'Apply morning and evening to cleansed face and neck. Gently massage in upward motions.', 4.7, 63, true),

    ('11111111-1111-1111-1111-111111111202', 'Retinol Night Renewal Serum', 'Clinical-strength retinol serum that accelerates cell turnover while you sleep. Reduces wrinkles, evens skin tone, and refines pores. Encapsulated retinol for gentle, effective delivery.', 150.00, 'Skin Care', '/images/product-5.jpg', true, 12, 'SC-RETIN-002', 'Zavira Luxe', '30ml / 1.0 fl oz', 'Encapsulated Retinol 0.5%, Bakuchiol, Vitamin E, Ceramides, Squalane', 'Apply 2-3 drops to face at night after cleansing. Start 2-3 times weekly, gradually increase.', 4.8, 41, true),

    ('11111111-1111-1111-1111-111111111203', 'Vitamin C Brightening Serum', 'Potent 20% stabilized vitamin C serum that fades dark spots, boosts collagen, and provides antioxidant protection. Ferulic acid enhances vitamin C stability and effectiveness.', 95.00, 'Skin Care', '/images/product-2.jpg', true, 18, 'SC-VITC-003', 'Zavira Luxe', '30ml / 1.0 fl oz', 'L-Ascorbic Acid 20%, Ferulic Acid, Vitamin E, Hyaluronic Acid', 'Apply 4-5 drops to clean face in the morning before moisturizer and sunscreen.', 4.6, 55, false),

    ('11111111-1111-1111-1111-111111111204', 'Gentle Exfoliating Facial Scrub', 'Micro-fine exfoliant with natural jojoba beads and papaya enzymes. Removes dead skin cells, unclogs pores, and reveals brighter, smoother skin. Suitable for sensitive skin.', 55.00, 'Skin Care', '/images/product-2.jpg', true, 35, 'SC-EXFOL-004', 'Zavira Luxe', '100ml / 3.4 fl oz', 'Jojoba Beads, Papaya Enzyme, Aloe Vera, Green Tea Extract, Chamomile', 'Massage onto damp face in circular motions. Rinse with lukewarm water. Use 2-3 times weekly.', 4.5, 33, false),

    ('11111111-1111-1111-1111-111111111205', 'Hydrating Rose Facial Toner', 'Alcohol-free toner infused with Bulgarian rose water and witch hazel. Balances pH, tightens pores, and prepares skin for optimal serum absorption. Refreshing floral scent.', 42.00, 'Skin Care', '/images/product-2.jpg', true, 45, 'SC-TONER-005', 'Zavira Luxe', '200ml / 6.7 fl oz', 'Rose Water, Witch Hazel, Glycerin, Aloe Vera, Vitamin B5', 'Apply with cotton pad or spray directly onto face after cleansing. Pat gently to absorb.', 4.4, 28, false);

-- Insert Nail Care Products
INSERT INTO products (id, name, description, price, category, image_url, is_active, stock_quantity, sku, brand, weight, ingredients, usage_instructions, average_rating, review_count, featured)
VALUES
    ('11111111-1111-1111-1111-111111111301', 'Professional Gel Polish Set', 'Salon-quality gel polish collection featuring 6 trending colors. Long-lasting 21-day wear, high-shine finish, and chip-resistant formula. Includes base coat and top coat.', 85.00, 'Nail Care', '/images/product-3.jpg', true, 8, 'NC-GELSET-001', 'Zavira Nails', '8 x 15ml bottles', 'Methacrylate Copolymer, Nitrocellulose, Acetyl Tributyl Citrate', 'Apply base coat, cure 30 sec. Apply 2 coats of color, curing between. Finish with top coat.', 4.7, 45, true),

    ('11111111-1111-1111-1111-111111111302', 'Cuticle Oil & Nail Strengthener', 'Intensive nail treatment oil with vitamin E and jojoba. Nourishes dry cuticles, strengthens brittle nails, and promotes healthy nail growth. Sweet almond scent.', 28.00, 'Nail Care', '/images/product-3.jpg', true, 50, 'NC-OIL-002', 'Zavira Nails', '15ml / 0.5 fl oz', 'Jojoba Oil, Vitamin E, Sweet Almond Oil, Tea Tree Oil, Biotin', 'Apply to cuticles and nails daily. Massage gently until absorbed. Best used before bed.', 4.5, 32, false),

    ('11111111-1111-1111-1111-111111111303', 'Quick-Dry Nail Polish Collection', 'Fast-drying nail lacquer set in 8 classic and trendy shades. Dries in 60 seconds, lasts up to 7 days without chipping. Formulated without harsh chemicals.', 45.00, 'Nail Care', '/images/product-3.jpg', true, 25, 'NC-QUICK-003', 'Zavira Nails', '8 x 10ml bottles', '10-Free Formula: No formaldehyde, toluene, DBP, or other harmful chemicals', 'Apply thin coats for fastest drying. Allow 60 seconds between coats. Use top coat for extra shine.', 4.3, 27, false),

    ('11111111-1111-1111-1111-111111111304', 'Nail Art Toolkit', 'Complete nail art kit with dotting tools, striping brushes, rhinestones, glitter, and nail stickers. Perfect for creating salon-quality nail designs at home.', 35.00, 'Nail Care', '/images/product-3.jpg', true, 15, 'NC-ART-004', 'Zavira Nails', 'Complete Kit', 'Includes: 5 dotting tools, 3 brushes, 500 rhinestones, 6 glitters, 20 sticker sheets', 'Clean nails and apply base color. Use tools to create designs. Seal with top coat when dry.', 4.6, 19, false);

-- Insert Makeup Products
INSERT INTO products (id, name, description, price, category, image_url, is_active, stock_quantity, sku, brand, weight, ingredients, usage_instructions, average_rating, review_count, featured)
VALUES
    ('11111111-1111-1111-1111-111111111401', 'Professional Makeup Brush Set', 'Luxurious 15-piece brush collection with synthetic vegan bristles. Includes face, eye, and lip brushes in elegant rose gold handles. Comes with travel case.', 95.00, 'Makeup', '/images/product-6.jpg', true, 5, 'MK-BRUSH-001', 'Zavira Beauty', '15 brushes + case', 'Synthetic Taklon Bristles, Aluminum Ferrules, Wooden Handles', 'Use appropriate brush for each product. Clean weekly with brush cleanser. Store upright.', 4.8, 67, true),

    ('11111111-1111-1111-1111-111111111402', 'Long-Wear Foundation', 'Buildable medium-to-full coverage foundation that lasts 24 hours. Natural matte finish, transfer-resistant, and suitable for all skin types. Available in 40 shades.', 48.00, 'Makeup', '/images/product-6.jpg', true, 60, 'MK-FOUND-002', 'Zavira Beauty', '30ml / 1.0 fl oz', 'Water, Cyclopentasiloxane, Titanium Dioxide, Iron Oxides, Niacinamide', 'Apply with brush or sponge, starting from center of face and blending outward.', 4.5, 89, false),

    ('11111111-1111-1111-1111-111111111403', 'Volumizing Mascara', 'Dramatic volume mascara with hourglass wand that coats every lash. Smudge-proof, flake-free formula lasts all day. Enriched with castor oil for lash health.', 32.00, 'Makeup', '/images/product-6.jpg', true, 40, 'MK-MASC-003', 'Zavira Beauty', '12ml / 0.4 fl oz', 'Aqua, Beeswax, Castor Oil, Iron Oxides, Panthenol, Keratin', 'Wiggle wand at lash base and sweep to tips. Apply 2 coats for extra drama.', 4.4, 54, false),

    ('11111111-1111-1111-1111-111111111404', 'Hydrating Lip Gloss Set', 'Collection of 6 plumping lip glosses in nude to berry shades. Non-sticky formula with hyaluronic acid for lasting moisture and subtle color. Vanilla mint scent.', 55.00, 'Makeup', '/images/product-6.jpg', true, 22, 'MK-GLOSS-004', 'Zavira Beauty', '6 x 4ml tubes', 'Hyaluronic Acid, Vitamin E, Jojoba Oil, Natural Flavoring, Mica', 'Apply directly to lips or over lipstick for extra shine. Reapply as desired.', 4.6, 36, false);

-- Insert Beauty Tools
INSERT INTO products (id, name, description, price, category, image_url, is_active, stock_quantity, sku, brand, weight, ingredients, usage_instructions, average_rating, review_count, featured)
VALUES
    ('11111111-1111-1111-1111-111111111501', 'Jade Facial Roller & Gua Sha Set', 'Authentic grade-A jade stone facial massage tools. Reduces puffiness, improves circulation, and helps skincare products absorb better. Includes velvet storage pouch.', 65.00, 'Tools', '/images/product-4.jpg', true, 18, 'TL-JADE-001', 'Zavira Wellness', 'Roller + Gua Sha', '100% Natural Jade Stone, Zinc Alloy Frame', 'Store in refrigerator for extra cooling. Roll upward and outward on clean, moisturized skin.', 4.7, 42, true),

    ('11111111-1111-1111-1111-111111111502', 'LED Light Therapy Mask', 'Professional-grade LED face mask with 7 light modes for various skin concerns. Red for anti-aging, blue for acne, green for hyperpigmentation. Rechargeable and portable.', 189.00, 'Tools', '/images/product-4.jpg', true, 8, 'TL-LED-002', 'Zavira Tech', 'One Size', 'Medical-Grade LED Lights, Silicone Shell, Rechargeable Battery', 'Cleanse face, wear mask for 10-20 minutes. Use 3-5 times per week for best results.', 4.8, 31, true),

    ('11111111-1111-1111-1111-111111111503', 'Professional Hair Dryer', 'Salon-grade ionic hair dryer with 3 heat and 2 speed settings. Reduces frizz, adds shine, and cuts drying time by 50%. Includes concentrator and diffuser attachments.', 145.00, 'Tools', '/images/product-4.jpg', true, 12, 'TL-DRYER-003', 'Zavira Professional', '1875W', 'Ionic Technology, Ceramic Heating Element, Cool Shot Button', 'Keep dryer 6 inches from hair. Move continuously to prevent heat damage. Finish with cool shot.', 4.6, 48, false),

    ('11111111-1111-1111-1111-111111111504', 'Electric Nail Drill Kit', 'Complete electric manicure/pedicure system with 11 interchangeable bits. Adjustable speed up to 20,000 RPM. Professional results at home. USB rechargeable.', 79.00, 'Tools', '/images/product-4.jpg', true, 15, 'TL-DRILL-004', 'Zavira Nails', 'Complete Kit', 'Includes: Drill Unit, 11 Bits, Charging Cable, Carrying Case', 'Start with low speed. Use appropriate bit for each task. Clean bits after each use.', 4.5, 23, false),

    ('11111111-1111-1111-1111-111111111505', 'Facial Steamer', 'Professional nano-ionic facial steamer for deep pore cleansing. Produces ultra-fine steam for maximum penetration. 10-minute steam time. Auto shut-off for safety.', 55.00, 'Tools', '/images/product-4.jpg', true, 20, 'TL-STEAM-005', 'Zavira Wellness', 'Compact Size', 'Nano-Ionic Steam Technology, BPA-Free Water Tank', 'Fill with distilled water. Steam face for 5-10 minutes from 6-8 inch distance. Use 1-2x weekly.', 4.4, 35, false);

-- Insert Body Care Products
INSERT INTO products (id, name, description, price, category, image_url, is_active, stock_quantity, sku, brand, weight, ingredients, usage_instructions, average_rating, review_count, featured)
VALUES
    ('11111111-1111-1111-1111-111111111601', 'Luxury Body Oil', 'Silky, fast-absorbing body oil with 24K gold flakes. Deeply nourishes, adds subtle shimmer, and leaves skin glowing. Intoxicating jasmine and vanilla scent.', 78.00, 'Body Care', '/images/product-5.jpg', true, 22, 'BC-OIL-001', 'Zavira Luxe', '100ml / 3.4 fl oz', '24K Gold Flakes, Jojoba Oil, Argan Oil, Jasmine Extract, Vitamin E', 'Apply to damp skin after shower. Massage until absorbed. Perfect for special occasions.', 4.9, 38, true),

    ('11111111-1111-1111-1111-111111111602', 'Exfoliating Body Scrub', 'Himalayan pink salt scrub with coconut oil and essential oils. Buffs away dead skin, improves texture, and leaves skin incredibly smooth. Fresh citrus scent.', 45.00, 'Body Care', '/images/product-5.jpg', true, 30, 'BC-SCRUB-002', 'Zavira Wellness', '300g / 10.5 oz', 'Himalayan Pink Salt, Coconut Oil, Grapefruit Oil, Lemon Oil, Vitamin E', 'Apply to wet skin in circular motions. Focus on rough areas like elbows and knees. Rinse well.', 4.6, 44, false),

    ('11111111-1111-1111-1111-111111111603', 'Intensive Hand Cream', 'Rich, non-greasy hand cream for dry, hardworking hands. Shea butter and glycerin provide lasting moisture. Absorbs quickly, leaving hands soft and protected.', 25.00, 'Body Care', '/images/product-5.jpg', true, 55, 'BC-HAND-003', 'Zavira Luxe', '75ml / 2.5 fl oz', 'Shea Butter, Glycerin, Aloe Vera, Vitamin E, Beeswax', 'Apply liberally to hands as needed. Pay special attention to cuticles and knuckles.', 4.5, 61, false);

-- Now insert reviews for each product
-- Hair Care Reviews
INSERT INTO product_reviews (product_id, customer_name, rating, title, review_text, is_verified_purchase, helpful_count)
VALUES
    ('11111111-1111-1111-1111-111111111101', 'Sarah M.', 5, 'Holy grail product!', 'I have tried SO many hair serums and this one is hands down the best. My frizzy, damaged hair is now smooth and shiny. A little goes a long way - one bottle lasts me 3 months!', true, 24),
    ('11111111-1111-1111-1111-111111111101', 'Jennifer L.', 5, 'Worth every penny', 'The argan oil serum has completely transformed my hair. It was dry and brittle from years of coloring, but now it looks healthier than ever. My stylist even asked what I''m using!', true, 18),
    ('11111111-1111-1111-1111-111111111101', 'Amanda K.', 4, 'Great but pricey', 'Love the results - my hair is so soft and manageable now. The only reason I''m not giving 5 stars is the price. But you only need a tiny amount, so it does last a while.', true, 12),
    ('11111111-1111-1111-1111-111111111101', 'Michelle R.', 5, 'Saved my bleached hair', 'After going platinum blonde, my hair was like straw. This serum brought it back to life. It''s not heavy or greasy at all. Absolutely love it!', true, 15),

    ('11111111-1111-1111-1111-111111111102', 'Lisa T.', 5, 'Finally sulfate-free that works!', 'Most sulfate-free shampoos leave my hair feeling waxy, but this one is different. It cleans thoroughly while keeping my hair soft. My color also lasts longer now.', true, 22),
    ('11111111-1111-1111-1111-111111111102', 'Rachel B.', 4, 'Good for damaged hair', 'My hair feels stronger after using this for a month. The keratin really does help. Only wish it lathered a bit more, but I understand that''s because it''s sulfate-free.', true, 11),
    ('11111111-1111-1111-1111-111111111102', 'Emily W.', 5, 'Salon quality at home', 'My hairdresser uses this brand at the salon and I was thrilled to find it here. My hair has never been healthier. Will keep repurchasing!', true, 16),

    ('11111111-1111-1111-1111-111111111103', 'Brittany S.', 4, 'Great for fine hair', 'This spray gives my fine, limp hair actual volume! It doesn''t weigh it down or make it crunchy. Just nice, natural-looking body.', true, 9),
    ('11111111-1111-1111-1111-111111111103', 'Nicole P.', 5, 'Game changer for my hair', 'I have very flat hair and have tried everything. This actually works! My blowouts look like I got them done at a salon.', true, 13),

    ('11111111-1111-1111-1111-111111111104', 'Christina M.', 5, 'Best hair mask ever', 'This mask is incredible. I use it once a week and my hair has never looked better. It''s like getting a salon treatment at home. The quinoa protein really works.', true, 28),
    ('11111111-1111-1111-1111-111111111104', 'Diana H.', 5, 'Saved my over-processed hair', 'After years of heat styling and coloring, my hair was a mess. This mask has been a lifesaver. Super moisturizing without being heavy.', true, 21);

-- Skin Care Reviews
INSERT INTO product_reviews (product_id, customer_name, rating, title, review_text, is_verified_purchase, helpful_count)
VALUES
    ('11111111-1111-1111-1111-111111111201', 'Katherine J.', 5, 'Visible results in 2 weeks', 'I''m 45 and was starting to see fine lines around my eyes. After 2 weeks of using this cream, I noticed a real difference. My skin looks plumper and more hydrated.', true, 35),
    ('11111111-1111-1111-1111-111111111201', 'Samantha G.', 5, 'Best moisturizer I''ve used', 'The triple hyaluronic acid formula is genius. My skin stays hydrated all day, even in winter. It''s lightweight but so effective.', true, 28),
    ('11111111-1111-1111-1111-111111111201', 'Patricia L.', 4, 'Lovely texture', 'This cream absorbs beautifully and doesn''t pill under makeup. I''ve been using it for a month and my skin definitely looks healthier. A bit expensive, but effective.', true, 19),
    ('11111111-1111-1111-1111-111111111201', 'Rebecca N.', 5, 'My skin glows now!', 'I get compliments on my skin constantly since I started using this. It''s become my holy grail moisturizer. Worth every dollar.', true, 24),

    ('11111111-1111-1111-1111-111111111202', 'Jennifer C.', 5, 'Incredible anti-aging serum', 'I was hesitant to try retinol because I have sensitive skin, but this encapsulated formula is so gentle. My wrinkles are less noticeable and my skin tone is more even.', true, 31),
    ('11111111-1111-1111-1111-111111111202', 'Margaret A.', 4, 'Effective but takes time', 'You need patience with retinol, but it''s worth it. After 6 weeks, I see real improvement in my fine lines and skin texture. Start slow!', true, 22),
    ('11111111-1111-1111-1111-111111111202', 'Susan D.', 5, 'Finally found the one', 'I''ve tried many retinol products and this is the best. No irritation, peeling, or dryness - just results. My skin looks years younger.', true, 27),

    ('11111111-1111-1111-1111-111111111203', 'Laura F.', 5, 'Dark spots fading!', 'I had sun damage from my 20s and this vitamin C serum is actually fading those spots. My skin is brighter overall too. Very impressed.', true, 25),
    ('11111111-1111-1111-1111-111111111203', 'Angela R.', 4, 'Good but strong', 'This is a potent serum - 20% vitamin C is no joke. Started tingling at first but my skin adjusted. Now I love the glow it gives me.', true, 17),

    ('11111111-1111-1111-1111-111111111204', 'Melissa T.', 5, 'Gentle yet effective', 'Perfect for my sensitive skin! The jojoba beads are so gentle but really do exfoliate. My skin feels baby soft after using this.', true, 14),
    ('11111111-1111-1111-1111-111111111204', 'Heather K.', 4, 'Nice scrub', 'Good exfoliant that doesn''t scratch or irritate. The papaya enzymes add extra exfoliation. My skin looks brighter after each use.', true, 11),

    ('11111111-1111-1111-1111-111111111205', 'Victoria M.', 4, 'Refreshing and soothing', 'I love this toner! The rose scent is divine and it really does prep my skin for serums. No alcohol burn, just hydration.', true, 13),
    ('11111111-1111-1111-1111-111111111205', 'Stephanie W.', 5, 'My skin loves this', 'Been using this toner for 3 months now. It balances my combination skin perfectly. Pores look smaller too.', true, 10);

-- Nail Care Reviews
INSERT INTO product_reviews (product_id, customer_name, rating, title, review_text, is_verified_purchase, helpful_count)
VALUES
    ('11111111-1111-1111-1111-111111111301', 'Ashley B.', 5, 'Salon quality at home!', 'These gel polishes are amazing! I can do my own gel manicures that last 2-3 weeks. The colors are gorgeous and the formula applies smoothly.', true, 29),
    ('11111111-1111-1111-1111-111111111301', 'Jessica H.', 5, 'Love the color selection', 'The shades in this set are perfect - wearable everyday colors plus a few fun ones. Great value for 8 bottles including base and top coat.', true, 21),
    ('11111111-1111-1111-1111-111111111301', 'Kimberly S.', 4, 'Good quality gels', 'Nice gel polishes that cure well and last. Only giving 4 stars because one color was a bit streaky, but overall very happy.', true, 14),

    ('11111111-1111-1111-1111-111111111302', 'Danielle L.', 5, 'Saved my nails!', 'My nails were peeling and breaking constantly. This cuticle oil has made such a difference. My nails are stronger and my cuticles are no longer dry.', true, 18),
    ('11111111-1111-1111-1111-111111111302', 'Megan P.', 4, 'Nice oil, small bottle', 'The oil itself is great - absorbs quickly and smells nice. Just wish the bottle was bigger for the price.', true, 11),

    ('11111111-1111-1111-1111-111111111303', 'Taylor R.', 4, 'Quick dry is real!', 'These polishes really do dry in about a minute. Perfect for when I''m in a hurry. Colors are pretty and chip-resistant.', true, 15),
    ('11111111-1111-1111-1111-111111111303', 'Christina V.', 5, '10-free and gorgeous', 'Love that these are 10-free formula. No strong smell and they don''t damage my nails. Will definitely buy again.', true, 12),

    ('11111111-1111-1111-1111-111111111304', 'Brianna M.', 5, 'So fun for nail art!', 'This kit has everything I need to create cute nail designs. The dotting tools and brushes are good quality. My nails look so professional now!', true, 16);

-- Makeup Reviews
INSERT INTO product_reviews (product_id, customer_name, rating, title, review_text, is_verified_purchase, helpful_count)
VALUES
    ('11111111-1111-1111-1111-111111111401', 'Hannah G.', 5, 'Best brushes I''ve owned', 'These brushes are incredibly soft and apply makeup beautifully. The rose gold handles are so pretty. Worth investing in quality brushes!', true, 38),
    ('11111111-1111-1111-1111-111111111401', 'Olivia J.', 5, 'Professional quality', 'I''m a makeup artist and these brushes compare to my high-end professional ones. Great value for the quality you get.', true, 32),
    ('11111111-1111-1111-1111-111111111401', 'Grace L.', 4, 'Beautiful and functional', 'Love these brushes! They''re soft, don''t shed, and blend makeup perfectly. The travel case is a nice bonus.', true, 24),

    ('11111111-1111-1111-1111-111111111402', 'Madison K.', 5, 'Finally found my shade!', 'With 40 shades, I found my perfect match. The coverage is buildable and it really does last all day. No oxidizing either.', true, 45),
    ('11111111-1111-1111-1111-111111111402', 'Sophia N.', 4, 'Great everyday foundation', 'Good coverage without looking cakey. Sets nicely and doesn''t transfer. My only wish is that it was a bit more hydrating.', true, 28),
    ('11111111-1111-1111-1111-111111111402', 'Emma R.', 5, 'Love this foundation', 'I have oily skin and this foundation stays put all day. It controls shine without looking flat. My new go-to!', true, 31),

    ('11111111-1111-1111-1111-111111111403', 'Isabella C.', 4, 'Dramatic lashes', 'This mascara gives great volume and length. It doesn''t flake or smudge. The hourglass wand really does coat every lash.', true, 20),
    ('11111111-1111-1111-1111-111111111403', 'Ava H.', 5, 'My new favorite mascara', 'I''ve tried so many mascaras and this one is amazing. It makes my lashes look full and natural. And it''s infused with castor oil!', true, 17),

    ('11111111-1111-1111-1111-111111111404', 'Mia D.', 5, 'Not sticky at all!', 'Finally a lip gloss that looks gorgeous but doesn''t feel gross on my lips. These are so hydrating and the colors are beautiful.', true, 22),
    ('11111111-1111-1111-1111-111111111404', 'Chloe B.', 4, 'Pretty and moisturizing', 'Love the color range - perfect nudes to berries. They keep my lips soft all day. The vanilla mint scent is nice too.', true, 15);

-- Tools Reviews
INSERT INTO product_reviews (product_id, customer_name, rating, title, review_text, is_verified_purchase, helpful_count)
VALUES
    ('11111111-1111-1111-1111-111111111501', 'Emma S.', 5, 'Morning ritual must-have', 'I keep this in my fridge and use it every morning. Reduces my puffiness and helps my serums absorb better. Beautiful jade quality.', true, 26),
    ('11111111-1111-1111-1111-111111111501', 'Lily M.', 5, 'Authentic and effective', 'You can tell this is real jade - it stays cold and feels luxurious. The gua sha is great for facial massage. Love the velvet pouch.', true, 19),
    ('11111111-1111-1111-1111-111111111501', 'Rose T.', 4, 'Nice self-care tool', 'Great for a relaxing facial massage. I use it while watching TV at night. My skin does look less puffy in the morning.', true, 14),

    ('11111111-1111-1111-1111-111111111502', 'Sophie L.', 5, 'Amazing results!', 'I was skeptical about LED therapy but this mask has cleared up my acne and improved my skin texture. Use it while relaxing - so easy.', true, 23),
    ('11111111-1111-1111-1111-111111111502', 'Julia K.', 5, 'Worth the investment', 'Yes, it''s pricey, but the results speak for themselves. My skin is clearer and more even-toned. Love the 7 different light modes.', true, 18),

    ('11111111-1111-1111-1111-111111111503', 'Nicole A.', 5, 'Salon-quality blowouts', 'This dryer has cut my drying time in half. My hair is shinier and less frizzy. The ionic technology really works!', true, 27),
    ('11111111-1111-1111-1111-111111111503', 'Katie R.', 4, 'Great hair dryer', 'Powerful, lightweight, and my hair looks amazing after using it. The attachments are useful too. Good investment.', true, 19),

    ('11111111-1111-1111-1111-111111111504', 'Amanda J.', 4, 'Professional results', 'This nail drill is great for home manicures. Takes practice to use, but now I get salon-quality results. Good variety of bits.', true, 12),

    ('11111111-1111-1111-1111-111111111505', 'Lauren V.', 5, 'Love my steamer!', 'This steamer is so relaxing and really opens up my pores. My masks work so much better after steaming. A must for skincare lovers.', true, 20),
    ('11111111-1111-1111-1111-111111111505', 'Beth C.', 4, 'Nice facial steamer', 'Easy to use and produces good steam. My skin feels so clean after using it. Just wish the water tank was slightly larger.', true, 13);

-- Body Care Reviews
INSERT INTO product_reviews (product_id, customer_name, rating, title, review_text, is_verified_purchase, helpful_count)
VALUES
    ('11111111-1111-1111-1111-111111111601', 'Vanessa M.', 5, 'Luxurious and gorgeous', 'This body oil is everything! The subtle shimmer from the gold flakes is so pretty. My skin has never felt softer. The scent is intoxicating.', true, 31),
    ('11111111-1111-1111-1111-111111111601', 'Crystal L.', 5, 'Special occasion favorite', 'I use this for date nights and special events. The shimmer is beautiful and the jasmine vanilla scent gets so many compliments.', true, 24),
    ('11111111-1111-1111-1111-111111111601', 'Monica R.', 4, 'Beautiful but pricey', 'This oil is gorgeous - makes my skin glow and smell amazing. Just wish it was a bit cheaper. But it is a treat!', true, 17),

    ('11111111-1111-1111-1111-111111111602', 'Paula S.', 5, 'Silky smooth skin', 'This scrub is amazing! The salt crystals exfoliate perfectly without being too harsh. My skin is so smooth after. Love the citrus scent.', true, 25),
    ('11111111-1111-1111-1111-111111111602', 'Wendy K.', 4, 'Great scrub', 'Really effective exfoliant. The coconut oil leaves skin moisturized, not dry. Use it twice a week and my skin feels great.', true, 18),

    ('11111111-1111-1111-1111-111111111603', 'Linda H.', 5, 'My hands thank me!', 'My hands were so dry and cracked from washing. This cream has healed them completely. It absorbs fast and doesn''t leave residue.', true, 33),
    ('11111111-1111-1111-1111-111111111603', 'Sandra W.', 5, 'Best hand cream ever', 'Keep one at home and one at work. My hands are soft all day and the tube lasts a long time. Love it!', true, 28),
    ('11111111-1111-1111-1111-111111111603', 'Carol B.', 4, 'Very moisturizing', 'This is a rich cream that really works on dry hands. Not greasy at all. My cuticles look better too.', true, 19);

-- Create function to update product average rating
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET
        average_rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM product_reviews
            WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
            AND is_approved = true
        ),
        review_count = (
            SELECT COUNT(*)
            FROM product_reviews
            WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
            AND is_approved = true
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for review rating updates
DROP TRIGGER IF EXISTS update_product_rating_trigger ON product_reviews;
CREATE TRIGGER update_product_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON product_reviews
    FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Update existing product ratings based on inserted reviews
UPDATE products p
SET
    average_rating = (
        SELECT COALESCE(AVG(rating), 0)
        FROM product_reviews pr
        WHERE pr.product_id = p.id
        AND pr.is_approved = true
    ),
    review_count = (
        SELECT COUNT(*)
        FROM product_reviews pr
        WHERE pr.product_id = p.id
        AND pr.is_approved = true
    );
