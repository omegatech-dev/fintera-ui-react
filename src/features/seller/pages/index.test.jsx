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
import SellerWorkspace from "./index";
import { sellerApi } from "../api";
import { contractsApi } from "@/features/contracts/api";
import { paymentsApi } from "@/features/payments/api";
import { commissionsApi } from "@/features/commissions/api";
import { reportsApi } from "@/shared/api/reports";

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
  sellerApi: { contracts: vi.fn() },
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
  {
    guid: "contract-2",
    id: 17,
    applicant_user_id: 8,
    applicant_name: "Antonio Lopez",
    applicant_phone: "8888-0000",
    applicant_identity: "0801-1990-00002",
    amount: 400000,
    balance: 0,
    status: "approved",
    project_name: "Altos del Valle",
    lot_name: "Lote 012",
    created_at: "2026-10-05T10:00:00Z",
  },
  {
    guid: "contract-3",
    id: 18,
    applicant_user_id: 9,
    applicant_name: "Sergio Peralta",
    applicant_phone: "7777-0000",
    applicant_identity: "0801-1990-00003",
    amount: 300000,
    balance: 300000,
    status: "submitted",
    project_name: "Altos del Valle",
    lot_name: "Lote 013",
    created_at: "2026-10-10T10:00:00Z",
  },
];

const contractDetail = {
  ...contracts[0],
  payment_schedule: [
    {
      id: 42,
      description: "Cuota 1",
      amount: 54583,
      due_date: "2026-12-01T00:00:00Z",
      status: "pending",
      has_receipt: false,
    },
  ],
};

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

function renderWorkspace(path = "/vendedor/clientes") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SellerWorkspace />
    </MemoryRouter>
  );
}

beforeEach(() => {
  sellerApi.contracts.mockReset();
  contractsApi.getByGuid.mockReset();
  paymentsApi.getStats.mockReset();
  paymentsApi.uploadReceipt.mockReset();
  commissionsApi.list.mockReset();

  sellerApi.contracts.mockResolvedValue({ contracts });
  contractsApi.getByGuid.mockResolvedValue({ contract: contractDetail });
  paymentsApi.getStats.mockResolvedValue({
    pending_this_month: 156679,
    total_overdue: 46912,
    collected_this_month: 188750,
  });
  paymentsApi.uploadReceipt.mockResolvedValue({});
  commissionsApi.list.mockResolvedValue({ commissions });
  reportsApi.downloadUserBalancePDF.mockResolvedValue(new Blob(["pdf"]));
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Seller workspace clients", () => {
  it("renders the header, KPIs and the client table", async () => {
    renderWorkspace();

    expect(
      screen.getByRole("heading", { level: 1, name: "My clients" })
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        "2 active clients · 1 with pending payments"
      )
    ).toBeInTheDocument();

    expect(await screen.findByText("Active clients")).toBeInTheDocument();
    expect(screen.getByText("With pending payment")).toBeInTheDocument();
    expect(screen.getByText("Total portfolio")).toBeInTheDocument();
    expect(screen.getByText("L 1,200,000")).toBeInTheDocument();

    expect(screen.getAllByText("Milton Perez").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Antonio Lopez").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Sergio Peralta").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("tab", { name: /My clients\s*3/ })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Mostrando 1–3 de 3")
    ).toBeInTheDocument();
  });

  it("filters clients with the search box and shows an empty result", async () => {
    renderWorkspace();
    await screen.findAllByText("Milton Perez");

    const search = screen.getByRole("searchbox", {
      name: "Search client, phone or ID",
    });
    fireEvent.change(search, { target: { value: "Antonio" } });

    expect(screen.queryAllByText("Milton Perez")).toHaveLength(0);
    expect(screen.getAllByText("Antonio Lopez").length).toBeGreaterThan(0);

    fireEvent.change(search, { target: { value: "zzz" } });
    expect(await screen.findByText("No results")).toBeInTheDocument();
  });
});

