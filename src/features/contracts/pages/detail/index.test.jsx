// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import AuthContext from "@/contexts/AuthContext";
import ContractDetail from "./index";
import { contractsApi } from "../../api";

expect.extend(matchers);

const contract = {
  id: 16,
  guid: "contract-guid",
  project_id: 1,
  lot_id: 2,
  status: "approved",
  amount: 400000,
  total_paid: 15000,
  balance: -385000,
  payment_term: 84,
  interest_rate: 0,
  financing_type: "direct",
  applicant_name: "Milton Perez",
  applicant_identity: "0506********999",
  applicant_phone: "3184-9999",
  lot_name: "Lote 011",
  project_name: "Residencial Costamar",
  payment_schedule: [
    {
      id: 1,
      status: "pending",
      description: "Cuota 1 de 84",
      due_date: "2026-12-10",
      amount: 3710,
      installment_number: 1,
    },
  ],
  ledger_entries: [],
};

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key }),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock("../../api", () => ({
  contractsApi: {
    getByGuid: vi.fn(),
    downloadPdf: vi.fn(),
    sendReminder: vi.fn(),
  },
}));

vi.mock("../../components/PaymentScheduleModal", () => ({
  default: () => <div>payment-schedule-modal</div>,
}));

vi.mock("../../components/ContractDetails/tabs/DocumentsTab", () => ({
  default: () => <div>documents-tab</div>,
}));

function renderDetail() {
  return render(
    <AuthContext.Provider value={{ user: { role: "admin" } }}>
      <MemoryRouter initialEntries={["/contracts/contract-guid"]}>
        <Routes>
          <Route path="/contracts/:guid" element={<ContractDetail />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  contractsApi.getByGuid.mockResolvedValue({ contract });
  contractsApi.downloadPdf.mockResolvedValue(new Blob(["pdf"]));
  contractsApi.sendReminder.mockResolvedValue({});
  window.URL.createObjectURL = vi.fn(() => "blob:contract");
  window.URL.revokeObjectURL = vi.fn();
  HTMLAnchorElement.prototype.click = vi.fn();
});

afterEach(() => {
  cleanup();
});

describe("ContractDetail actions", () => {
  it("downloads the contract PDF from the actions menu", async () => {
    renderDetail();
    await screen.findByText("contracts.contractNumber");

    fireEvent.click(screen.getByRole("button", { name: "common.actions" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "contracts.downloadPdf" }));

    await waitFor(() => {
      expect(contractsApi.downloadPdf).toHaveBeenCalledWith(16);
    });
  });

  it("sends a reminder from the actions menu", async () => {
    renderDetail();
    await screen.findByText("contracts.contractNumber");

    fireEvent.click(screen.getByRole("button", { name: "common.actions" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "contracts.sendReminder" }));

    await waitFor(() => {
      expect(contractsApi.sendReminder).toHaveBeenCalledWith("contract-guid");
    });
  });

  it("opens the payment schedule modal from the primary action", async () => {
    renderDetail();
    await screen.findByText("contracts.contractNumber");

    fireEvent.click(
      screen.getAllByRole("button", { name: "contracts.registerPayment" })[0]
    );

    expect(await screen.findByText("payment-schedule-modal")).toBeInTheDocument();
  });

  it("shows receipt reference, origin account and the view action in the schedule tab", async () => {
    contractsApi.getByGuid.mockResolvedValue({
      contract: {
        ...contract,
        payment_schedule: [
          {
            ...contract.payment_schedule[0],
            status: "paid",
            has_receipt: true,
            receipt_url: "/receipts/payment-1.jpg",
            is_pdf: false,
            authorization_number: "AUTH-778899",
            payer_account_name: "BAC Credomatic ****1234",
            paid_at: "2026-11-05",
          },
        ],
      },
    });
    renderDetail();
    await screen.findByText("contracts.contractNumber");

    fireEvent.click(screen.getByRole("tab", { name: "contracts.scheduleTab" }));

    const viewButtons = await screen.findAllByRole("button", {
      name: "paymentSchedule.viewReceipt",
    });
    expect(viewButtons.length).toBeGreaterThan(0);

    fireEvent.click(viewButtons[0]);

    expect(await screen.findByText("AUTH-778899")).toBeInTheDocument();
    expect(screen.getByText("BAC Credomatic ****1234")).toBeInTheDocument();
  });
});
