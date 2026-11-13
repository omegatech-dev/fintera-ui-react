import { memo } from "react";
import PropTypes from "prop-types";
import { useLocale } from "../../../contexts/LocaleContext";

const FICO_MIN = 300;
const FICO_MAX = 850;
const FICO_RANGE = FICO_MAX - FICO_MIN;

function CreditScoreCard({ creditScore }) {
  const { t } = useLocale();
  const raw = creditScore ?? 0;
  const score = Math.round(Math.max(FICO_MIN, Math.min(FICO_MAX, raw)));
  const progressPercent = Math.round(((score - FICO_MIN) / FICO_RANGE) * 100);

  const tone =
    score >= 750 ? "text-brand" : score >= 670 ? "text-warning" : "text-danger";
  const bar =
    score >= 750 ? "bg-brand" : score >= 670 ? "bg-warning" : "bg-danger";

  const label =
    score >= 750
      ? t("creditScore.excellent")
      : score >= 670
        ? t("creditScore.good")
        : t("creditScore.needsImprovement");

  return (
    <div className="rounded-control border border-line bg-surface-2 p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
            {t("creditScore.title")}
          </p>
          <p className={`text-micro font-bold uppercase tracking-wide ${tone}`}>
            {label}
          </p>
        </div>
        <span className={`text-section font-bold tabular-nums ${tone}`}>{score}</span>
      </div>

      <div className="mt-2 space-y-1">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
          <div
            className={`h-full rounded-full ${bar} transition-all`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-micro text-ink-3">
          <span>{t("creditScore.description")}</span>
          <span>{t("creditScore.ficoRange")}</span>
        </div>
      </div>
    </div>
  );
}

CreditScoreCard.propTypes = {
  creditScore: PropTypes.number,
};

export default memo(CreditScoreCard);
