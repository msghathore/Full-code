import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreditCard, Loader2, AlertCircle } from 'lucide-react';
import { SQUARE_CONFIG, formatAmountForSquare } from '@/lib/square';
import { useToast } from '@/hooks/use-toast';

interface SquarePaymentFormProps {
  amount: number;
  onPaymentSuccess: (result: any) => void;
  onPaymentError: (error: string) => void;
  description?: string;
}

declare global {
  interface Window {
    Square?: any;
  }
}

export const SquarePaymentForm = ({
  amount,
  onPaymentSuccess,
  onPaymentError,
  description = 'Zavira Beauty Service'
}: SquarePaymentFormProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [card, setCard] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();

  // Check if Square is properly configured
  if (!SQUARE_CONFIG.isConfigured) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
          <div className="text-center">
            <h3 className="text-sm font-medium text-yellow-800">Square Payment Unavailable</h3>
            <p className="text-xs text-yellow-600 mt-1">
              Square is not properly configured. Please check your environment variables.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Load Square Web SDK with error handling
  useEffect(() => {
    const loadSquareScript = () => {
      return new Promise((resolve, reject) => {
        if (window.Square) {
          resolve(window.Square);
          return;
        }

        try {
          const script = document.createElement('script');
          script.src = 'https://sandbox.web.squarecdn.com/v1/square.js';
          script.onload = () => resolve(window.Square);
          script.onerror = () => reject(new Error('Failed to load Square SDK'));
          document.head.appendChild(script);
        } catch (error) {
          reject(error);
        }
      });
    };

    loadSquareScript()
      .then(() => {
        if (window.Square && SQUARE_CONFIG.applicationId && SQUARE_CONFIG.locationId) {
          setIsLoaded(true);
        } else {
          setHasError(true);
          console.error('Square not properly configured');
        }
      })
      .catch((error) => {
        console.error('Failed to load Square SDK:', error);
        setHasError(true);
        onPaymentError('Failed to load payment system');
      });
  }, [onPaymentError]);

  // Initialize card when Square is loaded
  useEffect(() => {
    if (isLoaded && window.Square && !card) {
      try {
        const payments = window.Square.payments(SQUARE_CONFIG.applicationId, SQUARE_CONFIG.locationId);
        
        payments.card().then((newCard: any) => {
          newCard.attach('#card-container');
          setCard(newCard);
        }).catch((error: any) => {
          console.error('Failed to initialize Square card:', error);
          setHasError(true);
          onPaymentError('Failed to initialize payment form');
        });
      } catch (error) {
        console.error('Square initialization error:', error);
        setHasError(true);
        onPaymentError('Failed to initialize payment system');
      }
    }
  }, [isLoaded, card, onPaymentError]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!card) {
      onPaymentError('Payment form not ready');
      return;
    }

    setIsProcessing(true);

    try {
      // Tokenize the payment method
      const result = await card.tokenize();
      
      if (result.status === 'OK') {
        // Send payment to your backend for processing
        const paymentData = {
          sourceId: result.token,
          amount: formatAmountForSquare(amount),
          locationId: SQUARE_CONFIG.locationId,
          description,
          referenceId: `order_${Date.now()}`
        };

        // Call your backend API to process the payment
        const response = await fetch('/api/square-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentData),
        });

        const paymentResult = await response.json();

        if (paymentResult.success) {
          onPaymentSuccess({
            paymentId: paymentResult.paymentId,
            status: 'COMPLETED',
            amount: amount
          });
        } else {
          onPaymentError(paymentResult.error || 'Payment failed');
        }
      } else {
        onPaymentError(result.errors?.[0]?.message || 'Card tokenization failed');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      onPaymentError(error.message || 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (hasError) {
    return (
      <div className="flex items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="h-8 w-8 text-red-500 mr-2" />
        <div className="text-center">
          <h3 className="text-sm font-medium text-red-800">Payment System Unavailable</h3>
          <p className="text-xs text-red-600 mt-1">
            Unable to load Square payment system. Please try again later or use a different payment method.
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading payment form...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Card Payment</h3>
        <div className="text-sm text-gray-600 mb-4">
          Amount: <span className="font-semibold">${amount.toFixed(2)}</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Information
          </label>
          <div
            id="card-container"
            className="border border-gray-300 rounded-md p-3 bg-white"
          />
        </div>

        <Button
          type="submit"
          disabled={!card || isProcessing}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Pay ${amount.toFixed(2)}
            </>
          )}
        </Button>
      </form>

      <div className="text-xs text-gray-500 text-center">
        <p>Secure payment powered by Square</p>
        <p>Your card information is encrypted and secure</p>
      </div>
    </div>
  );
};