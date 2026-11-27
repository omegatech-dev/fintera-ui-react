import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

import { BrandingProvider } from "../../../contexts/BrandingContext";
import BrandIdentityForm from "./BrandIdentityForm";
import { brandingApi } from "../api";

expect.extend(matchers);
afterEach(cleanup);

vi.mock("../api", () => ({
  brandingApi: {
    get: vi.fn(),
    update: vi.fn(),
    uploadLogo: vi.fn(),
    deleteLogo: vi.fn(),
  },
}));

vi.mock("../../../contexts/ToastContext", () => ({
  useToast: () => ({ showToast: vi.fn(), hideToast: vi.fn() }),
}));

vi.mock("../../../contexts/LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key, locale: "en" }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.removeItem("fintera_branding");
  window.URL.createObjectURL = vi.fn(() => "blob:preview");
  window.URL.revokeObjectURL = vi.fn();
});

describe("BrandIdentityForm + BrandingProvider", () => {
  it("shows the uploaded logo even when GET /branding is stale", async () => {
    // The GET always resolves with the pre-save state: simulates the 60 s
    // public HTTP cache.
    brandingApi.get.mockResolvedValue({
      branding: { app_name: "Initial", logo_url: null, logo_dark_url: null },
    });
    brandingApi.uploadLogo.mockResolvedValueOnce({
      branding: {
        app_name: "Initial",
        logo_url: "/uploads/branding/nuevo.webp",
        logo_dark_url: null,
      },
    });

    const { container } = render(
      <BrandingProvider>
        <BrandIdentityForm />
      </BrandingProvider>
    );

    // Wait for the mount fetch to be applied (not just called) so it cannot
    // overwrite the write response later.
    await waitFor(() => {
      expect(screen.getByText("Initial")).toBeInTheDocument();
    });

    fireEvent.change(container.querySelectorAll('input[type="file"]')[0], {
      target: { files: [new File(["x"], "logo.png", { type: "image/png" })] },
    });
    fireEvent.submit(container.querySelector("form"));

    await waitFor(() => {
      const srcs = [...container.querySelectorAll("img")].map(
        (img) => img.getAttribute("src") || ""
      );
      expect(srcs.some((src) => src.includes("/uploads/branding/nuevo.webp"))).toBe(
        true
      );
    });
  });
});
