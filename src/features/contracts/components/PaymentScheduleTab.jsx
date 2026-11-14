import PropTypes from "prop-types";
import { memo } from "react";
import { useLocale } from "../../../contexts/LocaleContext";
import { Card, EmptyState, Skeleton } from "@/shared/ui";

import PaymentRow from "./PaymentSchedule/PaymentRow";
import PaymentScheduleHeader from "./PaymentSchedule/PaymentScheduleHeader";
import PaymentScheduleFooter from "./PaymentSchedule/PaymentScheduleFooter";

const PaymentScheduleTab = memo(function PaymentScheduleTab({
  loading,
  schedule,
  totals,
  isReadOnly,
  fmt,
  translatePaymentType,
  calculateMoratoryDays,
  setSelectedPayment,
  setApplyPaymentModal,
  setEditingMora,
  setMoratoryAmount,
  onEditMoratory,
  onUndoPayment,
  undoLoadingPaymentId,
  footerAction,
  title,
  subtitle,
  framed = true,
}) {
  const { t } = useLocale();

  if (loading) {
    return (
      <Card bodyClassName="p-4">
        <Skeleton rows={6} />
        <p className="mt-4 text-label text-ink-3">{t("paymentSchedule.loading")}</p>
      </Card>
    );
  }

  const safeSchedule = Array.isArray(schedule) ? schedule : [];
  const isCancelledRow = (payment) => {
    const status = payment.status?.toLowerCase();
    return status === "cancelled" || status === "canceled";
  };
  const activeSchedule = safeSchedule.filter((payment) => !isCancelledRow(payment));
  const totalSteps = activeSchedule.length;
  const paidSteps = activeSchedule.filter((p) => p.status?.toLowerCase() === "paid").length;
  const overdueSteps = activeSchedule.filter((p) => {
    const status = p.status?.toLowerCase() || "pending";
    const mora = calculateMoratoryDays(p.due_date);
    return status !== "paid" && status !== "readjustment" && mora > 0;
  }).length;
  const progressPercent = totalSteps ? (paidSteps / totalSteps) * 100 : 0;

  const header = (
    <PaymentScheduleHeader
      paidSteps={paidSteps}
      totalSteps={totalSteps}
      overdueSteps={overdueSteps}
      progressPercent={progressPercent}
      t={t}
    />
  );

  const tableHeader = (
    <div className="hidden grid-cols-[minmax(0,1.8fr)_110px_110px_110px_auto] gap-3 border-b border-line px-1 pb-2 text-[10px] font-bold uppercase tracking-wide text-ink-3 md:grid">
      <span>{t("paymentSchedule.concept")}</span>
      <span>{t("paymentSchedule.dueDate")}</span>
      <span>{t("paymentSchedule.amount")}</span>
      <span>{t("paymentSchedule.status")}</span>
      <span className="text-right">{t("common.actions")}</span>
    </div>
  );

  const rows =
    safeSchedule.length === 0 ? (
      <EmptyState
        title={t("paymentSchedule.noScheduleAvailable")}
        description={t("contracts.noScheduleDescription")}
      />
    ) : (
      <div>
        {tableHeader}
        {safeSchedule.map((row, idx) => (
          <PaymentRow
            key={row.id || idx}
            row={row}
            idx={idx}
            paidSteps={paidSteps}
            fmt={fmt}
            t={t}
            translatePaymentType={translatePaymentType}
            calculateMoratoryDays={calculateMoratoryDays}
            setSelectedPayment={setSelectedPayment}
            setApplyPaymentModal={setApplyPaymentModal}
            setEditingMora={setEditingMora}
            setMoratoryAmount={setMoratoryAmount}
            onEditMoratory={onEditMoratory}
            onUndoPayment={onUndoPayment}
            undoLoadingPaymentId={undoLoadingPaymentId}
            isReadOnly={isReadOnly}
          />
        ))}
      </div>
    );

  const footer = (
    <PaymentScheduleFooter totals={totals} fmt={fmt} t={t} action={footerAction} />
  );

  if (!framed) {
    return (
      <div className="space-y-4 py-4">
        {header}
        {rows}
        {footer}
      </div>
    );
  }

  return (
    <Card bodyClassName="p-0">
      {(title || subtitle) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-4">
          {title && <h2 className="text-section font-bold text-ink">{title}</h2>}
          {subtitle && <span className="text-label text-ink-3">{subtitle}</span>}
        </div>
      )}
      <div className="border-b border-line p-4">{header}</div>
      <div className="p-4">{rows}</div>
      <div className="border-t border-line p-4">{footer}</div>
    </Card>
  );
});

PaymentScheduleTab.propTypes = {
  loading: PropTypes.bool,
  schedule: PropTypes.array,
  totals: PropTypes.object,
  isReadOnly: PropTypes.bool,
  fmt: PropTypes.func.isRequired,
  translatePaymentType: PropTypes.func.isRequired,
  calculateMoratoryDays: PropTypes.func.isRequired,
  setSelectedPayment: PropTypes.func.isRequired,
  setApplyPaymentModal: PropTypes.func.isRequired,
  setEditingMora: PropTypes.func.isRequired,
  setMoratoryAmount: PropTypes.func.isRequired,
  onEditMoratory: PropTypes.func,
  onUndoPayment: PropTypes.func,
  undoLoadingPaymentId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  footerAction: PropTypes.node,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  framed: PropTypes.bool,
};

export default PaymentScheduleTab;
