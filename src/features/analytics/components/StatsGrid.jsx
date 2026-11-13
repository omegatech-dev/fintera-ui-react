import { memo } from "react";
import PropTypes from "prop-types";

const StatsGrid = memo(({ stats, t, compareMonth }) => {
  return (
    <section
      id="analytics-stats"
      className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4"
    >
      {stats.map((stat) => {
        const isNegative = String(stat.change || "").startsWith("-");
        return (
          <div
            key={stat.label}
            className="rounded-xl border border-line bg-surface p-3.5"
          >
            <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
              {stat.label}
            </p>
            <p className="mt-1.5 text-[22px] font-bold leading-tight tabular-nums text-ink">
              {stat.value}
            </p>
            {stat.change ? (
              <p className="mt-1 text-micro font-semibold">
                <span className={isNegative ? "text-danger" : "text-brand"}>
                  {stat.change}
                </span>{" "}
                <span className="font-medium text-ink-3">
                  {compareMonth
                    ? t("analytics.vsMonth", { month: compareMonth })
                    : t("analytics.comparedToLastMonth")}
                </span>
              </p>
            ) : stat.caption ? (
              <p className="mt-1 text-micro font-medium text-ink-3">
                {stat.caption}
              </p>
            ) : (
              <p className="mt-1 text-micro font-medium text-ink-3">
                {t("analytics.noPrevious")}
              </p>
            )}
          </div>
        );
      })}
    </section>
  );
});

StatsGrid.displayName = "StatsGrid";

StatsGrid.propTypes = {
  stats: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      change: PropTypes.string,
      caption: PropTypes.string,
      color: PropTypes.string,
    })
  ).isRequired,
  t: PropTypes.func.isRequired,
  compareMonth: PropTypes.string,
};

export default StatsGrid;
