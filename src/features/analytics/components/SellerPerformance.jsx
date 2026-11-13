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

const SellerPerformance = memo(({ sellersPerformance, sellerChartOptions, t, formatCurrency }) => {
    const sellerPerformanceChartData = useMemo(() => {
        if (!sellersPerformance || sellersPerformance.length === 0) return { labels: [], datasets: [] };

        const labels = sellersPerformance.map(s => s.seller_name);
        const salesData = sellersPerformance.map(s => s.total_sales);
        const contractsData = sellersPerformance.map(s => s.active_contracts);

        return {
            labels,
            datasets: [
                {
                    type: 'bar',
                    label: t("analytics.totalSales"),
                    data: salesData,
                    backgroundColor: "rgba(59, 130, 246, 0.8)",
                    borderColor: "rgb(59, 130, 246)",
                    borderWidth: 1,
                    borderRadius: 8,
                    yAxisID: 'y',
                },
                {
                    type: 'line',
                    label: t("analytics.contractsSold"),
                    data: contractsData,
                    borderColor: "rgb(13, 148, 136)", // Teal-600
                    backgroundColor: "rgba(13, 148, 136, 0.2)",
                    borderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    fill: false,
                    tension: 0.4,
                    yAxisID: 'y1',
                }
            ],
        };
    }, [sellersPerformance, t]);

    const topSellers = useMemo(() =>
        [...sellersPerformance].sort((a, b) => b.total_sales - a.total_sales).slice(0, 3),
        [sellersPerformance]
    );

    return (
        <motion.section
            id="seller-performance-section"
            variants={itemVariants}
            role="region"
            aria-label={t("analytics.sellerPerformance")}
            className="bg-white/80 dark:bg-darkblack-600/80 backdrop-blur p-8 rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-darkblack-500/50 overflow-hidden relative"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h3 className="text-2xl font-black flex items-center gap-3 text-gray-900 dark:text-white">
                        <div className="w-3 h-8 bg-gradient-to-b from-blue-500 to-teal-600 rounded-full shadow-lg shadow-blue-500/20"></div>
                        <span>{t("analytics.sellerPerformance")}</span>
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium ml-6">
                        {t("analytics.salesBySeller")}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tighter">{t("analytics.totalSales")}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
                        <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                        <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-tighter">{t("analytics.contractsSold")}</span>
                    </div>
                </div>
            </div>

            <div
                className="h-[450px] w-full relative group"
                role="img"
                aria-label={t("analytics.sellerPerformance")}
            >
                <Bar data={sellerPerformanceChartData} options={sellerChartOptions} />

                {/* Background glow decoration */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-blue-500/5 via-transparent to-teal-500/5 pointer-events-none -z-10 blur-3xl"></div>
            </div>

            <ChartDataTable
                caption={t("analytics.sellerPerformance")}
                columns={[
                    t("analytics.sellerLabel"),
                    t("analytics.totalSales"),
                    t("analytics.contractsSold"),
                ]}
                rows={sellersPerformance.map((seller) => [
                    seller.seller_name,
                    formatCurrency(seller.total_sales),
                    seller.active_contracts,
                ])}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
                {topSellers.map((seller, idx) => (
                    <div key={seller.seller_id} className="p-4 rounded-2xl bg-slate-50 dark:bg-darkblack-700/50 border border-slate-100 dark:border-darkblack-500/50 flex items-center gap-4 transition-all hover:scale-[1.02]">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-black text-white bg-gradient-to-br ${idx === 0 ? "from-yellow-400 to-orange-500 shadow-orange-500/20" : idx === 1 ? "from-slate-300 to-slate-500 shadow-slate-500/20" : "from-amber-600 to-amber-800 shadow-amber-800/20"} shadow-lg`}>
                            {idx + 1}
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white truncate max-w-[150px]">{seller.seller_name}</h4>
                            <div className="flex items-center gap-2 text-xs font-semibold mt-0.5">
                                <span className="text-blue-600 dark:text-blue-400 font-bold">{formatCurrency(seller.total_sales)}</span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                <span className="text-teal-600 dark:text-teal-400 font-bold">{seller.active_contracts} {t("analytics.contractsSold")}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </motion.section>
    );
});

SellerPerformance.displayName = "SellerPerformance";

SellerPerformance.propTypes = {
    sellersPerformance: PropTypes.array,
    sellerChartOptions: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired,
    formatCurrency: PropTypes.func.isRequired,
};

export default SellerPerformance;
