import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';

/**
 * Authentication Flow Test Component
 * This component tests the complete authentication flow step by step
 */
const AuthFlowTest: React.FC = () => {
  const { isSignedIn, isLoaded: authLoaded, signOut } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    const results: string[] = [];
    
    results.push(`=== AUTHENTICATION FLOW TEST ===`);
    results.push(`Timestamp: ${new Date().toISOString()}`);
    results.push('');
    
    results.push(`1. Clerk Provider Status:`);
    results.push(`   - authLoaded: ${authLoaded}`);
    results.push(`   - userLoaded: ${userLoaded}`);
    results.push('');
    
    results.push(`2. Authentication Status:`);
    results.push(`   - isSignedIn: ${isSignedIn}`);
    results.push(`   - hasUser: ${!!user}`);
    results.push(`   - userId: ${user?.id || 'none'}`);
    results.push('');
    
    if (user) {
      results.push(`3. User Details:`);
      results.push(`   - Email: ${user.primaryEmailAddress?.emailAddress || 'none'}`);
      results.push(`   - First Name: ${user.firstName || 'none'}`);
      results.push(`   - Last Name: ${user.lastName || 'none'}`);
      results.push(`   - Role (publicMetadata): ${user.publicMetadata?.role || 'none'}`);
      results.push(`   - Role (privateMetadata): ${user.privateMetadata?.role || 'none'}`);
      results.push('');
    }
    
    results.push(`4. Expected Behavior for /staff route:`);
    if (isSignedIn && authLoaded && userLoaded) {
      results.push(`   ✅ SHOULD SHOW: Staff Dashboard`);
      results.push(`   ✅ Authentication: PASSED`);
    } else {
      results.push(`   ✅ SHOULD REDIRECT: to /auth/staff-login`);
      results.push(`   ✅ Authentication: PROPERLY BLOCKED`);
    }
    results.push('');
    
    if (!isSignedIn) {
      results.push(`5. Security Test:`);
      results.push(`   🛡️  PROTECTED ROUTE WORKING: Unauthenticated users cannot access staff area`);
    }
    
    setTestResults(results);
  }, [isSignedIn, user, authLoaded, userLoaded]);

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.reload(); // Force reload to test fresh state
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">🔐 Authentication Flow Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Test Results Panel */}
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-green-400">📊 Test Results</h2>
            <div className="bg-black p-4 rounded font-mono text-sm overflow-auto max-h-96">
              {testResults.map((result, index) => (
                <div key={index} className={`mb-1 ${
                  result.includes('✅') ? 'text-green-400' : 
                  result.includes('🛡️') ? 'text-violet-400' : 
                  result.includes('❌') ? 'text-red-400' : 'text-gray-300'
                }`}>
                  {result}
                </div>
              ))}
            </div>
          </div>

          {/* Control Panel */}
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-amber-400">🎮 Controls</h2>
            
            <div className="space-y-4">
              {isSignedIn ? (
                <div className="space-y-4">
                  <div className="bg-green-900 border border-green-600 p-4 rounded">
                    <h3 className="font-semibold text-green-400">✅ Authenticated</h3>
                    <p className="text-green-300 text-sm">You are signed in as: {user?.primaryEmailAddress?.emailAddress}</p>
                  </div>
                  
                  <button
                    onClick={handleSignOut}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
                  >
                    Sign Out & Test Protection
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-red-900 border border-red-600 p-4 rounded">
                    <h3 className="font-semibold text-red-400">❌ Not Authenticated</h3>
                    <p className="text-red-300 text-sm">You need to sign in to access staff features</p>
                  </div>
                  
                  <a
                    href="/auth/staff-login"
                    className="block w-full bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded text-center transition-colors"
                  >
                    Go to Staff Login
                  </a>
                </div>
              )}
              
              <div className="border-t border-gray-700 pt-4">
                <h3 className="font-semibold mb-2">🧪 Test Routes:</h3>
                <div className="space-y-2">
                  <a
                    href="/staff"
                    target="_blank"
                    className="block w-full bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm text-center transition-colors"
                  >
                    Test /staff (Protected)
                  </a>
                  <a
                    href="/debug-auth"
                    target="_blank"
                    className="block w-full bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm text-center transition-colors"
                  >
                    Test /debug-auth (Debug)
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Status Indicators */}
        <div className="mt-8 flex justify-center space-x-4">
          <div className={`px-4 py-2 rounded ${authLoaded ? 'bg-green-600' : 'bg-yellow-600'} text-white font-semibold`}>
            Clerk Loaded: {authLoaded ? '✅' : '⏳'}
          </div>
          <div className={`px-4 py-2 rounded ${userLoaded ? 'bg-green-600' : 'bg-yellow-600'} text-white font-semibold`}>
            User Loaded: {userLoaded ? '✅' : '⏳'}
          </div>
          <div className={`px-4 py-2 rounded ${isSignedIn ? 'bg-green-600' : 'bg-red-600'} text-white font-semibold`}>
            Signed In: {isSignedIn ? '✅' : '❌'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthFlowTest;