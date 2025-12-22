import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Lock, Camera, Star, CheckCircle2 } from 'lucide-react';
import { SQUARE_CONFIG, formatAmountForSquare, loadSquareSdk, isSquareSdkLoaded } from '@/lib/square';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useStaffAuth } from '@/hooks/useStaffAuth';
import { useAuth } from '@clerk/clerk-react';
import { Separator } from '@/components/ui/separator';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface SquarePaymentFormProps {
  amount: number;
  onPaymentSuccess: (result: any) => void;
  onPaymentError: (error: string) => void;
  description?: string;
  customerId?: string;
  staffId?: string;
  allowGuestCheckout?: boolean;
}

declare global {
  interface Window {
    Square?: any;
  }
}

// Official Apple Pay Logo
const ApplePayLogo = () => (
  <svg viewBox="0 0 512 210.2" className="h-8 w-auto" fill="currentColor">
    <path d="M93.6,27.1C87.6,34.2,78,39.8,68.4,39c-1.2-9.6,3.5-19.8,9-26.1c6-7.3,16.5-12.5,25-12.9
      C103.4,10,99.5,19.8,93.6,27.1 M102.3,40.9c-13.9-0.8-25.8,7.9-32.4,7.9c-6.7,0-16.8-7.5-27.8-7.3c-14.3,0.2-27.6,8.3-34.9,21.2
      c-15,25.8-3.9,64,10.6,85c7.1,10.4,15.6,21.8,26.8,21.4c10.6-0.4,14.8-6.9,27.6-6.9c12.9,0,16.6,6.9,27.8,6.7
      c11.6-0.2,18.9-10.4,26-20.8c8.1-11.8,11.4-23.3,11.6-23.9c-0.2-0.2-22.4-8.7-22.6-34.3c-0.2-21.4,17.5-31.6,18.3-32.2
      C123.3,42.9,107.7,41.3,102.3,40.9 M182.6,11.9v155.9h24.2v-53.3h33.5c30.6,0,52.1-21,52.1-51.4c0-30.4-21.1-51.2-51.3-51.2H182.6z
      M206.8,32.3h27.9c21,0,33,11.2,33,30.9c0,19.7-12,31-33.1,31h-27.8V32.3z M336.6,169c15.2,0,29.3-7.7,35.7-19.9h0.5v18.7h22.4V90.2
      c0-22.5-18-37-45.7-37c-25.7,0-44.7,14.7-45.4,34.9h21.8c1.8-9.6,10.7-15.9,22.9-15.9c14.8,0,23.1,6.9,23.1,19.6v8.6l-30.2,1.8
      c-28.1,1.7-43.3,13.2-43.3,33.2C298.4,155.6,314.1,169,336.6,169z M343.1,150.5c-12.9,0-21.1-6.2-21.1-15.7c0-9.8,7.9-15.5,23-16.4
      l26.9-1.7v8.8C371.9,140.1,359.5,150.5,343.1,150.5z M425.1,210.2c23.6,0,34.7-9,44.4-36.3L512,54.7h-24.6l-28.5,92.1h-0.5
      l-28.5-92.1h-25.3l41,113.5l-2.2,6.9c-3.7,11.7-9.7,16.2-20.4,16.2c-1.9,0-5.6-0.2-7.1-0.4v18.7C417.3,210,423.3,210.2,425.1,210.2z"/>
  </svg>
);

