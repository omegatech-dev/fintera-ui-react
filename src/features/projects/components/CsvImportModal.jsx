import { useRef, useState } from "react";
import PropTypes from "prop-types";
import { useLocale } from "../../../contexts/LocaleContext";
import { useToast } from "../../../contexts/ToastContext";
import { projectsApi } from "../api";
import { analyzeCsv } from "../csvImport";
import { Banner, Button, Dialog, FileUpload, Toggle } from "@/shared/ui";

const EMPTY_RESULT = null;

function CsvImportModal({ open, onClose, onImported }) {
  const { t, locale } = useLocale();
  const { showToast } = useToast();
  const [files, setFiles] = useState([]);
  const [mapping, setMapping] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [missingRequired, setMissingRequired] = useState([]);
  const [parseError, setParseError] = useState(false);
  const [uploadKey, setUploadKey] = useState(0);
  const [updateExisting, setUpdateExisting] = useState(false);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [importing, setImporting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [result, setResult] = useState(EMPTY_RESULT);
  const analysisRef = useRef(0);

  const resetFileState = () => {
    analysisRef.current += 1;
    setFiles([]);
    setMapping([]);
    setRowCount(0);
    setMissingRequired([]);
    setParseError(false);
    setResult(EMPTY_RESULT);
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
    setMissingRequired([]);
    setParseError(false);
    setResult(EMPTY_RESULT);

    try {
      const text = await file.text();
      if (analysisId !== analysisRef.current) return;
      const analysis = analyzeCsv(text);
      setMapping(analysis.mapping);
      setRowCount(analysis.rowCount);
      setMissingRequired(analysis.missingRequired);
    } catch {
      if (analysisId !== analysisRef.current) return;
      setMapping([]);
      setRowCount(0);
      setMissingRequired([]);
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

  const handleDownloadTemplate = async () => {
    setDownloading(true);
    try {
      const blob = await projectsApi.importTemplate();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        locale === "en" ? "projects-template.csv" : "plantilla-proyectos.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      showToast(
        `${t("projectsPage.templateDownloadError")} ${err.message || ""}`.trim(),
        "error"
      );
    } finally {
      setDownloading(false);
    }
  };

  const handleSubmit = async () => {
    const file = files[0];
    if (!file || rowCount === 0 || parseError || missingRequired.length > 0) {
      return;
    }
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("update_existing", updateExisting ? "1" : "0");
      formData.append("skip_duplicates", skipDuplicates ? "1" : "0");

      const summary = await projectsApi.import(formData);
      const normalized = {
        imported: Number(summary?.imported) || 0,
        updated: Number(summary?.updated) || 0,
        skipped: Number(summary?.skipped) || 0,
        errors: Array.isArray(summary?.errors) ? summary.errors : [],
      };
      setResult(normalized);
      showToast(
        t("projectsPage.importCompleted"),
        normalized.errors.length > 0 ? "error" : "success"
      );
      onImported?.();
    } catch (err) {
      showToast(`${t("projectsPage.importErrorPrefix")} ${err.message}`, "error");
    } finally {
      setImporting(false);
    }
  };

  const canImport =
    files.length > 0 &&
    rowCount > 0 &&
    !parseError &&
    missingRequired.length === 0;
  const importLabel =
    mapping.length > 0
      ? t("projectsPage.importCount", { count: rowCount })
      : t("projectsPage.importCSV");
  const missingLabels = missingRequired
    .map((field) => t(`projects.${field.labelKey}`))
    .join(", ");

  return (
    <Dialog
      open={open}
      onClose={close}
      title={t("projectsPage.importCSV")}
      size="md"
      footer={
        result ? (
          <Button onClick={close}>{t("common.close")}</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={close} disabled={importing}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSubmit} loading={importing} disabled={!canImport}>
              {importLabel}
            </Button>
          </>
        )
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
            disabled={downloading}
            className="text-label font-semibold text-brand hover:underline disabled:cursor-not-allowed disabled:opacity-60"
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

        {!parseError && missingRequired.length > 0 && (
          <Banner tone="danger">
            {t("projectsPage.missingRequiredColumns", { columns: missingLabels })}
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
                      field ? "font-semibold text-ink" : "font-medium text-warning"
                    }`}
                  >
                    {field ? t(`projects.${field.labelKey}`) : t("projectsPage.notUsed")}
                    {field?.required && (
                      <span className="ml-1 text-micro font-medium text-ink-3">
                        · {t("projectsPage.requiredColumn")}
                      </span>
                    )}
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

        {result && (
          <div className="space-y-2">
            <Banner tone={result.errors.length > 0 ? "danger" : "success"}>
              {t("projectsPage.importSummary")}
            </Banner>
            <dl className="grid grid-cols-3 gap-2 rounded-control border border-line bg-canvas p-3 text-center">
              <div>
                <dt className="text-micro font-medium text-ink-3">
                  {t("projectsPage.importedCount")}
                </dt>
                <dd className="text-title font-bold text-ink">{result.imported}</dd>
              </div>
              <div>
                <dt className="text-micro font-medium text-ink-3">
                  {t("projectsPage.updatedCount")}
                </dt>
                <dd className="text-title font-bold text-ink">{result.updated}</dd>
              </div>
              <div>
                <dt className="text-micro font-medium text-ink-3">
                  {t("projectsPage.skippedCount")}
                </dt>
                <dd className="text-title font-bold text-ink">{result.skipped}</dd>
              </div>
            </dl>
            {result.errors.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-label font-semibold text-danger">
                  {t("projectsPage.rowErrors")}
                </p>
                <ul className="max-h-40 space-y-1 overflow-y-auto rounded-control border border-line bg-canvas p-3">
                  {result.errors.map((error, index) => (
                    <li
                      key={`${error.row}-${index}`}
                      className="text-micro text-ink-2"
                    >
                      {t("projectsPage.rowError", {
                        row: error.row,
                        message: error.message,
                      })}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
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
