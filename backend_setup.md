# Zavira Salon & Spa Backend Setup

## Database Schema

### Services Table
```sql
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Services are viewable by everyone" ON services
  FOR SELECT USING (is_active = true);
```

### Staff Table
```sql
CREATE TABLE staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Staff are viewable by everyone" ON staff
  FOR SELECT USING (is_active = true);
```

### Appointments Table
```sql
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES services(id),
  staff_id UUID REFERENCES staff(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  full_name TEXT,
  phone TEXT,
  email TEXT,
  location TEXT,
  notes TEXT,
  total_amount DECIMAL(10,2),
  deposit_amount DECIMAL(10,2),
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Users can view their own appointments
CREATE POLICY "Users can view their own appointments" ON appointments
  FOR SELECT USING (auth.uid() = user_id);

-- Allow insert for authenticated users and guests (with null user_id)
CREATE POLICY "Users can create appointments" ON appointments
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
```

## Sample Data

### Insert Services
```sql
INSERT INTO services (name, price, description) VALUES
('Hair Cut & Style', 75.00, 'Professional haircut and styling'),
('Hair Color', 120.00, 'Full hair coloring service'),
('Facial Treatment', 95.00, 'Deep cleansing facial'),
('Manicure', 45.00, 'Classic manicure service'),
('Massage', 85.00, 'Relaxing full body massage'),
('Virtual Consultation', 50.00, 'Online video consultation with our experts');
```

### Insert Staff
```sql
INSERT INTO staff (name, specialty) VALUES
('Sarah Johnson', 'Hair Stylist'),
('Michael Chen', 'Nail Technician'),
('Emma Williams', 'Skin Specialist'),
('David Martinez', 'Massage Therapist');
```

## Authentication Setup

Supabase Auth is already configured. Users can sign up/login through the auth page.

## Payment Integration

For Stripe integration:
1. Install Stripe CLI and set up webhook endpoints
2. Configure Stripe keys in environment variables
3. Set up payment intents for deposits

## Deployment Steps

1. Create a new Supabase project
2. Run the SQL scripts above in the SQL editor
3. Configure authentication providers (email/password)
4. Set up Stripe account and add keys to Supabase secrets
5. Deploy the application

## Current Status

The frontend has fallback mock data for services and staff, so it works without the backend. The booking form will attempt to save to Supabase but will show an error if the tables don't exist. With the tables created, full functionality will be available.