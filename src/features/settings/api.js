import { apiClient } from "../../lib/apiClient";

const SETTINGS_ENDPOINT = "/api/v1/settings";

/** API wrapper for the deployment-wide customer settings. */
export const settingsApi = {
  get: () => apiClient.get(SETTINGS_ENDPOINT),
  update: (settings) =>
    apiClient.put(SETTINGS_ENDPOINT, { settings }),
};
