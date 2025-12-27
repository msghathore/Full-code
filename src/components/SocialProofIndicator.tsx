import { useEffect, useState } from 'react';
import { Eye, Users, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface SocialProofIndicatorProps {
  className?: string;
}

export const SocialProofIndicator = ({ className }: SocialProofIndicatorProps) => {
  const [activeBookings, setActiveBookings] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActiveBookings();
    // Update every 30 seconds
    const interval = setInterval(fetchActiveBookings, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveBookings = async () => {
    try {
      // Check for appointments in the last 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

      const { count, error } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', fiveMinutesAgo);

      if (error) throw error;

      // If real count is 0, use a smart fake number
      if (count === null || count === 0) {
        // Generate believable low number: 5, 7, or 12
        const fakeOptions = [5, 7, 12];
        const randomFake = fakeOptions[Math.floor(Math.random() * fakeOptions.length)];
        setActiveBookings(randomFake);
      } else {
        setActiveBookings(count);
      }
    } catch (error) {
      // On error, default to fake number
      const fakeOptions = [5, 7, 12];
      const randomFake = fakeOptions[Math.floor(Math.random() * fakeOptions.length)];
      setActiveBookings(randomFake);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return null;

  return (
    <div className={cn(
      "flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full",
      "backdrop-blur-sm animate-pulse-subtle",
      className
    )}>
      <div className="relative">
        <Users className="w-4 h-4 text-red-500" />
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
      </div>
      <span className="text-sm font-medium text-white">
        <span className="text-red-400 font-bold">{activeBookings}</span> people booking now
      </span>
      <TrendingUp className="w-3 h-3 text-red-400" />
    </div>
  );
};

// Add subtle pulse animation to global CSS
const pulseAnimation = `
@keyframes pulse-subtle {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.animate-pulse-subtle {
  animation: pulse-subtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
`;
