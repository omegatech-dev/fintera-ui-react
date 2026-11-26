import { apiClient } from "../../lib/apiClient";

const SETTINGS_ENDPOINT = "/api/v1/settings";

/**
 * API wrapper for the deployment-wide customer settings.
 *
 * `update` accepts the fields of a single settings section. The API merges the
 * provided fields into the singleton row when it advertises
 * `supports_partial_updates`; against an API without that support the
 * provider sends the full settings snapshot so no section is lost.
 */
export const settingsApi = {
  get: () => apiClient.get(SETTINGS_ENDPOINT),
  update: (settings) => apiClient.put(SETTINGS_ENDPOINT, { settings }),
};
