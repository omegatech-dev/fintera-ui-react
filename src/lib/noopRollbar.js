// Silent stand-in for the Rollbar SDK.
//
// The panel keeps a RollbarProvider mounted even when no access token is
// configured: `useRollbar` (@rollbar/react) throws when the provider is
// absent, and the error boundary calls it on every render. Without a provider
// the whole app crashes to a white screen on boot (local, staging, or any
// deployment without VITE_ROLLBAR_ACCESS_TOKEN).

/**
 * The Provider's invariant requires `instance.options.accessToken`; the fake
 * value is inert because nothing constructs the real SDK and every method is
 * a no-op.
 */
const FAKE_TOKEN = "noop";

/** Every method the app and the SDK's React bindings call. */
const NOOP_METHODS = ["critical", "error", "warning", "info", "debug", "log"];

/**
 * Build an inert Rollbar-like instance.
 * @returns {Record<string, (...args: unknown[]) => undefined>}
 */
export function createNoopRollbar() {
  const stub = {
    options: { accessToken: FAKE_TOKEN },
  };
  for (const method of NOOP_METHODS) {
    stub[method] = () => undefined;
  }
  return stub;
}
