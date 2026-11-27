import { apiClient } from "../../lib/apiClient";

const SETTINGS_ENDPOINT = "/api/v1/settings";

/**
 * API wrapper for the deployment-wide customer settings.
 *
 * `update` accepts the fields of a single settings section and the provider
 * sends only those fields: `PUT /api/v1/settings` merges them into the
 * singleton row, so a save never rewrites the other sections.
 */
export const settingsApi = {
  get: () => apiClient.get(SETTINGS_ENDPOINT),
  update: (settings) => apiClient.put(SETTINGS_ENDPOINT, { settings }),
};
