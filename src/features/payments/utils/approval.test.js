import { describe, expect, it } from "vitest";
import { reservationApprovalBlocked } from "./approval";

describe("reservationApprovalBlocked", () => {
  it("blocks a reservation payment while the contract is pending", () => {
    expect(
      reservationApprovalBlocked({
        payment_type: "reservation",
        contract: { status: "pending" },
      })
    ).toBe(true);
  });

  it("blocks a reservation payment while the contract is submitted", () => {
    expect(
      reservationApprovalBlocked({
        payment_type: "reservation",
        contract: { status: "submitted" },
      })
    ).toBe(true);
  });

  it("allows a reservation payment when the contract is approved", () => {
    expect(
      reservationApprovalBlocked({
        payment_type: "reservation",
        contract: { status: "approved" },
      })
    ).toBe(false);
  });

  it("does not block non-reservation payments", () => {
    expect(
      reservationApprovalBlocked({
        payment_type: "installment",
        contract: { status: "pending" },
      })
    ).toBe(false);
  });

  it("blocks reservation payments without contract data", () => {
    expect(reservationApprovalBlocked({ payment_type: "reservation" })).toBe(
      true
    );
  });
});
