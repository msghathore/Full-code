import React, { ReactNode } from 'react';
import { SQUARE_CONFIG } from '@/lib/square';

interface SquareProviderProps {
  children: ReactNode;
}

export const SquareProvider = ({ children }: SquareProviderProps) => {
  // Square Web SDK loads globally, so this is mainly a container component
  // for providing context if needed in the future
  
  if (!SQUARE_CONFIG.applicationId || !SQUARE_CONFIG.locationId) {
    console.warn('Square is not properly configured. Please check your environment variables.');
  }

  return <>{children}</>;
};