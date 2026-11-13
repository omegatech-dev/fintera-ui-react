import { describe, it, expect } from "vitest";
import { validateClient, validateReserveAmount } from "./reserveRules";

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

describe("validateClient", () => {
  it("accepts a selected existing client", () => {
    expect(
      validateClient({ selectedUser: { id: 7 }, fullName: "", phone: "", identity: "" }, t)
    ).toBe("");
  });

  it("requires the new client's name, phone and identity", () => {
    expect(
      validateClient({ selectedUser: null, fullName: "", phone: "", identity: "" }, t)
    ).toBe("reservations.clientRequired");
    expect(
      validateClient({ selectedUser: null, fullName: "Ana", phone: "", identity: "" }, t)
    ).toBe("reservations.clientRequired");
  });

  it("accepts a complete new client", () => {
    expect(
      validateClient(
        { selectedUser: null, fullName: "Ana", phone: "9999", identity: "0801" },
        t
      )
    ).toBe("");
  });
});
