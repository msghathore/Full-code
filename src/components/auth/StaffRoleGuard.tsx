import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, useUser, UserResource } from '@clerk/clerk-react';
import { LoadingScreen } from '@/components/LoadingScreen';

interface StaffRoleGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'senior' | 'junior';
  requireOrganization?: boolean;
}

interface StaffData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'senior' | 'junior';
  organizationId?: string;
}

/**
 * StaffRoleGuard - Fixed version with robust authentication
 *
 * This component now uses Clerk's authentication system with proper
 * race condition handling to ensure secure authentication for staff routes.
 */
const StaffRoleGuard: React.FC<StaffRoleGuardProps> = ({
  children,
  requiredRole,
  requireOrganization = true
}) => {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const [staffData, setStaffData] = useState<StaffData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // CRITICAL: Ensure Clerk is fully loaded before proceeding
    if (!authLoaded || !userLoaded) {
      console.log('[StaffRoleGuard] Waiting for Clerk to load...', { authLoaded, userLoaded });
      return;
    }

    console.log('[StaffRoleGuard] Clerk loaded, checking authentication', {
      isSignedIn,
      hasUser: !!user,
      userId: user?.id
    });

    // Handle case where Clerk failed to load properly
    if (error) {
      console.error('[StaffRoleGuard] Previous error detected:', error);
      setIsLoading(false);
      return;
    }

    // If not signed in, redirect immediately
    if (!isSignedIn || !user) {
      console.log('[StaffRoleGuard] User not authenticated, redirecting to login');
      setIsLoading(false);
      return;
    }

    // Extract staff data from Clerk user
    const extractStaffData = (user: UserResource): StaffData => {
      // Extract role from publicMetadata or privateMetadata
      const role = (user.publicMetadata?.role || user.privateMetadata?.role) as 'admin' | 'senior' | 'junior' || 'junior';
      const organizationId = user.publicMetadata?.organizationId as string || undefined;
      
      return {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role,
        organizationId
      };
    };

    try {
      const extractedStaffData = extractStaffData(user);
      setStaffData(extractedStaffData);
      console.log('[StaffRoleGuard] Staff data extracted successfully:', {
        id: extractedStaffData.id,
        email: extractedStaffData.email,
        role: extractedStaffData.role
      });
    } catch (error) {
      console.error('[StaffRoleGuard] Error extracting staff data:', error);
      setError('Failed to extract staff data');
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
  }, [isSignedIn, user, authLoaded, userLoaded, error]);

  // CRITICAL: Show loading screen while Clerk is loading or processing
  if (!authLoaded || !userLoaded || isLoading) {
    console.log('[StaffRoleGuard] Showing loading screen', { authLoaded, userLoaded, isLoading });
    return <LoadingScreen onComplete={() => {}} />;
  }

  // Handle errors
  if (error) {
    console.error('[StaffRoleGuard] Authentication error:', error);
    return <Navigate to="/auth/staff-login" replace />;
  }

  // CRITICAL: Force authentication check - redirect if not signed in
  if (!isSignedIn || !user) {
    console.log('[StaffRoleGuard] Authentication failed, redirecting to staff login');
    return <Navigate to="/auth/staff-login" replace />;
  }

  // Check if staff data is available
  if (!staffData) {
    console.warn('[StaffRoleGuard] No staff data available, redirecting to login');
    return <Navigate to="/auth/staff-login" replace />;
  }

  // Check role-based access if required role is specified
  if (requiredRole && staffData) {
    const userRole = staffData.role;
    
    // Define role hierarchy: admin > senior > junior
    const roleHierarchy = {
      'admin': 3,
      'senior': 2,
      'junior': 1
    };

    const currentRoleLevel = roleHierarchy[userRole] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole];

    if (currentRoleLevel < requiredRoleLevel) {
      console.log('[StaffRoleGuard] Access denied: insufficient role', {
        userRole,
        requiredRole,
        currentRoleLevel,
        requiredRoleLevel
      });
      
      // Redirect to appropriate staff page based on role
      const fallbackPath = userRole === 'admin'
        ? '/staff'
        : userRole === 'senior'
        ? '/scheduling'
        : '/scheduling';
        
      return <Navigate to={fallbackPath} replace />;
    }
  }

  console.log('[StaffRoleGuard] Access granted for user:', {
    id: staffData.id,
    role: staffData.role,
    requiredRole: requiredRole || 'none'
  });

  return <>{children}</>;
};

export default StaffRoleGuard;