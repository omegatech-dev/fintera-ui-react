import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthContext from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useToast } from "@/contexts/ToastContext";
import { commissionsApi } from "../api";
import CommissionCreditsCard from "../components/CommissionCreditsCard";
import CommissionRulesSheet from "../components/CommissionRulesSheet";
import HistoricalValidationTab from "../components/HistoricalValidationTab";
import { readCommissionCredits } from "../utils/credits";
import ScoreBadge from "@/features/seller/components/ScoreBadge";
import { sellerApi } from "@/features/seller/api";
import { readSellerScore } from "@/features/seller/utils/scoreMetrics";
import { confirmDialog } from "@/shared/ui/ConfirmProvider";
import {
  Button,
  Card,
  Chip,
  Dialog,
  EmptyState,
  ErrorState,
  ExportFormatButtons,
  Pagination,
  Select,
  Skeleton,
  Table,
  Tabs,
} from "@/shared/ui";
import { buildExportFilename } from "@/shared/export/formats";

const PAGE_SIZE = 20;

const EMPTY_TOTALS = {
  commission: 0,
  amount: 0,
  paid: 0,
  pending: 0,
  paid_count: 0,
  average_rate: 0,
  net_pending: 0,
};

const EMPTY_PAGINATION = { page: 1, per_page: PAGE_SIZE, total: 0, total_pages: 0 };

const money = (value) =>
  `L ${Number(value || 0).toLocaleString("es-HN", { maximumFractionDigits: 0 })}`;

const rateFor = (row) => {
  const stored =
    row?.commission_rate ?? row?.rate ?? row?.commission_percentage;
  if (stored !== undefined && stored !== null && stored !== "") {
    return Number(stored);
  }
  const amount = Number(row?.amount || 0);
  if (!amount) return null;
  return (Number(row?.commission || 0) / amount) * 100;
};

const formatRate = (rate) =>
  rate === null || rate === undefined || Number.isNaN(Number(rate))
    ? "—"
    : `${Number(rate).toFixed(1)}%`;

const hasCreditAdjustment = (row) =>
  Number(row?.credit_applied || 0) > 0 && Boolean(row?.commission_paid_at);

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("es-HN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const monthStart = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
};

const monthEnd = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10);
};

const KPI_TONES = {
  default: "border-line bg-surface",
  warning: "border-warning-soft bg-warning-soft/50",
  success: "border-line bg-surface",
};

const KPI_VALUE_TONES = {
  default: "text-ink",
  warning: "text-warning",
  success: "text-brand-strong",
};

function StatCard({ label, value, caption, tone = "default", loading, index = 0 }) {
  return (
    <div
      className={`motion-fade-up rounded-card border p-5 ${KPI_TONES[tone]}`}
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
        {label}
      </p>
      <p
        className={`mt-2 text-page font-bold tabular-nums ${KPI_VALUE_TONES[tone]}`}
      >
        {loading ? "—" : value}
      </p>
      {caption && <p className="mt-1 text-micro text-ink-3">{caption}</p>}
    </div>
  );
}