// Official Google Pay Logo SVG
const GooglePayLogo = () => (
  <svg viewBox="0 0 435.97 173.13" className="h-7 w-auto">
    <path fill="#5F6368" d="M206.2 84.58v50.75h-16.1V10h42.7a38.61 38.61 0 0 1 27.65 10.85A34.88 34.88 0 0 1 272 47.3a34.72 34.72 0 0 1-11.55 26.6q-11.2 10.68-27.65 10.67H206.2zm0-59.15v43.72h27a21.28 21.28 0 0 0 15.93-6.48 21.36 21.36 0 0 0 0-30.63 21 21 0 0 0-15.93-6.62H206.2z"/>
    <path fill="#5F6368" d="M309.1 46.78q17.85 0 28.18 9.54T347.6 82.9v52.43h-15.4v-11.82h-.7q-10 14.63-26.6 14.62-14.18 0-23.72-8.4a26.59 26.59 0 0 1-9.54-21q0-13.27 10.06-21.17t26.86-7.88q14.33 0 23.63 5.25v-3.68a18.33 18.33 0 0 0-6.83-14.35 23.56 23.56 0 0 0-16-5.95q-13.83 0-21.88 11.55l-14.18-8.93q12.07-17.15 32.8-17.15zm-20.83 62.3a12.86 12.86 0 0 0 5.34 10.5 19.64 19.64 0 0 0 12.51 4.2 25.67 25.67 0 0 0 18.11-7.52 24 24 0 0 0 7.87-17.85q-7.53-6-21-6-9.81 0-16.31 4.81a14.84 14.84 0 0 0-6.52 11.86z"/>
    <path fill="#5F6368" d="M436 49.58l-53.76 123.55h-16.62l19.95-43.17-35.35-80.38h17.5l25.55 61.6h.35l24.85-61.6z"/>
    <path fill="#4285F4" d="M141.14 73.64a85.79 85.79 0 0 0-1.24-14.64H72v27.73h38.89a33.33 33.33 0 0 1-14.38 21.88v17.95h23.21c13.59-12.53 21.42-31.06 21.42-52.92z"/>
    <path fill="#34A853" d="M72 144c19.43 0 35.79-6.38 47.72-17.38l-23.21-17.95c-6.47 4.36-14.78 6.83-24.51 6.83-18.78 0-34.72-12.66-40.42-29.72H7.67v18.55A72 72 0 0 0 72 144z"/>
    <path fill="#FBBC04" d="M31.58 85.78a43.14 43.14 0 0 1 0-27.56V39.67H7.67a72 72 0 0 0 0 64.66z"/>
    <path fill="#EA4335" d="M72 28.5a39.09 39.09 0 0 1 27.62 10.8l20.55-20.55A69.18 69.18 0 0 0 72 0 72 72 0 0 0 7.67 39.67l23.91 18.55C37.28 41.16 53.22 28.5 72 28.5z"/>
  </svg>
);

