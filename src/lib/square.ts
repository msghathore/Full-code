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

// Load Square Web SDK dynamically with retry logic and fallback
export const loadSquareSdk = (retryCount = 0, useSandboxFallback = true): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (isSquareSdkLoaded()) {
      console.log('✅ DEBUG: Square SDK already loaded');
      resolve(window.Square);
      return;
    }

    // Check if script is already in DOM
    const existingScript = document.querySelector(`script[src="${SQUARE_CONFIG.sdkUrl}"]`);
    if (existingScript) {
      console.log('🔄 DEBUG: Square SDK script already in DOM, waiting...');
      // Wait a bit and check again
      setTimeout(() => {
        if (isSquareSdkLoaded()) {
          resolve(window.Square);
        } else if (retryCount < 3) {
          console.log(`🔄 DEBUG: Retrying SDK load (attempt ${retryCount + 1})`);
          loadSquareSdk(retryCount + 1, useSandboxFallback).then(resolve).catch(reject);
        } else {
          reject(new Error('Square SDK script loaded but window.Square not available'));
        }
      }, 1000);
      return;
    }

    console.log(`🔄 DEBUG: Loading Square SDK from ${SQUARE_CONFIG.sdkUrl} (attempt ${retryCount + 1})`);

    // Create script element
    const script = document.createElement('script');
    script.src = SQUARE_CONFIG.sdkUrl;
    script.type = 'text/javascript';
    script.async = true;
    script.crossOrigin = 'anonymous'; // Add CORS handling

    // Set up timeout
    const timeout = setTimeout(() => {
      script.remove();
      if (retryCount < 2) {
        console.warn(`⏰ DEBUG: SDK load timeout, retrying (attempt ${retryCount + 1})`);
        loadSquareSdk(retryCount + 1, useSandboxFallback).then(resolve).catch(reject);
      } else if (useSandboxFallback && SQUARE_CONFIG.environment === 'production') {
        console.warn('⚠️ DEBUG: Production SDK failed, trying sandbox fallback');
        // Try sandbox as fallback
        const sandboxSdkUrl = 'https://sandbox.web.squarecdn.com/v1/square.js';
        loadSquareSdkWithUrl(sandboxSdkUrl, 0, false).then(resolve).catch(reject);
      } else {
        reject(new Error(`Square SDK load timeout after ${retryCount + 1} attempts`));
      }
    }, 10000); // 10 second timeout

    // Set up event handlers
    script.onload = () => {
      clearTimeout(timeout);
      console.log('✅ DEBUG: Square SDK script loaded successfully');
      // Give it a moment to initialize
      setTimeout(() => {
        if (isSquareSdkLoaded()) {
          console.log('✅ DEBUG: Square SDK initialized, window.Square available');
          resolve(window.Square);
        } else {
          console.error('❌ DEBUG: Square SDK script loaded but window.Square not set');
          if (retryCount < 2) {
            console.log(`🔄 DEBUG: Retrying SDK initialization (attempt ${retryCount + 1})`);
            loadSquareSdk(retryCount + 1, useSandboxFallback).then(resolve).catch(reject);
          } else if (useSandboxFallback && SQUARE_CONFIG.environment === 'production') {
            console.warn('⚠️ DEBUG: Production SDK failed to initialize, trying sandbox fallback');
            const sandboxSdkUrl = 'https://sandbox.web.squarecdn.com/v1/square.js';
            loadSquareSdkWithUrl(sandboxSdkUrl, 0, false).then(resolve).catch(reject);
          } else {
            reject(new Error('Square SDK loaded but window.Square not available'));
          }
        }
      }, 500);
    };

    script.onerror = (event) => {
      clearTimeout(timeout);
      console.error('❌ DEBUG: Square SDK script load error:', event);
      script.remove();
      if (retryCount < 2) {
        console.log(`🔄 DEBUG: SDK load error, retrying (attempt ${retryCount + 1})`);
        loadSquareSdk(retryCount + 1, useSandboxFallback).then(resolve).catch(reject);
      } else if (useSandboxFallback && SQUARE_CONFIG.environment === 'production') {
        console.warn('⚠️ DEBUG: Production SDK failed, trying sandbox fallback');
        const sandboxSdkUrl = 'https://sandbox.web.squarecdn.com/v1/square.js';
        loadSquareSdkWithUrl(sandboxSdkUrl, 0, false).then(resolve).catch(reject);
      } else {
        reject(new Error(`Failed to load Square SDK after ${retryCount + 1} attempts`));
      }
    };

    // Add script to document
    document.head.appendChild(script);
  });
};

// Helper function to load SDK with specific URL
const loadSquareSdkWithUrl = (sdkUrl: string, retryCount = 0, useSandboxFallback = true): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (isSquareSdkLoaded()) {
      resolve(window.Square);
      return;
    }

    console.log(`🔄 DEBUG: Loading Square SDK from ${sdkUrl} (fallback attempt ${retryCount + 1})`);

    const script = document.createElement('script');
    script.src = sdkUrl;
    script.type = 'text/javascript';
    script.async = true;
    script.crossOrigin = 'anonymous';

    const timeout = setTimeout(() => {
      script.remove();
      reject(new Error(`Fallback SDK load timeout for ${sdkUrl}`));
    }, 10000);

    script.onload = () => {
      clearTimeout(timeout);
      setTimeout(() => {
        if (isSquareSdkLoaded()) {
          console.log('✅ DEBUG: Fallback Square SDK initialized successfully');
          resolve(window.Square);
        } else {
          reject(new Error(`Fallback SDK loaded but window.Square not available for ${sdkUrl}`));
        }
      }, 500);
    };

    script.onerror = () => {
      clearTimeout(timeout);
      script.remove();
      reject(new Error(`Failed to load fallback SDK from ${sdkUrl}`));
    };

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