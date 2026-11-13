import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { faCloudArrowUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocale } from "@/contexts/LocaleContext";
import { useToast } from "@/contexts/ToastContext";
import { Banner, Button, Dialog, Select, Toggle } from "@/shared/ui";
import { sellerApi } from "../api";
import {
  CSV_FIELDS,
  downloadHistoricalTemplate,
  parseAmount,
  parseCsv,
  parseDate,
  readText,
  suggestMapping,
} from "../utils/historicalCsv";

function HistoricalImportSheet({ open, onClose, onImported }) {
  const { t } = useLocale();
  const { showToast } = useToast();
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({});
  const [markHistorical, setMarkHistorical] = useState(true);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [createCommission, setCreateCommission] = useState(true);
  const [showErrors, setShowErrors] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setFile(null);
    setHeaders([]);
    setRows([]);
    setMapping({});
    setShowErrors(false);
    setImporting(false);
    setError(null);
  }, [open]);

  const handleFile = async (files) => {
    const selected = files?.[0];
    if (!selected) {
      setFile(null);
      return;
    }

    const isCsv =
      /\.csv$/i.test(selected.name) ||
      selected.type === "text/csv" ||
      selected.type === "application/vnd.ms-excel";
    if (!isCsv) {
      setError(t("historical.import.invalidFile"));
      return;
    }

    try {
      const text = await readText(selected);
      const parsed = parseCsv(text);
      if (parsed.length < 2) {
        setError(t("historical.import.emptyFile"));
        return;
      }

      setFile(selected);
      setHeaders(parsed[0].map((header) => String(header).trim()));
      setRows(parsed.slice(1));
      setMapping(suggestMapping(parsed[0]));
      setShowErrors(false);
      setError(null);
    } catch {
      setError(t("historical.import.invalidFile"));
    }
  };

  const analysis = useMemo(() => {
    if (!file || rows.length === 0) return null;

    const cell = (row, key) => {
      const index = mapping[key];
      if (index === undefined || index === "") return "";
      return String(row[index] ?? "").trim();
    };

    const valid = [];
    const errors = [];

    rows.forEach((row, rowIndex) => {
      if (!row.some((value) => String(value).trim() !== "")) return;

      const reasons = [];
      const name = cell(row, "full_name");
      const identity = cell(row, "identity");
      const price = parseAmount(cell(row, "sale_price"));
      const saleDate = parseDate(cell(row, "sale_date"));

      CSV_FIELDS.filter((field) => field.required).forEach((field) => {
        if (mapping[field.key] === undefined || mapping[field.key] === "") {
          reasons.push(
            t("historical.import.reasonUnmapped", { field: t(field.labelKey) })
          );
        }
      });

      if (!name) reasons.push(t("historical.import.reasonName"));
      if (!identity) reasons.push(t("historical.import.reasonIdentity"));
      if (price === null || price <= 0) {
        reasons.push(t("historical.import.reasonPrice"));
      }
      if (!saleDate) reasons.push(t("historical.import.reasonDate"));

      const entry = {
        rowNumber: rowIndex + 2,
        reasons,
        values: {
          full_name: name,
          identity,
          project_name: cell(row, "project_name"),
          sale_price: price,
          sale_date: cell(row, "sale_date"),
        },
      };

      if (reasons.length > 0) {
        errors.push(entry);
      } else {
        valid.push(entry);
      }
    });

    return { valid, errors };
  }, [file, mapping, rows, t]);

  const handleImport = async () => {
    if (!file || !analysis?.valid.length) return;

    setImporting(true);
    setError(null);
    try {
      const result = await sellerApi.importHistoricalSales(file, {
        mark_historical: markHistorical,
        skip_duplicates: skipDuplicates,
        create_commission: createCommission,
        mapping: JSON.stringify(mapping),
      });
      const imported = Number(
        result?.imported ?? result?.valid ?? analysis.valid.length
      );
      const skipped =
        Number(result?.skipped ?? 0) +
        (Array.isArray(result?.skipped_rows) ? result.skipped_rows.length : 0);
      const rowErrors = Array.isArray(result?.errors) ? result.errors : [];
      showToast(
        t("historical.import.imported", { count: imported }),
        rowErrors.length ? "warning" : "success"
      );
      onImported?.();
      if (rowErrors.length || skipped > 0) {
        setError(
          t("historical.import.partial", {
            imported,
            skipped,
            errors: rowErrors.length,
          })
        );
      } else {
        onClose?.();
      }
    } catch (err) {
      setError(
        err?.errors?.join(", ") ||
          err?.message ||
          t("historical.import.importError")
      );
    } finally {
      setImporting(false);
    }
  };

  const canImport = Boolean(file && analysis?.valid.length);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      side="right"
      title={t("historical.import.title")}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={importing}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleImport}
            loading={importing}
            disabled={!canImport}
          >
            {t("historical.import.importAction")}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {error && <Banner tone="danger">{error}</Banner>}

        <div
          className="flex flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-line-strong bg-surface-2 px-4 py-6 text-center"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            handleFile(event.dataTransfer.files);
          }}
        >
          <FontAwesomeIcon
            icon={faCloudArrowUp}
            aria-hidden="true"
            className="h-5 w-5 text-ink-3"
          />
          <label
            htmlFor="historical-csv"
            className="cursor-pointer text-body font-semibold text-ink-2 hover:text-brand"
          >
            {t("historical.import.dropzone")}
          </label>
          <p className="text-micro text-ink-3">
            {file ? file.name : t("historical.import.noFile")}
          </p>
          <input
            id="historical-csv"
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(event) => handleFile(event.target.files)}
          />
          <button
            type="button"
            onClick={() => downloadHistoricalTemplate()}
            className="text-micro font-semibold text-brand hover:underline"
          >
            {t("historical.import.template")}
          </button>
        </div>

        <section className="space-y-2">
          <h3 className="text-micro font-bold uppercase tracking-wide text-ink-3">
            {t("historical.import.optionsTitle")}
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-label text-ink-2">
                {t("historical.import.markHistorical")}
              </span>
              <Toggle
                checked={markHistorical}
                onChange={setMarkHistorical}
                label={t("historical.import.markHistorical")}
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-label text-ink-2">
                {t("historical.import.skipDuplicates")}
              </span>
              <Toggle
                checked={skipDuplicates}
                onChange={setSkipDuplicates}
                label={t("historical.import.skipDuplicates")}
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-label text-ink-2">
                {t("historical.import.createCommission")}
              </span>
              <Toggle
                checked={createCommission}
                onChange={setCreateCommission}
                label={t("historical.import.createCommission")}
              />
            </div>
          </div>
        </section>

        <div className="border-t border-line" />

        <section className="space-y-2">
          <h3 className="text-micro font-bold uppercase tracking-wide text-ink-3">
            {t("historical.import.mappingTitle")}
          </h3>
          {headers.length === 0 ? (
            <p className="text-label text-ink-3">
              {t("historical.import.noColumns")}
            </p>
          ) : (
            <div className="space-y-2">
              {CSV_FIELDS.map((field) => (
                <div
                  key={field.key}
                  className="flex flex-wrap items-center justify-between gap-2"
                >
                  <span className="text-label text-ink-2">
                    {t(field.labelKey)}
                    {field.required && <span className="text-danger"> *</span>}
                  </span>
                  <Select
                    aria-label={`${t("historical.import.mappingTitle")} ${t(
                      field.labelKey
                    )}`}
                    value={mapping[field.key] ?? ""}
                    onChange={(event) =>
                      setMapping((previous) => ({
                        ...previous,
                        [field.key]: event.target.value,
                      }))
                    }
                    className="max-w-[220px]"
                  >
                    <option value="">{t("historical.import.unmapped")}</option>
                    {headers.map((header, index) => (
                      <option key={`${header}-${index}`} value={String(index)}>
                        {header ||
                          t("historical.import.column", {
                            number: index + 1,
                          })}
                      </option>
                    ))}
                  </Select>
                </div>
              ))}
            </div>
          )}
        </section>

        {analysis && (
          <section className="space-y-1">
            <p className="text-label text-ink-2" role="status">
              {analysis.errors.length > 0
                ? t("historical.import.summary", {
                    valid: analysis.valid.length,
                    errors: analysis.errors.length,
                  })
                : t("historical.import.summaryNoErrors", {
                    valid: analysis.valid.length,
                  })}
            </p>
            {analysis.errors.length > 0 && (
              <button
                type="button"
                onClick={() => setShowErrors((value) => !value)}
                className="text-label font-semibold text-brand hover:underline"
              >
                {t("historical.import.viewErrors", {
                  count: analysis.errors.length,
                })}
              </button>
            )}
            {showErrors && analysis.errors.length > 0 && (
              <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded-control border border-line bg-surface-2 p-3">
                {analysis.errors.map((item) => (
                  <li key={item.rowNumber} className="text-micro text-danger">
                    {t("historical.import.errorRow", {
                      row: item.rowNumber,
                      reason: item.reasons.join(", "),
                    })}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </Dialog>
  );
}

HistoricalImportSheet.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onImported: PropTypes.func,
};

export default HistoricalImportSheet;
