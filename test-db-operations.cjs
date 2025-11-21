const fs = require('fs');

const bookingFile = 'src/pages/Booking.tsx';
const bookingContent = fs.readFileSync(bookingFile, 'utf8');

console.log('Checking Booking component for database operations...\n');

// Check for essential functionality
const requiredFeatures = [
  { pattern: 'handleBooking', name: 'Booking handler' },
  { pattern: 'supabase.from', name: 'Database operations' },
  { pattern: 'useToast', name: 'Toast notifications' },
  { pattern: 'setCurrentStep', name: 'Step navigation' },
  { pattern: 'selectedService', name: 'Service selection' },
  { pattern: 'selectedTime', name: 'Time selection' },
];

const missingFeatures = [];
for (const feature of requiredFeatures) {
  if (bookingContent.includes(feature.pattern)) {
    console.log(`✅ Found: ${feature.name} (pattern: ${feature.pattern})`);
  } else {
    console.log(`❌ Missing: ${feature.name} (pattern: ${feature.pattern})`);
    missingFeatures.push(feature.name);
  }
}

console.log('\n=== RESULT ===');
if (missingFeatures.length === 0) {
  console.log('✅ All features found!');
} else {
  console.log(`❌ Missing features: ${missingFeatures.join(', ')}`);
}

// Also check for specific database patterns
console.log('\n=== DATABASE PATTERN ANALYSIS ===');
const dbPatterns = [
  'supabase.from',
  '.from(\'appointments\')',
  '.from("appointments")',
  '.insert(',
  'fetchServices',
  'fetchStaff'
];

for (const pattern of dbPatterns) {
  const count = (bookingContent.match(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  console.log(`${pattern}: ${count} matches`);
}