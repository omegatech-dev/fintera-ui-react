import PropTypes from "prop-types";
import { Button } from "@/shared/ui";

const PaymentModalFooter = ({ activeTab, isReadOnly, ledgerEntries, onClose, t }) => {
  const ledgerCount = Array.isArray(ledgerEntries) ? ledgerEntries.length : 0;

  let helper = isReadOnly
    ? t("contracts.contractClosedReadOnly")
    : t("contracts.paymentSummary");
  if (activeTab === "ledger") {
    helper = `${ledgerCount} ${t("contracts.entriesRegistered")} · ${t("contracts.ledgerReadOnly")}`;
  } else if (activeTab === "notes") {
    helper = t("contracts.contractNotesInfo");
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface px-5 py-3">
      <p className="text-label text-ink-3">{helper}</p>
      <Button variant="secondary" onClick={onClose}>
        {t("common.close")}
      </Button>
    </div>
  );
};

PaymentModalFooter.propTypes = {
  activeTab: PropTypes.string.isRequired,
  isReadOnly: PropTypes.bool,
  ledgerEntries: PropTypes.array,
  onClose: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default PaymentModalFooter;
