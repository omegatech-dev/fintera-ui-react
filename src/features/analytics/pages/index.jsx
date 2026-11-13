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

    // Format project options for the project filter
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
                        font: { family: "'Inter', sans-serif", size: 12 },
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
                    ticks: { color: "currentColor", opacity: 0.7, font: { family: "'Inter', sans-serif" } },
                    border: { display: false },
                },
                y: {
                    grid: { color: "rgba(156, 163, 175, 0.1)", drawBorder: false },
                    ticks: { color: "currentColor", opacity: 0.7, padding: 10, font: { family: "'Inter', sans-serif" } },
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
                    font: { family: "'Inter', sans-serif", weight: 'bold' }
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
                    font: { family: "'Inter', sans-serif", weight: 'bold' }
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

    const monthNames = useMemo(
        () => [
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
        ],
        [t]
    );

    const monthLabel = monthNames[currentDate.getMonth()];
    const previousMonthLabel =
        monthNames[(currentDate.getMonth() + 11) % 12];
    const selectedProjectLabel =
        filterValue === "All"
            ? t("analytics.allProjects")
            : projectOptions.find((option) => option.value === filterValue)
                  ?.label || t("analytics.allProjects");

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
        const hasTrendData = previousEntry
            ? Number(previousEntry.real) > 0
            : false;
        const formatChange = (value, previous) => {
            const hasPrevious =
                ov?.previous_revenue != null ||
                ov?.previous_contracts != null ||
                ov?.previous_average_payment != null ||
                ov?.previous_occupancy_rate != null
                    ? Number(previous) > 0
                    : hasTrendData;
            return hasPrevious && value != null
                ? `${value > 0 ? "+" : ""}${value}%`
                : null;
        };

        return [
            {
                label: t("analytics.totalRevenue"),
                value: formatCurrency(ov?.total_revenue),
                change: formatChange(ov?.revenue_change_percentage, ov?.previous_revenue),
                color: "text-ink",
            },
            {
                label: t("analytics.activeContracts"),
                value: ov?.active_contracts ?? "0",
                change: formatChange(ov?.contracts_change_percentage, ov?.previous_contracts),
                color: "text-ink",
            },
            {
                label: t("analytics.averagePayment"),
                value: formatCurrency(ov?.average_payment),
                change: formatChange(ov?.payment_change_percentage, ov?.previous_average_payment),
                color: "text-ink",
            },
            {
                label: t("analytics.occupancyRate"),
                value: formatPercent(ov?.occupancy_rate),
                change: formatChange(ov?.occupancy_change_percentage, ov?.previous_occupancy_rate),
                color: "text-ink",
                caption:
                    distribution && Number(distribution.total_lots) > 0
                        ? t("analytics.kpiLotsCaption", {
                            sold:
                                Number(distribution.financed || 0) +
                                Number(distribution.fully_paid || 0),
                            total: Number(distribution.total_lots),
                        })
                        : null,
            },
        ];
    }, [overviewData, t, formatCurrency, formatPercent, currentDate, distribution]);

    const doughnutOptions = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            cutout: "72%",
            // A doughnut must not inherit the cartesian scales used by the line
            // and bar charts, otherwise Chart.js paints x/y axes behind the ring.
            scales: {},
            plugins: {
                legend: { display: false },
                tooltip: {
                    ...chartOptions.plugins.tooltip,
                    callbacks: {
                        label: (context) => {
                            const value = Number(context.raw) || 0;
                            return `${context.label}: ${value}`;
                        },
                    },
                },
            },
            animation: {
                animateRotate: true,
                animateScale: false,
                duration: 600,
            },
        }),
        [chartOptions.plugins.tooltip]
    );

    return (
        <main className="min-h-screen w-full bg-canvas px-6 pb-6 page-shell xl:px-[48px] xl:pb-[48px]">
            <div className="mx-auto max-w-[1600px]">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-5"
            >
                {/* Header and Filters */}
                <header id="analytics-header" className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-page font-bold tracking-tight text-ink">
                            {t("analytics.title")}
                        </h1>
                        <p className="mt-1 text-body text-ink-3">
                            {t("analytics.periodSubtitle", {
                                period: `${monthLabel} ${currentDate.getFullYear()}`,
                                project: selectedProjectLabel,
                            })}
                        </p>
                    </div>

                    <div id="analytics-filters" className="flex flex-wrap items-center gap-2">
                        <div className="relative">
                            <select
                                value={filterValue}
                                onChange={(event) => handleFilterChange(event.target.value)}
                                aria-label={t("analytics.allProjects")}
                                className="h-[38px] appearance-none rounded-control border border-line bg-surface pl-3 pr-8 text-label font-semibold text-ink-2 focus:border-brand focus:outline-hidden"
                            >
                                {projectOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <svg
                                className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
                            </svg>
                        </div>

                        <div className="flex h-[38px] items-center rounded-control border border-line bg-surface">
                            <button
                                type="button"
                                onClick={() => {
                                    const next = new Date(currentDate);
                                    next.setMonth(next.getMonth() - 1);
                                    setCurrentDate(next);
                                }}
                                className="flex h-full items-center rounded-l-control px-2 text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
                                title={t("common.previous")}
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <span className="min-w-[124px] px-1 text-center text-label font-semibold text-ink-2">
                                {monthLabel} {currentDate.getFullYear()}
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    const next = new Date(currentDate);
                                    next.setMonth(next.getMonth() + 1);
                                    setCurrentDate(next);
                                }}
                                className="flex h-full items-center rounded-r-control px-2 text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
                                title={t("common.next")}
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        <div id="analytics-export-dropdown">
                            <ExportDropdown
                                startDate={dateRangeForExport.startDate}
                                endDate={dateRangeForExport.endDate}
                                onExportBase={handleExport}
                            />
                        </div>
                    </div>
                </header>

                {/* Chart Content Area with Loading State */}
                <div className="relative">
                    <AnimatePresence>
                        {isFiltering && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-50 flex items-center justify-center rounded-card bg-surface/70 backdrop-blur-sm"
                            >
                                <div className="flex flex-col items-center gap-3">
                                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand border-t-transparent"></div>
                                    <span className="text-label font-bold text-brand">
                                        {t("common.loading")}
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className={`space-y-5 transition-all duration-300 ${isFiltering ? "blur-[2px] opacity-60 scale-[0.99]" : ""}`}>
                        {/* Stats Grid */}
                        <StatsGrid
                            stats={statsForGrid}
                            t={t}
                            compareMonth={previousMonthLabel}
                        />

                        {/* Charts Row 1 */}
                        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
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
                        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
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
                                    compareMonth={previousMonthLabel}
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
            </div>
        </main>
    );
};

export default Analytics;
