import { useState, useEffect, useMemo, useCallback } from "react";
import { brandingApi } from "../features/branding/api";
import BrandingContext, { STORAGE_KEY, DEFAULT_BRANDING } from "./branding";

const readCachedBranding = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.app_name === "string" && parsed.app_name) {
      return { ...DEFAULT_BRANDING, ...parsed };
    }
  } catch {
    // Corrupted cache: ignore and use defaults
  }
  return null;
};

export const BrandingProvider = ({ children }) => {
  const [branding, setBranding] = useState(() => readCachedBranding() || DEFAULT_BRANDING);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await brandingApi.get();
      const next = { ...DEFAULT_BRANDING, ...(data?.branding || {}) };
      setBranding(next);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Storage full or unavailable: branding still works in memory
      }
      return next;
    } catch (error) {
      // Keep cached/default branding; the API being down must never break the UI
      console.warn("Branding unavailable, using defaults:", error?.message || error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Keep the browser tab title in sync with the configured name
  useEffect(() => {
    document.title = `${branding.app_name} - Dashboard`;
  }, [branding.app_name]);

  const value = useMemo(
    () => ({ branding, loading, refresh }),
    [branding, loading, refresh]
  );

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
};

export default BrandingProvider;
