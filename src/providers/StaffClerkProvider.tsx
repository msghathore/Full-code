import React from 'react';
import { ClerkProvider } from '@clerk/clerk-react';

interface StaffClerkProviderProps {
  children: React.ReactNode;
}

export const StaffClerkProvider: React.FC<StaffClerkProviderProps> = ({ children }) => {
  const publishableKey = import.meta.env.VITE_STAFF_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error('Missing required environment variable VITE_STAFF_CLERK_PUBLISHABLE_KEY. Please check your .env file and ensure you have configured your Clerk publishable key for staff authentication.');
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={{
        elements: {
          formButtonPrimary: 'bg-amber-600 hover:bg-amber-700',
        }
      }}
    >
      {children}
    </ClerkProvider>
  );
};