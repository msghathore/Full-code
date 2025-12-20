// Lottie Animation Wrapper Component
// Provides a reusable interface for all Lottie animations in Zavira

import Lottie from 'lottie-react';
import { CSSProperties, useMemo } from 'react';

// Import animation JSON files
import successConfettiData from '@/assets/lottie/success-confetti.json';
import scissorsData from '@/assets/lottie/scissors.json';
import loadingSpinnerData from '@/assets/lottie/loading-spinner.json';
import emptyCartData from '@/assets/lottie/empty-cart.json';
import checkmarkSuccessData from '@/assets/lottie/checkmark-success.json';

interface LottieAnimationProps {
  animationData: object;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  style?: CSSProperties;
  speed?: number;
  onComplete?: () => void;
  onLoopComplete?: () => void;
}

export const LottieAnimation = ({
  animationData,
  loop = true,
  autoplay = true,
  className = '',
  style,
  speed = 1,
  onComplete,
  onLoopComplete,
}: LottieAnimationProps) => {
  // Memoize animation data for performance
  const memoizedAnimationData = useMemo(() => animationData, [animationData]);

  return (
    <Lottie
      animationData={memoizedAnimationData}
      loop={loop}
      autoplay={autoplay}
      className={className}
      style={style}
      rendererSettings={{
        preserveAspectRatio: 'xMidYMid slice',
      }}
      onComplete={onComplete}
      onLoopComplete={onLoopComplete}
    />
  );
};

// ============================================
// PRE-BUILT ANIMATION COMPONENTS
// Use these for consistent animations across Zavira
// ============================================

/**
 * Success Confetti Animation
 * Use after successful bookings, payments, form submissions
 */
export const SuccessConfettiAnimation = ({
  className = '',
  onComplete,
}: {
  className?: string;
  onComplete?: () => void;
}) => (
  <LottieAnimation
    animationData={successConfettiData}
    className={className}
    loop={false}
    autoplay={true}
    onComplete={onComplete}
  />
);

/**
 * Simple Checkmark Success Animation
 * Use for smaller success confirmations
 */
export const SuccessAnimation = ({
  className = '',
  onComplete,
}: {
  className?: string;
  onComplete?: () => void;
}) => (
  <LottieAnimation
    animationData={checkmarkSuccessData}
    className={className}
    loop={false}
    autoplay={true}
    onComplete={onComplete}
  />
);

/**
 * Loading Spinner Animation
 * Use for loading states, page transitions
 */
export const LoadingAnimation = ({ className = '' }: { className?: string }) => (
  <LottieAnimation
    animationData={loadingSpinnerData}
    className={className}
    loop={true}
    autoplay={true}
  />
);

/**
 * Scissors Animation
 * Use for salon/beauty service icons and hover effects
 */
export const ScissorsAnimation = ({
  className = '',
  loop = true,
}: {
  className?: string;
  loop?: boolean;
}) => (
  <LottieAnimation
    animationData={scissorsData}
    className={className}
    loop={loop}
    autoplay={true}
  />
);

/**
 * Empty Cart Animation
 * Use for empty shopping cart states
 */
export const EmptyCartAnimation = ({ className = '' }: { className?: string }) => (
  <LottieAnimation
    animationData={emptyCartData}
    className={className}
    loop={true}
    autoplay={true}
  />
);

/**
 * Sparkle Animation (inline - no file needed)
 * Use for luxury sparkle effects around elements
 */
export const SparkleAnimation = ({ className = '' }: { className?: string }) => {
  // Inline sparkle animation for luxury effects
  const sparkleData = {
    v: "5.7.4",
    fr: 30,
    ip: 0,
    op: 60,
    w: 100,
    h: 100,
    nm: "Sparkle",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Star",
        sr: 1,
        ks: {
          o: {
            a: 1,
            k: [
              { t: 0, s: [0], e: [100] },
              { t: 15, s: [100], e: [100] },
              { t: 45, s: [100], e: [0] },
              { t: 60, s: [0] }
            ]
          },
          r: {
            a: 1,
            k: [
              { t: 0, s: [0], e: [180] },
              { t: 60, s: [180] }
            ]
          },
          p: { a: 0, k: [50, 50, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: {
            a: 1,
            k: [
              { t: 0, s: [50, 50, 100], e: [100, 100, 100] },
              { t: 30, s: [100, 100, 100], e: [50, 50, 100] },
              { t: 60, s: [50, 50, 100] }
            ]
          }
        },
        shapes: [
          {
            ty: "sr",
            sy: 1,
            d: 1,
            pt: { a: 0, k: 4 },
            p: { a: 0, k: [0, 0] },
            r: { a: 0, k: 0 },
            ir: { a: 0, k: 10 },
            is: { a: 0, k: 0 },
            or: { a: 0, k: 25 },
            os: { a: 0, k: 0 },
            nm: "Star"
          },
          {
            ty: "fl",
            c: { a: 0, k: [1, 1, 1, 1] },
            o: { a: 0, k: 80 },
            nm: "Fill"
          }
        ],
        ip: 0,
        op: 60,
        st: 0
      }
    ]
  };

  return (
    <LottieAnimation
      animationData={sparkleData}
      className={className}
      loop={true}
      autoplay={true}
    />
  );
};

// Export animation data for custom usage
export const animationAssets = {
  successConfetti: successConfettiData,
  scissors: scissorsData,
  loadingSpinner: loadingSpinnerData,
  emptyCart: emptyCartData,
  checkmarkSuccess: checkmarkSuccessData,
};

export default LottieAnimation;
