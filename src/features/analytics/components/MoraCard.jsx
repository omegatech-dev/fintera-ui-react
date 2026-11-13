import { memo } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

const MoraCard = memo(
  ({
    amount,
    installments,
    clients,
    change,
    compareMonth,
    formatCurrency,
    t,
  }) => {
    const hasBreakdown =
      installments !== null &&
      installments !== undefined &&
      clients !== null &&
      clients !== undefined &&
      Number.isFinite(Number(installments)) &&
      Number.isFinite(Number(clients));

    return (
      <section
        aria-label={t("analytics.moraTitle")}
        className="flex h-full flex-col rounded-xl border border-danger/30 bg-danger-soft/50 p-4"
      >
        <h3 className="text-label font-bold text-danger">
          {t("analytics.moraTitle")}
        </h3>
        <p className="mt-1 text-page font-bold tabular-nums text-danger">
          {formatCurrency(amount ?? 0)}
        </p>
        <p className="mt-1 text-micro font-medium text-danger">
          {hasBreakdown
            ? t("analytics.moraBreakdown", { installments, clients })
            : t("analytics.moraCaptionNeutral")}
        </p>
        {change && (
          <p className="mt-1 text-micro font-bold text-danger">
            {change}{" "}
            <span className="font-medium">
              {compareMonth
                ? t("analytics.vsMonth", { month: compareMonth })
                : ""}
            </span>
          </p>
        )}
        <Link
          to="/payments?status=overdue"
          className="mt-auto inline-flex w-fit items-center gap-1 pt-3 text-label font-bold text-danger hover:underline"
        >
          <span>{t("analytics.viewCollections")}</span>
          <span aria-hidden="true">→</span>
        </Link>
      </section>
    );
  }
);

MoraCard.displayName = "MoraCard";

MoraCard.propTypes = {
  amount: PropTypes.number,
  installments: PropTypes.number,
  clients: PropTypes.number,
  change: PropTypes.string,
  compareMonth: PropTypes.string,
  formatCurrency: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default MoraCard;
