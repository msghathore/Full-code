import { cn } from '@/lib/utils';

interface PriceAnchoringProps {
  regularPrice: number;
  currentPrice: number;
  className?: string;
  showBadge?: boolean;
  badgeText?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Price Anchoring Component
 * Shows regular price crossed out with current price and savings badge
 *
 * @param regularPrice - Original/regular price
 * @param currentPrice - Current/sale/member price
 * @param className - Additional Tailwind classes
 * @param showBadge - Show the savings badge (default: true)
 * @param badgeText - Custom badge text (default: "LIMITED TIME")
 * @param size - Size variant (sm, md, lg, xl)
 */
export const PriceAnchoring = ({
  regularPrice,
  currentPrice,
  className,
  showBadge = true,
  badgeText = 'LIMITED TIME',
  size = 'md'
}: PriceAnchoringProps) => {
  const savings = regularPrice - currentPrice;
  const savingsPercentage = Math.round((savings / regularPrice) * 100);

  const sizeClasses = {
    sm: {
      regular: 'text-base',
      current: 'text-2xl',
      badge: 'text-xs px-2 py-0.5',
      savings: 'text-sm'
    },
    md: {
      regular: 'text-lg',
      current: 'text-3xl',
      badge: 'text-xs px-3 py-1',
      savings: 'text-base'
    },
    lg: {
      regular: 'text-xl',
      current: 'text-4xl',
      badge: 'text-sm px-3 py-1',
      savings: 'text-lg'
    },
    xl: {
      regular: 'text-2xl',
      current: 'text-5xl',
      badge: 'text-base px-4 py-1.5',
      savings: 'text-xl'
    }
  };

  const sizes = sizeClasses[size];

  return (
    <div className={cn('space-y-2', className)}>
      {/* Regular Price - Crossed Out */}
      <div className={cn('text-white/40 line-through', sizes.regular)}>
        Regular: ${regularPrice.toFixed(0)}
      </div>

      {/* Current Price + Savings Badge */}
      <div className="flex items-baseline gap-3 flex-wrap">
        {/* Current Price - Emerald Glow */}
        <span
          className={cn('font-bold text-emerald-400', sizes.current)}
          style={{
            textShadow: '0 0 10px rgba(16, 185, 129, 0.8), 0 0 20px rgba(16, 185, 129, 0.6), 0 0 30px rgba(16, 185, 129, 0.4)'
          }}
        >
          ${currentPrice.toFixed(0)}
        </span>

        {/* Savings Badge */}
        {showBadge && savings > 0 && (
          <span
            className={cn(
              'bg-emerald-500/20 border border-emerald-500/50 rounded-full text-emerald-400 font-bold uppercase tracking-wide',
              sizes.badge
            )}
          >
            Save ${savings.toFixed(0)} ({savingsPercentage}% OFF)
          </span>
        )}
      </div>

      {/* Limited Time Badge (Optional) */}
      {badgeText && (
        <div className="inline-flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full text-amber-400 font-bold text-xs uppercase tracking-wider animate-pulse">
            ⚡ {badgeText}
          </span>
        </div>
      )}
    </div>
  );
};

interface ValueBreakdownProps {
  items: Array<{ label: string; value: number }>;
  total: number;
  savings: number;
  className?: string;
}

/**
 * Value Breakdown Component
 * Shows itemized value breakdown with total and savings
 */
export const ValueBreakdown = ({
  items,
  total,
  savings,
  className
}: ValueBreakdownProps) => {
  const savingsPercentage = Math.round((savings / total) * 100);

  return (
    <div className={cn('space-y-3 p-4 bg-white/5 border border-white/10 rounded-lg', className)}>
      <h4 className="text-white font-bold text-lg mb-3">Value Breakdown:</h4>

      {/* Individual Items */}
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-white/70">
            <span>{item.label}</span>
            <span className="font-semibold">${item.value.toFixed(0)}</span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-white/20 my-3" />

      {/* Total Value */}
      <div className="flex justify-between text-white/90 font-semibold text-lg">
        <span>Total Value:</span>
        <span className="line-through">${total.toFixed(0)}</span>
      </div>

      {/* Your Price */}
      <div className="flex justify-between items-center">
        <span className="text-white font-bold text-xl">Your Price:</span>
        <span
          className="text-3xl font-bold text-emerald-400"
          style={{
            textShadow: '0 0 10px rgba(16, 185, 129, 0.8), 0 0 20px rgba(16, 185, 129, 0.6)'
          }}
        >
          ${(total - savings).toFixed(0)}
        </span>
      </div>

      {/* Total Savings */}
      <div className="mt-3 p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-center">
        <div className="text-emerald-400 font-bold text-lg">
          YOU SAVE ${savings.toFixed(0)} ({savingsPercentage}% OFF)
        </div>
      </div>
    </div>
  );
};
