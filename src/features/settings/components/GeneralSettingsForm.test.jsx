import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

import GeneralSettingsForm from "./GeneralSettingsForm";
import LegalSettingsForm from "./LegalSettingsForm";
import NotificationSettingsForm from "./NotificationSettingsForm";
import RegionalSettingsForm from "./RegionalSettingsForm";
import { useGeneralSettings } from "../../../contexts/generalSettings";
import { useToast } from "../../../contexts/ToastContext";

expect.extend(matchers);
afterEach(cleanup);

vi.mock("../../../contexts/generalSettings", () => ({
  useGeneralSettings: vi.fn(),
}));

vi.mock("../../../contexts/LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key, locale: "en" }),
}));

vi.mock("../../../contexts/ToastContext", () => ({
  useToast: vi.fn(),
}));

const showToast = vi.fn();
const update = vi.fn();

const baseSettings = {
  support_whatsapp: "+50499998888",
  support_email: "soporte@fintera.test",
  reservation_hold_hours: 48,
  reservation_min_amount: 5000,
  reservation_due_days: 7,
  down_payment_due_days: 14,
  down_payment_due_days_with_reservation: 21,
  legal_name: "Fintera S.A.",
  legal_tax_id: "0801-1990-12345",
  legal_address: "Tegucigalpa",
  website: "https://fintera.app",
  terms_effective_date: "2026-01-01",
  terms_content_es: "Términos base en español.",
  terms_content_en: "Base terms in English.",
  email_notifications_enabled: true,
  overdue_reminders_enabled: true,
  upcoming_reminder_days: 1,
  default_currency: "HNL",
  default_locale: "es",
  timezone: "America/Tegucigalpa",
};

beforeEach(() => {
  vi.clearAllMocks();
  useToast.mockReturnValue({ showToast, hideToast: vi.fn() });
  update.mockImplementation(async (partial) => ({ ...baseSettings, ...partial }));
  useGeneralSettings.mockReturnValue({
    settings: baseSettings,
    loading: false,
    update,
    refresh: vi.fn(),
  });
});

