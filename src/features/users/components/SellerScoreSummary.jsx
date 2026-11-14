import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useLocale } from "@/contexts/LocaleContext";
import { formatDate } from "@/shared/utils/formatters";
import ScoreBadge from "@/features/seller/components/ScoreBadge";
import { scoreLevel, scoreTone } from "@/features/seller/utils/score";
import {
  readScoreOverride,
  readSellerScore,
  readSellerScoreMetrics,
  scorePercent,
} from "@/features/seller/utils/scoreMetrics";

const FILL_TONES = {
  success: "bg-brand",
  warning: "bg-warning",
  danger: "bg-danger",
};

function SellerScoreSummary({ user }) {
  const { t } = useLocale();
  const score = readSellerScore(user);
  const metrics = readSellerScoreMetrics(user);
  const override = readScoreOverride(user);
  const percent = scorePercent(score);
  const clamped = Math.max(0, Math.min(100, percent));
  const tone = scoreTone(scoreLevel(score));

  return (
    <section className="rounded-card border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
          {t("users.scoreTitle")}
        </p>
        <ScoreBadge value={score} showNew />
      </div>

      <div
        className="mt-3 h-2 w-full overflow-hidden rounded-chip bg-line"
        role="img"
        aria-label={t("users.scoreValue")}
      >
        <div
          className={`h-full rounded-chip ${FILL_TONES[tone]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>

      <p className="mt-2 text-micro leading-relaxed text-ink-3">
        {metrics.total > 0
          ? t("users.scoreRatio", {
              accepted: metrics.accepted,
              total: metrics.total,
              days: metrics.windowDays,
            })
          : t("users.scoreNoHistory", { days: metrics.windowDays })}
      </p>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-micro text-ink-3">
          {override
            ? t("users.scoreAdjustedBy", {
                name: override.name || t("users.scoreAdminFallback"),
                date: override.at ? formatDate(override.at) : "—",
              })
            : t("users.scoreDerived")}
        </p>
        {user?.id && (
          <Link
            to={`/users/${user.id}/edit`}
            className="text-label font-semibold text-brand hover:underline"
          >
            {t("common.edit")}
          </Link>
        )}
      </div>
    </section>
  );
}

SellerScoreSummary.propTypes = {
  user: PropTypes.object,
};

export default SellerScoreSummary;
