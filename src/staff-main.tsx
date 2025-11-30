import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./lib/i18n";
import StaffApp from "./staff-app.tsx";
import { ThemeProvider } from "./hooks/use-theme";
import { StaffClerkProvider } from "./providers/StaffClerkProvider";

const StaffRootApp = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="staff-theme">
      <StaffClerkProvider>
        <StaffApp />
      </StaffClerkProvider>
    </ThemeProvider>
  );
};

createRoot(document.getElementById("staff-root")!).render(<StaffRootApp />);