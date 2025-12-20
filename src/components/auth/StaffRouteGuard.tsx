import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAutoLogout } from '@/hooks/useAutoLogout';

interface StaffRouteGuardProps {
  children: React.ReactNode;
}

export const StaffRouteGuard: React.FC<StaffRouteGuardProps> = ({
  children
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Initialize auto-logout
  useAutoLogout();

  useEffect(() => {
    // Check for simple auth token
    const token = localStorage.getItem('staff_auth_token');
    setIsAuthenticated(!!token);
  }, [location]);

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/staff/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Render protected content if authenticated
  return <>{children}</>;
};

export default StaffRouteGuard;