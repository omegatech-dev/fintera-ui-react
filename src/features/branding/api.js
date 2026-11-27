import { apiClient } from "../../lib/apiClient";

const BRANDING_ENDPOINT = "/api/v1/branding";

/**
 * API wrapper for the global branding settings
 */
export const brandingApi = {
  /**
   * Get the current branding (public).
   *
   * `no-cache` forces revalidation: the API serves this endpoint with
   * `Cache-Control: public, max-age=60`, so a cached copy can hide a logo
   * that was just uploaded. The endpoint is small and public, so the extra
   * revalidation is cheap.
   */
  get: () => apiClient.get(BRANDING_ENDPOINT, { cache: "no-cache" }),

  /** Update the application name (admin) */
  update: (appName) =>
    apiClient.put(BRANDING_ENDPOINT, { branding: { app_name: appName } }),

  /** Upload or replace a logo variant: "light" | "dark" (admin) */
  uploadLogo: (file, variant = "light") => {
    const formData = new FormData();
    formData.append("logo", file);
    formData.append("variant", variant);
    return apiClient.post(`${BRANDING_ENDPOINT}/logo`, formData);
  },

  /** Remove a logo variant: "light" | "dark" (admin) */
  deleteLogo: (variant = "light") =>
    apiClient.delete(`${BRANDING_ENDPOINT}/logo?variant=${variant}`),
};
