// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import PaymentInstructionsPage from "./index";
import { projectsApi } from "../../api";
import { confirmDialog } from "@/shared/ui/ConfirmProvider";

expect.extend(matchers);

const translations = {
  "common.loading": "Cargando...",
  "paymentInstructions.title": "Cuentas bancarias del proyecto",
  "paymentInstructions.description": "Cuentas donde los clientes transfieren la reserva.",
  "paymentInstructions.backToProjects": "Volver a proyectos",
  "paymentInstructions.viewProject": "Editar proyecto",
  "paymentInstructions.addAccount": "Agregar cuenta",
  "paymentInstructions.newAccount": "Nueva cuenta bancaria",
  "paymentInstructions.editAccount": "Editar cuenta bancaria",
  "paymentInstructions.bankName": "Banco",
  "paymentInstructions.enterBankName": "Ej. BAC Credomatic",
  "paymentInstructions.beneficiary": "Beneficiario",
  "paymentInstructions.enterBeneficiary": "Titular de la cuenta",
  "paymentInstructions.accountNumber": "Número de cuenta",
  "paymentInstructions.enterAccountNumber": "Ej. 741-209-4321",
  "paymentInstructions.accountType": "Tipo de cuenta",
  "paymentInstructions.savings": "Ahorros",
  "paymentInstructions.checking": "Cheques",
  "paymentInstructions.notes": "Notas (opcional)",
  "paymentInstructions.enterNotes": "Instrucciones",
  "paymentInstructions.save": "Guardar cuenta",
  "paymentInstructions.saving": "Guardando...",
  "paymentInstructions.cancel": "Cancelar",
  "paymentInstructions.edit": "Editar cuenta",
  "paymentInstructions.delete": "Eliminar cuenta",
  "paymentInstructions.moveUp": "Mover arriba",
  "paymentInstructions.moveDown": "Mover abajo",
  "paymentInstructions.required": "Este campo es obligatorio",
  "paymentInstructions.tooLong": "Máximo {max} caracteres",
  "paymentInstructions.emptyTitle": "Aún no hay cuentas bancarias",
  "paymentInstructions.emptyDescription": "Agrega al menos una cuenta.",
  "paymentInstructions.publishedWarning": "Este proyecto está publicado y no tiene cuentas bancarias.",
  "paymentInstructions.retry": "Reintentar",
  "paymentInstructions.createSuccess": "Cuenta bancaria agregada",
  "paymentInstructions.updateSuccess": "Cuenta bancaria actualizada",
  "paymentInstructions.deleteSuccess": "Cuenta bancaria eliminada",
  "paymentInstructions.published": "Publicado",
  "paymentInstructions.draft": "Borrador",
  "paymentInstructions.limitHint": "Límites de longitud",
};

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({
    t: (key, params) =>
      (translations[key] || key).replace(/\{(\w+)\}/g, (_, name) =>
        String(params?.[name] ?? "")
      ),
  }),
}));

