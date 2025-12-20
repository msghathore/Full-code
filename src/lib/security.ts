/**
 * Security utilities for production-ready application
 * Includes CSRF protection, input validation, and security helpers
 */

// CSRF Protection
export class CSRFProtection {
  private static token: string | null = null;
  private static readonly TOKEN_KEY = 'csrf_token';
  private static readonly TOKEN_HEADER = 'X-CSRF-Token';

  /**
   * Initialize CSRF token
   */
  static init() {
    if (typeof window === 'undefined') return;

    // Try to get existing token from localStorage
    const storedToken = localStorage.getItem(this.TOKEN_KEY);

    if (storedToken) {
      this.token = storedToken;
    } else {
      // Generate new token if not exists
      this.generateToken();
    }
  }

  /**
   * Generate a new CSRF token
   */
  static generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');

    this.token = token;
    localStorage.setItem(this.TOKEN_KEY, token);

    return token;
  }

  /**
   * Get current CSRF token
   */
  static getToken(): string | null {
    return this.token;
  }

  /**
   * Validate CSRF token from request
   */
  static validateToken(requestToken: string): boolean {
    return this.token === requestToken;
  }

  /**
   * Get CSRF header for requests
   */
  static getHeader(): Record<string, string> {
    return this.token ? { [this.TOKEN_HEADER]: this.token } : {};
  }

  /**
   * Clear CSRF token
   */
  static clearToken() {
    this.token = null;
    localStorage.removeItem(this.TOKEN_KEY);
  }
}

// Input Validation
export class InputValidator {
  /**
   * Sanitize HTML input to prevent XSS
   */
  static sanitizeHtml(input: string): string {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[(]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Validate password strength
   */
  static isStrongPassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitize and validate user input
   */
  static sanitizeInput(input: string, type: 'text' | 'email' | 'phone' | 'url' = 'text'): string {
    let sanitized = this.sanitizeHtml(input.trim());

    // Additional validation based on type
    switch (type) {
      case 'email':
        if (!this.isValidEmail(sanitized)) {
          throw new Error('Invalid email format');
        }
        break;
      case 'phone':
        if (!this.isValidPhone(sanitized)) {
          throw new Error('Invalid phone number format');
        }
        break;
      case 'url':
        try {
          new URL(sanitized);
        } catch {
          throw new Error('Invalid URL format');
        }
        break;
    }

    return sanitized;
  }
}

// Security Headers Configuration (uses Square instead of Stripe)
export const securityHeaders = {
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  // Enable XSS protection
  'X-XSS-Protection': '1; mode=block',
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // Content Security Policy (configured for Square payments)
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://web.squarecdn.com https://js.squareup.com https://maps.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co https://connect.squareup.com https://pci-connect.squareup.com",
    "frame-src 'self' https://web.squarecdn.com https://connect.squareup.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '),
  // Strict Transport Security
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  // Permissions Policy
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()'
  ].join(', ')
};

// Rate Limiting (client-side basic protection)
export class RateLimiter {
  private static requests: Map<string, number[]> = new Map();

  /**
   * Check if request is allowed for given key
   */
  static isAllowed(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];

    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < windowMs);

    if (validRequests.length >= maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(key, validRequests);

    return true;
  }

  /**
   * Clear rate limit for key
   */
  static clear(key: string) {
    this.requests.delete(key);
  }
}

// Initialize CSRF protection on client side
if (typeof window !== 'undefined') {
  CSRFProtection.init();
}