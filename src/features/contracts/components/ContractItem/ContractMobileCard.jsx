import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faCheckCircle,
  faCreditCard,
  faTimesCircle,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { formatStatus } from "../../../../shared/utils/formatStatus";
import { Chip } from "@/shared/ui";

const STATUS_TONES = {
  approved: "success",
  closed: "info",
  rejected: "danger",
  pending: "warning",
  submitted: "info",
  cancelled: "danger",
  canceled: "danger",
};

const money = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  return `L ${Number(value || 0).toLocaleString("es-HN", {
    maximumFractionDigits: 0,
  })}`;
};

function ContractMobileCard({
  contract,
  userRole,
  t,
  translateFinancingType,
  formatDate,
  handleApprove,
  handleDeleteContract,
  actionLoading,
  deleteLoading,
  setShowRejectionModal,
}) {
  const status = contract.status?.toLowerCase();
  const canApprove =
    userRole === "admin" && ["pending", "submitted", "rejected"].includes(status);

  return (
    <div className="rounded-card border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-body font-bold text-ink">#{contract.id}</p>
          <p className="truncate text-body-lg font-semibold text-ink">
            {contract.applicant_name || "—"}
          </p>
          <p className="truncate text-micro text-ink-3">
            {contract.lot_name || "—"} · {contract.project_name || "—"}
          </p>
        </div>
        <Chip tone={STATUS_TONES[status] || "neutral"}>
          {formatStatus(status, t)}
        </Chip>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-line pt-3">
        <div>
          <dt className="text-micro font-bold uppercase tracking-wide text-ink-3">
            {t("contracts.balance")}
          </dt>
          <dd className="text-body font-bold text-ink">{money(Math.abs(Number(contract.balance || 0)))}</dd>
        </div>
        <div className="text-right">
          <dt className="text-micro font-bold uppercase tracking-wide text-ink-3">
            {t("contracts.type")}
          </dt>
          <dd className="flex items-center justify-end gap-1.5 text-body text-ink-2">
            <FontAwesomeIcon icon={faCreditCard} className="text-ink-3" />
            {translateFinancingType(contract.financing_type, t)}
          </dd>
        </div>
        <div>
          <dt className="text-micro font-bold uppercase tracking-wide text-ink-3">
            {t("contracts.created")}
          </dt>
          <dd className="flex items-center gap-1.5 text-body text-ink-2">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-ink-3" />
            {formatDate(contract.created_at)}
          </dd>
        </div>
      </dl>

      {status === "rejected" && contract.rejection_reason && (
        <div className="mt-3 rounded-control border border-danger/20 bg-danger-soft p-2.5">
          <p className="text-micro font-bold uppercase tracking-wide text-danger">
            {t("contracts.rejectionReason")}
          </p>
          <p className="mt-1 line-clamp-2 text-label text-ink-2">
            {contract.rejection_reason}
          </p>
        </div>
      )}

      {canApprove && (
        <div className="mt-3 flex gap-2 border-t border-line pt-3">
          <button
            type="button"
            onClick={handleApprove}
            disabled={actionLoading}
            className="flex h-[34px] flex-1 items-center justify-center gap-2 rounded-control bg-brand text-label font-semibold text-white transition-colors hover:bg-brand-strong disabled:opacity-60"
          >
            <FontAwesomeIcon icon={faCheckCircle} />
            {t("contracts.approve")}
          </button>
          {status === "rejected" ? (
            <button
              type="button"
              onClick={handleDeleteContract}
              disabled={deleteLoading}
              className="flex h-[34px] flex-1 items-center justify-center gap-2 rounded-control border border-danger/30 bg-danger-soft text-label font-semibold text-danger transition-colors hover:opacity-90 disabled:opacity-60"
            >
              <FontAwesomeIcon icon={faTrashAlt} />
              {t("common.delete")}
            </button>
          ) : (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setShowRejectionModal(true);
              }}
              disabled={actionLoading}
              className="flex h-[34px] flex-1 items-center justify-center gap-2 rounded-control border border-danger/30 bg-danger-soft text-label font-semibold text-danger transition-colors hover:opacity-90 disabled:opacity-60"
            >
              <FontAwesomeIcon icon={faTimesCircle} />
              {t("contracts.reject")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

ContractMobileCard.propTypes = {
  contract: PropTypes.object.isRequired,
  userRole: PropTypes.string,
  t: PropTypes.func.isRequired,
  translateFinancingType: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
  handleApprove: PropTypes.func,
  handleDeleteContract: PropTypes.func,
  actionLoading: PropTypes.bool,
  deleteLoading: PropTypes.bool,
  setShowSchedule: PropTypes.func,
  setShowRejectionModal: PropTypes.func,
  setShowDetailsModal: PropTypes.func,
  refreshContracts: PropTypes.func,
};

export default ContractMobileCard;
