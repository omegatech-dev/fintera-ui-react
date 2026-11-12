import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import ApplyPaymentModal from "./ApplyPaymentModal";
import { contractsApi } from "../../api";

expect.extend(matchers);

const translations = {
  "contracts.capitalPayment": "Pago de Capital",
  "contracts.capitalPaymentAmount": "Monto del Pago de Capital",
  "contracts.enterCapitalPaymentAmount": "Ingrese el monto",
  "contracts.applyCapitalPayment": "Aplicar abono",
  "contracts.applyingCapitalPayment": "Aplicando...",
  "contracts.capitalPaymentAmountRequired": "El monto del pago de capital es requerido",
  "contracts.appliedSuccessfully": "aplicado exitosamente",
  "contracts.errorApplying": "Error al aplicar",
  "contracts.payment": "Pago",
  "contracts.paymentAmount": "Monto del pago",
  "contracts.interestMoratory": "Interés moratorio",
  "contracts.totalAmount": "Total",
  "contracts.close": "Cerrar",
};

const showToast = vi.fn();

vi.mock("../../../../contexts/LocaleContext", () => ({
  useLocale: () => ({ t: (key) => translations[key] ?? key }),
}));

vi.mock("../../../../contexts/ToastContext", () => ({
  useToast: () => ({ showToast }),
}));

vi.mock("../../api", () => ({
  contractsApi: { capitalRepayment: vi.fn() },
}));

const contract = { id: 3, project_id: 1, lot_id: 2 };

function renderModal() {
  return render(
    <ApplyPaymentModal
      isOpen
      onClose={vi.fn()}
      selectedPayment={{ isCapitalPayment: true, number: "Capital" }}
      contract={contract}
      onPaymentSuccess={vi.fn()}
    />
  );
}

describe("ApplyPaymentModal capital repayment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("submits a positive capital repayment", async () => {
    contractsApi.capitalRepayment.mockResolvedValueOnce({
      reajusted_payments_count: 0,
    });
    renderModal();

    fireEvent.change(screen.getByRole("spinbutton"), {
      target: { value: "1500" },
    });
    fireEvent.click(screen.getByRole("button", { name: /aplicar abono/i }));

    await waitFor(() => {
      expect(contractsApi.capitalRepayment).toHaveBeenCalledWith(1, 2, 3, 1500);
    });
  });

  it("blocks a non-numeric amount before calling the API", async () => {
    renderModal();

    fireEvent.change(screen.getByRole("spinbutton"), {
      target: { value: "-" },
    });
    fireEvent.click(screen.getByRole("button", { name: /aplicar abono/i }));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        translations["contracts.capitalPaymentAmountRequired"],
        "error"
      );
    });
    expect(contractsApi.capitalRepayment).not.toHaveBeenCalled();
  });

  it("shows the API error message when the repayment is rejected", async () => {
    contractsApi.capitalRepayment.mockRejectedValueOnce(
      new Error("no se puede abonar a un contrato no aprobado")
    );
    renderModal();

    fireEvent.change(screen.getByRole("spinbutton"), {
      target: { value: "900" },
    });
    fireEvent.click(screen.getByRole("button", { name: /aplicar abono/i }));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        expect.stringContaining("no se puede abonar a un contrato no aprobado"),
        "error"
      );
    });
  });
});
