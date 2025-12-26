-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create knowledge base table for Glen RAG
CREATE TABLE IF NOT EXISTS glen_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL, -- 'service', 'policy', 'faq', 'business_info', 'staff', 'promotion'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI ada-002 or similar dimension
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast vector similarity search
CREATE INDEX IF NOT EXISTS glen_knowledge_embedding_idx
ON glen_knowledge_base
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create text search index for hybrid search
CREATE INDEX IF NOT EXISTS glen_knowledge_content_idx
ON glen_knowledge_base
USING GIN (to_tsvector('english', content));

-- Function to search knowledge base
CREATE OR REPLACE FUNCTION search_glen_knowledge(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  category TEXT,
  title TEXT,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    glen_knowledge_base.id,
    glen_knowledge_base.category,
    glen_knowledge_base.title,
    glen_knowledge_base.content,
    1 - (glen_knowledge_base.embedding <=> query_embedding) AS similarity
  FROM glen_knowledge_base
  WHERE 1 - (glen_knowledge_base.embedding <=> query_embedding) > match_threshold
  ORDER BY glen_knowledge_base.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Seed initial knowledge base data
INSERT INTO glen_knowledge_base (category, title, content, metadata) VALUES

-- Business Information
('business_info', 'Salon Location and Contact',
'Zavira Salon & Spa is located at 283 Tache Avenue, Winnipeg, MB, Canada. We are easily accessible with free street parking available on Horace Street and Tache Avenue (up to 2 hours). You can reach us at (431) 816-3330 or email zavirasalonandspa@gmail.com. Visit our website at zavira.ca for online booking.',
'{"keywords": ["location", "address", "parking", "contact", "phone", "email"]}'::jsonb),

('business_info', 'Operating Hours',
'Zavira Salon & Spa is open daily from 8:00 AM to 11:30 PM, seven days a week. We offer extended evening hours to accommodate your busy schedule. Book online 24/7 at zavira.ca or call us during business hours.',
'{"keywords": ["hours", "open", "schedule", "timing"]}'::jsonb),

('business_info', 'Payment Methods',
'We accept all major credit cards (Visa, Mastercard, American Express), debit cards, Apple Pay, Google Pay, Square payments, and cash. Payment is due at the time of service.',
'{"keywords": ["payment", "credit card", "cash", "apple pay", "google pay"]}'::jsonb),

-- Policies
('policy', 'Cancellation Policy',
'We require 24 hours notice for cancellations or rescheduling. Late cancellations (less than 24 hours) or no-shows will incur a 50% fee of the service price. This helps us serve all our clients better and compensates our staff for their reserved time.',
'{"keywords": ["cancel", "reschedule", "no show", "late", "policy"]}'::jsonb),

('policy', 'Booking and Appointments',
'You can book appointments online at zavira.ca 24/7, call us at (431) 816-3330, or walk in (subject to availability). We recommend booking in advance to secure your preferred time slot. First-time clients can book any available service.',
'{"keywords": ["booking", "appointment", "schedule", "reserve"]}'::jsonb),

-- Promotions
('promotion', 'First Time Client Discount',
'Welcome! First-time clients receive 15% off their first service. This offer applies to all services except packages and combo deals. Mention this offer when booking.',
'{"keywords": ["first time", "new client", "discount", "15%", "welcome"]}'::jsonb),

('promotion', 'Referral Program',
'Refer a friend and you both get $20 off your next service! When your friend completes their first appointment and mentions your name, you each receive a $20 credit. No limit on referrals.',
'{"keywords": ["referral", "refer friend", "$20", "credit"]}'::jsonb),

('promotion', 'Birthday Month Special',
'Celebrate your birthday with us! Receive 20% off any service during your birthday month. Just show ID when booking. This is our gift to you!',
'{"keywords": ["birthday", "20%", "celebration", "special"]}'::jsonb),

('promotion', 'Loyalty Rewards Program',
'Join our loyalty program and earn points with every visit. Points can be redeemed for discounts, free services, and exclusive perks. Ask our staff about signing up!',
'{"keywords": ["loyalty", "rewards", "points", "program"]}'::jsonb),

-- FAQs
('faq', 'What should I expect during my first visit?',
'Your first visit begins with a consultation where we discuss your needs, preferences, and any specific concerns. Our professional staff will recommend the best services for you. Plan to arrive 10-15 minutes early to complete any necessary paperwork and relax before your service begins.',
'{"keywords": ["first visit", "what to expect", "consultation", "arrival"]}'::jsonb),

('faq', 'Do I need to bring anything?',
'No need to bring anything! We provide all necessary supplies, robes, and amenities. Just bring yourself and relax. For massage services, we provide fresh linens and towels.',
'{"keywords": ["bring", "supplies", "what to bring"]}'::jsonb),

('faq', 'Can I request a specific stylist or technician?',
'Absolutely! When booking, you can request a specific team member. If you have a preferred stylist or technician from a previous visit, we will do our best to schedule you with them. Mention this when booking.',
'{"keywords": ["request", "specific", "stylist", "technician", "staff"]}'::jsonb),

('faq', 'What if I need to reschedule?',
'Life happens! We understand. Please give us at least 24 hours notice to reschedule without any fees. You can reschedule by calling (431) 816-3330 or through our online booking system at zavira.ca.',
'{"keywords": ["reschedule", "change appointment", "modify booking"]}'::jsonb),

('faq', 'Do you offer consultations before services?',
'Yes! We offer free consultations for all services. This is especially recommended for major hair transformations, color treatments, or if you are unsure which service is right for you. Book a consultation through our website or call us.',
'{"keywords": ["consultation", "free", "advice", "recommend"]}'::jsonb),

-- Service Categories Overview
('service', 'Hair Services Overview',
'Our hair services include cuts, styling, coloring, highlights, balayage, treatments, extensions, and special occasion styling. Prices range from $45-$150+ depending on length and complexity. Our experienced stylists use premium products and stay current with the latest trends.',
'{"keywords": ["hair", "cut", "color", "style", "highlights"]}'::jsonb),

('service', 'Nail Services Overview',
'Pamper your hands and feet with our comprehensive nail services including manicures, pedicures, gel polish, nail art, and nail enhancements. Prices range from $30-$85. We use high-quality, long-lasting products in a clean, relaxing environment.',
'{"keywords": ["nails", "manicure", "pedicure", "gel", "nail art"]}'::jsonb),

('service', 'Massage Services Overview',
'Relax and rejuvenate with our massage services including Swedish, deep tissue, hot stone, and aromatherapy massages. Sessions range from 30-90 minutes ($60-$150). Our licensed massage therapists customize each session to your needs.',
'{"keywords": ["massage", "relaxation", "therapy", "Swedish", "deep tissue"]}'::jsonb),

('service', 'Skin and Facial Services Overview',
'Achieve glowing, healthy skin with our facial treatments including deep cleansing, anti-aging, hydrating, and acne treatments. Prices range from $75-$180. We use professional-grade products tailored to your skin type.',
'{"keywords": ["facial", "skin", "skincare", "treatment", "glow"]}'::jsonb),

('service', 'Tattoo and Piercing Services',
'Express yourself with our professional tattoo and piercing services. Our licensed artists create custom tattoos and perform safe piercings using sterile equipment. Consultations available for design and placement. Pricing varies by size and complexity.',
'{"keywords": ["tattoo", "piercing", "ink", "body art"]}'::jsonb),

('service', 'Waxing Services',
'Smooth, hair-free skin with our waxing services for face and body. We use gentle wax suitable for all skin types. Prices vary by area. Our experienced technicians ensure a comfortable experience.',
'{"keywords": ["waxing", "hair removal", "smooth skin"]}'::jsonb);

-- Note: Embeddings will be generated by the edge function or a separate process
COMMENT ON TABLE glen_knowledge_base IS 'Knowledge base for Glen RAG assistant - stores salon information as vector embeddings';
COMMENT ON COLUMN glen_knowledge_base.embedding IS 'Vector embedding generated from content text (1536 dimensions for OpenAI ada-002)';
