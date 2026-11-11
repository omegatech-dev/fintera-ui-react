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

vi.mock("../../../shared/branding", () => ({
  BrandingLogo: () => <span data-testid="branding-logo" />,
}));

const refresh = vi.fn();
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

  it("saves a renamed application and refreshes branding", async () => {
    brandingApi.update.mockResolvedValueOnce({});
    const { container } = render(<AppNameForm />);

    fireEvent.change(getNameInput(), { target: { value: "Acme" } });
    fireEvent.submit(container.querySelector("form"));

    await waitFor(() => {
      expect(brandingApi.update).toHaveBeenCalledWith("Acme");
    });
    await waitFor(() => {
      expect(refresh).toHaveBeenCalled();
    });
    expect(showToast).toHaveBeenCalledWith("branding.success", "success");
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
