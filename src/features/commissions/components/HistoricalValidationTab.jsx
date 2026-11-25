import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLocale } from "@/contexts/LocaleContext";
import { useToast } from "@/contexts/ToastContext";
import useDebounce from "@/hooks/useDebounce";
import {
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  Input,
  Pagination,
  Select,
  Skeleton,
  Table,
} from "@/shared/ui";
import { confirmDialog } from "@/shared/ui/ConfirmProvider";
import { sellerApi } from "@/features/seller/api";
import HistoricalEvidenceViewer from "./HistoricalEvidenceViewer";
import { normalizeSellers } from "./rulesUtils";

const PAGE_SIZE = 20;
const STATUSES = ["pending", "validated", "rejected"];

const money = (value) =>
  `L ${Number(value || 0).toLocaleString("es-HN", { maximumFractionDigits: 0 })}`;

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

const rateOf = (row) => {
  if (row?.rate !== null && row?.rate !== undefined) return Number(row.rate);
  const price = Number(row?.sale_price || 0);
  if (!price) return null;
  return (Number(row?.commission_amount || 0) / price) * 100;
};

function QueueStat({ label, value, caption, tone = "default", loading }) {
  const tones = {
    default: "border-line bg-surface",
    warning: "border-warning-soft bg-warning-soft/50",
    danger: "border-danger-soft bg-danger-soft/40",
  };
  const values = {
    default: "text-ink",
    warning: "text-warning",
    danger: "text-danger",
  };
  return (
    <div className={`rounded-card border p-4 ${tones[tone]}`}>
      <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
        {label}
      </p>
      <p className={`mt-1.5 text-title font-bold tabular-nums ${values[tone]}`}>
        {loading ? "—" : value}
      </p>
      <p className="mt-0.5 text-micro text-ink-3">{caption}</p>
    </div>
  );
}

function statusChip(row, t) {
  const status = row.validation_status || "pending";
  if (status === "validated") {
    return (
      <Chip tone="success">{t("historical.validationQueue.validatedStatus")}</Chip>
    );
  }
  if (status === "rejected") {
    return (
      <Chip tone="danger">{t("historical.validationQueue.rejectedStatus")}</Chip>
    );
  }
  return (
    <Chip tone="warning">
      {t("historical.validationQueue.pendingStatus")}
    </Chip>
  );
}

