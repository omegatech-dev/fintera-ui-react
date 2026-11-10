import { createContext, useContext } from "react";

export const STORAGE_KEY = "fintera_branding";

// Bundled defaults: used before the first fetch, when the API is unreachable,
// or when no custom branding is configured.
export const DEFAULT_BRANDING = {
  app_name: "Fintera",
  logo_url: null,
  logo_dark_url: null,
};

const BrandingContext = createContext();

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    // Outside the provider (e.g. during HMR), fall back to defaults.
    return { branding: DEFAULT_BRANDING, loading: false, refresh: async () => DEFAULT_BRANDING };
  }
  return context;
};

export default BrandingContext;
