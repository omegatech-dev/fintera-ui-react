// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import PaymentInstructionsPage from "./index";
import { projectsApi } from "../../api";
import { confirmDialog } from "@/shared/ui/ConfirmProvider";

expect.extend(matchers);

const { showToastMock } = vi.hoisted(() => ({ showToastMock: vi.fn() }));

const translations = {
  "common.loading": "Cargando...",
  "common.edit": "Editar",
  "common.delete": "Eliminar",
  "common.close": "Cerrar",
  "projects.tabOverview": "Resumen",
  "projects.tabLots": "Lotes",
  "projects.tabMedia": "Medios",
  "projects.tabActivity": "Actividad",
  "projects.paymentInstructions": "Instrucciones de pago",
  "projects.accounts": "Cuentas bancarias",
  "projects.currency": "Moneda",
  "paymentInstructions.title": "Cuentas bancarias del proyecto",
  "paymentInstructions.subtitle": "Cuentas bancarias y qué ve el cliente al reservar.",
  "paymentInstructions.description": "Cuentas donde los clientes transfieren la reserva.",
  "paymentInstructions.backToProjects": "Volver a proyectos",
  "paymentInstructions.viewProject": "Editar proyecto",
  "paymentInstructions.addAccount": "Agregar cuenta",
  "paymentInstructions.accountCount": "{count} cuentas",
  "paymentInstructions.newAccount": "Nueva cuenta bancaria",
  "paymentInstructions.editAccount": "Editar cuenta bancaria",
  "paymentInstructions.bankName": "Banco",
  "paymentInstructions.enterBankName": "Ej. BAC Credomatic",
  "paymentInstructions.beneficiary": "Beneficiario",
  "paymentInstructions.enterBeneficiary": "Titular de la cuenta",
  "paymentInstructions.number": "Número de cuenta",
  "paymentInstructions.enterAccountNumber": "Ej. 741-209-4321",
  "paymentInstructions.accountType": "Tipo de cuenta",
  "paymentInstructions.typeSavings": "Ahorro",
  "paymentInstructions.typeChecking": "Corriente",
  "paymentInstructions.savings": "Ahorros",
  "paymentInstructions.checking": "Cheques",
  "paymentInstructions.holder": "Titular",
  "paymentInstructions.notes": "Notas (opcional)",
  "paymentInstructions.enterNotes": "Instrucciones",
  "paymentInstructions.defaultAccount": "Predeterminada",
  "paymentInstructions.defaultAccountHint": "Será la primera cuenta que vea el cliente.",
  "paymentInstructions.defaultDeleteBlocked":
    "Esta es la cuenta predeterminada. Marca otra cuenta como predeterminada antes de eliminarla.",
  "paymentInstructions.defaultTipTitle": "Una cuenta predeterminada",
  "paymentInstructions.defaultTipText":
    "La cuenta marcada como predeterminada es la que aparece primero al cliente.",
  "paymentInstructions.instructionsTitle": "Instrucciones para el cliente",
  "paymentInstructions.instructionsHint":
    "Se muestran en el portal del cliente y en el correo de la reserva.",
  "paymentInstructions.instructionsPlaceholder":
    "Transfiere el monto de la reserva a la cuenta predeterminada.",
  "paymentInstructions.instructionsSaved": "Instrucciones del cliente actualizadas",
  "paymentInstructions.instructionsEmpty": "Agrega una cuenta bancaria.",
  "paymentInstructions.saveInstructions": "Guardar instrucciones",
  "paymentInstructions.previewTitle": "Vista previa del cliente",
  "paymentInstructions.previewEmpty": "Agrega una cuenta predeterminada.",
  "paymentInstructions.reservationAmount": "Monto de la reserva",
  "paymentInstructions.uploadReceipt": "Subir comprobante",
  "paymentInstructions.uploadReceiptHint": "Sube tu comprobante después de transferir.",
  "paymentInstructions.accountSheetNote":
    "Se mostrará en el portal del cliente y en el correo de la reserva.",
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
  "paymentInstructions.loadError": "No se pudieron cargar las cuentas bancarias",
  "paymentInstructions.saveError": "No se pudo guardar la cuenta bancaria",
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

vi.mock("@/contexts/generalSettings", () => ({
  useGeneralSettings: () => ({
    settings: { default_currency: "HNL", reservation_min_amount: 15000 },
  }),
}));

vi.mock("@/shared/ui/ConfirmProvider", () => ({
  confirmDialog: vi.fn(() => Promise.resolve(true)),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({ showToast: showToastMock }),
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
    currency: "HNL",
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
    currency: "HNL",
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
  it("lists the project bank accounts with masked numbers and the default chip", async () => {
    renderPage();

    expect(await screen.findByText(/Portal Mar de Plata/)).toBeInTheDocument();
    expect(screen.getAllByText("BAC Credomatic").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Banco Atlántida").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\*{4} 4321/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\*{4} 9876/).length).toBeGreaterThan(0);
    expect(screen.queryByText("741-209-4321")).not.toBeInTheDocument();
    expect(screen.getByText("Predeterminada")).toBeInTheDocument();
    expect(projectsApi.listPaymentInstructions).toHaveBeenCalledWith("1");
  });

  it("shows the customer preview with the default account and reservation amount", async () => {
    renderPage();

    expect(await screen.findByText("Vista previa del cliente")).toBeInTheDocument();
    expect(screen.getByText("Monto de la reserva")).toBeInTheDocument();
    expect(screen.getByText("L 15,000.00")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Subir comprobante" })).toBeDisabled();
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

    expect((await screen.findAllByText("BAC Credomatic")).length).toBeGreaterThan(
      0
    );
    expect(projectsApi.listPaymentInstructions).toHaveBeenCalledTimes(2);
  });

  it("creates an account from the sheet with the trimmed payload", async () => {
    projectsApi.createPaymentInstruction.mockResolvedValue({});
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "Agregar cuenta" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Nueva cuenta bancaria")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/^Banco/), {
      target: { value: "  Banco Ficohsa " },
    });
    fireEvent.change(screen.getByLabelText(/^Número de cuenta/), {
      target: { value: " 220-330-4455 " },
    });
    fireEvent.change(screen.getByLabelText(/^Titular/), {
      target: { value: " Fintera S.A. " },
    });
    fireEvent.change(screen.getByLabelText("Tipo de cuenta"), {
      target: { value: "checking" },
    });
    fireEvent.change(screen.getByLabelText("Moneda"), {
      target: { value: "USD" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Guardar cuenta" }));

    await waitFor(() => {
      expect(projectsApi.createPaymentInstruction).toHaveBeenCalledWith("1", {
        bank_name: "Banco Ficohsa",
        beneficiary_name: "Fintera S.A.",
        account_number: "220-330-4455",
        account_type: "checking",
        currency: "USD",
      });
    });
  });

  it("marks an edited account as the only default by moving it first", async () => {
    projectsApi.updatePaymentInstruction.mockResolvedValue({});
    renderPage();

    fireEvent.click((await screen.findAllByRole("button", { name: "Editar" }))[1]);
    fireEvent.click(screen.getByRole("switch", { name: "Predeterminada" }));
    fireEvent.click(screen.getByRole("button", { name: "Guardar cuenta" }));

    await waitFor(() => {
      expect(projectsApi.updatePaymentInstruction).toHaveBeenCalledWith(
        "1",
        11,
        expect.objectContaining({
          bank_name: "Banco Atlántida",
          account_number: "110-020-9876",
          currency: "HNL",
          account_type: "savings",
        })
      );
      expect(projectsApi.updatePaymentInstruction).toHaveBeenCalledWith("1", 11, {
        position: 0,
      });
      expect(projectsApi.updatePaymentInstruction).toHaveBeenCalledWith("1", 10, {
        position: 1,
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

  it("shows the full number only while editing", async () => {
    renderPage();

    fireEvent.click((await screen.findAllByRole("button", { name: "Editar" }))[0]);

    expect(screen.getByText("Editar cuenta bancaria")).toBeInTheDocument();
    expect(screen.getByLabelText(/^Número de cuenta/)).toHaveValue("741-209-4321");
  });

  it("blocks deleting the default account", async () => {
    renderPage();

    fireEvent.click((await screen.findAllByLabelText("Eliminar cuenta"))[0]);

    expect(
      await screen.findByText(/Esta es la cuenta predeterminada/)
    ).toBeInTheDocument();
    expect(confirmDialog).not.toHaveBeenCalled();
    expect(projectsApi.deletePaymentInstruction).not.toHaveBeenCalled();
  });

  it("deletes a non-default account after confirmation", async () => {
    projectsApi.deletePaymentInstruction.mockResolvedValue({});
    renderPage();

    fireEvent.click((await screen.findAllByLabelText("Eliminar cuenta"))[1]);

    await waitFor(() => {
      expect(confirmDialog).toHaveBeenCalled();
      expect(projectsApi.deletePaymentInstruction).toHaveBeenCalledWith("1", 11);
    });
  });

  it("saves the customer instructions on the default account", async () => {
    projectsApi.updatePaymentInstruction.mockResolvedValue({});
    renderPage();

    const editor = await screen.findByDisplayValue("Indica tu lote");
    expect(editor).toHaveAccessibleName("Instrucciones para el cliente");
    fireEvent.change(editor, { target: { value: "Nuevo texto" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar instrucciones" }));

    await waitFor(() => {
      expect(projectsApi.updatePaymentInstruction).toHaveBeenCalledWith("1", 10, {
        notes: "Nuevo texto",
      });
    });
    expect(showToastMock).toHaveBeenCalledWith(
      "Instrucciones del cliente actualizadas",
      "success"
    );
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
