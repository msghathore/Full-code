import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with the publishable key from environment variables
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn('Stripe publishable key not found. Please add VITE_STRIPE_PUBLISHABLE_KEY to your .env file');
}

export const stripePromise = loadStripe(stripePublishableKey || '');

// Helper function to format amount for Stripe (converts dollars to cents)
export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100);
};

// Helper function to format amount for display (converts cents to dollars)
export const formatAmountFromStripe = (amount: number): number => {
  return amount / 100;
};