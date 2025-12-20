import React from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

interface AuthLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  showFooter?: boolean;
  className?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  showNavigation = true,
  showFooter = true,
  className = ''
}) => {
  return (
    <div className={`min-h-screen bg-black overflow-x-hidden ${className}`}>
      {showNavigation && <Navigation />}

      <div className="min-h-screen flex flex-col items-center justify-center px-3 sm:px-4 py-16 sm:py-20 md:py-24 w-full">
        {children}
      </div>

      {showFooter && <Footer />}
    </div>
  );
};

export default AuthLayout;