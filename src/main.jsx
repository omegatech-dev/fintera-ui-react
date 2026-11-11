import React from "react";
import ReactDOM from "react-dom/client";
import { Provider as RollbarProvider, ErrorBoundary } from "@rollbar/react";
import App from "./App.jsx";
import "./assets/css/style.css";
import "./assets/css/font-awesome-all.min.css";
import "./index.css";
// Swiper & Quill CSS loaded with their components (slider, editor) to reduce initial bundle egress
import { AuthProvider } from './contexts/AuthContext.jsx';
import { BrandingProvider } from './contexts/BrandingContext.jsx';
import { GeneralSettingsProvider } from './contexts/GeneralSettingsContext.jsx';
import { registerSW } from "virtual:pwa-register";

if (import.meta.env.MODE === "production") {
  registerSW();
}

// Initialize Rollbar only when an access token is provided to avoid noisy errors in
// non-production or local environments.
const rollbarAccessToken = import.meta.env.VITE_ROLLBAR_ACCESS_TOKEN;

const rollbarConfig = rollbarAccessToken ? {
  accessToken: rollbarAccessToken,
  captureUncaught: true,
  captureUnhandledRejections: true,
  environment: import.meta.env.MODE ?? "development",
  payload: {
    client: {
      javascript: {
        code_version: import.meta.env.VITE_APP_VERSION ?? undefined,
        source_map_enabled: true,
      }
    }
  }
} : null;

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
    {rollbarConfig ? (
      <RollbarProvider config={rollbarConfig}>
        <ErrorBoundary>{appTree}</ErrorBoundary>
      </RollbarProvider>
    ) : (
      appTree
    )}
  </React.StrictMode>
);
