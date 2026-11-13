import { useState, useContext, useMemo, useCallback, useEffect } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { useLocale } from "../../../../contexts/LocaleContext";
import AuthContext from "../../../../contexts/AuthContext";
import useDebounce from "../../../../hooks/useDebounce";
import LotCard from "../../components/lots/LotCard";
import LotDetailsModal from "../../components/lots/LotDetailsModal";
import { projectsApi } from "../../api";
import { getDefaultCurrency } from "../../../../shared/utils/formatSettings";
import {
  Button,
  EmptyState,
  ErrorState,
  Input,
  Pagination,
  Select,
  Skeleton,
} from "@/shared/ui";

const STATUS_TONES = {
  available: "success",
  reserved: "warning",
  pending: "warning",
  financed: "info",
  fully_paid: "info",
  sold: "neutral",
};

const PER_PAGE = 20;
const GRID_CLASS = "grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

function LotsList() {
  const { id: projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { t } = useLocale();
  const userRole = user?.role;

  // Search and filter state
  const initialSelectedName = location.state?.selectedLotName || "";
  const [searchInput, setSearchInput] = useState(initialSelectedName);
  const [searchTerm, setSearchTerm] = useState(initialSelectedName);
  const debouncedSearch = useDebounce(searchInput, 400);
  const [statusFilter, setStatusFilter] = useState("");

  const [lots, setLots] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState({ field: "updated_at", direction: "asc" });
  const [summary, setSummary] = useState({
    total: 0,
    available: 0,
    reserved: 0,
    financed: 0,
    fully_paid: 0,
    price: null,
  });

  const [detailsLot, setDetailsLot] = useState(null);

  // Highlighted lot state for navigation from contracts
  const [highlightedLotId, setHighlightedLotId] = useState(null);

  /**
   * Handle navigation from contracts page - auto-search for the specific lot
   */
  useEffect(() => {
    if (location.state?.selectedLotId || location.state?.selectedLotName) {
      if (location.state.selectedLotName) {
        setSearchInput(location.state.selectedLotName);
        setSearchTerm(location.state.selectedLotName);
      }

      if (location.state.selectedLotId) {
        setHighlightedLotId(location.state.selectedLotId);

        setTimeout(() => {
          setHighlightedLotId(null);
        }, 5000);
      }

      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const next = debouncedSearch.trim();
    setSearchTerm(next.length >= 3 ? next : "");
    setPage(1);
  }, [debouncedSearch]);

  const filters = useMemo(
    () => ({
      ...(searchTerm ? { search_term: searchTerm } : {}),
      ...(statusFilter ? { status: statusFilter.toLowerCase() } : {}),
    }),
    [searchTerm, statusFilter]
  );

  const fetchLots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectsApi.listLots(projectId, {
        ...filters,
        page,
        per_page: PER_PAGE,
        sort: `${sort.field}-${sort.direction}`,
      });
      const rows = data.lots || [];
      setLots(rows);
      if (rows[0]?.project_name) setProjectName(rows[0].project_name);

      const pagination =
        data.pagination ||
        (data.total ? { pages: Math.ceil(data.total / PER_PAGE), total: data.total } : {});
      const totalCount = parseInt(pagination.total || pagination.count || 0, 10);
      const pages =
        pagination.total_pages ||
        pagination.pages ||
        (pagination.total ? Math.ceil(pagination.total / PER_PAGE) : 1);

      setTotalPages(Math.max(1, parseInt(pages, 10)));
      setTotal(totalCount);

      if (page === 1) {
        const hasFilters = Boolean(filters.search_term || filters.status);
        const countByStatus = (status) =>
          rows.filter((lot) => String(lot.status || "").toLowerCase() === status).length;
        const pricedLot =
          rows.find(
            (lot) => lot.effective_price !== undefined && lot.effective_price !== null
          ) || rows.find((lot) => lot.price !== undefined && lot.price !== null);

        setSummary((prev) => {
          if (hasFilters && prev.total > 0) return prev;
          return {
            total: totalCount,
            available: countByStatus("available"),
            reserved: countByStatus("reserved"),
            financed: countByStatus("financed"),
            fully_paid: countByStatus("fully_paid"),
            price: pricedLot
              ? pricedLot.effective_price !== undefined &&
                pricedLot.effective_price !== null
                ? pricedLot.effective_price
                : pricedLot.price
              : null,
          };
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId, filters, page, sort]);

  useEffect(() => {
    fetchLots();
  }, [fetchLots]);

  const handleFilterChange = useCallback((value) => {
    setStatusFilter(value);
    setPage(1);
  }, []);

  const handleSortFieldChange = useCallback((event) => {
    setSort((prev) => ({ ...prev, field: event.target.value }));
    setPage(1);
  }, []);

  const handleSortDirectionToggle = useCallback(() => {
    setSort((prev) => ({
      ...prev,
      direction: prev.direction === "asc" ? "desc" : "asc",
    }));
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleReserve = useCallback(
    (lot) =>
      navigate(`/projects/${projectId}/lots/${lot.id}/contracts/create`),
    [navigate, projectId]
  );

  const handleEdit = useCallback(
    (lot) => navigate(`/projects/${projectId}/lots/${lot.id}/edit`),
    [navigate, projectId]
  );

  const statusChips = useMemo(
    () => [
      { value: "", label: t("common.all"), count: summary.total || total },
      { value: "available", label: t("lots.availablePlural"), count: summary.available },
      { value: "reserved", label: t("lots.reservedPlural"), count: summary.reserved },
      { value: "financed", label: t("lots.financedPlural"), count: summary.financed },
      { value: "fully_paid", label: t("lots.fullyPaidPlural"), count: summary.fully_paid },
    ],
    [t, summary, total]
  );

  const sortOptions = useMemo(
    () => [
      { value: "updated_at", label: t("lots.updatedAt") },
      { value: "name", label: t("lotsTable.lot") },
      { value: "width", label: t("lotsTable.dimensions") },
      { value: "price", label: t("lotsTable.price") },
      { value: "status", label: t("lotsTable.status") },
    ],
    [t]
  );

  const displayTotal = summary.total || total;
  const priceLabel =
    summary.price !== null && summary.price !== undefined
      ? `${Number(summary.price).toLocaleString()} ${getDefaultCurrency()}`
      : null;
  const subtitle = [
    t("lots.totalCount", { count: displayTotal }),
    t("lots.availableCount", { count: summary.available }),
    priceLabel ? t("lots.priceEach", { price: priceLabel }) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <main className="w-full px-6 pb-6 page-shell xl:px-[48px] xl:pb-[48px] dark:bg-darkblack-700">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-1 text-label font-medium text-ink-3"
            >
              <Link to="/projects" className="transition-colors hover:text-ink">
                {t("dashboard.projects")}
              </Link>
              <span aria-hidden="true">/</span>
              <Link
                to={`/projects/${projectId}`}
                className="truncate transition-colors hover:text-ink"
              >
                {projectName || t("lotsTable.project")}
              </Link>
            </nav>
            <h1 className="mt-1 text-page font-bold tracking-tight text-ink">
              {t("projects.lots")}
            </h1>
            <p className="mt-1 text-body text-ink-3">{subtitle}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => navigate(`/projects/${projectId}`)}
            >
              {t("lots.viewProject")}
            </Button>
            {userRole === "admin" && (
              <Button onClick={() => navigate(`/projects/${projectId}/lots/create`)}>
                <span aria-hidden="true">+</span>
                {t("lots.newLot")}
              </Button>
            )}
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-72">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3"
            >
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path
                d="m20 20-3.5-3.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder={t("lots.searchPlaceholder")}
              className="h-10 pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {statusChips.map((chip) => {
              const active = statusFilter === chip.value;
              return (
                <button
                  key={chip.value || "all"}
                  type="button"
                  onClick={() => handleFilterChange(chip.value)}
                  aria-pressed={active}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-chip px-3 text-label font-semibold transition-colors ${
                    active
                      ? "bg-brand-soft text-brand-strong"
                      : "border border-line bg-surface text-ink-2 hover:bg-surface-2"
                  }`}
                >
                  {chip.label}
                  <span
                    className={`text-micro ${active ? "text-brand-strong" : "text-ink-3"}`}
                  >
                    {chip.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="w-44">
              <Select
                value={sort.field}
                onChange={handleSortFieldChange}
                aria-label={t("lots.sortBy")}
                className="h-10"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <button
              type="button"
              onClick={handleSortDirectionToggle}
              aria-label={
                sort.direction === "asc"
                  ? t("lots.sortAscending")
                  : t("lots.sortDescending")
              }
              className="flex h-10 w-10 items-center justify-center rounded-control border border-line-strong bg-surface text-ink-2 transition-colors hover:bg-surface-2"
            >
              {sort.direction === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>

        {error ? (
          <ErrorState
            title={t("common.error")}
            description={error}
            onRetry={fetchLots}
          />
        ) : loading ? (
          <div className={GRID_CLASS}>
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="rounded-card border border-line bg-surface p-4"
              >
                <Skeleton rows={4} />
              </div>
            ))}
          </div>
        ) : lots.length === 0 ? (
          <EmptyState
            variant="no-results"
            title={t("common.noItemsFound")}
            description={t("common.tryAdjustingFilters")}
          />
        ) : (
          <>
            <div className={GRID_CLASS}>
              {lots.map((lot) => (
                <LotCard
                  key={lot.id}
                  lot={lot}
                  tone={STATUS_TONES[String(lot.status || "").toLowerCase()] || "neutral"}
                  isHighlighted={!!highlightedLotId && lot.id === highlightedLotId}
                  isAdmin={userRole === "admin"}
                  onReserve={() => handleReserve(lot)}
                  onView={() => setDetailsLot(lot)}
                  onEdit={() => handleEdit(lot)}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination
                page={page}
                pageCount={totalPages}
                total={total}
                perPage={PER_PAGE}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>

      <LotDetailsModal lot={detailsLot} onClose={() => setDetailsLot(null)} />
    </main>
  );
}

export default LotsList;
