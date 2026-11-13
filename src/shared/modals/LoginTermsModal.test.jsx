import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

import LoginTermsModal from "./LoginTermsModal";
import { useGeneralSettings } from "../../contexts/generalSettings";

expect.extend(matchers);
afterEach(cleanup);

const localeState = vi.hoisted(() => ({ locale: "en" }));

vi.mock("../../contexts/LocaleContext", () => ({
  useLocale: () => ({
    locale: localeState.locale,
    t: (key) => key,
  }),
}));

vi.mock("../../contexts/generalSettings", () => ({
  useGeneralSettings: vi.fn(),
}));

const mockSettings = (settings = {}) => {
  useGeneralSettings.mockReturnValue({
    settings: {
      support_email: "",
      support_whatsapp: "",
      legal_name: "",
      legal_address: "",
      website: "",
      terms_effective_date: "",
      terms_content_es: "",
      terms_content_en: "",
      ...settings,
    },
  });
};

beforeEach(() => {
  vi.clearAllMocks();
  localeState.locale = "en";
  mockSettings();
});

describe("LoginTermsModal", () => {
  it("renders configured support and legal contact details", () => {
    mockSettings({
      support_email: "help@acme.test",
      support_whatsapp: "+50499998888",
      legal_name: "Acme S.A.",
      legal_address: "Tegucigalpa",
      website: "https://acme.test",
      terms_effective_date: "2026-01-15",
    });

    render(<LoginTermsModal isActive onClose={() => {}} />);

    expect(screen.getByText(/help@acme\.test/)).toBeInTheDocument();
    expect(screen.getByText(/\+50499998888/)).toBeInTheDocument();
    expect(screen.getByText(/Acme S\.A\./)).toBeInTheDocument();
    expect(screen.getByText(/Tegucigalpa/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "https://acme.test" })).toBeInTheDocument();
  });

  it("omits missing contact values and never shows the old hardcoded data", () => {
    render(<LoginTermsModal isActive onClose={() => {}} />);

    expect(screen.queryByText(/support@securexapp\.com/)).not.toBeInTheDocument();
    expect(screen.queryByText(/support@omegatech\.dev/)).not.toBeInTheDocument();
    expect(screen.queryByText(/31848112/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\[Insert Address\]/)).not.toBeInTheDocument();
  });

  it("renders configured english terms content with paragraphs", () => {
    mockSettings({
      terms_content_en:
        "First paragraph.\nWith a line break.\n\nSecond paragraph.",
      terms_content_es: "Spanish content should not render.",
    });

    render(<LoginTermsModal isActive onClose={() => {}} />);

    const first = screen.getByText(/First paragraph\./);
    expect(first.textContent).toContain("With a line break.");
    expect(screen.getByText("Second paragraph.")).toBeInTheDocument();
    expect(
      screen.queryByText("Spanish content should not render.")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/termsAndConditions\.sections\.acceptanceTitle/)
    ).not.toBeInTheDocument();
  });

  it("renders the spanish terms content when the locale is spanish", () => {
    localeState.locale = "es";
    mockSettings({
      terms_content_es: "Texto en español.\n\nSegundo párrafo.",
      terms_content_en: "English content should not render.",
    });

    render(<LoginTermsModal isActive onClose={() => {}} />);

    expect(screen.getByText("Texto en español.")).toBeInTheDocument();
    expect(screen.getByText("Segundo párrafo.")).toBeInTheDocument();
    expect(
      screen.queryByText("English content should not render.")
    ).not.toBeInTheDocument();
  });

  it("falls back to the i18n sections when no custom terms exist", () => {
    render(<LoginTermsModal isActive onClose={() => {}} />);

    expect(
      screen.getByText(/termsAndConditions\.sections\.acceptanceTitle/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/termsAndConditions\.sections\.contactInformationTitle/)
    ).toBeInTheDocument();
  });

  it("keeps the contact details visible with custom terms", () => {
    mockSettings({
      terms_content_en: "Custom terms.",
      legal_name: "Acme S.A.",
      support_email: "help@acme.test",
    });

    render(<LoginTermsModal isActive onClose={() => {}} />);

    expect(screen.getByText("Custom terms.")).toBeInTheDocument();
    expect(screen.getByText(/Acme S\.A\./)).toBeInTheDocument();
    expect(screen.getByText(/help@acme\.test/)).toBeInTheDocument();
  });
});
