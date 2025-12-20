// SECURITY: Restrict CORS to allowed origins only
const ALLOWED_ORIGINS = [
  'https://zavira.ca',
  'https://www.zavira.ca',
  'https://zavira.vercel.app',
  // Development origins - remove in production if not needed
  'http://localhost:8080',
  'http://localhost:3000',
  'http://127.0.0.1:8080'
];

// Get the origin from the request or default to the primary domain
export function getCorsHeaders(requestOrigin?: string | null): Record<string, string> {
  const origin = requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)
    ? requestOrigin
    : ALLOWED_ORIGINS[0]; // Default to primary domain

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin' // Important for proper caching
  };
}

// Legacy export for backwards compatibility - uses restrictive default
export const corsHeaders = getCorsHeaders('https://zavira.ca');