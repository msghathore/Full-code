import { cn } from '@/lib/utils';
import { AlertCircle, Users } from 'lucide-react';

interface LimitedSpotsProps {
  total: number;
  remaining: number;
  className?: string;
  variant?: 'default' | 'urgent';
}

export const LimitedSpots = ({
  total,
  remaining,
  className,
  variant = 'default'
}: LimitedSpotsProps) => {
  const percentage = (remaining / total) * 100;
  const isUrgent = percentage <= 30;
  const isCritical = percentage <= 10;

  const getVariantStyles = () => {
    if (variant === 'urgent' || isCritical) {
      return 'bg-red-500/20 border-red-500/50 text-red-400';
    }
    if (isUrgent) {
      return 'bg-white/10 border-white/30 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]';
    }
    return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400';
  };

  const getMessage = () => {
    if (remaining === 0) {
      return '❌ SOLD OUT';
    }
    if (isCritical) {
      return `🔥 ONLY ${remaining} SPOT${remaining === 1 ? '' : 'S'} LEFT!`;
    }
    if (isUrgent) {
      return `⚡ ${remaining} spots remaining`;
    }
    return `${remaining} of ${total} spots available`;
  };

  if (remaining === 0) {
    return (
      <div className={cn(
        "px-4 py-2 rounded-lg border-2 font-bold text-center",
        "bg-slate-500/20 border-slate-500/50 text-slate-400",
        className
      )}>
        {getMessage()}
      </div>
    );
  }

  return (
    <div className={cn(
      "px-4 py-3 rounded-lg border-2",
      getVariantStyles(),
      className
    )}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {isCritical ? (
            <AlertCircle className="w-5 h-5 animate-pulse" />
          ) : (
            <Users className="w-5 h-5" />
          )}
          <span className="font-bold">{getMessage()}</span>
        </div>
        {remaining > 0 && (
          <div className="flex-1 max-w-[200px]">
            <div className="h-2 bg-black/30 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-500",
                  isCritical ? "bg-red-500" : isUrgent ? "bg-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" : "bg-emerald-500"
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
