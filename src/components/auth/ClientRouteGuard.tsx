import React from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { LoadingScreen } from '@/components/LoadingScreen';

interface ClientRouteGuardProps {
  children: React.ReactNode;
}

export const ClientRouteGuard: React.FC<ClientRouteGuardProps> = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <LoadingScreen onComplete={() => {}} />;
  }

  if (!isSignedIn) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};