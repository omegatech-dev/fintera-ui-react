import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

import BrandingForm from "./BrandingForm";
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
    get: vi.fn(),
    update: vi.fn(),
    uploadLogo: vi.fn(),
    deleteLogo: vi.fn(),
  },
}));

const pngFile = new File(["fake-png"], "logo.png", { type: "image/png" });

const refresh = vi.fn();
const showToast = vi.fn();

const mockBranding = (branding = {}) => {
  useBranding.mockReturnValue({
    branding: { app_name: "Fintera", logo_url: null, logo_dark_url: null, ...branding },
    loading: false,
    refresh,
  });
};

beforeEach(() => {
  vi.clearAllMocks();
  useToast.mockReturnValue({ showToast, hideToast: vi.fn() });
  window.URL.createObjectURL = vi.fn(() => "blob:preview");
  window.URL.revokeObjectURL = vi.fn();
  mockBranding();
});

const getNameInput = () => screen.getByLabelText("branding.appName");

describe("BrandingForm", () => {
  it("renders the current name and logos", () => {
    mockBranding({ app_name: "Acme", logo_url: "/uploads/branding/a.png" });
    render(<BrandingForm />);

    expect(getNameInput()).toHaveValue("Acme");
    // The save button starts disabled with no changes
    expect(screen.getByText("branding.save")).toBeDisabled();
  });

  it("blocks saving an empty name and shows an error toast", () => {
    render(<BrandingForm />);
    fireEvent.change(getNameInput(), { target: { value: "   " } });
    fireEvent.submit(screen.getByText("branding.save").closest("form"));

    expect(showToast).toHaveBeenCalledWith("branding.errorNameRequired", "error");
    expect(brandingApi.update).not.toHaveBeenCalled();
  });

  it("saves a renamed application", async () => {
    brandingApi.update.mockResolvedValueOnce({});
    render(<BrandingForm />);

    fireEvent.change(getNameInput(), { target: { value: "Acme" } });
    fireEvent.submit(screen.getByText("branding.save").closest("form"));

    await waitFor(() => {
      expect(brandingApi.update).toHaveBeenCalledWith("Acme");
    });
    await waitFor(() => {
      expect(refresh).toHaveBeenCalled();
    });
    expect(showToast).toHaveBeenCalledWith("branding.success", "success");
  });

  it("uploads a selected light logo and refreshes", async () => {
    brandingApi.uploadLogo.mockResolvedValueOnce({});
    const { container } = render(<BrandingForm />);

    const input = container.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [pngFile] } });
    expect(window.URL.createObjectURL).toHaveBeenCalledWith(pngFile);

    fireEvent.submit(screen.getByText("branding.save").closest("form"));

    await waitFor(() => {
      expect(brandingApi.uploadLogo).toHaveBeenCalledWith(pngFile, "light");
    });
    expect(refresh).toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith("branding.success", "success");
  });

  it("rejects unsupported files with an error toast", () => {
    const { container } = render(<BrandingForm />);
    const badFile = new File(["text"], "notes.txt", { type: "text/plain" });

    const input = container.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [badFile] } });

    expect(showToast).toHaveBeenCalledWith("branding.errorFile", "error");
    expect(brandingApi.uploadLogo).not.toHaveBeenCalled();
  });

  it("deletes a marked-for-removal logo on save", async () => {
    brandingApi.deleteLogo.mockResolvedValueOnce({});
    mockBranding({ logo_url: "/uploads/branding/a.png" });
    render(<BrandingForm />);

    // Both slots show a Remove button (dark falls back to the light logo);
    // the first one belongs to the light slot.
    const [removeLight] = screen.getAllByText("branding.remove");
    fireEvent.click(removeLight);
    fireEvent.submit(screen.getByText("branding.save").closest("form"));

    await waitFor(() => {
      expect(brandingApi.deleteLogo).toHaveBeenCalledWith("light");
    });
    expect(refresh).toHaveBeenCalled();
  });

  it("surfaces API errors with an error toast", async () => {
    brandingApi.update.mockRejectedValueOnce({ message: "boom" });
    render(<BrandingForm />);

    fireEvent.change(getNameInput(), { target: { value: "Acme" } });
    fireEvent.submit(screen.getByText("branding.save").closest("form"));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith("boom", "error");
    });
    expect(refresh).not.toHaveBeenCalled();
  });
});
