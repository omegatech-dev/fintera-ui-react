import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

import CsvImportModal from "../CsvImportModal";
import { projectsApi } from "../../api";

expect.extend(matchers);
afterEach(cleanup);

const { t, showToast } = vi.hoisted(() => {
  const translations = {
    "common.cancel": "Cancelar",
    "common.retry": "Reintentar",
    "projects.name": "Nombre del Proyecto",
    "projects.code": "Código",
    "projectsPage.importCSV": "Importar CSV",
    "projectsPage.importOptions": "Opciones de importación",
    "projectsPage.updateExisting": "Actualizar existentes",
    "projectsPage.skipDuplicates": "Omitir duplicados",
    "projectsPage.importCompleted": "Importación completada",
    "projectsPage.importError": "Error de importación",
    "projectsPage.importErrorPrefix": "Error de importación:",
    "projectsPage.downloadTemplate": "Descargar plantilla",
    "projectsPage.columnMapping": "Mapeo de columnas",
    "projectsPage.notUsed": "No se usará",
    "projectsPage.rowsDetected": "Se importarán {count} proyectos.",
    "projectsPage.importCount": "Importar {count} proyectos",
  };

  return {
    t: (key, params = {}) => {
      const template = translations[key] ?? key;
      return Object.entries(params).reduce(
        (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
        template
      );
    },
    showToast: vi.fn(),
  };
});

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({ t, locale: "es" }),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({ showToast }),
}));

vi.mock("../../api", () => ({
  projectsApi: { import: vi.fn() },
}));

const uploadFile = (file) => {
  const input = document.querySelector('input[type="file"]');
  fireEvent.change(input, { target: { files: [file] } });
};

describe("CsvImportModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps headers, counts data rows and imports the selected file", async () => {
    projectsApi.import.mockResolvedValue({});
    const onClose = vi.fn();
    const onImported = vi.fn();
    const file = new File(
      ["nombre,codigo,foo\nAltos,ASM-1,x\nBosques,ASM-2,y\n\n"],
      "projects.csv",
      { type: "text/csv" }
    );

    render(
      <CsvImportModal open onClose={onClose} onImported={onImported} />
    );
    uploadFile(file);

    expect(await screen.findByText("Mapeo de columnas")).toBeInTheDocument();
    expect(screen.getByText("Nombre del Proyecto")).toBeInTheDocument();
    expect(screen.getByText("Código")).toBeInTheDocument();
    expect(screen.getByText("No se usará")).toBeInTheDocument();
    expect(
      screen.getByText("Se importarán 2 proyectos.")
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Importar 2 proyectos" })
    );

    await waitFor(() => expect(projectsApi.import).toHaveBeenCalledTimes(1));

    const formData = projectsApi.import.mock.calls[0][0];
    expect(formData.get("file")).toBe(file);
    expect(formData.get("options[update_existing]")).toBe("0");
    expect(formData.get("options[skip_duplicates]")).toBe("1");
    expect(onImported).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("shows a danger banner with a reset action when the CSV cannot be read", async () => {
    const file = new File(["broken"], "broken.csv", { type: "text/csv" });
    file.text = vi.fn().mockRejectedValue(new Error("cannot read"));

    render(<CsvImportModal open onClose={vi.fn()} />);
    uploadFile(file);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Error de importación");
    expect(
      screen.getByRole("button", { name: "Importar CSV" })
    ).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));

    await waitFor(() =>
      expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    );
  });
});
