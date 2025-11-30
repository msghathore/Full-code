import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import AuthLayout from '@/components/auth/AuthLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SignIn, SignUp } from '@clerk/clerk-react';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isSignUpPath = location.pathname === '/auth/sign-up';
  const [activeTab, setActiveTab] = useState(isSignUpPath ? 'sign-up' : 'sign-in');
  const { user } = useUser();

  const handleTabChange = (value) => {
    setActiveTab(value);
    if (value === 'sign-in') {
      navigate('/auth');
    } else {
      navigate('/auth/sign-up');
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-white text-4xl font-serif text-center luxury-glow mb-4">
            Welcome to Zavira
          </h1>
          <p className="text-gray-300 text-lg">
            Sign in to your account or create a new one
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-8 bg-transparent">
            <TabsTrigger
              value="sign-in"
              className="bg-transparent text-white border-b border-white/20 data-[state=active]:border-white text-lg"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger
              value="sign-up"
              className="bg-transparent text-white border-b border-white/20 data-[state=active]:border-white text-lg"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="sign-in">
            <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-lg">
              <SignIn
                routing="path"
                path="/auth"
                signUpUrl="/auth/sign-up"
                redirectUrl="/profile-completion"
                appearance={{
                  elements: {
                    formButtonPrimary: 'w-full bg-black text-white hover:bg-gray-800 rounded-md py-3 text-lg font-medium',
                    formField: 'mb-6',
                    formFieldLabel: 'text-black text-lg font-medium mb-2',
                    formFieldInput: 'bg-white border-gray-300 text-black placeholder-gray-500 focus:ring-gray-500 text-lg py-3',
                    footer: 'hidden',
                    card: 'bg-white shadow-none p-0',
                    header: 'hidden',
                    socialButtonsBlockButton: 'w-full bg-transparent border border-gray-300 text-black hover:bg-gray-100 rounded-md py-3',
                    socialButtonsBlockButtonText: 'text-black font-medium text-lg',
                    socialButtonsBlockButtonIcon: 'text-black',
                    socialButtonsBlockButtonIconContainer: 'text-black',
                    identityPreview: 'border-gray-200',
                    identityPreviewText: 'text-black'
                  }
                }}
                // Enhanced social login options
                // socialButtons={['google', 'facebook']}
                afterSignInUrl="/profile-completion"
                afterSignUpUrl="/profile-completion"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="sign-up">
            <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-lg space-y-8">
              <SignUp
                routing="path"
                path="/auth/sign-up"
                signInUrl="/auth"
                redirectUrl="/profile-completion"
                appearance={{
                  elements: {
                    formButtonPrimary: 'w-full bg-black text-white hover:bg-gray-800 rounded-md py-3 text-lg font-medium',
                    formField: 'mb-6',
                    formFieldLabel: 'text-black text-lg font-medium mb-2',
                    formFieldInput: 'bg-white border-gray-300 text-black placeholder-gray-500 focus:ring-gray-500 text-lg py-3',
                    footer: 'hidden',
                    card: 'bg-white shadow-none p-0',
                    header: 'hidden',
                    socialButtonsBlockButton: 'w-full bg-transparent border border-gray-300 text-black hover:bg-gray-100 rounded-md py-3',
                    socialButtonsBlockButtonText: 'text-black font-medium text-lg',
                    socialButtonsBlockButtonIcon: 'text-black',
                    socialButtonsBlockButtonIconContainer: 'text-black',
                    identityPreview: 'border-gray-200',
                    identityPreviewText: 'text-black'
                  }
                }}
                // Enhanced social signup options
                // socialButtons={['google', 'facebook']}
                afterSignInUrl="/profile-completion"
                afterSignUpUrl="/profile-completion"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/auth/staff-login')}
            className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
          >
            Staff Portal Access →
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Auth;
