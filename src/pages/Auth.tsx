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
      <form onSubmit={handleVerification} className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-white text-xl font-medium mb-2">Check your email</h3>
          <p className="text-white/60 text-sm">
            We sent a verification code to {email}
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-white text-lg font-medium [text-shadow:0_0_10px_rgba(255,255,255,0.3)]">
            Verification Code
          </Label>
          <Input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter 6-digit code"
            className="bg-black border border-white/30 text-white placeholder-gray-500 focus:ring-white/50 focus:border-white text-lg py-3 text-center tracking-widest"
            maxLength={6}
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        <Button
          type="submit"
          disabled={isLoading || verificationCode.length !== 6}
          className="w-full bg-white text-black hover:bg-gray-100 rounded-md py-3 text-lg font-medium transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          ) : (
            'Verify Email'
          )}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSignUp} className="space-y-5">
      {/* Google Sign Up Button */}
      <button
        type="button"
        onClick={handleGoogleSignUp}
        className="w-full bg-black border border-white/30 text-white hover:bg-white/10 hover:border-white rounded-md py-3 transition-all duration-300 flex items-center justify-center gap-3"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span className="font-medium text-lg [text-shadow:0_0_10px_rgba(255,255,255,0.3)]">
          Continue with Google
        </span>
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-white/20" />
        <span className="text-white/60 text-sm">or</span>
        <div className="flex-1 h-px bg-white/20" />
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-white text-sm font-medium [text-shadow:0_0_10px_rgba(255,255,255,0.3)]">
            First Name
          </Label>
          <Input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="John"
            className="bg-black border border-white/30 text-white placeholder-gray-500 focus:ring-white/50 focus:border-white text-base py-2.5"
            required
          />
        </div>
        <div className="space-y-2">
          <Label className="text-white text-sm font-medium [text-shadow:0_0_10px_rgba(255,255,255,0.3)]">
            Last Name
          </Label>
          <Input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
            className="bg-black border border-white/30 text-white placeholder-gray-500 focus:ring-white/50 focus:border-white text-base py-2.5"
            required
          />
        </div>
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Label className="text-white text-sm font-medium [text-shadow:0_0_10px_rgba(255,255,255,0.3)]">
          Email Address
        </Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="john@example.com"
          className="bg-black border border-white/30 text-white placeholder-gray-500 focus:ring-white/50 focus:border-white text-base py-2.5"
          required
        />
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label className="text-white text-sm font-medium [text-shadow:0_0_10px_rgba(255,255,255,0.3)]">
          Password
        </Label>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a strong password"
            className="bg-black border border-white/30 text-white placeholder-gray-500 focus:ring-white/50 focus:border-white text-base py-2.5 pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
        className="w-full bg-white text-black hover:bg-gray-100 rounded-md py-3 text-lg font-medium transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
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
      formButtonPrimary: 'w-full bg-white text-black hover:bg-gray-100 rounded-md py-3 text-lg font-medium transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]',
      formField: 'mb-6',
      formFieldLabel: 'text-white text-lg font-medium mb-2 [text-shadow:0_0_10px_rgba(255,255,255,0.3)]',
      formFieldInput: 'bg-black border border-white/30 text-white placeholder-gray-500 focus:ring-white/50 focus:border-white text-lg py-3 rounded-md',
      formFieldInputShowPasswordButton: 'text-white/60 hover:text-white',
      socialButtonsBlockButton: 'w-full bg-black border border-white/30 text-white hover:bg-white/10 hover:border-white rounded-md py-3 transition-all duration-300 flex items-center justify-center gap-3',
      socialButtonsBlockButtonText: 'text-white font-medium text-lg [text-shadow:0_0_10px_rgba(255,255,255,0.3)]',
      socialButtonsBlockButtonArrow: 'text-white',
      socialButtonsProviderIcon: 'w-6 h-6',
      socialButtonsProviderIcon__google: 'brightness-0 invert',
      dividerLine: 'bg-white/20',
      dividerText: 'text-white/60 text-sm',
      identityPreview: 'border-white/30 bg-black',
      identityPreviewText: 'text-white',
      identityPreviewEditButton: 'text-white hover:text-white/80',
      formFieldErrorText: 'text-red-400',
      formFieldSuccessText: 'text-green-400',
      alertText: 'text-white',
      otpCodeFieldInput: 'bg-black border-white/30 text-white',
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
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-white text-4xl font-serif text-center luxury-glow mb-4">
            Welcome to Zavira
          </h1>
          <p className="text-white/70 text-lg [text-shadow:0_0_10px_rgba(255,255,255,0.2)]">
            Sign in to your account or create a new one
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-8 bg-transparent">
            <TabsTrigger
              value="sign-in"
              className="bg-transparent text-white border-b-2 border-white/20 data-[state=active]:border-white data-[state=active]:text-white data-[state=active]:[text-shadow:0_0_15px_rgba(255,255,255,0.5)] text-lg font-medium transition-all duration-300"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger
              value="sign-up"
              className="bg-transparent text-white border-b-2 border-white/20 data-[state=active]:border-white data-[state=active]:text-white data-[state=active]:[text-shadow:0_0_15px_rgba(255,255,255,0.5)] text-lg font-medium transition-all duration-300"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sign-in">
            <div className="bg-black border border-white/20 rounded-lg p-8 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
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

          <TabsContent value="sign-up">
            <div className="bg-black border border-white/20 rounded-lg p-8 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
              <CustomSignUpForm appearance={clerkAppearance} />
            </div>
          </TabsContent>
        </Tabs>

        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/auth/staff-login')}
            className="text-white/80 hover:text-white text-sm font-medium transition-all duration-300 hover:[text-shadow:0_0_15px_rgba(255,255,255,0.5)] border-b border-white/30 hover:border-white pb-1"
          >
            Staff Portal Access →
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Auth;
