import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Filler,
} from "chart.js";
import { useLocale } from "../../../contexts/LocaleContext";
import {
  formatCurrency,
  formatLargeNumber,
} from "../../../shared/utils/formatters";
import { formatStatus } from "../../../shared/utils/formatStatus";
import { Button, Chip, ErrorState, Skeleton } from "@/shared/ui";
import { dashboardApi } from "../api";
import CommissionsModal from "./CommissionsModal";

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

const SALES_COLOR = "#15803D";
const SALES_AREA = "rgba(21, 128, 61, 0.08)";

const VALUE_TONES = {
  ink: "text-ink",
  brand: "text-brand-strong",
};

const STATUS_TONES = {
  approved: "success",
  signed: "success",
  closed: "success",
  paid: "success",
  pending: "info",
  submitted: "info",
  in_review: "info",
  under_review: "info",
  in_process: "info",
  rejected: "danger",
  cancelled: "danger",
  overdue: "danger",
};

const statusTone = (status) =>
  STATUS_TONES[String(status || "").toLowerCase()] || "neutral";

const formatActivityDate = (value, locale) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(locale === "en" ? "en-US" : "es-HN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatActivityAmount = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "number") return formatCurrency(value);
  return String(value);
};

const customerName = (customer, fallback) => {
  const name = String(customer?.name || "").trim();
  if (!name || name.toLowerCase() === "n/a") return fallback;
  return name;
};

const customerProject = (customer, fallback) => {
  const project = String(customer?.project || "").trim();
  if (!project || project.toLowerCase() === "n/a") return fallback;
  return project;
};

function KpiCard({ label, value, caption, tone = "ink", index = 0 }) {
  return (
    <div
      className="motion-fade-up rounded-card border border-line bg-surface p-3.5 sm:p-4"
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
        {label}
      </p>
      <p
        className={`mt-1.5 text-[22px] font-bold leading-tight tabular-nums ${VALUE_TONES[tone]}`}
      >
        {value}
      </p>
      {caption && (
        <p className="mt-1 text-micro font-medium text-ink-3">{caption}</p>
      )}
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="rounded-card border border-line bg-surface p-3.5 sm:p-4">
      <Skeleton rows={3} />
    </div>
  );
}

