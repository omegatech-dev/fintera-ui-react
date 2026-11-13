import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileAlt,
  faFilePdf,
  faFileSignature,
} from "@fortawesome/free-solid-svg-icons";
import { useLocale } from "@/contexts/LocaleContext";
import { useToast } from "@/contexts/ToastContext";
import { Card } from "@/shared/ui";

import { contractsApi } from "../../../api";

const DocumentsTab = ({ contract }) => {
  const { t } = useLocale();
  const { showToast } = useToast();

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  };

  const handleDownloadCustomerRecord = async () => {
    try {
      showToast(t("common.processing"), "info");
      const blob = await contractsApi.downloadCustomerRecord(contract.id);
      downloadBlob(blob, `ficha_cliente_${contract.id}.pdf`);
      showToast(t("common.downloadSuccess"), "success");
    } catch (error) {
      console.error("Error downloading customer record:", error);
      showToast(t("contracts.errorDownloadingRecord"), "error");
    }
  };

  const handleDownloadDocument = async (documentName, documentLabel) => {
    try {
      showToast(t("common.processing"), "info");

      const params = { contract_id: contract.id };
      if (contract.financing_type && documentName === "user_promise_contract_pdf") {
        params.financing_type = contract.financing_type;
      }
      if (contract.applicant_user_id) {
        params.user_id = contract.applicant_user_id;
      }

      const blob = await contractsApi.downloadDocument(documentName, params);
      downloadBlob(blob, `${documentName}.pdf`);
      showToast(t("common.downloadSuccess"), "success");
    } catch (error) {
      console.error(`Error downloading ${documentLabel}:`, error);
      showToast(error.message, "error");
    }
  };

  const canDownloadRescission = ["cancelled", "canceled", "rejected"].includes(
    contract.status?.toLowerCase()
  );

  return (
    <Card title={t("contracts.documents")} bodyClassName="px-5 pb-5 pt-3">
      <p className="text-label text-ink-3">
        {t("contracts.availableDocuments") || t("contracts.documentsCard")}
      </p>

      <div className="mt-3 space-y-2">
        <button
          type="button"
          onClick={handleDownloadCustomerRecord}
          className="flex w-full items-center justify-between gap-3 rounded-control border border-line bg-surface p-3 text-left hover:border-line-strong hover:bg-surface-2"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-danger-soft text-danger">
              <FontAwesomeIcon icon={faFilePdf} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-body font-semibold text-ink">
                {t("contracts.customerRecord")}
              </span>
              <span className="block truncate text-micro text-ink-3">
                {t("contracts.customerRecordDescription")}
              </span>
            </span>
          </span>
          <FontAwesomeIcon icon={faFilePdf} className="text-ink-3" />
        </button>

        {["direct", "cash", "bank"].includes(contract.financing_type?.toLowerCase()) && (
          <button
            type="button"
            onClick={() =>
              handleDownloadDocument("user_promise_contract_pdf", t("contracts.promiseContract"))
            }
            className="flex w-full items-center justify-between gap-3 rounded-control border border-line bg-surface p-3 text-left hover:border-line-strong hover:bg-surface-2"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-info-soft text-info">
                <FontAwesomeIcon icon={faFileSignature} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-body font-semibold text-ink">
                  {t("contracts.promiseContract")}
                </span>
                <span className="block truncate text-micro text-ink-3">
                  {t("contracts.promiseContractDescription")}
                </span>
              </span>
            </span>
            <FontAwesomeIcon icon={faFilePdf} className="text-ink-3" />
          </button>
        )}

        {canDownloadRescission ? (
          <button
            type="button"
            onClick={() =>
              handleDownloadDocument("user_rescission_contract_pdf", t("contracts.rescissionContract"))
            }
            className="flex w-full items-center justify-between gap-3 rounded-control border border-line bg-surface p-3 text-left hover:border-line-strong hover:bg-surface-2"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-warning-soft text-warning">
                <FontAwesomeIcon icon={faFileAlt} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-body font-semibold text-ink">
                  {t("contracts.rescissionContract")}
                </span>
                <span className="block truncate text-micro text-ink-3">
                  {t("contracts.rescissionDescription")}
                </span>
              </span>
            </span>
            <FontAwesomeIcon icon={faFilePdf} className="text-ink-3" />
          </button>
        ) : (
          <div className="flex items-center justify-between gap-3 rounded-control border border-dashed border-line-strong bg-surface-2 p-3 opacity-70">
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-line text-ink-3">
                <FontAwesomeIcon icon={faFileAlt} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-body font-semibold text-ink-2">
                  {t("contracts.rescissionContract")}
                </span>
                <span className="block truncate text-micro text-ink-3">
                  {t("contracts.rescissionUnavailable")}
                </span>
              </span>
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            handleDownloadDocument("user_information_pdf", t("contracts.accountStatement"))
          }
          className="flex w-full items-center justify-between gap-3 rounded-control border border-line bg-surface p-3 text-left hover:border-line-strong hover:bg-surface-2"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-brand-soft text-brand-strong">
              <FontAwesomeIcon icon={faFileAlt} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-body font-semibold text-ink">
                {t("contracts.accountStatement")}
              </span>
              <span className="block truncate text-micro text-ink-3">
                {t("contracts.accountStatementDescription")}
              </span>
            </span>
          </span>
          <FontAwesomeIcon icon={faFilePdf} className="text-ink-3" />
        </button>
      </div>
    </Card>
  );
};

DocumentsTab.propTypes = {
  contract: PropTypes.object.isRequired,
};

export default DocumentsTab;
