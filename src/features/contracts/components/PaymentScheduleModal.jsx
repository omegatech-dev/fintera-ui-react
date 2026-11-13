import { useState, useCallback, memo, useMemo, useContext } from "react";
import PropTypes from "prop-types";
import { useLocale } from "@/contexts/LocaleContext";
import AuthContext from "@/contexts/AuthContext";
import PaymentScheduleTab from "./PaymentScheduleTab";
import LedgerEntriesTab from "./LedgerEntriesTab";
import ContractNotesTab from "./ContractNotesTab";
import { formatCurrency } from "../../../shared/utils/formatters";

// New sub-components and hooks
import { useContractPayments } from "../hooks/useContractPayments";
import PaymentSummary from "./PaymentSchedule/PaymentSummary";
import ApplyPaymentModal from "./PaymentSchedule/ApplyPaymentModal";
import EditMoratoryModal from "./PaymentSchedule/EditMoratoryModal";
import UndoConfirmationModal from "./PaymentSchedule/UndoConfirmationModal";
import PaymentModalHeader from "./PaymentSchedule/PaymentModalHeader";
import PaymentModalFooter from "./PaymentSchedule/PaymentModalFooter";
import { Dialog } from "@/shared/ui";

// Moved outside component to prevent recreation on every render
const fmt = (v) => formatCurrency(v);

// Moved outside component as it's a pure function
const calculateMoratoryDays = (dueDate) => {
  if (!dueDate) return 0;
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = today - due;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

function PaymentScheduleModal({ contract, open, onClose, onPaymentSuccess }) {
  const {
    schedule,
    setSchedule,
    loading,
    currentContract,
    setCurrentContract,
    ledgerEntries,
    undoLoadingPaymentId,
    undoConfirmPaymentId,
    setUndoConfirmPaymentId,
    handlePaymentResponse,
    handleUndoPayment,
  } = useContractPayments(contract, open);

  const [editingMora, setEditingMora] = useState(null);
  const [moratoryAmount, setMoratoryAmount] = useState("");
  const [applyPaymentModal, setApplyPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const { t } = useLocale();
  const { user: activeUser } = useContext(AuthContext);

  // Stable callback for PaymentScheduleTab
  const handleTabPaymentSuccess = useCallback((resp) => handlePaymentResponse(resp, false, onPaymentSuccess), [handlePaymentResponse, onPaymentSuccess]);

  const handleRequestUndoPayment = useCallback((paymentId) => {
    setUndoConfirmPaymentId(paymentId);
  }, [setUndoConfirmPaymentId]);

  const handleConfirmUndo = useCallback(async () => {
    if (!undoConfirmPaymentId) return;
    await handleUndoPayment(undoConfirmPaymentId, onPaymentSuccess);
    setUndoConfirmPaymentId(null);
  }, [undoConfirmPaymentId, handleUndoPayment, onPaymentSuccess, setUndoConfirmPaymentId]);

  // Calculate totals
  const totals = useMemo(() => {
    const safeSchedule = Array.isArray(schedule) ? schedule : [];
    const subtotal = safeSchedule.reduce((sum, payment) => {
      const amt = Number(payment.amount || 0);
      const paid = Number(payment.paid_amount || 0);
      const interest = Number(payment.interest_amount || 0);

      if (paid > 0 && paid !== amt) {
        return sum + (paid - interest);
      }
      return sum + amt;
    }, 0);

    const totalInterest = safeSchedule.reduce((sum, payment) => sum + Number(payment.interest_amount || 0), 0);
    const total = subtotal + totalInterest;

    return { subtotal, totalInterest, total };
  }, [schedule]);

  const summary = useMemo(() => {
    if (!currentContract) return null;
    const price = Number(currentContract.amount || 0);
    const reserve = Number(currentContract.reserve_amount || 0);
    const financingType = currentContract.financing_type?.toLowerCase();

    const downPayment = (financingType === 'cash' || financingType === 'bank') ? 0 : Number(currentContract.down_payment || 0);
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
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return Math.max(0, months);
  }, [currentContract]);

  const isReadOnly = currentContract?.status?.toLowerCase() === 'closed';

  const ledgerBalance = useMemo(() => {
    const entries = Array.isArray(ledgerEntries) ? ledgerEntries : [];
    return entries.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  }, [ledgerEntries]);

  const displayBalance = ledgerEntries.length > 0 ? ledgerBalance : (currentContract?.balance ?? 0);

  const translatePaymentType = useCallback((type) => {
    const normalizedType = type?.toLowerCase().replace(/\s+/g, '_');
    switch (normalizedType) {
      case "reservation": return t('payments.statusOptions.reservation');
      case "down_payment": return t('payments.statusOptions.down_payment');
      case "installment": return t('payments.statusOptions.installment');
      case "capital_repayment": return t('contracts.capitalPayment') || "Abono a Capital";
      default: return type || t('payments.statusOptions.installment');
    }
  }, [t]);

  if (!open || !contract) return null;

  const paidAmount = currentContract?.total_paid ?? (
    Number(displayBalance) > 0
      ? (Number(summary?.price || 0) - Number(displayBalance))
      : (Number(summary?.price || 0) + Number(displayBalance))
  );
  const progressPercent = Math.min(100, Math.max(0, (paidAmount / (summary?.price || 1)) * 100));

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

        <div className="overflow-auto px-6 pb-6 flex-1">
          {activeTab === 'overview' ? (
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
          ) : activeTab === 'payments' ? (
            <PaymentScheduleTab
              loading={loading}
              schedule={schedule}
              totals={totals}
              isReadOnly={isReadOnly}
              fmt={fmt}
              translatePaymentType={translatePaymentType}
              calculateMoratoryDays={calculateMoratoryDays}
              setSelectedPayment={setSelectedPayment}
              setApplyPaymentModal={setApplyPaymentModal}
              setEditingMora={setEditingMora}
              setMoratoryAmount={setMoratoryAmount}
              onPaymentSuccess={handleTabPaymentSuccess}
              onUndoPayment={handleRequestUndoPayment}
              undoLoadingPaymentId={undoLoadingPaymentId}
            />
          ) : activeTab === 'ledger' ? (
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
          onCapitalPayment={() => {
            setSelectedPayment({ isCapitalPayment: true, number: "Capital" });
            setApplyPaymentModal(true);
          }}
          ledgerEntries={ledgerEntries}
          onClose={onClose}
          t={t}
        />
      </Dialog>

      <ApplyPaymentModal
        isOpen={applyPaymentModal}
        onClose={() => {
          setApplyPaymentModal(false);
          setSelectedPayment(null);
        }}
        selectedPayment={selectedPayment}
        contract={currentContract}
        onPaymentSuccess={(resp) => handlePaymentResponse(resp, selectedPayment?.isCapitalPayment, onPaymentSuccess)}
        schedule={schedule}
        setSchedule={setSchedule}
      />

      <UndoConfirmationModal
        paymentId={undoConfirmPaymentId}
        onConfirm={handleConfirmUndo}
        onCancel={() => setUndoConfirmPaymentId(null)}
        isLoading={undoLoadingPaymentId === undoConfirmPaymentId}
      />

      <EditMoratoryModal
        editingMora={editingMora}
        onClose={() => setEditingMora(null)}
        moratoryAmount={moratoryAmount}
        setMoratoryAmount={setMoratoryAmount}
        schedule={schedule}
        setSchedule={setSchedule}
      />
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