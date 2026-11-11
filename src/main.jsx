import React from "react";
import ReactDOM from "react-dom/client";
import { Provider as RollbarProvider, ErrorBoundary } from "@rollbar/react";
import Rollbar from "rollbar/replay";
import App from "./App.jsx";
import "./assets/css/style.css";
import "./assets/css/font-awesome-all.min.css";
import "./index.css";
// Swiper & Quill CSS loaded with their components (slider, editor) to reduce initial bundle egress
import { AuthProvider } from './contexts/AuthContext.jsx';
import { BrandingProvider } from './contexts/BrandingContext.jsx';
import { GeneralSettingsProvider } from './contexts/GeneralSettingsContext.jsx';
import { buildRollbarConfig } from './lib/rollbarConfig';
import { registerSW } from "virtual:pwa-register";

if (import.meta.env.MODE === "production") {
  registerSW();
}

// Initialize Rollbar only when an access token is provided to avoid noisy errors in
// non-production or local environments.
const rollbarConfig = buildRollbarConfig();
const rollbar = rollbarConfig ? new Rollbar(rollbarConfig) : null;

const appTree = (
  <BrandingProvider>
    <AuthProvider>
      <GeneralSettingsProvider>
        <App />
      </GeneralSettingsProvider>
    </AuthProvider>
  </BrandingProvider>
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {rollbar ? (
      <RollbarProvider instance={rollbar}>
        <ErrorBoundary>{appTree}</ErrorBoundary>
      </RollbarProvider>
    ) : (
      appTree
    )}
  </React.StrictMode>
);
