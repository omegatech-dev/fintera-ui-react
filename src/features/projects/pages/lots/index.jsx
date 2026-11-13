import { useState, useContext, useMemo, useCallback, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useLocale } from "../../../../contexts/LocaleContext";
import AuthContext from "../../../../contexts/AuthContext";
import SearchFilterBar from "../../../../shared/ui/SearchFilterBar";
import LotItem from "../../components/lots/LotItem";
import LotDetailsModal from "../../components/lots/LotDetailsModal";
import { projectsApi } from "../../api";
import { getStatusLabel } from "../../../../shared/utils/statusUtils";
import {
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  Pagination,
  Skeleton,
  Table,
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

function LotsList() {
  const { id: projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { t } = useLocale();
  const userRole = user?.role;

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [lots, setLots] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState({ field: "updated_at", direction: "asc" });

  const [detailsLot, setDetailsLot] = useState(null);

  // Highlighted lot state for navigation from contracts
  const [highlightedLotId, setHighlightedLotId] = useState(null);

  /**
   * Handle navigation from contracts page - auto-search for the specific lot
   */
  useEffect(() => {
    if (location.state?.selectedLotId || location.state?.selectedLotName) {
      if (location.state.selectedLotName) {
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
      setLots(data.lots || []);
      const pagination =
        data.pagination ||
        (data.total ? { pages: Math.ceil(data.total / PER_PAGE), total: data.total } : {});
      setTotalPages(Math.max(1, parseInt(pagination.pages || 1, 10)));
      setTotal(parseInt(pagination.total || pagination.count || 0, 10));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId, filters, page, sort]);

  useEffect(() => {
    fetchLots();
  }, [fetchLots]);

  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((value) => {
    setStatusFilter(value);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((field) => {
    setSort((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const formatPrice = (value) => {
    if (!value && value !== 0) return "N/A";
    return `${Number(value).toLocaleString()}`;
  };

  // Status filter options
  const statusOptions = useMemo(
    () => [
      { value: "", label: t("common.all") },
      { value: "available", label: t("status.available") },
      { value: "reserved", label: t("status.reserved") },
      { value: "financed", label: t("status.financed") },
      { value: "fully_paid", label: t("status.fully_paid") },
    ],
    [t]
  );

  const columns = useMemo(
    () => [
      {
        key: "name",
        header: t("lotsTable.lot"),
        sortable: true,
        render: (lot) => (
          <div className="min-w-0">
            <p className="truncate text-body font-semibold text-ink">
              {lot.name}
              {highlightedLotId && lot.id === highlightedLotId && (
                <span className="ml-2 rounded-chip bg-brand-soft px-2 py-0.5 text-micro font-bold text-brand-strong">
                  {t("common.selected") || "Seleccionado"}
                </span>
              )}
            </p>
            <p className="truncate text-micro text-ink-3">
              {lot.address || lot.project_name || "—"}
            </p>
          </div>
        ),
      },
      {
        key: "width",
        header: t("lotsTable.dimensions"),
        sortable: true,
        render: (lot) => {
          const dimensions = lot.length && lot.width ? `${lot.width} × ${lot.length}` : lot.dimensions || "—";
          return (
            <span className="text-body text-ink-2">
              {dimensions}{" "}
              <span className="text-micro text-ink-3">
                {lot.area ? `· ${lot.area} ${lot.measurement_unit || ""}` : ""}
              </span>
            </span>
          );
        },
      },
      {
        key: "price",
        header: t("lotsTable.price"),
        sortable: true,
        align: "right",
        render: (lot) => {
          const finalPrice =
            lot.effective_price !== undefined
              ? lot.effective_price
              : lot.override_price && lot.override_price > 0
                ? lot.override_price
                : lot.price;
          const hasOverride =
            lot.price > 0 && Math.abs(finalPrice - lot.price) > 0.01;
          return (
            <span
              className={`text-body font-bold ${
                hasOverride ? "text-brand-strong" : "text-ink"
              }`}
            >
              {formatPrice(finalPrice)}
            </span>
          );
        },
      },
      {
        key: "reserved_by",
        header: t("lotsTable.reservedBy"),
        render: (lot) =>
          lot.reserved_by ? (
            <span className="text-body text-ink">{lot.reserved_by}</span>
          ) : (
            <span className="text-body text-ink-3">{t("lots.notReserved")}</span>
          ),
      },
      {
        key: "status",
        header: t("lotsTable.status"),
        sortable: true,
        render: (lot) => (
          <Chip tone={STATUS_TONES[lot.status?.toLowerCase()] || "neutral"}>
            {getStatusLabel(lot.status)}
          </Chip>
        ),
      },
      {
        key: "actions",
        header: "",
        align: "right",
        render: (lot) => (
          <div className="flex items-center justify-end gap-2">
            {lot.status?.toLowerCase() === "available" && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  navigate(`/projects/${projectId}/lots/${lot.id}/contracts/create`)
                }
              >
                {t("lots.reserve")}
              </Button>
            )}
            {userRole === "admin" && lot.status?.toLowerCase() !== "sold" && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate(`/projects/${projectId}/lots/${lot.id}/edit`)}
              >
                {t("common.edit")}
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => setDetailsLot(lot)}>
              {t("common.view")}
            </Button>
          </div>
        ),
      },
    ],
    [highlightedLotId, navigate, projectId, t, userRole]
  );

  // Actions for SearchFilterBar
  const actions = useMemo(() => {
    if (userRole === "admin") {
      return [
        {
          label: t("common.create"),
          onClick: () => navigate(`/projects/${projectId}/lots/create`),
          className:
            "py-3 px-10 bg-success-300 text-white font-bold rounded-lg hover:bg-success-400 transition-all",
        },
      ];
    }
    return [];
  }, [userRole, navigate, projectId, t]);

  return (
    <main className="w-full px-6 pb-6 page-shell xl:px-[48px] xl:pb-[48px] dark:bg-darkblack-700">
      <div className="space-y-5">
        {/* Search and Filter Bar */}
        <SearchFilterBar
          searchTerm={searchTerm}
          filterValue={statusFilter}
          filterOptions={statusOptions}
          onSearchChange={handleSearchChange}
          onFilterChange={handleFilterChange}
          searchPlaceholder={t("lotsTable.lotFilter")}
          filterPlaceholder={t("lotsTable.status")}
          showFilter={true}
          actions={actions}
        />

        {error && (
          <ErrorState
            title={t("common.error")}
            description={error}
            onRetry={fetchLots}
          />
        )}

        <Card bodyClassName="p-0">
          {loading ? (
            <div className="p-5">
              <Skeleton rows={6} />
            </div>
          ) : (
            <>
              <Table
                columns={columns}
                rows={lots}
                getRowKey={(lot) => lot.id}
                sort={sort}
                onSortChange={handleSortChange}
                empty={
                  <div className="p-5">
                    <EmptyState
                      variant="no-results"
                      title={t("common.noItemsFound")}
                      description={t("common.tryAdjustingFilters")}
                    />
                  </div>
                }
                mobileCard={(lot) => (
                  <LotItem
                    lot={lot}
                    userRole={userRole}
                    isHighlighted={!!highlightedLotId && lot.id === highlightedLotId}
                  />
                )}
              />
              {totalPages > 1 && (
                <div className="px-5 pb-4">
                  <Pagination
                    page={page}
                    pageCount={totalPages}
                    total={total}
                    perPage={PER_PAGE}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      <LotDetailsModal lot={detailsLot} onClose={() => setDetailsLot(null)} />
    </main>
  );
}

export default LotsList;
