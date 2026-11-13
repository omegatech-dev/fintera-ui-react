import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import AuthContext from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useToast } from "@/contexts/ToastContext";
import { commissionsApi } from "../api";
import CommissionRulesSheet from "../components/CommissionRulesSheet";
import { confirmDialog } from "@/shared/ui/ConfirmProvider";
import {
  Button,
  Card,
  Chip,
  Dialog,
  EmptyState,
  ErrorState,
  Select,
  Skeleton,
  Table,
} from "@/shared/ui";

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
  const [paying, setPaying] = useState(null);
  const [startDate, setStartDate] = useState(monthStart);
  const [endDate, setEndDate] = useState(monthEnd);
  const [items, setItems] = useState([]);
  const [seller, setSeller] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [viewing, setViewing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await commissionsApi.list(startDate, endDate);
      setItems(data?.commissions || []);
    } catch {
      setError(t("commissions.loadError"));
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, t]);

  useEffect(() => {
    load();
  }, [load]);

  const sellers = useMemo(
    () => [...new Set(items.map((item) => item.seller).filter(Boolean))].sort(),
    [items]
  );

  const filtered = useMemo(
    () => (seller ? items.filter((item) => item.seller === seller) : items),
    [items, seller]
  );

  const totals = useMemo(
    () =>
      filtered.reduce(
        (acc, item) => ({
          commission: acc.commission + Number(item.commission || 0),
          amount: acc.amount + Number(item.amount || 0),
          paid: acc.paid + (item.commission_paid_at ? Number(item.commission || 0) : 0),
          pending:
            acc.pending + (item.commission_paid_at ? 0 : Number(item.commission || 0)),
          paidCount: acc.paidCount + (item.commission_paid_at ? 1 : 0),
        }),
        { commission: 0, amount: 0, paid: 0, pending: 0, paidCount: 0 }
      ),
    [filtered]
  );

  const handlePay = useCallback(
    async (row) => {
      if (!row?.contract_guid) return;
      const confirmed = await confirmDialog({
        title: t("commissions.payoutTitle"),
        description: t("commissions.payoutDescription", {
          amount: money(row.commission),
          seller: row.seller || t("commissions.sellerFallback"),
        }),
        confirmLabel: t("commissions.payoutConfirm"),
      });
      if (!confirmed) return;

      setPaying(row.contract_guid);
      try {
        const result = await commissionsApi.markPaid(row.contract_guid);
        const paidAt =
          result?.contract?.commission_paid_at || new Date().toISOString();
        setItems((prev) =>
          prev.map((item) =>
            item.contract_guid === row.contract_guid
              ? { ...item, commission_paid_at: paidAt }
              : item
          )
        );
        showToast(t("commissions.payoutSuccess"));
      } catch (err) {
        showToast(err?.message || t("commissions.payoutError"), "error");
      } finally {
        setPaying(null);
      }
    },
    [showToast, t]
  );

  const averageRate = totals.amount
    ? ((totals.commission / totals.amount) * 100).toFixed(1)
    : "0.0";

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await commissionsApi.downloadCsv(startDate, endDate);
      const url = URL.createObjectURL(
        blob instanceof Blob ? blob : new Blob([blob])
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `comisiones-${startDate}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
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
            <p className="font-semibold text-ink">#{row.contract_id}</p>
            <p className="truncate text-micro text-ink-3">
              {row.seller || "—"}
            </p>
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
            <Chip tone="success">{t("commissions.paid")}</Chip>
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
                row.commission_paid_at ? (
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
                    loading={paying === row.contract_guid}
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
    [handlePay, isAdmin, paying, t]
  );

  return (
    <main className="min-h-screen w-full bg-canvas px-6 pb-6 page-shell xl:px-[48px] xl:pb-[48px]">
      <div className="mx-auto w-full max-w-[1600px] space-y-5">
        <header className="motion-fade-up flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-page font-bold tracking-tight text-ink">
              {t("commissions.pageTitle")}
            </h1>
            <p className="mt-1 text-body text-ink-3">
              {t("commissions.pageSubtitle", {
                count: filtered.length,
                rate: averageRate,
                seller: seller || t("commissions.allSellers"),
              })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isAdmin && (
              <Button variant="secondary" onClick={() => setRulesOpen(true)}>
                {t("commissions.configureRates")}
              </Button>
            )}
            <Button variant="secondary" onClick={handleExport} loading={exporting}>
              {t("common.export")}
            </Button>
          </div>
        </header>

        <div className="motion-fade-up flex flex-wrap items-end gap-3 [animation-delay:45ms]">
          <label className="flex flex-col gap-1 text-label font-semibold text-ink-2">
            {t("filters.startDate")}
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="h-11 rounded-control border border-line-strong bg-surface px-3 text-body-lg text-ink"
            />
          </label>
          <label className="flex flex-col gap-1 text-label font-semibold text-ink-2">
            {t("filters.endDate")}
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="h-11 rounded-control border border-line-strong bg-surface px-3 text-body-lg text-ink"
            />
          </label>
          <label className="flex min-w-52 flex-col gap-1 text-label font-semibold text-ink-2">
            {t("commissions.seller")}
            <Select value={seller} onChange={(event) => setSeller(event.target.value)}>
              <option value="">{t("commissions.allSellers")}</option>
              {sellers.map((name) => (
                <option key={name} value={name}>
                  {name}
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
            caption={t("commissions.paidCaption", { count: totals.paidCount })}
            tone="success"
            loading={loading}
            index={2}
          />
        </div>

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
                  rows={filtered}
                  getRowKey={(row) => `${row.contract_id}-${row.seller}`}
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
                          <p className="text-micro text-ink-3">
                            {[row.seller, row.project, formatDate(row.date)]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                          <p className="text-micro text-ink-3">
                            {money(row.amount)} · {formatRate(rateFor(row))}
                          </p>
                        </div>
                        <p className="text-body font-bold tabular-nums text-ink">
                          {money(row.commission)}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        {row.commission_paid_at ? (
                          <Chip tone="success">{t("commissions.paid")}</Chip>
                        ) : (
                          <Chip tone="warning">{t("commissions.pending")}</Chip>
                        )}
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
                              loading={paying === row.contract_guid}
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
              {filtered.length > 0 && (
                <div className="border-t border-line px-5 py-3 text-body text-ink-3">
                  {t("commissions.countSummary", { count: filtered.length })}
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      <CommissionRulesSheet
        open={rulesOpen}
        sellers={sellers}
        onClose={() => setRulesOpen(false)}
        onSaved={handleRulesSaved}
      />

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
              </dd>
            </div>
          </dl>
        )}
      </Dialog>
    </main>
  );
}

export default Commissions;
