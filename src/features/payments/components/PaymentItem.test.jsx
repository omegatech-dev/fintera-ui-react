import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import PaymentItem, { PaymentDetailModal } from "./PaymentItem";

expect.extend(matchers);

const translations = {
  "payments.approve": "Aprobar",
  "payments.reject": "Rechazar",
  "payments.referenceNumber": "Número de referencia",
  "payments.payerAccount": "Cuenta de origen",
  "payments.reservationRequiresContract":
    "No se puede aprobar la reserva sin antes aprobar el contrato.",
};

vi.mock("../api", () => ({
  paymentsApi: {
    approve: vi.fn(),
    reject: vi.fn(),
    uploadReceipt: vi.fn(),
    downloadReceipt: vi.fn(() => Promise.resolve(new Blob())),
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
    renderItem({ ...basePayment, contract: { status: "pending" } });

    expect(screen.getByRole("button", { name: /aprobar/i })).toBeDisabled();
    expect(
      screen.getByText(translations["payments.reservationRequiresContract"])
    ).toBeInTheDocument();
  });

  it("allows approval when the contract is approved", () => {
    renderItem({ ...basePayment, contract: { status: "approved" } });

    expect(screen.getByRole("button", { name: /aprobar/i })).toBeEnabled();
    expect(
      screen.queryByText(translations["payments.reservationRequiresContract"])
    ).not.toBeInTheDocument();
  });

  it("does not gate non-reservation payments", () => {
    renderItem({
      ...basePayment,
      payment_type: "installment",
      contract: { status: "pending" },
    });

    expect(screen.getByRole("button", { name: /aprobar/i })).toBeEnabled();
  });
});

describe("PaymentItem receipt metadata", () => {
  afterEach(() => {
    cleanup();
  });

  const receiptPayment = {
    ...basePayment,
    contract: { status: "approved", currency: "HNL" },
    authorization_number: "REF-998877",
    payer_account_name: "BAC Credomatic ****1234",
  };

  it("shows the reference number and origin account in the approval modal", () => {
    renderItem(receiptPayment);

    fireEvent.click(screen.getByRole("button", { name: /aprobar/i }));

    expect(
      screen.getByText(translations["payments.referenceNumber"])
    ).toBeInTheDocument();
    expect(screen.getByText("REF-998877")).toBeInTheDocument();
    expect(
      screen.getByText(translations["payments.payerAccount"])
    ).toBeInTheDocument();
    expect(screen.getByText("BAC Credomatic ****1234")).toBeInTheDocument();
  });

  it("omits the reference number and origin account when they were not provided", () => {
    renderItem({ ...basePayment, contract: { status: "approved" } });

    fireEvent.click(screen.getByRole("button", { name: /aprobar/i }));

    expect(
      screen.queryByText(translations["payments.referenceNumber"])
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(translations["payments.payerAccount"])
    ).not.toBeInTheDocument();
  });

  it("shows the reference number and origin account in the detail modal", () => {
    render(<PaymentDetailModal payment={receiptPayment} onClose={vi.fn()} />);

    expect(
      screen.getByText(translations["payments.referenceNumber"])
    ).toBeInTheDocument();
    expect(screen.getByText("REF-998877")).toBeInTheDocument();
    expect(
      screen.getByText(translations["payments.payerAccount"])
    ).toBeInTheDocument();
    expect(screen.getByText("BAC Credomatic ****1234")).toBeInTheDocument();
  });

  it("omits the receipt metadata in the detail modal when not provided", () => {
    render(<PaymentDetailModal payment={basePayment} onClose={vi.fn()} />);

    expect(
      screen.queryByText(translations["payments.referenceNumber"])
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(translations["payments.payerAccount"])
    ).not.toBeInTheDocument();
  });
});
