import { useState } from 'react';
import {
  useStripe,
  useElements,
  PaymentElement,
  AddressElement,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, Shield } from 'lucide-react';

interface StripePaymentFormProps {
  amount: number;
  currency?: string;
  onPaymentSuccess: (paymentIntent: any) => void;
  onPaymentError: (error: any) => void;
  isProcessing?: boolean;
  setIsProcessing?: (processing: boolean) => void;
  showAddress?: boolean;
  buttonText?: string;
  description?: string;
}

export const StripePaymentForm = ({
  amount,
  currency = 'usd',
  onPaymentSuccess,
  onPaymentError,
  isProcessing: externalProcessing,
  setIsProcessing: externalSetProcessing,
  showAddress = false,
  buttonText = 'Pay Now',
  description,
}: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [internalProcessing, setInternalProcessing] = useState(false);

  const isProcessing = externalProcessing !== undefined ? externalProcessing : internalProcessing;
  const setIsProcessing = externalSetProcessing || setInternalProcessing;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error('Payment failed:', error);
        onPaymentError(error);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onPaymentSuccess(paymentIntent);
      }
    } catch (error) {
      console.error('Payment error:', error);
      onPaymentError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Amount Display */}
      <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CreditCard className="h-5 w-5 text-white/70" />
          <span className="text-white/70 text-sm">Payment Amount</span>
        </div>
        <div className="text-2xl font-bold text-white">{formattedAmount}</div>
        {description && (
          <div className="text-white/60 text-sm mt-1">{description}</div>
        )}
      </div>

      {/* Address Element (optional) */}
      {showAddress && (
        <div className="space-y-2">
          <label className="text-sm text-white/70 block tracking-wider">BILLING ADDRESS</label>
          <AddressElement
            options={{
              mode: 'billing',
              allowedCountries: ['US', 'CA'],
              fields: {
                phone: 'always',
              },
              validation: {
                phone: {
                  required: 'always',
                },
              },
            }}
          />
        </div>
      )}

      {/* Payment Element */}
      <div className="space-y-2">
        <label className="text-sm text-white/70 block tracking-wider">PAYMENT METHOD</label>
        <div className="bg-black/50 border border-white/20 rounded-lg p-4">
          <PaymentElement
            options={{
              layout: 'tabs',
              paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
            }}
          />
        </div>
      </div>

      {/* Security Notice */}
      <div className="flex items-center gap-2 text-white/60 text-sm">
        <Shield className="h-4 w-4" />
        <span>Your payment information is secure and encrypted</span>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full luxury-button-hover"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          buttonText
        )}
      </Button>
    </form>
  );
};