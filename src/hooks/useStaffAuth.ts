import { useState, useEffect } from 'react';

interface StaffAuthData {
  staffId: string;
  staffName: string;
  staffRole: string;
  loginTime: string;
}

// SECURITY: Clear all session data
function clearSessionData() {
  localStorage.removeItem('staff_auth_token');
  localStorage.removeItem('staff_id');
  localStorage.removeItem('staff_name');
  localStorage.removeItem('staff_role');
  localStorage.removeItem('staff_login_time');
  localStorage.removeItem('staff_session_expiry');
}

// SECURITY: Validate session token format (must be 64 hex chars)
function isValidToken(token: string): boolean {
  return /^[a-f0-9]{64}$/i.test(token);
}

export const useStaffAuth = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [staffData, setStaffData] = useState<StaffAuthData | null>(null);

  useEffect(() => {
    // SECURITY: Check localStorage for staff session with validation
    const token = localStorage.getItem('staff_auth_token');
    const staffId = localStorage.getItem('staff_id');
    const staffName = localStorage.getItem('staff_name');
    const staffRole = localStorage.getItem('staff_role');
    const loginTime = localStorage.getItem('staff_login_time');
    const sessionExpiry = localStorage.getItem('staff_session_expiry');

    // SECURITY: Validate token format and session expiry
    if (token && staffId && loginTime) {
      // Validate token format (must be secure 64-char hex string)
      if (!isValidToken(token)) {
        clearSessionData();
        setIsLoaded(true);
        return;
      }

      const now = Date.now();

      // Check explicit session expiry if set
      if (sessionExpiry) {
        const expiryTime = new Date(sessionExpiry).getTime();
        if (now > expiryTime) {
          clearSessionData();
          setIsLoaded(true);
          return;
        }
      }

      // Fallback: Check login time (8 hour timeout)
      const loginTimestamp = new Date(loginTime).getTime();
      const eightHours = 8 * 60 * 60 * 1000;

      if (now - loginTimestamp < eightHours) {
        setStaffData({ staffId, staffName: staffName || '', staffRole: staffRole || '', loginTime });
      } else {
        // Session expired - clear it
        clearSessionData();
      }
    }
    setIsLoaded(true);
  }, []);

  return {
    isLoaded,
    isSignedIn: !!staffData,
    isStaffMember: !!staffData,
    staffId: staffData?.staffId,
    staffName: staffData?.staffName,
    user: staffData ? { id: staffData.staffId, fullName: staffData.staffName } : null,
    userRole: staffData?.staffRole as 'admin' | 'senior' | 'junior' | undefined
  };
};