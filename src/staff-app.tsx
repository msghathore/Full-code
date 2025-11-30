import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StaffDashboardWrapper from '@/components/StaffDashboardWrapper';
import StaffRouteGuard from '@/components/auth/StaffRouteGuard';
import StaffNavigation from '@/components/StaffNavigation';
// import AdvancedSchedulingGrid from '@/components/AdvancedSchedulingGrid'; // Replaced with VagaroSchedule
import VagaroSchedule from '@/pages/VagaroSchedule';
import CheckoutPage from '@/pages/CheckoutPage';
import Inventory from '@/pages/Inventory';
import Settings from '@/pages/Settings';
import StaffLogin from '@/pages/StaffLogin';

const StaffApp = () => {
  console.log('🚀 StaffApp initialized!');

  return (
    <Routes>
      {/* Public Staff Route - Login */}
      <Route path="/login" element={<StaffLogin />} />

      {/* Protected Staff Routes */}
      <Route
        path="/*"
        element={
          <StaffRouteGuard>
            <StaffNavigation>
              <Routes>
                {/* Default route - redirect to calendar */}
                <Route path="/" element={<Navigate to="/staff/calendar" replace />} />

                {/* Calendar view - the main staff scheduling interface */}
                <Route path="/calendar" element={<VagaroSchedule />} />

                {/* Checkout/POS page */}
                <Route path="/checkout" element={<CheckoutPage />} />

                {/* Inventory management */}
                <Route path="/inventory" element={<Inventory />} />

                {/* Settings page */}
                <Route path="/settings" element={<Settings />} />

                {/* Keep dashboard route for backward compatibility */}
                <Route path="/dashboard" element={<StaffDashboardWrapper />} />

                {/* Catch-all - redirect to calendar */}
                <Route path="*" element={<Navigate to="/staff/calendar" replace />} />
              </Routes>
            </StaffNavigation>
          </StaffRouteGuard>
        }
      />
    </Routes>
  );
};

export default StaffApp;