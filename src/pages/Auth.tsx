import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser, useSignUp } from '@clerk/clerk-react';
import AuthLayout from '@/components/auth/AuthLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SignIn } from '@clerk/clerk-react';
import { PasswordRequirements, usePasswordValidation } from '@/components/PasswordRequirements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

// Custom Sign Up Form Component with Password Requirements
const CustomSignUpForm = ({ appearance }: { appearance: any }) => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const { allMet } = usePasswordValidation(password);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !allMet) return;

    setIsLoading(true);
    setError('');

    try {
      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      // Send email verification
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    setError('');

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        navigate('/onboarding');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Invalid verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!isLoaded) return;
    try {
      await signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/auth/sso-callback',
        redirectUrlComplete: '/onboarding',
      });
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Failed to sign up with Google.');
    }
  };

  if (pendingVerification) {
    return (
      <form onSubmit={handleVerification} className="space-y-5 sm:space-y-6">
        <div className="text-center mb-4 sm:mb-6">
          <h3 className="text-white text-lg sm:text-xl font-medium mb-2">Check your email</h3>
          <p className="text-white/60 text-xs sm:text-sm">
            We sent a verification code to {email}
          </p>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <Label className="text-white text-sm sm:text-base md:text-lg font-medium [text-shadow:0_0_10px_rgba(255,255,255,0.3)]">
            Verification Code
          </Label>
          <Input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter 6-digit code"
            className="bg-black border border-white/30 text-white placeholder-gray-500 focus:ring-white/50 focus:border-white text-base sm:text-lg py-2.5 sm:py-3 text-center tracking-widest"
            maxLength={6}
          />
        </div>

        {error && (
          <p className="text-red-400 text-xs sm:text-sm text-center">{error}</p>
        )}

        <Button
          type="submit"
          disabled={isLoading || verificationCode.length !== 6}
          className="w-full bg-white text-black hover:bg-gray-100 rounded-md py-2.5 sm:py-3 text-base sm:text-lg font-medium transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mx-auto" />
          ) : (
            'Verify Email'
          )}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSignUp} className="space-y-4 sm:space-y-5">
      {/* OAuth Sign Up Buttons */}
      <div className="space-y-2.5">
        {/* Google */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          className="w-full bg-black border border-white/30 text-white hover:bg-white/10 hover:border-white rounded-md py-2.5 sm:py-3 transition-all duration-300 flex items-center justify-center gap-2.5"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="font-medium text-sm sm:text-base [text-shadow:0_0_10px_rgba(255,255,255,0.3)]">
            Continue with Google
          </span>
        </button>

        {/* Apple */}
        <button
          type="button"
          onClick={async () => {
            if (!isLoaded) return;
            try {
              await signUp.authenticateWithRedirect({
                strategy: 'oauth_apple',
                redirectUrl: '/auth/sso-callback',
                redirectUrlComplete: '/onboarding',
              });
            } catch (err: any) {
              setError(err.errors?.[0]?.message || 'Failed to sign up with Apple.');
            }
          }}
          className="w-full bg-black border border-white/30 text-white hover:bg-white/10 hover:border-white rounded-md py-2.5 sm:py-3 transition-all duration-300 flex items-center justify-center gap-2.5"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          <span className="font-medium text-sm sm:text-base [text-shadow:0_0_10px_rgba(255,255,255,0.3)]">
            Continue with Apple
          </span>
        </button>

        {/* Facebook */}
        <button
          type="button"
          onClick={async () => {
            if (!isLoaded) return;
            try {
              await signUp.authenticateWithRedirect({
                strategy: 'oauth_facebook',
                redirectUrl: '/auth/sso-callback',
                redirectUrlComplete: '/onboarding',
              });
            } catch (err: any) {
              setError(err.errors?.[0]?.message || 'Failed to sign up with Facebook.');
            }
          }}
          className="w-full bg-black border border-white/30 text-white hover:bg-white/10 hover:border-white rounded-md py-2.5 sm:py-3 transition-all duration-300 flex items-center justify-center gap-2.5"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span className="font-medium text-sm sm:text-base [text-shadow:0_0_10px_rgba(255,255,255,0.3)]">
            Continue with Facebook
          </span>
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-white/20" />
        <span className="text-white/60 text-sm">or</span>
        <div className="flex-1 h-px bg-white/20" />
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-1.5 sm:space-y-2">
          <Label className="text-white text-xs sm:text-sm font-medium [text-shadow:0_0_10px_rgba(255,255,255,0.3)]">
            First Name
          </Label>
          <Input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="John"
            className="bg-black border border-white/30 text-white placeholder-gray-500 focus:ring-white/50 focus:border-white text-sm sm:text-base py-2 sm:py-2.5"
            required
          />
        </div>
        <div className="space-y-1.5 sm:space-y-2">
          <Label className="text-white text-xs sm:text-sm font-medium [text-shadow:0_0_10px_rgba(255,255,255,0.3)]">
            Last Name
          </Label>
          <Input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
            className="bg-black border border-white/30 text-white placeholder-gray-500 focus:ring-white/50 focus:border-white text-sm sm:text-base py-2 sm:py-2.5"
            required
          />
        </div>
      </div>

      {/* Email Field */}
      <div className="space-y-1.5 sm:space-y-2">
        <Label className="text-white text-xs sm:text-sm font-medium [text-shadow:0_0_10px_rgba(255,255,255,0.3)]">
          Email Address
        </Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="john@example.com"
          className="bg-black border border-white/30 text-white placeholder-gray-500 focus:ring-white/50 focus:border-white text-sm sm:text-base py-2 sm:py-2.5"
          required
        />
      </div>

      {/* Password Field */}
      <div className="space-y-1.5 sm:space-y-2">
        <Label className="text-white text-xs sm:text-sm font-medium [text-shadow:0_0_10px_rgba(255,255,255,0.3)]">
          Password
        </Label>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a strong password"
            className="bg-black border border-white/30 text-white placeholder-gray-500 focus:ring-white/50 focus:border-white text-sm sm:text-base py-2 sm:py-2.5 pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>

        {/* Password Requirements Indicator */}
        <PasswordRequirements password={password} />
      </div>

      {error && (
        <p className="text-red-400 text-sm text-center">{error}</p>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading || !allMet || !email || !firstName || !lastName}
        className="w-full bg-white text-black hover:bg-gray-100 rounded-md py-2.5 sm:py-3 text-base sm:text-lg font-medium transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mx-auto" />
        ) : (
          'Create Account'
        )}
      </Button>
    </form>
  );
};

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isSignUpPath = location.pathname === '/auth/signup';
  const [activeTab, setActiveTab] = useState(isSignUpPath ? 'sign-up' : 'sign-in');
  const { user } = useUser();

  const handleTabChange = (value) => {
    setActiveTab(value);
    if (value === 'sign-in') {
      navigate('/auth');
    } else {
      navigate('/auth/signup');
    }
  };

  // Shared Clerk appearance configuration for brand consistency
  const clerkAppearance = {
    elements: {
      rootBox: 'w-full',
      card: 'bg-black shadow-none p-0 border-0',
      header: 'hidden',
      footer: 'hidden',
      formButtonPrimary: 'w-full bg-white text-black hover:bg-gray-100 rounded-md py-2.5 sm:py-3 text-base sm:text-lg font-medium transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]',
      formField: 'mb-4 sm:mb-5',
      formFieldLabel: 'text-white text-xs sm:text-sm md:text-base font-medium mb-1.5 sm:mb-2 [text-shadow:0_0_10px_rgba(255,255,255,0.3)]',
      formFieldInput: 'bg-black border border-white/30 text-white placeholder-gray-500 focus:ring-white/50 focus:border-white text-sm sm:text-base py-2 sm:py-2.5 rounded-md w-full',
      formFieldInputShowPasswordButton: 'text-white/60 hover:text-white',
      socialButtonsBlockButton: 'w-full bg-black border border-white/30 text-white hover:bg-white/10 hover:border-white rounded-md py-2.5 sm:py-3 transition-all duration-300 flex items-center justify-center gap-2.5',
      socialButtonsBlockButtonText: 'text-white font-medium text-sm sm:text-base [text-shadow:0_0_10px_rgba(255,255,255,0.3)]',
      socialButtonsBlockButtonArrow: 'text-white',
      socialButtonsProviderIcon: 'w-4 h-4 sm:w-5 sm:h-5',
      socialButtonsProviderIcon__google: 'brightness-0 invert',
      dividerLine: 'bg-white/20',
      dividerText: 'text-white/60 text-xs sm:text-sm',
      identityPreview: 'border-white/30 bg-black w-full',
      identityPreviewText: 'text-white text-xs sm:text-sm truncate',
      identityPreviewEditButton: 'text-white hover:text-white/80 text-xs sm:text-sm shrink-0',
      formFieldErrorText: 'text-red-400 text-xs sm:text-sm',
      formFieldSuccessText: 'text-green-400 text-xs sm:text-sm',
      alertText: 'text-white text-xs sm:text-sm',
      otpCodeFieldInput: 'bg-black border-white/30 text-white w-full',
      identityPreviewEditButtonIcon: 'w-3 h-3 sm:w-4 sm:h-4',
    },
    variables: {
      colorPrimary: '#ffffff',
      colorText: '#ffffff',
      colorTextSecondary: 'rgba(255,255,255,0.7)',
      colorBackground: '#000000',
      colorInputBackground: '#000000',
      colorInputText: '#ffffff',
      borderRadius: '0.375rem',
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md px-2 sm:px-0">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-white text-3xl sm:text-4xl font-serif text-center luxury-glow mb-3 sm:mb-4 px-2">
            Welcome to Zavira
          </h1>
          <p className="text-white/70 text-sm sm:text-base md:text-lg [text-shadow:0_0_10px_rgba(255,255,255,0.2)] px-2">
            Sign in to your account or create a new one
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-6 sm:mb-8 bg-transparent">
            <TabsTrigger
              value="sign-in"
              className="bg-transparent text-white border-b-2 border-white/20 data-[state=active]:border-white data-[state=active]:text-white data-[state=active]:[text-shadow:0_0_15px_rgba(255,255,255,0.5)] text-sm sm:text-base md:text-lg font-medium transition-all duration-300"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger
              value="sign-up"
              className="bg-transparent text-white border-b-2 border-white/20 data-[state=active]:border-white data-[state=active]:text-white data-[state=active]:[text-shadow:0_0_15px_rgba(255,255,255,0.5)] text-sm sm:text-base md:text-lg font-medium transition-all duration-300"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sign-in" className="w-full">
            <div className="bg-black border border-white/20 rounded-lg p-4 sm:p-5 md:p-6 lg:p-8 shadow-[0_0_30px_rgba(255,255,255,0.05)] w-full overflow-hidden">
              <SignIn
                routing="path"
                path="/auth"
                signUpUrl="/auth/signup"
                redirectUrl="/onboarding"
                appearance={clerkAppearance}
                afterSignInUrl="/onboarding"
                afterSignUpUrl="/onboarding"
              />
            </div>
          </TabsContent>

          <TabsContent value="sign-up" className="w-full">
            <div className="bg-black border border-white/20 rounded-lg p-4 sm:p-5 md:p-6 lg:p-8 shadow-[0_0_30px_rgba(255,255,255,0.05)] w-full overflow-hidden">
              <CustomSignUpForm appearance={clerkAppearance} />
            </div>
          </TabsContent>
        </Tabs>

        <div className="text-center mt-6 sm:mt-8">
          <button
            onClick={() => navigate('/auth/staff-login')}
            className="text-white/80 hover:text-white text-xs sm:text-sm font-medium transition-all duration-300 hover:[text-shadow:0_0_15px_rgba(255,255,255,0.5)] border-b border-white/30 hover:border-white pb-1"
          >
            Staff Portal Access →
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Auth;