export const SquarePaymentForm = ({
  amount,
  onPaymentSuccess,
  onPaymentError,
  description = 'Zavira Beauty Service',
  customerId,
  staffId,
  allowGuestCheckout = false
}: SquarePaymentFormProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [card, setCard] = useState<any>(null);
  const [applePay, setApplePay] = useState<any>(null);
  const [googlePay, setGooglePay] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [supportsApplePay, setSupportsApplePay] = useState(false);
  const [supportsGooglePay, setSupportsGooglePay] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const location = useLocation();

  // Safely handle amount - default to 0 if NaN or undefined
  const safeAmount = isNaN(amount) || amount === undefined || amount === null ? 0 : amount;

  const isDemoMode = new URLSearchParams(location.search).get('demo') === 'true';

  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const { isStaffMember, isLoaded: isStaffLoaded } = useStaffAuth();

  const staffToken = localStorage.getItem('staff_auth_token');
  const isValidStaffToken = staffToken && /^[a-f0-9]{64}$/i.test(staffToken);

  // Prioritize guest checkout to avoid auth dependency issues
  const isAuthenticated = allowGuestCheckout || isValidStaffToken || (isAuthLoaded && isStaffLoaded && isSignedIn && isStaffMember);

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  useEffect(() => {
    const initializeSquareSdk = async () => {
      // Skip if not configured and not in demo mode
      if (!SQUARE_CONFIG.isConfigured && !isDemoMode) {
        return;
      }

      try {
        if (isDemoMode) {
          setIsLoaded(true);
          return;
        }

        if (isSquareSdkLoaded() && SQUARE_CONFIG.applicationId && SQUARE_CONFIG.locationId) {
          setIsLoaded(true);
          return;
        }

        if (!SQUARE_CONFIG.applicationId || !SQUARE_CONFIG.locationId) {
          setHasError(true);
          onPaymentError('Payment system not configured');
          return;
        }

        await loadSquareSdk();
        setIsLoaded(true);
      } catch (error: any) {
        console.error('Failed to load Square SDK:', error);
        setHasError(true);
        onPaymentError('Failed to load payment system. Please refresh the page.');
      }
    };

    initializeSquareSdk();
  }, [onPaymentError, isDemoMode]);

  useEffect(() => {
    if (isLoaded && window.Square && !card && !isDemoMode && isAuthenticated) {
      const initializePaymentMethods = async (retryCount = 0) => {
        try {
          const payments = window.Square.payments(SQUARE_CONFIG.applicationId, SQUARE_CONFIG.locationId);

          // Card styling - production Square SDK requires specific properties
          const newCard = await payments.card({
            style: {
              input: {
                color: '#000000',
                fontSize: '16px'
              },
              'input::placeholder': {
                color: '#6B7280'
              },
              '.input-container': {
                borderColor: '#E5E7EB',
                borderRadius: '8px'
              },
              '.input-container.is-focus': {
                borderColor: '#000000'
              },
              '.input-container.is-error': {
                borderColor: '#ef4444'
              },
              '.message-text': {
                color: '#ef4444'
              },
              '.message-icon': {
                color: '#ef4444'
              }
            }
          });

          const cardContainer = document.getElementById('card-container');
          if (cardContainer) {
            try {
              await newCard.attach('#card-container');
              setCard(newCard);
              console.log('✅ Card form attached successfully');
            } catch (attachError: any) {
              console.error('❌ Card attach failed:', attachError);
              // Retry on attach failure
              if (retryCount < 10) {
                console.log(`🔄 Retrying card attach (${retryCount + 1}/10)`);
                setTimeout(() => initializePaymentMethods(retryCount + 1), 500);
                return;
              } else {
                throw new Error(`Card attach failed after ${retryCount + 1} attempts: ${attachError.message}`);
              }
            }
          } else if (retryCount < 10) {
            // Retry if container not found (DOM might not be ready)
            console.log(`⏳ Card container not found, retrying... (${retryCount + 1}/10)`);
            setTimeout(() => initializePaymentMethods(retryCount + 1), 500);
            return;
          } else {
            console.error('❌ Card container not found after 10 retries');
            setHasError(true);
            onPaymentError('Payment form failed to load. Please refresh the page.');
            return;
          }

          // Initialize Apple Pay
          try {
            const paymentRequest = payments.paymentRequest({
              countryCode: 'CA',
              currencyCode: 'CAD',
              total: {
                amount: safeAmount.toFixed(2),
                label: 'Zavira Beauty',
              },
            });

            const newApplePay = await payments.applePay(paymentRequest);
            setApplePay(newApplePay);
            setSupportsApplePay(true);
          } catch (e) {
            console.log('Apple Pay not available on this device');
          }

          // Initialize Google Pay
          try {
            const paymentRequest = payments.paymentRequest({
              countryCode: 'CA',
              currencyCode: 'CAD',
              total: {
                amount: safeAmount.toFixed(2),
                label: 'Zavira Beauty',
              },
            });

            const newGooglePay = await payments.googlePay(paymentRequest);
            const gpayButton = document.getElementById('google-pay-button');
            if (gpayButton) {
              await newGooglePay.attach('#google-pay-button', {
                buttonColor: 'black',
                buttonType: 'long',
                buttonSizeMode: 'fill'
              });
            }
            setGooglePay(newGooglePay);
            setSupportsGooglePay(true);
          } catch (e) {
            console.log('Google Pay not available on this device');
          }

        } catch (error: any) {
          console.error('Failed to initialize payment methods:', error);
          console.error('Error details:', error.message, error.stack);
          setHasError(true);
          onPaymentError('Failed to initialize payment form');
        }
      };

      // Delay to ensure DOM elements are rendered before initializing payment
      // Increased delay to 800ms to give React more time to render the DOM
      setTimeout(() => initializePaymentMethods(0), 800);
    }
  }, [isLoaded, card, safeAmount, isDemoMode, isAuthenticated]);
  // Note: onPaymentError intentionally excluded from deps to prevent re-initialization on parent re-renders

  const processPayment = async (paymentMethod: any, type: string) => {
    setIsProcessing(true);

    try {
      const result = await paymentMethod.tokenize();

      if (result.status === 'OK') {
        const paymentData = {
          sourceId: result.token,
          amount: formatAmountForSquare(safeAmount),
          locationId: SQUARE_CONFIG.locationId,
          description,
          referenceId: `order_${Date.now()}`,
          customerId,
          staffId
        };

        const { data: paymentResult, error: functionError } = await supabase.functions.invoke('square-payment', {
          body: paymentData,
        });

        if (functionError) {
          throw new Error(functionError.message || 'Payment failed');
        }

        if (paymentResult.success) {
          onPaymentSuccess({
            paymentId: paymentResult.paymentId,
            status: 'COMPLETED',
            amount: safeAmount,
            method: type
          });
        } else {
          onPaymentError(paymentResult.error || 'Payment failed');
        }
      } else {
        onPaymentError(result.errors?.[0]?.message || 'Payment tokenization failed');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      onPaymentError(error.message || 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDemoPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onPaymentSuccess({
        paymentId: `demo_${Date.now()}`,
        status: 'COMPLETED',
        amount: safeAmount,
        method: 'Demo'
      });
      setIsProcessing(false);
    }, 2000);
  };

  const handleCardSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isDemoMode) {
      handleDemoPayment();
      return;
    }

    if (!card) {
      onPaymentError('Payment form is still loading. Please wait a moment and try again.');
      return;
    }
    await processPayment(card, 'Card');
  };

  const handleApplePayClick = async () => {
    if (applePay) {
      await processPayment(applePay, 'Apple Pay');
    } else {
      toast({
        title: 'Apple Pay Not Available',
        description: 'Apple Pay requires Safari on an Apple device with a configured wallet.',
        variant: 'default'
      });
    }
  };

  const handleGooglePayClick = async () => {
    if (googlePay) {
      try {
        await processPayment(googlePay, 'Google Pay');
      } catch (error: any) {
        console.log('💸 Payment error:', error?.message || error);
        // Google Pay in sandbox mode often fails - provide helpful message
        if (SQUARE_CONFIG.environment === 'sandbox') {
          toast({
            title: 'Sandbox Mode Limitation',
            description: 'Google Pay is limited in sandbox mode. Please use the card payment option for testing, or try in production mode.',
            variant: 'default'
          });
        } else {
          toast({
            title: 'Google Pay Error',
            description: error?.message || 'An error occurred with Google Pay. Please try card payment instead.',
            variant: 'destructive'
          });
        }
      }
    } else {
      toast({
        title: 'Google Pay Not Available',
        description: 'Google Pay requires Chrome with a Google account and configured payment method.',
        variant: 'default'
      });
    }
  };

  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowScanner(true);
      }
    } catch (error) {
      toast({
        title: 'Camera Access Denied',
        description: 'Please allow camera access to scan your card.',
        variant: 'destructive'
      });
    }
  };

  const stopScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowScanner(false);
  };

  // CONDITIONAL RENDERS AFTER ALL HOOKS
  if (!SQUARE_CONFIG.isConfigured && !isDemoMode) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-sm text-yellow-300">
            <strong>Configuration Needed:</strong> Square is not configured.
          </p>
        </div>
      </motion.div>
    );
  }

  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center p-6 bg-black border border-white/20 rounded-xl"
      >
        <Lock className="h-5 w-5 text-white/60 mr-2" />
        <div className="text-center">
          <h3 className="text-sm font-medium text-white">Authentication Required</h3>
          <p className="text-xs text-white/60 mt-1">
            Please provide contact information to continue.
          </p>
        </div>
      </motion.div>
    );
  }

  if (hasError && !isDemoMode) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center p-8 bg-red-950/30 border border-red-500/30 rounded-xl"
      >
        <AlertCircle className="h-8 w-8 text-red-400 mr-2" />
        <div className="text-center">
          <h3 className="text-sm font-medium text-red-300">Payment System Unavailable</h3>
          <p className="text-xs text-red-400/80 mt-1">
            Unable to load payment system. Please refresh the page.
          </p>
        </div>
      </motion.div>
    );
  }

  if ((!isAuthLoaded || !isStaffLoaded) && !allowGuestCheckout) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
        <span className="ml-2 text-white">Verifying authentication...</span>
      </div>
    );
  }

  if (!isLoaded && !isDemoMode) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
        <span className="ml-2 text-white">Loading payment options...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-3 sm:space-y-6 bg-black border border-white/20 rounded-xl p-3 sm:p-6 md:p-8 w-full max-w-full overflow-hidden"
    >
      {/* Demo Mode Banner */}
      <AnimatePresence>
        {isDemoMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-violet-950/50 border border-violet-500/30 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 text-violet-300 mb-2">
              <Star className="h-5 w-5 fill-violet-400" />
              <span className="font-bold text-base">Demo Mode Active</span>
            </div>
            <p className="text-sm text-violet-200 mb-3">
              You are in simulation mode. No real charges will be made.
            </p>
            <Button
              onClick={handleDemoPayment}
              disabled={isProcessing}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold h-12"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Simulating Payment...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Simulate Payment (C${safeAmount.toFixed(2)})
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Pay Section */}
      <div className="space-y-2 sm:space-y-4">
        <div className="flex items-center gap-2 text-white text-xs sm:text-sm font-semibold tracking-wider uppercase">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
          </svg>
          QUICK PAYMENT
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {/* Apple Pay Button */}
          <motion.button
            type="button"
            onClick={handleApplePayClick}
            disabled={isProcessing || isDemoMode}
            onHoverStart={() => setHoveredButton('apple')}
            onHoverEnd={() => setHoveredButton(null)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative h-10 sm:h-14 bg-white rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ${
              isProcessing || isDemoMode ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-white/20'
            }`}
          >
            <motion.div
              animate={{ scale: hoveredButton === 'apple' ? 1.05 : 1 }}
              transition={{ type: 'spring', stiffness: 400 }}
              className="text-black scale-75 sm:scale-100"
            >
              <ApplePayLogo />
            </motion.div>
          </motion.button>

          {/* Google Pay Button */}
          <motion.button
            type="button"
            onClick={handleGooglePayClick}
            disabled={isProcessing || isDemoMode}
            onHoverStart={() => setHoveredButton('google')}
            onHoverEnd={() => setHoveredButton(null)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative h-10 sm:h-14 bg-white rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ${
              isProcessing || isDemoMode ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-white/20'
            }`}
          >
            <motion.div
              animate={{ scale: hoveredButton === 'google' ? 1.05 : 1 }}
              transition={{ type: 'spring', stiffness: 400 }}
              className="scale-75 sm:scale-100"
            >
              <GooglePayLogo />
            </motion.div>
          </motion.button>
        </div>

        {/* Divider */}
        <div className="relative py-2 sm:py-3">
          <Separator className="bg-white/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-black px-2 sm:px-4 text-white/60 text-[10px] sm:text-sm font-medium tracking-wider uppercase">
              or pay with card
            </span>
          </div>
        </div>
      </div>

      {/* Card Details Header */}
      <div className="flex justify-between items-center gap-2">
        <div className="text-white text-xs sm:text-sm font-semibold tracking-wider uppercase">CARD DETAILS</div>
        <motion.button
          type="button"
          onClick={showScanner ? stopScanner : startScanner}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 border border-white/30 rounded-lg text-white text-[10px] sm:text-sm hover:bg-white/10 transition-colors whitespace-nowrap"
        >
          <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
          {showScanner ? 'Close' : 'Scan Card'}
        </motion.button>
      </div>

      {/* Card Scanner */}
      <AnimatePresence>
        {showScanner && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative rounded-lg overflow-hidden border border-white/20"
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-40 border-2 border-white/50 rounded-lg relative">
                <motion.div
                  animate={{ y: [0, 160, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute top-0 left-0 w-full h-0.5 bg-white/80"
                />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-3 text-center">
              <p className="text-white text-sm">Position card within frame</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Payment Form */}
      <form onSubmit={handleCardSubmit} className="space-y-3 sm:space-y-6 w-full max-w-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative w-full max-w-full overflow-hidden"
        >
          <div
            id="card-container"
            className="min-h-[60px] rounded-lg bg-white p-2 sm:p-3 w-full max-w-full overflow-hidden"
          />
          {/* Hidden Google Pay button container */}
          <div id="google-pay-button" className="hidden" />
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Button
            type="submit"
            disabled={(!card && !isDemoMode) || isProcessing || safeAmount <= 0}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 sm:h-14 text-sm sm:text-lg tracking-wide transition-all duration-300 rounded-lg"
          >
            {isProcessing ? (
              <motion.div
                className="flex items-center"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                PROCESSING...
              </motion.div>
            ) : (
              <motion.div
                className="flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Lock className="h-5 w-5 mr-3" />
                PAY C${safeAmount.toFixed(2)} SECURELY
              </motion.div>
            )}
          </Button>
        </motion.div>
      </form>

      {/* Powered by Square */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-center gap-3 pt-4 border-t border-white/10"
      >
        <span className="text-white/60 text-sm">Secured by</span>
        <svg className="h-6 w-auto" viewBox="0 0 100 24" fill="white">
          <rect x="0" y="0" width="24" height="24" rx="4" fill="white"/>
          <rect x="4" y="4" width="16" height="16" rx="2" fill="black"/>
          <rect x="7" y="7" width="10" height="10" rx="1.5" fill="white"/>
          <text x="32" y="18" fontFamily="system-ui, sans-serif" fontSize="16" fontWeight="600" fill="white">Square</text>
        </svg>
      </motion.div>
    </motion.div>
  );
};
