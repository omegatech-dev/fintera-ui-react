import { afterEach, describe, expect, it } from "vitest";
import { buildRollbarConfig, isImportantReplayPath } from "./rollbarConfig";

const TOKEN = "post_client_item_test";

afterEach(() => {
  window.history.pushState({}, "", "/");
});

describe("buildRollbarConfig", () => {
  it("returns null when the access token is missing", () => {
    expect(buildRollbarConfig({})).toBeNull();
    expect(buildRollbarConfig({ VITE_ROLLBAR_ACCESS_TOKEN: "  " })).toBeNull();
  });

  it("prefers VITE_ROLLBAR_ENVIRONMENT, then VITE_APP_ENV, then MODE", () => {
    expect(
      buildRollbarConfig({
        VITE_ROLLBAR_ACCESS_TOKEN: TOKEN,
        VITE_ROLLBAR_ENVIRONMENT: "rollbar-staging",
        VITE_APP_ENV: "staging",
        MODE: "production",
      }).environment
    ).toBe("rollbar-staging");

    expect(
      buildRollbarConfig({
        VITE_ROLLBAR_ACCESS_TOKEN: TOKEN,
        VITE_APP_ENV: "staging",
        MODE: "production",
      }).environment
    ).toBe("staging");

    expect(
      buildRollbarConfig({
        VITE_ROLLBAR_ACCESS_TOKEN: TOKEN,
        MODE: "production",
      }).environment
    ).toBe("production");
  });

  it("keeps the existing capture and release settings", () => {
    const config = buildRollbarConfig({
      VITE_ROLLBAR_ACCESS_TOKEN: TOKEN,
      VITE_APP_VERSION: "v1.2.3",
    });

    expect(config.captureUncaught).toBe(true);
    expect(config.captureUnhandledRejections).toBe(true);
    expect(config.payload.client.javascript.code_version).toBe("v1.2.3");
    expect(config.payload.client.javascript.source_map_enabled).toBe(true);
  });

  it("enables replay only for actionable errors with password masking", () => {
    const config = buildRollbarConfig({ VITE_ROLLBAR_ACCESS_TOKEN: TOKEN });

    expect(config.replay.enabled).toBe(true);
    expect(config.replay.triggers).toHaveLength(1);
    expect(config.replay.triggers[0]).toMatchObject({
      type: "occurrence",
      level: ["warning", "error", "critical"],
      samplingRatio: 1.0,
    });
    expect(config.replay.maskInputOptions).toEqual({ password: true });
  });
});

describe("isImportantReplayPath", () => {
  it("allows the money and contract flows", () => {
    expect(isImportantReplayPath("/contracts")).toBe(true);
    expect(isImportantReplayPath("/contracts/123")).toBe(true);
    expect(isImportantReplayPath("/payments")).toBe(true);
    expect(isImportantReplayPath("/payments/456")).toBe(true);
    expect(isImportantReplayPath("/financing/user/7")).toBe(true);
    expect(
      isImportantReplayPath("/financing/user/7/payment/9/upload")
    ).toBe(true);
    expect(
      isImportantReplayPath("/projects/p/lots/l/contracts/create")
    ).toBe(true);
  });

  it("rejects everything else", () => {
    expect(isImportantReplayPath("/")).toBe(false);
    expect(isImportantReplayPath("/users")).toBe(false);
    expect(isImportantReplayPath("/analytics")).toBe(false);
    expect(isImportantReplayPath("/settings/general")).toBe(false);
    expect(isImportantReplayPath("/signin")).toBe(false);
    expect(isImportantReplayPath("")).toBe(false);
  });
});

describe("replay trigger predicate", () => {
  it("reads the current browser path", () => {
    const config = buildRollbarConfig({ VITE_ROLLBAR_ACCESS_TOKEN: TOKEN });
    const predicate = config.replay.triggers[0].predicateFn;

    window.history.pushState({}, "", "/payments/123");
    expect(predicate()).toBe(true);

    window.history.pushState({}, "", "/users");
    expect(predicate()).toBe(false);
  });
});
