import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../../../contexts/AuthContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { paymentsApi } from "../../payments/api";
import { contractsApi } from "../../contracts/api";
import { projectsApi } from "../../projects/api";
import RecentActivity from "../components/RecentActivity";
import SellerDashboard from "./SellerDashboard";
import { Button, Card, Chip, ErrorState, Skeleton } from "@/shared/ui";

const DAY = 24 * 60 * 60 * 1000;

const formatMoney = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  if (Math.abs(amount) >= 1_000_000) {
    return `L ${(amount / 1_000_000).toFixed(2)}M`;
  }
  return `L ${amount.toLocaleString("es-HN", {
    maximumFractionDigits: 0,
  })}`;
};

const formatDate = (value, locale) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(locale === "en" ? "en-US" : "es-HN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const startOfDay = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

const firstFinite = (...values) => {
  for (const value of values) {
    const amount = Number(value);
    if (value !== null && value !== undefined && Number.isFinite(amount)) {
      return amount;
    }
  }
  return null;
};

const ATTENTION_TONES = {
  danger: {
    icon: "text-danger",
    action: "text-danger",
    mobileValue: "text-danger",
  },
  warning: {
    icon: "text-warning",
    action: "text-warning",
    mobileValue: "text-warning",
  },
  info: {
    icon: "text-info",
    action: "text-info",
    mobileValue: "text-info",
  },
  violet: {
    icon: "text-violet",
    action: "text-violet",
    mobileValue: "text-violet",
  },
};

const ICONS = {
  overdue: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6" />
      <path d="M12 16.5h.01" />
    </>
  ),
  payments: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  contracts: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h4" />
    </>
  ),
  reservation: (
    <>
      <path d="M12 21s7-5.3 7-11a7 7 0 1 0-14 0c0 5.7 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
};

function AttentionIcon({ name }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-5 w-5"
    >
      {ICONS[name]}
    </svg>
  );
}

