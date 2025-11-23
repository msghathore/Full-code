import React, { useState } from 'react';
import AppLayout from './layout/AppLayout';
import StaffSchedulingSystem from '../pages/StaffSchedulingSystem';

const StaffDashboardWrapper: React.FC = () => {
  // Legend state management
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  return (
    <AppLayout 
      isLegendOpen={isLegendOpen}
      setIsLegendOpen={setIsLegendOpen}
    >
      <StaffSchedulingSystem 
        isLegendOpen={isLegendOpen}
        setIsLegendOpen={setIsLegendOpen}
      />
    </AppLayout>
  );
};

export default StaffDashboardWrapper;