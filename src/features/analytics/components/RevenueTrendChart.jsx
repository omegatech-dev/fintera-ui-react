import { memo, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Line } from "react-chartjs-2";
import PropTypes from "prop-types";
import ChartDataTable from "./ChartDataTable";
import { localizeMonth, monthOrder } from "./monthLabels";

const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 110, damping: 16 },
  },
};

const RevenueTrendChart = memo(
  ({
    trendData,
    trendProjectId,
    setTrendProjectId,
    projectOptions,
    selectedYear,
    setSelectedYear,
    isFiltering,
    t,
    chartOptions,
  }) => {
    const chartRef = useRef(null);

    const initialData = useMemo(
      () => ({
        labels: [],
        datasets: [
          {
            label: t("analytics.realData"),
            data: [],
            borderColor: "rgb(22, 163, 74)",
            backgroundColor: "rgba(22, 163, 74, 0.12)",
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: t("analytics.projections"),
            data: [],
            borderColor: "rgb(100, 116, 139)",
            borderDash: [5, 5],
            backgroundColor: "transparent",
            fill: false,
            tension: 0.4,
          },
        ],
      }),
      [t]
    );

    const sortedData = useMemo(
      () =>
        [...(trendData || [])].sort((a, b) => {
          return (monthOrder[a.label] ?? 99) - (monthOrder[b.label] ?? 99);
        }),
      [trendData]
    );

    useEffect(() => {
      const chart = chartRef.current;
      if (chart) {
        chart.data.labels = sortedData.map((point) =>
          localizeMonth(point.label, t)
        );
        chart.data.datasets[0].data = sortedData.map((point) => point.real);
        chart.data.datasets[1].data = sortedData.map(
          (point) => point.projected
        );
        chart.data.datasets[0].label = t("analytics.realData");
        chart.data.datasets[1].label = t("analytics.projections");

        chart.update();
      }
    }, [sortedData, t]);

    return (
      <motion.div
        id="revenue-chart"
        variants={itemVariants}
        role="region"
        aria-label={t("analytics.revenueTrend")}
        className="overflow-hidden rounded-card border border-line bg-surface p-5 text-ink xl:col-span-2"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-title font-bold text-ink">
            {t("analytics.revenueTrend")}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <select
                value={trendProjectId}
                onChange={(event) => setTrendProjectId(event.target.value)}
                aria-label={t("analytics.allProjects")}
                className="h-9 appearance-none rounded-control border border-line bg-surface pl-2.5 pr-8 text-label font-semibold text-ink-2 focus:border-brand focus:outline-hidden"
              >
                {projectOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 9l6 6 6-6"
                />
              </svg>
            </div>

            <div className="flex h-9 items-center rounded-control border border-line bg-surface">
              <button
                type="button"
                onClick={() => setSelectedYear((year) => year - 1)}
                className="flex h-full items-center px-2 text-ink-3 transition-colors hover:text-ink"
                title={t("analytics.previousYear")}
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <AnimatePresence mode="wait">
                <motion.span
                  key={selectedYear}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="min-w-[3rem] text-center text-label font-bold text-ink"
                >
                  {selectedYear}
                </motion.span>
              </AnimatePresence>

              <button
                type="button"
                onClick={() => setSelectedYear((year) => year + 1)}
                className="flex h-full items-center px-2 text-ink-3 transition-colors hover:text-ink"
                title={t("analytics.nextYear")}
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div
          className="relative h-[300px] text-ink-2"
          role="img"
          aria-label={t("analytics.revenueTrend")}
        >
          <AnimatePresence>
            {isFiltering && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex items-center justify-center rounded-control bg-surface/60 backdrop-blur-sm"
              >
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
              </motion.div>
            )}
          </AnimatePresence>
          <Line ref={chartRef} data={initialData} options={chartOptions} />
        </div>
        <ChartDataTable
          caption={t("analytics.revenueTrend")}
          columns={[
            t("analytics.monthLabel"),
            t("analytics.realData"),
            t("analytics.projections"),
          ]}
          rows={sortedData.map((point) => [
            localizeMonth(point.label, t),
            point.real ?? "—",
            point.projected ?? "—",
          ])}
        />
      </motion.div>
    );
  }
);

RevenueTrendChart.displayName = "RevenueTrendChart";

RevenueTrendChart.propTypes = {
  trendData: PropTypes.array,
  trendProjectId: PropTypes.string.isRequired,
  setTrendProjectId: PropTypes.func.isRequired,
  projectOptions: PropTypes.array.isRequired,
  selectedYear: PropTypes.number.isRequired,
  setSelectedYear: PropTypes.func.isRequired,
  isFiltering: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
  chartOptions: PropTypes.object.isRequired,
};

export default RevenueTrendChart;
