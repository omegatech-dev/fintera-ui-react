// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import AuthContext from "@/contexts/AuthContext";
import ContractDetail from "./index";
import { contractsApi } from "../../api";
import { projectsApi } from "@/features/projects/api";

expect.extend(matchers);

const baseContract = {
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
  lot_area: 300,
  lot_width: 10,
  lot_length: 30,
  lot_measurement_unit: "m2",
  lot_price: 380000,
  lot_status: "financed",
  lot_address: "Calle Principal, Sector Norte",
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

const lotDetails = {
  id: 2,
  project_name: "Residencial Costamar",
  name: "Lote 011",
  status: "financed",
  width: 10,
  length: 30,
  measurement_unit: "m2",
  area: 300,
  price: 380000,
};

const contract = { ...baseContract };

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key }),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock("../../api", () => ({
  contractsApi: {
    getByGuid: vi.fn(),
    getDetails: vi.fn(),
    downloadPdf: vi.fn(),
    sendReminder: vi.fn(),
  },
}));

vi.mock("@/features/projects/api", () => ({
  projectsApi: {
    getLot: vi.fn(),
  },
}));

vi.mock("../../components/ContractDetails/tabs/DocumentsTab", () => ({
  default: () => <div>documents-tab</div>,
}));

function renderDetail({ role = "admin", value = contract } = {}) {
  contractsApi.getByGuid.mockResolvedValue({ contract: value });
  contractsApi.getDetails.mockResolvedValue({ contract: value });
  return render(
    <AuthContext.Provider value={{ user: { role } }}>
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
  contractsApi.getDetails.mockResolvedValue({ contract });
  contractsApi.downloadPdf.mockResolvedValue(new Blob(["pdf"]));
  contractsApi.sendReminder.mockResolvedValue({});
  projectsApi.getLot.mockResolvedValue({ lot: lotDetails });
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

  it("keeps a single primary CTA that opens the next pending installment", async () => {
    renderDetail();
    await screen.findByText("contracts.contractNumber");

    const primaryActions = screen.getAllByRole("button", {
      name: "contracts.registerPayment",
    });
    expect(primaryActions).toHaveLength(1);

    fireEvent.click(primaryActions[0]);

    expect(
      await screen.findByRole("heading", { name: "contracts.applyPayment" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "contracts.registerPayment" })).not.toBeInTheDocument();
  });

  it("hides the global CTA on the schedule and exposes row and panel actions", async () => {
    renderDetail();
    await screen.findByText("contracts.contractNumber");

    fireEvent.click(screen.getByRole("tab", { name: "contracts.scheduleTab" }));

    expect(
      await screen.findByRole("button", { name: "paymentSchedule.applyPayment" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "contracts.capitalPayment" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "contracts.registerPayment" })
    ).not.toBeInTheDocument();
  });

  it("shows receipt reference, origin account and the view action in the schedule tab", async () => {
    const paidContract = {
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
    };
    renderDetail({ value: paidContract });
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

  it("keeps the schedule read-only for sellers while allowing receipt review", async () => {
    const pendingWithReceipt = {
      ...contract,
      payment_schedule: [
        {
          ...contract.payment_schedule[0],
          has_receipt: true,
          receipt_url: "/receipts/payment-1.jpg",
        },
      ],
    };
    renderDetail({ role: "seller", value: pendingWithReceipt });
    await screen.findByText("contracts.contractNumber");

    expect(
      screen.queryByRole("button", { name: "contracts.registerPayment" })
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "contracts.scheduleTab" }));

    expect(
      await screen.findByRole("button", { name: "paymentSchedule.viewReceipt" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "paymentSchedule.applyPayment" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "contracts.capitalPayment" })
    ).not.toBeInTheDocument();
  });

  it("renders the lot card with project, area, dimensions, price and status", async () => {
    renderDetail();
    await screen.findByText("contracts.contractNumber");

    expect(screen.getByText("contracts.lotCard")).toBeInTheDocument();
    expect(screen.getByText("Lote 011")).toBeInTheDocument();
    expect(screen.getByText("Residencial Costamar")).toBeInTheDocument();
    expect(screen.getByText("300 m²")).toBeInTheDocument();
    expect(screen.getByText("10 × 30 m")).toBeInTheDocument();
    expect(screen.getByText("L 380,000")).toBeInTheDocument();
    expect(screen.getByText("financed")).toBeInTheDocument();
    expect(screen.getByText("Calle Principal, Sector Norte")).toBeInTheDocument();
  });

  it("opens the lot detail sheet from the contract without leaving the page", async () => {
    renderDetail();
    await screen.findByText("contracts.contractNumber");

    fireEvent.click(screen.getByRole("button", { name: "contracts.viewLotShort" }));

    await waitFor(() => {
      expect(projectsApi.getLot).toHaveBeenCalledWith(1, 2);
    });
    expect(
      await screen.findByRole("heading", { name: "projects.lotDetails" })
    ).toBeInTheDocument();
  });
});
