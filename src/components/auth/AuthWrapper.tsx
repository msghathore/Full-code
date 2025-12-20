import React from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LoadingScreen } from '@/components/LoadingScreen';

interface AuthWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({
  children,
  fallback
}) => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <LoadingScreen onComplete={() => {}} />;
  }

  if (!isSignedIn) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
        <div className="max-w-md mx-auto">
          <h3 className="text-2xl font-bold text-white mb-4">
            Sign In Required
          </h3>
          <p className="text-white/70 mb-6">
            Please sign in to view your data and access personalized features.
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link to="/auth">
                Sign In / Sign Up
              </Link>
            </Button>
            <p className="text-sm text-white/50">
              Don't have an account? Create one to get started.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};