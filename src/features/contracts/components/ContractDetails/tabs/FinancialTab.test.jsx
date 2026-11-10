// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import FinancialTab from "./FinancialTab";
import { contractsApi } from "../../../api";

expect.extend(matchers);

const translations = {
  "contractDetailsModal.financialInfo": "Información Financiera",
  "contractDetailsModal.totalPrice": "Total Deuda",
  "contractDetailsModal.financingType": "Tipo de Financiamiento",
  "contractDetailsModal.financedAmount": "Monto Financiado",
  "contractDetailsModal.paymentTerm": "Plazo de Pago",
  "contractDetailsModal.reserveAmount": "Monto de Reserva",
  "contractDetailsModal.downPayment": "Pago Inicial",
  "contractDetailsModal.maxPaymentDate": "Fecha Máxima de Pago",
  "contractDetailsModal.bankName": "Banco",
  "contractDetailsModal.bankNamePlaceholder": "Nombre del banco o financiera",
  "contractDetailsModal.bankCreditStatus": "Estado del Crédito",
  "contractDetailsModal.bankCreditStatuses.notStarted": "No iniciado",
  "contractDetailsModal.bankCreditStatuses.preQualified": "Pre-calificado",
  "contractDetailsModal.bankCreditStatuses.preApproved": "Pre-aprobado",
  "contractDetailsModal.bankCreditStatuses.approved": "Aprobado",
  "contractDetailsModal.financingTypes.bank": "Bancario",
  "contractDetailsModal.financingTypes.direct": "Directo",
  "contractDetailsModal.months": "meses",
  "common.save": "Guardar",
  "common.saving": "Guardando",
};

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({ t: (key) => translations[key] ?? key }),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock("../../../api", () => ({
  contractsApi: { update: vi.fn() },
}));

const baseContract = {
  id: 3,
  project_id: 1,
  lot_id: 2,
  amount: 750000,
  payment_term: 18,
  reserve_amount: 5000,
  down_payment: 0,
  financing_type: "bank",
  max_payment_date: "2026-12-01",
  bank_name: "Banco Atlántida",
  bank_credit_status: "pre_qualified",
};

function renderTab(overrides = {}, props = {}) {
  const contract = { ...baseContract, ...overrides };
  return render(
    <FinancialTab
      contract={contract}
      displayContract={contract}
      fullContract={contract}
      isEditMode={false}
      setIsEditMode={vi.fn()}
      onSaveSuccess={vi.fn()}
      isLoadingFull={false}
      {...props}
    />
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("FinancialTab bank financing", () => {
  it("shows the bank and the credit status for a bank contract", () => {
    renderTab();

    expect(screen.getByText("Banco Atlántida")).toBeInTheDocument();
    expect(screen.getByText("Pre-calificado")).toBeInTheDocument();
  });

  it("renders placeholders when the bank details are missing", () => {
    renderTab({ bank_name: null, bank_credit_status: null });

    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  it("hides the bank block for non-bank contracts", () => {
    renderTab({
      financing_type: "direct",
      bank_name: null,
      bank_credit_status: null,
    });

    expect(screen.queryByText("Banco")).not.toBeInTheDocument();
    expect(screen.queryByText("Estado del Crédito")).not.toBeInTheDocument();
  });

  it("sends the bank fields when saving in edit mode", async () => {
    contractsApi.update.mockResolvedValue({
      contract: baseContract,
      message: "Contrato actualizado",
    });

    renderTab({}, { isEditMode: true });

    fireEvent.change(screen.getByPlaceholderText("Nombre del banco o financiera"), {
      target: { value: "Banco Ficohsa" },
    });
    fireEvent.change(screen.getByLabelText("Estado del Crédito"), {
      target: { value: "pre_approved" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() => {
      expect(contractsApi.update).toHaveBeenCalledWith(
        1,
        2,
        3,
        expect.objectContaining({
          bank_name: "Banco Ficohsa",
          bank_credit_status: "pre_approved",
        })
      );
    });
  });

  it("clears the bank details with empty values", async () => {
    contractsApi.update.mockResolvedValue({
      contract: { ...baseContract, bank_name: null, bank_credit_status: null },
      message: "Contrato actualizado",
    });

    renderTab({}, { isEditMode: true });

    fireEvent.change(screen.getByPlaceholderText("Nombre del banco o financiera"), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText("Estado del Crédito"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() => {
      expect(contractsApi.update).toHaveBeenCalledWith(
        1,
        2,
        3,
        expect.objectContaining({
          bank_name: "",
          bank_credit_status: "",
        })
      );
    });
  });
});
