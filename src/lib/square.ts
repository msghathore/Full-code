// Square payment integration - Mock implementation for development
// TODO: Replace with actual Square SDK when properly configured

// Mock types to prevent import errors
interface MockClient {
  paymentsApi: {
    createPayment: (request: any) => Promise<any>;
  };
}

interface MockEnvironment {
  Sandbox: string;
  Production: string;
}

// Initialize Square configuration with environment variables
const squareAccessToken = import.meta.env.VITE_SQUARE_ACCESS_TOKEN;
const squareApplicationId = import.meta.env.VITE_SQUARE_APPLICATION_ID;
const squareLocationId = import.meta.env.VITE_SQUARE_LOCATION_ID;

if (!squareAccessToken) {
  console.warn('Square access token not found. Please add VITE_SQUARE_ACCESS_TOKEN to your .env file');
}

if (!squareApplicationId) {
  console.warn('Square application ID not found. Please add VITE_SQUARE_APPLICATION_ID to your .env file');
}

if (!squareLocationId) {
  console.warn('Square location ID not found. Please add VITE_SQUARE_LOCATION_ID to your .env file');
}

// Mock client that will be replaced when Square is properly configured
const squareClient: MockClient | null = {
  paymentsApi: {
    createPayment: async (request: any) => {
      console.log('Mock Square payment creation:', request);
      return {
        result: {
          payment: {
            id: `mock_payment_${Date.now()}`,
            status: 'COMPLETED',
            amountMoney: request.amountMoney
          }
        }
      };
    }
  }
};

export { squareClient };

export const SQUARE_CONFIG = {
  applicationId: squareApplicationId || '',
  locationId: squareLocationId || '',
  environment: 'sandbox' as const, // Change to 'production' for live
  isConfigured: !!(squareApplicationId && squareLocationId)
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