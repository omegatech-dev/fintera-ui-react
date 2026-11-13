import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

import TermsAndCondition from "./index";
import { useGeneralSettings } from "../../../../contexts/generalSettings";

expect.extend(matchers);
afterEach(cleanup);

const localeState = vi.hoisted(() => ({ locale: "es" }));

vi.mock("../../../../contexts/LocaleContext", () => ({
  useLocale: () => ({
    locale: localeState.locale,
    t: (key) => key,
  }),
}));

vi.mock("../../../../contexts/generalSettings", () => ({
  useGeneralSettings: vi.fn(),
}));

const baseSettings = {
  support_email: "soporte@fintera.test",
  support_whatsapp: "+50499998888",
  legal_name: "Omegatech S. de R.L.",
  legal_address: "Tegucigalpa, Honduras",
  website: "https://omegatech.dev/",
  terms_effective_date: "2026-02-01",
  terms_content_es: "",
  terms_content_en: "",
};

const mockSettings = (overrides = {}) => {
  useGeneralSettings.mockReturnValue({
    settings: { ...baseSettings, ...overrides },
  });
};

beforeEach(() => {
  vi.clearAllMocks();
  localeState.locale = "es";
  mockSettings();
});

describe("TermsAndCondition", () => {
  it("renders the configured spanish terms content with paragraphs", () => {
    mockSettings({
      terms_content_es:
        "Primer párrafo con\nsalto de línea.\n\nSegundo párrafo.",
    });

    render(<TermsAndCondition />);

    const first = screen.getByText(/Primer párrafo con/);
    expect(first).toHaveTextContent("Primer párrafo con");
    expect(first.textContent).toContain("salto de línea.");
    expect(screen.getByText("Segundo párrafo.")).toBeInTheDocument();
    expect(
      screen.queryByText("termsAndConditions.sections.acceptanceTitle")
    ).not.toBeInTheDocument();
  });

  it("falls back to the i18n content when no custom terms exist", () => {
    render(<TermsAndCondition />);

    expect(
      screen.getByText("termsAndConditions.sections.acceptanceTitle")
    ).toBeInTheDocument();
    expect(
      screen.getByText("termsAndConditions.sections.contactInformationTitle")
    ).toBeInTheDocument();
  });

  it("renders the english content when the locale is english", () => {
    localeState.locale = "en";
    mockSettings({ terms_content_en: "English custom terms." });

    render(<TermsAndCondition />);

    expect(screen.getByText("English custom terms.")).toBeInTheDocument();
    expect(
      screen.queryByText("termsAndConditions.sections.acceptanceTitle")
    ).not.toBeInTheDocument();
  });

  it("keeps the contact details from settings", () => {
    render(<TermsAndCondition />);

    expect(screen.getByText(/soporte@fintera\.test/)).toBeInTheDocument();
    expect(screen.getByText(/Omegatech S\. de R\.L\./)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "https://omegatech.dev/" })
    ).toBeInTheDocument();
  });
});
