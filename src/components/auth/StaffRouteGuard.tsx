import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAutoLogout } from '@/hooks/useAutoLogout';

interface StaffRouteGuardProps {
  children: React.ReactNode;
}

export const StaffRouteGuard: React.FC<StaffRouteGuardProps> = ({
  children
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize auto-logout
  useAutoLogout();

  useEffect(() => {
    // Check for simple auth token
    const token = localStorage.getItem('staff_auth_token');

    if (!token) {
      // Redirect to login if no token found, saving the attempted location
      navigate('/staff/login', {
        state: { from: location },
        replace: true
      });
    }
  }, [navigate, location]);

  // If we're checking auth, we might want to show a loading state
  // But for localStorage check it's instant, so we just render children
  // The useEffect will trigger redirect if needed
  return <>{children}</>;
};

export default StaffRouteGuard;