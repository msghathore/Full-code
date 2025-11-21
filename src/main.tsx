import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./lib/i18n";
import { ThemeProvider } from "./hooks/use-theme";
import { LanguageProvider } from "./hooks/use-language";
import { ClerkProvider } from "@clerk/clerk-react";

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

console.log('Clerk publishable key available:', !!clerkPublishableKey);

if (!clerkPublishableKey) {
  console.error('VITE_CLERK_PUBLISHABLE_KEY is not defined in environment variables');
}

// Mobile detection (simplified since custom cursor now handles its own hiding)
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         (navigator.maxTouchPoints && navigator.maxTouchPoints > 1) ||
         window.innerWidth <= 768;
};

if (isMobile()) {
  document.body.classList.add('mobile-device');
  document.documentElement.setAttribute('data-mobile', 'true');
  console.log('Mobile device detected - custom cursor disabled');
}

// Only wrap with ClerkProvider if key is available
const RootApp = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="zavira-theme">
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ThemeProvider>
  );
};

try {
  createRoot(document.getElementById("root")!).render(
    clerkPublishableKey ? (
      <ClerkProvider publishableKey={clerkPublishableKey}>
        <RootApp />
      </ClerkProvider>
    ) : (
      <RootApp />
    )
  );
} catch (error) {
  console.error('Failed to render app:', error);
  // Fallback rendering
  createRoot(document.getElementById("root")!).render(
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white text-center">
        <h1 className="text-2xl font-bold mb-4">Failed to load application</h1>
        <p className="text-gray-400">Please refresh the page or check the console for errors.</p>
      </div>
    </div>
  );
}
