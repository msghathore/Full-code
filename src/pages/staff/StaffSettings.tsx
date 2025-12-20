import React from 'react';
import { useStaffAuth } from '@/hooks/useStaffAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const StaffSettings: React.FC = () => {
  const { userRole } = useStaffAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Manage your profile information</p>
            </CardContent>
          </Card>

          {userRole === 'admin' && (
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Configure system-wide settings</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Update password and security settings</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StaffSettings;