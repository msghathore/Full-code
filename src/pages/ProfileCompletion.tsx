import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';

const ProfileCompletion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  
  const [birthday, setBirthday] = useState('');
  const [country, setCountry] = useState('USA');
  const [city, setCity] = useState('');
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
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

  // Reset city when country changes
  useEffect(() => {
    setCity('');
    setCityDropdownOpen(false);
  }, [country]);

  // Handle saving custom user data
  const handleSaveCustomData = async () => {
    setIsLoading(true);
    try {
      // Save to Clerk's metadata
      await user?.update({
        unsafeMetadata: {
          birthday,
          country,
          city
        }
      });

      // Also save/update profile in Supabase
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          full_name: user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
          phone: user?.primaryPhoneNumber?.phoneNumber || null
        });

      if (profileError) {
        console.error('Error saving profile to Supabase:', profileError);
        // Don't fail the whole operation for profile save error
      }

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
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-24 space-y-12">
        <h1 className="text-white text-4xl font-serif text-center luxury-glow">
          Complete Your Profile
        </h1>
        
        <div className="w-full max-w-md">
          <div className="bg-black border border-white/20 rounded-lg p-8 shadow-[0_0_30px_rgba(255,255,255,0.05)] space-y-6">
            <p className="text-white/70 [text-shadow:0_0_10px_rgba(255,255,255,0.2)]">
              To provide you with personalized services, please add your information below.
            </p>

            <div className="space-y-3">
              <label htmlFor="birthday" className="text-white block text-lg font-medium [text-shadow:0_0_10px_rgba(255,255,255,0.3)]">Birthday</label>
              <input
                id="birthday"
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full bg-black border border-white/30 text-white rounded-md p-3 focus:ring-white/50 focus:border-white focus:outline-none text-lg [color-scheme:dark]"
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="country" className="text-white block text-lg font-medium [text-shadow:0_0_10px_rgba(255,255,255,0.3)]">Country</label>
              <select
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-black border border-white/30 text-white rounded-md p-3 focus:ring-white/50 focus:border-white focus:outline-none text-lg"
              >
                <option value="USA" className="bg-black text-white">United States</option>
                <option value="Canada" className="bg-black text-white">Canada</option>
              </select>
            </div>

            <div className="space-y-3">
              <label htmlFor="city" className="text-white block text-lg font-medium [text-shadow:0_0_10px_rgba(255,255,255,0.3)]">City</label>
              <div className="relative">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    if (!cityDropdownOpen) setCityDropdownOpen(true);
                  }}
                  onFocus={() => setCityDropdownOpen(true)}
                  placeholder="Type to search for a city"
                  className="w-full bg-black border border-white/30 text-white placeholder-gray-500 rounded-md p-3 focus:ring-white/50 focus:border-white focus:outline-none text-lg pl-10"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>

                {cityDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-black border border-white/30 rounded-md shadow-[0_0_20px_rgba(255,255,255,0.1)] max-h-60 overflow-auto">
                    {citiesByCountry[country]
                      .filter(cityOption =>
                        cityOption.toLowerCase().includes(city.toLowerCase()) ||
                        city === ''
                      )
                      .map((cityOption) => (
                        <div
                          key={cityOption}
                          className="px-4 py-2 hover:bg-white/10 cursor-pointer text-white transition-colors duration-200"
                          onClick={() => {
                            setCity(cityOption);
                            setCityDropdownOpen(false);
                          }}
                        >
                          {cityOption}
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="w-1/2 bg-transparent border border-white/30 text-white hover:bg-white/10 hover:border-white/50 rounded-md py-3 text-center text-lg font-medium transition-all duration-300"
                disabled={isLoading}
              >
                Skip for now
              </button>
              <button
                type="button"
                onClick={handleSaveCustomData}
                className="w-1/2 bg-white text-black hover:bg-gray-100 rounded-md py-3 text-center text-lg font-medium transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                disabled={!user || isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Complete Profile"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletion;