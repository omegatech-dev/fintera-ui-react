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
    "common.close": "Cerrar",
    "common.retry": "Reintentar",
    "projects.name": "Nombre del Proyecto",
    "projects.code": "Código",
    "projects.address": "Dirección",
    "projects.pricePerUnit": "Precio por Unidad",
    "projects.guid": "ID del Proyecto",
    "projectsPage.importCSV": "Importar CSV",
    "projectsPage.importOptions": "Opciones de importación",
    "projectsPage.updateExisting": "Actualizar existentes",
    "projectsPage.skipDuplicates": "Omitir duplicados",
    "projectsPage.importCompleted": "Importación completada",
    "projectsPage.importError": "Error de importación",
    "projectsPage.importErrorPrefix": "Error de importación:",
    "projectsPage.downloadTemplate": "Descargar plantilla",
    "projectsPage.templateDownloadError": "No se pudo descargar la plantilla.",
    "projectsPage.columnMapping": "Mapeo de columnas",
    "projectsPage.notUsed": "No se usará",
    "projectsPage.requiredColumn": "Requerida",
    "projectsPage.missingRequiredColumns": "Faltan columnas requeridas: {columns}",
    "projectsPage.rowsDetected": "Se importarán {count} proyectos.",
    "projectsPage.importCount": "Importar {count} proyectos",
    "projectsPage.importSummary": "Resultado de la importación",
    "projectsPage.importedCount": "Importados",
    "projectsPage.updatedCount": "Actualizados",
    "projectsPage.skippedCount": "Omitidos",
    "projectsPage.rowErrors": "Filas con errores",
    "projectsPage.rowError": "Fila {row}: {message}",
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
  projectsApi: { import: vi.fn(), importTemplate: vi.fn() },
}));

const uploadFile = (file) => {
  const input = document.querySelector('input[type="file"]');
  fireEvent.change(input, { target: { files: [file] } });
};

const validFile = () =>
  new File(
    [
      "nombre,codigo,direccion,precio_m2,foo\n" +
        "Altos,ASM-1,Calle 1,1500,x\n" +
        "Bosques,ASM-2,Calle 2,1800,y\n" +
        "\n",
    ],
    "projects.csv",
    { type: "text/csv" }
  );

describe("CsvImportModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps headers, counts rows and imports the file once", async () => {
    projectsApi.import.mockResolvedValue({
      imported: 1,
      updated: 1,
      skipped: 2,
      errors: [],
    });
    const onClose = vi.fn();
    const onImported = vi.fn();

    render(<CsvImportModal open onClose={onClose} onImported={onImported} />);
    uploadFile(validFile());

    expect(await screen.findByText("Mapeo de columnas")).toBeInTheDocument();
    expect(screen.getByText("Nombre del Proyecto")).toBeInTheDocument();
    expect(screen.getByText("Código")).toBeInTheDocument();
    expect(screen.getByText("No se usará")).toBeInTheDocument();
    expect(screen.getAllByText("· Requerida")).toHaveLength(3);
    expect(screen.getByText("Se importarán 2 proyectos.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Importar 2 proyectos" }));

    await waitFor(() => expect(projectsApi.import).toHaveBeenCalledTimes(1));

    const formData = projectsApi.import.mock.calls[0][0];
    expect(formData.get("file")).toBeInstanceOf(File);
    expect(formData.get("file").name).toBe("projects.csv");
    expect(formData.get("update_existing")).toBe("0");
    expect(formData.get("skip_duplicates")).toBe("1");
    expect(onImported).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();

    expect(await screen.findByText("Resultado de la importación")).toBeInTheDocument();
    expect(screen.getByText("Importados").nextSibling).toHaveTextContent("1");
    expect(screen.getByText("Actualizados").nextSibling).toHaveTextContent("1");
    expect(screen.getByText("Omitidos").nextSibling).toHaveTextContent("2");

    fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("shows row errors returned by the API", async () => {
    projectsApi.import.mockResolvedValue({
      imported: 1,
      updated: 0,
      skipped: 0,
      errors: [{ row: 4, message: "price_per_square_unit debe ser un número" }],
    });

    render(<CsvImportModal open onClose={vi.fn()} />);
    uploadFile(validFile());
    fireEvent.click(await screen.findByRole("button", { name: "Importar 2 proyectos" }));

    expect(await screen.findByText("Filas con errores")).toBeInTheDocument();
    expect(
      screen.getByText("Fila 4: price_per_square_unit debe ser un número")
    ).toBeInTheDocument();
    expect(showToast).toHaveBeenCalledWith("Importación completada", "error");
  });

  it("disables the CTA and names missing required columns", async () => {
    render(<CsvImportModal open onClose={vi.fn()} />);
    uploadFile(
      new File(["nombre,codigo\nAltos,ASM-1\n"], "missing.csv", {
        type: "text/csv",
      })
    );

    expect(
      await screen.findByText("Faltan columnas requeridas: Dirección, Precio por Unidad")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Importar 1 proyectos" })
    ).toBeDisabled();
    expect(projectsApi.import).not.toHaveBeenCalled();
  });

  it("downloads the backend template", async () => {
    const blob = new Blob(["name,address"], { type: "text/csv" });
    projectsApi.importTemplate.mockResolvedValue(blob);
    const createObjectURL = vi.fn(() => "blob:template");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });
    let downloadedName = "";
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(function handleClick() {
        downloadedName = this.download;
      });

    render(<CsvImportModal open onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Descargar plantilla" }));

    await waitFor(() => expect(projectsApi.importTemplate).toHaveBeenCalledTimes(1));
    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(downloadedName).toBe("plantilla-proyectos.csv");
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:template");

    click.mockRestore();
    vi.unstubAllGlobals();
  });

  it("shows a danger banner with a reset action when the CSV cannot be read", async () => {
    const file = new File(["broken"], "broken.csv", { type: "text/csv" });
    file.text = vi.fn().mockRejectedValue(new Error("cannot read"));

    render(<CsvImportModal open onClose={vi.fn()} />);
    uploadFile(file);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Error de importación");
    expect(screen.getByRole("button", { name: "Importar CSV" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));

    await waitFor(() =>
      expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    );
  });
});
