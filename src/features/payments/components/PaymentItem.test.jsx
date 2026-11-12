import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import PaymentItem from "./PaymentItem";

expect.extend(matchers);

const translations = {
  "payments.approve": "Aprobar",
  "payments.reject": "Rechazar",
  "payments.reservationRequiresContract":
    "No se puede aprobar la reserva sin antes aprobar el contrato.",
};

vi.mock("../api", () => ({
  paymentsApi: {
    approve: vi.fn(),
    uploadReceipt: vi.fn(),
    downloadReceipt: vi.fn(),
  },
}));

vi.mock("../../../contexts/LocaleContext", () => ({
  useLocale: () => ({ t: (key) => translations[key] ?? key }),
}));

vi.mock("../../../contexts/ToastContext", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

const basePayment = {
  id: 11,
  amount: 5000,
  status: "submitted",
  payment_type: "reservation",
  applicant_name: "Cliente Demo",
  due_date: "2026-11-13T00:00:00Z",
};

function renderItem(payment) {
  return render(
    <PaymentItem
      paymentInfo={payment}
      userRole="admin"
      refreshPayments={vi.fn()}
      isMobileCard
    />
  );
}

describe("PaymentItem reservation approval gate", () => {
  afterEach(() => {
    cleanup();
  });

  it("disables approval and explains why when the contract is pending", () => {
    renderItem({ ...basePayment, contract_status: "pending" });

    expect(screen.getByRole("button", { name: /aprobar/i })).toBeDisabled();
    expect(
      screen.getByText(translations["payments.reservationRequiresContract"])
    ).toBeInTheDocument();
  });

  it("allows approval when the list reports an approved contract", () => {
    // The payments list returns the contract state as `contract_status`.
    renderItem({ ...basePayment, contract_status: "approved" });

    expect(screen.getByRole("button", { name: /aprobar/i })).toBeEnabled();
    expect(
      screen.queryByText(translations["payments.reservationRequiresContract"])
    ).not.toBeInTheDocument();
  });

  it("allows approval when a nested contract is approved", () => {
    renderItem({ ...basePayment, contract: { status: "approved" } });

    expect(screen.getByRole("button", { name: /aprobar/i })).toBeEnabled();
  });

  it("does not gate non-reservation payments", () => {
    renderItem({
      ...basePayment,
      payment_type: "installment",
      contract_status: "pending",
    });

    expect(screen.getByRole("button", { name: /aprobar/i })).toBeEnabled();
  });
});
