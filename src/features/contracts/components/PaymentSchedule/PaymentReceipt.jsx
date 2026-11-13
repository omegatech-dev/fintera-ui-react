import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf, faImage, faReceipt } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/shared/ui";
import { formatCurrency, formatDate } from "@/shared/utils/formatters";
import { paymentsApi } from "@/features/payments/api";

const hasPaymentReceipt = (row) =>
  Boolean(row?.has_receipt || row?.receipt_url);

const isPdfPaymentReceipt = (row) => {
  const flag = row?.is_pdf;
  if (flag === true || flag === 1 || flag === "1" || flag === "true") {
    return true;
  }
  return /\.pdf(?:$|[?#])/i.test(String(row?.receipt_url || ""));
};

const receiptFileName = (row, isPdf) =>
  `comprobante-${row?.id ?? "pago"}.${isPdf ? "pdf" : "jpg"}`;

const statusLabel = (row, t) => {
  const status = String(row?.status || "").toLowerCase();
  const map = {
    paid: "paymentSchedule.paid",
    pending: "paymentSchedule.pending",
    overdue: "paymentSchedule.overdue",
    readjustment: "paymentSchedule.readjustment",
  };
  return map[status] ? t(map[status]) : row?.status || "—";
};

function MetaRow({ label, value }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="min-w-0">
      <dt className="text-micro font-medium text-ink-3">{label}</dt>
      <dd className="mt-0.5 break-words text-body font-semibold text-ink">
        {value}
      </dd>
    </div>
  );
}

MetaRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node,
};

