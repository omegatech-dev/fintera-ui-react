import { memo, useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import PropTypes from "prop-types";
import ChartDataTable from "./ChartDataTable";

const DistributionChart = memo(
  ({ distribution, doughnutOptions, t, formatPercent }) => {
    const distributionData = useMemo(() => {
      if (!distribution) return { labels: [], datasets: [] };

      return {
        labels: [
          t("analytics.available"),
          t("analytics.reserved"),
          t("analytics.financed"),
          t("analytics.fully_paid"),
        ],
        datasets: [
          {
            data: [
              distribution.available || 0,
              distribution.reserved || 0,
              distribution.financed || 0,
              distribution.fully_paid || 0,
            ],
            backgroundColor: ["#16A34A", "#F59E0B", "#3B82F6", "#94A3B8"],
            borderColor: "#ffffff",
            borderWidth: 2,
          },
        ],
      };
    }, [distribution, t]);

    const legendItems = useMemo(
      () => [
        {
          label: t("analytics.available"),
          count: distribution?.available || 0,
          value: formatPercent(distribution?.available_percentage),
          color: "bg-[#16A34A]",
        },
        {
          label: t("analytics.reserved"),
          count: distribution?.reserved || 0,
          value: formatPercent(distribution?.reserved_percentage),
          color: "bg-[#F59E0B]",
        },
        {
          label: t("analytics.financed"),
          count: distribution?.financed || 0,
          value: formatPercent(distribution?.financed_percentage),
          color: "bg-[#3B82F6]",
        },
        {
          label: t("analytics.fully_paid"),
          count: distribution?.fully_paid || 0,
          value: formatPercent(distribution?.fully_paid_percentage),
          color: "bg-[#94A3B8]",
        },
      ],
      [distribution, t, formatPercent]
    );

    return (
      <section
        role="region"
        aria-label={t("analytics.lotsAvailability")}
        className="rounded-card border border-line bg-surface p-5 text-ink"
      >
        <h3 className="text-title font-bold text-ink">
          {t("analytics.lotsAvailability")}
        </h3>
        <div
          className="relative mx-auto mt-3 aspect-square w-full max-w-[220px]"
          role="img"
          aria-label={t("analytics.lotsAvailability")}
        >
          <Doughnut data={distributionData} options={doughnutOptions} />
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-page font-bold tabular-nums text-ink">
              {distribution?.total_lots || 0}
            </span>
            <span className="text-micro text-ink-3">
              {t("projects.lots")}
            </span>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {legendItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-3 text-label"
            >
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${item.color}`} />
                <span className="font-medium text-ink-2">{item.label}</span>
              </div>
              <span className="font-semibold tabular-nums text-ink">
                {item.count} · {item.value}
              </span>
            </div>
          ))}
        </div>
        <ChartDataTable
          caption={t("analytics.lotsAvailability")}
          columns={[
            t("common.status"),
            t("projects.lots"),
            t("analytics.percentageLabel"),
          ]}
          rows={legendItems.map((item) => [
            item.label,
            item.count,
            item.value,
          ])}
        />
      </section>
    );
  }
);

DistributionChart.displayName = "DistributionChart";

DistributionChart.propTypes = {
  distribution: PropTypes.object,
  doughnutOptions: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  formatPercent: PropTypes.func.isRequired,
};

export default DistributionChart;
