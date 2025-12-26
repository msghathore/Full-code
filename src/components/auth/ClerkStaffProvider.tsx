import React from 'react';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import StaffRoleGuard from './StaffRoleGuard';

interface ClerkStaffProviderProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'senior' | 'junior';
  requireOrganization?: boolean;
  redirectToSignIn?: boolean;
}

/**
 * ClerkStaffProvider - Fixed version with robust authentication handling
 *
 * This component provides a unified way to protect staff routes using Clerk's
 * authentication system with proper error handling and race condition prevention.
 */
const ClerkStaffProvider: React.FC<ClerkStaffProviderProps> = ({
  children,
  requiredRole,
  requireOrganization = true,
  redirectToSignIn = true
}) => {
  console.log('[ClerkStaffProvider] Rendering with props:', {
    requiredRole,
    requireOrganization,
    redirectToSignIn
  });

  return (
    <>
      {/* CRITICAL: Always check SignedIn status first */}
      <SignedIn>
        {(() => {
          console.log('[ClerkStaffProvider] User is signed in, checking role permissions');
          return (
            <StaffRoleGuard
              requiredRole={requiredRole}
              requireOrganization={requireOrganization}
            >
              {children}
            </StaffRoleGuard>
          );
        })()}
      </SignedIn>
      
      {/* CRITICAL: Handle SignedOut state with proper redirect */}
      <SignedOut>
        {(() => {
          console.log('[ClerkStaffProvider] User is not signed in, showing sign-in prompt');
          
          if (redirectToSignIn) {
            console.log('[ClerkStaffProvider] Redirecting to sign-in page');
            return (
              <RedirectToSignIn
                signUpUrl="/auth/staff-signup"
                afterSignInUrl="/staff"
                afterSignUpUrl="/staff"
                appearance={{
                  variables: {
                    colorPrimary: '#D97706'
                  }
                }}
              />
            );
          }
          
          return (
            <div className="min-h-screen bg-black flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-white text-2xl font-bold mb-4">
                  Authentication Required
                </h1>
                <p className="text-gray-300 mb-6">
                  Please sign in to access the staff portal.
                </p>
                <button
                  onClick={() => window.location.href = '/auth/staff-login'}
                  className="bg-white/10 hover:bg-white/10 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Sign In to Staff Portal
                </button>
              </div>
            </div>
          );
        })()}
      </SignedOut>
    </>
  );
};

export default ClerkStaffProvider;