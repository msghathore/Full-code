import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy, useEffect, useState } from "react";
import { HelmetProvider } from 'react-helmet-async';
// Removed ClerkProvider from here - it's handled in main.tsx
import { AccessibilityControls } from "./components/AccessibilityControls";
import { KeyboardShortcuts } from "./components/KeyboardShortcuts";
import { ScrollToTop } from "./components/ScrollToTop";
import { GlenAssistant } from "./components/GlenAssistant";
import { LoadingScreen } from "./components/LoadingScreen";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { PageTransition } from "./components/PageTransition";
import { FontSizeProvider } from "./hooks/use-font-size";
import { useAppointmentNotifications } from "./hooks/use-appointment-notifications";
import { Navigation } from "./components/Navigation";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import SEO from "./components/SEO";
import CookieConsent from "./components/CookieConsent";
import ProfileCompletion from "./pages/ProfileCompletion";
import OAuthCallback from "./pages/OAuthCallback";
// import { performanceTracker } from "./lib/performance";

// Lazy load pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Services = lazy(() => import("./pages/Services"));
const Booking = lazy(() => import("./pages/Booking"));
const Shop = lazy(() => import("./pages/Shop"));
const ShopCheckout = lazy(() => import("./pages/ShopCheckout"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
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
// Business Intelligence Pages
const Analytics = lazy(() => import("./pages/Analytics"));
const EmailCampaigns = lazy(() => import("./pages/EmailCampaigns"));
const CustomerFeedback = lazy(() => import("./pages/CustomerFeedback"));
const RevenueTracking = lazy(() => import("./pages/RevenueTracking"));
const StaffScheduling = lazy(() => import("./pages/StaffScheduling"));
// Admin Pages
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const BookingsManagement = lazy(() => import("./pages/BookingsManagement"));
const CustomersManagement = lazy(() => import("./pages/CustomersManagement"));
const ServicesManagement = lazy(() => import("./pages/ServicesManagement"));
// Staff Scheduling System
const StaffSchedulingSystem = lazy(() => import("./pages/StaffSchedulingSystem"));
// Vagaro-Style Schedule Page
const VagaroSchedulePage = lazy(() => import("./pages/VagaroSchedulePage"));

const queryClient = new QueryClient();

const App = () => {
  // Initialize appointment notifications system
  useAppointmentNotifications();

  // Initialize performance tracking
  useEffect(() => {
    // Performance tracking disabled temporarily to fix black screen issue
    // TODO: Re-enable after fixing circular dependency
    // performanceTracker initialization moved to separate module
  }, []);

  // Track popup state for navbar hiding
  const [showSecretDeals, setShowSecretDeals] = useState(false);
  
  // Check if current route is staff-related or POS terminal
  const isStaffRoute = window.location.pathname.startsWith('/staff') ||
                      window.location.pathname.startsWith('/staff-dashboard') ||
                      window.location.pathname === '/checkout';

  return (
    <HelmetProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
        <FontSizeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <KeyboardShortcuts />
              {!isStaffRoute && <AccessibilityControls />}
              <ScrollToTop />
              {!isStaffRoute && <GlenAssistant />}
              <PWAInstallPrompt />
              {!isStaffRoute && <Navigation hideWhenPopup={showSecretDeals} />}
              <PWAInstallPrompt />
              
              <Suspense fallback={<LoadingScreen onComplete={() => {}} />}>
                <SEO />
                <div className="min-h-screen">
                  <Routes>
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
                    <Route path="/shop" element={<PageTransition><Shop /></PageTransition>} />
                    <Route path="/shop/checkout" element={<PageTransition><ShopCheckout /></PageTransition>} />
                    <Route path="/checkout" element={<PageTransition><CheckoutPage /></PageTransition>} />
                    <Route path="/pos/checkout" element={<PageTransition><CheckoutPage /></PageTransition>} />
                    <Route path="/about" element={<PageTransition><About /></PageTransition>} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:id" element={<PageTransition><BlogPost /></PageTransition>} />
                    <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
                    <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
                    <Route path="/auth/sign-up" element={<PageTransition><Auth /></PageTransition>} />
                    <Route path="/profile-completion" element={<PageTransition><ProfileCompletion /></PageTransition>} />
                    <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
                    <Route path="/careers" element={<PageTransition><Careers /></PageTransition>} />
                    <Route path="/faqs" element={<PageTransition><FAQs /></PageTransition>} />
                    <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
                    <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
                    <Route path="/cookies" element={<PageTransition><CookiePolicy /></PageTransition>} />
                    <Route path="/community" element={<PageTransition><Community /></PageTransition>} />
                    {/* Staff Dashboard - Simple and clean */}
                    <Route path="/staff" element={<PageTransition><StaffSchedulingSystem /></PageTransition>} />
                    {/* Business Intelligence Routes */}
                    <Route path="/analytics" element={<PageTransition><Analytics /></PageTransition>} />
                    <Route path="/campaigns" element={<PageTransition><EmailCampaigns /></PageTransition>} />
                    <Route path="/feedback" element={<PageTransition><CustomerFeedback /></PageTransition>} />
                    <Route path="/revenue" element={<PageTransition><RevenueTracking /></PageTransition>} />
                    <Route path="/scheduling" element={<PageTransition><StaffScheduling /></PageTransition>} />
                    {/* Vagaro-Style Schedule Page */}
                    <Route path="/schedule" element={<PageTransition><VagaroSchedulePage /></PageTransition>} />
                    {/* Admin Routes */}
                    <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                    <Route path="/admin/services" element={<ProtectedRoute><ServicesManagement /></ProtectedRoute>} />
                    <Route path="/admin/bookings" element={<ProtectedRoute><BookingsManagement /></ProtectedRoute>} />
                    <Route path="/admin/customers" element={<ProtectedRoute><CustomersManagement /></ProtectedRoute>} />
                    <Route path="/admin/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                    <Route path="/admin/revenue" element={<ProtectedRoute><RevenueTracking /></ProtectedRoute>} />
                    <Route path="/admin/campaigns" element={<ProtectedRoute><EmailCampaigns /></ProtectedRoute>} />
                    <Route path="/admin/feedback" element={<ProtectedRoute><CustomerFeedback /></ProtectedRoute>} />
                    <Route path="/admin/scheduling" element={<ProtectedRoute><StaffScheduling /></ProtectedRoute>} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
                  </Routes>
                </div>
              </Suspense>
              </BrowserRouter>
              <CookieConsent />
          </TooltipProvider>
        </FontSizeProvider>
      </QueryClientProvider>
      </ErrorBoundary>
      </HelmetProvider>
  );
};

export default App;