vi.mock("@/shared/ui/ConfirmProvider", () => ({
  confirmDialog: vi.fn(() => Promise.resolve(true)),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock("../../api", () => ({
  projectsApi: {
    get: vi.fn(),
    listPaymentInstructions: vi.fn(),
    createPaymentInstruction: vi.fn(),
    updatePaymentInstruction: vi.fn(),
    deletePaymentInstruction: vi.fn(),
  },
}));

const PROJECT = {
  id: 1,
  name: "Portal Mar de Plata",
  city: "Omoa",
  code: "PMP-2025",
  is_published: true,
};

const ACCOUNTS = [
  {
    id: 10,
    project_id: 1,
    bank_name: "BAC Credomatic",
    beneficiary_name: "Fintera S.A.",
    account_number: "741-209-4321",
    account_type: "checking",
    notes: "Indica tu lote",
    position: 0,
  },
  {
    id: 11,
    project_id: 1,
    bank_name: "Banco Atlántida",
    beneficiary_name: "Fintera S.A.",
    account_number: "110-020-9876",
    account_type: "savings",
    notes: null,
    position: 1,
  },
];

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/projects/1/payment-instructions"]}>
      <Routes>
        <Route
          path="/projects/:id/payment-instructions"
          element={<PaymentInstructionsPage />}
        />
      </Routes>
    </MemoryRouter>
  );
}

function mockLoad({ accounts = ACCOUNTS, project = PROJECT } = {}) {
  projectsApi.get.mockResolvedValue({ project });
  projectsApi.listPaymentInstructions.mockResolvedValue({
    payment_instructions: accounts,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockLoad();
  vi.spyOn(window, "confirm").mockReturnValue(true);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("PaymentInstructionsPage", () => {
  it("lists the project bank accounts", async () => {
    renderPage();

    expect(await screen.findByText("Portal Mar de Plata")).toBeInTheDocument();
    expect(screen.getByText("BAC Credomatic")).toBeInTheDocument();
    expect(screen.getByText("Banco Atlántida")).toBeInTheDocument();
    expect(screen.getByText("741-209-4321")).toBeInTheDocument();
    expect(screen.getByText("110-020-9876")).toBeInTheDocument();
    expect(projectsApi.listPaymentInstructions).toHaveBeenCalledWith("1");
  });

  it("shows the empty state and the published warning", async () => {
    mockLoad({ accounts: [] });
    renderPage();

    expect(
      await screen.findByText("Aún no hay cuentas bancarias")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Este proyecto está publicado/)
    ).toBeInTheDocument();
  });

  it("shows an error and retries the request", async () => {
    projectsApi.listPaymentInstructions.mockRejectedValueOnce(
      new Error("network down")
    );
    renderPage();

    expect(await screen.findByText("network down")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(await screen.findByText("BAC Credomatic")).toBeInTheDocument();
    expect(projectsApi.listPaymentInstructions).toHaveBeenCalledTimes(2);
  });

  it("creates an account with the trimmed payload", async () => {
    projectsApi.createPaymentInstruction.mockResolvedValue({});
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "Agregar cuenta" }));
    fireEvent.change(screen.getByLabelText(/^Banco/), {
      target: { value: "  Banco Ficohsa " },
    });
    fireEvent.change(screen.getByLabelText(/^Número de cuenta/), {
      target: { value: " 220-330-4455 " },
    });
    fireEvent.change(screen.getByLabelText(/^Beneficiario/), {
      target: { value: " Fintera S.A. " },
    });
    fireEvent.change(screen.getByLabelText("Tipo de cuenta"), {
      target: { value: "checking" },
    });
    fireEvent.change(screen.getByLabelText("Notas (opcional)"), {
      target: { value: " Nota " },
    });

    fireEvent.click(screen.getByRole("button", { name: "Guardar cuenta" }));

    await waitFor(() => {
      expect(projectsApi.createPaymentInstruction).toHaveBeenCalledWith("1", {
        bank_name: "Banco Ficohsa",
        beneficiary_name: "Fintera S.A.",
        account_number: "220-330-4455",
        account_type: "checking",
        notes: "Nota",
      });
    });
  });

  it("validates required fields before submitting", async () => {
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "Agregar cuenta" }));
    fireEvent.click(screen.getByRole("button", { name: "Guardar cuenta" }));

    const errors = await screen.findAllByText("Este campo es obligatorio");
    expect(errors.length).toBeGreaterThan(0);
    expect(projectsApi.createPaymentInstruction).not.toHaveBeenCalled();
  });

  it("deletes an account after confirmation", async () => {
    projectsApi.deletePaymentInstruction.mockResolvedValue({});
    renderPage();

    fireEvent.click((await screen.findAllByLabelText("Eliminar cuenta"))[0]);

    await waitFor(() => {
      expect(confirmDialog).toHaveBeenCalled();
      expect(projectsApi.deletePaymentInstruction).toHaveBeenCalledWith("1", 10);
    });
  });

  it("reorders accounts by swapping positions", async () => {
    projectsApi.updatePaymentInstruction.mockResolvedValue({});
    renderPage();

    fireEvent.click((await screen.findAllByLabelText("Mover abajo"))[0]);

    await waitFor(() => {
      expect(projectsApi.updatePaymentInstruction).toHaveBeenCalledWith("1", 10, {
        position: 1,
      });
      expect(projectsApi.updatePaymentInstruction).toHaveBeenCalledWith("1", 11, {
        position: 0,
      });
    });
  });

  it("disables the first up control and the last down control", async () => {
    renderPage();

    const upButtons = await screen.findAllByLabelText("Mover arriba");
    const downButtons = screen.getAllByLabelText("Mover abajo");

    expect(upButtons[0]).toBeDisabled();
    expect(downButtons[downButtons.length - 1]).toBeDisabled();
  });
});
