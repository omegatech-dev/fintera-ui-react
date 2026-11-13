import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import SellerWorkspace from "./index";
import { sellerApi } from "../api";
import { contractsApi } from "@/features/contracts/api";
import { paymentsApi } from "@/features/payments/api";
import { commissionsApi } from "@/features/commissions/api";

expect.extend(matchers);

const { showToast, translations } = vi.hoisted(() => ({
  showToast: vi.fn(),
  translations: {
    "seller.tabCommissions": "Comisiones",
    "seller.registerCollection": "Registrar cobro",
    "seller.inReview": "En revisión",
    "seller.receiptRequired": "Adjunta el comprobante",
    "seller.collectionNotice":
      "El pago queda en revisión; el saldo cambia solo cuando un administrador lo aprueba.",
    "common.cancel": "Cancelar",
  },
}));

vi.mock("../api", () => ({
  sellerApi: {
    contracts: vi.fn(),
  },
}));

vi.mock("@/features/contracts/api", () => ({
  contractsApi: {
    getByGuid: vi.fn(),
  },
}));

vi.mock("@/features/payments/api", () => ({
  paymentsApi: {
    getStats: vi.fn(),
    uploadReceipt: vi.fn(),
  },
}));

vi.mock("@/features/commissions/api", () => ({
  commissionsApi: {
    list: vi.fn(),
  },
}));

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({ t: (key) => translations[key] ?? key }),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({ showToast }),
}));

const contract = {
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
};

const contractDetail = {
  ...contract,
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

function renderWorkspace(path = "/vendedor/cobros") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SellerWorkspace />
    </MemoryRouter>
  );
}

beforeEach(() => {
  sellerApi.contracts.mockResolvedValue({ contracts: [contract] });
  contractsApi.getByGuid.mockResolvedValue({ contract: contractDetail });
  paymentsApi.getStats.mockResolvedValue({
    pending_this_month: 156679,
    total_overdue: 46912,
    collected_this_month: 188750,
  });
  paymentsApi.uploadReceipt.mockResolvedValue({});
  commissionsApi.list.mockResolvedValue({ commissions });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Seller workspace collections", () => {
  it("registers a receipt and leaves the collection in review", async () => {
    renderWorkspace();

    const collectButtons = await screen.findAllByRole("button", {
      name: "Cobrar",
    });
    expect(screen.getByText("L 156,679")).toBeInTheDocument();

    fireEvent.click(collectButtons[0]);

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Cuota 1")).toBeInTheDocument();
    expect(screen.getByText("L 54,583")).toBeInTheDocument();
    expect(
      screen.getByText(translations["seller.collectionNotice"])
    ).toBeInTheDocument();

    const submit = screen.getByRole("button", { name: "Registrar cobro" });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Comprobante"), {
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
    expect(showToast).toHaveBeenCalledWith(
      "Comprobante enviado. El cobro queda en revisión."
    );
    expect((await screen.findAllByText("En revisión")).length).toBeGreaterThan(0);
    expect(sellerApi.contracts).toHaveBeenCalledTimes(2);
  });

  it("shows an error and keeps the dialog open when the upload fails", async () => {
    paymentsApi.uploadReceipt.mockRejectedValueOnce(
      new Error("No se pudo subir")
    );
    renderWorkspace();

    const collectButtons = await screen.findAllByRole("button", {
      name: "Cobrar",
    });
    fireEvent.click(collectButtons[0]);
    await screen.findByRole("dialog");

    fireEvent.change(screen.getByLabelText("Comprobante"), {
      target: {
        files: [
          new File(["receipt"], "comprobante.pdf", {
            type: "application/pdf",
          }),
        ],
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Registrar cobro" }));

    await waitFor(() =>
      expect(showToast).toHaveBeenCalledWith("No se pudo subir", "error")
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

describe("Seller workspace tabs", () => {
  it("keeps the clients and documents tabs working", async () => {
    renderWorkspace("/vendedor/clientes");

    expect((await screen.findAllByText("Milton Perez")).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("tab", { name: /Documentos/ }));

    expect(
      (await screen.findAllByRole("button", { name: "Ver documentos" })).length
    ).toBeGreaterThan(0);
  });
});

describe("Seller workspace commissions", () => {
  it("shows a read-only commission summary for the seller", async () => {
    renderWorkspace("/vendedor/comisiones");

    expect((await screen.findAllByText("Milton Perez")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Antonio Lopez").length).toBeGreaterThan(0);
    expect(screen.getAllByText("5.0%").length).toBeGreaterThan(0);
    expect(
      screen.queryByRole("button", { name: /marcar pagada|pagar/i })
    ).toBeNull();
    expect(commissionsApi.list).toHaveBeenCalledTimes(1);
  });
});
