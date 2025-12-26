-- Seed staff data for authentication testing
-- This migration creates sample staff records with EMP usernames

INSERT INTO public.staff (
    id,
    first_name,
    last_name,
    username,
    password_hash,
    role,
    specialty,
    status,
    access_level,
    color,
    created_at,
    updated_at
) VALUES
(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Sarah',
    'Johnson',
    'EMP001',
    '$2b$10$rOZQZqG5Y5Y5Y5Y5Y5Y5Yu5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5', -- hashed password (demo only)
    'admin',
    'Hair Cutting, Styling, Color',
    'available',
    'admin',
    'blue',
    NOW(),
    NOW()
),
(
    'b1ffc9aa-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Emily',
    'Davis',
    'EMP002',
    '$2b$10$rOZQZqG5Y5Y5Y5Y5Y5Y5Yu5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5',
    'senior',
    'Manicures, Pedicures, Nail Art',
    'available',
    'manager',
    'emerald',
    NOW(),
    NOW()
),
(
    'c2ffccaa-9c0b-4ef8-bb6d-6bb9bd380a33',
    'Michael',
    'Chen',
    'EMP003',
    '$2b$10$rOZQZqG5Y5Y5Y5Y5Y5Y5Yu5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5',
    'senior',
    'Massage Therapy, Spa Treatments',
    'available',
    'manager',
    'purple',
    NOW(),
    NOW()
),
(
    'd3ffeebc-9c0b-4ef8-bb6d-6bb9bd380a44',
    'Jessica',
    'Wilson',
    'EMP004',
    '$2b$10$rOZQZqG5Y5Y5Y5Y5Y5Y5Yu5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5',
    'junior',
    'Facial Treatments, Waxing',
    'available',
    'basic',
    'pink',
    NOW(),
    NOW()
);

-- Add helpful comment for testing
COMMENT ON TABLE public.staff IS 'Staff table with sample records: EMP001, EMP002, EMP003, EMP004 for authentication testing';