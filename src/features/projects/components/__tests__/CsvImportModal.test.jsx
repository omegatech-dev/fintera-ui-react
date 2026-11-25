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
    "common.dropzone": "Arrastra archivos o haz clic",
    "projects.name": "Nombre del Proyecto",
    "projects.code": "Código",
    "projects.address": "Dirección",
    "projects.pricePerUnit": "Precio por Unidad",
    "projects.lotsCount": "Cantidad de Lotes",
    "projects.measurementUnit": "Unidad de Medida",
    "projects.deliveryDate": "Fecha de Entrega",
    "projects.interestRate": "Tasa de Interés",
    "projectsPage.importCSV": "Importar CSV",
    "projectsPage.csvFileLabel": "Archivo CSV",
    "projectsPage.csvFileHint": "CSV UTF-8, separado por comas o punto y coma",
    "projectsPage.templateHint": "Descarga la plantilla para ver todas las columnas y una fila de ejemplo.",
    "projectsPage.valueHints": "Valores: unidad m2/ft2/vara2; tipo residential/commercial/industrial/mixed_use; fecha_entrega YYYY-MM-DD.",
    "projectsPage.requiredColumnsHint": "Requeridas: nombre, direccion y precio_m2.",
    "projectsPage.downloadTemplate": "Descargar plantilla",
    "projectsPage.templateDownloadError": "No se pudo descargar la plantilla.",
    "projectsPage.invalidFile": "Selecciona un archivo con extensión .csv.",
    "projectsPage.emptyFile": "El archivo está vacío o no tiene encabezados.",
    "projectsPage.noDataRows": "El archivo no contiene filas de datos.",
    "projectsPage.noValidRows": "No hay filas válidas para importar.",
    "projectsPage.normalizedFile": "El archivo se convirtió a CSV UTF-8 separado por comas antes de importarlo.",
    "projectsPage.duplicateKeyHint": "Los duplicados se detectan por el código del proyecto (codigo) o por GUID.",
    "projectsPage.duplicateKeyMissing": "Para actualizar u omitir duplicados, incluye la columna codigo (o guid).",
    "projectsPage.importOptions": "Opciones de importación",
    "projectsPage.updateExisting": "Actualizar existentes",
    "projectsPage.skipDuplicates": "Omitir duplicados",
    "projectsPage.importCompleted": "Importación completada",
    "projectsPage.importError": "Error de importación",
    "projectsPage.importErrorPrefix": "Error de importación:",
    "projectsPage.columnMapping": "Mapeo de columnas",
    "projectsPage.notUsed": "No se usará",
    "projectsPage.requiredColumn": "Requerida",
    "projectsPage.missingRequiredColumns": "Faltan columnas requeridas: {columns}",
    "projectsPage.rowValidationSummary": "{valid} filas listas, {errors} con errores.",
    "projectsPage.rowValidationReady": "{count} filas listas para importar.",
    "projectsPage.viewRowIssues": "Ver filas con errores ({count})",
    "projectsPage.hideRowIssues": "Ocultar filas con errores",
    "projectsPage.rowIssueLine": "Fila {row}: {reasons}",
    "projectsPage.moreRowIssues": "y {count} filas más.",
    "projectsPage.rowIssueRequired": "Falta {field}",
    "projectsPage.rowIssueNumber": "{field} debe ser un número",
    "projectsPage.rowIssueInteger": "{field} debe ser un número entero",
    "projectsPage.rowIssueNegative": "{field} no puede ser negativo",
    "projectsPage.rowIssueDate": "{field} debe tener formato YYYY-MM-DD (también se acepta DD/MM/YYYY o M/D/YYYY)",
    "projectsPage.rowIssueUnit": "{field} debe ser m2, ft2 o vara2",
    "projectsPage.importCount": "Importar {count} proyectos",
    "projectsPage.importValidCount": "Importar {count} filas válidas",
    "projectsPage.importAnother": "Importar otro archivo",
    "projectsPage.importSummary": "Resultado de la importación",
    "projectsPage.importedCount": "Importados",
    "projectsPage.updatedCount": "Actualizados",
    "projectsPage.skippedCount": "Omitidos",
    "projectsPage.rowErrors": "Filas con errores",
    "projectsPage.rowError": "Fila {row}: {message}",
    "projectsPage.importPartial": "Se importaron {imported} proyectos; {errors} filas con errores.",
    "projectsPage.importFailed": "No se importó ningún proyecto; {errors} filas con errores.",
    "projectsPage.downloadErrors": "Descargar errores (CSV)",
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

