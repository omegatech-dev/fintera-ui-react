import { describe, it, expect, beforeEach } from "vitest";
import {
  formatCurrency,
  formatDate,
  formatLargeNumber,
} from "./formatters";
import { setFormatSettings } from "./formatSettings";

beforeEach(() => {
  setFormatSettings({
    default_currency: "USD",
    default_locale: "en",
    timezone: "UTC",
  });
});

describe("formatters", () => {
  it("uses the configured default currency", () => {
    expect(formatCurrency(1234.5)).toBe("1,234.50 USD");
  });

  it("prefers an explicit record currency", () => {
    expect(formatCurrency(10, "HNL")).toBe("10.00 HNL");
  });

  it("uses the configured locale for large numbers", () => {
    expect(formatLargeNumber(999.5)).toBe("999.5");
    expect(formatLargeNumber(1234.5)).toBe("1.2K");
  });

  it("uses the configured locale and timezone for dates", () => {
    expect(formatDate("2026-01-15T12:00:00Z")).toBe("Jan 15, 2026");
    expect(formatDate("2026-01-15")).toBe("Jan 15, 2026");
  });
});
