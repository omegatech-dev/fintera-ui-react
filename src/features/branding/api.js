import { apiClient } from "../../lib/apiClient";

const BRANDING_ENDPOINT = "/api/v1/branding";

/**
 * API wrapper for the global branding settings
 */
export const brandingApi = {
  /** Get the current branding (public) */
  get: () => apiClient.get(BRANDING_ENDPOINT),

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
