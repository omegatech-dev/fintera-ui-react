import { render, screen, waitFor, cleanup, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

import { GeneralSettingsProvider } from "./GeneralSettingsContext";
import {
  DEFAULT_GENERAL_SETTINGS,
  STORAGE_KEY,
  normalizeGeneralSettings,
  useGeneralSettings,
} from "./generalSettings";
import { settingsApi } from "../features/settings/api";

expect.extend(matchers);
afterEach(cleanup);

vi.mock("../features/settings/api", () => ({
  settingsApi: {
    get: vi.fn(),
    update: vi.fn(),
  },
}));

function Probe() {
  const { settings, update } = useGeneralSettings();
  return (
    <div>
      <div data-testid="currency">{settings.default_currency}</div>
      <div data-testid="hold">{settings.reservation_hold_hours}</div>
      <button type="button" onClick={() => update({ default_currency: "USD" })}>
        update
      </button>
    </div>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.removeItem(STORAGE_KEY);
});

describe("GeneralSettingsProvider", () => {
  it("fetches settings on mount and applies them", async () => {
    settingsApi.get.mockResolvedValueOnce({
      settings: {
        support_email: "help@acme.test",
        reservation_hold_hours: 72,
        default_currency: "USD",
      },
    });

    render(
      <GeneralSettingsProvider>
        <Probe />
      </GeneralSettingsProvider>
    );

    await waitFor(() => {
      expect(settingsApi.get).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("currency")).toHaveTextContent("USD");
      expect(screen.getByTestId("hold")).toHaveTextContent("72");
    });

    const cached = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    expect(cached.support_email).toBe("help@acme.test");
    expect(cached.default_currency).toBe("USD");
  });

  it("keeps cached/default settings when the API fails", async () => {
    settingsApi.get.mockRejectedValueOnce(new Error("network down"));

    render(
      <GeneralSettingsProvider>
        <Probe />
      </GeneralSettingsProvider>
    );

    await waitFor(() => {
      expect(settingsApi.get).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByTestId("currency")).toHaveTextContent(
      DEFAULT_GENERAL_SETTINGS.default_currency
    );
    expect(screen.getByTestId("hold")).toHaveTextContent(
      String(DEFAULT_GENERAL_SETTINGS.reservation_hold_hours)
    );
  });

  it("seeds state from the cache before the fetch resolves", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ default_currency: "EUR" })
    );
    settingsApi.get.mockReturnValueOnce(new Promise(() => {}));

    render(
      <GeneralSettingsProvider>
        <Probe />
      </GeneralSettingsProvider>
    );

    expect(screen.getByTestId("currency")).toHaveTextContent("EUR");
  });

  it("updates only the provided fields and caches the result", async () => {
    settingsApi.get.mockResolvedValueOnce({
      settings: { default_currency: "HNL", reservation_hold_hours: 48 },
    });
    settingsApi.update.mockResolvedValueOnce({
      settings: { default_currency: "USD", reservation_hold_hours: 48 },
    });

    render(
      <GeneralSettingsProvider>
        <Probe />
      </GeneralSettingsProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("currency")).toHaveTextContent("HNL");
    });

    fireEvent.click(screen.getByRole("button", { name: "update" }));

    await waitFor(() => {
      expect(settingsApi.update).toHaveBeenCalledWith(
        expect.objectContaining({
          default_currency: "USD",
          reservation_hold_hours: 48,
        })
      );
      expect(screen.getByTestId("currency")).toHaveTextContent("USD");
    });
    expect(screen.getByTestId("hold")).toHaveTextContent("48");
  });
});

describe("normalizeGeneralSettings", () => {
  it("coerces numeric and boolean fields and trims strings", () => {
    const normalized = normalizeGeneralSettings({
      support_email: "  help@acme.test ",
      reservation_min_amount: "7500",
      email_notifications_enabled: "false",
      overdue_reminders_enabled: 0,
      default_currency: "usd",
    });

    expect(normalized.support_email).toBe("help@acme.test");
    expect(normalized.reservation_min_amount).toBe(7500);
    expect(normalized.email_notifications_enabled).toBe(false);
    expect(normalized.overdue_reminders_enabled).toBe(false);
    expect(normalized.default_currency).toBe("USD");
  });

  it("autofills empty contact and legal values with the current data", () => {
    const normalized = normalizeGeneralSettings({
      support_email: "",
      support_whatsapp: "",
      legal_name: "",
      website: "",
    });

    expect(normalized.support_email).toBe("support@omegatech.dev");
    expect(normalized.support_whatsapp).toBe("+50431848112");
    expect(normalized.legal_name).toBe("Omegatech S. de R.L.");
    expect(normalized.website).toBe("https://omegatech.dev/");
  });
});
