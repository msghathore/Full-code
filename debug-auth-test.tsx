import React from 'react';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';

/**
 * Minimal Test Component to isolate Clerk authentication
 */
const DebugAuthTest: React.FC = () => {
  console.log('[DebugAuthTest] Component rendering');

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-8">Authentication Test</h1>
        
        <SignedIn>
          {(() => {
            console.log('[DebugAuthTest] User is signed in');
            return (
              <div className="space-y-4">
                <div className="bg-green-600 p-4 rounded-lg">
                  <h2 className="text-xl font-semibold">✓ AUTHENTICATED</h2>
                  <p>User is properly signed in to Clerk</p>
                </div>
              </div>
            );
          })()}
        </SignedIn>
        
        <SignedOut>
          {(() => {
            console.log('[DebugAuthTest] User is signed out');
            return (
              <div className="space-y-4">
                <div className="bg-red-600 p-4 rounded-lg">
                  <h2 className="text-xl font-semibold">✗ NOT AUTHENTICATED</h2>
                  <p>User needs to sign in</p>
                </div>
                <RedirectToSignIn 
                  signUpUrl="/auth/staff-signup"
                  afterSignInUrl="/debug-auth"
                  afterSignUpUrl="/debug-auth"
                />
              </div>
            );
          })()}
        </SignedOut>
      </div>
    </div>
  );
};

export default DebugAuthTest;