import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLocale } from "../../../contexts/LocaleContext";
import { formatCurrency } from "../../../shared/utils/formatters";

import { dashboardApi } from "../api";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from "chart.js";
import CommissionsModal from "./CommissionsModal";

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const SellerDashboard = ({ user }) => {
    const { t } = useLocale();
    const navigate = useNavigate();
    const [showCommissionsModal, setShowCommissionsModal] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const now = new Date();
                const month = now.getMonth() + 1;
                const year = now.getFullYear();
                const data = await dashboardApi.getSellerStats(month, year);
                setDashboardData(data);
                setChartData(data?.chart_data ?? null);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            }
        };

        fetchDashboardData();
    }, []);

    // Currency formatting uses the deployment default or a record-specific currency.

    // Calculate stats based on API data
    const stats = useMemo(() => {
        if (!dashboardData) return [
            { label: t("sellerDashboard.totalSalesValue"), value: "-", change: "-", color: "text-blue-600 dark:text-blue-400", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
            { label: t("sellerDashboard.activeLeads"), value: "-", change: "-", color: "text-purple-600 dark:text-purple-400", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /> },
            { label: t("sellerDashboard.pendingCommission"), value: "-", change: "-", color: "text-orange-600 dark:text-orange-400", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> },
            { label: t("sellerDashboard.conversionRate"), value: "-", change: "-", color: "text-green-600 dark:text-green-400", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /> }
        ];

        return [
            {
                label: t("sellerDashboard.totalSalesValue"),
                value: formatCurrency(dashboardData.total_sales_value),
                change: t("sellerDashboard.stats.last6Months"),
                color: "text-blue-600 dark:text-blue-400",
                icon: (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                )
            },
            {
                label: t("sellerDashboard.activeLeads"),
                value: dashboardData.active_leads,
                change: t("sellerDashboard.stats.last6Months"),
                color: "text-purple-600 dark:text-purple-400",
                icon: (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                )
            },
            {
                label: t("sellerDashboard.pendingCommission"),
                value: formatCurrency(dashboardData.pending_commission),
                change: t("sellerDashboard.stats.last6Months"),
                color: "text-orange-600 dark:text-orange-400",
                icon: (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                )
            },
            {
                label: t("sellerDashboard.conversionRate"),
                value: `${dashboardData.conversion_rate.toFixed(1)}%`,
                change: t("sellerDashboard.stats.last6Months"),
                color: "text-green-600 dark:text-green-400",
                icon: (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                )
            }
        ];
    }, [dashboardData, t]);

    const chartDataForGraph = useMemo(() => {
        if (!chartData) return { labels: [], datasets: [] };

        return {
            labels: chartData.labels,
            datasets: [
                {
                    label: t("sellerDashboard.stats.sales"),
                    data: chartData.data,
                    borderColor: "rgb(59, 130, 246)",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                }
            ]
        };
    }, [chartData, t]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: "rgba(17, 24, 39, 0.95)",
                padding: 12,
                cornerRadius: 12,
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += formatCurrency(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: { grid: { display: false }, ticks: { color: "currentColor", opacity: 0.7 } },
            y: {
                grid: { color: "rgba(156, 163, 175, 0.1)" },
                ticks: {
                    color: "currentColor",
                    opacity: 0.7,
                    callback: function (value) {
                        return new Intl.NumberFormat('es-HN', { notation: "compact", compactDisplay: "short" }).format(value);
                    }
                }
            }
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100, damping: 15 }
        }
    };


    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-8"
        >
            {/* Hero Section */}
            <motion.section id="seller-dashboard-hero" variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 p-8 text-white shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">
                            {t("sellerDashboard.welcomeBack")}, {user?.full_name?.split(' ')[0]}! 👋
                        </h1>
                        <p className="text-indigo-100 text-lg max-w-lg">
                            {t("sellerDashboard.heroSubtitle")}
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-4">
                        <div className="flex flex-wrap justify-center gap-4">
                            <motion.button
                                id="seller-new-sale-btn"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate("/projects")}
                                className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                {t("sellerDashboard.newSale")}
                            </motion.button>
                            <motion.button
                                id="seller-add-lead-btn"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate("/users/create")}
                                className="px-6 py-3 bg-indigo-500/30 text-white border border-white/20 backdrop-blur-md rounded-xl font-bold hover:bg-indigo-500/40 transition-all flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                                {t("sellerDashboard.addLead")}
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-blue-400 opacity-10 blur-2xl" />
            </motion.section>

            {/* Stats Grid */}
            <section id="seller-dashboard-stats" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        variants={itemVariants}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        className="bg-white dark:bg-darkblack-600 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-darkblack-500 group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-gray-50 dark:bg-darkblack-500 group-hover:scale-110 transition-transform ${stat.color}`}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {stat.icon}
                                </svg>
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400`}>
                                {stat.change}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {stat.value}
                            </h2>
                        </div>
                    </motion.div>
                ))}
            </section>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Performance Chart */}
                <motion.div
                    id="seller-performance-chart"
                    variants={itemVariants}
                    className="xl:col-span-2 bg-white dark:bg-darkblack-600 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-darkblack-500"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {t("sellerDashboard.performanceTrend")}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t("sellerDashboard.stats.last6Months")}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                <span className="text-xs font-medium text-gray-500">{t("sellerDashboard.stats.sales")}</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[300px]">
                        <Line data={chartDataForGraph} options={chartOptions} />
                    </div>
                </motion.div>

                {/* Pipeline / Recent Activities */}
                <motion.div
                    id="seller-recent-customers"
                    variants={itemVariants}
                    className="bg-white dark:bg-darkblack-600 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-darkblack-500 flex flex-col"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {t("sellerDashboard.recentCustomers")}
                        </h3>
                        <button
                            onClick={() => navigate("/users?my_clients=1")}
                            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                        >
                            {t("sellerDashboard.viewAllCustomers")}
                        </button>
                    </div>

                    <div className="space-y-6 flex-1 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                        {(dashboardData?.recent_customers || []).length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                                <p>{t("common.noData")}</p>
                            </div>
                        ) : (
                            (dashboardData?.recent_customers || []).map((customer, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 + idx * 0.1 }}
                                    className="flex items-center gap-4 group cursor-pointer"
                                >
                                    <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
                                        {customer.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                            {customer.name}
                                        </h4>
                                        <p className="text-xs text-gray-500 truncate">{customer.project}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{customer.amount}</p>
                                        <p className="text-[10px] text-gray-400">
                                            {new Date(customer.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    <div className="mt-8">
                        <motion.button
                            id="seller-view-commissions-btn"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowCommissionsModal(true)}
                            className="w-full py-4 bg-gray-50 dark:bg-darkblack-500 rounded-2xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-darkblack-400 transition-all flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            {t("sellerDashboard.viewCommissions")}
                        </motion.button>
                    </div>
                </motion.div>
            </div>

            <CommissionsModal
                isActive={showCommissionsModal}
                handleClose={() => setShowCommissionsModal(false)}
                initialDate={new Date()}
            />
        </motion.div>
    );
};

export default SellerDashboard;
