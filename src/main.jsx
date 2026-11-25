import React from "react";
import ReactDOM from "react-dom/client";
import { Provider as RollbarProvider, ErrorBoundary } from "@rollbar/react";
import Rollbar from "rollbar/replay";
import App from "./App.jsx";
import "./assets/css/style.css";
import "./index.css";
// Quill CSS is loaded with the editor component to reduce initial bundle egress
import { AuthProvider } from './contexts/AuthContext.jsx';
import { BrandingProvider } from './contexts/BrandingContext.jsx';
import { GeneralSettingsProvider } from './contexts/GeneralSettingsContext.jsx';
import { ConfirmProvider } from './shared/ui/ConfirmProvider';
import { buildRollbarConfig } from './lib/rollbarConfig';
import { createNoopRollbar } from './lib/noopRollbar';
import { registerSW } from "virtual:pwa-register";

if (import.meta.env.MODE === "production") {
  registerSW();
}

// Initialize Rollbar only when an access token is provided to avoid noisy errors in
// non-production or local environments. The provider stays mounted with an
// inert stub in that case: useRollbar throws without a provider and would
// crash the whole tree on boot.
const rollbarConfig = buildRollbarConfig();
const rollbar = rollbarConfig ? new Rollbar(rollbarConfig) : createNoopRollbar();

const appTree = (
  <BrandingProvider>
    <AuthProvider>
      <GeneralSettingsProvider>
        <ConfirmProvider>
          <App />
        </ConfirmProvider>
      </GeneralSettingsProvider>
    </AuthProvider>
  </BrandingProvider>
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RollbarProvider instance={rollbar}>
      <ErrorBoundary>{appTree}</ErrorBoundary>
    </RollbarProvider>
  </React.StrictMode>
);
