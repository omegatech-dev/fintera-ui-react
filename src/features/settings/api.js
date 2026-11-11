import { apiClient } from "../../lib/apiClient";

const SETTINGS_ENDPOINT = "/api/v1/settings";

/**
 * API wrapper for the deployment-wide customer settings.
 *
 * The provider sends a merged settings snapshot so saving one General section
 * does not overwrite the rest, even before the API supports partial merges.
 */
export const settingsApi = {
  get: () => apiClient.get(SETTINGS_ENDPOINT),
  update: (settings) =>
    apiClient.put(SETTINGS_ENDPOINT, { settings }),
};
