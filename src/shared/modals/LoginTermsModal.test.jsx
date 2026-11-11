import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

import LoginTermsModal from "./LoginTermsModal";
import { useGeneralSettings } from "../../contexts/generalSettings";

expect.extend(matchers);
afterEach(cleanup);

vi.mock("../../contexts/LocaleContext", () => ({
  useLocale: () => ({
    locale: "en",
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
      ...settings,
    },
  });
};

beforeEach(() => {
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
});
