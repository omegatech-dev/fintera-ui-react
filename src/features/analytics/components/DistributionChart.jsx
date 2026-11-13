import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { Doughnut } from "react-chartjs-2";
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

const DistributionChart = memo(({ distribution, doughnutOptions, t, formatPercent }) => {
    const distributionData = useMemo(() => {
        if (!distribution) return { labels: [], datasets: [] };

        return {
            labels: [t("analytics.financed"), t("analytics.reserved"), t("analytics.available"), t("analytics.fully_paid")],
            datasets: [
                {
                    data: [
                        distribution.financed || 0,
                        distribution.reserved || 0,
                        distribution.available || 0,
                        distribution.fully_paid || 0
                    ],
                    backgroundColor: [
                        "rgba(99, 102, 241, 0.8)",  // Financed (Indigo)
                        "rgba(251, 146, 60, 0.8)", // Reserved
                        "rgba(34, 197, 94, 0.2)",  // Available (Faded Green)
                        "rgba(59, 130, 246, 0.8)", // Fully Paid (Blue)
                    ],
                    borderColor: [
                        "rgb(99, 102, 241)",
                        "rgb(251, 146, 60)",
                        "rgba(34, 197, 94, 0.4)",
                        "rgb(59, 130, 246)",
                    ],
                    borderWidth: 1,
                },
            ],
        };
    }, [distribution, t]);

    const legendItems = useMemo(() => [
        { label: t("analytics.financed") || "Financed", count: distribution?.financed || 0, value: formatPercent(distribution?.financed_percentage), color: "bg-indigo-500" },
        { label: t("analytics.reserved"), count: distribution?.reserved || 0, value: formatPercent(distribution?.reserved_percentage), color: "bg-orange-500" },
        { label: t("analytics.available"), count: distribution?.available || 0, value: formatPercent(distribution?.available_percentage), color: "bg-green-500/40" },
        { label: t("analytics.fully_paid") || "Fully Paid", count: distribution?.fully_paid || 0, value: formatPercent(distribution?.fully_paid_percentage), color: "bg-blue-500" },
    ], [distribution, t, formatPercent]);

    return (
        <motion.div
            variants={itemVariants}
            role="region"
            aria-label={t("analytics.lotsAvailability")}
            className="bg-white dark:bg-darkblack-600 p-6 rounded-3xl shadow-2xl border border-gray-100 dark:border-darkblack-500 text-gray-900 dark:text-white"
        >
            <h3 className="text-xl font-bold mb-8 flex items-center space-x-2 text-gray-900 dark:text-white">
                <span className="w-2 h-6 bg-purple-600 rounded-full"></span>
                <span>{t("analytics.lotsAvailability")}</span>
            </h3>
            <div
                className="h-[300px] relative"
                role="img"
                aria-label={t("analytics.lotsAvailability")}
            >
                <Doughnut data={distributionData} options={doughnutOptions} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        {distribution?.total_lots || 0}
                    </span>
                    <span className="text-sm text-gray-400">{t("projects.lots")}</span>
                </div>
            </div>
            <div className="mt-8 space-y-3">
                {legendItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                            <span className={`w-3 h-3 rounded-full ${item.color}`}></span>
                            <span className="text-gray-600 dark:text-gray-300 font-medium">{item.label}</span>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">{item.value}</span>
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
        </motion.div>
    );
});

DistributionChart.displayName = "DistributionChart";

DistributionChart.propTypes = {
    distribution: PropTypes.object,
    doughnutOptions: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired,
    formatPercent: PropTypes.func.isRequired,
};

export default DistributionChart;
