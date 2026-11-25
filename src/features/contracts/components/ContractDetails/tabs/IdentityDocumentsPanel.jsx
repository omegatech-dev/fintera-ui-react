import PropTypes from "prop-types";
import { useCallback, useEffect, useMemo, useRef, useState, useContext } from "react";
import AuthContext from "@/contexts/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faEye,
  faIdCard,
  faPaperclip,
  faRotateRight,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { useLocale } from "@/contexts/LocaleContext";
import { useToast } from "@/contexts/ToastContext";
import { Card } from "@/shared/ui";
import { formatBytes } from "@/features/projects/components/media/mediaFiles";

import { contractsApi } from "../../../api";

/**
 * Identity documents of the contract's applicant: the DNI and the RTN slots,
 * plus the contract attachments surfaced as read-only legacy entries. The API
 * enforces the admin/seller scope, so a 403 simply hides the panel.
 */
const IDENTITY_ACCEPT =
  "application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif";
const MAX_IDENTITY_DOCUMENT_SIZE = 10 * 1024 * 1024;

const IdentityDocumentsPanel = ({ contract }) => {
  const { t } = useLocale();
  const { showToast } = useToast();
  const { user } = useContext(AuthContext);

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [hidden, setHidden] = useState(false);

  // Blob URLs created for the inline preview; released on unmount.
  const blobUrls = useRef([]);
  useEffect(
    () => () => {
      for (const url of blobUrls.current) window.URL.revokeObjectURL(url);
      blobUrls.current = [];
    },
    []
  );

  const load = useCallback(async () => {
    if (!contract?.guid) return;
    setLoading(true);
    setFailed(false);
    try {
      const data = await contractsApi.listIdentityDocuments(contract.guid);
      setListing(data?.identity_documents ?? null);
    } catch (error) {
      if (error?.status === 403) {
        // The caller is not in the staff scope of this contract: the documents
        // are internal records, so the panel is not shown at all.
        setHidden(true);
        return;
      }
      setFailed(true);
      showToast(t("contracts.identityDocuments.loadError"), "error");
    } finally {
      setLoading(false);
    }
  }, [contract?.guid, showToast, t]);

  useEffect(() => {
    load();
  }, [load]);

  const fetchBlob = useCallback(
    async (relativeUrl) => {
      const blob = await contractsApi.fetchIdentityDocumentBlob(relativeUrl);
      return window.URL.createObjectURL(blob);
    },
    []
  );

  const handleUpload = useCallback(
    async (kind, file) => {
      if (!file) return;
      if (file.size > MAX_IDENTITY_DOCUMENT_SIZE) {
        showToast(
          t("contracts.identityDocuments.tooLarge", { name: file.name }),
          "error"
        );
        return;
      }
      try {
        showToast(t("common.processing"), "info");
        // Admins write the person's slot directly; sellers go through the
        // contract, where the API resolves the applicant and its scope.
        if (user?.role === "admin" && listing?.user_id) {
          await contractsApi.uploadIdentityDocumentForUser(
            listing.user_id,
            kind,
            file
          );
        } else {
          await contractsApi.uploadIdentityDocumentForContract(
            contract.guid,
            kind,
            file
          );
        }
        showToast(t("contracts.identityDocuments.uploaded"), "success");
        await load();
      } catch (error) {
        const message =
          error?.message || t("contracts.identityDocuments.uploadError");
        showToast(message, "error");
      }
    },
    [contract?.guid, listing?.user_id, load, showToast, t, user?.role]
  );

  const handleView = useCallback(
    async (file) => {
      if (!file) return;
      try {
        showToast(t("common.processing"), "info");
        const url = await fetchBlob(file.preview_url || file.download_url);
        blobUrls.current.push(url);
        window.open(url, "_blank", "noopener");
      } catch (error) {
        console.error("Error opening identity document:", error);
        showToast(t("common.downloadError"), "error");
      }
    },
    [fetchBlob, showToast, t]
  );

  const handleDownload = useCallback(
    async (file) => {
      if (!file) return;
      try {
        showToast(t("common.processing"), "info");
        const blob = await contractsApi.fetchIdentityDocumentBlob(file.download_url);
        const url = window.URL.createObjectURL(blob);
        blobUrls.current.push(url);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.original_filename || "documento";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        showToast(t("common.downloadSuccess"), "success");
      } catch (error) {
        console.error("Error downloading identity document:", error);
        showToast(t("common.downloadError"), "error");
      }
    },
    [showToast, t]
  );

  const slots = useMemo(() => listing?.slots ?? [], [listing]);
  const legacy = useMemo(() => listing?.legacy ?? [], [listing]);

  if (hidden) return null;

  const fileRow = (file, kindLabel, readOnly, replaceKind) => (
    <div
      key={`${kindLabel}-${file.id}`}
      className="flex items-center justify-between gap-3 rounded-control border border-line bg-surface p-3"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-primary-soft text-primary">
          <FontAwesomeIcon icon={readOnly ? faPaperclip : faIdCard} />
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <span className="block truncate text-body font-semibold text-ink">
              {file.original_filename || t("contracts.identityDocuments.unnamedFile")}
            </span>
            {readOnly && (
              <span className="shrink-0 rounded-control bg-surface-2 px-1.5 py-0.5 text-micro text-ink-3">
                {t("contracts.identityDocuments.readOnly")}
              </span>
            )}
          </span>
          <span className="block truncate text-micro text-ink-3">
            {[kindLabel, formatBytes(file.size_bytes), file.mime_type]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={() => handleView(file)}
          className="rounded-control border border-line px-2.5 py-1.5 text-micro text-ink-2 hover:border-line-strong hover:bg-surface-2"
        >
          <FontAwesomeIcon icon={faEye} className="mr-1.5" />
          {t("common.view")}
        </button>
        <button
          type="button"
          onClick={() => handleDownload(file)}
          className="rounded-control border border-line px-2.5 py-1.5 text-micro text-ink-2 hover:border-line-strong hover:bg-surface-2"
        >
          <FontAwesomeIcon icon={faDownload} className="mr-1.5" />
          {t("common.download")}
        </button>
        {replaceKind && (
          <label className="cursor-pointer rounded-control border border-line px-2.5 py-1.5 text-micro text-ink-2 hover:border-line-strong hover:bg-surface-2">
            <FontAwesomeIcon icon={faUpload} className="mr-1.5" />
            {t("contracts.identityDocuments.replace")}
            <input
              type="file"
              accept={IDENTITY_ACCEPT}
              className="sr-only"
              onChange={(event) => {
                const [file] = event.target.files || [];
                handleUpload(replaceKind, file);
                event.target.value = "";
              }}
            />
          </label>
        )}
      </span>
    </div>
  );

  const emptySlotRow = (kind, kindLabel) => (
    <div
      key={`empty-${kind}`}
      className="flex items-center justify-between gap-3 rounded-control border border-dashed border-line bg-surface-2 p-3"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-surface text-ink-3">
          <FontAwesomeIcon icon={faIdCard} />
        </span>
        <span className="min-w-0">
          <span className="block text-body font-semibold text-ink">{kindLabel}</span>
          <span className="block text-micro text-ink-3">
            {t("contracts.identityDocuments.notUploaded")}
          </span>
        </span>
      </span>
      <label className="shrink-0 cursor-pointer rounded-control border border-line px-2.5 py-1.5 text-micro text-ink-2 hover:border-line-strong hover:bg-surface-2">
        <FontAwesomeIcon icon={faUpload} className="mr-1.5" />
        {t("contracts.identityDocuments.upload")}
        <input
          type="file"
          accept={IDENTITY_ACCEPT}
          className="sr-only"
          onChange={(event) => {
            const [file] = event.target.files || [];
            handleUpload(kind, file);
            event.target.value = "";
          }}
        />
      </label>
    </div>
  );

  return (
    <Card title={t("contracts.identityDocuments.title")} bodyClassName="px-5 pb-5 pt-3">
      <p className="text-label text-ink-3">
        {t("contracts.identityDocuments.subtitle")}
      </p>

      {loading && (
        <p className="mt-3 text-body text-ink-3">{t("common.loading")}</p>
      )}

      {!loading && failed && (
        <button
          type="button"
          onClick={load}
          className="mt-3 flex items-center gap-2 rounded-control border border-line px-3 py-2 text-body text-ink-2 hover:bg-surface-2"
        >
          <FontAwesomeIcon icon={faRotateRight} />
          {t("common.retry")}
        </button>
      )}

      {!loading && !failed && (
        <div className="mt-3 space-y-2">
          {slots.map((slot) => {
            const kindLabel = t(
              slot.kind === "dni"
                ? "contracts.identityDocuments.dni"
                : "contracts.identityDocuments.rtn"
            );
            return slot.document
              ? fileRow(slot.document, kindLabel, false, slot.kind)
              : emptySlotRow(slot.kind, kindLabel);
          })}

          {legacy.length > 0 && (
            <>
              <p className="pt-2 text-label font-semibold text-ink-2">
                {t("contracts.identityDocuments.attachments")}
              </p>
              {legacy.map((entry) =>
                entry.document
                  ? fileRow(
                      entry.document,
                      entry.document.original_filename || "",
                      true
                    )
                  : null
              )}
            </>
          )}

          {slots.every((slot) => !slot.document) && legacy.length === 0 && (
            <p className="text-micro text-ink-3">
              {t("contracts.identityDocuments.nothingOnFile")}
            </p>
          )}
        </div>
      )}
    </Card>
  );
};

IdentityDocumentsPanel.propTypes = {
  contract: PropTypes.shape({
    guid: PropTypes.string,
  }),
};

export default IdentityDocumentsPanel;
