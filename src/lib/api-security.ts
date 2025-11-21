/**
 * API Security Interceptor
 * Handles security headers, CSRF protection, and request validation for all API calls
 */

import { CSRFProtection, RateLimiter } from './security';
import { config } from './environment';

// Request interceptor for adding security headers
export const addSecurityHeaders = (headers: Record<string, string> = {}) => {
  const securityHeaders = {
    ...headers,
    'X-Requested-With': 'XMLHttpRequest',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  };

  // Add CSRF token if enabled
  if (config.security.enableCsrfProtection) {
    const csrfHeaders = CSRFProtection.getHeader();
    Object.assign(securityHeaders, csrfHeaders);
  }

  return securityHeaders;
};

// Response interceptor for security validations
export const validateResponse = (response: Response) => {
  // Check for security headers in response
  const contentType = response.headers.get('Content-Type');
  if (contentType && !contentType.includes('application/json') && !contentType.includes('text/html')) {
    console.warn('Unexpected content type:', contentType);
  }

  // Check for CORS headers in production
  if (config.security.enableCors && import.meta.env.PROD) {
    const corsOrigin = response.headers.get('Access-Control-Allow-Origin');
    if (!corsOrigin) {
      console.warn('Missing CORS headers in production response');
    }
  }

  return response;
};

// Secure fetch wrapper
export const secureFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  // Rate limiting check
  const clientIp = 'client-' + Date.now(); // In real app, use actual client identifier
  if (!RateLimiter.isAllowed(clientIp, 100, 60000)) { // 100 requests per minute
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  // Add security headers
  const secureOptions = {
    ...options,
    headers: {
      ...addSecurityHeaders(options.headers as Record<string, string>),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, secureOptions);
    return validateResponse(response);
  } catch (error) {
    console.error('Secure fetch error:', error);
    throw new Error('Network error. Please check your connection and try again.');
  }
};

// Supabase request interceptor
export const createSecureSupabaseClient = (baseUrl: string, headers: Record<string, string> = {}) => {
  return {
    baseURL: baseUrl,
    headers: {
      ...addSecurityHeaders(headers),
    },
  };
};

// API error handler with security considerations
export const handleApiError = (error: any, url: string) => {
  // Log error details (but not sensitive data)
  console.error(`API Error at ${url}:`, {
    message: error.message,
    status: error.status,
    timestamp: new Date().toISOString(),
  });

  // Handle specific security-related errors
  if (error.status === 401) {
    // Unauthorized - might indicate session expiry
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
    }
    throw new Error('Session expired. Please log in again.');
  }

  if (error.status === 403) {
    // Forbidden - might indicate CSRF token issues
    CSRFProtection.clearToken();
    throw new Error('Security validation failed. Please try again.');
  }

  if (error.status === 429) {
    // Rate limited
    throw new Error('Too many requests. Please wait a moment before trying again.');
  }

  // Generic error message for security
  throw new Error('An error occurred. Please try again later.');
};