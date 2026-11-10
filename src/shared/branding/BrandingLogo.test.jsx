import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import React from "react";

import BrandingLogo from "./BrandingLogo";
import { useBranding } from "../../contexts/BrandingContext";
import { BUNDLED_LOGOS } from "./brandingUtils";

expect.extend(matchers);
afterEach(cleanup);

vi.mock("../../contexts/BrandingContext", () => ({
  useBranding: vi.fn(),
}));

const renderWith = (branding) => {
  useBranding.mockReturnValue({
    branding: { app_name: "Fintera", ...branding },
    loading: false,
    refresh: vi.fn(),
  });
  return render(<BrandingLogo />);
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("BrandingLogo", () => {
  it("renders the bundled light logo when nothing is configured", () => {
    renderWith({ logo_url: null, logo_dark_url: null });
    expect(screen.getByRole("img")).toHaveAttribute("src", BUNDLED_LOGOS.light);
  });

  it("renders the custom light logo when configured", () => {
    renderWith({ logo_url: "/uploads/branding/custom.png" });
    expect(screen.getByRole("img").getAttribute("src")).toContain("/uploads/branding/custom.png");
  });

  it("falls back from dark to the light custom logo when no dark variant exists", () => {
    render(
      <BrandingLogoProviderDark />
    );
    const img = screen.getByRole("img");
    expect(img.getAttribute("src")).toContain("/uploads/branding/light-only.png");
  });

  it("renders the bundled dark asset when dark variant is requested without custom logos", () => {
    useBranding.mockReturnValue({
      branding: { app_name: "Fintera", logo_url: null, logo_dark_url: null },
      loading: false,
      refresh: vi.fn(),
    });
    render(<BrandingLogo variant="dark" />);
    expect(screen.getByRole("img")).toHaveAttribute("src", BUNDLED_LOGOS.dark);
  });

  it("renders the bundled short asset for the collapsed sidebar", () => {
    useBranding.mockReturnValue({
      branding: { app_name: "Fintera", logo_url: null, logo_dark_url: null },
      loading: false,
      refresh: vi.fn(),
    });
    render(<BrandingLogo short />);
    expect(screen.getByRole("img")).toHaveAttribute("src", BUNDLED_LOGOS.shortLight);
  });

  it("falls back to the bundled asset when the custom logo fails to load", () => {
    renderWith({ logo_url: "/uploads/branding/broken.png" });
    const img = screen.getByRole("img");
    fireEvent.error(img);
    expect(img).toHaveAttribute("src", BUNDLED_LOGOS.light);
  });
});

// Helper component: dark variant with only a light custom logo configured
function BrandingLogoProviderDark() {
  useBranding.mockReturnValue({
    branding: {
      app_name: "Fintera",
      logo_url: "/uploads/branding/light-only.png",
      logo_dark_url: null,
    },
    loading: false,
    refresh: vi.fn(),
  });
  return <BrandingLogo variant="dark" />;
}
