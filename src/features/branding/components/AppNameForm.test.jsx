import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

import AppNameForm from "./AppNameForm";
import { useBranding } from "../../../contexts/branding";
import { useToast } from "../../../contexts/ToastContext";
import { brandingApi } from "../api";

expect.extend(matchers);
afterEach(cleanup);

vi.mock("../../../contexts/branding", () => ({
  useBranding: vi.fn(),
}));

vi.mock("../../../contexts/ToastContext", () => ({
  useToast: vi.fn(),
}));

vi.mock("../../../contexts/LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key, locale: "en" }),
}));

vi.mock("../api", () => ({
  brandingApi: {
    update: vi.fn(),
  },
}));

const refresh = vi.fn();
const applyBranding = vi.fn();
const showToast = vi.fn();

const mockBranding = (branding = {}) => {
  useBranding.mockReturnValue({
    branding: {
      app_name: "Fintera",
      logo_url: null,
      logo_dark_url: null,
      ...branding,
    },
    loading: false,
    refresh,
    applyBranding,
  });
};

beforeEach(() => {
  vi.clearAllMocks();
  useToast.mockReturnValue({ showToast, hideToast: vi.fn() });
  mockBranding();
});

const getNameInput = () => screen.getByLabelText("branding.appName");

describe("AppNameForm", () => {
  it("renders the current name without a save bar", () => {
    render(<AppNameForm />);

    expect(getNameInput()).toHaveValue("Fintera");
    expect(screen.queryByText("branding.save")).not.toBeInTheDocument();
  });

  it("shows an inline error for an empty name", () => {
    const { container } = render(<AppNameForm />);
    fireEvent.change(getNameInput(), { target: { value: "   " } });
    fireEvent.submit(container.querySelector("form"));

    expect(screen.getByRole("alert")).toHaveTextContent("branding.errorNameRequired");
    expect(brandingApi.update).not.toHaveBeenCalled();
  });

  it("saves a renamed application and applies the write response", async () => {
    brandingApi.update.mockResolvedValueOnce({
      branding: { app_name: "Acme", logo_url: null, logo_dark_url: null },
    });
    const { container } = render(<AppNameForm />);

    fireEvent.change(getNameInput(), { target: { value: "Acme" } });
    fireEvent.submit(container.querySelector("form"));

    await waitFor(() => {
      expect(brandingApi.update).toHaveBeenCalledWith("Acme");
    });
    await waitFor(() => {
      expect(applyBranding).toHaveBeenCalledWith({
        branding: { app_name: "Acme", logo_url: null, logo_dark_url: null },
      });
    });
    expect(applyBranding.mock.invocationCallOrder[0]).toBeGreaterThan(
      refresh.mock.invocationCallOrder[0]
    );
    expect(showToast).toHaveBeenCalledWith("branding.success", "success");
  });

  it("previews the browser tab with the bundled favicon", () => {
    const { container } = render(<AppNameForm />);

    const icon = container.querySelector('img[src="/pwa-64x64.png"]');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("h-4", "w-4");
  });

  it("discards pending changes", async () => {
    render(<AppNameForm />);

    fireEvent.change(getNameInput(), { target: { value: "Acme" } });
    expect(screen.getByText("branding.save")).toBeInTheDocument();

    fireEvent.click(screen.getByText("branding.saveBar.discard"));

    expect(getNameInput()).toHaveValue("Fintera");
    await waitFor(() => {
      expect(screen.queryByText("branding.save")).not.toBeInTheDocument();
    });
  });

  it("surfaces API errors with an error toast", async () => {
    brandingApi.update.mockRejectedValueOnce({ message: "boom" });
    const { container } = render(<AppNameForm />);

    fireEvent.change(getNameInput(), { target: { value: "Acme" } });
    fireEvent.submit(container.querySelector("form"));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith("boom", "error");
    });
    expect(refresh).not.toHaveBeenCalled();
  });
});
