import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandHoldingUsd, faLock } from "@fortawesome/free-solid-svg-icons";
import AuthContext from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { Button, ErrorState } from "@/shared/ui";
import { formatCurrency } from "../../../shared/utils/formatters";
import { useContractPayments } from "../hooks/useContractPayments";
import PaymentScheduleTab from "./PaymentScheduleTab";
import ApplyPaymentModal from "./PaymentSchedule/ApplyPaymentModal";
import EditMoratoryModal from "./PaymentSchedule/EditMoratoryModal";
import UndoConfirmationModal from "./PaymentSchedule/UndoConfirmationModal";

const fmt = (value) => formatCurrency(value);

const calculateMoratoryDays = (dueDate) => {
  if (!dueDate) return 0;
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = today - due;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

const READ_ONLY_STATUSES = new Set(["closed", "cancelled", "canceled", "rejected"]);

const pendingRows = (rows) =>
  (Array.isArray(rows) ? rows : []).filter((row) => {
    const status = String(row?.status || "pending").toLowerCase();
    return (
      status !== "paid" &&
      status !== "readjustment" &&
      status !== "cancelled" &&
      status !== "canceled"
    );
  });

function PaymentSchedulePanelView({
  contract,
  payments,
  openNextPaymentToken = 0,
  onChanged,
  onPaymentComplete,
  className = "",
  title,
  subtitle,
  framed = true,
  onRequestHandled,
}) {
  const { user } = useContext(AuthContext);
  const { t } = useLocale();

  const {
    schedule,
    setSchedule,
    loading,
    currentContract,
    undoLoadingPaymentId,
    undoConfirmPaymentId,
    setUndoConfirmPaymentId,
    handlePaymentResponse,
    handleUndoPayment,
    error,
    loadContractData,
  } = payments;

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [applyPaymentModal, setApplyPaymentModal] = useState(false);
  const [editingMora, setEditingMora] = useState(null);
  const [moratoryAmount, setMoratoryAmount] = useState("");

  const effectiveContract = currentContract || contract;
  const status = String(effectiveContract?.status || "").toLowerCase();
  const isReadOnly = user?.role === "seller" || READ_ONLY_STATUSES.has(status);

  const totals = useMemo(() => {
    const safeSchedule = (Array.isArray(schedule) ? schedule : []).filter((payment) => {
      const status = String(payment?.status || "pending").toLowerCase();
      return status !== "cancelled" && status !== "canceled";
    });
    const subtotal = safeSchedule.reduce((sum, payment) => {
      const amount = Number(payment.amount || 0);
      const paid = Number(payment.paid_amount || 0);
      const interest = Number(payment.interest_amount || 0);

      if (paid > 0 && paid !== amount) {
        return sum + (paid - interest);
      }
      return sum + amount;
    }, 0);

    const totalInterest = safeSchedule.reduce(
      (sum, payment) => sum + Number(payment.interest_amount || 0),
      0
    );

    return { subtotal, totalInterest, total: subtotal + totalInterest };
  }, [schedule]);

  const translatePaymentType = useCallback(
    (type) => {
      const normalizedType = type?.toLowerCase().replace(/\s+/g, "_");
      switch (normalizedType) {
        case "reservation":
          return t("payments.statusOptions.reservation");
        case "down_payment":
          return t("payments.statusOptions.down_payment");
        case "installment":
          return t("payments.statusOptions.installment");
        case "capital_repayment":
          return t("contracts.capitalPayment");
        default:
          return type || t("payments.statusOptions.installment");
      }
    },
    [t]
  );

  const finishPayment = useCallback(
    (...args) => {
      onPaymentComplete?.(...args);
      onChanged?.(...args);
    },
    [onChanged, onPaymentComplete]
  );

  const handleApplySuccess = useCallback(
    (response, isCapitalPayment) => {
      handlePaymentResponse(response, isCapitalPayment, finishPayment);
    },
    [finishPayment, handlePaymentResponse]
  );

  const handleRequestUndoPayment = useCallback(
    (paymentId) => {
      setUndoConfirmPaymentId(paymentId);
    },
    [setUndoConfirmPaymentId]
  );

  const handleConfirmUndo = useCallback(async () => {
    if (!undoConfirmPaymentId) return;
    await handleUndoPayment(undoConfirmPaymentId, finishPayment);
    setUndoConfirmPaymentId(null);
  }, [finishPayment, handleUndoPayment, setUndoConfirmPaymentId, undoConfirmPaymentId]);

  const handleRequestMora = useCallback((row, index) => {
    setEditingMora(row.id || index);
    setMoratoryAmount(String(row.interest_amount ?? "0"));
  }, []);

  const handleCapitalPayment = useCallback(() => {
    setSelectedPayment({ isCapitalPayment: true, number: "Capital" });
    setApplyPaymentModal(true);
  }, []);

  const closeApplyPayment = useCallback(() => {
    setApplyPaymentModal(false);
    setSelectedPayment(null);
  }, []);

  const nextPending = useMemo(() => pendingRows(schedule)[0], [schedule]);
  const handledTokenRef = useRef(0);

  const footerAction = useMemo(
    () =>
      isReadOnly ? (
        <span className="inline-flex items-center gap-1.5 text-label font-semibold text-ink-3">
          <FontAwesomeIcon icon={faLock} />
          {t("contracts.readOnlyNotice")}
        </span>
      ) : (
        <Button variant="secondary" onClick={handleCapitalPayment}>
          <FontAwesomeIcon icon={faHandHoldingUsd} />
          {t("contracts.capitalPayment")}
        </Button>
      ),
    [handleCapitalPayment, isReadOnly, t]
  );

  useEffect(() => {
    if (!openNextPaymentToken || openNextPaymentToken === handledTokenRef.current) {
      return;
    }
    if (isReadOnly || !Array.isArray(schedule) || schedule.length === 0) return;

    handledTokenRef.current = openNextPaymentToken;
    if (nextPending) {
      setSelectedPayment(nextPending);
      setApplyPaymentModal(true);
    }
    // Consume the request in the parent. Otherwise remounting the panel
    // (for example when switching between Resumen and Cronograma) would replay
    // the same token and reopen the modal without a new click.
    onRequestHandled?.();
  }, [isReadOnly, nextPending, onRequestHandled, openNextPaymentToken, schedule]);

  if (error && !loading && (!Array.isArray(schedule) || schedule.length === 0)) {
    return (
      <ErrorState
        title={t("paymentSchedule.loadError")}
        description={error}
        onRetry={loadContractData}
        className={className}
      />
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
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
        onEditMoratory={handleRequestMora}
        onUndoPayment={handleRequestUndoPayment}
        undoLoadingPaymentId={undoLoadingPaymentId}
        footerAction={footerAction}
        title={title}
        subtitle={subtitle}
        framed={framed}
      />

      <ApplyPaymentModal
        isOpen={applyPaymentModal}
        onClose={closeApplyPayment}
        selectedPayment={selectedPayment}
        contract={effectiveContract}
        onPaymentSuccess={handleApplySuccess}
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
        onSuccess={onChanged}
      />
    </div>
  );
}

function PaymentSchedulePanelWithHook({ enabled = true, ...props }) {
  const payments = useContractPayments(props.contract, enabled);
  return <PaymentSchedulePanelView {...props} payments={payments} />;
}

function PaymentSchedulePanel({ controller, ...props }) {
  if (controller) {
    return <PaymentSchedulePanelView {...props} payments={controller} />;
  }
  return <PaymentSchedulePanelWithHook {...props} />;
}

PaymentSchedulePanelWithHook.propTypes = {
  contract: PropTypes.object,
  enabled: PropTypes.bool,
};

PaymentSchedulePanel.propTypes = {
  contract: PropTypes.object,
  controller: PropTypes.shape({
    schedule: PropTypes.array,
    setSchedule: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    currentContract: PropTypes.object,
    undoLoadingPaymentId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    undoConfirmPaymentId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    setUndoConfirmPaymentId: PropTypes.func.isRequired,
    handlePaymentResponse: PropTypes.func.isRequired,
    handleUndoPayment: PropTypes.func.isRequired,
    error: PropTypes.string,
    loadContractData: PropTypes.func,
  }),
  enabled: PropTypes.bool,
  openNextPaymentToken: PropTypes.number,
  onChanged: PropTypes.func,
  onPaymentComplete: PropTypes.func,
  className: PropTypes.string,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  framed: PropTypes.bool,
  onRequestHandled: PropTypes.func,
};

PaymentSchedulePanelView.propTypes = {
  contract: PropTypes.object,
  payments: PropTypes.shape({
    schedule: PropTypes.array,
    setSchedule: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    currentContract: PropTypes.object,
    undoLoadingPaymentId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    undoConfirmPaymentId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    setUndoConfirmPaymentId: PropTypes.func.isRequired,
    handlePaymentResponse: PropTypes.func.isRequired,
    handleUndoPayment: PropTypes.func.isRequired,
    error: PropTypes.string,
    loadContractData: PropTypes.func,
  }).isRequired,
  openNextPaymentToken: PropTypes.number,
  onChanged: PropTypes.func,
  onPaymentComplete: PropTypes.func,
  className: PropTypes.string,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  framed: PropTypes.bool,
  onRequestHandled: PropTypes.func,
};

export default PaymentSchedulePanel;