describe("Seller workspace collections", () => {
  it("registers a receipt and leaves the collection in review", async () => {
    renderWorkspace("/vendedor/cobros");

    expect(
      await screen.findByText("L 156,679")
    ).toBeInTheDocument();
    expect(screen.getByText("L 46,912")).toBeInTheDocument();
    expect(screen.getByText("L 188,750")).toBeInTheDocument();
    expect(screen.getAllByText("Approved").length).toBeGreaterThan(0);

    const collectButtons = await screen.findAllByRole("button", {
      name: "Collect",
    });
    fireEvent.click(collectButtons[0]);

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Cuota 1")).toBeInTheDocument();
    expect(screen.getByText("L 54,583")).toBeInTheDocument();
    expect(
      screen.getByText(t("seller.collectionNotice"))
    ).toBeInTheDocument();

    const submit = screen.getByRole("button", {
      name: "Register collection",
    });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Receipt"), {
      target: {
        files: [
          new File(["receipt"], "comprobante.pdf", {
            type: "application/pdf",
          }),
        ],
      },
    });

    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    await waitFor(() =>
      expect(paymentsApi.uploadReceipt).toHaveBeenCalledTimes(1)
    );
    expect(paymentsApi.uploadReceipt.mock.calls[0][0]).toBe(42);
    expect(paymentsApi.uploadReceipt.mock.calls[0][1]).toBeInstanceOf(
      FormData
    );
    expect(showToast).toHaveBeenCalledWith(t("seller.collectionSubmitted"));
    expect(
      (await screen.findAllByText("In review")).length
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("Receipt sent").length).toBeGreaterThan(0);
    expect(sellerApi.contracts).toHaveBeenCalledTimes(2);
  });

  it("keeps the dialog open and reports the error when the upload fails", async () => {
    paymentsApi.uploadReceipt.mockRejectedValueOnce(
      new Error("Upload failed")
    );
    renderWorkspace("/vendedor/cobros");

    fireEvent.click(
      (await screen.findAllByRole("button", { name: "Collect" }))[0]
    );
    await screen.findByRole("dialog");

    fireEvent.change(screen.getByLabelText("Receipt"), {
      target: {
        files: [new File(["receipt"], "comprobante.pdf")],
      },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Register collection" })
    );

    await waitFor(() =>
      expect(showToast).toHaveBeenCalledWith("Upload failed", "error")
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("shows an error state when contracts cannot be loaded", async () => {
    sellerApi.contracts.mockRejectedValueOnce(new Error("Network"));
    renderWorkspace("/vendedor/cobros");

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("We couldn't load your workspace");
    expect(screen.queryByRole("button", { name: "Collect" })).toBeNull();
  });

  it("shows the empty state when there are no balances", async () => {
    sellerApi.contracts.mockResolvedValue({ contracts: [contracts[1]] });
    renderWorkspace("/vendedor/cobros");

    expect(
      await screen.findByText("No pending balances")
    ).toBeInTheDocument();
  });
});

describe("Seller workspace documents", () => {
  it("downloads the customer account statement instead of opening the contract", async () => {
    renderWorkspace("/vendedor/documentos");

    expect(
      screen.getByRole("heading", { level: 1, name: "Documents" })
    ).toBeInTheDocument();
    expect(
      await screen.findByText("3 contracts with available documents")
    ).toBeInTheDocument();
    expect(screen.getByText("Contracts with documents")).toBeInTheDocument();
    expect(screen.getByText("In review")).toBeInTheDocument();
    expect(screen.getAllByText("Submitted").length).toBeGreaterThan(0);

    const downloads = await screen.findAllByRole("button", {
      name: "Download statement",
    });
    expect(downloads).toHaveLength(6);

    fireEvent.click(downloads[0]);

    expect(reportsApi.downloadUserBalancePDF).toHaveBeenCalledWith(7);
  });
});

describe("Seller workspace commissions", () => {
  it("shows a read-only commission summary for the seller", async () => {
    renderWorkspace("/vendedor/comisiones");

    expect(
      screen.getByRole("heading", { level: 1, name: "Commissions" })
    ).toBeInTheDocument();
    expect(
      await screen.findByText("2 commissions · 5.0% on approved contracts")
    ).toBeInTheDocument();
    expect(screen.getAllByText("L 45,000").length).toBeGreaterThan(0);
    expect(screen.getAllByText("L 25,000").length).toBeGreaterThan(0);
    expect(screen.getAllByText("L 20,000").length).toBeGreaterThan(0);
    expect(screen.getAllByText("5.0%").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Paid").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Pending").length).toBeGreaterThan(0);
    expect(
      screen.queryByRole("button", { name: /mark as paid|pay/i })
    ).toBeNull();
    expect(commissionsApi.list).toHaveBeenCalledTimes(1);
  });

  it("shows an error state when commissions cannot be loaded", async () => {
    commissionsApi.list.mockRejectedValueOnce(new Error("Network"));
    renderWorkspace("/vendedor/comisiones");

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("We couldn't load your commissions");
  });
});

describe("Seller workspace navigation", () => {
  it("moves between tabs", async () => {
    renderWorkspace();

    await screen.findAllByText("Milton Perez");
    fireEvent.click(screen.getByRole("tab", { name: /Collections/ }));

    expect(
      screen.getByRole("heading", { level: 1, name: "Collections" })
    ).toBeInTheDocument();
    expect(
      await screen.findByText("1 contracts with balance · L 450,000 pending")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: /Commissions/ }));
    expect(
      screen.getByRole("heading", { level: 1, name: "Commissions" })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: /Documents/ }));
    expect(
      screen.getByRole("heading", { level: 1, name: "Documents" })
    ).toBeInTheDocument();
  });
});
