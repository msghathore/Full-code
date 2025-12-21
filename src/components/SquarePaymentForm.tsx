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

// Official Apple Pay Mark
const ApplePayLogo = () => (
  <svg viewBox="0 0 165.521 105.965" className="h-10 w-auto">
    <g>
      <path fill="#000" d="M150.698 0H14.823c-.566 0-1.133 0-1.698.003-.477.004-.953.009-1.43.022-1.039.028-2.087.09-3.113.274a10.51 10.51 0 0 0-2.958.975 9.932 9.932 0 0 0-4.35 4.35 10.463 10.463 0 0 0-.975 2.96C.113 9.611.052 10.658.024 11.696a70.22 70.22 0 0 0-.022 1.43C0 13.69 0 14.256 0 14.823v76.318c0 .567 0 1.132.002 1.699.003.476.009.953.022 1.43.028 1.036.09 2.084.275 3.11a10.46 10.46 0 0 0 .974 2.96 9.897 9.897 0 0 0 1.83 2.52 9.874 9.874 0 0 0 2.52 1.83c.947.483 1.917.79 2.96.977 1.025.183 2.073.245 3.112.273.477.011.953.017 1.43.02.565.004 1.132.004 1.698.004h135.875c.565 0 1.132 0 1.697-.004.476-.002.952-.009 1.431-.02 1.037-.028 2.085-.09 3.113-.273a10.478 10.478 0 0 0 2.958-.977 9.955 9.955 0 0 0 4.35-4.35c.483-.947.789-1.917.974-2.96.186-1.026.246-2.074.274-3.11.013-.477.02-.954.022-1.43.004-.567.004-1.132.004-1.699V14.823c0-.567 0-1.133-.004-1.699a63.067 63.067 0 0 0-.022-1.429c-.028-1.038-.088-2.085-.274-3.112a10.4 10.4 0 0 0-.974-2.96 9.94 9.94 0 0 0-4.35-4.35A10.52 10.52 0 0 0 156.939.3c-1.028-.185-2.076-.246-3.113-.274a71.417 71.417 0 0 0-1.431-.022C151.83 0 151.263 0 150.698 0z"/>
      <path fill="#FFF" d="M150.698 3.532l1.672.003c.452.003.905.008 1.36.02.793.022 1.719.065 2.583.22.75.135 1.38.34 1.984.648a6.392 6.392 0 0 1 2.804 2.807c.306.6.51 1.226.645 1.983.154.854.197 1.783.218 2.58.013.45.019.9.02 1.36.005.557.005 1.113.005 1.671v76.318c0 .558 0 1.114-.004 1.682-.002.45-.008.9-.02 1.35-.022.796-.065 1.725-.221 2.589a6.855 6.855 0 0 1-.645 1.975 6.397 6.397 0 0 1-2.808 2.807c-.6.306-1.228.512-1.971.644-.881.157-1.847.2-2.574.22-.457.01-.912.017-1.379.019-.555.004-1.113.004-1.669.004H14.801c-.55 0-1.1 0-1.66-.004a74.993 74.993 0 0 1-1.35-.018c-.744-.02-1.71-.064-2.584-.22a6.938 6.938 0 0 1-1.986-.65 6.337 6.337 0 0 1-1.622-1.18 6.355 6.355 0 0 1-1.178-1.623 6.935 6.935 0 0 1-.646-1.985c-.156-.863-.2-1.788-.22-2.578a66.088 66.088 0 0 1-.02-1.355l-.003-1.327V14.474l.002-1.325a66.7 66.7 0 0 1 .02-1.357c.022-.792.065-1.717.222-2.587a6.924 6.924 0 0 1 .646-1.981c.304-.598.7-1.144 1.18-1.623a6.386 6.386 0 0 1 1.624-1.18 6.96 6.96 0 0 1 1.98-.646c.865-.155 1.792-.198 2.586-.22.468-.012.94-.018 1.377-.02l1.7-.003h135.875"/>
      <path fill="#000" d="M43.508 35.77c1.404-1.755 2.356-4.112 2.105-6.52-2.054.102-4.56 1.355-6.012 3.112-1.303 1.504-2.456 3.959-2.156 6.266 2.306.2 4.61-1.152 6.063-2.858"/>
      <path fill="#000" d="M45.587 39.079c-3.35-.2-6.196 1.9-7.795 1.9-1.6 0-4.049-1.8-6.698-1.751-3.447.05-6.645 2-8.395 5.1-3.598 6.2-.95 15.4 2.55 20.45 1.699 2.5 3.747 5.25 6.445 5.151 2.55-.1 3.549-1.65 6.647-1.65 3.097 0 3.997 1.65 6.696 1.6 2.798-.05 4.548-2.5 6.247-5 1.95-2.85 2.747-5.6 2.797-5.75-.05-.05-5.396-2.101-5.446-8.251-.05-5.15 4.198-7.6 4.398-7.751-2.399-3.548-6.147-3.948-7.447-4.048"/>
      <path fill="#000" d="M78.47 32.11c7.65 0 12.958 5.267 12.958 12.938 0 7.712-5.408 12.979-13.118 12.979h-8.448v13.435H63.18V32.11H78.47zM70 52.56h7.008c5.328 0 8.348-2.87 8.348-7.533 0-4.663-3.02-7.492-8.308-7.492H70V52.56z"/>
      <path fill="#000" d="M93.108 62.132c0-5.04 3.86-8.13 10.728-8.53l7.91-.46v-2.23c0-3.2-2.15-5.11-5.75-5.11-3.4 0-5.51 1.71-6.01 4.33h-6.1c.3-5.65 4.96-9.82 12.35-9.82 7.25 0 11.89 3.87 11.89 9.92v20.73h-6.32v-4.94h-.16c-1.85 3.38-5.9 5.54-10.12 5.54-6.28 0-10.42-3.84-10.42-9.43zm18.64-2.86v-2.27l-7.12.44c-3.54.23-5.54 1.87-5.54 4.53 0 2.72 2.08 4.5 5.27 4.5 4.12 0 7.39-2.83 7.39-6.66v-.54z"/>
      <path fill="#000" d="M124.39 80.908c-1.48 4.4-4.68 6.54-10.02 6.54-1.05 0-2.47-.1-3.18-.2v-5.47c.7.1 1.79.16 2.39.16 2.45 0 3.76-1.03 4.56-3.66l.5-1.66-11.5-35.96h6.94l8.03 28.53h.16l8.03-28.53h6.78l-12.69 40.25z"/>
    </g>
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

          // Card styling with black text for readability
          const newCard = await payments.card({
            style: {
              input: {
                color: '#000000',
                fontSize: '16px',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              },
              'input::placeholder': {
                color: '#6B7280'
              },
              '.input-container': {
                borderColor: '#E5E7EB',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF'
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
            await newCard.attach('#card-container');
            setCard(newCard);
            console.log('✅ Card form attached successfully');
          } else if (retryCount < 5) {
            // Retry if container not found (DOM might not be ready)
            console.log(`⏳ Card container not found, retrying... (${retryCount + 1}/5)`);
            setTimeout(() => initializePaymentMethods(retryCount + 1), 200);
            return;
          } else {
            console.error('❌ Card container not found after 5 retries');
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
          setHasError(true);
          onPaymentError('Failed to initialize payment form');
        }
      };

      // Delay to ensure DOM elements are rendered before initializing payment
      setTimeout(() => initializePaymentMethods(0), 300);
    }
  }, [isLoaded, card, safeAmount, isDemoMode, isAuthenticated, onPaymentError]);

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
      className="space-y-6 bg-black border border-white/20 rounded-xl p-6 md:p-8"
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
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-white text-sm font-semibold tracking-wider uppercase">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
          </svg>
          QUICK PAYMENT
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Apple Pay Button */}
          <motion.button
            type="button"
            onClick={handleApplePayClick}
            disabled={isProcessing || isDemoMode}
            onHoverStart={() => setHoveredButton('apple')}
            onHoverEnd={() => setHoveredButton(null)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative h-14 bg-white rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ${
              isProcessing || isDemoMode ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-white/20'
            }`}
          >
            <motion.div
              animate={{ scale: hoveredButton === 'apple' ? 1.05 : 1 }}
              transition={{ type: 'spring', stiffness: 400 }}
              className="text-black"
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
            className={`relative h-14 bg-white rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ${
              isProcessing || isDemoMode ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-white/20'
            }`}
          >
            <motion.div
              animate={{ scale: hoveredButton === 'google' ? 1.05 : 1 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <GooglePayLogo />
            </motion.div>
          </motion.button>
        </div>

        {/* Divider */}
        <div className="relative py-3">
          <Separator className="bg-white/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-black px-4 text-white/60 text-sm font-medium tracking-wider uppercase">
              or pay with card
            </span>
          </div>
        </div>
      </div>

      {/* Card Details Header */}
      <div className="flex justify-between items-center">
        <div className="text-white text-sm font-semibold tracking-wider uppercase">CARD DETAILS</div>
        <motion.button
          type="button"
          onClick={showScanner ? stopScanner : startScanner}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-3 py-1.5 border border-white/30 rounded-lg text-white text-sm hover:bg-white/10 transition-colors"
        >
          <Camera className="h-4 w-4" />
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
      <form onSubmit={handleCardSubmit} className="space-y-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div
            id="card-container"
            className="min-h-[60px] rounded-lg bg-white p-3"
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
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-14 text-lg tracking-wide transition-all duration-300 rounded-lg"
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
