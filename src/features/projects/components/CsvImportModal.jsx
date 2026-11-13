import { useRef, useState } from "react";
import PropTypes from "prop-types";
import { useLocale } from "../../../contexts/LocaleContext";
import { useToast } from "../../../contexts/ToastContext";
import { projectsApi } from "../api";
import { Banner, Button, Dialog, FileUpload, Toggle } from "@/shared/ui";

const TEMPLATE_HEADERS = [
  "name",
  "code",
  "address",
  "city",
  "price_per_square_unit",
  "lot_count",
  "measurement_unit",
  "project_type",
  "delivery_date",
  "description",
];

const TARGET_FIELDS = [
  {
    key: "name",
    labelKey: "name",
    aliases: ["nombre", "proyecto", "project", "project_name", "nombre_proyecto"],
  },
  {
    key: "code",
    labelKey: "code",
    aliases: ["codigo", "code", "clave", "project_code", "codigo_proyecto"],
  },
  {
    key: "address",
    labelKey: "address",
    aliases: ["direccion", "address", "ubicacion", "location"],
  },
  {
    key: "city",
    labelKey: "city",
    aliases: ["ciudad", "city", "zona", "zone", "municipio"],
  },
  {
    key: "price_per_square_unit",
    labelKey: "pricePerUnit",
    aliases: [
      "precio",
      "precio_m2",
      "precio_por_m2",
      "precio_por_metro_cuadrado",
      "precio_unidad",
      "precio_por_unidad",
      "price_per_unit",
    ],
  },
  {
    key: "lot_count",
    labelKey: "lotsCount",
    aliases: [
      "lotes",
      "lots",
      "lot_count",
      "lots_count",
      "cantidad_de_lotes",
      "cantidad_lotes",
      "numero_de_lotes",
      "num_lotes",
      "total_lotes",
    ],
  },
  {
    key: "measurement_unit",
    labelKey: "measurementUnit",
    aliases: ["unidad", "unidad_medida", "unidad_de_medida", "measurement_unit"],
  },
  {
    key: "project_type",
    labelKey: "projectType",
    aliases: ["tipo", "tipo_proyecto", "tipo_de_proyecto", "project_type"],
  },
  {
    key: "delivery_date",
    labelKey: "deliveryDate",
    aliases: ["entrega", "fecha", "fecha_entrega", "fecha_de_entrega", "delivery_date"],
  },
  {
    key: "description",
    labelKey: "description",
    aliases: ["descripcion", "description", "detalles", "notas"],
  },
];

function normalizeHeader(header) {
  return header
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]+/g, "_");
}

const FIELD_BY_HEADER = new Map();
TARGET_FIELDS.forEach((field) => {
  FIELD_BY_HEADER.set(field.key, field);
  field.aliases.forEach((alias) => FIELD_BY_HEADER.set(normalizeHeader(alias), field));
});

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

function analyzeCsv(text) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  const headers = parseCsvLine(lines[0] ?? "").filter(Boolean);

  if (!headers.length) {
    throw new Error("empty-csv");
  }

  const rows = lines
    .slice(1)
    .filter((line) => parseCsvLine(line).some((value) => value.length > 0));

  return {
    mapping: headers.map((header) => ({
      header,
      field: FIELD_BY_HEADER.get(normalizeHeader(header)) ?? null,
    })),
    rowCount: rows.length,
  };
}

