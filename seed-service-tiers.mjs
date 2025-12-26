import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://stppkvkcjsyusxwtbaej.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cHBrdmtjanN5dXN4d3RiYWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjk4MTUsImV4cCI6MjA3ODgwNTgxNX0.sH9es8xu2tZlkhQrfaPcaYTAC8t6CjrI7LL9BKfT-v0';

const supabase = createClient(supabaseUrl, supabaseKey);

const tiers = [
  {
    tier_name: 'Basic',
    tier_level: 1,
    min_price: 25.00,
    max_price: 75.00,
    tagline: 'Essential Beauty Services',
    description: 'Perfect for quick touch-ups and essential maintenance. Get professional results without breaking the bank.',
    features: [
      'Standard service quality',
      'Quick appointment times',
      'Basic product selection',
      'Professional staff',
      'Clean & safe environment',
      'Same-day availability'
    ],
    typical_services: [
      'Basic Manicure ($25)',
      'Basic Pedicure ($35)',
      'Simple Haircut ($45)',
      'Eyebrow Threading ($15)',
      'Basic Facial ($60)',
      'Express Massage (30min - $50)'
    ],
    upgrade_benefits: [
      'Upgrade to Premium for luxury products',
      'Get longer appointment times',
      'Access premium add-ons'
    ],
    is_most_popular: false,
    display_order: 1
  },
  {
    tier_name: 'Premium',
    tier_level: 2,
    min_price: 75.00,
    max_price: 150.00,
    tagline: 'Elevated Experience',
    description: 'The sweet spot between value and luxury. Enhanced services with premium products and extended care.',
    features: [
      'Premium product lines',
      'Extended appointment times',
      'Complimentary beverages',
      'Senior stylist selection',
      'Priority scheduling',
      'Relaxation amenities',
      '10% loyalty rewards',
      'Free consultation'
    ],
    typical_services: [
      'Deluxe Manicure with gel ($75)',
      'Spa Pedicure with massage ($85)',
      'Premium Cut & Style ($95)',
      'Deep Tissue Massage (60min - $120)',
      'Advanced Facial Treatment ($110)',
      'Microblading Session ($400)'
    ],
    upgrade_benefits: [
      'Upgrade to Luxury for VIP treatment',
      'Get exclusive products',
      'Access to master stylists'
    ],
    is_most_popular: true,
    display_order: 2
  },
  {
    tier_name: 'Luxury',
    tier_level: 3,
    min_price: 150.00,
    max_price: 500.00,
    tagline: 'Ultimate Indulgence',
    description: 'The pinnacle of pampering. Reserve our master artists, premium suites, and the finest products available.',
    features: [
      'Top-tier luxury products',
      'Private treatment suites',
      'Master stylist guaranteed',
      'Complimentary spa amenities',
      'Concierge service',
      'Premium refreshments',
      'Extended after-care',
      '15% loyalty rewards',
      'VIP priority access',
      'Personalized treatment plans',
      'Luxury gift with service'
    ],
    typical_services: [
      'Luxury Nail Art Experience ($150+)',
      'Full Hair Transformation ($200+)',
      'Hot Stone Massage (90min - $180)',
      'Luxury Facial with LED ($200)',
      'Full PMU Session ($500)',
      'Bridal Package ($350+)'
    ],
    upgrade_benefits: [
      'The ultimate salon experience',
      'No upgrades needed - this is the best',
      'VIP member perks & exclusive events'
    ],
    is_most_popular: false,
    display_order: 3
  }
];

async function seedTiers() {
  console.log('🌱 Seeding pricing tiers...\n');

  for (const tier of tiers) {
    console.log(`Adding ${tier.tier_name} tier...`);
    const { data, error} = await supabase
      .from('pricing_tiers')
      .insert([tier])
      .select();

    if (error) {
      console.error(`❌ Error adding ${tier.tier_name}:`, error.message);
    } else {
      console.log(`✓ ${tier.tier_name} tier added successfully`);
    }
  }

  // Verify
  console.log('\n📊 Verification:');
  const { data, error } = await supabase
    .from('pricing_tiers')
    .select('tier_name, tier_level, min_price, max_price, is_most_popular')
    .order('tier_level');

  if (error) {
    console.error('❌ Verification error:', error);
  } else {
    console.log(`✓ Found ${data.length} tiers in database:`);
    data.forEach(t => {
      const popular = t.is_most_popular ? '⭐ POPULAR' : '';
      console.log(`  - ${t.tier_name} (Level ${t.tier_level}): $${t.min_price}-$${t.max_price} ${popular}`);
    });
  }
}

seedTiers();
