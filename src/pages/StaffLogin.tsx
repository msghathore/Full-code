import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { verifyStaffPassword } from '@/lib/adminAuth';

// SECURITY: Generate cryptographically secure authentication token
function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Log login attempt to audit log
async function logLoginAttempt(
  staffId: string | null,
  staffName: string,
  success: boolean
) {
  try {
    await supabase.from('access_audit_log').insert({
      staff_id: staffId,
      staff_name: staffName,
      action_type: success ? 'login' : 'login_failed',
      page_accessed: '/staff/login',
      details: success ? 'Successful login' : 'Failed login attempt',
      ip_address: null,
      user_agent: navigator.userAgent
    });
  } catch (error) {
    console.error('Failed to log login attempt:', error);
  }
}

const StaffLogin = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(() => {
    const attempts = localStorage.getItem('login_attempts');
    return attempts ? parseInt(attempts) : 0;
  });
  const [lockoutUntil, setLockoutUntil] = useState<Date | null>(() => {
    const lockout = localStorage.getItem('login_lockout');
    return lockout ? new Date(lockout) : null;
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Check if account is locked
    if (lockoutUntil && new Date() < lockoutUntil) {
      const minutesLeft = Math.ceil((lockoutUntil.getTime() - Date.now()) / 60000);
      toast({
        title: 'Account Locked',
        description: `Too many failed attempts. Try again in ${minutesLeft} minutes.`,
        variant: 'destructive'
      });
      setIsLoading(false);
      return;
    }

    try {
      // Get all active staff to check password
      const { data: allStaff, error: staffError } = await supabase
        .from('staff')
        .select('id, first_name, last_name, username, password_hash, password_salt, temp_password, role, status')
        .neq('status', 'offline');

      if (staffError || !allStaff || allStaff.length === 0) {
        // SECURITY: No fallback passwords - require proper staff authentication
        toast({
          title: 'Access Denied',
          description: 'Unable to verify credentials. Please contact your administrator.',
          variant: 'destructive'
        });
        await logLoginAttempt(null, 'Unknown', false);
        setIsLoading(false);
        return;
      }

      // Find staff member by checking password against all staff
      let staffData = null;
      for (const staff of allStaff) {
        // Check temp_password first (plain text)
        if (staff.temp_password && staff.temp_password === password) {
          staffData = staff;
          break;
        }
        // Check hashed password
        if (staff.password_hash && staff.password_salt) {
          const isValid = await verifyStaffPassword(password, staff.password_hash, staff.password_salt);
          if (isValid) {
            staffData = staff;
            break;
          }
        }
        // Legacy: check if password_hash is plain text
        if (staff.password_hash && staff.password_hash === password) {
          staffData = staff;
          break;
        }
      }

      if (!staffData) {
        // No matching password found
        await logLoginAttempt(null, 'Unknown', false);

        // Rate limiting
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        localStorage.setItem('login_attempts', newAttempts.toString());

        if (newAttempts >= 5) {
          const lockoutTime = new Date(Date.now() + 15 * 60000);
          setLockoutUntil(lockoutTime);
          localStorage.setItem('login_lockout', lockoutTime.toISOString());
          toast({
            title: 'Account Locked',
            description: 'Too many failed attempts. Try again in 15 minutes.',
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Access Denied',
            description: `Invalid password. ${5 - newAttempts} attempts remaining.`,
            variant: 'destructive'
          });
        }

        setIsLoading(false);
        return;
      }

      // Password already verified in the loop above - staffData is valid

      // Check if staff is active
      if (staffData.status === 'offline' || staffData.status === 'unavailable') {
        toast({
          title: 'Account Inactive',
          description: 'Your account is currently inactive. Please contact your administrator.',
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }

      // Successful login
      const staffName = `${staffData.first_name} ${staffData.last_name}`;

      // SECURITY: Generate secure authentication token
      const secureToken = generateSecureToken();
      const sessionExpiry = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(); // 8 hours

      // Store session data with secure token
      localStorage.setItem('staff_auth_token', secureToken);
      localStorage.setItem('staff_id', staffData.id);
      localStorage.setItem('staff_name', staffName);
      localStorage.setItem('staff_role', staffData.role);
      localStorage.setItem('staff_session_expiry', sessionExpiry);
      localStorage.setItem(
        'staff_login_time',
        new Date().toISOString()
      );

      await logLoginAttempt(staffData.id, staffName, true);

      // Reset login attempts on success
      setLoginAttempts(0);
      setLockoutUntil(null);
      localStorage.removeItem('login_attempts');
      localStorage.removeItem('login_lockout');

      toast({
        title: 'Login Successful',
        description: `Welcome back, ${staffData.first_name}!`
      });

      navigate('/staff/calendar');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Error',
        description: 'An error occurred. Please try again.',
        variant: 'destructive'
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md border-gray-200 shadow-lg bg-white" style={{ backgroundColor: 'white', color: 'black' }}>
        <CardHeader className="text-center">
          <div className="mx-auto bg-blue-100 p-3 rounded-full w-fit mb-4">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl text-gray-900 font-bold" style={{ color: 'black' }}>Staff Access</CardTitle>
          <CardDescription className="text-gray-600" style={{ color: '#4B5563' }}>
            Enter your password to access the staff portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" style={{ color: '#374151' }}>
                Staff Password
              </label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 border-gray-300 text-gray-900 bg-white"
                  style={{ backgroundColor: 'white', color: 'black' }}
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center" style={{ color: '#6B7280' }}>
              Forgot your password? Contact your administrator.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffLogin;