function CsvImportModal({ open, onClose, onImported }) {
  const { t, locale } = useLocale();
  const { showToast } = useToast();
  const [files, setFiles] = useState([]);
  const [mapping, setMapping] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [parseError, setParseError] = useState(false);
  const [uploadKey, setUploadKey] = useState(0);
  const [updateExisting, setUpdateExisting] = useState(false);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [importing, setImporting] = useState(false);
  const analysisRef = useRef(0);

  const resetFileState = () => {
    analysisRef.current += 1;
    setFiles([]);
    setMapping([]);
    setRowCount(0);
    setParseError(false);
    setUploadKey((key) => key + 1);
  };

  const close = () => {
    resetFileState();
    onClose();
  };

  const analyzeFile = async (file) => {
    const analysisId = analysisRef.current + 1;
    analysisRef.current = analysisId;
    setMapping([]);
    setRowCount(0);
    setParseError(false);

    try {
      const text = await file.text();
      if (analysisId !== analysisRef.current) return;
      const result = analyzeCsv(text);
      setMapping(result.mapping);
      setRowCount(result.rowCount);
    } catch {
      if (analysisId !== analysisRef.current) return;
      setMapping([]);
      setRowCount(0);
      setParseError(true);
    }
  };

  const handleFilesChange = (nextFiles) => {
    setFiles(nextFiles);
    const [nextFile] = nextFiles;

    if (nextFile) {
      analyzeFile(nextFile);
      return;
    }

    resetFileState();
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([`\uFEFF${TEMPLATE_HEADERS.join(",")}\n`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download =
      locale === "en" ? "projects-template.csv" : "plantilla-proyectos.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async () => {
    const file = files[0];
    if (!file || rowCount === 0 || parseError) return;
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("options[update_existing]", updateExisting ? "1" : "0");
      formData.append("options[skip_duplicates]", skipDuplicates ? "1" : "0");
      await projectsApi.import(formData);
      showToast(t("projectsPage.importCompleted"), "success");
      onImported?.();
      close();
    } catch (err) {
      showToast(`${t("projectsPage.importErrorPrefix")} ${err.message}`, "error");
    } finally {
      setImporting(false);
    }
  };

  const canImport = files.length > 0 && rowCount > 0 && !parseError;
  const importLabel =
    mapping.length > 0
      ? t("projectsPage.importCount", { count: rowCount })
      : t("projectsPage.importCSV");

  return (
    <Dialog
      open={open}
      onClose={close}
      title={t("projectsPage.importCSV")}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={importing}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            loading={importing}
            disabled={!canImport}
          >
            {importLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <FileUpload
            key={uploadKey}
            label={t("projectsPage.importCSV")}
            accept=".csv,text/csv"
            multiple={false}
            files={files}
            onChange={handleFilesChange}
          />
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="text-label font-semibold text-brand hover:underline"
          >
            {t("projectsPage.downloadTemplate")}
          </button>
        </div>

        {parseError && (
          <Banner
            tone="danger"
            action={
              <Button variant="secondary" size="sm" onClick={resetFileState}>
                {t("common.retry")}
              </Button>
            }
          >
            {t("projectsPage.importError")}
          </Banner>
        )}

        <div className="space-y-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-3">
            {t("projectsPage.importOptions")}
          </p>
          <div className="flex items-center justify-between gap-3">
            <span className="text-body font-medium text-ink-2">
              {t("projectsPage.updateExisting")}
            </span>
            <Toggle
              checked={updateExisting}
              onChange={setUpdateExisting}
              label={t("projectsPage.updateExisting")}
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-body font-medium text-ink-2">
              {t("projectsPage.skipDuplicates")}
            </span>
            <Toggle
              checked={skipDuplicates}
              onChange={setSkipDuplicates}
              label={t("projectsPage.skipDuplicates")}
            />
          </div>
        </div>

        <div className="h-px bg-line" />

        {mapping.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-ink-3">
              {t("projectsPage.columnMapping")}
            </p>
            <ul className="space-y-1.5">
              {mapping.map(({ header, field }, index) => (
                <li
                  key={`${header}-${index}`}
                  className="flex items-center justify-between gap-3"
                >
                  <span
                    className={`min-w-0 truncate text-body ${
                      field ? "font-medium text-ink-2" : "text-ink-3"
                    }`}
                  >
                    {header}
                  </span>
                  <span
                    className={`shrink-0 text-right text-body ${
                      field
                        ? "font-semibold text-ink"
                        : "font-medium text-warning"
                    }`}
                  >
                    {field
                      ? t(`projects.${field.labelKey}`)
                      : t("projectsPage.notUsed")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {mapping.length > 0 && (
          <p className="text-micro font-medium text-ink-3">
            {t("projectsPage.rowsDetected", { count: rowCount })}
          </p>
        )}
      </div>
    </Dialog>
  );
}

CsvImportModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onImported: PropTypes.func,
};

export default CsvImportModal;
