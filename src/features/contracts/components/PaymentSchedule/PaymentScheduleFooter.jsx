import PropTypes from "prop-types";
import { Card } from "@/shared/ui";

const PaymentScheduleFooter = ({ totals, fmt, t, action }) => {
  return (
    <Card bodyClassName="p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-8">
          <div>
            <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
              {t("contracts.totalCapital")}
            </p>
            <p className="text-title font-bold text-ink">{fmt(totals.subtotal)}</p>
          </div>
          <div>
            <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
              {t("paymentSchedule.interest")}
            </p>
            <p className="text-title font-bold text-ink">{fmt(totals.totalInterest)}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {action}
          <div className="rounded-control border border-line bg-surface-2 px-4 py-2 text-right">
            <p className="text-micro font-bold uppercase tracking-wide text-brand-strong">
              {t("paymentSchedule.totalToPay")}
            </p>
            <p className="text-section font-bold text-ink">{fmt(totals.total)}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

PaymentScheduleFooter.propTypes = {
  totals: PropTypes.object.isRequired,
  fmt: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  action: PropTypes.node,
};

export default PaymentScheduleFooter;