function AttentionCard({
  icon,
  label,
  value,
  caption,
  action,
  to,
  tone = "danger",
  index = 0,
}) {
  const colors = ATTENTION_TONES[tone] || ATTENTION_TONES.danger;

  return (
    <Link
      to={to}
      className="motion-fade-up group flex min-h-[92px] flex-col gap-1 rounded-card border border-line bg-surface p-3 transition-colors hover:border-line-strong sm:min-h-[154px] sm:p-4"
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <span className={`hidden sm:block ${colors.icon}`} aria-hidden="true">
        <AttentionIcon name={icon} />
      </span>
      <span className="text-micro font-semibold text-ink-2 sm:text-body">
        {label}
      </span>
      <span
        className={`text-section font-bold leading-none tabular-nums sm:text-display ${colors.mobileValue} sm:text-ink`}
      >
        {value}
      </span>
      <span className="hidden min-h-4 text-label font-medium text-ink-3 sm:block">
        {caption}
      </span>
      <span
        className={`mt-auto hidden text-label font-bold sm:inline ${colors.action}`}
      >
        {action} <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}

function paymentStatus(payment, t) {
  const due = startOfDay(payment.due_date);
  const today = startOfDay(new Date());
  const status = String(payment.status || "").toLowerCase();

  if (status === "overdue" || (due && today && due < today)) {
    return { tone: "danger", label: t("dashboard.statusOverdue") };
  }
  if (due && today && due.getTime() === today.getTime()) {
    return { tone: "warning", label: t("dashboard.statusDueToday") };
  }
  if (due && today && due - today <= 3 * DAY) {
    const days = Math.round((due - today) / DAY);
    return {
      tone: "info",
      label: t("dashboard.statusInDays", { count: days }),
    };
  }
  return { tone: "neutral", label: t("dashboard.statusPending") };
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { t, locale } = useLocale();
  const [paymentsStats, setPaymentsStats] = useState(null);
  const [contractsStats, setContractsStats] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [weekTotal, setWeekTotal] = useState(null);
  const [occupancy, setOccupancy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [paymentsResult, contractsResult, recentPaymentsResult, projectsResult] =
      await Promise.allSettled([
        paymentsApi.getStats(),
        contractsApi.getStats(),
        paymentsApi.list({ page: 1, per_page: 4, sort: "due_date-asc" }),
        projectsApi.list({ page: 1, per_page: 100 }),
      ]);

    if (paymentsResult.status === "fulfilled") {
      setPaymentsStats(paymentsResult.value);
    }
    if (contractsResult.status === "fulfilled") {
      setContractsStats(contractsResult.value);
    }
    if (recentPaymentsResult.status === "fulfilled") {
      const data = recentPaymentsResult.value || {};
      setRecentPayments(data.payments || data.data || []);
      const pagination = data.pagination || {};
      const total = Number(pagination.count ?? pagination.total);
      setWeekTotal(Number.isFinite(total) ? total : null);
    }
    if (projectsResult.status === "fulfilled") {
      const projects =
        projectsResult.value.projects || projectsResult.value.data || [];
      const total = projects.reduce(
        (sum, project) => sum + (Number(project.lot_count) || 0),
        0
      );
      const occupied = projects.reduce(
        (sum, project) =>
          sum +
          (Number(project.sold_lots) || 0) +
          (Number(project.financed_lots) || 0),
        0
      );
      setOccupancy(total > 0 ? Math.round((occupied / total) * 1000) / 10 : null);
    }

    if (
      paymentsResult.status === "rejected" &&
      contractsResult.status === "rejected"
    ) {
      setError(true);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const overdue = firstFinite(
    paymentsStats?.total_overdue,
    paymentsStats?.overdue_amount
  );
  const overdueCount = firstFinite(
    paymentsStats?.overdue_count,
    paymentsStats?.overdue_installments
  );
  const overdueClients = firstFinite(paymentsStats?.overdue_clients);
  const pendingPayments = firstFinite(paymentsStats?.pending_count);
  const pendingAmount = firstFinite(
    paymentsStats?.pending_amount,
    paymentsStats?.submitted_amount,
    paymentsStats?.pending_total
  );
  const pendingContracts = firstFinite(contractsStats?.pending);
  const reservationsWithoutContract = firstFinite(
    contractsStats?.reservations_without_contract
  );
  const collected = firstFinite(paymentsStats?.collected_this_month);
  const pendingThisMonth = firstFinite(
    paymentsStats?.pending_this_month,
    paymentsStats?.month_pending
  );

  const overdueCaption =
    overdueCount !== null && overdueClients !== null
      ? t("dashboard.cardOverdueCaption", {
          installments: overdueCount,
          clients: overdueClients,
        })
      : t("dashboard.cardOverdueFallback");

  const pendingPaymentsCaption =
    pendingAmount !== null && pendingAmount > 0
      ? t("dashboard.cardPendingPaymentsCaption", {
          amount: formatMoney(pendingAmount),
        })
      : t("dashboard.cardPendingPaymentsFallback");

  const cards = useMemo(
    () => [
      {
        key: "overdue",
        icon: "overdue",
        label: t("dashboard.cardOverdue"),
        value: overdue === null ? "—" : formatMoney(overdue),
        caption: overdueCaption,
        action: t("dashboard.reviewCollections"),
        to: "/payments?status=overdue",
        tone: "danger",
      },
      {
        key: "pending-payments",
        icon: "payments",
        label: t("dashboard.cardPendingPayments"),
        value: pendingPayments === null ? "—" : pendingPayments,
        caption: pendingPaymentsCaption,
        action: t("dashboard.reviewPayments"),
        to: "/payments?status=submitted",
        tone: "warning",
      },
      {
        key: "pending-contracts",
        icon: "contracts",
        label: t("dashboard.cardPendingContracts"),
        value: pendingContracts === null ? "—" : pendingContracts,
        caption: t("dashboard.cardPendingContractsCaption"),
        action: t("dashboard.reviewContracts"),
        to: "/contracts",
        tone: "info",
      },
      {
        key: "reservations",
        icon: "reservation",
        label: t("dashboard.cardReservations"),
        value:
          reservationsWithoutContract === null
            ? "—"
            : reservationsWithoutContract,
        caption: t("dashboard.cardReservationsCaption"),
        action: t("dashboard.completeReservation"),
        to: "/projects",
        tone: "violet",
      },
    ],
    [
      overdue,
      overdueCaption,
      pendingPayments,
      pendingPaymentsCaption,
      pendingContracts,
      reservationsWithoutContract,
      t,
    ]
  );

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
    const label = t(key, { name: firstName });
    return firstName ? label : label.replace(/,\s*$/, "");
  }, [t, user?.full_name, user?.email]);

  const todayLabel = useMemo(() => {
    const label = new Date().toLocaleDateString(
      locale === "en" ? "en-US" : "es-HN",
      { weekday: "long", day: "numeric", month: "long", year: "numeric" }
    );
    return label.charAt(0).toUpperCase() + label.slice(1);
  }, [locale]);

  return (
    <main className="min-h-screen w-full bg-canvas px-6 pb-6 page-shell xl:px-[48px] xl:pb-[48px]">
      <div className="mx-auto w-full max-w-[1600px] space-y-5">
        <header className="motion-fade-up flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-page font-bold tracking-tight text-ink">
              {greeting}
            </h1>
            <p className="mt-1 text-body text-ink-3">{todayLabel}</p>
          </div>
          <Button onClick={() => navigate("/payments")}>
            {t("contracts.registerPayment")}
          </Button>
        </header>

        {error && (
          <ErrorState
            title={t("dashboard.loadErrorTitle")}
            description={t("dashboard.loadErrorDescription")}
            onRetry={load}
          />
        )}

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-title font-bold text-ink">
              {t("dashboard.attentionTitle")}
            </h2>
            <Link
              to="/payments"
              className="inline-flex items-center gap-1 text-label font-semibold text-brand hover:underline"
            >
              {t("dashboard.seeAll")} <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 xl:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-card border border-line bg-surface p-4"
                  >
                    <Skeleton rows={3} />
                  </div>
                ))
              : cards.map(({ key, ...card }, index) => (
                  <AttentionCard key={key} index={index} {...card} />
                ))}
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card
              title={t("dashboard.weekCollections")}
              className="motion-fade-up [animation-delay:220ms]"
              action={
                <Link
                  to="/payments"
                  className="text-label font-bold text-brand hover:underline"
                >
                  {t("dashboard.viewPayments")}
                </Link>
              }
              bodyClassName="px-5 pb-1 pt-2"
            >
              {loading ? (
                <Skeleton rows={4} />
              ) : recentPayments.length === 0 ? (
                <p className="py-6 text-body text-ink-3">
                  {t("dashboard.noWeekCollections")}
                </p>
              ) : (
                <>
                  <table className="hidden w-full border-collapse md:table">
                    <caption className="sr-only">
                      {t("dashboard.weekCollections")}
                    </caption>
                    <thead>
                      <tr className="border-b border-line text-left">
                        <th
                          scope="col"
                          className="py-2 text-micro font-bold uppercase tracking-wide text-ink-3"
                        >
                          {t("dashboard.tableClient")}
                        </th>
                        <th
                          scope="col"
                          className="w-[110px] py-2 text-micro font-bold uppercase tracking-wide text-ink-3"
                        >
                          {t("dashboard.tableDue")}
                        </th>
                        <th
                          scope="col"
                          className="w-[110px] py-2 text-micro font-bold uppercase tracking-wide text-ink-3"
                        >
                          {t("dashboard.tableAmount")}
                        </th>
                        <th
                          scope="col"
                          className="w-[104px] py-2 text-micro font-bold uppercase tracking-wide text-ink-3"
                        >
                          {t("dashboard.tableStatus")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPayments.map((payment, index) => {
                        const status = paymentStatus(payment, t);
                        const name =
                          payment.applicant_name ||
                          payment.contract?.applicant_user?.full_name ||
                          "—";
                        const lot = payment.lot_name || payment.contract?.lot?.name;
                        return (
                          <tr
                            key={payment.id}
                            onClick={() => navigate("/payments")}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                navigate("/payments");
                              }
                            }}
                            tabIndex={0}
                            style={
                              index < 5
                                ? { animationDelay: `${index * 30}ms` }
                                : undefined
                            }
                            className={`cursor-pointer border-b border-line/60 transition-colors last:border-0 hover:bg-surface-2 focus-visible:bg-surface-2 ${
                              index < 5 ? "motion-fade-in" : ""
                            }`}
                          >
                            <td className="py-3 text-body font-semibold text-ink">
                              <span className="truncate">
                                {name}
                                {lot ? ` · ${lot}` : ""}
                              </span>
                            </td>
                            <td
                              className={`py-3 text-label font-semibold ${
                                status.tone === "danger"
                                  ? "text-danger"
                                  : status.tone === "warning"
                                    ? "text-warning"
                                    : "text-ink-2"
                              }`}
                            >
                              {formatDate(payment.due_date, locale)}
                            </td>
                            <td className="py-3 text-body font-semibold tabular-nums text-ink">
                              {formatMoney(
                                payment.total_amount ?? payment.amount
                              )}
                            </td>
                            <td className="py-3">
                              <Chip tone={status.tone}>{status.label}</Chip>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  <div className="flex flex-col gap-2 py-2 md:hidden">
                    {recentPayments.map((payment, index) => {
                      const status = paymentStatus(payment, t);
                      const name =
                        payment.applicant_name ||
                        payment.contract?.applicant_user?.full_name ||
                        "—";
                      const lot = payment.lot_name || payment.contract?.lot?.name;
                      return (
                        <Link
                          key={payment.id}
                          to="/payments"
                          style={
                            index < 5
                              ? { animationDelay: `${index * 30}ms` }
                              : undefined
                          }
                          className={`rounded-card border border-line bg-surface p-3 ${
                            index < 5 ? "motion-fade-in" : ""
                          }`}
                        >
                          <p className="text-label font-semibold text-ink">
                            {name}
                            {lot ? ` · ${lot}` : ""}
                          </p>
                          <div className="mt-1 flex items-center justify-between gap-2">
                            <p className="text-micro text-ink-2">
                              {formatDate(payment.due_date, locale)} ·{" "}
                              {formatMoney(
                                payment.total_amount ?? payment.amount
                              )}
                            </p>
                            <Chip tone={status.tone}>{status.label}</Chip>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}

              {!loading && recentPayments.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line py-2.5">
                  <p className="text-label text-ink-3">
                    {weekTotal && weekTotal > recentPayments.length
                      ? t("dashboard.collectionsShown", {
                          shown: recentPayments.length,
                          total: weekTotal,
                        })
                      : ""}
                  </p>
                  <Link
                    to="/payments"
                    className="text-label font-semibold text-brand hover:underline"
                  >
                    {t("dashboard.openPaymentsInbox")}{" "}
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              )}
            </Card>
          </div>

          <div className="motion-fade-up flex flex-col gap-3.5 [animation-delay:240ms]">
            <Card title={t("dashboard.monthSummary")} bodyClassName="p-5 pt-3">
              <dl className="space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-body text-ink-2">
                    {t("dashboard.collected")}
                  </dt>
                  <dd className="text-body font-bold tabular-nums text-ink">
                    {formatMoney(collected)}
                  </dd>
                </div>
                {pendingThisMonth !== null && (
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-body text-ink-2">
                      {t("dashboard.pendingThisMonth")}
                    </dt>
                    <dd className="text-body font-bold tabular-nums text-ink">
                      {formatMoney(pendingThisMonth)}
                    </dd>
                  </div>
                )}
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-body font-semibold text-danger">
                    {t("dashboard.overdueLabel")}
                  </dt>
                  <dd className="text-body font-bold tabular-nums text-danger">
                    {formatMoney(overdue)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 pt-1">
                  <dt className="text-body text-ink-2">
                    {t("dashboard.occupancy")}
                  </dt>
                  <dd className="text-body font-bold tabular-nums text-ink">
                    {occupancy == null ? "—" : `${occupancy}%`}
                  </dd>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${Math.min(occupancy || 0, 100)}%` }}
                  />
                </div>
              </dl>
            </Card>
            <RecentActivity />
          </div>
        </div>
      </div>
    </main>
  );
};

function Home() {
  const { user } = useContext(AuthContext);

  return user?.role === "seller" ? (
    <main className="min-h-screen w-full bg-canvas px-6 pb-6 page-shell xl:px-[48px] xl:pb-[48px]">
      <div className="mx-auto w-full max-w-[1600px]">
        <SellerDashboard user={user} />
      </div>
    </main>
  ) : (
    <AdminDashboard />
  );
}

export default Home;
