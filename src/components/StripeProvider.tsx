import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import { ReactNode } from 'react';

interface StripeProviderProps {
  children: ReactNode;
  mode?: 'payment' | 'setup' | 'subscription';
  amount?: number;
  currency?: string;
  paymentMethodTypes?: string[];
}

export const StripeProvider = ({
  children,
  mode = 'payment',
  amount,
  currency = 'usd',
  paymentMethodTypes = ['card'],
}: StripeProviderProps) => {
  const options: any = {
    mode,
    ...(amount && { amount }),
    currency,
    paymentMethodTypes,
    appearance: {
      theme: 'night' as const,
      variables: {
        colorPrimary: '#ffffff',
        colorBackground: '#000000',
        colorText: '#ffffff',
        colorDanger: '#ff4444',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
      rules: {
        '.Input': {
          boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        '.Input:focus': {
          boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        },
        '.Label': {
          color: 'rgba(255, 255, 255, 0.7)',
          fontWeight: '500',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontSize: '0.75rem',
        },
        '.Tab': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'rgba(255, 255, 255, 0.7)',
        },
        '.Tab--selected': {
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          color: '#ffffff',
        },
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
};