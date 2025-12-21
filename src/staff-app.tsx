import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StaffRouteGuard from '@/components/auth/StaffRouteGuard';
import StaffNavigation from '@/components/StaffNavigation';
import VagaroSchedule from '@/pages/VagaroSchedule';
import StaffCheckoutPage from '@/pages/staff/StaffCheckoutPage';
import Inventory from '@/pages/Inventory';
import Settings from '@/pages/Settings';
import StaffLogin from '@/pages/StaffLogin';
import GroupBookingsManagement from '@/pages/GroupBookingsManagement';

const StaffApp = () => {
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
                <Route path="/checkout" element={<StaffCheckoutPage />} />

                {/* Inventory - read access for all staff, write access controlled in component */}
                <Route path="/inventory" element={<Inventory />} />

                {/* Settings page */}
                <Route path="/settings" element={<Settings />} />

                {/* Group Bookings Management */}
                <Route path="/group-bookings" element={<GroupBookingsManagement />} />

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