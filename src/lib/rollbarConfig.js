// Rollbar configuration for the admin/seller panel.
//
// Reporting is opt-in: without VITE_ROLLBAR_ACCESS_TOKEN the app renders
// without a Rollbar provider. Session Replay is limited to the money/contract
// flows so we do not record every admin screen.

const IMPORTANT_REPLAY_PATHS = [
  /^\/contracts(?:\/|$)/,
  /^\/payments(?:\/|$)/,
  /^\/financing(?:\/|$)/,
  /^\/projects\/[^/]+\/lots\/[^/]+\/contracts\/create(?:\/|$)/,
];

/** Only these sections may produce a Session Replay. */
export function isImportantReplayPath(pathname) {
  if (!pathname) return false;
  return IMPORTANT_REPLAY_PATHS.some((pattern) => pattern.test(pathname));
}

/**
 * Build the Rollbar config passed to the replay build of the SDK.
 * Returns null when no client token is configured.
 */
export function buildRollbarConfig(env = import.meta.env) {
  const accessToken = (env.VITE_ROLLBAR_ACCESS_TOKEN || "").trim();
  if (!accessToken) return null;

  const environment =
    (env.VITE_ROLLBAR_ENVIRONMENT || "").trim() ||
    (env.VITE_APP_ENV || "").trim() ||
    env.MODE ||
    "development";

  const codeVersion = env.VITE_APP_VERSION || undefined;

  return {
    accessToken,
    environment,
    captureUncaught: true,
    captureUnhandledRejections: true,
    payload: {
      client: {
        javascript: {
          code_version: codeVersion,
          source_map_enabled: true,
        },
      },
    },
    replay: {
      enabled: true,
      triggers: [
        {
          type: "occurrence",
          level: ["warning", "error", "critical"],
          samplingRatio: 1.0,
          // Occurrence triggers do not receive the route in their context in
          // rollbar 4, so read the current location directly.
          predicateFn: () =>
            isImportantReplayPath(
              typeof window !== "undefined" ? window.location.pathname : ""
            ),
        },
      ],
      maskInputOptions: { password: true },
    },
  };
}