export default function PaymentReceipt({ row, t, className = "" }) {
  const receiptAvailable = hasPaymentReceipt(row);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [url, setUrl] = useState(null);
  const [isPdf, setIsPdf] = useState(() => isPdfPaymentReceipt(row));
  const urlRef = useRef(null);
  const openRef = useRef(false);
  const requestRef = useRef(0);
  const closeRef = useRef(null);

  const revokeUrl = useCallback(() => {
    if (urlRef.current) {
      window.URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  }, []);

  useEffect(
    () => () => {
      openRef.current = false;
      requestRef.current += 1;
      revokeUrl();
    },
    [revokeUrl]
  );

  useEffect(() => {
    setIsPdf(isPdfPaymentReceipt(row));
  }, [row]);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus?.();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const loadReceipt = useCallback(async () => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    setLoading(true);
    setError(null);

    try {
      const blob = await paymentsApi.downloadReceipt(row.id);
      if (requestRef.current !== requestId || !openRef.current) return;

      const objectUrl = window.URL.createObjectURL(blob);
      revokeUrl();
      urlRef.current = objectUrl;
      setUrl(objectUrl);
      setIsPdf(
        isPdfPaymentReceipt(row) ||
          String(blob?.type || "").toLowerCase() === "application/pdf"
      );
    } catch (err) {
      if (requestRef.current === requestId && openRef.current) {
        setError(err?.message || t("paymentSchedule.receiptLoadError"));
      }
    } finally {
      if (requestRef.current === requestId) setLoading(false);
    }
  }, [revokeUrl, row, t]);

  const handleOpen = () => {
    openRef.current = true;
    setOpen(true);
    if (!urlRef.current) loadReceipt();
  };

  const handleClose = () => {
    openRef.current = false;
    requestRef.current += 1;
    setOpen(false);
    setLoading(false);
    setError(null);
    setUrl(null);
    revokeUrl();
  };

  const handleDownload = () => {
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = receiptFileName(row, isPdf);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const amount = row?.amount ?? row?.value ?? row?.payment_amount;

  return (
    <>
      <div className={`flex min-w-0 items-center justify-end ${className}`}>
        {receiptAvailable ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={handleOpen}
            className="gap-1.5"
          >
            <FontAwesomeIcon icon={isPdf ? faFilePdf : faImage} />
            {t("paymentSchedule.viewReceipt")}
          </Button>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-micro text-ink-3">
            <FontAwesomeIcon icon={faReceipt} />
            {t("paymentSchedule.noReceipt")}
          </span>
        )}
      </div>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[80] flex justify-end">
            <div
              className="absolute inset-0 bg-ink/30 backdrop-blur-[1px]"
              aria-hidden="true"
              onClick={handleClose}
            />
            <aside
              role="dialog"
              aria-modal="true"
              aria-labelledby="receipt-sheet-title"
              className="relative flex h-full w-[520px] max-w-full flex-col border-l border-line bg-surface shadow-pop"
            >
              <header className="flex shrink-0 items-center justify-between border-b border-line px-5 py-4">
                <div>
                  <h2
                    id="receipt-sheet-title"
                    className="text-title font-bold text-ink"
                  >
                    {t("paymentSchedule.receipt")}
                  </h2>
                  <p className="mt-0.5 text-micro text-ink-3">
                    {row?.description || t("paymentSchedule.receiptDetails")}
                  </p>
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={handleClose}
                  aria-label={t("common.close")}
                  className="flex h-9 w-9 items-center justify-center rounded-control text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="h-4 w-4"
                  >
                    <path
                      d="M6 18L18 6M6 6l12 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                {loading && (
                  <div className="flex min-h-[240px] items-center justify-center rounded-card border border-line bg-surface-2">
                    <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                  </div>
                )}

                {!loading && error && (
                  <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-card border border-line bg-surface-2 p-6 text-center">
                    <p className="text-body text-ink-2">{error}</p>
                    <Button size="sm" variant="secondary" onClick={loadReceipt}>
                      {t("common.retry")}
                    </Button>
                  </div>
                )}

                {!loading && !error && url && (
                  <div className="overflow-hidden rounded-card border border-line bg-surface-2">
                    {isPdf ? (
                      <iframe
                        src={url}
                        title={t("paymentSchedule.receiptPdf")}
                        className="h-[46vh] min-h-[260px] w-full border-0"
                      />
                    ) : (
                      <img
                        src={url}
                        alt={t("paymentSchedule.receipt")}
                        className="max-h-[46vh] w-full object-contain"
                      />
                    )}
                  </div>
                )}

                <section className="mt-5">
                  <h3 className="text-[15px] font-bold text-ink">
                    {t("paymentSchedule.receiptInformation")}
                  </h3>
                  <dl className="mt-3 grid grid-cols-1 gap-4 rounded-card border border-line bg-surface-2 p-4 sm:grid-cols-2">
                    <MetaRow
                      label={t("paymentSchedule.amount")}
                      value={amount != null ? formatCurrency(amount) : "—"}
                    />
                    <MetaRow
                      label={t("paymentSchedule.status")}
                      value={statusLabel(row, t)}
                    />
                    <MetaRow
                      label={t("paymentSchedule.dueDate")}
                      value={formatDate(row?.due_date)}
                    />
                    <MetaRow
                      label={t("paymentSchedule.reference")}
                      value={row?.authorization_number || "—"}
                    />
                    <MetaRow
                      label={t("paymentSchedule.originAccount")}
                      value={row?.payer_account_name || "—"}
                    />
                    <MetaRow
                      label={t("paymentSchedule.paymentDate")}
                      value={formatDate(row?.paid_at || row?.payment_date)}
                    />
                    <MetaRow
                      label={t("paymentSchedule.approved")}
                      value={formatDate(row?.approved_at)}
                    />
                    <MetaRow
                      label={t("paymentSchedule.description")}
                      value={row?.description || "—"}
                    />
                  </dl>
                </section>
              </div>

              <footer className="flex shrink-0 justify-end gap-2 border-t border-line px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                <Button variant="secondary" onClick={handleClose}>
                  {t("common.close")}
                </Button>
                {url && (
                  <Button onClick={handleDownload}>
                    {t("paymentSchedule.downloadReceipt")}
                  </Button>
                )}
              </footer>
            </aside>
          </div>,
          document.body
        )}
    </>
  );
}

PaymentReceipt.propTypes = {
  row: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  className: PropTypes.string,
};
