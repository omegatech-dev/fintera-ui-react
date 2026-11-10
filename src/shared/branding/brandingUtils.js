import { API_URL } from "@config";

import logoColor from "../../assets/images/logo/logo-color.svg";
import logoWhite from "../../assets/images/logo/logo-white.svg";
import logoShort from "../../assets/images/logo/logo-short.svg";
import logoShortWhite from "../../assets/images/logo/logo-short-white.svg";

/**
 * Branding asset URL helpers.
 *
 * Unlike `getFullImageUrl` (which prefixes API_URL verbatim), these tolerate a
 * VITE_API_URL configured with or without a trailing `/api/v1`, because stored
 * branding paths are public `/uploads/...` URLs served from the API origin.
 */

/**
 * Get the API origin from the configured API URL
 * @returns {string} - Origin without a trailing /api/v1
 */
export const getApiOrigin = () => {
  if (!API_URL) return "";
  return String(API_URL).replace(/\/api\/v1\/?$/, "");
};

/**
 * Resolve a relative /uploads/... branding path to a full URL
 * @param {string} path - Relative path or absolute URL from the API
 * @returns {string} - Full URL, or "" when no path is given
 */
export const resolveBrandingAssetUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${getApiOrigin()}${path.startsWith("/") ? "" : "/"}${path}`;
};

/**
 * Bundled logo fallbacks
 */
export const BUNDLED_LOGOS = {
  light: logoColor,
  dark: logoWhite,
  shortLight: logoShort,
  shortDark: logoShortWhite,
};

/**
 * Pick the bundled fallback asset for a variant/shape combination
 * @param {string} variant - "light" | "dark"
 * @param {boolean} short - Collapsed-sidebar (square) variant
 * @returns {string} - Imported asset URL
 */
export const getBundledLogo = (variant = "light", short = false) => {
  if (short) {
    return variant === "dark" ? BUNDLED_LOGOS.shortDark : BUNDLED_LOGOS.shortLight;
  }
  return variant === "dark" ? BUNDLED_LOGOS.dark : BUNDLED_LOGOS.light;
};