function Commissions() {
  const { user } = useContext(AuthContext);
  const { t } = useLocale();
  const { showToast } = useToast();
  const isAdmin = user?.role === "admin";
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab =
    searchParams.get("tab") === "historical" ? "historical" : "commissions";
  const [pendingHistorical, setPendingHistorical] = useState(0);
  const [paying, setPaying] = useState(null);
  const [previewing, setPreviewing] = useState(null);
  const [startDate, setStartDate] = useState(monthStart);
  const [endDate, setEndDate] = useState(monthEnd);
  const [items, setItems] = useState([]);
  const [totals, setTotals] = useState(EMPTY_TOTALS);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [page, setPage] = useState(1);
  const [sellers, setSellers] = useState([]);
  const [credits, setCredits] = useState([]);
  const [sellerBalance, setSellerBalance] = useState(0);
  const [creditsPagination, setCreditsPagination] = useState(EMPTY_PAGINATION);
  const [creditsPage, setCreditsPage] = useState(1);
  const [sellerId, setSellerId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportingFormat, setExportingFormat] = useState(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [payoutResult, setPayoutResult] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await commissionsApi.list(startDate, endDate, {
        page,
        perPage: PAGE_SIZE,
        sellerId,
        creditsPage,
        creditsPerPage: PAGE_SIZE,
      });
      setItems(data?.commissions || []);
      setTotals(data?.totals || EMPTY_TOTALS);
      setPagination(data?.pagination || EMPTY_PAGINATION);
      setSellers(data?.sellers || []);
      setCredits(readCommissionCredits(data));
      setCreditsPagination(data?.credits_pagination || EMPTY_PAGINATION);
      setSellerBalance(Number(data?.seller_balance ?? data?.pending_credits ?? 0));
    } catch {
      setError(t("commissions.loadError"));
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, sellerId, page, creditsPage, t]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!isAdmin) return undefined;
    let active = true;
    sellerApi
      .listHistoricalSales({ status: "pending", page: 1, per_page: 1 })
      .then((data) => {
        if (active) {
          setPendingHistorical(Number(data?.pagination?.total ?? 0));
        }
      })
      .catch(() => {
        if (active) setPendingHistorical(0);
      });
    return () => {
      active = false;
    };
  }, [activeTab, isAdmin]);

  const handleTabChange = (next) => {
    const params = new URLSearchParams(searchParams);
    if (next === "historical") params.set("tab", "historical");
    else params.delete("tab");
    setSearchParams(params, { replace: true });
  };

  // A seller filter only makes sense while that seller has commissions in the
  // period. When the period changes and the seller disappears from the server
  // list, clear the filter so the page does not show an empty list while the
  // selector claims every seller is selected.
  useEffect(() => {
    if (!sellerId) return;
    if (sellers.some((entry) => String(entry.id) === sellerId)) return;
    setSellerId("");
    setPage(1);
    setCreditsPage(1);
  }, [sellerId, sellers]);

  const resetPages = () => {
    setPage(1);
    setCreditsPage(1);
  };

  const handleStartDateChange = (value) => {
    setStartDate(value);
    resetPages();
  };

  const handleEndDateChange = (value) => {
    setEndDate(value);
    resetPages();
  };

  const handleSellerChange = (value) => {
    setSellerId(value);
    resetPages();
  };

  const selectedSellerName = sellers.find(
    (entry) => String(entry.id) === sellerId
  )?.name;

  const handlePay = useCallback(
    async (row) => {
      if (!row?.contract_guid) return;

      let preview;
      setPreviewing(row.contract_guid);
      try {
        preview = await commissionsApi.previewPayout(row.contract_guid);
      } catch (err) {
        showToast(
          err?.message || t("commissions.payoutPreviewError"),
          "error"
        );
        return;
      } finally {
        setPreviewing(null);
      }

      if (typeof preview?.enabled !== "boolean") {
        showToast(t("commissions.payoutPreviewError"), "error");
        return;
      }

      const description = preview.enabled ? (
        <div className="space-y-2">
          <p>
            {t("commissions.payoutPreviewDescription", {
              seller:
                row.seller && row.seller !== "Unknown"
                  ? row.seller
                  : t("commissions.unassigned"),
            })}
          </p>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-control bg-surface-2 p-3 text-body">
            <dt className="text-ink-3">{t("commissions.payoutGross")}</dt>
            <dd className="text-right font-semibold">
              {money(preview.commission)}
            </dd>
            <dt className="text-ink-3">{t("commissions.payoutCredit")}</dt>
            <dd className="text-right font-semibold">
              {money(preview.applicable)}
            </dd>
            <dt className="text-ink-3">{t("commissions.payoutCash")}</dt>
            <dd className="text-right font-semibold">
              {money(preview.net_cash)}
            </dd>
            <dt className="text-ink-3">
              {t("commissions.payoutRemainingCredit")}
            </dt>
            <dd className="text-right font-semibold">
              {money(preview.remaining_credit)}
            </dd>
          </dl>
        </div>
      ) : (
        t("commissions.payoutDescription", {
          amount: money(preview.commission ?? row.commission),
          seller:
            row.seller && row.seller !== "Unknown"
              ? row.seller
              : t("commissions.unassigned"),
        })
      );

      const confirmed = await confirmDialog({
        title: t("commissions.payoutTitle"),
        description,
        confirmLabel: t("commissions.payoutConfirm"),
      });
      if (!confirmed) return;

      setPaying(row.contract_guid);
      try {
        const result = await commissionsApi.markPaid(row.contract_guid);
        if (result?.payout) setPayoutResult(result.payout);
        showToast(t("commissions.payoutSuccess"));
        await load();
      } catch (err) {
        showToast(err?.message || t("commissions.payoutError"), "error");
      } finally {
        setPaying(null);
      }
    },
    [load, showToast, t]
  );

  const averageRate = Number(totals.average_rate || 0).toFixed(1);

  const handleExport = async (format = "csv") => {
    setExportingFormat(format);
    try {
      const blob = await commissionsApi.download(startDate, endDate, format, {
        sellerId,
      });
      const url = URL.createObjectURL(
        blob instanceof Blob ? blob : new Blob([blob])
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = buildExportFilename(`comisiones-${startDate}`, format);
      link.click();
      URL.revokeObjectURL(url);
      showToast(t("common.downloadSuccess"), "success");
    } catch {
      showToast(t("common.downloadError"), "error");
    } finally {
      setExportingFormat(null);
    }
  };

  const handleRulesSaved = () => {
    setRulesOpen(false);
    showToast(t("commissions.rulesSaved"));
  };

  const columns = useMemo(
    () => [
      {
        key: "contract_id",
        header: t("commissions.contract"),
        render: (row) => (
          <div className="min-w-0">
            <p className="font-semibold text-ink">
              {row.is_historical ? (
                t("historical.chip")
              ) : row.contract_guid ? (
                <Link
                  to={`/contracts/${row.contract_guid}`}
                  className="hover:text-brand-strong hover:underline"
                >
                  #{row.contract_id}
                </Link>
              ) : (
                `#${row.contract_id}`
              )}
            </p>
            <div className="flex items-center gap-1.5">
              <p className="min-w-0 truncate text-micro text-ink-3">
                {row.seller && row.seller !== "Unknown"
                  ? row.seller
                  : t("commissions.unassigned")}
              </p>
              <ScoreBadge value={readSellerScore(row)} />
            </div>
          </div>
        ),
      },
      {
        key: "client_name",
        header: t("commissions.client"),
        render: (row) => (
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">
              {row.client_name || "—"}
            </p>
            <p className="truncate text-micro text-ink-3">
              {[row.project, row.lot].filter(Boolean).join(" · ") || "—"}
            </p>
          </div>
        ),
      },
      {
        key: "amount",
        header: t("commissions.saleValue"),
        align: "right",
        render: (row) => (
          <span className="tabular-nums text-ink-2">{money(row.amount)}</span>
        ),
      },
      {
        key: "commission",
        header: t("commissions.amount"),
        align: "right",
        render: (row) => (
          <div className="text-right">
            <p className="font-semibold tabular-nums text-ink">
              {money(row.commission)}
            </p>
            <p className="text-micro text-ink-3">{formatRate(rateFor(row))}</p>
          </div>
        ),
      },
      {
        key: "commission_paid_at",
        header: t("common.status"),
        render: (row) =>
          row.commission_paid_at ? (
            <div>
              <Chip tone="success">{t("commissions.paid")}</Chip>
              {hasCreditAdjustment(row) && (
                <p className="mt-1 text-micro text-ink-3">
                  {t("commissions.creditAdjustment", {
                    applied: money(row.credit_applied),
                    cash: money(
                      Number(row.commission || 0) -
                        Number(row.credit_applied || 0)
                    ),
                  })}
                </p>
              )}
            </div>
          ) : (
            <Chip tone="warning">{t("commissions.pending")}</Chip>
          ),
      },
      {
        key: "date",
        header: t("commissions.date"),
        render: (row) => (
          <span className="text-ink-2">{formatDate(row.date)}</span>
        ),
      },
      ...(isAdmin
        ? [
            {
              key: "actions",
              header: "",
              align: "right",
              render: (row) =>
                row.is_historical ? (
                  <span className="text-micro text-ink-3">—</span>
                ) : row.commission_paid_at ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setViewing(row)}
                  >
                    {t("common.view")}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={
                      paying === row.contract_guid ||
                      previewing === row.contract_guid
                    }
                    disabled={!row.contract_guid}
                    onClick={() => handlePay(row)}
                  >
                    {t("commissions.pay")}
                  </Button>
                ),
            },
          ]
        : []),
    ],
    [handlePay, isAdmin, paying, previewing, t]
  );

  return (
    <main className="min-h-screen w-full bg-canvas px-6 pb-6 page-shell xl:px-[48px] xl:pb-[48px]">
      <div className="mx-auto w-full max-w-[1600px] space-y-5">
        <header className="motion-fade-up flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-page font-bold tracking-tight text-ink">
              {activeTab === "historical"
                ? t("historical.validationQueue.title")
                : t("commissions.pageTitle")}
            </h1>
            <p className="mt-1 text-body text-ink-3">
              {activeTab === "historical"
                ? t("historical.validationQueue.subtitle")
                : t("commissions.pageSubtitle", {
                    count: pagination.total,
                    rate: averageRate,
                    seller:
                      selectedSellerName || t("commissions.allSellers"),
                  })}
            </p>
          </div>
          {activeTab === "commissions" && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-label font-semibold text-ink-3">
                {t("common.export")}
              </span>
              <ExportFormatButtons
                size="md"
                onSelect={handleExport}
                busyFormat={exportingFormat}
                reportLabel={t("reports.commissions")}
              />
              {isAdmin && (
                <Button variant="secondary" onClick={() => setRulesOpen(true)}>
                  {t("commissions.configureRates")}
                </Button>
              )}
            </div>
          )}
        </header>

        <Tabs
          items={[
            {
              value: "commissions",
              label: t("commissions.pageTitle"),
            },
            {
              value: "historical",
              label: `${t("historical.validationQueue.tab")}${
                pendingHistorical > 0 ? `  ${pendingHistorical}` : ""
              }`,
            },
          ]}
          value={activeTab}
          onChange={handleTabChange}
          className="motion-fade-up [animation-delay:30ms]"
        />

        {activeTab === "historical" ? (
          <HistoricalValidationTab onPendingChange={setPendingHistorical} />
        ) : (
          <>
        <div className="motion-fade-up flex flex-wrap items-end gap-3 [animation-delay:45ms]">
          <label className="flex flex-col gap-1 text-label font-semibold text-ink-2">
            {t("filters.startDate")}
            <input
              type="date"
              value={startDate}
              onChange={(event) => handleStartDateChange(event.target.value)}
              className="h-11 rounded-control border border-line-strong bg-surface px-3 text-body-lg text-ink"
            />
          </label>
          <label className="flex flex-col gap-1 text-label font-semibold text-ink-2">
            {t("filters.endDate")}
            <input
              type="date"
              value={endDate}
              onChange={(event) => handleEndDateChange(event.target.value)}
              className="h-11 rounded-control border border-line-strong bg-surface px-3 text-body-lg text-ink"
            />
          </label>
          <label className="flex min-w-52 flex-col gap-1 text-label font-semibold text-ink-2">
            {t("commissions.seller")}
            <Select value={sellerId} onChange={(event) => handleSellerChange(event.target.value)}>
              <option value="">{t("commissions.allSellers")}</option>
              {sellers.map((entry) => (
                <option key={entry.id} value={String(entry.id)}>
                  {entry.name}
                </option>
              ))}
            </Select>
          </label>
        </div>

        {error && (
          <ErrorState
            title={t("commissions.loadErrorTitle")}
            description={error}
            onRetry={load}
          />
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label={t("commissions.monthCommission")}
            value={money(totals.commission)}
            caption={t("commissions.monthCaption", { rate: averageRate })}
            loading={loading}
            index={0}
          />
          <StatCard
            label={t("commissions.pendingLabel")}
            value={money(totals.pending)}
            caption={t("commissions.pendingCaption")}
            tone="warning"
            loading={loading}
            index={1}
          />
          <StatCard
            label={t("commissions.periodPaid")}
            value={money(totals.paid)}
            caption={t("commissions.paidCaption", { count: totals.paid_count })}
            tone="success"
            loading={loading}
            index={2}
          />
        </div>

        <CommissionCreditsCard
          credits={credits}
          sellerBalance={sellerBalance}
          showSeller
          isAdmin={isAdmin}
          loading={loading}
          creditsPagination={creditsPagination}
          onCreditsPageChange={setCreditsPage}
          className="motion-fade-up [animation-delay:190ms]"
        />

        <Card
          title={t("commissions.detailTitle")}
          className="motion-fade-up [animation-delay:190ms]"
          bodyClassName="p-0"
        >
          {loading ? (
            <div className="p-5">
              <Skeleton rows={5} />
            </div>
          ) : (
            <>
              <div className="px-2">
                <Table
                  columns={columns}
                  rows={items}
                  getRowKey={(row) => `${row.historical_sale_id || row.contract_id}-${row.seller}`}
                  empty={
                    <div className="p-5">
                      <EmptyState
                        title={t("commissions.noData")}
                        description={t("commissions.noDataHint")}
                      />
                    </div>
                  }
                  mobileCard={(row) => (
                    <div className="mb-2 rounded-card border border-line bg-surface p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-body font-semibold text-ink">
                            #{row.contract_id} · {row.client_name || "—"}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <p className="min-w-0 truncate text-micro text-ink-3">
                              {[
                                row.seller && row.seller !== "Unknown"
                                  ? row.seller
                                  : t("commissions.unassigned"),
                                row.project,
                                formatDate(row.date),
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                            <ScoreBadge value={readSellerScore(row)} />
                          </div>
                          <p className="text-micro text-ink-3">
                            {money(row.amount)} · {formatRate(rateFor(row))}
                          </p>
                        </div>
                        <p className="text-body font-bold tabular-nums text-ink">
                          {money(row.commission)}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div>
                          {row.commission_paid_at ? (
                            <Chip tone="success">
                              {t("commissions.paid")}
                            </Chip>
                          ) : (
                            <Chip tone="warning">
                              {t("commissions.pending")}
                            </Chip>
                          )}
                          {hasCreditAdjustment(row) && (
                            <p className="mt-1 text-micro text-ink-3">
                              {t("commissions.creditAdjustment", {
                                applied: money(row.credit_applied),
                                cash: money(
                                  Number(row.commission || 0) -
                                    Number(row.credit_applied || 0)
                                ),
                              })}
                            </p>
                          )}
                        </div>
                        {isAdmin &&
                          (row.commission_paid_at ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setViewing(row)}
                            >
                              {t("common.view")}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="secondary"
                              loading={
                                paying === row.contract_guid ||
                                previewing === row.contract_guid
                              }
                              disabled={!row.contract_guid}
                              onClick={() => handlePay(row)}
                            >
                              {t("commissions.pay")}
                            </Button>
                          ))}
                      </div>
                    </div>
                  )}
                />
              </div>
              {pagination.total > 0 && (
                <div className="border-t border-line px-5">
                  <Pagination
                    page={page}
                    pageCount={pagination.total_pages || 1}
                    total={pagination.total}
                    perPage={PAGE_SIZE}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </Card>
          </>
        )}
      </div>

      <CommissionRulesSheet
        open={rulesOpen}
        sellers={sellers.map((entry) => entry.name)}
        onClose={() => setRulesOpen(false)}
        onSaved={handleRulesSaved}
      />

      <Dialog
        open={Boolean(payoutResult)}
        onClose={() => setPayoutResult(null)}
        title={t("commissions.payoutResultTitle")}
        size="sm"
        footer={
          <Button
            variant="secondary"
            onClick={() => setPayoutResult(null)}
          >
            {t("common.close")}
          </Button>
        }
      >
        {payoutResult && (
          <div className="space-y-4">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-body">
              <dt className="text-ink-3">{t("commissions.payoutGross")}</dt>
              <dd className="text-right font-semibold">
                {money(payoutResult.commission)}
              </dd>
              <dt className="text-ink-3">{t("commissions.payoutCredit")}</dt>
              <dd className="text-right font-semibold">
                {money(payoutResult.applied_total)}
              </dd>
              <dt className="text-ink-3">{t("commissions.payoutCash")}</dt>
              <dd className="text-right font-semibold">
                {money(payoutResult.net_cash)}
              </dd>
              <dt className="text-ink-3">
                {t("commissions.payoutRemainingCredit")}
              </dt>
              <dd className="text-right font-semibold">
                {money(payoutResult.remaining_credit)}
              </dd>
            </dl>
            {payoutResult.applications?.length > 0 && (
              <div className="border-t border-line pt-3">
                <p className="mb-2 text-micro font-bold uppercase tracking-wide text-ink-3">
                  {t("commissions.payoutApplications")}
                </p>
                <ul className="space-y-2 text-body">
                  {payoutResult.applications.map((application) => (
                    <li
                      key={application.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="text-ink-2">
                        {application.applied_contract_guid ? (
                          <Link
                            to={`/contracts/${application.applied_contract_guid}`}
                            className="font-semibold hover:text-brand-strong hover:underline"
                          >
                            #{application.applied_contract_id}
                          </Link>
                        ) : (
                          `#${application.applied_contract_id || "—"}`
                        )}
                        <span className="ml-2 text-micro text-ink-3">
                          ({t("commissions.creditTitle")} #
                          {application.credit_id})
                        </span>
                      </span>
                      <span className="font-semibold tabular-nums text-ink">
                        {money(application.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Dialog>

      <Dialog
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing ? `Comisión #${viewing.contract_id}` : ""}
        size="sm"
        footer={
          <Button variant="secondary" onClick={() => setViewing(null)}>
            {t("common.close")}
          </Button>
        }
      >
        {viewing && (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-body">
            <div>
              <dt className="text-micro text-ink-3">{t("commissions.seller")}</dt>
              <dd className="font-semibold text-ink">{viewing.seller || "—"}</dd>
            </div>
            <div>
              <dt className="text-micro text-ink-3">{t("commissions.client")}</dt>
              <dd className="font-semibold text-ink">
                {viewing.client_name || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-micro text-ink-3">{t("commissions.project")}</dt>
              <dd className="font-semibold text-ink">
                {viewing.project || "—"} · {viewing.lot || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-micro text-ink-3">{t("commissions.date")}</dt>
              <dd className="font-semibold text-ink">
                {formatDate(viewing.date)}
              </dd>
            </div>
            <div>
              <dt className="text-micro text-ink-3">{t("commissions.saleValue")}</dt>
              <dd className="font-semibold text-ink">{money(viewing.amount)}</dd>
            </div>
            <div>
              <dt className="text-micro text-ink-3">{t("commissions.rate")}</dt>
              <dd className="font-semibold text-ink">
                {formatRate(rateFor(viewing))}
              </dd>
            </div>
            <div>
              <dt className="text-micro text-ink-3">{t("commissions.amount")}</dt>
              <dd className="font-semibold text-brand-strong">
                {money(viewing.commission)}
              </dd>
            </div>
            <div>
              <dt className="text-micro text-ink-3">{t("common.status")}</dt>
              <dd>
                {viewing.commission_paid_at ? (
                  <Chip tone="success">
                    {t("commissions.paid")} ·{" "}
                    {formatDate(viewing.commission_paid_at)}
                  </Chip>
                ) : (
                  <Chip tone="warning">{t("commissions.pending")}</Chip>
                )}
                {hasCreditAdjustment(viewing) && (
                  <p className="mt-1 text-micro text-ink-3">
                    {t("commissions.creditAdjustment", {
                      applied: money(viewing.credit_applied),
                      cash: money(
                        Number(viewing.commission || 0) -
                          Number(viewing.credit_applied || 0)
                      ),
                    })}
                  </p>
                )}
              </dd>
            </div>
          </dl>
        )}
      </Dialog>
    </main>
  );
}

export default Commissions;
