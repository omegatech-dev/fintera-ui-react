import { render, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import React from "react";

import { BrandingProvider, DEFAULT_BRANDING } from "./BrandingContext";
import { brandingApi } from "../features/branding/api";

expect.extend(matchers);
afterEach(cleanup);

vi.mock("../features/branding/api", () => ({
  brandingApi: {
    get: vi.fn(),
    update: vi.fn(),
    uploadLogo: vi.fn(),
    deleteLogo: vi.fn(),
  },
}));

function Probe() {
  return <div data-testid="probe">ready</div>;
}

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.removeItem("fintera_branding");
  document.title = "";
});

describe("BrandingProvider", () => {
  it("fetches branding on mount and applies it", async () => {
    brandingApi.get.mockResolvedValueOnce({
      branding: { app_name: "Acme", logo_url: "/uploads/branding/a.png", logo_dark_url: null },
    });

    render(
      <BrandingProvider>
        <Probe />
      </BrandingProvider>
    );

    await waitFor(() => {
      expect(brandingApi.get).toHaveBeenCalledTimes(1);
    });

    // The tab title reflects the configured name
    await waitFor(() => {
      expect(document.title).toContain("Acme");
    });

    // The response is cached in localStorage for the next load
    const cached = JSON.parse(window.localStorage.getItem("fintera_branding"));
    expect(cached.app_name).toBe("Acme");
    expect(cached.logo_url).toBe("/uploads/branding/a.png");
  });

  it("falls back to bundled defaults when the API fails", async () => {
    brandingApi.get.mockRejectedValueOnce(new Error("network down"));

    render(
      <BrandingProvider>
        <Probe />
      </BrandingProvider>
    );

    await waitFor(() => {
      expect(brandingApi.get).toHaveBeenCalledTimes(1);
    });

    // Title uses the default app name, not "undefined" or an error
    expect(document.title).toContain(DEFAULT_BRANDING.app_name);
    // Nothing was cached from the failed request
    expect(window.localStorage.getItem("fintera_branding")).toBeNull();
  });

  it("seeds state from the localStorage cache before the fetch resolves", async () => {
    window.localStorage.setItem(
      "fintera_branding",
      JSON.stringify({ app_name: "Cached", logo_url: null, logo_dark_url: null })
    );
    // A fetch that never resolves during this test
    brandingApi.get.mockReturnValueOnce(new Promise(() => {}));

    render(
      <BrandingProvider>
        <Probe />
      </BrandingProvider>
    );

    expect(document.title).toContain("Cached");
  });

  it("ignores a corrupted cache entry", async () => {
    window.localStorage.setItem("fintera_branding", "{not json");
    brandingApi.get.mockResolvedValueOnce({ branding: { app_name: "Acme" } });

    render(
      <BrandingProvider>
        <Probe />
      </BrandingProvider>
    );

    await waitFor(() => {
      expect(document.title).toContain("Acme");
    });
  });
});
