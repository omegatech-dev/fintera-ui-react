import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHistory,
  faInfoCircle,
  faLock,
  faReceipt,
  faStickyNote,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { Chip } from "@/shared/ui";
import { formatStatus } from "@/shared/utils/formatStatus";

const TAB_ICONS = {
  overview: faInfoCircle,
  payments: faHistory,
  ledger: faReceipt,
  notes: faStickyNote,
};

const PaymentModalHeader = ({ activeTab, setActiveTab, currentContract, isReadOnly, onClose, t }) => {
  const tabs = [
    { id: "overview", label: t("common.overview") },
    { id: "payments", label: t("contracts.paymentSchedule") },
    { id: "ledger", label: t("contracts.ledgerEntries") },
    { id: "notes", label: t("contracts.contractNotes") },
  ];

  return (
    <div className="relative border-b border-line bg-surface px-5 pb-3 pt-5">
      <div className="flex items-start justify-between gap-3 pr-10">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-section font-bold text-ink">
              {t("contracts.contractNumber", { id: currentContract?.id ?? "—" })}
            </h3>
            <Chip tone={isReadOnly ? "neutral" : "success"}>
              {formatStatus(currentContract?.status, t)}
            </Chip>
            {isReadOnly && (
              <span className="inline-flex items-center gap-1 text-micro font-semibold text-ink-3">
                <FontAwesomeIcon icon={faLock} />
                {t("contracts.readOnly")}
              </span>
            )}
          </div>
          <p className="truncate text-micro text-ink-3">
            {currentContract?.lot_name ||
              currentContract?.lot?.name ||
              currentContract?.lot ||
              "—"}
            {currentContract?.project_name || currentContract?.project?.name
              ? ` · ${currentContract.project_name || currentContract.project.name}`
              : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("common.close")}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-control border border-line text-ink-3 hover:bg-surface-2"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>

      <div className="mt-3 flex gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const selected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-control px-3 text-label font-semibold transition-colors ${
                selected
                  ? "bg-brand-soft text-brand-strong"
                  : "text-ink-3 hover:bg-surface-2 hover:text-ink-2"
              }`}
            >
              <FontAwesomeIcon icon={TAB_ICONS[tab.id]} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

PaymentModalHeader.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  currentContract: PropTypes.object,
  isReadOnly: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default PaymentModalHeader;
