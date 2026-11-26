import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import en from "../../../locales/en.json";
import Commissions from "./index";
import { commissionsApi } from "../api";
import { sellerApi } from "@/features/seller/api";
import { confirmDialog } from "@/shared/ui/ConfirmProvider";

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
  commissionsApi: {
    list: vi.fn(),
    markPaid: vi.fn(),
    previewPayout: vi.fn(),
    download: vi.fn(),
  },
}));

vi.mock("@/features/seller/api", () => ({
  sellerApi: {
    listHistoricalSales: vi.fn(),
  },
}));

vi.mock("@/contexts/AuthContext", async () => {
  const { createContext } = await import("react");
  return { default: createContext({ user: { role: "admin" } }) };
});

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({ t, locale: "en" }),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({ showToast }),
}));

vi.mock("@/shared/ui/ConfirmProvider", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, confirmDialog: vi.fn() };
});

const commissions = [
  {
    contract_id: 16,
    contract_guid: "contract-1",
    client_name: "Milton Perez",
    project: "Altos del Valle",
    lot: "Lote 011",
    seller: "Ana Vendedora",
    amount: 500000,
    commission: 25000,
    commission_paid_at: null,
    date: "2026-11-01T00:00:00Z",
  },
  {
    contract_id: 17,
    contract_guid: "contract-2",
    client_name: "Antonio Lopez",
    project: "Altos del Valle",
    lot: "Lote 012",
    seller: "Ana Vendedora",
    amount: 400000,
    commission: 20000,
    commission_paid_at: "2026-11-05T00:00:00Z",
    date: "2026-11-02T00:00:00Z",
  },
];

const credits = [
  {
    id: 9,
    seller: "Ana Vendedora",
    contract_id: 16,
    contract_guid: "contract-1",
    amount: 25000,
    applied_amount: 10000,
    remaining_amount: 15000,
    source: "cancellation",
    applications_total: 1,
    applications: [
      {
        id: 21,
        credit_id: 9,
        applied_contract_id: 22,
        applied_contract_guid: "contract-2",
        amount: 10000,
      },
    ],
    status: "pending",
    created_at: "2026-11-10T00:00:00Z",
  },
];

const buildResponse = (overrides = {}) => ({
  commissions,
  pagination: { page: 1, per_page: 20, total: 2, total_pages: 1 },
  totals: {
    commission: 45000,
    amount: 900000,
    paid: 20000,
    pending: 25000,
    paid_count: 1,
    average_rate: 5,
    net_pending: 0,
  },
  sellers: [{ id: 3, name: "Ana Vendedora" }],
  credits,
  credits_pagination: { page: 1, per_page: 20, total: 1, total_pages: 1 },
  pending_credits: 15000,
  seller_balance: 15000,
  net_pending: 0,
  ...overrides,
});

const sellerSelect = () =>
  screen
    .getAllByRole("combobox")
    .find((element) => element.textContent.includes("All sellers"));

const lastNextButton = () =>
  screen.getAllByRole("button", { name: "Next page" }).at(-1);