function HistoricalValidationTab({ onPendingChange }) {
  const { t } = useLocale();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState("pending");
  const [sellerId, setSellerId] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 300);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: PAGE_SIZE,
    total: 0,
    total_pages: 0,
  });
  const [counts, setCounts] = useState({
    pending: 0,
    validated: 0,
    rejected: 0,
  });
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    let active = true;
    sellerApi
      .listSellers({})
      .then((data) => {
        if (active) setSellers(normalizeSellers(data));
      })
      .catch(() => {
        if (active) setSellers([]);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [status, sellerId, debouncedSearch]);

  const queryParams = useMemo(
    () => ({
      seller_id: sellerId || undefined,
      search_term: debouncedSearch || undefined,
    }),
    [debouncedSearch, sellerId]
  );

  const loadCounts = useCallback(async () => {
    try {
      const results = await Promise.all(
        STATUSES.map((value) =>
          sellerApi.listHistoricalSales({
            ...queryParams,
            status: value,
            page: 1,
            per_page: 1,
          })
        )
      );
      const next = { pending: 0, validated: 0, rejected: 0 };
      STATUSES.forEach((value, index) => {
        const data = results[index];
        next[value] = Number(
          data?.pagination?.total ??
            (Array.isArray(data) ? data.length : 0)
        );
      });
      setCounts(next);
      onPendingChange?.(next.pending);
    } catch {
      setCounts({ pending: 0, validated: 0, rejected: 0 });
    }
  }, [onPendingChange, queryParams]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await sellerApi.listHistoricalSales({
        ...queryParams,
        status,
        page,
        per_page: PAGE_SIZE,
        sort: "sale_date-desc",
      });
      setRows(Array.isArray(data?.historical_sales) ? data.historical_sales : []);
      setPagination(
        data?.pagination || {
          page,
          per_page: PAGE_SIZE,
          total: 0,
          total_pages: 0,
        }
      );
    } catch {
      setError(t("historical.validationQueue.loadError"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [page, queryParams, status, t]);

  useEffect(() => {
    load();
    loadCounts();
  }, [load, loadCounts]);

  const refresh = async () => {
    await Promise.all([load(), loadCounts()]);
  };

  const handleValidate = async (row) => {
    setBusy(`validate-${row.id}`);
    try {
      await sellerApi.validateHistoricalSale(row.id);
      showToast(t("historical.validatedToast"), "success");
      await refresh();
    } catch {
      showToast(t("historical.validationQueue.actionError"), "error");
    } finally {
      setBusy(null);
    }
  };

  const handleReject = async (row) => {
    const confirmed = await confirmDialog({
      title: t("historical.reject"),
      description: t("historical.validationQueue.rejectDescription", {
        name: row.full_name || row.client_name || "",
      }),
      confirmLabel: t("historical.reject"),
    });
    if (!confirmed) return;
    setBusy(`reject-${row.id}`);
    try {
      await sellerApi.rejectHistoricalSale(row.id);
      showToast(t("historical.rejectedToast"), "success");
      await refresh();
    } catch {
      showToast(t("historical.validationQueue.actionError"), "error");
    } finally {
      setBusy(null);
    }
  };

  const openEdit = (row) => {
    navigate(`/vendedor/clientes/historicos/${row.id}`, {
      state: { from: `${location.pathname}${location.search}` },
    });
  };

  const columns = [
    {
      key: "client",
      header: t("historical.validationQueue.client"),
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">
            {row.full_name || row.client_name || "—"}
          </p>
          <p className="truncate text-micro text-ink-3">
            {row.creator_name || row.client_identity || "—"}
          </p>
        </div>
      ),
    },
    {
      key: "sale_date",
      header: t("historical.validationQueue.saleDate"),
      render: (row) => (
        <span className="text-ink-2">{formatDate(row.sale_date)}</span>
      ),
    },
    {
      key: "sale_price",
      header: t("historical.validationQueue.salePrice"),
      align: "right",
      render: (row) => (
        <span className="tabular-nums text-ink-2">{money(row.sale_price)}</span>
      ),
    },
    {
      key: "rate",
      header: t("historical.validationQueue.rate"),
      align: "right",
      render: (row) => (
        <span className="tabular-nums text-ink-2">{formatRate(rateOf(row))}</span>
      ),
    },
    {
      key: "commission",
      header: t("historical.validationQueue.commission"),
      align: "right",
      render: (row) => (
        <span className="tabular-nums font-semibold text-ink">
          {money(row.commission_amount)}
        </span>
      ),
    },
    {
      key: "evidence",
      header: t("historical.validationQueue.evidence"),
      render: (row) =>
        row.evidence_file ? (
          <HistoricalEvidenceViewer
            saleId={row.id}
            evidencePath={row.evidence_file}
          />
        ) : (
          <span className="text-ink-3">
            {t("historical.validationQueue.noEvidence")}
          </span>
        ),
    },
    {
      key: "status",
      header: t("common.status"),
      render: (row) => statusChip(row, t),
    },
    {
      key: "actions",
      header: t("historical.validationQueue.actions"),
      align: "right",
      render: (row) => {
        const disabled =
          busy === `validate-${row.id}` || busy === `reject-${row.id}`;
        return (
          <div className="flex flex-wrap justify-end gap-1.5">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => openEdit(row)}
              disabled={disabled}
            >
              {t("common.edit")}
            </Button>
            <Button
              size="sm"
              onClick={() => handleValidate(row)}
              loading={busy === `validate-${row.id}`}
              disabled={disabled}
            >
              {t("historical.validate")}
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleReject(row)}
              loading={busy === `reject-${row.id}`}
              disabled={disabled}
            >
              {t("historical.reject")}
            </Button>
          </div>
        );
      },
    },
  ];

  const total =
    counts.pending + counts.validated + counts.rejected;

  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <QueueStat
          label={t("historical.validationQueue.pending")}
          value={counts.pending}
          caption={t("historical.validationQueue.pendingCaption")}
          tone="warning"
          loading={loading}
        />
        <QueueStat
          label={t("historical.validationQueue.validated")}
          value={counts.validated}
          caption={t("historical.validationQueue.validatedCaption")}
          loading={loading}
        />
        <QueueStat
          label={t("historical.validationQueue.rejected")}
          value={counts.rejected}
          caption={t("historical.validationQueue.rejectedCaption")}
          tone="danger"
          loading={loading}
        />
        <QueueStat
          label={t("historical.validationQueue.total")}
          value={total}
          caption={t("historical.validationQueue.totalCaption")}
          loading={loading}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("historical.validationQueue.searchPlaceholder")}
          aria-label={t("historical.validationQueue.searchPlaceholder")}
          className="max-w-xs"
        />
        <Select
          value={sellerId}
          onChange={(event) => setSellerId(event.target.value)}
          aria-label={t("historical.validationQueue.seller")}
          className="max-w-xs"
        >
          <option value="">{t("historical.validationQueue.allSellers")}</option>
          {sellers.map((seller) => (
            <option key={seller.sellerId} value={String(seller.sellerId)}>
              {seller.sellerName}
            </option>
          ))}
        </Select>
        <div className="flex flex-wrap gap-1.5">
          {[
            { value: "all", label: t("historical.validationQueue.all") },
            {
              value: "pending",
              label: t("historical.validationQueue.pendingFilter"),
            },
            {
              value: "validated",
              label: t("historical.validationQueue.validatedFilter"),
            },
            {
              value: "rejected",
              label: t("historical.validationQueue.rejectedFilter"),
            },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatus(option.value)}
              className={`rounded-full px-3 py-1.5 text-micro font-semibold transition-colors ${
                status === option.value
                  ? "bg-brand-soft text-brand-strong"
                  : "bg-surface text-ink-3 hover:text-ink-2"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <Card bodyClassName="p-0">
        {error ? (
          <div className="p-5">
            <ErrorState
              title={t("historical.validationQueue.loadError")}
              description={error}
              onRetry={load}
            />
          </div>
        ) : loading ? (
          <div className="p-5">
            <Skeleton rows={5} />
          </div>
        ) : (
          <>
            <div className="px-2">
              <Table
                columns={columns}
                rows={rows}
                getRowKey={(row) => row.id}
                empty={
                  <div className="p-5">
                    <EmptyState
                      title={t("historical.validationQueue.emptyTitle")}
                      description={t(
                        "historical.validationQueue.emptyDescription"
                      )}
                    />
                  </div>
                }
                mobileCard={(row) => (
                  <div className="mb-2 rounded-card border border-line bg-surface p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">
                          {row.full_name || row.client_name || "—"}
                        </p>
                        <p className="truncate text-micro text-ink-3">
                          {[
                            row.creator_name,
                            formatDate(row.sale_date),
                            money(row.sale_price),
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                      {statusChip(row, t)}
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2 text-micro text-ink-3">
                      <span>
                        {t("historical.validationQueue.rate")}{" "}
                        {formatRate(rateOf(row))} ·{" "}
                        {money(row.commission_amount)}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {row.evidence_file && (
                        <HistoricalEvidenceViewer
                          saleId={row.id}
                          evidencePath={row.evidence_file}
                        />
                      )}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openEdit(row)}
                      >
                        {t("common.edit")}
                      </Button>
                      <Button size="sm" onClick={() => handleValidate(row)}>
                        {t("historical.validate")}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleReject(row)}
                      >
                        {t("historical.reject")}
                      </Button>
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
    </section>
  );
}

export default HistoricalValidationTab;
