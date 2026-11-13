import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { Bar } from "react-chartjs-2";
import PropTypes from "prop-types";
import ChartDataTable from "./ChartDataTable";

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 100, damping: 12 },
    },
};

const MonthlyPerformance = memo(({ performance, chartOptions, t }) => {
    const monthlyPerformanceData = useMemo(() => {
        if (!performance || performance.length === 0) return { labels: [], datasets: [] };

        // Ensure we are using real project data if performance is an array of projects
        const labels = Array.isArray(performance) ? performance.map(p => p.project_name) : (performance.weekly_labels || ["W1", "W2", "W3", "W4"]);
        const data = Array.isArray(performance) ? performance.map(p => p.growth_percentage) : (performance.weekly_performance || []);

        return {
            labels: labels,
            datasets: [
                {
                    label: t("analytics.growthAnalysis"),
                    data: data,
                    backgroundColor: "rgba(59, 130, 246, 0.6)",
                    borderRadius: 8,
                },
            ],
        };
    }, [performance, t]);

    return (
        <motion.div
            variants={itemVariants}
            role="region"
            aria-label={t("analytics.monthlyPerformance")}
            className="bg-white dark:bg-darkblack-600 p-6 rounded-3xl shadow-2xl border border-gray-100 dark:border-darkblack-500 text-gray-900 dark:text-white"
        >
            <h3 className="text-xl font-bold mb-8 flex items-center space-x-2 text-gray-900 dark:text-white">
                <span className="w-2 h-6 bg-orange-600 rounded-full"></span>
                <span>{t("analytics.monthlyPerformance")}</span>
            </h3>
            <div
                className="h-[300px]"
                role="img"
                aria-label={t("analytics.monthlyPerformance")}
            >
                <Bar data={monthlyPerformanceData} options={chartOptions} />
            </div>
            <ChartDataTable
                caption={t("analytics.monthlyPerformance")}
                columns={[
                    t("analytics.projectLabel"),
                    t("analytics.growthAnalysis"),
                ]}
                rows={monthlyPerformanceData.labels.map((label, index) => [
                    label,
                    monthlyPerformanceData.datasets[0].data[index] ?? "—",
                ])}
            />
        </motion.div>
    );
});

MonthlyPerformance.displayName = "MonthlyPerformance";

MonthlyPerformance.propTypes = {
    performance: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    chartOptions: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired,
};

export default MonthlyPerformance;
