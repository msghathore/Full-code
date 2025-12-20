import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { ShieldX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type PermissionType =
  | 'inventory_access'
  | 'read_only_mode'
  | 'checkout_access'
  | 'calendar_access'
  | 'analytics_access'
  | 'settings_access'
  | 'customer_management_access';

interface StaffPermissionGuardProps {
  children: React.ReactNode;
  requiredPermission: PermissionType;
  staffId?: string;
  fallbackPath?: string;
}

// Log access attempt to audit log
async function logAccessAttempt(
  staffId: string | null,
  staffName: string,
  actionType: 'page_access' | 'permission_denied',
  pageAccessed: string,
  details?: string
) {
  try {
    await supabase.from('access_audit_log').insert({
      staff_id: staffId,
      staff_name: staffName,
      action_type: actionType,
      page_accessed: pageAccessed,
      details,
      ip_address: null, // Would need server-side for real IP
      user_agent: navigator.userAgent
    });
  } catch (error) {
    console.error('Failed to log access attempt:', error);
  }
}

export const StaffPermissionGuard: React.FC<StaffPermissionGuardProps> = ({
  children,
  requiredPermission,
  staffId,
  fallbackPath = '/staff/calendar'
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [showDenied, setShowDenied] = useState(false);

  useEffect(() => {
    checkPermission();
  }, [requiredPermission, staffId]);

  const checkPermission = async () => {
    setIsLoading(true);

    // Checkout access is always allowed
    if (requiredPermission === 'checkout_access') {
      setHasPermission(true);
      setIsLoading(false);
      return;
    }

    try {
      // Get current staff info from session
      const currentStaffId = staffId || localStorage.getItem('staff_id');

      if (!currentStaffId) {
        // No staff ID - let the route guard handle auth
        setHasPermission(true);
        setIsLoading(false);
        return;
      }

      // Fetch staff permissions
      const { data: permissions, error } = await supabase
        .from('staff_permissions')
        .select('*')
        .eq('staff_id', currentStaffId)
        .single();

      if (error) {
        // If no permissions found, use defaults based on permission type
        // Calendar and settings are allowed by default
        const defaultPermissions: Record<PermissionType, boolean> = {
          inventory_access: false,
          read_only_mode: false,
          checkout_access: true,
          calendar_access: true,
          analytics_access: false,
          settings_access: true,
          customer_management_access: false
        };

        const allowed = defaultPermissions[requiredPermission];
        setHasPermission(allowed);

        if (!allowed) {
          // Get staff name for logging
          const { data: staffData } = await supabase
            .from('staff')
            .select('first_name, last_name')
            .eq('id', currentStaffId)
            .single();

          const staffName = staffData
            ? `${staffData.first_name} ${staffData.last_name}`
            : 'Unknown';

          await logAccessAttempt(
            currentStaffId,
            staffName,
            'permission_denied',
            requiredPermission,
            `Attempted access without permission`
          );

          setShowDenied(true);
        }

        setIsLoading(false);
        return;
      }

      // Check if permission is granted
      const allowed = permissions[requiredPermission] === true;
      setHasPermission(allowed);

      if (!allowed) {
        // Get staff name for logging
        const { data: staffData } = await supabase
          .from('staff')
          .select('first_name, last_name')
          .eq('id', currentStaffId)
          .single();

        const staffName = staffData
          ? `${staffData.first_name} ${staffData.last_name}`
          : 'Unknown';

        await logAccessAttempt(
          currentStaffId,
          staffName,
          'permission_denied',
          requiredPermission,
          `Permission denied for ${requiredPermission}`
        );

        setShowDenied(true);
      } else {
        // Log successful access
        const { data: staffData } = await supabase
          .from('staff')
          .select('first_name, last_name')
          .eq('id', currentStaffId)
          .single();

        const staffName = staffData
          ? `${staffData.first_name} ${staffData.last_name}`
          : 'Unknown';

        await logAccessAttempt(
          currentStaffId,
          staffName,
          'page_access',
          requiredPermission,
          `Accessed ${requiredPermission.replace(/_/g, ' ')}`
        );
      }
    } catch (error) {
      console.error('Error checking permission:', error);
      // Default to allowing access if there's an error
      setHasPermission(true);
    }

    setIsLoading(false);
  };

  const handleDismiss = () => {
    setShowDenied(false);
    navigate(fallbackPath);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <AlertDialog open={showDenied} onOpenChange={setShowDenied}>
        <AlertDialogContent className="bg-white border-gray-200">
          <AlertDialogHeader className="text-center">
            <div className="mx-auto bg-red-100 p-4 rounded-full w-fit mb-4">
              <ShieldX className="h-8 w-8 text-red-600" />
            </div>
            <AlertDialogTitle className="text-xl text-black text-center">
              Access Denied
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 text-center">
              You do not have permission to view this page.
              <br />
              Please contact your administrator if you believe this is an error.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-center">
            <Button
              onClick={handleDismiss}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Go Back
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return <>{children}</>;
};

// Hook to check if current staff has a specific permission
export function useStaffPermission(permission: PermissionType): {
  hasPermission: boolean;
  isLoading: boolean;
  isReadOnly: boolean;
} {
  const [hasPermission, setHasPermission] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkPermission();
  }, [permission]);

  const checkPermission = async () => {
    setIsLoading(true);

    // Checkout access is always allowed
    if (permission === 'checkout_access') {
      setHasPermission(true);
      setIsReadOnly(false);
      setIsLoading(false);
      return;
    }

    try {
      const staffId = localStorage.getItem('staff_id');

      if (!staffId) {
        setHasPermission(true);
        setIsReadOnly(false);
        setIsLoading(false);
        return;
      }

      const { data: permissions, error } = await supabase
        .from('staff_permissions')
        .select('*')
        .eq('staff_id', staffId)
        .single();

      if (error) {
        // Default permissions
        const defaultPermissions: Record<PermissionType, boolean> = {
          inventory_access: false,
          read_only_mode: false,
          checkout_access: true,
          calendar_access: true,
          analytics_access: false,
          settings_access: true,
          customer_management_access: false
        };

        setHasPermission(defaultPermissions[permission]);
        setIsReadOnly(false);
        setIsLoading(false);
        return;
      }

      setHasPermission(permissions[permission] === true);
      setIsReadOnly(permissions.read_only_mode === true);
    } catch (error) {
      console.error('Error checking permission:', error);
      setHasPermission(true);
      setIsReadOnly(false);
    }

    setIsLoading(false);
  };

  return { hasPermission, isLoading, isReadOnly };
}

export default StaffPermissionGuard;
