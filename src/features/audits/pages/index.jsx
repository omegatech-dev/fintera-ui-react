import { useState, useEffect, useCallback } from "react";
import SearchFilterBar from "../../../shared/ui/SearchFilterBar";
import AuditTimeline from "../components/AuditTimeline";
import Pagination from "@/shared/ui/Pagination";
import { useLocale } from "../../../contexts/LocaleContext";
import { auditsApi } from "../api";
import { AUDIT_MODELS, formatAuditModel } from "../modelLabels";

/**
 * Audits page component that displays audit logs using a Timeline layout
 */
function Audits() {
  const { t } = useLocale();


  // State
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState({
    model: "",
  });

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PER_PAGE = 20;

  const modelFilterOptions = [
    { value: "", label: t("audits.filterByModel") },
    ...AUDIT_MODELS.map((model) => ({
      value: model,
      label: formatAuditModel(model, t),
    })),
  ];

  const fetchAudits = useCallback(async (pageNum) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pageNum,
        per_page: PER_PAGE,
        sort: "created_at-desc"
      };

      if (searchTerm) params.search_term = searchTerm;
      if (filterState.model) params.model = filterState.model;

      const data = await auditsApi.list(params);
      const newItems = data.audits || [];
      const total = data.pagination?.total || 0;

      setAudits(newItems);
      setTotalPages(Math.ceil(total / PER_PAGE));

    } catch (err) {
      console.error("Error fetching audits:", err);
      // apiClient throws error with message usually
      setError(err.message || "Failed to fetch audits");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterState.model]);

  // Fetch when page or filters change
  useEffect(() => {
    fetchAudits(page);
  }, [page, fetchAudits]);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    setPage(1);
  }, []);

  const handleFilter = useCallback((value) => {
    setFilterState(prev => ({ ...prev, model: value }));
    setPage(1);
  }, []);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] sm:pt-[156px] pt-[100px] dark:bg-darkblack-700 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Search and Filters */}
        <SearchFilterBar
          id="audits-filter-section"
          searchTerm={searchTerm}
          filterValue={filterState.model}
          filterOptions={modelFilterOptions}
          onSearchChange={handleSearch}
          onFilterChange={handleFilter}
          searchPlaceholder={t("audits.searchPlaceholder")}
          filterPlaceholder={t("audits.filterByModel")}
          showFilter={true}
        />

        {/* Content Area */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-center">
            {error}
          </div>
        ) : audits.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gray-50 dark:bg-darkblack-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t("audits.noAuditsFound")}</h3>
            <p className="text-gray-500">{t("audits.tryAdjustingFilters")}</p>
          </div>
        ) : (
          <>
            <div id="audits-timeline">
              <AuditTimeline items={audits} />
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center pt-8">
                <Pagination
                  page={page}
                  pageCount={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default Audits;
