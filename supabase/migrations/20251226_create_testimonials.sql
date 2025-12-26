-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_photo_url TEXT,
  service_category TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  testimonial_text TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Public read access for testimonials
CREATE POLICY "Anyone can view testimonials"
  ON testimonials
  FOR SELECT
  USING (true);

-- Only authenticated users can insert (for future admin features)
CREATE POLICY "Authenticated users can insert testimonials"
  ON testimonials
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated users can update
CREATE POLICY "Authenticated users can update testimonials"
  ON testimonials
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated users can delete
CREATE POLICY "Authenticated users can delete testimonials"
  ON testimonials
  FOR DELETE
  TO authenticated
  USING (true);

-- Create index for faster queries
CREATE INDEX idx_testimonials_featured ON testimonials(is_featured, created_at DESC);
CREATE INDEX idx_testimonials_verified ON testimonials(is_verified, created_at DESC);

-- Seed data with realistic testimonials
INSERT INTO testimonials (customer_name, customer_photo_url, service_category, rating, testimonial_text, is_featured, is_verified) VALUES
(
  'Sarah Thompson',
  'https://i.pravatar.cc/150?img=1',
  'Hair Styling',
  5,
  'I''ve been coming to Zavira for over two years and I absolutely love it! The stylists really listen to what you want and deliver every single time. My balayage looks stunning and the color lasts for months. The atmosphere is so relaxing and luxurious.',
  true,
  true
),
(
  'Jessica Martinez',
  'https://i.pravatar.cc/150?img=5',
  'Nails',
  5,
  'Best nail salon in Winnipeg, hands down! The gel manicures last 3+ weeks without chipping. The technicians are skilled artists - my nail art is always flawless. I get so many compliments! Clean, professional, and worth every penny.',
  true,
  true
),
(
  'Emily Chen',
  'https://i.pravatar.cc/150?img=9',
  'Spa Services',
  5,
  'The hot stone massage was absolutely divine. I walked out feeling like a new person! The ambiance is so peaceful and the therapists are incredibly skilled. I book a treatment every month now - it''s my self-care ritual.',
  true,
  true
),
(
  'Rachel Green',
  'https://i.pravatar.cc/150?img=10',
  'Hair Color',
  5,
  'My colorist is a genius! I showed her a photo of what I wanted and she nailed it perfectly. The highlights look so natural and my hair feels healthier than ever. The products they use are top-quality.',
  false,
  true
),
(
  'Amanda Wilson',
  'https://i.pravatar.cc/150?img=16',
  'Bridal Services',
  5,
  'Zavira made me feel like an absolute princess on my wedding day! The hair and makeup trial was perfect, and on the day of, everything was flawless. My bridesmaids looked gorgeous too. Thank you for making my special day even more magical!',
  true,
  true
),
(
  'Melissa Brown',
  'https://i.pravatar.cc/150?img=23',
  'Facials',
  5,
  'The hydrating facial is incredible! My skin has never looked better. The esthetician explained every step and recommended products perfect for my skin type. It''s like a mini-vacation every time I go.',
  false,
  true
),
(
  'Jennifer Davis',
  'https://i.pravatar.cc/150?img=24',
  'Hair Cut',
  5,
  'I was nervous about cutting my long hair but my stylist made me feel so comfortable. She gave me the best haircut of my life! It''s so easy to style now and I get compliments daily. I''ll never go anywhere else!',
  false,
  true
),
(
  'Lisa Anderson',
  'https://i.pravatar.cc/150?img=26',
  'Waxing',
  5,
  'Professional, quick, and as painless as waxing can be! The esthetician is gentle and efficient. The results last much longer than when I do it at home. Great value for the quality of service.',
  false,
  true
),
(
  'Nicole Taylor',
  'https://i.pravatar.cc/150?img=28',
  'Lash Extensions',
  5,
  'My lash extensions are perfection! They look so natural yet glamorous. I wake up looking put-together every day. The technician is meticulous and takes her time to get every lash perfect. Obsessed!',
  true,
  true
),
(
  'Katherine Lee',
  'https://i.pravatar.cc/150?img=32',
  'Makeup',
  5,
  'Had my makeup done for a photoshoot and WOW! The makeup artist is so talented. My skin looked airbrushed in photos and I felt so confident. She taught me some tricks too. Can''t recommend enough!',
  false,
  true
);

-- Comment for documentation
COMMENT ON TABLE testimonials IS 'Customer testimonials and reviews for Zavira Salon & Spa services';
