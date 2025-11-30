-- Insert test services if they don't exist
INSERT INTO public.services (id, name, description, duration_minutes, price, color, active, created_at, updated_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Balayage Color Treatment', 'Professional balayage coloring service', 180, 285.00, '#f87171', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'Hair Cut & Style', 'Professional haircut and styling', 60, 85.00, '#60a5fa', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'Manicure', 'Professional manicure service', 30, 45.00, '#c084fc', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440004', 'Pedicure', 'Professional pedicure service', 45, 55.00, '#34d399', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440005', 'Facial Treatment', 'Professional facial treatment', 75, 120.00, '#fbbf24', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;