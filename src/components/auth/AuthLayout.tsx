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
    <div className={`min-h-screen bg-black ${className}`}>
      {showNavigation && <Navigation />}
      
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-24 space-y-12">
        {children}
      </div>

      {showFooter && <Footer />}
    </div>
  );
};

export default AuthLayout;