beforeEach(() => {
  commissionsApi.list.mockReset();
  commissionsApi.markPaid.mockReset();
  commissionsApi.previewPayout.mockReset();
  commissionsApi.download.mockReset();
  sellerApi.listHistoricalSales.mockReset();
  confirmDialog.mockReset();
  showToast.mockReset();

  commissionsApi.list.mockResolvedValue(buildResponse());
  commissionsApi.previewPayout.mockResolvedValue({
    enabled: true,
    commission: 25000,
    available_credit: 15000,
    applicable: 15000,
    net_cash: 10000,
    remaining_credit: 0,
  });
  sellerApi.listHistoricalSales.mockResolvedValue({ pagination: { total: 0 } });
  confirmDialog.mockResolvedValue(true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Admin commissions credits", () => {
  it("shows seller balance and traceable credit applications without manual apply", async () => {
    render(<MemoryRouter><Commissions /></MemoryRouter>);

    expect(await screen.findByText("Commission credits")).toBeInTheDocument();
    expect(screen.getByText("Seller credit balance")).toBeInTheDocument();
    expect(screen.getByText("Outstanding credits across all commissions")).toBeInTheDocument();
    expect(screen.getAllByText("Applied to commissions").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Cancellation").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Ana Vendedora").length).toBeGreaterThan(0);
    expect(screen.getAllByText("#16").length).toBeGreaterThan(0);
    expect(screen.getAllByText("L 25,000").length).toBeGreaterThan(0);
    expect(screen.getAllByText("L 15,000").length).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: "#22" })[0]
    ).toHaveAttribute("href", "/contracts/contract-2");
    expect(
      screen.queryByRole("button", { name: "Apply credit" })
    ).not.toBeInTheDocument();
  });

  it("uses the global seller balance instead of netting against period totals", async () => {
    commissionsApi.list.mockResolvedValue(
      buildResponse({ seller_balance: 40000, pending_credits: 40000, net_pending: -15000 })
    );

    render(<MemoryRouter><Commissions /></MemoryRouter>);

    expect(await screen.findByText("L 40,000")).toBeInTheDocument();
    expect(screen.queryByText("L -15,000")).not.toBeInTheDocument();
    expect(screen.queryByText("Net payable")).not.toBeInTheDocument();
  });

  it("pages the credits card and requests the second page", async () => {
    commissionsApi.list.mockImplementation(async (_start, _end, options = {}) =>
      buildResponse({
        credits:
          options.creditsPage === 2
            ? [{ ...credits[0], id: 10, contract_id: 99 }]
            : credits,
        credits_pagination: {
          page: options.creditsPage || 1,
          per_page: 20,
          total: 25,
          total_pages: 2,
        },
      })
    );

    render(<MemoryRouter><Commissions /></MemoryRouter>);

    await screen.findAllByRole("button", { name: "Next page" });
    fireEvent.click(screen.getAllByRole("button", { name: "Next page" })[0]);

    await waitFor(() =>
      expect(commissionsApi.list).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({ creditsPage: 2, creditsPerPage: 20 })
      )
    );
    expect(await screen.findByText("#99")).toBeInTheDocument();
  });
});

