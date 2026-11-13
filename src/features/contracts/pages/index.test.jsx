import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import AuthContext from "@/contexts/AuthContext";
import ContractsPage from "./index";
import { contractsApi } from "../api";

expect.extend(matchers);

const { showToast } = vi.hoisted(() => ({ showToast: vi.fn() }));

vi.mock("../api", () => ({
  contractsApi: {
    list: vi.fn(),
    getStats: vi.fn(),
    approve: vi.fn(),
    reject: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key, locale: "en" }),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({ showToast }),
}));

vi.mock("@/hooks/useDebounce", () => ({
  default: (value) => value,
}));

const pendingContract = {
  id: 21,
  guid: "pending-guid",
  project_id: 3,
  lot_id: 18,
  status: "pending",
  applicant_name: "Milton Perez",
  applicant_identity: "0801-1990-00001",
  lot_name: "Lote 008",
  project_name: "Residencial Costamar",
  financing_type: "direct",
  balance: -400000,
  created_at: "2026-11-01T10:00:00Z",
  next_payment: {
    id: 88,
    amount: 50000,
    due_date: "2026-11-20T00:00:00Z",
    payment_type: "reservation",
    label: "Reserva",
    status: "pending",
  },
};

const renderPage = () =>
  render(
    <AuthContext.Provider value={{ user: { role: "admin" } }}>
      <MemoryRouter initialEntries={["/contracts"]}>
        <ContractsPage />
      </MemoryRouter>
    </AuthContext.Provider>
  );

beforeEach(() => {
  contractsApi.list.mockReset();
  contractsApi.getStats.mockReset();
  contractsApi.approve.mockReset();
  showToast.mockReset();

  contractsApi.list.mockResolvedValue({
    contracts: [pendingContract],
    pagination: { page: 1, per_page: 12, total: 1, total_pages: 1 },
  });
  contractsApi.getStats.mockResolvedValue({
    total: 1,
    pending: 1,
    approved: 0,
    rejected: 0,
    cancelled: 0,
    active: 0,
  });
  contractsApi.approve.mockResolvedValue({ contract: pendingContract });
});

afterEach(cleanup);

describe("Contracts list approval", () => {
  it("exposes approve as a direct row action and refreshes on success", async () => {
    renderPage();

    const approveButtons = await screen.findAllByRole("button", {
      name: "contracts.approve",
    });
    expect(approveButtons.length).toBeGreaterThan(0);

    fireEvent.click(approveButtons[0]);

    await waitFor(() => {
      expect(contractsApi.approve).toHaveBeenCalledWith(3, 18, 21);
    });
    expect(showToast).toHaveBeenCalledWith("contracts.approvedSuccess", "success");
    await waitFor(() => {
      expect(contractsApi.list).toHaveBeenCalledTimes(2);
    });
  });

  it("shows the next collection amount instead of the contract balance", async () => {
    renderPage();

    expect(await screen.findAllByText("L 50,000")).not.toHaveLength(0);
    expect(screen.getByText("contracts.nextPayment")).toBeInTheDocument();
  });

  it("shows an error toast when the approval fails", async () => {
    contractsApi.approve.mockRejectedValueOnce(
      new Error("cannot approve contract")
    );
    renderPage();

    const approveButtons = await screen.findAllByRole("button", {
      name: "contracts.approve",
    });
    fireEvent.click(approveButtons[0]);

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        "contracts.approveError cannot approve contract",
        "error"
      );
    });
  });
});
