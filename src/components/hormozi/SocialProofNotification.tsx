import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, TrendingUp, CheckCircle } from 'lucide-react';

interface SocialProofNotificationProps {
  className?: string;
  type?: 'viewing' | 'booked' | 'trending';
}

export const SocialProofNotification = ({
  className,
  type = 'viewing'
}: SocialProofNotificationProps) => {
  const [count, setCount] = useState(getRandomCount(type));

  useEffect(() => {
    // Update count every 5-15 seconds to simulate real activity
    const interval = setInterval(() => {
      setCount(getRandomCount(type));
    }, Math.random() * 10000 + 5000);

    return () => clearInterval(interval);
  }, [type]);

  function getRandomCount(notificationType: string): number {
    switch (notificationType) {
      case 'viewing':
        return Math.floor(Math.random() * 15) + 5; // 5-20 people
      case 'booked':
        return Math.floor(Math.random() * 8) + 3; // 3-11 bookings
      case 'trending':
        return Math.floor(Math.random() * 25) + 10; // 10-35 views
      default:
        return 10;
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'viewing':
        return <Eye className="w-4 h-4" />;
      case 'booked':
        return <CheckCircle className="w-4 h-4" />;
      case 'trending':
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getMessage = () => {
    switch (type) {
      case 'viewing':
        return `${count} ${count === 1 ? 'person is' : 'people are'} viewing this right now`;
      case 'booked':
        return `${count} ${count === 1 ? 'booking' : 'bookings'} in the last hour`;
      case 'trending':
        return `🔥 Trending - ${count} ${count === 1 ? 'view' : 'views'} today`;
    }
  };

  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
      "bg-emerald-500/10 border border-emerald-500/30",
      "text-emerald-400 text-sm font-medium",
      "animate-pulse",
      className
    )}>
      {getIcon()}
      <span>{getMessage()}</span>
    </div>
  );
};
