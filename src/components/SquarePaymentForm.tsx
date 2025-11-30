import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreditCard, Loader2, AlertCircle, Lock } from 'lucide-react';
import { SQUARE_CONFIG, formatAmountForSquare, loadSquareSdk, isSquareSdkLoaded } from '@/lib/square';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useStaffAuth } from '@/hooks/useStaffAuth';
import { useAuth } from '@clerk/clerk-react';

interface SquarePaymentFormProps {
  amount: number;
  onPaymentSuccess: (result: any) => void;
  onPaymentError: (error: string) => void;
  description?: string;
  customerId?: string;
  staffId?: string;
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
  description = 'Zavira Beauty Service',
  customerId,
  staffId
}: SquarePaymentFormProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [card, setCard] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();
  
  // Authentication hooks
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const { isStaffMember, isLoaded: isStaffLoaded } = useStaffAuth();

  // Check for simple staff authentication (localStorage token)
  const isSimpleStaffAuth = localStorage.getItem('staff_auth_token') === 'valid_token';

  // Check if user is properly authenticated (either Clerk or simple auth)
  const isAuthenticated = (isAuthLoaded && isStaffLoaded && isSignedIn && isStaffMember) || isSimpleStaffAuth;

  // Check if Square is properly configured
  if (!SQUARE_CONFIG.isConfigured) {
    // Test mode - simulate payment for testing
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-4">Test Payment Mode</h3>
          <div className="text-sm text-gray-600 mb-4">
            Amount: <span className="font-semibold">${amount.toFixed(2)}</span>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Test Mode:</strong> Square is not configured. Click "Complete Test Payment" to simulate a successful payment.
            </p>
          </div>
        </div>

        <Button
          onClick={() => {
            console.log('Test payment completed');
            onPaymentSuccess({
              paymentId: `test_${Date.now()}`,
              status: 'COMPLETED',
              amount: amount
            });
          }}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Complete Test Payment
        </Button>

        <div className="text-xs text-gray-500 text-center">
          <p>This is a test payment simulation</p>
          <p>In production, this would process real payments through Square</p>
        </div>
      </div>
    );
  }

  // Check if user is properly authenticated (staff member only)
  if (!isAuthenticated) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center p-6 bg-red-50 border border-red-200 rounded-lg">
          <Lock className="h-5 w-5 text-red-600 mr-2" />
          <div className="text-center">
            <h3 className="text-sm font-medium text-red-800">Authentication Required</h3>
            <p className="text-xs text-red-600 mt-1">
              You must be logged in as a staff member to process payments.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Load Square Web SDK with error handling
  useEffect(() => {
    const initializeSquareSdk = async () => {
      try {
        if (isSquareSdkLoaded() && SQUARE_CONFIG.applicationId && SQUARE_CONFIG.locationId) {
          setIsLoaded(true);
          return;
        }

        if (!SQUARE_CONFIG.applicationId || !SQUARE_CONFIG.locationId) {
          setHasError(true);
          console.error('Square configuration missing');
          onPaymentError('Square payment system not configured');
          return;
        }

        await loadSquareSdk();
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load Square SDK:', error);
        setHasError(true);
        onPaymentError('Failed to load payment system');
      }
    };

    initializeSquareSdk();
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

    // Double-check authentication before processing payment
    if (!isAuthenticated) {
      onPaymentError('Authentication required. Please log in as a staff member.');
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
          referenceId: `order_${Date.now()}`,
          customerId,
          staffId
        };

        console.log('🔐 Processing payment with authenticated user...');
        
        // Call Supabase Edge Function to process the payment with proper user authentication
        const { data: paymentResult, error: functionError } = await supabase.functions.invoke('square-payment', {
          body: paymentData,
        });

        if (functionError) {
          console.error('Supabase function error:', functionError);
          
          // Handle specific authentication errors
          if (functionError.message?.includes('401') || functionError.message?.includes('Unauthorized')) {
            throw new Error('Authentication failed. Please log out and log back in, then try again.');
          }
          
          throw new Error(functionError.message || 'Payment function call failed');
        }

        if (paymentResult.success) {
          console.log('✅ Payment processed successfully:', paymentResult);
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

  // Show loading state while checking authentication
  if (!isAuthLoaded || !isStaffLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Verifying authentication...</span>
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

      {/* Test Payment Button for Development */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-blue-800 mb-2">
          <strong>Development Mode:</strong> Use test payment to complete the flow.
        </p>
        <Button
          onClick={() => {
            console.log('Test payment completed');
            onPaymentSuccess({
              paymentId: `test_${Date.now()}`,
              status: 'COMPLETED',
              amount: amount
            });
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Complete Test Payment (${amount.toFixed(2)})
        </Button>
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