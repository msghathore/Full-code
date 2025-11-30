import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SignIn } from '@clerk/clerk-react';
import AuthLayout from '@/components/auth/AuthLayout';

const StaffSignInPage = () => {
  const navigate = useNavigate();

  const handleSignInSuccess = () => {
    // Navigation will be handled by Clerk's redirectUrl
    console.log('Staff sign in successful');
  };

  const handleSignInError = (error: any) => {
    console.error('Staff sign in error:', error);
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-white text-4xl font-serif text-center luxury-glow mb-4">
            Staff Portal
          </h1>
          <p className="text-gray-300 text-lg">
            Secure access for Zavira team members
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-lg">
          <SignIn
            routing="path"
            path="/auth/staff-login"
            signUpUrl="/auth/staff-signup"
            redirectUrl="/staff"
            appearance={{
              variables: {
                colorPrimary: '#8B5CF6', // Purple theme for staff
                colorBackground: '#ffffff',
                colorInputBackground: '#ffffff',
                colorInputText: '#000000'
              },
              elements: {
                formButtonPrimary: 'w-full bg-purple-600 text-white hover:bg-purple-700 rounded-md py-3 text-lg font-medium',
                formField: 'mb-6',
                formFieldLabel: 'text-black text-lg font-medium mb-2',
                formFieldInput: 'bg-white border-gray-300 text-black placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500 text-lg py-3',
                footer: 'hidden',
                card: 'bg-white shadow-none p-0',
                headerTitle: 'text-black text-xl font-bold',
                headerSubtitle: 'text-gray-600',
                socialButtonsBlockButton: 'w-full bg-transparent border border-gray-300 text-black hover:bg-gray-100 rounded-md py-3',
                socialButtonsBlockButtonText: 'text-black font-medium text-lg',
                identityPreview: 'border-gray-200',
                identityPreviewText: 'text-black',
                formFieldSuccessText: 'text-green-600',
                formFieldErrorText: 'text-red-600'
              }
            }}
            // Enable social sign-in for staff if configured
            // socialButtons={['google']}
            afterSignInUrl="/staff"
            afterSignUpUrl="/staff"
          />
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/auth')}
            className="text-gray-300 hover:text-white transition-colors"
          >
            ← Back to Customer Login
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default StaffSignInPage;