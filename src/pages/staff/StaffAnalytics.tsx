import React from 'react';
import { useStaffAuth } from '@/hooks/useStaffAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const StaffAnalytics: React.FC = () => {
  const { userRole } = useStaffAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Analytics</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">$12,345</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-violet-600">156</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Client Satisfaction</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-amber-600">4.8/5</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StaffAnalytics;