function EmptyBlock({ title, description, className = "" }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-1 py-8 text-center ${className}`}
    >
      <p className="text-body-lg font-bold text-ink">{title}</p>
      {description && (
        <p className="max-w-sm text-body text-ink-3">{description}</p>
      )}
    </div>
  );
}

const SellerDashboard = ({ user }) => {
  const { t, locale } = useLocale();
  const navigate = useNavigate();
  const [showCommissionsModal, setShowCommissionsModal] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const now = new Date();
      const data = await dashboardApi.getSellerStats(
        now.getMonth() + 1,
        now.getFullYear()
      );
      setDashboardData(data ?? {});
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const key =
      hour < 12
        ? "dashboard.goodMorning"
        : hour < 19
          ? "dashboard.goodAfternoon"
          : "dashboard.goodEvening";
    const firstName =
      user?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "";
    if (!firstName) {
      return t(key, { name: "" }).replace(/,\s*$/, "");
    }
    return t(key, { name: firstName });
  }, [t, user?.full_name, user?.email]);

  const todayLabel = useMemo(() => {
    const label = new Date().toLocaleDateString(
      locale === "en" ? "en-US" : "es-HN",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
    return label.charAt(0).toUpperCase() + label.slice(1);
  }, [locale]);

  const chart = dashboardData?.chart_data;
  const chartValues = useMemo(
    () => (Array.isArray(chart?.data) ? chart.data : []),
    [chart?.data]
  );
  const chartLabels = useMemo(
    () => (Array.isArray(chart?.labels) ? chart.labels : []),
    [chart?.labels]
  );
  const hasChartData = chartLabels.length > 0 && chartValues.length > 0;

  const currentMonthSales = useMemo(() => {
    if (chartValues.length === 0) return null;
    const value = Number(chartValues[chartValues.length - 1]);
    return Number.isFinite(value) ? value : null;
  }, [chartValues]);

  const conversionRate = useMemo(() => {
    const value = Number(dashboardData?.conversion_rate);
    if (!Number.isFinite(value)) return 0;
    return Math.min(100, Math.max(0, value));
  }, [dashboardData?.conversion_rate]);

  const kpis = useMemo(() => {
    const sixMonthTotal = formatCurrency(dashboardData?.total_sales_value);
    return [
      {
        key: "month-sales",
        label: t("sellerDashboard.monthSales"),
        value:
          currentMonthSales === null ? "—" : formatCurrency(currentMonthSales),
        caption: t("sellerDashboard.stats.sixMonthTotal", {
          amount: sixMonthTotal,
        }),
        tone: "ink",
      },
      {
        key: "commission",
        label: t("sellerDashboard.pendingCommission"),
        value: formatCurrency(dashboardData?.pending_commission),
        caption: t("sellerDashboard.stats.commissionCaption"),
        tone: "brand",
      },
      {
        key: "leads",
        label: t("sellerDashboard.activeLeads"),
        value: dashboardData?.active_leads ?? "—",
        caption: t("sellerDashboard.stats.leadsCaption"),
        tone: "ink",
      },
    ];
  }, [currentMonthSales, dashboardData, t]);

  const chartDataForGraph = useMemo(
    () => ({
      labels: chartLabels,
      datasets: [
        {
          label: t("sellerDashboard.stats.sales"),
          data: chartValues,
          borderColor: SALES_COLOR,
          backgroundColor: SALES_AREA,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
        },
      ],
    }),
    [chartLabels, chartValues, t]
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          padding: 12,
          cornerRadius: 10,
          callbacks: {
            label(context) {
              const label = context.dataset.label || "";
              const value =
                context.parsed.y === null
                  ? ""
                  : formatCurrency(context.parsed.y);
              return label ? `${label}: ${value}` : value;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "currentColor", opacity: 0.7 },
        },
        y: {
          grid: { color: "rgba(148, 163, 184, 0.14)" },
          ticks: {
            color: "currentColor",
            opacity: 0.7,
            callback(value) {
              return formatLargeNumber(
                value,
                locale === "en" ? "en-US" : "es-HN"
              );
            },
          },
        },
      },
    }),
    [locale]
  );

  const customers = Array.isArray(dashboardData?.recent_customers)
    ? dashboardData.recent_customers
    : [];

  return (
    <div className="space-y-5">
      <header className="motion-fade-up flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-page font-bold tracking-tight text-ink">
            {greeting}
          </h1>
          <p className="mt-1 text-body text-ink-3">{todayLabel}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => navigate("/projects")}>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            {t("sellerDashboard.newReservation")}
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate("/vendedor/cobros")}
          >
            {t("sellerDashboard.collectionsShortcut")}
          </Button>
        </div>
      </header>

      {loading && (
        <span role="status" className="sr-only">
          {t("common.loading")}
        </span>
      )}

      {error ? (
        <ErrorState
          title={t("sellerDashboard.loadErrorTitle")}
          description={t("sellerDashboard.loadErrorDescription")}
          onRetry={load}
        />
      ) : (
        <>
          <section aria-labelledby="seller-kpis-title">
            <h2 id="seller-kpis-title" className="sr-only">
              {t("sellerDashboard.summaryTitle")}
            </h2>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
              {loading
                ? Array.from({ length: 3 }).map((_, index) => (
                    <KpiSkeleton key={index} />
                  ))
                : kpis.map((kpi, index) => (
                    <KpiCard key={kpi.key} index={index} {...kpi} />
                  ))}
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-3">
            <section
              aria-labelledby="seller-activity-title"
              className="motion-fade-up flex flex-col rounded-card border border-line bg-surface p-5 [animation-delay:180ms] lg:col-span-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2
                    id="seller-activity-title"
                    className="text-title font-bold text-ink"
                  >
                    {t("sellerDashboard.activityTitle")}
                  </h2>
                  <p className="mt-0.5 text-label text-ink-3">
                    {t("sellerDashboard.activitySubtitle")}
                  </p>
                </div>
                <Link
                  to="/vendedor/clientes"
                  className="shrink-0 text-label font-semibold text-brand hover:underline"
                >
                  {t("sellerDashboard.viewAllCustomers")}
                </Link>
              </div>

              <div className="mt-4 flex-1">
                {loading ? (
                  <Skeleton rows={5} />
                ) : customers.length === 0 ? (
                  <EmptyBlock
                    title={t("sellerDashboard.noActivityTitle")}
                    description={t("sellerDashboard.noActivityDescription")}
                  />
                ) : (
                  <ul className="divide-y divide-line">
                    {customers.slice(0, 3).map((customer, index) => {
                      const name = customerName(
                        customer,
                        t("common.notAvailable")
                      );
                      const project = customerProject(
                        customer,
                        t("common.notAvailable")
                      );
                      return (
                        <li
                          key={`${name}-${customer?.date || "no-date"}-${index}`}
                          className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                        >
                          <span
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-info-soft text-label font-bold text-info"
                            aria-hidden="true"
                          >
                            {name.charAt(0).toUpperCase()}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-label font-semibold text-ink">
                              {name}
                            </p>
                            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                              <p className="truncate text-micro text-ink-3">
                                {project}
                              </p>
                              {customer?.status && (
                                <Chip
                                  tone={statusTone(customer.status)}
                                  className="h-5 px-1.5"
                                >
                                  {formatStatus(customer.status, t)}
                                </Chip>
                              )}
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-label font-semibold tabular-nums text-ink">
                              {formatActivityAmount(customer?.amount)}
                            </p>
                            <p className="mt-0.5 text-micro text-ink-3">
                              {formatActivityDate(customer?.date, locale)}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </section>

            <section
              aria-labelledby="seller-commission-title"
              className="motion-fade-up flex flex-col rounded-card border border-line bg-surface p-5 [animation-delay:225ms]"
            >
              <h2
                id="seller-commission-title"
                className="text-title font-bold text-ink"
              >
                {t("sellerDashboard.commissionDetailTitle")}
              </h2>

              {loading ? (
                <div className="mt-4">
                  <Skeleton rows={4} />
                </div>
              ) : (
                <>
                  <p className="mt-3 text-page font-bold tabular-nums text-brand-strong">
                    {formatCurrency(dashboardData?.pending_commission)}
                  </p>
                  <p className="mt-1 text-micro font-medium text-ink-3">
                    {t("sellerDashboard.stats.commissionCaption")}
                  </p>

                  <div className="mt-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-micro font-semibold text-ink-2">
                        {t("sellerDashboard.conversionLabel")}
                      </span>
                      <span className="text-micro font-bold tabular-nums text-ink">
                        {conversionRate.toFixed(1)}%
                      </span>
                    </div>
                    <div
                      role="progressbar"
                      aria-label={t("sellerDashboard.conversionLabel")}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(conversionRate)}
                      className="mt-1.5 h-2 overflow-hidden rounded-full bg-line"
                    >
                      <div
                        className="h-full rounded-full bg-brand"
                        style={{ width: `${conversionRate}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-micro text-ink-3">
                      {t("sellerDashboard.stats.conversionCaption")}
                    </p>
                  </div>
                </>
              )}

              <div className="mt-auto border-t border-line pt-3">
                <button
                  type="button"
                  onClick={() => setShowCommissionsModal(true)}
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-control text-label font-semibold text-brand transition-colors hover:bg-surface-2"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  {t("sellerDashboard.viewCommissions")}
                </button>
              </div>
            </section>
          </div>

          <section
            aria-labelledby="seller-chart-title"
            className="motion-fade-up rounded-card border border-line bg-surface p-5 [animation-delay:225ms]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2
                  id="seller-chart-title"
                  className="text-title font-bold text-ink"
                >
                  {t("sellerDashboard.performanceTrend")}
                </h2>
                <p className="mt-0.5 text-label text-ink-3">
                  {t("sellerDashboard.stats.last6Months")}
                </p>
              </div>
              {hasChartData && (
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full bg-brand"
                    aria-hidden="true"
                  />
                  <span className="text-micro font-medium text-ink-3">
                    {t("sellerDashboard.stats.sales")}
                  </span>
                </div>
              )}
            </div>

            {loading ? (
              <div className="mt-4">
                <Skeleton rows={6} />
              </div>
            ) : hasChartData ? (
              <div className="mt-4 h-[260px] text-ink-2 sm:h-[300px]">
                <Line
                  data={chartDataForGraph}
                  options={chartOptions}
                  role="img"
                  aria-label={t("sellerDashboard.chartLabel")}
                />
              </div>
            ) : (
              <EmptyBlock
                className="mt-4"
                title={t("sellerDashboard.chartEmptyTitle")}
                description={t("sellerDashboard.chartEmptyDescription")}
              />
            )}
          </section>
        </>
      )}

      <CommissionsModal
        isActive={showCommissionsModal}
        handleClose={() => setShowCommissionsModal(false)}
        initialDate={new Date()}
      />
    </div>
  );
};

export default SellerDashboard;
