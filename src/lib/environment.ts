/**
 * Environment Configuration and Validation
 * Ensures all required environment variables are present in production
 */

// Environment validation
export const validateEnvironment = () => {
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_PUBLISHABLE_KEY',
    'VITE_SQUARE_APPLICATION_ID',
    'VITE_SQUARE_LOCATION_ID'
  ];

  const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

  if (missingVars.length > 0) {
    console.warn('Missing environment variables:', missingVars);
    return false;
  }

  return true;
};

// Environment type guards
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// Environment configuration
export const config = {
  app: {
    env: import.meta.env.VITE_APP_ENV || 'development',
    url: import.meta.env.VITE_APP_URL || 'http://localhost:8080',
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  },
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    publishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    anonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  },
  square: {
    applicationId: import.meta.env.VITE_SQUARE_APPLICATION_ID,
    locationId: import.meta.env.VITE_SQUARE_LOCATION_ID,
    environment: import.meta.env.VITE_SQUARE_ENVIRONMENT || 'sandbox',
  },
  analytics: {
    googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
    sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  },
  security: {
    enableCsrfProtection: import.meta.env.VITE_ENABLE_CSRF_PROTECTION === 'true',
    enableCors: import.meta.env.VITE_ENABLE_CORS === 'true',
    corsOrigin: import.meta.env.VITE_CORS_ORIGIN || import.meta.env.VITE_APP_URL,
  },
};

// Production environment check
export const requireProductionEnv = () => {
  if (!isProduction) {
    throw new Error('This operation is only available in production environment');
  }
};

// Development environment check
export const requireDevelopmentEnv = () => {
  if (!isDevelopment) {
    throw new Error('This operation is only available in development environment');
  }
};

// Initialize environment validation
if (isProduction) {
  validateEnvironment();
}