describe("Admin commissions list", () => {
  it("shows the credit adjustment for commissions paid with seller credit", async () => {
    commissionsApi.list.mockResolvedValue(
      buildResponse({
        commissions: commissions.map((row) =>
          row.contract_id === 17 ? { ...row, credit_applied: 13800 } : row
        ),
      })
    );

    render(<MemoryRouter><Commissions /></MemoryRouter>);

    const adjustments = await screen.findAllByText(/Credit adjustment/);
    expect(adjustments.length).toBeGreaterThan(0);
    for (const adjustment of adjustments) {
      expect(adjustment.textContent).toContain("L 13,800");
      expect(adjustment.textContent).toContain("L 6,200");
    }
    expect(
      screen.queryByText("Credit adjustment: −L 16,800 · Cash: L 3,200")
    ).not.toBeInTheDocument();
  });


  it("requests the first page of 20 commissions", async () => {
    render(<MemoryRouter><Commissions /></MemoryRouter>);

    await screen.findByText("Commission credits");
    expect(commissionsApi.list).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({ page: 1, perPage: 20, creditsPerPage: 20 })
    );
  });

  it("shows the range and moves to the next page", async () => {
    commissionsApi.list.mockImplementation(async (_start, _end, options = {}) =>
      buildResponse({
        pagination: {
          page: options.page || 1,
          per_page: 20,
          total: 25,
          total_pages: 2,
        },
      })
    );

    render(<MemoryRouter><Commissions /></MemoryRouter>);

    expect(await screen.findByText("Showing 1–20 of 25")).toBeInTheDocument();
    fireEvent.click(lastNextButton());

    await waitFor(() =>
      expect(commissionsApi.list).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({ page: 2, perPage: 20 })
      )
    );
    expect(await screen.findByText("Showing 21–25 of 25")).toBeInTheDocument();
  });

  it("returns to page 1 when the seller changes", async () => {
    commissionsApi.list.mockImplementation(async (_start, _end, options = {}) =>
      buildResponse({
        pagination: {
          page: options.page || 1,
          per_page: 20,
          total: 45,
          total_pages: 3,
        },
      })
    );

    render(<MemoryRouter><Commissions /></MemoryRouter>);

    await screen.findByText("Showing 1–20 of 45");
    fireEvent.click(lastNextButton());
    await screen.findByText("Showing 21–40 of 45");

    fireEvent.change(sellerSelect(), { target: { value: "3" } });

    await waitFor(() =>
      expect(commissionsApi.list).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({ page: 1, sellerId: "3" })
      )
    );
  });

  it("lists every seller from the server, not only the sellers on this page", async () => {
    commissionsApi.list.mockResolvedValue(
      buildResponse({
        sellers: [
          { id: 3, name: "Ana Vendedora" },
          { id: 8, name: "Carlos Vendedor" },
        ],
      })
    );

    render(<MemoryRouter><Commissions /></MemoryRouter>);

    expect(
      await screen.findByRole("option", { name: "Carlos Vendedor" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Ana Vendedora" })
    ).toBeInTheDocument();
  });

  it("sends the selected seller id to the server", async () => {
    render(<MemoryRouter><Commissions /></MemoryRouter>);

    await screen.findByRole("option", { name: "Ana Vendedora" });
    fireEvent.change(sellerSelect(), { target: { value: "3" } });

    await waitFor(() =>
      expect(commissionsApi.list).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({ sellerId: "3" })
      )
    );
  });

  it("clears the seller filter when that seller leaves the period", async () => {
    commissionsApi.list.mockImplementation(async (start, _end, _options = {}) => {
      if (start === "2026-12-01") {
        return buildResponse({
          commissions: [],
          sellers: [],
          pagination: { page: 1, per_page: 20, total: 0, total_pages: 0 },
          credits: [],
          credits_pagination: { page: 1, per_page: 20, total: 0, total_pages: 0 },
          pending_credits: 0,
          net_pending: 0,
        });
      }
      return buildResponse();
    });

    render(<MemoryRouter><Commissions /></MemoryRouter>);

    await screen.findByRole("option", { name: "Ana Vendedora" });
    fireEvent.change(sellerSelect(), { target: { value: "3" } });
    await waitFor(() =>
      expect(commissionsApi.list).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({ sellerId: "3" })
      )
    );

    const [startDate, endDate] = document.querySelectorAll('input[type="date"]');
    fireEvent.change(startDate, { target: { value: "2026-12-01" } });
    fireEvent.change(endDate, { target: { value: "2026-12-31" } });

    await waitFor(() => {
      const lastOptions = commissionsApi.list.mock.calls.at(-1)[2];
      expect(lastOptions.sellerId).toBeFalsy();
    });
    expect(
      await screen.findByText(/All sellers .* 0 commissions/)
    ).toBeInTheDocument();
  });

  it("shows the server average rate as a KPI", async () => {
    commissionsApi.list.mockResolvedValue(
      buildResponse({
        totals: {
          commission: 12345,
          amount: 1000000,
          paid: 0,
          pending: 12345,
          paid_count: 0,
          average_rate: 1.2345,
          net_pending: 12345,
        },
      })
    );

    render(<MemoryRouter><Commissions /></MemoryRouter>);

    expect(await screen.findByText("Average rate 1.2%")).toBeInTheDocument();
  });

  it("refreshes the page after marking a commission as paid", async () => {
    commissionsApi.markPaid.mockResolvedValue({});

    render(<MemoryRouter><Commissions /></MemoryRouter>);

    fireEvent.click((await screen.findAllByRole("button", { name: "Pay" }))[0]);

    await waitFor(() =>
      expect(commissionsApi.previewPayout).toHaveBeenCalledWith("contract-1")
    );
    await waitFor(() =>
      expect(commissionsApi.markPaid).toHaveBeenCalledWith("contract-1")
    );
    await waitFor(() => expect(commissionsApi.list).toHaveBeenCalledTimes(2));
  });

  it("shows preview amounts and the final server payout breakdown", async () => {
    let confirmationDescription;
    confirmDialog.mockImplementation(async (options) => {
      confirmationDescription = options.description;
      return true;
    });
    commissionsApi.markPaid.mockResolvedValue({
      payout: {
        commission: 25000,
        applied_total: 8000,
        net_cash: 17000,
        remaining_credit: 7000,
        applications: [
          {
            id: 31,
            credit_id: 9,
            applied_contract_id: 16,
            applied_contract_guid: "commission-guid-16",
            amount: 8000,
          },
        ],
      },
    });

    render(<MemoryRouter><Commissions /></MemoryRouter>);
    fireEvent.click((await screen.findAllByRole("button", { name: "Pay" }))[0]);

    await waitFor(() => expect(commissionsApi.markPaid).toHaveBeenCalled());
    const preview = render(confirmationDescription);
    expect(preview.container.textContent).toContain("Gross commission");
    expect(preview.container.textContent).toContain("L 15,000");
    expect(preview.container.textContent).toContain("L 10,000");

    expect(await screen.findByText("Commission payout details")).toBeInTheDocument();
    expect(screen.getAllByText("L 8,000").length).toBeGreaterThan(0);
    expect(screen.getByText("L 17,000")).toBeInTheDocument();
    expect(screen.getByText("L 7,000")).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: "#16" })[1]
    ).toHaveAttribute("href", "/contracts/commission-guid-16");
  });

  it("uses a gross-only confirmation when backend netting is disabled", async () => {
    commissionsApi.previewPayout.mockResolvedValue({
      enabled: false,
      commission: 25000,
      available_credit: 0,
      applicable: 0,
      net_cash: 25000,
      remaining_credit: 0,
    });
    commissionsApi.markPaid.mockResolvedValue({});

    render(<MemoryRouter><Commissions /></MemoryRouter>);
    fireEvent.click((await screen.findAllByRole("button", { name: "Pay" }))[0]);

    await waitFor(() => expect(commissionsApi.markPaid).toHaveBeenCalled());
    expect(confirmDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        description: expect.stringContaining("25,000"),
      })
    );
  });

  it("blocks payout confirmation when preview fails", async () => {
    commissionsApi.previewPayout.mockRejectedValue(new Error("preview unavailable"));

    render(<MemoryRouter><Commissions /></MemoryRouter>);
    fireEvent.click((await screen.findAllByRole("button", { name: "Pay" }))[0]);

    await waitFor(() =>
      expect(showToast).toHaveBeenCalledWith("preview unavailable", "error")
    );
    expect(confirmDialog).not.toHaveBeenCalled();
    expect(commissionsApi.markPaid).not.toHaveBeenCalled();
  });
});

