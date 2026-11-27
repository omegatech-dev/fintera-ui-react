import { render, screen, waitFor, cleanup, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

import { BrandingProvider } from "./BrandingContext";
import { DEFAULT_BRANDING, useBranding } from "./branding";
import { brandingApi } from "../features/branding/api";

expect.extend(matchers);
afterEach(cleanup);
afterEach(() => {
  // The provider swaps icon links under custom branding; clear them so other
  // test files start from a clean head.
  document
    .querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]')
    .forEach((link) => link.remove());
});

vi.mock("../features/branding/api", () => ({
  brandingApi: {
    get: vi.fn(),
    update: vi.fn(),
    uploadLogo: vi.fn(),
    deleteLogo: vi.fn(),
  },
}));

let latest;
function Probe() {
  const context = useBranding();
  latest = context;
  return <div data-testid="app-name">{context.branding.app_name}</div>;
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

    // The configured name flows through the context
    await waitFor(() => {
      expect(screen.getByTestId("app-name")).toHaveTextContent("Acme");
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

  it("applies a write response and persists it", async () => {
    brandingApi.get.mockResolvedValueOnce({
      branding: { app_name: "Fintera", logo_url: null, logo_dark_url: null },
    });

    render(
      <BrandingProvider>
        <Probe />
      </BrandingProvider>
    );

    // Wait for the mount fetch to land before overriding the state.
    await waitFor(() => {
      expect(screen.getByTestId("app-name")).toHaveTextContent("Fintera");
    });

    await act(async () => {
      latest.applyBranding({
        app_name: "Acme",
        logo_url: "/uploads/branding/nuevo.webp",
        logo_dark_url: null,
      });
    });

    expect(screen.getByTestId("app-name")).toHaveTextContent("Acme");
    expect(
      JSON.parse(window.localStorage.getItem("fintera_branding"))
    ).toMatchObject({
      app_name: "Acme",
      logo_url: "/uploads/branding/nuevo.webp",
    });
  });

  it("keeps the application name when a write only returns a logo", async () => {
    brandingApi.get.mockResolvedValueOnce({
      branding: { app_name: "Fintera", logo_url: null, logo_dark_url: null },
    });

    render(
      <BrandingProvider>
        <Probe />
      </BrandingProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("app-name")).toHaveTextContent("Fintera");
    });

    await act(async () => {
      latest.applyBranding({ logo_url: "/uploads/branding/nuevo.webp" });
    });

    expect(screen.getByTestId("app-name")).toHaveTextContent("Fintera");
    expect(
      JSON.parse(window.localStorage.getItem("fintera_branding")).logo_url
    ).toBe("/uploads/branding/nuevo.webp");
  });

  it("keeps the current branding when the GET returns an empty payload", async () => {
    brandingApi.get.mockResolvedValueOnce({
      branding: { app_name: "Fintera", logo_url: "/uploads/branding/a.png" },
    });

    render(
      <BrandingProvider>
        <Probe />
      </BrandingProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("app-name")).toHaveTextContent("Fintera");
    });

    await act(async () => {
      latest.applyBranding({});
    });

    expect(screen.getByTestId("app-name")).toHaveTextContent("Fintera");
    expect(
      JSON.parse(window.localStorage.getItem("fintera_branding")).logo_url
    ).toBe("/uploads/branding/a.png");
  });

  it("keeps the bundled favicon when branding is default", async () => {
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = "/favicon.ico";
    document.head.appendChild(link);
    const before = link.outerHTML;

    brandingApi.get.mockResolvedValueOnce({
      branding: { app_name: "Fintera", logo_url: null, logo_dark_url: null },
    });

    render(
      <BrandingProvider>
        <Probe />
      </BrandingProvider>
    );

    await waitFor(() => {
      expect(document.title).toContain("Fintera");
    });

    const icons = document.querySelectorAll('link[rel="icon"]');
    expect(icons).toHaveLength(1);
    expect(icons[0].outerHTML).toBe(before);
  });

  it("swaps the favicon for a monogram when branding is customized", async () => {
    const contextStub = {
      beginPath: vi.fn(),
      roundRect: vi.fn(),
      fillRect: vi.fn(),
      fill: vi.fn(),
      fillText: vi.fn(),
    };
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.getContext = vi.fn(() => contextStub);
    HTMLCanvasElement.prototype.toDataURL = vi.fn(
      () => "data:image/png;base64,monogram"
    );

    const link = document.createElement("link");
    link.rel = "icon";
    link.href = "/favicon.ico";
    document.head.appendChild(link);

    brandingApi.get.mockResolvedValueOnce({
      branding: {
        app_name: "Acme",
        logo_url: "/uploads/branding/a.webp",
        logo_dark_url: null,
      },
    });

    try {
      render(
        <BrandingProvider>
          <Probe />
        </BrandingProvider>
      );

      await waitFor(() => {
        const icon = document.querySelector('link[rel="icon"]');
        expect(icon?.href).toBe("data:image/png;base64,monogram");
      });

      const icons = document.querySelectorAll('link[rel="icon"]');
      expect(icons).toHaveLength(1);
      expect(icons[0].dataset.monogram).toBe("true");
      // The client's wordmark URL must never become the favicon.
      expect(icons[0].href).not.toContain("/uploads/branding/a.webp");
    } finally {
      HTMLCanvasElement.prototype.getContext = originalGetContext;
      HTMLCanvasElement.prototype.toDataURL = originalToDataURL;
    }
  });

  it("keeps the bundled favicon when the canvas is unavailable", async () => {
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = "/favicon.ico";
    document.head.appendChild(link);
    const before = link.outerHTML;

    brandingApi.get.mockResolvedValueOnce({
      branding: {
        app_name: "Acme",
        logo_url: "/uploads/branding/a.webp",
        logo_dark_url: null,
      },
    });

    render(
      <BrandingProvider>
        <Probe />
      </BrandingProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("app-name")).toHaveTextContent("Acme");
    });

    const icons = document.querySelectorAll('link[rel="icon"]');
    expect(icons).toHaveLength(1);
    expect(icons[0].outerHTML).toBe(before);
  });
});
