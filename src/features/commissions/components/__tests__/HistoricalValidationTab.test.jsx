import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import en from "../../../../locales/en.json";
import HistoricalValidationTab from "../HistoricalValidationTab";

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

vi.mock("@/features/seller/api", () => ({
  sellerApi: {
    listHistoricalSales: vi.fn(),
    listSellers: vi.fn(),
    validateHistoricalSale: vi.fn(),
    rejectHistoricalSale: vi.fn(),
    fetchHistoricalEvidence: vi.fn(),
    downloadHistoricalEvidence: vi.fn(),
  },
}));

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({ t, locale: "en" }),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({ showToast }),
}));

import { sellerApi } from "@/features/seller/api";

const pendingSale = {
  id: 91,
  full_name: "María López",
  client_identity: "0801-1990-12345",
  creator_name: "Cristofer Hernandez",
  sale_date: "2023-05-15",
  sale_price: 750000,
  rate: 6,
  commission_amount: 45000,
  evidence_file: "contrato.pdf",
  validation_status: "pending",
};

beforeEach(() => {
  sellerApi.listHistoricalSales.mockReset();
  sellerApi.listSellers.mockReset();
  sellerApi.validateHistoricalSale.mockReset();
  sellerApi.rejectHistoricalSale.mockReset();
  showToast.mockReset();

  sellerApi.listSellers.mockResolvedValue({
    sellers: [{ id: 1, full_name: "Cristofer Hernandez" }],
  });
  sellerApi.listHistoricalSales.mockImplementation(({ status, per_page }) => {
    if (per_page === 1) {
      const total = status === "pending" ? 1 : status === "validated" ? 2 : 0;
      return Promise.resolve({ pagination: { total } });
    }
    return Promise.resolve({
      historical_sales: status === "pending" ? [pendingSale] : [],
      pagination: { page: 1, per_page: 20, total: 1, total_pages: 1 },
    });
  });
  sellerApi.validateHistoricalSale.mockResolvedValue({});
  sellerApi.rejectHistoricalSale.mockResolvedValue({});
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("HistoricalValidationTab", () => {
  it("shows the queue, counts and row data", async () => {
    render(
      <MemoryRouter>
        <HistoricalValidationTab />
      </MemoryRouter>
    );

    expect(
      (await screen.findAllByText("María López")).length
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("Cristofer Hernandez").length).toBeGreaterThan(0);
    expect(
      screen.getAllByText("Pending validation").length
    ).toBeGreaterThan(0);
    expect(screen.queryAllByText("contrato.pdf")).toHaveLength(0);
    expect(
      screen.getAllByRole("button", { name: "View evidence" }).length
    ).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "Edit" }).length).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("button", { name: "Validate" }).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("button", { name: "Reject" }).length
    ).toBeGreaterThan(0);
  });

  it("opens the evidence viewer for rows with evidence", async () => {
    render(
      <MemoryRouter>
        <HistoricalValidationTab />
      </MemoryRouter>
    );

    await screen.findAllByText("María López");
    fireEvent.click(screen.getAllByRole("button", { name: "View evidence" })[0]);

    expect(
      await screen.findByRole("dialog", { name: "Client evidence" })
    ).toBeInTheDocument();
  });

  it("shows the no-evidence state for rows without evidence", async () => {
    sellerApi.listHistoricalSales.mockImplementation(({ per_page }) => {
      if (per_page === 1) {
        return Promise.resolve({ pagination: { total: 1 } });
      }
      return Promise.resolve({
        historical_sales: [
          { ...pendingSale, evidence_file: null },
        ],
        pagination: { page: 1, per_page: 20, total: 1, total_pages: 1 },
      });
    });

    render(
      <MemoryRouter>
        <HistoricalValidationTab />
      </MemoryRouter>
    );

    await screen.findAllByText("María López");
    expect(screen.queryByRole("button", { name: "View evidence" })).toBeNull();
    expect(
      screen.getAllByText("—").length
    ).toBeGreaterThan(0);
  });

  it("validates a pending record and refreshes the queue", async () => {
    render(
      <MemoryRouter>
        <HistoricalValidationTab />
      </MemoryRouter>
    );

    await screen.findAllByText("María López");
    fireEvent.click(screen.getAllByRole("button", { name: "Validate" })[0]);

    await waitFor(() =>
      expect(sellerApi.validateHistoricalSale).toHaveBeenCalledWith(91)
    );
    expect(showToast).toHaveBeenCalledWith(
      "Historical record validated.",
      "success"
    );
  });
});
