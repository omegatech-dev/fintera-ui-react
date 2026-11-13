import { useCallback, useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowsRotate,
  faChevronDown,
  faClipboardList,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { useLocale } from "@/contexts/LocaleContext";
import useDebounce from "@/hooks/useDebounce";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  Pagination,
  Skeleton,
} from "@/shared/ui";
import AuditTimeline from "../components/AuditTimeline";
import { auditsApi } from "../api";
import {
  AUDIT_MODELS,
  formatAuditEvent,
  formatAuditModel,
  normalizeAuditAction,
} from "../modelLabels";

const PER_PAGE = 20;

const readTotal = (data) => {
  if (!data) return 0;
  const pagination = data.pagination || data.meta?.pagination || {};
  const total =
    pagination.total ?? pagination.count ?? data.total ?? data.total_count;
  const parsed = Number(total);
  return Number.isFinite(parsed) ? parsed : 0;
};

const selectClassName =
  "h-10 w-full appearance-none rounded-control border border-line bg-surface pl-3 pr-8 text-label font-semibold text-ink-2 outline-none transition-colors hover:border-line-strong focus:border-brand";

function Audits() {
  const { t } = useLocale();

  const [audits, setAudits] = useState([]);
  const [total, setTotal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [page, setPage] = useState(1);

  const searchTerm = useDebounce(searchInput.trim(), 350);

  const modelOptions = useMemo(
    () => [
      { value: "", label: t("audits.allModels") },
      ...AUDIT_MODELS.map((model) => ({
        value: model,
        label: formatAuditModel(model, t),
      })),
    ],
    [t]
  );

  const fetchAudits = useCallback(
    async (pageNumber) => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page: pageNumber,
          per_page: PER_PAGE,
          sort: "created_at-desc",
        };
        if (searchTerm) params.search_term = searchTerm;
        if (modelFilter) params.model = modelFilter;

        const data = await auditsApi.list(params);
        setAudits(data?.audits || []);
        setTotal(readTotal(data));
      } catch (err) {
        console.error("Error fetching audits:", err);
        setAudits([]);
        setTotal(null);
        setError(err.message || t("common.error"));
      } finally {
        setLoading(false);
      }
    },
    [modelFilter, searchTerm, t]
  );

  useEffect(() => {
    fetchAudits(page);
  }, [page, fetchAudits]);

  const actionOptions = useMemo(() => {
    const seen = new Map();
    audits.forEach((audit) => {
      const key = normalizeAuditAction(audit.action);
      if (key && !seen.has(key)) {
        seen.set(key, formatAuditEvent(key, t));
      }
    });
    return Array.from(seen, ([value, label]) => ({ value, label })).sort(
      (a, b) => a.label.localeCompare(b.label)
    );
  }, [audits, t]);

  useEffect(() => {
    if (
      actionFilter &&
      audits.length > 0 &&
      !audits.some(
        (audit) => normalizeAuditAction(audit.action) === actionFilter
      )
    ) {
      setActionFilter("");
    }
  }, [actionFilter, audits]);

  const visibleAudits = useMemo(() => {
    if (!actionFilter) return audits;
    return audits.filter(
      (audit) => normalizeAuditAction(audit.action) === actionFilter
    );
  }, [actionFilter, audits]);

  const totalPages = Math.max(1, Math.ceil((total ?? 0) / PER_PAGE));
  const hasFilters = Boolean(searchInput.trim() || modelFilter || actionFilter);

  const handleSearchChange = (event) => {
    setSearchInput(event.target.value);
    setPage(1);
  };

  const handleModelChange = (event) => {
    setModelFilter(event.target.value);
    setPage(1);
  };

  const handleActionChange = (event) => {
    setActionFilter(event.target.value);
    setPage(1);
  };

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const intlLocale = useMemo(() => {
    const raw = t("common.locale_code");
    return /^[a-z]{2}(-[a-z]{2})?$/i.test(raw) ? raw : "es-ES";
  }, [t]);

  const totalLabel =
    total == null
      ? t("audits.viewSystemActivity")
      : t("audits.subtitle", {
          total: new Intl.NumberFormat(intlLocale, {
            useGrouping: "always",
          }).format(total),
        });

  return (
    <main className="page-shell min-h-screen w-full bg-canvas px-6 pb-6 xl:px-[48px] xl:pb-[48px]">
      <div className="mx-auto w-full max-w-[1600px] space-y-4">
        <header className="motion-fade-up flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-page font-bold text-ink">{t("audits.title")}</h1>
            <p className="text-body font-medium text-ink-3">{totalLabel}</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchAudits(page)}
            loading={loading}
          >
            <FontAwesomeIcon icon={faArrowsRotate} />
            {t("common.refresh")}
          </Button>
        </header>

        <div className="motion-fade-up flex flex-col gap-2.5 [animation-delay:45ms] sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative w-full sm:w-[180px]">
            <label htmlFor="audits-model-filter" className="sr-only">
              {t("audits.filterByModel")}
            </label>
            <select
              id="audits-model-filter"
              value={modelFilter}
              onChange={handleModelChange}
              className={selectClassName}
            >
              {modelOptions.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FontAwesomeIcon
              icon={faChevronDown}
              aria-hidden="true"
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-ink-3"
            />
          </div>

          <div className="relative w-full sm:w-[170px]">
            <label htmlFor="audits-action-filter" className="sr-only">
              {t("audits.filterByAction")}
            </label>
            <select
              id="audits-action-filter"
              value={actionFilter}
              onChange={handleActionChange}
              className={selectClassName}
            >
              <option value="">{t("audits.allActions")}</option>
              {actionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FontAwesomeIcon
              icon={faChevronDown}
              aria-hidden="true"
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-ink-3"
            />
          </div>

          <div className="relative w-full sm:w-[280px]">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-ink-3"
            />
            <Input
              type="search"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder={t("audits.searchPlaceholder")}
              aria-label={t("audits.searchPlaceholder")}
              className="h-10 pl-9 text-label font-medium"
            />
          </div>
        </div>

        {error && (
          <ErrorState
            title={t("common.error")}
            description={error}
            onRetry={() => fetchAudits(page)}
          />
        )}

        {!error && (
          <Card
            className="motion-fade-up [animation-delay:90ms]"
            bodyClassName="px-4 pb-2.5 pt-[18px] sm:px-5"
          >
            {loading ? (
              <Skeleton rows={8} />
            ) : visibleAudits.length === 0 ? (
              <EmptyState
                variant={hasFilters ? "no-results" : "empty"}
                icon={
                  <FontAwesomeIcon
                    icon={faClipboardList}
                    className="text-2xl text-ink-3"
                  />
                }
                title={t("audits.noAuditsFound")}
                description={
                  hasFilters
                    ? t("common.tryAdjustingFilters")
                    : t("audits.viewSystemActivity")
                }
              />
            ) : (
              <>
                <AuditTimeline items={visibleAudits} />
                <Pagination
                  page={page}
                  pageCount={totalPages}
                  total={total ?? visibleAudits.length}
                  perPage={PER_PAGE}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </Card>
        )}
      </div>
    </main>
  );
}

export default Audits;
