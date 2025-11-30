/**
 * Clerk Migration Utilities
 * Helper functions for migrating from Supabase staff system to Clerk
 */

import { ClerkAPIResponseError } from '@clerk/clerk-sdk-node';

// Staff data interface for migration
interface StaffMigrationData {
  username: string;
  email: string;
  role: 'admin' | 'senior' | 'junior';
  accessLevel: 'full' | 'limited' | 'basic';
  employeeId: string;
  firstName?: string;
  lastName?: string;
}

// Migration result interface
interface MigrationResult {
  success: boolean;
  userId?: string;
  username: string;
  error?: string;
}

// Clerk client configuration (server-side only)
let clerkClient: any = null;

if (typeof window === 'undefined') {
  // Import Clerk client only on server side
  const { Clerk } = require('@clerk/clerk-sdk-node');
  clerkClient = new Clerk({
    secretKey: process.env.CLERK_SECRET_KEY
  });
}

/**
 * Map staff roles to Clerk organization roles
 */
export const mapRoleToClerk = (role: StaffMigrationData['role']): string => {
  const roleMapping = {
    'admin': 'admin',
    'senior': 'senior_staff', // Clerk uses snake_case
    'junior': 'junior_staff'
  };
  return roleMapping[role] || 'junior_staff';
};

/**
 * Map access levels to Clerk permissions
 */
export const mapAccessLevelToPermissions = (accessLevel: StaffMigrationData['accessLevel']): string[] => {
  const permissions = {
    'full': ['admin:all', 'staff:manage', 'settings:all', 'analytics:view', 'bookings:manage'],
    'limited': ['staff:view', 'bookings:manage', 'analytics:view'],
    'basic': ['bookings:view', 'schedule:view']
  };
  return permissions[accessLevel] || permissions['basic'];
};

/**
 * Create a user in Clerk and add to staff organization
 */
export const createStaffUserInClerk = async (staffData: StaffMigrationData): Promise<MigrationResult> => {
  try {
    if (!clerkClient) {
      throw new Error('Clerk client not initialized. This function should only be called on the server.');
    }

    // Create user in Clerk
    const user = await clerkClient.users.createUser({
      emailAddress: staffData.email,
      username: staffData.username,
      firstName: staffData.firstName || staffData.username.split('.')[0],
      lastName: staffData.lastName || staffData.username.split('.')[1] || '',
      emailVerified: true,
      privateMetadata: {
        employeeId: staffData.employeeId,
        originalRole: staffData.role,
        accessLevel: staffData.accessLevel,
        migratedFrom: 'supabase',
        migrationDate: new Date().toISOString()
      }
    });

    // Get organization ID
    const organizations = await clerkClient.organizations.getOrganizationList();
    const staffOrg = organizations.find((org: any) => org.slug === 'zavira-staff');
    
    if (!staffOrg) {
      throw new Error('Zavira Staff organization not found');
    }

    // Add user to organization with appropriate role
    await clerkClient.organizations.createOrganizationMembership({
      organizationId: staffOrg.id,
      userId: user.id,
      role: mapRoleToClerk(staffData.role)
    });

    return {
      success: true,
      userId: user.id,
      username: staffData.username
    };

  } catch (error: any) {
    console.error('Error creating staff user in Clerk:', error);
    return {
      success: false,
      username: staffData.username,
      error: error.message || 'Unknown error occurred'
    };
  }
};

/**
 * Bulk migrate staff users from Supabase to Clerk
 */
export const bulkMigrateStaffToClerk = async (staffDataArray: StaffMigrationData[]): Promise<MigrationResult[]> => {
  const results: MigrationResult[] = [];
  
  console.log(`Starting bulk migration of ${staffDataArray.length} staff users...`);
  
  for (const staffData of staffDataArray) {
    console.log(`Migrating ${staffData.username}...`);
    const result = await createStaffUserInClerk(staffData);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ Successfully migrated ${staffData.username}`);
    } else {
      console.error(`❌ Failed to migrate ${staffData.username}: ${result.error}`);
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  const successCount = results.filter(r => r.success).length;
  console.log(`Migration complete: ${successCount}/${staffDataArray.length} users migrated successfully`);
  
  return results;
};

/**
 * Validate staff data before migration
 */
export const validateStaffData = (staffData: StaffMigrationData): string[] => {
  const errors: string[] = [];
  
  if (!staffData.username || staffData.username.trim().length === 0) {
    errors.push('Username is required');
  }
  
  if (!staffData.email || !staffData.email.includes('@')) {
    errors.push('Valid email address is required');
  }
  
  if (!staffData.role || !['admin', 'senior', 'junior'].includes(staffData.role)) {
    errors.push('Valid role (admin, senior, junior) is required');
  }
  
  if (!staffData.employeeId || staffData.employeeId.trim().length === 0) {
    errors.push('Employee ID is required');
  }
  
  return errors;
};

/**
 * Generate welcome email content for migrated staff
 */
export const generateWelcomeEmail = (staffData: StaffMigrationData): string => {
  return `
    Welcome to the new Zavira staff portal!
    
    Your account has been migrated to our new Clerk-based authentication system.
    
    Login Details:
    - Username: ${staffData.username}
    - Email: ${staffData.email}
    - Role: ${staffData.role}
    
    Please reset your password on first login at: ${process.env.VITE_APP_URL}/auth/staff-login
    
    If you have any issues, please contact your system administrator.
    
    Best regards,
    Zavira IT Team
  `;
};

/**
 * Export staff data from Supabase (for migration)
 */
export const exportStaffFromSupabase = async (): Promise<StaffMigrationData[]> => {
  // This function would connect to Supabase and export existing staff data
  // Implementation depends on your specific Supabase setup
  console.log('Exporting staff data from Supabase...');
  
  // Placeholder implementation
  const sampleData: StaffMigrationData[] = [
    {
      username: 'admin.zavira',
      email: 'admin@zavira.com',
      role: 'admin',
      accessLevel: 'full',
      employeeId: 'EMP001',
      firstName: 'Admin',
      lastName: 'User'
    },
    {
      username: 'staff.jane',
      email: 'jane@zavira.com',
      role: 'senior',
      accessLevel: 'limited',
      employeeId: 'EMP002',
      firstName: 'Jane',
      lastName: 'Smith'
    }
  ];
  
  return sampleData;
};

export default {
  createStaffUserInClerk,
  bulkMigrateStaffToClerk,
  mapRoleToClerk,
  mapAccessLevelToPermissions,
  validateStaffData,
  generateWelcomeEmail,
  exportStaffFromSupabase
};