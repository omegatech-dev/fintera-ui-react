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
      className={`grid grid-cols-1 gap-2 border-b border-line px-1 py-3 last:border-0 md:grid-cols-[minmax(0,1.8fr)_110px_110px_110px_auto] md:items-center md:gap-3 ${
        isReadjustment ? "opacity-60" : ""
      }`}
    >
      <div className="min-w-0">
        <p className="truncate text-body font-semibold text-ink">
          {row.description ||
            `${t("contracts.installment")} ${row.number || idx + 1}`}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-micro text-ink-3 md:hidden">
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
        <p className="mt-0.5 hidden text-micro text-ink-3 md:block">
          {translatePaymentType(row.payment_type)}
          {moratoryDays > 0 && !isPaid
            ? ` · ${t("contracts.moratory")} ${moratoryDays}${t("paymentSchedule.days")}`
            : ""}
        </p>
      </div>

      <div className="hidden text-label text-ink-2 md:block">
        {formatDate(row.due_date)}
      </div>

      <div className="text-right md:text-left">
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

      <div className="flex items-center">
        <Chip tone={STATUS_TONE[status] || "neutral"}>{statusLabel}</Chip>
      </div>

      <div className="flex items-center justify-end gap-1.5">
        {!isReadOnly && !isReadjustment && !isPaid && (
          <Button
            size="sm"
            variant="secondary"
            iconOnly
            onClick={openPayment}
            aria-label={t("paymentSchedule.applyPayment")}
            title={t("paymentSchedule.applyPayment")}
          >
            <FontAwesomeIcon icon={faCoins} />
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
