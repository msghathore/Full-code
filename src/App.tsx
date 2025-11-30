import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy, useEffect, useState } from "react";
import { HelmetProvider } from 'react-helmet-async';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
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
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import SEO from "./components/SEO";
import CookieConsent from "./components/CookieConsent";
import ProfileCompletion from "./pages/ProfileCompletion";
import OAuthCallback from "./pages/OAuthCallback";
import DebugAuthTest from "../debug-auth-test";
import AuthFlowTest from "./components/AuthFlowTest";
// import { performanceTracker } from "./lib/performance";

// Lazy load pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Services = lazy(() => import("./pages/Services"));
const Booking = lazy(() => import("./pages/Booking"));
const Shop = lazy(() => import("./pages/Shop"));
const ShopCheckout = lazy(() => import("./pages/ShopCheckout"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
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
const StaffApp = lazy(() => import("./staff-app"));
const Settings = lazy(() => import("./pages/Settings"));
const Inventory = lazy(() => import("./pages/Inventory"));

const queryClient = new QueryClient();

const App = () => {
  // Initialize appointment notifications system
  useAppointmentNotifications();

  // Track popup state for navbar hiding
  const [showSecretDeals, setShowSecretDeals] = useState(false);
  const [hideNavigation, setHideNavigation] = useState(false);
  
  // Initialize performance tracking and route detection
  useEffect(() => {
    // Performance tracking disabled temporarily to fix black screen issue
    // TODO: Re-enable after fixing circular dependency
    // performanceTracker initialization moved to separate module
    
    // Check if current route is staff-related or POS terminal
    const currentPath = window.location.pathname;
    const shouldHideNavigation = currentPath.startsWith('/staff') ||
                                currentPath === '/checkout' ||
                                currentPath.startsWith('/auth');
    setHideNavigation(shouldHideNavigation);
  }, []);

  return (
    <HelmetProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
        <FontSizeProvider>
          <DndProvider backend={HTML5Backend}>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <KeyboardShortcuts />
                {!hideNavigation && <AccessibilityControls />}
                <ScrollToTop />
                {!hideNavigation && <GlenAssistant />}
                <PWAInstallPrompt />
                {!hideNavigation && <Navigation />}
                <PWAInstallPrompt />
                
                <Suspense fallback={<LoadingScreen onComplete={() => {}} />}>
                  <SEO />
                  <div className="min-h-screen">
                    <Routes future={{ v7_startTransition: true, v7_relativeSplatPath: true, v7_fetcherPersist: true, v7_normalizeFormMethod: true, v7_partialHydration: true, v7_skipActionErrorRevalidation: true }}>
                      {/* CRITICAL: Ultra-minimal bypass route */}
                      <Route path="/staff-working" element={
                        <html><head><title>Staff Working</title></head><body><h1 style="color: green;">STAFF PAGE WORKS!</h1></body></html>
                      } />
                      
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
                      <Route path="/checkout" element={<PageTransition><AppLayout><CheckoutPage /></AppLayout></PageTransition>} />
                      <Route path="/pos/checkout" element={<PageTransition><CheckoutPage /></PageTransition>} />
                      <Route path="/about" element={<PageTransition><About /></PageTransition>} />
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/blog/:id" element={<PageTransition><BlogPost /></PageTransition>} />
                      <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
                      <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
                      <Route path="/auth/sign-up" element={<PageTransition><Auth /></PageTransition>} />
                      <Route path="/profile-completion" element={<PageTransition><ProfileCompletion /></PageTransition>} />
                      <Route path="/debug-auth" element={<PageTransition><DebugAuthTest /></PageTransition>} />
                      <Route path="/auth-flow-test" element={<PageTransition><AuthFlowTest /></PageTransition>} />
                      <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
                      <Route path="/careers" element={<PageTransition><Careers /></PageTransition>} />
                      <Route path="/faqs" element={<PageTransition><FAQs /></PageTransition>} />
                      <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
                      <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
                      <Route path="/cookies" element={<PageTransition><CookiePolicy /></PageTransition>} />
                      <Route path="/community" element={<PageTransition><Community /></PageTransition>} />
                      
                      {/* Staff Application Routes - Rendered via StaffApp component */}
                      <Route path="/staff/*" element={<StaffApp />} />
                      {/* MINIMAL STAFF BYPASS - No Clerk, No Complex Components */}
                      <Route path="/staff-bypass" element={<div className="min-h-screen bg-green-600 text-white p-8"><h1 className="text-4xl">STAFF BYPASS WORKS!</h1><p className="mt-4">This proves the routing works without complex SSR components.</p></div>} />
                      {/* Temporary debug route - bypass auth */}
                      <Route path="/staff-debug" element={<PageTransition><div className="min-h-screen bg-red-600 text-white p-8"><h1 className="text-4xl">STAFF DEBUG - AUTH BYPASSED!</h1><p className="mt-4">If you see this, the routing works but auth is blocking access.</p></div></PageTransition>} />
                    
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
                    </Routes>
                  </div>
                </Suspense>
                <CookieConsent />
              </BrowserRouter>
            </TooltipProvider>
          </DndProvider>
        </FontSizeProvider>
      </QueryClientProvider>
      </ErrorBoundary>
      </HelmetProvider>
  );
};

export default App;