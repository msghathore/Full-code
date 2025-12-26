import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  targetDate?: Date;
  onExpire?: () => void;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownTimer = ({
  targetDate,
  onExpire,
  className,
  showLabel = true,
  size = 'md'
}: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(targetDate);
      setTimeLeft(newTimeLeft);

      if (isExpired(newTimeLeft) && onExpire) {
        onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onExpire]);

  function calculateTimeLeft(target?: Date): TimeLeft {
    if (!target) {
      // Default: Offer expires at end of today
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      target = endOfDay;
    }

    const difference = target.getTime() - new Date().getTime();

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }

    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  function isExpired(time: TimeLeft): boolean {
    return time.days === 0 && time.hours === 0 && time.minutes === 0 && time.seconds === 0;
  }

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  if (isExpired(timeLeft)) {
    return (
      <div className={cn("text-red-500 font-bold animate-pulse", className)}>
        ⚠️ OFFER EXPIRED
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showLabel && (
        <span className="text-amber-500 font-semibold mr-2">
          ⏰ OFFER EXPIRES:
        </span>
      )}
      <div className="flex gap-2">
        {timeLeft.days > 0 && (
          <TimeUnit value={timeLeft.days} label="D" size={size} />
        )}
        <TimeUnit value={timeLeft.hours} label="H" size={size} />
        <span className={cn("font-bold", sizeClasses[size])}>:</span>
        <TimeUnit value={timeLeft.minutes} label="M" size={size} />
        <span className={cn("font-bold", sizeClasses[size])}>:</span>
        <TimeUnit value={timeLeft.seconds} label="S" size={size} />
      </div>
    </div>
  );
};

interface TimeUnitProps {
  value: number;
  label: string;
  size: 'sm' | 'md' | 'lg';
}

const TimeUnit = ({ value, label, size }: TimeUnitProps) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className="flex flex-col items-center">
      <span className={cn("font-mono font-bold tabular-nums bg-black/20 px-2 py-1 rounded", sizeClasses[size])}>
        {String(value).padStart(2, '0')}
      </span>
      <span className={cn("text-white/60 uppercase font-semibold mt-1", labelSizeClasses[size])}>
        {label}
      </span>
    </div>
  );
};
