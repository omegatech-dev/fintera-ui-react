import { describe, it, expect } from "vitest";
import { validateReserveAmount } from "./reserveRules";

const t = (key, params) =>
  params ? `${key}:${params.amount}:${params.currency}` : key;

describe("validateReserveAmount", () => {
  it("requires a positive amount", () => {
    expect(validateReserveAmount("", 5000, t, "HNL")).toBe(
      "reservations.reserveAmountRequired"
    );
    expect(validateReserveAmount(0, 5000, t, "HNL")).toBe(
      "reservations.reserveAmountRequired"
    );
  });

  it("blocks amounts below the configured minimum", () => {
    expect(validateReserveAmount(4999, 5000, t, "HNL")).toBe(
      "reservations.minReserveAmount:5000:HNL"
    );
  });

  it("accepts the minimum and higher amounts", () => {
    expect(validateReserveAmount(5000, 5000, t, "HNL")).toBe("");
    expect(validateReserveAmount(7500, 5000, t, "HNL")).toBe("");
  });
});