const mockDownload = () => {
  const createObjectURL = vi.fn(() => "blob:download");
  const revokeObjectURL = vi.fn();
  vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });
  let downloadedName = "";
  const click = vi
    .spyOn(HTMLAnchorElement.prototype, "click")
    .mockImplementation(function handleClick() {
      downloadedName = this.download;
    });
  return {
    createObjectURL,
    revokeObjectURL,
    getName: () => downloadedName,
    restore: () => {
      click.mockRestore();
      vi.unstubAllGlobals();
    },
  };
};

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
    expect(screen.getByText("Arrastra archivos o haz clic")).toBeInTheDocument();
    expect(screen.getAllByText("Nombre del Proyecto").length).toBeGreaterThan(0);
    expect(screen.getByText("Código")).toBeInTheDocument();
    expect(screen.getByText("No se usará")).toBeInTheDocument();
    expect(screen.getAllByText("· Requerida")).toHaveLength(3);
    expect(screen.getByText("2 filas listas para importar.")).toBeInTheDocument();

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

  it("downloads the local template", async () => {
    const download = mockDownload();

    render(<CsvImportModal open onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Descargar plantilla" }));

    const blob = download.createObjectURL.mock.calls[0][0];
    const content = await blob.text();
    expect(download.getName()).toBe("plantilla-proyectos.csv");
    expect(content).toContain("nombre,codigo,direccion");
    expect(content).toContain("Proyecto Ejemplo");
    expect(projectsApi.import).not.toHaveBeenCalled();

    download.restore();
  });

  it("shows row errors returned by the API as a warning", async () => {
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
    expect(showToast).toHaveBeenCalledWith(
      "Se importaron 1 proyectos; 1 filas con errores.",
      "warning"
    );
  });

  it("downloads the row errors as CSV", async () => {
    projectsApi.import.mockResolvedValue({
      imported: 0,
      updated: 0,
      skipped: 0,
      errors: [{ row: 3, message: "name es obligatorio" }],
    });
    const download = mockDownload();

    render(<CsvImportModal open onClose={vi.fn()} />);
    uploadFile(validFile());
    fireEvent.click(await screen.findByRole("button", { name: "Importar 2 proyectos" }));
    fireEvent.click(await screen.findByRole("button", { name: "Descargar errores (CSV)" }));

    const blob = download.createObjectURL.mock.calls[0][0];
    expect(await blob.text()).toContain("3,name es obligatorio");
    expect(download.getName()).toBe("errores-importacion-proyectos.csv");

    download.restore();
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

  it("validates rows in the preview", async () => {
    render(<CsvImportModal open onClose={vi.fn()} />);
    uploadFile(
      new File(
        ["nombre,direccion,precio_m2\nAltos,Calle 1,abc\n"],
        "invalid.csv",
        { type: "text/csv" }
      )
    );

    expect(
      await screen.findByText("0 filas listas, 1 con errores.")
    ).toBeInTheDocument();
    expect(screen.getByText("No hay filas válidas para importar.")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Importar 0 filas válidas" })
    ).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Ver filas con errores (1)" }));

    expect(
      screen.getByText("Fila 2: Precio por Unidad debe ser un número")
    ).toBeInTheDocument();
  });

  it("makes the duplicate options mutually exclusive and warns about the key", async () => {
    render(<CsvImportModal open onClose={vi.fn()} />);
    uploadFile(
      new File(
        ["nombre,direccion,precio_m2\nAltos,Calle 1,1500\n"],
        "projects.csv",
        { type: "text/csv" }
      )
    );

    expect(
      await screen.findByText(
        "Para actualizar u omitir duplicados, incluye la columna codigo (o guid)."
      )
    ).toBeInTheDocument();

    const update = screen.getByRole("switch", { name: "Actualizar existentes" });
    const skip = screen.getByRole("switch", { name: "Omitir duplicados" });
    expect(update).toHaveAttribute("aria-checked", "false");
    expect(skip).toHaveAttribute("aria-checked", "true");

    fireEvent.click(update);
    expect(update).toHaveAttribute("aria-checked", "true");
    expect(skip).toHaveAttribute("aria-checked", "false");

    fireEvent.click(skip);
    expect(skip).toHaveAttribute("aria-checked", "true");
    expect(update).toHaveAttribute("aria-checked", "false");
  });

  it("rejects files that are not CSV", async () => {
    render(<CsvImportModal open onClose={vi.fn()} />);
    uploadFile(new File(["hello"], "notes.txt", { type: "text/plain" }));

    expect(
      await screen.findByText("Selecciona un archivo con extensión .csv.")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Importar CSV" })).toBeDisabled();
  });

  it("explains empty files and files without data rows", async () => {
    render(<CsvImportModal open onClose={vi.fn()} />);
    uploadFile(new File(["\uFEFF\n"], "empty.csv", { type: "text/csv" }));

    expect(
      await screen.findByText("El archivo está vacío o no tiene encabezados.")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    uploadFile(
      new File(["nombre,direccion,precio_m2\n"], "rows.csv", {
        type: "text/csv",
      })
    );

    expect(
      await screen.findByText("El archivo no contiene filas de datos.")
    ).toBeInTheDocument();
  });

  it("normalizes semicolon-delimited files before upload", async () => {
    projectsApi.import.mockResolvedValue({
      imported: 1,
      updated: 0,
      skipped: 0,
      errors: [],
    });

    render(<CsvImportModal open onClose={vi.fn()} />);
    uploadFile(
      new File(
        ["nombre;direccion;precio_m2\nAltos, Norte;Calle 1;1500\n"],
        "semicolon.csv",
        { type: "text/csv" }
      )
    );

    expect(
      await screen.findByText(
        "El archivo se convirtió a CSV UTF-8 separado por comas antes de importarlo."
      )
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Importar 1 proyectos" }));
    await waitFor(() => expect(projectsApi.import).toHaveBeenCalledTimes(1));

    const uploaded = projectsApi.import.mock.calls[0][0].get("file");
    expect(await uploaded.text()).toContain('"Altos, Norte",Calle 1,1500');
  });

  it("normalizes Windows-1252 files before upload", async () => {
    projectsApi.import.mockResolvedValue({
      imported: 1,
      updated: 0,
      skipped: 0,
      errors: [],
    });
    const source = "nombre,direccion,precio_m2\nAltos,Panam\u00e1,1500\n";
    const bytes = Uint8Array.from(source, (char) => char.charCodeAt(0) & 0xff);

    render(<CsvImportModal open onClose={vi.fn()} />);
    uploadFile(new File([bytes], "legacy.csv", { type: "text/csv" }));

    expect(
      await screen.findByText(
        "El archivo se convirtió a CSV UTF-8 separado por comas antes de importarlo."
      )
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Importar 1 proyectos" }));
    await waitFor(() => expect(projectsApi.import).toHaveBeenCalledTimes(1));

    const uploaded = projectsApi.import.mock.calls[0][0].get("file");
    expect(await uploaded.text()).toContain("Altos,Panamá,1500");
  });

  it("resets the file and result from the import-another action", async () => {
    projectsApi.import.mockResolvedValue({
      imported: 1,
      updated: 0,
      skipped: 0,
      errors: [],
    });

    render(<CsvImportModal open onClose={vi.fn()} />);
    uploadFile(validFile());
    fireEvent.click(await screen.findByRole("button", { name: "Importar 2 proyectos" }));
    expect(await screen.findByText("Resultado de la importación")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Importar otro archivo" }));

    expect(screen.queryByText("Resultado de la importación")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Importar CSV" })).toBeDisabled();
  });

  it("shows a danger banner when the CSV cannot be read", async () => {
    const file = new File(["broken"], "broken.csv", { type: "text/csv" });
    file.arrayBuffer = vi.fn().mockRejectedValue(new Error("cannot read"));

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
