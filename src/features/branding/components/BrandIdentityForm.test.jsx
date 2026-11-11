import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

import BrandIdentityForm from "./BrandIdentityForm";
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
    uploadLogo: vi.fn(),
    deleteLogo: vi.fn(),
  },
}));

const pngFile = new File(["fake-png"], "logo.png", { type: "image/png" });
const darkPngFile = new File(["fake-dark-png"], "logo-dark.png", { type: "image/png" });

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
  window.URL.createObjectURL = vi.fn(() => "blob:preview");
  window.URL.revokeObjectURL = vi.fn();
  mockBranding();
});

const getFileInputs = (container) => container.querySelectorAll('input[type="file"]');

describe("BrandIdentityForm", () => {
  it("renders guidance, upload cards and the live preview", () => {
    render(<BrandIdentityForm />);

    expect(screen.getByText("branding.guidance.title")).toBeInTheDocument();
    expect(screen.getByText("branding.preview.title")).toBeInTheDocument();
    expect(screen.queryByText("branding.save")).not.toBeInTheDocument();
  });

  it("uploads a selected light logo and refreshes", async () => {
    brandingApi.uploadLogo.mockResolvedValueOnce({});
    const { container } = render(<BrandIdentityForm />);

    fireEvent.change(getFileInputs(container)[0], { target: { files: [pngFile] } });
    expect(window.URL.createObjectURL).toHaveBeenCalledWith(pngFile);

    fireEvent.submit(container.querySelector("form"));

    await waitFor(() => {
      expect(brandingApi.uploadLogo).toHaveBeenCalledWith(pngFile, "light");
    });
    expect(refresh).toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith("branding.success", "success");
  });

  it("uploads a selected dark logo", async () => {
    brandingApi.uploadLogo.mockResolvedValueOnce({});
    const { container } = render(<BrandIdentityForm />);

    fireEvent.change(getFileInputs(container)[1], {
      target: { files: [darkPngFile] },
    });
    fireEvent.submit(container.querySelector("form"));

    await waitFor(() => {
      expect(brandingApi.uploadLogo).toHaveBeenCalledWith(darkPngFile, "dark");
    });
  });

  it("rejects unsupported files with inline feedback and a toast", () => {
    const { container } = render(<BrandIdentityForm />);
    const badFile = new File(["text"], "notes.txt", { type: "text/plain" });

    fireEvent.change(getFileInputs(container)[0], { target: { files: [badFile] } });

    expect(showToast).toHaveBeenCalledWith("branding.errorFileType", "error");
    expect(screen.getAllByText("branding.errorFileType").length).toBeGreaterThan(0);
    expect(brandingApi.uploadLogo).not.toHaveBeenCalled();
  });

  it("rejects files above the 2 MB limit", () => {
    const { container } = render(<BrandIdentityForm />);
    const hugeFile = new File([new Uint8Array(2 * 1024 * 1024 + 1)], "huge.png", {
      type: "image/png",
    });

    fireEvent.change(getFileInputs(container)[0], { target: { files: [hugeFile] } });

    expect(showToast).toHaveBeenCalledWith("branding.errorFileSize", "error");
  });

  it("warns, without blocking, when the logo is smaller than recommended", () => {
    const { container } = render(<BrandIdentityForm />);

    fireEvent.change(getFileInputs(container)[0], { target: { files: [pngFile] } });

    const preview = container.querySelector("img");
    Object.defineProperty(preview, "naturalWidth", { value: 160, configurable: true });
    Object.defineProperty(preview, "naturalHeight", { value: 40, configurable: true });
    fireEvent.load(preview);

    expect(screen.getByText("branding.upload.qualitySmall")).toBeInTheDocument();

    fireEvent.submit(container.querySelector("form"));
    expect(brandingApi.uploadLogo).toHaveBeenCalled();
  });

  it("deletes a marked-for-removal logo on save", async () => {
    brandingApi.deleteLogo.mockResolvedValueOnce({});
    mockBranding({ logo_url: "/uploads/branding/a.png" });
    const { container } = render(<BrandIdentityForm />);

    const [removeLight] = screen.getAllByText("branding.remove");
    fireEvent.click(removeLight);
    fireEvent.submit(container.querySelector("form"));

    await waitFor(() => {
      expect(brandingApi.deleteLogo).toHaveBeenCalledWith("light");
    });
    expect(refresh).toHaveBeenCalled();
  });

  it("discards pending logo changes", async () => {
    const { container } = render(<BrandIdentityForm />);

    fireEvent.change(getFileInputs(container)[0], { target: { files: [pngFile] } });
    expect(screen.getByText("branding.save")).toBeInTheDocument();

    fireEvent.click(screen.getByText("branding.saveBar.discard"));

    await waitFor(() => {
      expect(screen.queryByText("branding.save")).not.toBeInTheDocument();
    });
  });

  it("surfaces API errors with an error toast", async () => {
    brandingApi.uploadLogo.mockRejectedValueOnce({ message: "boom" });
    const { container } = render(<BrandIdentityForm />);

    fireEvent.change(getFileInputs(container)[0], { target: { files: [pngFile] } });
    fireEvent.submit(container.querySelector("form"));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith("boom", "error");
    });
    expect(refresh).not.toHaveBeenCalled();
  });
});
