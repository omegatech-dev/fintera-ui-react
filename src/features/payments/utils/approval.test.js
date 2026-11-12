import { describe, expect, it } from "vitest";
import { reservationApprovalBlocked } from "./approval";

describe("reservationApprovalBlocked", () => {
  it("blocks a reservation payment while the contract is pending", () => {
    expect(
      reservationApprovalBlocked({
        payment_type: "reservation",
        contract_status: "pending",
      })
    ).toBe(true);
  });

  it("blocks a reservation payment while the contract is submitted", () => {
    expect(
      reservationApprovalBlocked({
        payment_type: "reservation",
        contract_status: "submitted",
      })
    ).toBe(true);
  });

  it("allows a reservation payment when the flat contract_status is approved", () => {
    // Shape returned by the payments list endpoint.
    expect(
      reservationApprovalBlocked({
        payment_type: "reservation",
        contract_status: "approved",
      })
    ).toBe(false);
  });

  it("allows a reservation payment when a nested contract is approved", () => {
    // Shape used by contract-scoped payloads.
    expect(
      reservationApprovalBlocked({
        payment_type: "reservation",
        contract: { status: "approved" },
      })
    ).toBe(false);
  });

  it("prefers the flat contract_status over a nested contract", () => {
    expect(
      reservationApprovalBlocked({
        payment_type: "reservation",
        contract_status: "approved",
        contract: { status: "pending" },
      })
    ).toBe(false);
  });

  it("does not block non-reservation payments", () => {
    expect(
      reservationApprovalBlocked({
        payment_type: "installment",
        contract_status: "pending",
      })
    ).toBe(false);
  });

  it("blocks reservation payments without contract data", () => {
    expect(reservationApprovalBlocked({ payment_type: "reservation" })).toBe(
      true
    );
  });
});
