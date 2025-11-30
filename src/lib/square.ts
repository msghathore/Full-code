// Square payment integration - Production implementation
// This file contains configuration and utility functions for Square Web Payments SDK

// Initialize Square configuration with environment variables
const squareApplicationId = import.meta.env.VITE_SQUARE_APPLICATION_ID;
const squareLocationId = import.meta.env.VITE_SQUARE_LOCATION_ID;
const squareEnvironment = import.meta.env.VITE_SQUARE_ENVIRONMENT || 'sandbox';

// Validate required environment variables
if (!squareApplicationId) {
  console.warn('Square application ID not found. Please add VITE_SQUARE_APPLICATION_ID to your .env file');
}

if (!squareLocationId) {
  console.warn('Square location ID not found. Please add VITE_SQUARE_LOCATION_ID to your .env file');
}

export const SQUARE_CONFIG = {
  applicationId: squareApplicationId || '',
  locationId: squareLocationId || '',
  environment: squareEnvironment as 'sandbox' | 'production',
  isConfigured: !!(squareApplicationId && squareLocationId),
  // Square Web SDK base URL
  sdkUrl: squareEnvironment === 'production'
    ? 'https://web.squarecdn.com/v1/square.js'
    : 'https://sandbox.web.squarecdn.com/v1/square.js'
};

// Check if Square SDK is loaded
export const isSquareSdkLoaded = (): boolean => {
  return typeof window !== 'undefined' && !!window.Square;
};

// Load Square Web SDK dynamically
export const loadSquareSdk = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (isSquareSdkLoaded()) {
      resolve(window.Square);
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = SQUARE_CONFIG.sdkUrl;
    script.type = 'text/javascript';
    script.async = true;
    
    // Set up event handlers
    script.onload = () => {
      if (isSquareSdkLoaded()) {
        resolve(window.Square);
      } else {
        reject(new Error('Square SDK failed to load properly'));
      }
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load Square SDK'));
    };

    // Add script to document
    document.head.appendChild(script);
  });
};

// Helper function to format amount for Square (converts dollars to cents)
export const formatAmountForSquare = (amount: number): number => {
  return Math.round(amount * 100);
};

// Helper function to format amount for display (converts cents to dollars)
export const formatAmountFromSquare = (amount: number): number => {
  return amount / 100;
};

// Generate unique order ID for Square payments
export const generateOrderId = (): string => {
  return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};