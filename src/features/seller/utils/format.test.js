import { describe, expect, it } from "vitest";
import {
  isPaymentOverdue,
  nextPaymentOf,
  paymentTypeLabel,
} from "./format";

const t = (key, params = {}) => {
  const labels = {
    "seller.pendingInstallment": "Pending installment",
    "seller.paymentTypes.reservation": "Reservation",
    "seller.paymentTypes.downPayment": "Down payment",
    "seller.paymentTypes.installment": `Installment ${params.number}`,
    "seller.paymentTypes.installmentGeneric": "Installment",
    "seller.paymentTypes.full": "Total",
    "seller.paymentTypes.capitalRepayment": "Capital repayment",
  };
  return labels[key] ?? key;
};

describe("seller collection helpers", () => {
  it("normalizes the next_payment object and flat compatibility fields", () => {
    const objectPayment = { id: 42, amount: 50000 };
    expect(nextPaymentOf({ next_payment: objectPayment })).toBe(objectPayment);

    expect(
      nextPaymentOf({
        next_payment_id: 7,
        next_payment_amount: 1200,
        next_payment_date: "2026-12-01T00:00:00Z",
        next_payment_type: "down_payment",
      })
    ).toMatchObject({ id: 7, amount: 1200, payment_type: "down_payment" });

    expect(nextPaymentOf({ balance: 100 })).toBeNull();
  });

  it("labels each payment type in a human way", () => {
    expect(paymentTypeLabel({ payment_type: "reservation" }, t)).toBe(
      "Reservation"
    );
    expect(paymentTypeLabel({ payment_type: "down_payment" }, t)).toBe(
      "Down payment"
    );
    expect(
      paymentTypeLabel(
        { payment_type: "installment", description: "Cuota 3 de 12" },
        t
      )
    ).toBe("Installment 3");
    expect(paymentTypeLabel({ payment_type: "full" }, t)).toBe("Total");
    expect(paymentTypeLabel({ payment_type: "capital_repayment" }, t)).toBe(
      "Capital repayment"
    );
  });

  it("marks pending payments as overdue only after their UTC due day", () => {
    expect(
      isPaymentOverdue({ status: "pending", due_date: "2020-01-01T00:00:00Z" })
    ).toBe(true);
    expect(
      isPaymentOverdue({ status: "paid", due_date: "2020-01-01T00:00:00Z" })
    ).toBe(false);
    expect(
      isPaymentOverdue({ status: "pending", due_date: "2999-01-01T00:00:00Z" })
    ).toBe(false);
  });
});
