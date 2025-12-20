import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import StaffAppSimple from "./staff-app-simple.tsx";

createRoot(document.getElementById("staff-root")!).render(<StaffAppSimple />);