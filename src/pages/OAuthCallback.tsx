import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoaded } = useUser();
  
  useEffect(() => {
    // When this component mounts, handle OAuth callback
    const handleOAuthCallback = async () => {
      // Check if user is loaded and we have a user object
      if (isLoaded && user) {
        // Check if profile completion is needed
        const needsProfileCompletion = !user.unsafeMetadata?.birthday || 
                                       !user.unsafeMetadata?.country || 
                                       !user.unsafeMetadata?.city;
        
        if (needsProfileCompletion) {
          // Redirect to auth page to complete profile
          navigate('/auth?callback=true&provider=' + searchParams.get('provider'));
        } else {
          // Profile is complete, redirect to dashboard
          navigate('/dashboard');
        }
      } else if (isLoaded && !user) {
        // If user is loaded but no user object, redirect to auth page
        navigate('/auth?error=true');
      }
    };
    
    handleOAuthCallback();
  }, [isLoaded, user, navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Completing sign in...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
      </div>
    </div>
  );
};

export default OAuthCallback;