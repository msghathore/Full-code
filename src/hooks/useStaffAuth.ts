import { useAuth, useUser, useOrganization } from '@clerk/clerk-react';

export const useStaffAuth = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const { organization } = useOrganization();
  
  // Enhanced staff verification
  const isStaffMember = organization?.slug === 'salon-staff' && 
                       organization?.membership?.role && 
                       ['admin', 'senior', 'junior'].includes(organization.membership.role as string);
  
  // Verify user belongs to staff organization
  const hasStaffAccess = isStaffMember && user?.organizationMemberships?.some(
    membership => membership.organization.slug === 'salon-staff'
  );

  return {
    isLoaded,
    isSignedIn,
    isStaffMember: hasStaffAccess,
    user,
    organization,
    userRole: organization?.membership?.role as 'admin' | 'senior' | 'junior' | undefined,
  };
};