import { useState, memo, useMemo, useContext } from "react";
import PropTypes from "prop-types";
import { useLocale } from "@/contexts/LocaleContext";
import AuthContext from "@/contexts/AuthContext";
import LedgerEntriesTab from "./LedgerEntriesTab";
import ContractNotesTab from "./ContractNotesTab";
import { formatCurrency } from "../../../shared/utils/formatters";

import { useContractPayments } from "../hooks/useContractPayments";
import PaymentSummary from "./PaymentSchedule/PaymentSummary";
import PaymentSchedulePanel from "./PaymentSchedulePanel";
import PaymentModalHeader from "./PaymentSchedule/PaymentModalHeader";
import PaymentModalFooter from "./PaymentSchedule/PaymentModalFooter";
import { Dialog } from "@/shared/ui";

// Moved outside component to prevent recreation on every render
const fmt = (v) => formatCurrency(v);

function PaymentScheduleModal({ contract, open, onClose, onPaymentSuccess }) {
  const {
    schedule,
    setSchedule,
    loading,
    error,
    currentContract,
    setCurrentContract,
    ledgerEntries,
    undoLoadingPaymentId,
    undoConfirmPaymentId,
    setUndoConfirmPaymentId,
    handlePaymentResponse,
    handleUndoPayment,
    loadContractData,
  } = useContractPayments(contract, open);

  const [activeTab, setActiveTab] = useState("overview");
  const { t } = useLocale();
  const { user: activeUser } = useContext(AuthContext);

  // Calculate totals
  const summary = useMemo(() => {
    if (!currentContract) return null;
    const price = Number(currentContract.amount || 0);
    const reserve = Number(currentContract.reserve_amount || 0);
    const financingType = currentContract.financing_type?.toLowerCase();

    const downPayment =
      financingType === "cash" || financingType === "bank"
        ? 0
        : Number(currentContract.down_payment || 0);
    const term = Number(currentContract.payment_term || 0);
    const financed = Math.max(price - (reserve + downPayment), 0);
    const monthly = term ? financed / term : 0;
    const interestRate = Number(currentContract.interest_rate || 0);
    return { price, reserve, downPayment, financed, term, monthly, interestRate };
  }, [currentContract]);

  const activeMonths = useMemo(() => {
    if (!currentContract?.created_at) return 0;
    const start = new Date(currentContract.created_at);
    const end = new Date();
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    return Math.max(0, months);
  }, [currentContract]);

  const isReadOnly = currentContract?.status?.toLowerCase() === "closed";

  const ledgerBalance = useMemo(() => {
    const entries = Array.isArray(ledgerEntries) ? ledgerEntries : [];
    return entries.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  }, [ledgerEntries]);

  const displayBalance =
    ledgerEntries.length > 0 ? ledgerBalance : currentContract?.balance ?? 0;

  if (!open || !contract) return null;

  const paidAmount =
    currentContract?.total_paid ??
    (Number(displayBalance) > 0
      ? Number(summary?.price || 0) - Number(displayBalance)
      : Number(summary?.price || 0) + Number(displayBalance));
  const progressPercent = Math.min(
    100,
    Math.max(0, (paidAmount / (summary?.price || 1)) * 100)
  );

  return (
    <>
      <Dialog
        open={open && !!contract}
        onClose={onClose}
        size="xl"
        flush
        className="flex max-h-[90vh] flex-col"
      >
        <PaymentModalHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentContract={currentContract}
          isReadOnly={isReadOnly}
          onClose={onClose}
          t={t}
        />

        <div className="flex-1 overflow-auto px-4 pb-6 sm:px-6">
          {activeTab === "overview" ? (
            <PaymentSummary
              summary={summary}
              paidAmount={paidAmount}
              displayBalance={displayBalance}
              progressPercent={progressPercent}
              activeMonths={activeMonths}
              currentContract={currentContract}
              activeUser={activeUser}
              t={t}
              fmt={fmt}
            />
          ) : activeTab === "payments" ? (
            <PaymentSchedulePanel
              contract={currentContract || contract}
              enabled={open}
              controller={{
                schedule,
                setSchedule,
                loading,
                error,
                currentContract,
                ledgerEntries,
                undoLoadingPaymentId,
                undoConfirmPaymentId,
                setUndoConfirmPaymentId,
                handlePaymentResponse,
                handleUndoPayment,
                loadContractData,
              }}
              onPaymentComplete={onPaymentSuccess}
              framed={false}
            />
          ) : activeTab === "ledger" ? (
            <LedgerEntriesTab
              ledgerLoading={false}
              ledgerEntries={ledgerEntries}
              fmt={fmt}
            />
          ) : (
            <ContractNotesTab
              currentContract={currentContract}
              onContractUpdate={setCurrentContract}
            />
          )}
        </div>

        <PaymentModalFooter
          activeTab={activeTab}
          isReadOnly={isReadOnly}
          ledgerEntries={ledgerEntries}
          onClose={onClose}
          t={t}
        />
      </Dialog>
    </>
  );
}

PaymentScheduleModal.propTypes = {
  contract: PropTypes.object,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onPaymentSuccess: PropTypes.func,
};

export default memo(PaymentScheduleModal);
