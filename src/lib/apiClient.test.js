import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { request, setAuthToken } from "./apiClient";

const jsonResponse = (status, body = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: { get: () => "application/json" },
  text: async () => JSON.stringify(body),
});

describe("apiClient auth handling", () => {
  beforeEach(() => {
    setAuthToken(null);
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    setAuthToken(null);
    localStorage.clear();
  });

  it("falls back to the persisted token before the context hydrates", async () => {
    localStorage.setItem("token", "stored-token");
    fetch.mockResolvedValue(jsonResponse(200, { ok: true }));

    await request("/api/v1/notifications");

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe(
      "Bearer stored-token"
    );
  });

  it("does not broadcast an unauthorized event for an anonymous 401", async () => {
    const listener = vi.fn();
    window.addEventListener("auth:unauthorized", listener);
    fetch.mockResolvedValue(jsonResponse(401, { error: "Unauthorized" }));

    await expect(request("/api/v1/notifications")).rejects.toMatchObject({
      status: 401,
    });

    expect(listener).not.toHaveBeenCalled();
    window.removeEventListener("auth:unauthorized", listener);
  });

  it("broadcasts unauthorized when the request carried a token", async () => {
    const listener = vi.fn();
    window.addEventListener("auth:unauthorized", listener);
    setAuthToken("current-token");
    fetch.mockResolvedValue(jsonResponse(401, { error: "Unauthorized" }));

    await expect(request("/api/v1/notifications")).rejects.toMatchObject({
      status: 401,
    });

    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener("auth:unauthorized", listener);
  });

  it("serializes query params and drops empty values", async () => {
    fetch.mockResolvedValue(jsonResponse(200, {}));

    await request("/api/v1/payments", {
      params: { page: 2, status: "submitted", search: "" },
    });

    expect(fetch.mock.calls[0][0]).toContain(
      "/api/v1/payments?page=2&status=submitted"
    );
  });
});
