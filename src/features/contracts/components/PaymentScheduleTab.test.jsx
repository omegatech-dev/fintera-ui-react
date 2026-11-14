import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

import PaymentScheduleTab from "./PaymentScheduleTab";

expect.extend(matchers);

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key }),
}));

const noop = () => {};

const calculateMoratoryDays = (dueDate) =>
  dueDate && new Date(dueDate) < new Date("2026-11-01") ? 10 : 0;

const renderTab = (schedule) =>
  render(
    <PaymentScheduleTab
      loading={false}
      schedule={schedule}
      totals={{ subtotal: 0, totalInterest: 0, total: 0 }}
      isReadOnly={false}
      fmt={(value) => `L ${value}`}
      translatePaymentType={() => "Cuota"}
      calculateMoratoryDays={calculateMoratoryDays}
      setSelectedPayment={noop}
      setApplyPaymentModal={noop}
      setEditingMora={noop}
      setMoratoryAmount={noop}
      onEditMoratory={noop}
      onUndoPayment={noop}
      undoLoadingPaymentId={null}
    />
  );

afterEach(() => {
  cleanup();
});

describe("PaymentScheduleTab cancelled rows", () => {
  it("excludes cancelled payments from the progress and overdue counters", () => {
    const { container } = renderTab([
      {
        id: 1,
        status: "paid",
        description: "Cuota 1",
        due_date: "2026-01-10",
        amount: 1000,
        paid_amount: 1000,
      },
      {
        id: 2,
        status: "pending",
        description: "Cuota 2",
        due_date: "2026-12-10",
        amount: 1000,
      },
      {
        id: 3,
        status: "cancelled",
        description: "Cuota 3",
        due_date: "2026-01-10",
        amount: 1000,
      },
    ]);

    expect(screen.getByText("/ 2")).toBeInTheDocument();
    expect(screen.getByText("paymentSchedule.cancelled")).toBeInTheDocument();

    const overdueValue = screen.getByText(
      "paymentSchedule.overdue"
    ).nextElementSibling;
    expect(overdueValue).toHaveTextContent("0");

    const remainingValue = screen.getByText(
      "paymentSchedule.remaining"
    ).nextElementSibling;
    expect(remainingValue).toHaveTextContent("1");

    const progress = container.querySelector('[style*="width"]');
    expect(progress.style.width).toBe("50%");
  });

  it("shows an empty progress when every payment is cancelled", () => {
    renderTab([
      {
        id: 1,
        status: "cancelled",
        description: "Cuota 1",
        due_date: "2026-01-10",
        amount: 1000,
      },
      {
        id: 2,
        status: "cancelled",
        description: "Cuota 2",
        due_date: "2026-02-10",
        amount: 1000,
      },
    ]);

    expect(screen.getByText("/ 0")).toBeInTheDocument();

    const remainingValue = screen.getByText(
      "paymentSchedule.remaining"
    ).nextElementSibling;
    expect(remainingValue).toHaveTextContent("0");
  });
});
