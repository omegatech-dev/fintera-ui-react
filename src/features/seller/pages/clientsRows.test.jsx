import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import en from "../../../locales/en.json";
import SellerWorkspace from "./index";

expect.extend(matchers);

const getValue = (object, path) =>
  path.split(".").reduce((current, key) => current?.[key], object);

const t = (key, params = {}) => {
  const value = getValue(en, key) ?? key;
  return Object.entries(params).reduce(
    (text, [name, replacement]) =>
      text.replaceAll(`{${name}}`, String(replacement)),
    value
  );
};

const { showToast } = vi.hoisted(() => ({ showToast: vi.fn() }));

vi.mock("../api", () => ({
  sellerApi: {
    contracts: vi.fn(),
    listHistoricalSales: vi.fn(),
    validateHistoricalSale: vi.fn(),
    rejectHistoricalSale: vi.fn(),
  },
}));

vi.mock("@/features/contracts/api", () => ({
  contractsApi: { getByGuid: vi.fn() },
}));

vi.mock("@/features/payments/api", () => ({
  paymentsApi: { getStats: vi.fn(), uploadReceipt: vi.fn() },
}));

vi.mock("@/features/commissions/api", () => ({
  commissionsApi: { list: vi.fn() },
}));

vi.mock("@/shared/api/reports", () => ({
  reportsApi: { downloadUserBalancePDF: vi.fn() },
}));

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({ t, locale: "en" }),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({ showToast }),
}));

vi.mock("@/contexts/AuthContext", async () => {
  const { createContext } = await import("react");
  return {
    default: createContext({
      user: { id: 1, role: "admin" },
      loading: false,
    }),
  };
});

import { sellerApi } from "../api";
import { contractsApi } from "@/features/contracts/api";
import { paymentsApi } from "@/features/payments/api";
import { commissionsApi } from "@/features/commissions/api";

const contracts = [
  {
    guid: "contract-1",
    id: 16,
    applicant_user_id: 7,
    applicant_name: "Milton Perez",
    applicant_phone: "9999-0000",
    applicant_identity: "0801-1990-00001",
    amount: 500000,
    balance: 450000,
    status: "approved",
    project_name: "Altos del Valle",
    lot_name: "Lote 011",
    created_at: "2026-10-01T10:00:00Z",
  },
];

const historicalSales = [
  {
    id: 91,
    full_name: "Sergio Peralta",
    identity: "0801-1990-00003",
    phone: "7777-0000",
    project_name: "Altos del Valle",
    lot_label: "Lote 014",
    sale_price: 300000,
    sale_date: "2023-06-10",
    payment_mode: "financed",
    sale_status: "installments",
    validation_status: "pending",
  },
];

function renderWorkspace(path = "/vendedor/clientes") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SellerWorkspace />
    </MemoryRouter>
  );
}

beforeEach(() => {
  Object.values(sellerApi).forEach((mock) => mock.mockReset());
  contractsApi.getByGuid.mockReset();
  paymentsApi.getStats.mockReset();
  commissionsApi.list.mockReset();

  sellerApi.contracts.mockResolvedValue({ contracts });
  sellerApi.listHistoricalSales.mockResolvedValue({
    historical_sales: historicalSales,
  });
  sellerApi.validateHistoricalSale.mockResolvedValue({});
  sellerApi.rejectHistoricalSale.mockResolvedValue({});
  paymentsApi.getStats.mockResolvedValue({});
  commissionsApi.list.mockResolvedValue({ commissions: [] });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("historical rows in seller clients (21b)", () => {
  it("shows the HISTÓRICO chip, the sale label and no next payment", async () => {
    renderWorkspace();

    expect((await screen.findAllByText("Sergio Peralta")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("HISTORICAL").length).toBeGreaterThan(0);
    expect(
      screen.getAllByText("Sale 2023 · no contract").length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText("Historical · pending validation").length
    ).toBeGreaterThan(0);
    expect(screen.getByText("Next payment")).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /My clients\s*2/ })
    ).toBeInTheDocument();
  });

  it("does not count the historical sale as portfolio or as a reservation", async () => {
    renderWorkspace();

    await screen.findAllByText("Sergio Peralta");
    expect(screen.getAllByText("L 500,000").length).toBeGreaterThan(0);
    expect(screen.queryByText("L 800,000")).toBeNull();

    fireEvent.click(screen.getByRole("tab", { name: /Collections/ }));

    await screen.findAllByText("Milton Perez");
    expect(screen.queryByText("Sergio Peralta")).toBeNull();
    expect(contractsApi.getByGuid).not.toHaveBeenCalled();
  });

  it("lets an admin validate or reject a pending historical record", async () => {
    renderWorkspace();

    await screen.findAllByText("Sergio Peralta");
    fireEvent.click(screen.getByRole("button", { name: "Actions" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Validate" }));

    await waitFor(() =>
      expect(sellerApi.validateHistoricalSale).toHaveBeenCalledWith(91)
    );
    expect(showToast).toHaveBeenCalledWith(
      "Historical record validated.",
      "success"
    );

    fireEvent.click(screen.getByRole("button", { name: "Actions" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Reject" }));

    await waitFor(() =>
      expect(sellerApi.rejectHistoricalSale).toHaveBeenCalledWith(91)
    );
    expect(showToast).toHaveBeenCalledWith(
      "Historical record rejected.",
      "success"
    );
  });

  it("opens the CSV import sheet from the clients toolbar", async () => {
    renderWorkspace();

    await screen.findAllByText("Sergio Peralta");
    fireEvent.click(screen.getByRole("button", { name: "Import CSV" }));

    expect(
      await screen.findByRole("heading", {
        level: 2,
        name: "Import historical clients (CSV)",
      })
    ).toBeInTheDocument();
  });
});
