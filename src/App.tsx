import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Suspense, lazy, useEffect, useState, useMemo } from "react";
import { HelmetProvider } from 'react-helmet-async';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
// Removed ClerkProvider from here - it's handled in main.tsx
import { KeyboardShortcuts } from "./components/KeyboardShortcuts";
import { ScrollToTop } from "./components/ScrollToTop";
import { GlenAssistant } from "./components/GlenAssistant";
import { LoadingScreen } from "./components/LoadingScreen";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { PageTransition } from "./components/PageTransition";
import { SecretDealsDialog } from "./components/SecretDealsDialog";
import { useAppointmentNotifications } from "./hooks/use-appointment-notifications";
import { Navigation } from "./components/Navigation";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import SEO from "./components/SEO";
import CookieConsent from "./components/CookieConsent";
import ProfileCompletion from "./pages/ProfileCompletion";
import OAuthCallback from "./pages/OAuthCallback";
import { SmoothScrollProvider } from "./components/animations";
import { MaintenanceMode, isMaintenanceBypassed } from "./components/MaintenanceMode";
// import { performanceTracker } from "./lib/performance";

// Lazy load pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Services = lazy(() => import("./pages/Services"));
const Booking = lazy(() => import("./pages/Booking"));
const Shop = lazy(() => import("./pages/Shop"));
const ShopCheckout = lazy(() => import("./pages/ShopCheckout"));
const BookingCheckout = lazy(() => import("./pages/BookingCheckout"));
const About = lazy(() => import("./pages/About"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Contact = lazy(() => import("./pages/Contact"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Careers = lazy(() => import("./pages/Careers"));
const FAQs = lazy(() => import("./pages/FAQs"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Community = lazy(() => import("./pages/Community"));
// Staff Application - Separate routing for staff functionality
const StaffApp = lazy(() => import("./staff-app.tsx"));
const Settings = lazy(() => import("./pages/Settings"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const Inventory = lazy(() => import("./pages/Inventory"));
// Group Booking Pages - REMOVED: Group booking is now integrated in the main /booking page
// const GroupBooking = lazy(() => import("./pages/GroupBooking"));
// const GroupBookingConfirmation = lazy(() => import("./pages/GroupBookingConfirmation"));
// const GroupBookingJoin = lazy(() => import("./pages/GroupBookingJoin"));
// const GroupBookingCheckout = lazy(() => import("./pages/GroupBookingCheckout"));
const Team = lazy(() => import("./pages/Team"));

// Appointment Self-Service Pages
const RescheduleAppointmentPage = lazy(() => import("./pages/RescheduleAppointmentPage"));
const CancelAppointmentPage = lazy(() => import("./pages/CancelAppointmentPage"));
const MyAppointmentsPortal = lazy(() => import("./pages/MyAppointmentsPortal"));

// Membership & Gift Cards
const MembershipPage = lazy(() => import("./pages/MembershipPage"));

const queryClient = new QueryClient();

// Inner component that can use useLocation for route-based visibility
const AppContent = ({ showSecretDeals, setShowSecretDeals }: { showSecretDeals: boolean; setShowSecretDeals: (val: boolean) => void }) => {
  const location = useLocation();

  // Determine if navigation/overlays should be hidden based on current route
  const hideNavigation = useMemo(() => {
    const path = location.pathname;
    return path.startsWith('/staff') ||
           path === '/checkout' ||
           path.startsWith('/auth') ||
           path === '/admin';
  }, [location.pathname]);

  return (
    <SmoothScrollProvider>
      <KeyboardShortcuts />
      <ScrollToTop />
      {!hideNavigation && <GlenAssistant />}
      <PWAInstallPrompt />
      {!hideNavigation && <Navigation />}

      <Suspense fallback={<LoadingScreen onComplete={() => {}} />}>
        <SEO />
        <div className="min-h-screen">
          <Routes future={{ v7_startTransition: true, v7_relativeSplatPath: true, v7_fetcherPersist: true, v7_normalizeFormMethod: true, v7_partialHydration: true, v7_skipActionErrorRevalidation: true }}>
            <Route path="/" element={
              <PageTransition>
                <Index
                  showSecretDeals={showSecretDeals}
                  setShowSecretDeals={setShowSecretDeals}
                />
              </PageTransition>
            } />
            <Route path="/services" element={<PageTransition><Services /></PageTransition>} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/booking/checkout" element={<BookingCheckout />} />
            <Route path="/shop" element={<PageTransition><Shop /></PageTransition>} />
            <Route path="/shop/checkout" element={<PageTransition><ShopCheckout /></PageTransition>} />
            <Route path="/about" element={<PageTransition><About /></PageTransition>} />
            <Route path="/team" element={<PageTransition><Team /></PageTransition>} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<PageTransition><BlogPost /></PageTransition>} />
            <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
            <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
            <Route path="/auth/signup" element={<PageTransition><Auth /></PageTransition>} />
            <Route path="/onboarding" element={<PageTransition><ProfileCompletion /></PageTransition>} />
            <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
            <Route path="/careers" element={<PageTransition><Careers /></PageTransition>} />
            <Route path="/faq" element={<PageTransition><FAQs /></PageTransition>} />
            <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
            <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
            <Route path="/cookie-policy" element={<PageTransition><CookiePolicy /></PageTransition>} />
            <Route path="/admin" element={<AdminPanel />} />
            {/* COMMUNITY PAGE DISABLED - Remove comment to re-enable when ready */}
            {/* <Route path="/community" element={<PageTransition><Community /></PageTransition>} /> */}

            {/* Group Booking Routes - REMOVED: Group booking is now integrated in the main /booking page with ?mode=group parameter */}
            {/* <Route path="/group-booking" element={<PageTransition><GroupBooking /></PageTransition>} /> */}
            {/* <Route path="/group-booking/confirmation/:shareCode" element={<PageTransition><GroupBookingConfirmation /></PageTransition>} /> */}
            {/* <Route path="/group-booking/join/:shareCode" element={<PageTransition><GroupBookingJoin /></PageTransition>} /> */}
            {/* <Route path="/group-booking/checkout/:shareCode" element={<PageTransition><GroupBookingCheckout /></PageTransition>} /> */}

            {/* Appointment Self-Service Routes */}
            <Route path="/appointment/reschedule/:token" element={<PageTransition><RescheduleAppointmentPage /></PageTransition>} />
            <Route path="/appointment/cancel/:token" element={<PageTransition><CancelAppointmentPage /></PageTransition>} />
            <Route path="/my-appointments" element={<PageTransition><MyAppointmentsPortal /></PageTransition>} />

            {/* Membership & Gift Cards */}
            <Route path="/membership" element={<PageTransition><MembershipPage /></PageTransition>} />

            {/* Staff Application Routes - Rendered via StaffApp component */}
            <Route path="/staff/*" element={<StaffApp />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
          </Routes>
        </div>
      </Suspense>
      <CookieConsent />
      {!hideNavigation && <SecretDealsDialog />}
    </SmoothScrollProvider>
  );
};

const App = () => {
  // Initialize appointment notifications system
  useAppointmentNotifications();

  // Track popup state for navbar hiding
  const [showSecretDeals, setShowSecretDeals] = useState(false);

  // Maintenance mode state
  const [maintenanceBypassed, setMaintenanceBypassed] = useState(isMaintenanceBypassed());

  // Check if maintenance mode is enabled via environment variable
  const isMaintenanceModeEnabled = import.meta.env.VITE_MAINTENANCE_MODE === 'true';

  // If maintenance mode is enabled and not bypassed, show maintenance page
  if (isMaintenanceModeEnabled && !maintenanceBypassed) {
    return <MaintenanceMode onAuthenticated={() => setMaintenanceBypassed(true)} />;
  }

  return (
    <HelmetProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <DndProvider backend={HTML5Backend}>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <AppContent showSecretDeals={showSecretDeals} setShowSecretDeals={setShowSecretDeals} />
              </BrowserRouter>
            </TooltipProvider>
          </DndProvider>
      </QueryClientProvider>
      </ErrorBoundary>
      </HelmetProvider>
  );
};

export default App;