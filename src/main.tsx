import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/premium-animations.css";
import "./lib/i18n";
import { ThemeProvider } from "./hooks/use-theme";
import { LanguageProvider } from "./hooks/use-language";
import { ClientClerkProvider } from "./providers/ClientClerkProvider";
// Mobile detection (simplified since custom cursor now handles its own hiding)
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints && navigator.maxTouchPoints > 1) ||
    window.innerWidth <= 768;
};

if (isMobile()) {
  document.body.classList.add('mobile-device');
  document.documentElement.setAttribute('data-mobile', 'true');
}

const RootApp = () => {
  // Always wrap App with ClientClerkProvider for SSR compatibility
  // Staff route detection will happen inside App.tsx instead
  return (
    <ThemeProvider defaultTheme="dark" storageKey="zavira-theme">
      <LanguageProvider>
        <ClientClerkProvider>
          <App />
        </ClientClerkProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

createRoot(document.getElementById("root")!).render(<RootApp />);
