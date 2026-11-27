import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { brandingApi } from "../features/branding/api";
import { brandInitial } from "../features/branding/utils/brandInitial";
import {
  restoreBundledFavicon,
  setMonogramFavicon,
} from "../features/branding/utils/favicon";
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
  const brandingRef = useRef(branding);

  /**
   * Merge a branding payload into state and the local cache.
   *
   * Accepts either `{ branding: {...} }` (the API envelope) or the branding
   * object itself. Admin writes call this with the response of
   * `update`/`uploadLogo`/`deleteLogo`, which is authoritative: it must win
   * over a `GET` that may still be served from the 60 s HTTP cache.
   *
   * Merges over the current values so a partial write (for example a logo
   * upload that only returns `logo_url`) cannot wipe `app_name`, and only
   * known branding keys are accepted, so envelope fields such as `message`
   * never reach the state. `null` values are explicit clears.
   */
  const applyBranding = useCallback((payload) => {
    const source = payload?.branding !== undefined ? payload.branding : payload;
    if (!source || typeof source !== "object" || Array.isArray(source)) return null;
    if (Object.keys(source).length === 0) return null;

    const next = { ...DEFAULT_BRANDING };
    for (const key of Object.keys(DEFAULT_BRANDING)) {
      next[key] = source[key] !== undefined ? source[key] : brandingRef.current[key];
    }

    brandingRef.current = next;
    setBranding(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage full or unavailable: branding still works in memory
    }
    return next;
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await brandingApi.get();
      return applyBranding(data);
    } catch (error) {
      // Keep cached/default branding; the API being down must never break the UI
      console.warn("Branding unavailable, using defaults:", error?.message || error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [applyBranding]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Keep the browser tab title in sync with the configured name
  useEffect(() => {
    document.title = `${branding.app_name} - Dashboard`;
  }, [branding.app_name]);

  // Browser tab favicon: bundled icons by default, a generated monogram when
  // custom branding is active. The configured logo is a horizontal wordmark
  // (4:1) and must never become the favicon — see OpenSpec
  // `fix-branding-logo-refresh`.
  const isCustomBranding =
    Boolean(branding.logo_url || branding.logo_dark_url) ||
    branding.app_name !== DEFAULT_BRANDING.app_name;

  useEffect(() => {
    if (!isCustomBranding) {
      restoreBundledFavicon();
      return;
    }
    setMonogramFavicon(brandInitial(branding.app_name));
  }, [isCustomBranding, branding.app_name]);

  const value = useMemo(
    () => ({ branding, loading, refresh, applyBranding }),
    [branding, loading, refresh, applyBranding]
  );

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
};

export default BrandingProvider;
