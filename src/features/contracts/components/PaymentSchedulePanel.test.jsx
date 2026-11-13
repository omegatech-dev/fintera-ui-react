import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import AuthContext from "@/contexts/AuthContext";
import PaymentSchedulePanel from "./PaymentSchedulePanel";

expect.extend(matchers);

const hookState = vi.hoisted(() => ({ config: {} }));

vi.mock("../hooks/useContractPayments", async () => {
  const React = await import("react");
  return {
    useContractPayments: () => {
      const [undoConfirmPaymentId, setUndoConfirmPaymentId] = React.useState(null);
      return {
        schedule: [],
        setSchedule: vi.fn(),
        loading: false,
        currentContract: null,
        ledgerEntries: [],
        undoLoadingPaymentId: null,
        error: null,
        loadContractData: vi.fn(),
        handlePaymentResponse: vi.fn(),
        handleUndoPayment: vi.fn().mockResolvedValue(undefined),
        ...hookState.config,
        undoConfirmPaymentId,
        setUndoConfirmPaymentId,
      };
    },
  };
});

vi.mock("./PaymentSchedule/ApplyPaymentModal", () => ({
  default: ({ isOpen, selectedPayment }) =>
    isOpen ? (
      <div data-testid="apply-modal">
        {selectedPayment?.isCapitalPayment ? "capital-payment" : "installment-payment"}
      </div>
    ) : null,
}));

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key }),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock("../../api", () => ({
  contractsApi: {
    updateMoratory: vi.fn().mockResolvedValue({ payment: { interest_amount: 10 } }),
  },
}));

const contract = {
  id: 16,
  project_id: 1,
  lot_id: 2,
  status: "approved",
  amount: 400000,
  payment_term: 84,
  interest_rate: 0,
};

const schedule = [
  {
    id: 1,
    status: "pending",
    description: "Cuota 1 de 84",
    due_date: "2026-12-10",
    amount: 1500,
    installment_number: 1,
  },
  {
    id: 2,
    status: "pending",
    description: "Cuota 2 de 84",
    due_date: "2026-10-01",
    amount: 1500,
    interest_amount: 50,
    installment_number: 2,
  },
  {
    id: 3,
    status: "paid",
    description: "Cuota 3 de 84",
    due_date: "2026-09-01",
    amount: 1500,
    paid_amount: 1500,
    has_receipt: true,
    receipt_url: "/receipts/payment-3.jpg",
    installment_number: 3,
  },
];

const baseConfig = (overrides = {}) => ({
  schedule,
  currentContract: contract,
  handleUndoPayment: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

function renderPanel({ role = "admin", config = baseConfig(), props = {} } = {}) {
  hookState.config = config;
  return render(
    <AuthContext.Provider value={{ user: { role } }}>
      <PaymentSchedulePanel contract={contract} {...props} />
    </AuthContext.Provider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  hookState.config = baseConfig();
  window.URL.createObjectURL = vi.fn(() => "blob:receipt");
  window.URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  cleanup();
});

describe("PaymentSchedulePanel operations", () => {
  it("shows apply, capital repayment, secondary row actions and receipt", () => {
    renderPanel();

    expect(
      screen.getAllByRole("button", { name: "paymentSchedule.applyPayment" })
    ).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: "contracts.capitalPayment" })
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "common.actions" }).length
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: "paymentSchedule.viewReceipt" })
    ).toBeInTheDocument();
  });

  it("opens the moratory editor for overdue installments", async () => {
    renderPanel();

    fireEvent.click(screen.getAllByRole("button", { name: "common.actions" })[0]);
    fireEvent.click(screen.getByRole("menuitem", { name: "paymentSchedule.editMoratory" }));

    expect(
      await screen.findByRole("heading", { name: "contracts.editMoratory" })
    ).toBeInTheDocument();
  });

  it("confirms before reverting a paid installment and refreshes the contract", async () => {
    const onChanged = vi.fn();
    const config = baseConfig({
      handleUndoPayment: vi.fn(async (_paymentId, done) => done?.()),
    });
    renderPanel({ config, props: { onChanged } });

    fireEvent.click(screen.getAllByRole("button", { name: "common.actions" })[1]);
    fireEvent.click(screen.getByRole("menuitem", { name: "paymentSchedule.undoPayment" }));

    expect(
      await screen.findByRole("heading", { name: "paymentSchedule.undoConfirmTitle" })
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "paymentSchedule.undoPayment" })
    );

    await waitFor(() => {
      expect(config.handleUndoPayment).toHaveBeenCalledWith(3, expect.any(Function));
    });
    expect(onChanged).toHaveBeenCalled();
  });

  it("opens the capital repayment flow from the schedule footer", () => {
    renderPanel();

    fireEvent.click(screen.getByRole("button", { name: "contracts.capitalPayment" }));

    expect(screen.getByTestId("apply-modal")).toHaveTextContent("capital-payment");
  });

  it("opens the next pending installment payment on demand", async () => {
    renderPanel({ props: { openNextPaymentToken: 1 } });

    expect(await screen.findByTestId("apply-modal")).toHaveTextContent(
      "installment-payment"
    );
  });

  it("keeps seller sessions read-only while keeping receipts available", () => {
    renderPanel({ role: "seller" });

    expect(
      screen.queryByRole("button", { name: "paymentSchedule.applyPayment" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "contracts.capitalPayment" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "common.actions" })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "paymentSchedule.viewReceipt" })
    ).toBeInTheDocument();
    expect(screen.getByText("contracts.readOnlyNotice")).toBeInTheDocument();
  });

  it("keeps closed contracts read-only", () => {
    renderPanel({
      config: baseConfig({
        currentContract: { ...contract, status: "closed" },
      }),
    });

    expect(
      screen.queryByRole("button", { name: "paymentSchedule.applyPayment" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "contracts.capitalPayment" })
    ).not.toBeInTheDocument();
  });

  it("shows an error state with retry when the schedule cannot load", () => {
    const loadContractData = vi.fn();
    renderPanel({
      config: baseConfig({
        schedule: [],
        error: "network",
        loadContractData,
      }),
    });

    expect(screen.getByRole("alert")).toHaveTextContent("paymentSchedule.loadError");
    fireEvent.click(screen.getByRole("button", { name: /reintentar/i }));
    expect(loadContractData).toHaveBeenCalled();
  });
});
