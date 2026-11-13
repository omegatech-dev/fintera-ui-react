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
  const totalSteps = safeSchedule.length || 1;
  const paidSteps = safeSchedule.filter((p) => p.status?.toLowerCase() === "paid").length;
  const overdueSteps = safeSchedule.filter((p) => {
    const status = p.status?.toLowerCase() || "pending";
    const mora = calculateMoratoryDays(p.due_date);
    return status !== "paid" && status !== "readjustment" && mora > 0;
  }).length;
  const progressPercent = (paidSteps / totalSteps) * 100;

  return (
    <div className="space-y-4 py-4">
      <PaymentScheduleHeader
        paidSteps={paidSteps}
        totalSteps={totalSteps}
        overdueSteps={overdueSteps}
        progressPercent={progressPercent}
        t={t}
      />

      {safeSchedule.length === 0 ? (
        <EmptyState
          title={t("paymentSchedule.noScheduleAvailable")}
          description={t("contracts.noScheduleDescription")}
        />
      ) : (
        <div className="space-y-2">
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
      )}

      <PaymentScheduleFooter totals={totals} fmt={fmt} t={t} action={footerAction} />
    </div>
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
};

export default PaymentScheduleTab;
