/**
 * SECURITY: Secure logging utility that only logs in development mode
 * Never logs sensitive data like passwords, tokens, or API keys
 */

const isDev = import.meta.env.DEV;

// SECURITY: List of patterns that should never be logged
const SENSITIVE_PATTERNS = [
  /password/i,
  /secret/i,
  /api[_-]?key/i,
  /token/i,
  /credential/i,
  /bearer/i,
  /authorization/i,
  /private[_-]?key/i,
  /xkeysib/i, // Brevo API keys
  /sk_live/i, // Stripe live keys
  /sq0/i, // Square keys
];

// Check if data contains sensitive information
function containsSensitiveData(data: any): boolean {
  if (!data) return false;

  const str = typeof data === 'string' ? data : JSON.stringify(data);
  return SENSITIVE_PATTERNS.some(pattern => pattern.test(str));
}

// Redact sensitive data from objects
function redactSensitive(data: any): any {
  if (!data) return data;
  if (typeof data !== 'object') return data;

  const redacted = { ...data };
  for (const key of Object.keys(redacted)) {
    if (SENSITIVE_PATTERNS.some(pattern => pattern.test(key))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof redacted[key] === 'object') {
      redacted[key] = redactSensitive(redacted[key]);
    }
  }
  return redacted;
}

export const secureLog = {
  /**
   * Log info messages (dev only)
   */
  info: (...args: any[]) => {
    if (!isDev) return;
    const safeArgs = args.map(arg => {
      if (containsSensitiveData(arg)) {
        return '[SENSITIVE DATA REDACTED]';
      }
      return typeof arg === 'object' ? redactSensitive(arg) : arg;
    });
    console.log('[INFO]', ...safeArgs);
  },

  /**
   * Log debug messages (dev only)
   */
  debug: (...args: any[]) => {
    if (!isDev) return;
    const safeArgs = args.map(arg => {
      if (containsSensitiveData(arg)) {
        return '[SENSITIVE DATA REDACTED]';
      }
      return typeof arg === 'object' ? redactSensitive(arg) : arg;
    });
    console.debug('[DEBUG]', ...safeArgs);
  },

  /**
   * Log warnings (always, but redacted)
   */
  warn: (...args: any[]) => {
    const safeArgs = args.map(arg => {
      if (containsSensitiveData(arg)) {
        return '[SENSITIVE DATA REDACTED]';
      }
      return typeof arg === 'object' ? redactSensitive(arg) : arg;
    });
    console.warn('[WARN]', ...safeArgs);
  },

  /**
   * Log errors (always, but redacted)
   */
  error: (...args: any[]) => {
    const safeArgs = args.map(arg => {
      if (containsSensitiveData(arg)) {
        return '[SENSITIVE DATA REDACTED]';
      }
      return typeof arg === 'object' ? redactSensitive(arg) : arg;
    });
    console.error('[ERROR]', ...safeArgs);
  }
};

export default secureLog;
