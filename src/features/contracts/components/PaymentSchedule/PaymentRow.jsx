import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCoins,
  faEllipsisVertical,
  faExclamationTriangle,
  faPlus,
  faUndo,
} from "@fortawesome/free-solid-svg-icons";
import { Button, Chip, Menu } from "@/shared/ui";
import { formatDate } from "@/shared/utils/formatters";

import PaymentReceipt from "./PaymentReceipt";

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
  onEditMoratory,
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
  const isUndoing = undoLoadingPaymentId != null && undoLoadingPaymentId === row.id;

  const openPayment = () => {
    setSelectedPayment(row);
    setApplyPaymentModal(true);
  };

  const openMoratory = () => {
    if (onEditMoratory) {
      onEditMoratory(row, idx);
      return;
    }
    setEditingMora(row.id || idx);
    setMoratoryAmount(interest?.toString() || "0");
  };

  const secondaryActions = [];

  if (!isReadOnly && !isReadjustment) {
    if (!isPaid && moratoryDays > 0) {
      secondaryActions.push({
        label: t("paymentSchedule.editMoratory"),
        icon: <FontAwesomeIcon icon={faExclamationTriangle} className="w-3.5" />,
        onSelect: openMoratory,
      });
    }

    if (isPaid) {
      secondaryActions.push({
        label: t("paymentSchedule.undoPayment"),
        icon: <FontAwesomeIcon icon={faUndo} className="w-3.5" />,
        tone: "danger",
        onSelect: () => onUndoPayment?.(row.id),
      });
    }
  }

  return (
    <div
      className={`flex flex-col gap-3 rounded-card border border-line bg-surface p-3 sm:flex-row sm:items-center sm:justify-between ${
        isReadjustment ? "opacity-60" : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-control ${
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
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-micro text-ink-3">
            <span>{formatDate(row.due_date)}</span>
            <span aria-hidden="true">·</span>
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

      <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
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

        {!isReadOnly && !isReadjustment && !isPaid && (
          <Button
            size="sm"
            variant="secondary"
            onClick={openPayment}
            aria-label={t("paymentSchedule.applyPayment")}
            title={t("paymentSchedule.applyPayment")}
          >
            <FontAwesomeIcon icon={faCoins} />
            {t("paymentSchedule.applyPayment")}
          </Button>
        )}

        {isUndoing ? (
          <span className="flex h-9 w-9 items-center justify-center">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-danger border-t-transparent" />
          </span>
        ) : (
          secondaryActions.length > 0 && (
            <div className="[&>div>button]:h-9 [&>div>button]:w-9">
              <Menu
                label={t("common.actions")}
                icon={<FontAwesomeIcon icon={faEllipsisVertical} />}
                items={secondaryActions}
              />
            </div>
          )
        )}

        <PaymentReceipt row={row} t={t} />
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
  onEditMoratory: PropTypes.func,
  onUndoPayment: PropTypes.func,
  undoLoadingPaymentId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  isReadOnly: PropTypes.bool,
};

export default PaymentRow;
