import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import PaymentRow from "./PaymentRow";

expect.extend(matchers);

const paymentsApi = vi.hoisted(() => ({
  downloadReceipt: vi.fn(),
}));

vi.mock("@/features/payments/api", () => ({ paymentsApi }));

const t = (key) => key;
const fmt = (value) => `L ${value}`;
const noop = () => {};

const baseRow = {
  id: 7,
  number: 3,
  status: "paid",
  description: "Cuota 3 de 12",
  due_date: "2026-12-10",
  amount: 1500,
  payment_type: "installment",
  has_receipt: true,
  receipt_url: "/receipts/payment-7.jpg",
  is_pdf: false,
  authorization_number: "AUTH-998877",
  payer_account_name: "BAC Credomatic ****1234",
  paid_at: "2026-11-01",
  approved_at: "2026-11-02",
};

function renderRow(row = baseRow, overrides = {}) {
  return render(
    <PaymentRow
      row={row}
      idx={2}
      fmt={fmt}
      t={t}
      translatePaymentType={() => "Cuota"}
      calculateMoratoryDays={() => 0}
      setSelectedPayment={noop}
      setApplyPaymentModal={noop}
      setEditingMora={noop}
      setMoratoryAmount={noop}
      onUndoPayment={noop}
      undoLoadingPaymentId={null}
      isReadOnly={false}
      {...overrides}
    />
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  paymentsApi.downloadReceipt.mockResolvedValue(
    new Blob(["receipt"], { type: "image/jpeg" })
  );
  window.URL.createObjectURL = vi.fn(() => "blob:receipt");
  window.URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  cleanup();
});

describe("PaymentRow cancelled status", () => {
  it("shows the cancelled chip and no payment actions", () => {
    renderRow(
      { ...baseRow, status: "cancelled", due_date: "2025-01-10" },
      { calculateMoratoryDays: () => 30 }
    );

    expect(screen.getByText("paymentSchedule.cancelled")).toBeInTheDocument();
    expect(
      screen.queryByTitle("paymentSchedule.applyPayment")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTitle("paymentSchedule.editMoratory")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "common.actions" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "paymentSchedule.viewReceipt" })
    ).not.toBeInTheDocument();
  });
});

describe("PaymentRow receipts", () => {
  it("shows the reference, origin account and payment dates in the receipt panel", async () => {
    renderRow();

    fireEvent.click(
      screen.getByRole("button", { name: "paymentSchedule.viewReceipt" })
    );

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(await screen.findByText("AUTH-998877")).toBeInTheDocument();
    expect(screen.getByText("BAC Credomatic ****1234")).toBeInTheDocument();
    expect(screen.getByText("paymentSchedule.paymentDate")).toBeInTheDocument();
    expect(screen.getByText("paymentSchedule.approved")).toBeInTheDocument();
  });

  it("flags PDF receipts inside the panel", async () => {
    renderRow({ ...baseRow, is_pdf: true });

    fireEvent.click(
      screen.getByRole("button", { name: "paymentSchedule.viewReceipt" })
    );

    expect(
      await screen.findByTitle("paymentSchedule.receiptPdf")
    ).toBeInTheDocument();
  });

  it("keeps the row clean when there is no receipt", () => {
    renderRow({ ...baseRow, status: "pending", has_receipt: false, receipt_url: null });

    expect(
      screen.queryByRole("button", { name: "paymentSchedule.viewReceipt" })
    ).not.toBeInTheDocument();
    expect(screen.queryByText("paymentSchedule.noReceipt")).not.toBeInTheDocument();
  });

  it("downloads the receipt and previews it in a dialog", async () => {
    renderRow();

    fireEvent.click(
      screen.getByRole("button", { name: "paymentSchedule.viewReceipt" })
    );

    await waitFor(() => {
      expect(paymentsApi.downloadReceipt).toHaveBeenCalledWith(7);
    });

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(
      await screen.findByRole("img", { name: "paymentSchedule.receipt" })
    ).toHaveAttribute("src", "blob:receipt");

    fireEvent.click(
      screen.getAllByRole("button", { name: "common.close" })[0]
    );

    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith("blob:receipt");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps the receipt action in read-only mode but hides installment editing", () => {
    renderRow({ ...baseRow, status: "pending" }, { isReadOnly: true });

    expect(
      screen.getByRole("button", { name: "paymentSchedule.viewReceipt" })
    ).toBeInTheDocument();
    expect(
      screen.queryByTitle("paymentSchedule.applyPayment")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTitle("paymentSchedule.editMoratory")
    ).not.toBeInTheDocument();
  });

  it("keeps a responsive table row with the receipt action", () => {
    const { container } = renderRow();
    const row = container.firstChild;

    expect(row).toHaveClass("grid");
    expect(row).toHaveClass("border-b");
    expect(row.className).toContain("md:grid-cols-");
    expect(
      screen.getByRole("button", { name: "paymentSchedule.viewReceipt" })
    ).toBeInTheDocument();
  });
});
