import { memo } from "react";
import { motion } from "framer-motion";
import PropTypes from "prop-types";

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 100, damping: 12 },
    },
};

const StatsGrid = memo(({ stats, t }) => {
    return (
        <section id="analytics-stats" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
                <motion.div
                    key={idx}
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                    className="bg-white dark:bg-darkblack-600 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-darkblack-500"
                >
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                    <div className="mt-2 flex items-baseline justify-between gap-2">
                        <h2 className={`text-2xl font-bold ${stat.color}`}>{stat.value}</h2>
                        {stat.change ? (
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stat.change.startsWith("+")
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                }`}>
                                {stat.change}
                            </span>
                        ) : (
                            <span className="text-right text-xs font-medium text-gray-400">
                                {t("analytics.noPrevious")}
                            </span>
                        )}
                    </div>
                    {stat.change && (
                        <p className="mt-2 text-xs text-gray-400">{t("analytics.comparedToLastMonth")}</p>
                    )}
                </motion.div>
            ))}
        </section>
    );
});

StatsGrid.displayName = "StatsGrid";

StatsGrid.propTypes = {
    stats: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            change: PropTypes.string,
            color: PropTypes.string.isRequired,
        })
    ).isRequired,
    t: PropTypes.func.isRequired,
};

export default StatsGrid;
