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
    expect(formatCurrency(1234)).toBe("1,234 USD");
  });

  it("prefixes lempiras and omits decimals for whole amounts", () => {
    expect(formatCurrency(10, "HNL")).toBe("L 10");
    expect(formatCurrency(188750, "HNL")).toBe("L 188,750");
    expect(formatCurrency(188750.5, "HNL")).toBe("L 188,750.50");
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