describe("Commissions export formats", () => {
  const originalCreateObjectURL = window.URL.createObjectURL;
  const originalRevokeObjectURL = window.URL.revokeObjectURL;

  beforeEach(() => {
    window.URL.createObjectURL = vi.fn(() => "blob:commissions");
    window.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    window.URL.createObjectURL = originalCreateObjectURL;
    window.URL.revokeObjectURL = originalRevokeObjectURL;
    vi.restoreAllMocks();
  });

  it("offers the three formats and downloads the selected one", async () => {
    commissionsApi.download.mockResolvedValue(new Blob(["report"]));
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    render(<MemoryRouter><Commissions /></MemoryRouter>);
    await screen.findAllByText("Ana Vendedora");

    expect(
      screen.getByRole("button", { name: "Download Commissions as CSV" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Download Commissions as Excel" })
    ).toBeInTheDocument();
    const pdfButton = screen.getByRole("button", {
      name: "Download Commissions as PDF",
    });
    expect(pdfButton).toBeInTheDocument();

    fireEvent.click(pdfButton);

    await waitFor(() =>
      expect(commissionsApi.download).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        "pdf",
        { sellerId: "" }
      )
    );
    expect(showToast).toHaveBeenCalledWith("Download successful", "success");

    clickSpy.mockRestore();
  });

  it("sends the visible seller filter to the export", async () => {
    commissionsApi.download.mockResolvedValue(new Blob(["report"]));
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    render(<MemoryRouter><Commissions /></MemoryRouter>);
    await screen.findByRole("option", { name: "Ana Vendedora" });

    fireEvent.change(sellerSelect(), { target: { value: "3" } });
    await waitFor(() =>
      expect(commissionsApi.list).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({ sellerId: "3" })
      )
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Download Commissions as CSV" })
    );

    await waitFor(() =>
      expect(commissionsApi.download).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        "csv",
        { sellerId: "3" }
      )
    );

    clickSpy.mockRestore();
  });
});
