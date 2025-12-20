import { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileNavigation } from './MobileNavigation';

interface MobileAuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export const MobileAuthLayout = ({ children, title, subtitle }: MobileAuthLayoutProps) => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <MobileNavigation hideWhenPopup={true} />

      <div className="flex-1 flex flex-col pt-20 pb-8 px-4">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-serif luxury-glow mb-2 text-white">
                {title}
              </h1>
              {subtitle && (
                <p className="text-white/70 text-sm">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="frosted-glass border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl shadow-white/5">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};