import { memo, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import PropTypes from "prop-types";
import ChartDataTable from "./ChartDataTable";

const MonthlyPerformance = memo(({ performance, chartOptions, t }) => {
  const monthlyPerformanceData = useMemo(() => {
    if (!performance || performance.length === 0)
      return { labels: [], datasets: [] };

    const labels = Array.isArray(performance)
      ? performance.map((item) => item.project_name)
      : performance.weekly_labels || ["W1", "W2", "W3", "W4"];
    const data = Array.isArray(performance)
      ? performance.map((item) => item.growth_percentage)
      : performance.weekly_performance || [];

    return {
      labels,
      datasets: [
        {
          label: t("analytics.growthAnalysis"),
          data,
          backgroundColor: "rgba(22, 163, 74, 0.75)",
          borderRadius: 6,
        },
      ],
    };
  }, [performance, t]);

  return (
    <section
      role="region"
      aria-label={t("analytics.monthlyPerformance")}
      className="rounded-card border border-line bg-surface p-5 text-ink"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-title font-bold text-ink">
          {t("analytics.monthlyPerformance")}
        </h3>
        <span className="text-micro font-medium text-ink-3">
          {new Date().getFullYear()}
        </span>
      </div>
      <div
        className="mt-3 h-[280px] text-ink-2"
        role="img"
        aria-label={t("analytics.monthlyPerformance")}
      >
        <Bar data={monthlyPerformanceData} options={chartOptions} />
      </div>
      <ChartDataTable
        caption={t("analytics.monthlyPerformance")}
        columns={[t("analytics.projectLabel"), t("analytics.growthAnalysis")]}
        rows={monthlyPerformanceData.labels.map((label, index) => [
          label,
          monthlyPerformanceData.datasets[0].data[index] ?? "—",
        ])}
      />
    </section>
  );
});

MonthlyPerformance.displayName = "MonthlyPerformance";

MonthlyPerformance.propTypes = {
  performance: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  chartOptions: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
};

export default MonthlyPerformance;