describe("General settings sections", () => {
  it("loads support and reservation values", () => {
    render(<GeneralSettingsForm />);

    expect(screen.getByLabelText("branding.supportReservations.whatsApp")).toHaveValue(
      "+50499998888"
    );
    expect(screen.getByLabelText("branding.supportReservations.minAmount")).toHaveValue(
      5000
    );
  });

  it("saves only the support and reservation fields", async () => {
    const { container } = render(<GeneralSettingsForm />);

    fireEvent.change(screen.getByLabelText("branding.supportReservations.whatsApp"), {
      target: { value: "+50488887777" },
    });
    fireEvent.change(screen.getByLabelText("branding.supportReservations.minAmount"), {
      target: { value: "7500" },
    });
    fireEvent.submit(container.querySelector("form"));

    await waitFor(() => {
      expect(update).toHaveBeenCalledWith({
        support_whatsapp: "+50488887777",
        support_email: "soporte@fintera.test",
        reservation_hold_hours: 48,
        reservation_min_amount: 7500,
        reservation_due_days: 7,
        down_payment_due_days: 14,
        down_payment_due_days_with_reservation: 21,
      });
    });
    expect(showToast).toHaveBeenCalledWith(
      "branding.supportReservations.saved",
      "success"
    );
  });

  it("blocks invalid support and reservation values inline", () => {
    const { container } = render(<GeneralSettingsForm />);

    fireEvent.change(screen.getByLabelText("branding.supportReservations.whatsApp"), {
      target: { value: "abc" },
    });
    fireEvent.change(screen.getByLabelText("branding.supportReservations.minAmount"), {
      target: { value: "-1" },
    });
    fireEvent.submit(container.querySelector("form"));

    expect(update).not.toHaveBeenCalled();
    expect(
      screen.getAllByText("branding.supportReservations.errorWhatsApp").length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText("branding.supportReservations.errorMinAmount").length
    ).toBeGreaterThan(0);
  });

  it("blocks a down payment window shorter than the reservation window", () => {
    const { container } = render(<GeneralSettingsForm />);

    fireEvent.change(
      screen.getByLabelText("branding.supportReservations.downPaymentDueDays"),
      { target: { value: "3" } }
    );
    fireEvent.submit(container.querySelector("form"));

    expect(update).not.toHaveBeenCalled();
    expect(
      screen.getAllByText("branding.supportReservations.errorDueOrder").length
    ).toBeGreaterThan(0);
  });

  it("discards support and reservation changes", async () => {
    render(<GeneralSettingsForm />);

    const whatsapp = screen.getByLabelText("branding.supportReservations.whatsApp");
    fireEvent.change(whatsapp, { target: { value: "+50488887777" } });
    expect(screen.getByText("settings.saveBar.save")).toBeInTheDocument();

    fireEvent.click(screen.getByText("settings.saveBar.discard"));

    expect(whatsapp).toHaveValue("+50499998888");
    await waitFor(() => {
      expect(screen.queryByText("settings.saveBar.save")).not.toBeInTheDocument();
    });
  });

  it("saves legal details independently", async () => {
    const { container } = render(<LegalSettingsForm />);

    fireEvent.change(screen.getByLabelText("branding.legal.name"), {
      target: { value: "Acme S.A." },
    });
    fireEvent.submit(container.querySelector("form"));

    await waitFor(() => {
      expect(update).toHaveBeenCalledWith({
        legal_name: "Acme S.A.",
        legal_tax_id: "0801-1990-12345",
        legal_address: "Tegucigalpa",
        website: "https://fintera.app",
        terms_effective_date: "2026-01-01",
        terms_content_es: "Términos base en español.",
        terms_content_en: "Base terms in English.",
      });
    });
  });

  it("saves the terms content in both languages using the default templates", async () => {
    const { container } = render(<LegalSettingsForm />);

    expect(
      screen.getByRole("textbox", { name: "branding.legal.termsContentEs" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "branding.legal.termsContentEn" })
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("branding.legal.termsCharacters")
    ).toHaveLength(2);

    const templateButtons = screen.getAllByText(
      "branding.legal.useDefaultTemplate"
    );
    fireEvent.click(templateButtons[0]);
    fireEvent.click(templateButtons[1]);
    fireEvent.submit(container.querySelector("form"));

    await waitFor(() => {
      expect(update).toHaveBeenCalledWith(
        expect.objectContaining({
          terms_content_es: expect.stringContaining("<h2>1. Aceptación</h2>"),
          terms_content_en: expect.stringContaining("<h2>1. Acceptance</h2>"),
          legal_name: "Fintera S.A.",
        })
      );
    });
  });

  it("rejects an invalid website", () => {
    const { container } = render(<LegalSettingsForm />);

    fireEvent.change(screen.getByLabelText("branding.legal.website"), {
      target: { value: "not-a-url" },
    });
    fireEvent.submit(container.querySelector("form"));

    expect(update).not.toHaveBeenCalled();
    expect(
      screen.getAllByText("branding.legal.errorWebsite").length
    ).toBeGreaterThan(0);
  });

  it("saves notification toggles and lead time", async () => {
    const { container } = render(<NotificationSettingsForm />);

    fireEvent.click(
      screen.getByRole("switch", {
        name: "branding.notifications.overdueEnabled",
      })
    );
    fireEvent.change(
      screen.getByLabelText("branding.notifications.upcomingDays"),
      { target: { value: "3" } }
    );
    fireEvent.submit(container.querySelector("form"));

    await waitFor(() => {
      expect(update).toHaveBeenCalledWith({
        email_notifications_enabled: true,
        overdue_reminders_enabled: false,
        upcoming_reminder_days: 3,
      });
    });
  });

  it("saves regional defaults", async () => {
    const { container } = render(<RegionalSettingsForm />);

    fireEvent.change(screen.getByLabelText("branding.regional.currency"), {
      target: { value: "USD" },
    });
    fireEvent.change(screen.getByLabelText("branding.regional.locale"), {
      target: { value: "en" },
    });
    fireEvent.submit(container.querySelector("form"));

    await waitFor(() => {
      expect(update).toHaveBeenCalledWith({
        default_currency: "USD",
        default_locale: "en",
        timezone: "America/Tegucigalpa",
      });
    });
  });
});
