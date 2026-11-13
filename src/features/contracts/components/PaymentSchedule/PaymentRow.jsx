import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faCoins,
  faExclamationTriangle,
  faLock,
  faPlus,
  faUndo,
} from "@fortawesome/free-solid-svg-icons";
import { Chip } from "@/shared/ui";

const STATUS_TONE = {
  paid: "success",
  overdue: "danger",
  pending: "warning",
  readjustment: "neutral",
};

const PaymentRow = ({
  row,
  idx,
  fmt,
  t,
  translatePaymentType,
  calculateMoratoryDays,
  setSelectedPayment,
  setApplyPaymentModal,
  setEditingMora,
  setMoratoryAmount,
  onUndoPayment,
  undoLoadingPaymentId,
  isReadOnly,
}) => {
  const status = (row.status || "pending").toLowerCase();
  const isReadjustment = status === "readjustment";
  const isPaid = status === "paid";
  const moratoryDays = calculateMoratoryDays(row.due_date);
  const isOverdue = !isPaid && !isReadjustment && moratoryDays > 0;

  const statusLabel = isReadjustment
    ? t("paymentSchedule.readjustment")
    : isPaid
      ? t("paymentSchedule.paid")
      : isOverdue
        ? t("paymentSchedule.overdue")
        : t("paymentSchedule.pending");

  const amount = row.amount || row.value || row.payment_amount;
  const paidAmount = row.paid_amount || 0;
  const interest = row.interest_amount || 0;
  const totalRequired = Number(amount) + Number(interest);
  const extraAmount = paidAmount > totalRequired ? paidAmount - totalRequired : 0;
  const isCapital = row.payment_type === "capital_repayment";

  return (
    <div
      className={`flex flex-col gap-3 rounded-card border border-line bg-surface p-3 md:flex-row md:items-center md:justify-between ${
        isReadjustment ? "opacity-60" : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-control ${
            isCapital
              ? "bg-brand-soft text-brand-strong"
              : isPaid
                ? "bg-surface-2 text-ink-2"
                : "bg-warning-soft text-warning"
          }`}
        >
          <span className="text-[9px] font-bold uppercase">
            {isCapital ? t("contracts.capitalShort") : t("contracts.installment")}
          </span>
          <span className="text-body font-bold">
            {isCapital ? <FontAwesomeIcon icon={faCoins} /> : row.number || idx + 1}
          </span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-body font-semibold text-ink">
            {row.description ||
              `${t("contracts.installment")} ${row.number || idx + 1}`}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-micro text-ink-3">
            <span>
              {row.due_date
                ? new Date(row.due_date).toLocaleDateString("es-HN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </span>
            <span>·</span>
            <span>{translatePaymentType(row.payment_type)}</span>
            {moratoryDays > 0 && !isPaid && (
              <span className="font-semibold text-danger">
                {t("contracts.moratory")} {moratoryDays}
                {t("paymentSchedule.days")}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 md:justify-end">
        <div className="text-right">
          <p className="text-body font-bold text-ink">{fmt(amount)}</p>
          {interest > 0 && (
            <p className="inline-flex items-center gap-1 text-micro font-semibold text-danger">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              +{fmt(interest)}
            </p>
          )}
          {extraAmount > 0 && (
            <p className="inline-flex items-center gap-1 text-micro font-semibold text-info">
              <FontAwesomeIcon icon={faPlus} />+{fmt(extraAmount)}
            </p>
          )}
        </div>
        <Chip tone={STATUS_TONE[status] || "neutral"}>{statusLabel}</Chip>

        <div className="flex items-center gap-1.5">
          {isReadjustment ? (
            <FontAwesomeIcon icon={faLock} className="text-ink-3" />
          ) : (
            <>
              {!isReadOnly && !isPaid && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPayment(row);
                    setApplyPaymentModal(true);
                  }}
                  title={t("paymentSchedule.applyPayment")}
                  className="flex h-9 w-9 items-center justify-center rounded-control bg-brand-soft text-brand-strong hover:opacity-90"
                >
                  <FontAwesomeIcon icon={faCoins} />
                </button>
              )}
              {!isReadOnly && !isPaid && moratoryDays > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingMora(row.id || idx);
                    setMoratoryAmount(interest?.toString() || "0");
                  }}
                  title={t("paymentSchedule.editMoratory")}
                  className="flex h-9 w-9 items-center justify-center rounded-control bg-warning-soft text-warning hover:opacity-90"
                >
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                </button>
              )}
              {isPaid && !isReadOnly && (
                <button
                  type="button"
                  onClick={() => onUndoPayment?.(row.id)}
                  disabled={undoLoadingPaymentId != null && undoLoadingPaymentId === row.id}
                  title={t("paymentSchedule.undoPayment")}
                  className="flex h-9 w-9 items-center justify-center rounded-control bg-danger-soft text-danger hover:opacity-90 disabled:opacity-50"
                >
                  {undoLoadingPaymentId === row.id ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-danger border-t-transparent" />
                  ) : (
                    <FontAwesomeIcon icon={faUndo} />
                  )}
                </button>
              )}
              {isReadOnly && isPaid && (
                <FontAwesomeIcon icon={faCheckCircle} className="text-brand" />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

PaymentRow.propTypes = {
  row: PropTypes.object.isRequired,
  idx: PropTypes.number.isRequired,
  fmt: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  translatePaymentType: PropTypes.func.isRequired,
  calculateMoratoryDays: PropTypes.func.isRequired,
  setSelectedPayment: PropTypes.func.isRequired,
  setApplyPaymentModal: PropTypes.func.isRequired,
  setEditingMora: PropTypes.func.isRequired,
  setMoratoryAmount: PropTypes.func.isRequired,
  onUndoPayment: PropTypes.func,
  undoLoadingPaymentId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  isReadOnly: PropTypes.bool,
};

export default PaymentRow;
