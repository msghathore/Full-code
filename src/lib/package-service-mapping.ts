/**
 * PACKAGE-TO-SERVICE MAPPING
 *
 * Maps package IDs from our Hormozi-style packages to actual service selections
 * in the booking flow. This enables "smart categorization" - when a customer
 * selects a package, the booking flow automatically adds the right services.
 *
 * HORMOZI PRINCIPLE: Make it as easy as possible to buy. One-click, pre-filled,
 * zero friction. The customer should never have to think about what to select.
 */

export interface PackageServiceMapping {
  packageId: string;
  services: string[]; // Array of service names or IDs
  duration: number; // Total duration in minutes
  autoStaff: boolean; // Whether to auto-assign staff
  notes?: string; // Optional pre-filled notes
}

/**
 * Complete mapping of all Hormozi packages to their service selections
 */
export const PACKAGE_SERVICE_MAPPINGS: Record<string, PackageServiceMapping> = {
  // ===== GRAND SLAM OFFERS (Homepage) =====
  'tier-1-entry': {
    packageId: 'tier-1-entry',
    services: ['Signature Haircut & Style', 'Stress-Melting Massage', 'Age-Defying Facial'],
    duration: 135, // 60 + 30 + 45
    autoStaff: true,
    notes: 'First-Timer\'s Transformation Package - VIP treatment included'
  },

  'tier-2-makeover': {
    packageId: 'tier-2-makeover',
    services: [
      'Premium Haircut & Style',
      'Full Color Treatment',
      'Deep Conditioning Repair',
      'Professional Blowout & Style',
      'Expert Hair Consultation'
    ],
    duration: 285, // 60 + 120 + 30 + 45 + 30
    autoStaff: true,
    notes: 'Complete Makeover Package - Includes FREE touch-up within 6 weeks'
  },

  'tier-3-vip': {
    packageId: 'tier-3-vip',
    services: ['3 Months Unlimited Services', 'Personalized Beauty Consultation', 'Monthly Check-ins', 'Before & After Photo Shoot'],
    duration: 240, // Initial consultation
    autoStaff: true,
    notes: '3-Month Transformation Journey - Unlimited services + Personal coordinator'
  },

  // ===== FOR MEN PACKAGES =====
  'executive-grooming': {
    packageId: 'executive-grooming',
    services: ['Premium Executive Haircut', 'Classic Hot Towel Shave', 'Shoulder & Neck Massage'],
    duration: 90, // 45 + 30 + 15
    autoStaff: true,
    notes: 'Executive Grooming Experience - Premium products included'
  },

  'quick-professional': {
    packageId: 'quick-professional',
    services: ['Express Haircut', 'Beard Trim & Shape'],
    duration: 35, // 25 + 10
    autoStaff: true,
    notes: 'Quick Professional - Express service for busy professionals'
  },

  'first-impression': {
    packageId: 'first-impression',
    services: ['Precision Haircut & Style', 'Clean Shave or Beard Sculpt', 'Premium Skincare Treatment'],
    duration: 85, // 45 + 20 + 20
    autoStaff: true,
    notes: 'First Impression Package - Perfect for interviews & dates'
  },

  // ===== FOR BRIDES PACKAGES =====
  'bridal-beauty-bundle': {
    packageId: 'bridal-beauty-bundle',
    services: [
      'Bridal Hair Styling',
      'Professional Bridal Makeup',
      'Luxury Manicure & Pedicure',
      'Pre-Wedding Stress Relief Massage',
      'Facial Glow Treatment',
      'Skin Radiance Prep'
    ],
    duration: 390, // 90 + 75 + 90 + 60 + 45 + 30
    autoStaff: false, // Bride may want specific stylists
    notes: 'Bridal Beauty Bundle - Wedding Day Coordinator included'
  },

  'bridal-trial-experience': {
    packageId: 'bridal-trial-experience',
    services: ['Bridal Hair Trial', 'Makeup Trial & Consultation'],
    duration: 120, // 60 + 60
    autoStaff: false,
    notes: 'Bridal Trial - Credit toward full bridal package if booked'
  },

  'bridesmaids-party-package': {
    packageId: 'bridesmaids-party-package',
    services: [
      'Hair Styling for 6 Bridesmaids',
      'Professional Makeup for 6',
      'Champagne & Snacks',
      'Group Photo Session'
    ],
    duration: 360, // 6 hours for entire party
    autoStaff: false,
    notes: 'Bridesmaids Party Package - FREE bride hair & makeup included'
  },

  // ===== GROUPS & PARTIES PACKAGES =====
  'girlfriend-getaway': {
    packageId: 'girlfriend-getaway',
    services: [
      'Signature Haircuts & Styling for 6',
      'Luxury Manicures for All',
      'Stress-Melting Massages',
      'Champagne & Snack Bar',
      'Professional Group Photos',
      'Private VIP Suite (4 hours)'
    ],
    duration: 240, // 4 hours total
    autoStaff: true,
    notes: 'Girlfriend Getaway - Birthday girl goes FREE'
  },

  'bachelorette-bash': {
    packageId: 'bachelorette-bash',
    services: [
      'Bridal Party Hair Styling',
      'Professional Makeup for All',
      'Champagne Bar & Treats',
      'Matching Robes for Photos',
      'Photo Shoot Package',
      'Private Party Suite (5 hours)'
    ],
    duration: 300, // 5 hours total
    autoStaff: false,
    notes: 'Bachelorette Bash - Bride gets full service FREE'
  },

  'birthday-celebration': {
    packageId: 'birthday-celebration',
    services: [
      'Signature Spa Treatment for All',
      'Luxury Manicure & Pedicure',
      'Birthday Champagne Toast',
      'Birthday Cake & Treats',
      'Decorated Private Suite'
    ],
    duration: 180, // 3 hours total
    autoStaff: true,
    notes: 'Birthday Celebration - Birthday guest goes FREE'
  },

  'corporate-team-bonding': {
    packageId: 'corporate-team-bonding',
    services: [
      'Relaxation Massages for Team',
      'Premium Skincare Treatments',
      'Coffee & Refreshments Bar',
      'Private Corporate Suite',
      'Team Building Activities'
    ],
    duration: 240, // 4 hours total
    autoStaff: true,
    notes: 'Corporate Team Bonding - Invoice available for expense reports'
  },
};

/**
 * Get service mappingfor a package ID
 */
export const getPackageServiceMapping = (packageId: string): PackageServiceMapping | null => {
  return PACKAGE_SERVICE_MAPPINGS[packageId] || null;
};

/**
 * Check if a package ID exists in our mappings
 */
export const isValidPackageId = (packageId: string): boolean => {
  return packageId in PACKAGE_SERVICE_MAPPINGS;
};

/**
 * Get all package IDs
 */
export const getAllPackageIds = (): string[] => {
  return Object.keys(PACKAGE_SERVICE_MAPPINGS);
};

/**
 * Apply package services to booking form
 * This function should be called when a package is selected to auto-populate
 * the booking form with the correct services
 */
export const applyPackageToBooking = (packageId: string) => {
  const mapping = getPackageServiceMapping(packageId);

  if (!mapping) {
    console.warn(`[Package Mapping] No mapping found for package ID: ${packageId}`);
    return null;
  }

  // Store in localStorage for booking flow to pick up
  localStorage.setItem('booking-auto-staff', mapping.autoStaff.toString());

  if (mapping.notes) {
    localStorage.setItem('booking-notes', mapping.notes);
  }

  return mapping;
};
