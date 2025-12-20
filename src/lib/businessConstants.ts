/**
 * Business Constants - Centralized source of truth for all business information
 *
 * This file contains all business-related constants that were previously hardcoded
 * throughout the application. In the future, these can be fetched from a database
 * table (e.g., business_settings) for dynamic configuration.
 *
 * @see HARDCODED_AUDIT_REPORT.md for migration plan
 */

// Business Identity
export const BUSINESS_NAME = 'Zavira Salon & Spa';
export const BUSINESS_NAME_SHORT = 'Zavira';
export const BUSINESS_TAGLINE = 'Where luxury meets excellence';

// Contact Information
export const BUSINESS_ADDRESS = {
  street: '283 Tache Avenue',
  city: 'Winnipeg',
  province: 'MB',
  country: 'Canada',
  postalCode: '', // Add if available
  full: '283 Tache Avenue, Winnipeg, MB, Canada',
  formatted: '283 Tache Avenue, Winnipeg, MB',
};

export const BUSINESS_PHONE = '(431) 816-3330';
export const BUSINESS_PHONE_RAW = '+14318163330'; // For tel: links
export const BUSINESS_EMAIL = 'zavirasalonandspa@gmail.com';

// Social Media
export const SOCIAL_MEDIA = {
  instagram: 'https://instagram.com/zavirasalon',
  facebook: 'https://facebook.com/zavirasalon',
  twitter: 'https://twitter.com/zavirasalon',
  handle: '@ZaviraSalon',
};

// Operating Hours
export const BUSINESS_HOURS = {
  display: 'Daily: 8:00 AM - 11:30 PM',
  openTime: '08:00',
  closeTime: '23:30',
  openHour: 8,
  closeHour: 23.5,
  timezone: 'America/Winnipeg',
};

// Time slots for booking (generated from business hours)
export const BOOKING_TIME_SLOTS = [
  { time: '08:00', display: '8:00 AM' },
  { time: '08:30', display: '8:30 AM' },
  { time: '09:00', display: '9:00 AM' },
  { time: '09:30', display: '9:30 AM' },
  { time: '10:00', display: '10:00 AM' },
  { time: '10:30', display: '10:30 AM' },
  { time: '11:00', display: '11:00 AM' },
  { time: '11:30', display: '11:30 AM' },
  { time: '12:00', display: '12:00 PM' },
  { time: '12:30', display: '12:30 PM' },
  { time: '13:00', display: '1:00 PM' },
  { time: '13:30', display: '1:30 PM' },
  { time: '14:00', display: '2:00 PM' },
  { time: '14:30', display: '2:30 PM' },
  { time: '15:00', display: '3:00 PM' },
  { time: '15:30', display: '3:30 PM' },
  { time: '16:00', display: '4:00 PM' },
  { time: '16:30', display: '4:30 PM' },
  { time: '17:00', display: '5:00 PM' },
  { time: '17:30', display: '5:30 PM' },
  { time: '18:00', display: '6:00 PM' },
  { time: '18:30', display: '6:30 PM' },
  { time: '19:00', display: '7:00 PM' },
  { time: '19:30', display: '7:30 PM' },
  { time: '20:00', display: '8:00 PM' },
  { time: '20:30', display: '8:30 PM' },
  { time: '21:00', display: '9:00 PM' },
  { time: '21:30', display: '9:30 PM' },
  { time: '22:00', display: '10:00 PM' },
  { time: '22:30', display: '10:30 PM' },
  { time: '23:00', display: '11:00 PM' },
  { time: '23:30', display: '11:30 PM' },
];

// Company Info
export const COMPANY_INFO = {
  founded: 2020,
  foundedDisplay: 'Founded in 2020',
};

// Maps URL generator - opens Apple Maps on iOS/macOS, Google Maps on others
export const getMapsUrl = (): string => {
  const encodedAddress = encodeURIComponent(BUSINESS_ADDRESS.full);

  if (typeof navigator === 'undefined') {
    return `https://maps.google.com/maps?q=${encodedAddress}`;
  }

  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  const platform = navigator.platform || '';

  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
  const isMac = platform.toLowerCase().includes('mac') || /Macintosh/.test(userAgent);

  if (isIOS || isMac) {
    return `https://maps.apple.com/?address=${encodedAddress}&q=${encodedAddress}`;
  }

  return `https://maps.google.com/maps?q=${encodedAddress}`;
};

// SEO Metadata
export const SEO_DEFAULTS = {
  title: 'Zavira Beauty Salon',
  description: 'Luxury beauty salon services and products - professional treatments, premium products, and exceptional care.',
  keywords: ['beauty salon', 'spa', 'hair styling', 'nails', 'skin care', 'makeup', 'luxury beauty', 'Winnipeg salon'],
  priceRange: '$$',
};

// Schema.org structured data for local business
export const getSchemaOrgData = (baseUrl: string) => ({
  '@context': 'https://schema.org',
  '@type': 'BeautySalon',
  name: BUSINESS_NAME,
  description: SEO_DEFAULTS.description,
  url: baseUrl,
  telephone: BUSINESS_PHONE_RAW,
  email: BUSINESS_EMAIL,
  address: {
    '@type': 'PostalAddress',
    streetAddress: BUSINESS_ADDRESS.street,
    addressLocality: BUSINESS_ADDRESS.city,
    addressRegion: BUSINESS_ADDRESS.province,
    addressCountry: 'CA',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 49.8880, // Winnipeg coordinates - update with exact location
    longitude: -97.1276,
  },
  openingHours: ['Mo-Su 08:00-23:30'],
  priceRange: SEO_DEFAULTS.priceRange,
  sameAs: [
    SOCIAL_MEDIA.facebook,
    SOCIAL_MEDIA.instagram,
    SOCIAL_MEDIA.twitter,
  ],
});
