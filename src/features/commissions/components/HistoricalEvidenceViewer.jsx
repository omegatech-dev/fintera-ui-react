import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilePdf,
  faImage,
  faUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/shared/ui";
import { useLocale } from "@/contexts/LocaleContext";
import { useToast } from "@/contexts/ToastContext";
import { evidenceFileName, sellerApi } from "@/features/seller/api";

const IMAGE_URL_PATTERN = /\.(png|jpe?g)(?:$|[?#])/i;

const isPdfEvidence = (evidencePath, contentType) =>
  /\.pdf(?:$|[?#])/i.test(String(evidencePath || "")) ||
  String(contentType || "").toLowerCase().includes("application/pdf");

const isImageContentType = (contentType) =>
  String(contentType || "").toLowerCase().startsWith("image/");

function HistoricalEvidenceViewer({ saleId, evidencePath = "", className = "" }) {
  const { t } = useLocale();
  const { showToast } = useToast();
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [evidence, setEvidence] = useState(null);
  const [downloading, setDownloading] = useState(false);
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

  const loadEvidence = useCallback(async () => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    setLoading(true);
    setError(null);

    try {
      const result = await sellerApi.fetchHistoricalEvidence(saleId);
      if (requestRef.current !== requestId || !openRef.current) {
        if (result?.url) window.URL.revokeObjectURL(result.url);
        return;
      }
      revokeUrl();
      if (result.kind === "file") urlRef.current = result.url;
      setEvidence(result);
    } catch (err) {
      if (requestRef.current === requestId && openRef.current) {
        setError(err?.message || t("historical.evidenceViewer.loadError"));
      }
    } finally {
      if (requestRef.current === requestId) setLoading(false);
    }
  }, [revokeUrl, saleId, t]);

  const handleOpen = () => {
    openRef.current = true;
    setOpen(true);
    if (!urlRef.current) loadEvidence();
  };

  const handleClose = () => {
    openRef.current = false;
    requestRef.current += 1;
    setOpen(false);
    setLoading(false);
    setError(null);
    setEvidence(null);
    revokeUrl();
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await sellerApi.downloadHistoricalEvidence(saleId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = evidenceFileName(
        saleId,
        evidencePath,
        evidence?.contentType
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showToast(
        err?.message || t("historical.evidenceViewer.loadError"),
        "error"
      );
    } finally {
      setDownloading(false);
    }
  };

  const renderEvidence = () => {
    if (evidence.kind === "none") {
      return (
        <div className="flex min-h-[240px] flex-col items-center justify-center gap-1 rounded-card border border-line bg-surface-2 p-6 text-center">
          <p className="text-body font-semibold text-ink">
            {t("historical.evidenceViewer.none")}
          </p>
          <p className="text-micro text-ink-3">
            {t("historical.evidenceViewer.noneHint")}
          </p>
        </div>
      );
    }

    if (evidence.kind === "external") {
      const externalImage = IMAGE_URL_PATTERN.test(evidence.url);
      return externalImage ? (
        <img
          src={evidence.url}
          alt={t("historical.evidenceViewer.title")}
          className="max-h-[60vh] w-full rounded-card border border-line bg-surface-2 object-contain"
        />
      ) : (
        <a
          href={evidence.url}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-card border border-line bg-surface-2 p-6 text-center text-label font-semibold text-brand hover:underline"
        >
          <FontAwesomeIcon icon={faUpRightFromSquare} aria-hidden="true" />
          {t("historical.evidenceViewer.openExternal")}
        </a>
      );
    }

    const pdf = isPdfEvidence(evidencePath, evidence.contentType);
    if (!pdf && !isImageContentType(evidence.contentType)) {
      return (
        <p className="rounded-card border border-line bg-surface-2 p-6 text-center text-label text-ink-2">
          {t("historical.evidenceViewer.unexpectedType")}
        </p>
      );
    }

    return pdf ? (
      <iframe
        src={evidence.url}
        title={t("historical.evidenceViewer.title")}
        className="h-[60vh] min-h-[260px] w-full rounded-card border border-line bg-surface-2"
      />
    ) : (
      <img
        src={evidence.url}
        alt={t("historical.evidenceViewer.title")}
        className="max-h-[60vh] w-full rounded-card border border-line bg-surface-2 object-contain"
      />
    );
  };

  const canDownload = evidence && evidence.kind !== "none";

  return (
    <>
      <Button
        size="sm"
        variant="secondary"
        onClick={handleOpen}
        className={`gap-1.5 ${className}`}
      >
        <FontAwesomeIcon
          icon={
            isPdfEvidence(evidencePath) && !IMAGE_URL_PATTERN.test(evidencePath)
              ? faFilePdf
              : faImage
          }
          aria-hidden="true"
        />
        {t("historical.evidenceViewer.view")}
      </Button>

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
              aria-labelledby={titleId}
              className="relative flex h-full w-[560px] max-w-full flex-col border-l border-line bg-surface shadow-pop"
            >
              <header className="flex shrink-0 items-center justify-between border-b border-line px-5 py-4">
                <h2
                  id={titleId}
                  className="text-title font-bold text-ink"
                >
                  {t("historical.evidenceViewer.title")}
                </h2>
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
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={loadEvidence}
                    >
                      {t("historical.evidenceViewer.retry")}
                    </Button>
                  </div>
                )}

                {!loading && !error && evidence && renderEvidence()}
              </div>

              <footer className="flex shrink-0 justify-end gap-2 border-t border-line px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                <Button variant="secondary" onClick={handleClose}>
                  {t("common.close")}
                </Button>
                {canDownload && (
                  <Button
                    onClick={handleDownload}
                    loading={downloading}
                    disabled={downloading}
                  >
                    {t("historical.evidenceViewer.download")}
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

export default HistoricalEvidenceViewer;
