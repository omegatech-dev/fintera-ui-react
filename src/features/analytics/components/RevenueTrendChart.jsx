import React, { memo, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Line } from "react-chartjs-2";
import PropTypes from "prop-types";

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 100, damping: 12 },
    },
};

const monthOrder = {
    "Jan": 0, "Feb": 1, "Mar": 2, "Apr": 3, "May": 4, "Jun": 5,
    "Jul": 6, "Aug": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11
};

const RevenueTrendChart = memo(({
    trendData,
    trendProjectId,
    setTrendProjectId,
    projectOptions,
    selectedYear,
    setSelectedYear,
    isFiltering,
    t,
    chartOptions
}) => {
    const chartRef = useRef(null);

    // Initial data structure for first render
    const initialData = useMemo(() => ({
        labels: [],
        datasets: [
            {
                label: t("analytics.realData"),
                data: [],
                borderColor: "rgb(59, 130, 246)",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
            {
                label: t("analytics.projections"),
                data: [],
                borderColor: "rgb(13, 148, 136)",
                borderDash: [5, 5],
                backgroundColor: "transparent",
                fill: false,
                tension: 0.4,
            },
        ],
    }), [t]);

    // Manual chart update to avoid canvas destruction/recreation
    useEffect(() => {
        const chart = chartRef.current;
        if (chart && trendData) {
            const sortedData = [...trendData].sort((a, b) => {
                return (monthOrder[a.label] ?? 99) - (monthOrder[b.label] ?? 99);
            });

            const labels = sortedData.map(point => point.label);
            const realData = sortedData.map(point => point.real);
            const projectedData = sortedData.map(point => point.projected);

            chart.data.labels = labels;
            chart.data.datasets[0].data = realData;
            chart.data.datasets[1].data = projectedData;
            chart.data.datasets[0].label = t("analytics.realData");
            chart.data.datasets[1].label = t("analytics.projections");

            chart.update();
        }
    }, [trendData, t]);

    return (
        <motion.div
            id="revenue-chart"
            variants={itemVariants}
            className="xl:col-span-2 bg-white/80 dark:bg-darkblack-600/80 backdrop-blur p-6 rounded-3xl shadow-2xl border border-gray-100 dark:border-darkblack-500 overflow-hidden text-gray-900 dark:text-white"
        >
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold flex items-center space-x-2 text-gray-900 dark:text-white">
                    <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                    <span>{t("analytics.revenueTrend")}</span>
                </h3>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative group/select">
                        <select
                            value={trendProjectId}
                            onChange={(e) => setTrendProjectId(e.target.value)}
                            className="appearance-none bg-slate-900/5 dark:bg-slate-900/40 px-4 py-2 pr-10 rounded-xl backdrop-blur-xs border border-black/5 dark:border-white/5 text-sm font-bold text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer hover:bg-black/10 dark:hover:bg-white/10"
                        >
                            {projectOptions.map(opt => (
                                <option key={opt.value} value={opt.value} className="bg-white dark:bg-darkblack-600">
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover/select:text-slate-600 dark:group-hover/select:text-slate-200 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-slate-900/5 dark:bg-slate-900/40 px-3 py-2 rounded-xl backdrop-blur-xs border border-black/5 dark:border-white/5">
                        <button
                            onClick={() => setSelectedYear(y => y - 1)}
                            className="text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 p-1 rounded-lg transition-all"
                            title={t("analytics.previousYear")}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <AnimatePresence mode="wait">
                            <motion.span
                                key={selectedYear}
                                initial={{ opacity: 0, scale: 0.9, y: 5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -5 }}
                                transition={{ duration: 0.2 }}
                                className="text-sm font-bold text-gray-900 dark:text-white min-w-[3.5rem] text-center"
                            >
                                {selectedYear}
                            </motion.span>
                        </AnimatePresence>

                        <button
                            onClick={() => setSelectedYear(y => y + 1)}
                            className="text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 p-1 rounded-lg transition-all"
                            title={t("analytics.nextYear")}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <div className="h-[400px] relative">
                <AnimatePresence>
                    {isFiltering && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-10 bg-white/20 dark:bg-darkblack-600/20 backdrop-blur-[1px] flex items-center justify-center rounded-2xl"
                        >
                            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <Line ref={chartRef} data={initialData} options={chartOptions} />
            </div>
        </motion.div>
    );
});

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
