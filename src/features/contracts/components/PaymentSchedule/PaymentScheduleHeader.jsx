import PropTypes from "prop-types";
import { Card } from "@/shared/ui";

const PaymentScheduleHeader = ({ paidSteps, totalSteps, overdueSteps, progressPercent, t }) => {
  const remaining = totalSteps - paidSteps;

  return (
    <Card bodyClassName="p-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
            {t("paymentSchedule.summary")}
          </p>
          <p className="text-section font-bold text-ink">
            {paidSteps} <span className="text-ink-3">/ {totalSteps}</span>{" "}
            <span className="text-label font-semibold text-ink-3">
              {t("paymentSchedule.completed")}
            </span>
          </p>
        </div>
        <div className="flex gap-6 text-right">
          <div>
            <p className="text-micro font-bold uppercase tracking-wide text-danger">
              {t("paymentSchedule.overdue")}
            </p>
            <p className="text-title font-bold text-danger">{overdueSteps}</p>
          </div>
          <div>
            <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
              {t("paymentSchedule.remaining")}
            </p>
            <p className="text-title font-bold text-ink">{remaining}</p>
          </div>
        </div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-brand transition-all"
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        />
      </div>
    </Card>
  );
};

PaymentScheduleHeader.propTypes = {
  paidSteps: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired,
  overdueSteps: PropTypes.number.isRequired,
  progressPercent: PropTypes.number.isRequired,
  t: PropTypes.func.isRequired,
};

export default PaymentScheduleHeader;
