import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Elements, PaymentRequestButtonElement, useStripe } from '@stripe/react-stripe-js';
import { CreditCard, Smartphone } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { stripePromise, formatAmountForStripe } from '@/lib/stripe';

interface MobileWalletPaymentProps {
  amount: number;
  onPaymentSuccess: (paymentMethod: any) => void;
  onPaymentError: (error: any) => void;
}

const PaymentRequestForm = ({ amount, onPaymentSuccess, onPaymentError }: MobileWalletPaymentProps) => {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  const [canMakePayment, setCanMakePayment] = useState(false);

  useEffect(() => {
    if (stripe) {
      const pr = stripe.paymentRequest({
        country: 'US',
        currency: 'usd',
        total: {
          label: 'Zavira Beauty Service',
          amount: formatAmountForStripe(amount),
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      pr.canMakePayment().then((result) => {
        if (result) {
          setCanMakePayment(true);
          setPaymentRequest(pr);
        }
      });

      pr.on('paymentmethod', async (event) => {
        // Send payment method to server
        try {
          const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentMethodId: event.paymentMethod.id,
              amount: formatAmountForStripe(amount),
            }),
          });

          const { clientSecret } = await response.json();

          const { error } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: event.paymentMethod.id,
          });

          if (error) {
            event.complete('fail');
            onPaymentError(error);
          } else {
            event.complete('success');
            onPaymentSuccess(event.paymentMethod);
          }
        } catch (error) {
          event.complete('fail');
          onPaymentError(error);
        }
      });
    }
  }, [stripe, amount, onPaymentSuccess, onPaymentError]);

  if (!canMakePayment || !paymentRequest) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-white/70">
        <Smartphone className="h-4 w-4" />
        <span className="text-sm">Quick payment with</span>
      </div>
      <PaymentRequestButtonElement
        options={{
          paymentRequest,
          style: {
            paymentRequestButton: {
              theme: 'dark',
              height: '48px',
            },
          },
        }}
      />
    </div>
  );
};

export const MobileWalletPayment = (props: MobileWalletPaymentProps) => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <div className="flex items-center gap-2 p-4 bg-white/5 rounded-lg">
        <CreditCard className="h-5 w-5 text-white/70" />
        <span className="text-white/70 text-sm">Mobile wallet payments available on mobile devices</span>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentRequestForm {...props} />
    </Elements>
  );
};