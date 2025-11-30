import { ClerkProvider } from '@clerk/clerk-react';

interface ClientClerkProviderProps {
  children: React.ReactNode;
}

export const ClientClerkProvider: React.FC<ClientClerkProviderProps> = ({ children }) => {
  const publishableKey = import.meta.env.VITE_CLIENT_CLERK_PUBLISHABLE_KEY;
  
  if (!publishableKey) {
    throw new Error('Missing required environment variable VITE_CLIENT_CLERK_PUBLISHABLE_KEY. Please check your .env file and ensure you have configured your Clerk publishable key for client authentication.');
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={{
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
        }
      }}
    >
      {children}
    </ClerkProvider>
  );
};