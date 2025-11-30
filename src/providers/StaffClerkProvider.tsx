import React from 'react';
import { ClerkProvider } from '@clerk/clerk-react';

interface StaffClerkProviderProps {
  children: React.ReactNode;
}

export const StaffClerkProvider: React.FC<StaffClerkProviderProps> = ({ children }) => {
  const publishableKey = import.meta.env.VITE_STAFF_CLERK_PUBLISHABLE_KEY || 'pk_test_dmlhYmxlLWJlYWdsZS00LmNsZXJrLmFjY291bnRzLmRldiQ'; // fallback to .env value
  
  // Only log warning if key is truly missing, don't crash the server
  if (!publishableKey) {
    console.warn('Missing VITE_STAFF_CLERK_PUBLISHABLE_KEY. Staff authentication may not work properly.');
    return <>{children}</>; // Return children without ClerkProvider if key is missing
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={{
        elements: {
          formButtonPrimary: 'bg-purple-600 hover:bg-purple-700',
        }
      }}
    >
      {children}
    </ClerkProvider>
  );
};