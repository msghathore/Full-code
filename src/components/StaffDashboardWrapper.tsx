import React, { useState } from 'react';
import StaffSchedulingSystem from '../pages/StaffSchedulingSystem';
// import StaffSchedulingSystem from '../pages/StaffSchedulingSystem-simple';

const StaffDashboardWrapper: React.FC = () => {
  // Authentication state management
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Legend state management
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  // Use full version with proper authentication
  return (
    <div className="min-h-screen bg-gray-50">
      <StaffSchedulingSystem
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
        isLegendOpen={isLegendOpen}
        setIsLegendOpen={setIsLegendOpen}
      />
    </div>
  );
};

export default StaffDashboardWrapper;