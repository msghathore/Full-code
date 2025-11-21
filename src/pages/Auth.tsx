import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SignIn, SignUp, useUser } from '@clerk/clerk-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isSignUpPath = location.pathname === '/auth/sign-up';
  const [activeTab, setActiveTab] = useState(isSignUpPath ? 'sign-up' : 'sign-in');
  const [birthday, setBirthday] = useState('');
  const [country, setCountry] = useState('USA');
  const [city, setCity] = useState('');
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [isOAuthCallback, setIsOAuthCallback] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();

  const handleTabChange = (value) => {
    setActiveTab(value);
    if (value === 'sign-in') {
      navigate('/auth');
    } else {
      navigate('/auth/sign-up');
    }
  };

  // List of major cities in USA and Canada
  const citiesByCountry = {
    'USA': [
      'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
      'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
      'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'San Francisco',
      'Charlotte', 'Indianapolis', 'Seattle', 'Denver', 'Washington',
      'Boston', 'Nashville', 'Detroit', 'Portland', 'Las Vegas',
      'Memphis', 'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque'
    ],
    'Canada': [
      'Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton',
      'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener',
      'London', 'St. Catharines', 'Halifax', 'Oshawa', 'Victoria',
      'Windsor', 'Saskatoon', 'Regina', 'St. John\'s', 'Kelowna',
      'Barrie', 'Sherbrooke', 'Guelph', 'Abbotsford', 'Trois-Rivières',
      'Kingston', 'Moncton', 'White Rock', 'Nanaimo', 'Brantford'
    ]
  };

  // Update cities list when country changes
  React.useEffect(() => {
    setCity(''); // Reset city when country changes
    setCityDropdownOpen(false); // Close dropdown when country changes
  }, [country]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityDropdownOpen && !(event.target as Element).closest('.city-dropdown')) {
        setCityDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [cityDropdownOpen]);

  // Check if this is an OAuth callback or email signup callback
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    // Set loading state initially
    if (params.get('provider') || params.get('callback') === 'true') {
      setIsLoading(true);
    }
    
    // Handle both OAuth and email signup callbacks
    if (user && (params.get('provider') || params.get('callback') === 'true')) {
      setIsOAuthCallback(true);
      
      // Check if profile completion is needed
      if (!user.unsafeMetadata?.birthday || !user.unsafeMetadata?.country || !user.unsafeMetadata?.city) {
        setShowProfileCompletion(true);
        setIsLoading(false);
      } else {
        // If profile is already complete, redirect to dashboard
        setIsLoading(false);
        navigate('/dashboard');
      }
    }
  }, [user, location.search, navigate]);

  // Handle saving custom user data
  const handleSaveCustomData = async () => {
    setIsLoading(true);
    try {
      // Use Clerk's update method with custom fields in metadata
      await user?.update({
        unsafeMetadata: {
          birthday,
          country,
          city
        }
      });
      console.log('User attributes saved successfully');
      // Redirect to the dashboard after successful update
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving user attributes:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-24 space-y-12">
        <h1 className="text-white text-4xl font-serif text-center luxury-glow">
          Zavira Authentication
        </h1>
        
        <div className="w-full max-w-md">
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
                      socialButtonsBlockButtonIconContainer: 'text-black'
                    }
                  }}
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
                      socialButtonsBlockButtonIconContainer: 'text-black'
                    }
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Auth;
