import { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { analyticsApi } from "../api";
import { projectsApi } from "../../projects/api";
import { paymentsApi } from "../../payments/api";

import { useToast } from "@/contexts/ToastContext";
import { Banner } from "@/shared/ui";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
// import { Line, Bar, Doughnut } from "react-chartjs-2"; // Removed
import { useLocale } from "@/contexts/LocaleContext";
import GenericFilter from "@/shared/forms/GenericFilter";
import ExportDropdown from "../components/ExportDropdown";
import StatsGrid from "../components/StatsGrid";
import RevenueTrendChart from "../components/RevenueTrendChart";
import DistributionChart from "../components/DistributionChart";
import MonthlyPerformance from "../components/MonthlyPerformance";
import SellerPerformance from "../components/SellerPerformance";
import GrowthByProject from "../components/GrowthByProject";
import MoraCard from "../components/MoraCard";

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// Static animation config (stable reference)
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 100, damping: 12 },
    },
};



const Analytics = () => {
    const { t } = useLocale();
    const { showToast } = useToast();

    // Calculate first and last day of the current month for initial state
    const [currentDate, setCurrentDate] = useState(new Date());

    // Filter state
    const [filterValue, setFilterValue] = useState("All");
    const [isFiltering, setIsFiltering] = useState(false);

    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [trendProjectId, setTrendProjectId] = useState("All");
    const [trendData, setTrendData] = useState(null);
    const [isFilteringTrend, setIsFilteringTrend] = useState(false);

    // Real data state
    const [projects, setProjects] = useState([]);
    const [overviewData, setOverviewData] = useState(null);
    const [distribution, setDistribution] = useState(null);
    const [performance, setPerformance] = useState(null);
    const [sellersPerformance, setSellersPerformance] = useState([]);
    const [paymentsStats, setPaymentsStats] = useState(null);


    // Fetch projects for filter
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await projectsApi.list({ per_page: 100 });
                setProjects(data.projects || []);
            } catch (err) {
                console.error("Error fetching projects for filter:", err);
            }
        };

        fetchProjects();
    }, []);

    useEffect(() => {
        const fetchPaymentStats = async () => {
            try {
                const data = await paymentsApi.getStats();
                setPaymentsStats(data || null);
            } catch (err) {
                console.error("Error fetching payment stats for analytics:", err);
            }
        };

        fetchPaymentStats();
    }, []);

    // Format project options for GenericFilter
    const projectOptions = useMemo(() => {
        const baseOptions = [{ label: t("common.all"), value: "All" }];
        const projectList = projects.map(p => ({
            label: p.name,
            value: p.id.toString()
        }));
        return [...baseOptions, ...projectList];
    }, [projects, t]);

    // Fetch main analytics (Overview totals, Distribution, Performance)
    const fetchMainAnalytics = useCallback(async () => {
        setIsFiltering(true);
        try {
            const queryParams = {};
            if (filterValue !== "All") queryParams.project_id = filterValue;

            // Calculate start and end date based on selected currentDate
            const startStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
            const endStr = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];

            queryParams.start_date = startStr;
            queryParams.end_date = endStr;

            const [ovData, distData, perfData, sellData] = await Promise.all([
                analyticsApi.getOverview(queryParams),
                analyticsApi.getDistribution(queryParams),
                analyticsApi.getPerformance(queryParams),
                analyticsApi.getSellers(queryParams)
            ]);

            setOverviewData(ovData);
            setDistribution(distData);
            setPerformance(perfData);
            setSellersPerformance(sellData || []);
        } catch (err) {
            console.error("Main analytics fetch error:", err);
            showToast(t("analytics.errorFetchingData"), "error");
        } finally {
            setIsFiltering(false);
        }
    }, [filterValue, currentDate, t, showToast]);

    // Fetch trend data separately (ignoring global date range)
    const fetchTrendData = useCallback(async () => {
        setIsFilteringTrend(true);
        try {
            const queryParams = {};
            if (trendProjectId !== "All") queryParams.project_id = trendProjectId;
            if (selectedYear) queryParams.year = selectedYear;

            const data = await analyticsApi.getOverview(queryParams);
            setTrendData(data.revenue_trend || []);
        } catch (err) {
            console.error("Trend data fetch error:", err);
        } finally {
            setIsFilteringTrend(false);
        }
    }, [trendProjectId, selectedYear]);

    useEffect(() => {
        fetchMainAnalytics();
    }, [fetchMainAnalytics]);

    useEffect(() => {
        fetchTrendData();
    }, [fetchTrendData]);

    const handleFilterChange = useCallback((val) => {
        setFilterValue(val);
    }, []);

    const currencySymbol = overviewData?.currency_symbol || "L";
    const formatCurrency = useCallback(
        (val) => {
            if (val === undefined || val === null) return `${currencySymbol}0`;
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            })
                .format(val)
                .replace("$", currencySymbol);
        },
        [currencySymbol]
    );

    const formatPercent = useCallback((val) => {
        if (val === undefined || val === null) return "0%";
        return `${Number(val).toFixed(1)}%`;
    }, []);

    const overdueSummary = useMemo(() => {
        const rawAmount =
            overviewData?.total_overdue ??
            overviewData?.overdue_amount ??
            paymentsStats?.total_overdue ??
            0;
        const amount = Number(rawAmount);

        return {
            amount: Number.isFinite(amount) ? amount : 0,
            installments:
                paymentsStats?.overdue_count ??
                paymentsStats?.overdue_installments ??
                overviewData?.overdue_count ??
                null,
            clients:
                paymentsStats?.overdue_clients ??
                overviewData?.overdue_clients ??
                null,
        };
    }, [overviewData, paymentsStats]);

    const growthProjects = useMemo(
        () =>
            filterValue === "All"
                ? projects
                : projects.filter((project) => String(project.id) === filterValue),
        [projects, filterValue]
    );

    const handleExport = useCallback(
        async (format) => {
            try {
                const queryParams = {};
                if (filterValue !== "All") queryParams.project_id = filterValue;
                const startStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split("T")[0];
                const endStr = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split("T")[0];
                queryParams.start_date = startStr;
                queryParams.end_date = endStr;
                queryParams.format = format;

                const blob = await analyticsApi.exportReport(queryParams);

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `analytics-report-${startStr}.${format}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                showToast(t("common.downloadSuccess"), "success");
            } catch (err) {
                console.error("Export error:", err);
                showToast(t("common.downloadError"), "error");
            }
        },
        [filterValue, currentDate, t, showToast]
    );

    // Prepare chart data based on API response







    const chartOptions = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        color: "currentColor",
                        font: { family: "'Urbanist', sans-serif", size: 12 },
                    },
                },
                tooltip: {
                    backgroundColor: "rgba(17, 24, 39, 0.95)",
                    padding: 12,
                    cornerRadius: 12,
                    titleColor: "#fff",
                    bodyColor: "#cbd5e1",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderWidth: 1,
                    displayColors: true,
                    boxPadding: 4,
                },
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: "currentColor", opacity: 0.7, font: { family: "'Urbanist', sans-serif" } },
                    border: { display: false },
                },
                y: {
                    grid: { color: "rgba(156, 163, 175, 0.1)", drawBorder: false },
                    ticks: { color: "currentColor", opacity: 0.7, padding: 10, font: { family: "'Urbanist', sans-serif" } },
                    border: { display: false },
                },
            },
            interaction: { mode: "index", intersect: false },
        }),
        []
    );

    const sellerChartOptions = useMemo(() => ({
        ...chartOptions,
        scales: {
            ...chartOptions.scales,
            y: {
                ...chartOptions.scales.y,
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: t("analytics.totalSales"),
                    color: "#3b82f6", // Blue-500
                    font: { family: "'Urbanist', sans-serif", weight: 'bold' }
                }
            },
            y1: {
                ...chartOptions.scales.y,
                type: 'linear',
                display: true,
                position: 'right',
                grid: { drawOnChartArea: false },
                title: {
                    display: true,
                    text: t("analytics.contractsSold"),
                    color: "#0d9488", // Teal-600
                    font: { family: "'Urbanist', sans-serif", weight: 'bold' }
                }
            }
        }
    }), [chartOptions, t]);

    const dateRangeForExport = useMemo(
        () => ({
            startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split("T")[0],
            endDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split("T")[0],
        }),
        [currentDate]
    );

    const monthLabel = useMemo(
        () =>
            [
                t("months.january"),
                t("months.february"),
                t("months.march"),
                t("months.april"),
                t("months.may"),
                t("months.june"),
                t("months.july"),
                t("months.august"),
                t("months.september"),
                t("months.october"),
                t("months.november"),
                t("months.december"),
            ][currentDate.getMonth()],
        [t, currentDate]
    );

    const statsForGrid = useMemo(() => {
        const ov = overviewData;
        const previousDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - 1,
            1
        );
        const previousLabel = new Intl.DateTimeFormat("en-US", {
            month: "short",
        }).format(previousDate);
        const previousEntry = (ov?.revenue_trend || []).find(
            (entry) =>
                String(entry.label || "").toLowerCase() ===
                previousLabel.toLowerCase()
        );
        // The API reports 100% when the previous period is empty; suppress it
        // instead of presenting a fabricated comparison.
        const hasPreviousData = previousEntry
            ? Number(previousEntry.real) > 0
            : false;
        const formatChange = (value) =>
            hasPreviousData && value != null
                ? `${value > 0 ? "+" : ""}${value}%`
                : null;

        return [
            {
                label: t("analytics.totalRevenue"),
                value: formatCurrency(ov?.total_revenue),
                change: formatChange(ov?.revenue_change_percentage),
                color: "text-blue-600 dark:text-blue-400",
            },
            {
                label: t("analytics.activeContracts"),
                value: ov?.active_contracts ?? "0",
                change: formatChange(ov?.contracts_change_percentage),
                color: "text-teal-600 dark:text-teal-400",
            },
            {
                label: t("analytics.averagePayment"),
                value: formatCurrency(ov?.average_payment),
                change: formatChange(ov?.payment_change_percentage),
                color: "text-orange-600 dark:text-orange-400",
            },
            {
                label: t("analytics.occupancyRate"),
                value: formatPercent(ov?.occupancy_rate),
                change: formatChange(ov?.occupancy_change_percentage),
                color: "text-green-600 dark:text-green-400",
            },
        ];
    }, [overviewData, t, formatCurrency, formatPercent, currentDate]);

    const doughnutOptions = useMemo(
        () => ({
            ...chartOptions,
            cutout: "75%",
            plugins: {
                ...chartOptions.plugins,
                legend: { position: "bottom" },
            },
        }),
        [chartOptions]
    );

    return (
        <main className="w-full px-3 sm:px-6 pb-6 pt-[80px] xs:pt-[90px] sm:md:pt-[120px] lg:pt-[156px] page-shell xl:px-12 xl:pb-12 2xl:px-16">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-8"
            >
                {/* Header and Filters */}
                <section className="space-y-6">
                    <div id="analytics-header" className="flex flex-col md:flex-row md:items-end md:justify-end gap-4">
                        <motion.div id="analytics-export-dropdown" variants={itemVariants} className="flex items-end">
                            <ExportDropdown
                                startDate={dateRangeForExport.startDate}
                                endDate={dateRangeForExport.endDate}
                                onExportBase={handleExport}
                            />
                        </motion.div>
                    </div>

                    <motion.div id="analytics-filters" variants={itemVariants} className="flex flex-col md:flex-row items-center gap-4 w-full">
                        <div className="flex-1 w-full">
                            <GenericFilter
                                showSearch={false}
                                filterValue={filterValue}
                                onFilterChange={handleFilterChange}
                                filterOptions={projectOptions}
                                filterPlaceholder={t("projects.projectType")}
                            />
                        </div>

                        {/* Month/Year Selection */}
                        <div className="flex items-center bg-white/40 dark:bg-darkblack-600/40 backdrop-blur-xl rounded-[2rem] p-2 border border-white/50 dark:border-darkblack-400/50 shadow-2xl shadow-blue-500/5 ring-1 ring-black/5 dark:ring-white/5">
                            <button
                                onClick={() => {
                                    const next = new Date(currentDate);
                                    next.setMonth(next.getMonth() - 1);
                                    setCurrentDate(next);
                                }}
                                className="p-3 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-all"
                                title={t("common.previous")}
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            <div className="px-6 flex flex-col items-center min-w-[140px]">
                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                    {currentDate.getFullYear()}
                                </span>
                                <span className="text-lg font-black text-gray-900 dark:text-white leading-tight">
                                    {monthLabel}
                                </span>
                            </div>

                            <button
                                onClick={() => {
                                    const next = new Date(currentDate);
                                    next.setMonth(next.getMonth() + 1);
                                    setCurrentDate(next);
                                }}
                                className="p-3 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-all"
                                title={t("common.next")}
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </motion.div>
                </section>

                {/* Chart Content Area with Loading State */}
                <div className="relative">
                    <AnimatePresence>
                        {isFiltering && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-50 bg-white/40 dark:bg-darkblack-900/40 backdrop-blur-xs rounded-3xl flex items-center justify-center"
                            >
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-sm font-bold text-blue-600">{t("common.loading")}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className={`space-y-8 transition-all duration-300 ${isFiltering ? "blur-[2px] opacity-60 scale-[0.99]" : ""}`}>
                        {/* Stats Grid */}
                        <StatsGrid stats={statsForGrid} t={t} />

                        {/* Charts Row 1 */}
                        <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            {/* Main Trend Chart */}
                            <RevenueTrendChart
                                trendData={trendData}
                                trendProjectId={trendProjectId}
                                setTrendProjectId={setTrendProjectId}
                                projectOptions={projectOptions}
                                selectedYear={selectedYear}
                                setSelectedYear={setSelectedYear}
                                isFiltering={isFilteringTrend}
                                t={t}
                                chartOptions={chartOptions}
                            />

                            {/* Distribution Chart (Lots Availability) */}
                            <DistributionChart
                                distribution={distribution}
                                doughnutOptions={doughnutOptions}
                                t={t}
                                formatPercent={formatPercent}
                            />
                        </section>

                        {/* Charts Row 2 - Monthly Performance */}
                        <MonthlyPerformance
                            performance={performance}
                            chartOptions={chartOptions}
                            t={t}
                        />

                        {/* Charts Row 3 - Growth and Overdue */}
                        <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            <div className="h-full xl:col-span-2">
                                <GrowthByProject
                                    projects={growthProjects}
                                    performance={performance}
                                    t={t}
                                />
                            </div>
                            <div className="h-full xl:col-span-1">
                                <MoraCard
                                    amount={overdueSummary.amount}
                                    installments={overdueSummary.installments}
                                    clients={overdueSummary.clients}
                                    formatCurrency={formatCurrency}
                                    t={t}
                                />
                            </div>
                        </section>

                        <SellerPerformance
                            sellersPerformance={sellersPerformance}
                            sellerChartOptions={sellerChartOptions}
                            t={t}
                            formatCurrency={formatCurrency}
                        />

                        {overdueSummary.amount > 0 && (
                            <Banner
                                tone="warning"
                                icon={
                                    <svg
                                        aria-hidden="true"
                                        className="mt-0.5 h-4 w-4 shrink-0"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.8}
                                            d="M9.663 17h4.674M12 3a6 6 0 00-3.6 10.8c.4.3.6.8.6 1.2V16h6v-1c0-.4.2-.9.6-1.2A6 6 0 0012 3z"
                                        />
                                    </svg>
                                }
                                action={
                                    <Link
                                        to="/payments?status=overdue"
                                        className="shrink-0 whitespace-nowrap text-label font-bold text-warning hover:underline"
                                    >
                                        {t("analytics.viewCollections")}{" "}
                                        <span aria-hidden="true">→</span>
                                    </Link>
                                }
                            >
                                {t("analytics.insightOverdue", {
                                    amount: formatCurrency(overdueSummary.amount),
                                })}
                            </Banner>
                        )}
                    </div>
                </div>
            </motion.div>

        </main>
    );
};

export default Analytics;
