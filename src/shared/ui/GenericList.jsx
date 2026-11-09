import { useState, useEffect, useMemo, useCallback, useRef, Fragment } from "react";
import PropTypes from "prop-types";
import { useLocale } from "../../contexts/LocaleContext";
import { apiClient } from "../../lib/apiClient";

const parseSortString = (value) => {
  if (!value || typeof value !== "string") {
    return { field: null, direction: "desc" };
  }

  const [field, direction] = value.split("-");
  if (!field) {
    return { field: null, direction: "desc" };
  }

  const normalizedDirection = direction === "asc" ? "asc" : "desc";
  return { field, direction: normalizedDirection };
};

/**
 * Generic List Component
 * A reusable component for displaying paginated lists with search and filter capabilities
 */
function GenericList({
  endpoint,
  renderItem,
  filters = {},
  onItemSelect,
  columns = [],
  sortBy = "created_at-desc",
  itemsPerPage = 5,
  emptyMessage,
  loadingMessage,
  entityName = "items",
  showMobileCards = true,
  showDesktopTable = true,
  customParams,
  refreshTrigger = 0,
  onSortChange,
  gridClassName,
  itemPatch = null,
}) {
  const { t } = useLocale();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Optimistic update: merge patched item (e.g. contract balance/total_paid after payment) into list
  useEffect(() => {
    if (!itemPatch?.id || items.length === 0) return;
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemPatch.id ? { ...item, ...itemPatch } : item
      )
    );
  }, [itemPatch, items.length]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Sorting state
  const [sortField, setSortField] = useState(() => parseSortString(sortBy).field);
  const [sortDirection, setSortDirection] = useState(() => parseSortString(sortBy).direction);
  const [prevSortBy, setPrevSortBy] = useState(sortBy);

  if (sortBy !== prevSortBy) {
    const parsed = parseSortString(sortBy);
    setPrevSortBy(sortBy);
    setSortField(parsed.field);
    setSortDirection(parsed.direction);
  }

  const handleItemClick = (item) => {
    if (onItemSelect) {
      onItemSelect(item);
    }
  };

  const stableCustomParams = useMemo(() => customParams || {}, [customParams]);
  // Create a stable, serialised signature for filters so we can reliably
  // detect changes (object identity can cause unnecessary or out-of-order fetches).
  const filtersSignature = useMemo(() => {
    if (!filters) return "";
    const keys = Object.keys(filters).sort();
    return keys.map((k) => `${k}=${String(filters[k] ?? "")}`).join("&");
  }, [filters]);

  const sortParam = useMemo(() => {
    if (sortField) {
      return `${sortField}-${sortDirection}`;
    }
    return sortBy || "created_at-desc";
  }, [sortField, sortDirection, sortBy]);

  const handleSort = useCallback(
    (column) => {
      if (!column.sortKey) {
        return;
      }

      // Calculate new sort state
      const isSameField = sortField === column.sortKey;
      const nextDirection = isSameField
        ? sortDirection === "asc" ? "desc" : "asc"
        : column.defaultSortDirection === "asc" ? "asc" : "desc";

      // Update state
      setCurrentPage(1);
      setSortField(column.sortKey);
      setSortDirection(nextDirection);

      // Call the optional callback
      if (typeof onSortChange === "function") {
        onSortChange(`${column.sortKey}-${nextDirection}`, column.sortKey, nextDirection);
      }
    },
    [sortField, sortDirection, onSortChange]
  );

  // Ref to track previous filters to detect changes
  const prevFiltersSignature = useRef(filtersSignature);

  // Reset to page 1 if filters change (handling it inside the main effect to avoid double fetch)
  // We remove the separate useEffect for setCurrentPage(1) to avoid the race condition/double render cycle.

  // Fetch items whenever dependencies change
  useEffect(() => {
    // Check if filters changed since last run
    const filtersChanged = filtersSignature !== prevFiltersSignature.current;

    // If filters changed and we are not on page 1, we must reset to page 1.
    // We update the ref, set the page, and RETURN early.
    // The state update will trigger a re-render, bringing us back here with currentPage=1 and filtersChanged=false
    if (filtersChanged) {
      prevFiltersSignature.current = filtersSignature;
      if (currentPage !== 1) {
        setCurrentPage(1);
        return;
      }
    }

    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchItems = async () => {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams();

      // Add filters (only append keys that have a value)
      Object.entries(filters || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value);
        }
      });

      // Add custom params
      Object.entries(stableCustomParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value);
        }
      });

      // Add sort parameter
      if (sortParam) {
        params.append("sort", sortParam);
      }

      // Pagination params
      params.append("page", currentPage);
      params.append("per_page", itemsPerPage);

      try {
        const data = await apiClient.get(`${endpoint}?${params.toString()}`, { signal });

        // Handle different response structures
        const itemsArray = data[entityName] || data.items || data.data || data;

        // Only update state if not aborted
        if (!signal.aborted) {
          setItems(Array.isArray(itemsArray) ? itemsArray : []);

          // Handle pagination metadata (support multiple API response shapes)
          let apiPage = currentPage;
          let apiPages = 0;
          let apiCount = 0;
          const pagination = data.pagination || data.meta?.pagination;
          if (pagination) {
            apiPage = parseInt(pagination.page || 1, 10);
            apiPages = parseInt(pagination.pages || pagination.total_pages || 0, 10);
            apiCount = parseInt(pagination.count || pagination.total_items || pagination.total || 0, 10);
          }
          // Fallback: top-level total / total_count (e.g. lots endpoint)
          if (apiCount === 0 && (data.total != null || data.total_count != null)) {
            apiCount = parseInt(data.total ?? data.total_count, 10) || 0;
          }
          if (apiPages === 0 && apiCount > 0) {
            apiPages = Math.ceil(apiCount / itemsPerPage);
          }
          if (apiPages > 0) {
            if (currentPage !== apiPage) setCurrentPage(apiPage);
            setTotalPages(apiPages);
          } else {
            setTotalPages(1);
          }
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          // Request was aborted, do nothing
          return;
        }
        console.error(`Error fetching ${entityName}:`, err);
        if (!signal.aborted) {
          setError(err.message);
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchItems();

    // Cleanup function to abort fetch on unmount or re-run
    return () => {
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersSignature, sortParam, currentPage, itemsPerPage, endpoint, entityName, stableCustomParams, refreshTrigger]);

  // Handle going to next or previous pages
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Redundant effect removed

  // Loading state - only block if we have no items (first load or when filters clear list)
  if (loading && items.length === 0) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">
          {loadingMessage || t('common.loading')}
        </span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center">
          <svg
            className="w-5 h-5 text-red-500 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-red-700 dark:text-red-300">
            {t('common.error')}: {error}
          </span>
        </div>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-white/40 dark:bg-darkblack-600/40 backdrop-blur-xl rounded-[48px] border border-dashed border-slate-200 dark:border-white/10 shadow-xs">
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-blue-500/10 blur-[60px] rounded-full scale-150" />
          <div className="relative w-28 h-28 bg-white dark:bg-darkblack-500 shadow-2xl rounded-[32px] flex items-center justify-center border border-slate-100 dark:border-white/5">
            <svg className="w-12 h-12 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter italic">
          {emptyMessage || t('common.noDataFound')} <span className="text-blue-500 font-normal">.</span>
        </h3>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] max-w-xs mx-auto leading-relaxed opacity-60">
          {t('common.tryAdjustingFilters')}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile & Tablet & Desktop Grid: Card View */}
      {showMobileCards && (
        <div className={!showDesktopTable ? (gridClassName || "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6") : "space-y-3 block lg:hidden"}>
          {items.map((item, index) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={!showDesktopTable ? "h-full" : "bg-white dark:bg-darkblack-600 rounded-xl border-2 border-gray-200 dark:border-darkblack-400 p-4 shadow-md hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 cursor-pointer"}
            >
              {renderItem(item, index, true, handleItemClick)}
            </div>
          ))}
        </div>
      )}

      {/* Desktop: Table View */}
      {showDesktopTable && (
        <div className="hidden lg:block w-full">
          <table className="w-full table-auto bg-transparent min-w-full">
            <thead>
              <tr className="bg-transparent border-b border-gray-100 dark:border-white/5">
                {columns.map((column, idx) => {
                  const isSortable = Boolean(column.sortKey);
                  const isActive = isSortable && column.sortKey === sortField;
                  const ariaSort = isSortable
                    ? isActive
                      ? sortDirection === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                    : undefined;

                  return (
                    <th
                      key={idx}
                      aria-sort={ariaSort}
                      className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ${column.align === "center"
                        ? "text-center"
                        : column.align === "right"
                          ? "text-right"
                          : "text-left"
                        }`}
                    >
                      {isSortable ? (
                        <button
                          type="button"
                          onClick={() => handleSort(column)}
                          className={`inline-flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${column.align === "right" ? "justify-end w-full" : ""
                            }`}
                        >
                          <span>{column.label}</span>
                          <span
                            className={`relative flex items-center justify-center w-4 h-4 text-[0px] ${isActive ? "opacity-100" : "opacity-60"
                              }`}
                            aria-hidden="true"
                          >
                            <svg
                              className={`w-3.5 h-3.5 transition-transform duration-200 ${isActive && sortDirection === "asc" ? "transform rotate-180" : ""
                                }`}
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12 4L19 11H5L12 4Z"
                                fill="currentColor"
                                opacity="0.7"
                              />
                              <path
                                d="M12 20L5 13H19L12 20Z"
                                fill="currentColor"
                                opacity="0.7"
                              />
                            </svg>
                          </span>
                        </button>
                      ) : (
                        column.label
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <Fragment key={item.id}>
                  {renderItem(item, index, false, handleItemClick)}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Creative Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mt-10 px-6 py-5 bg-white/80 dark:bg-darkblack-600/80 backdrop-blur-xl rounded-[2rem] border border-gray-100 dark:border-darkblack-500 shadow-xl shadow-blue-500/5">
          {/* Info Section */}
          <div className="order-2 md:order-1 text-sm font-medium text-bgray-500 dark:text-bgray-400">
            {t('common.showing') || "Mostrando"} <span className="text-bgray-900 dark:text-white font-bold">{items.length}</span> {t('common.results') || "resultados"}
          </div>

          {/* Navigation Section */}
          <div className="order-1 md:order-2 flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-darkblack-500 text-bgray-600 dark:text-bgray-300 border border-gray-100 dark:border-darkblack-400 hover:bg-blue-500 hover:text-white hover:border-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
              title={t('common.previous')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex items-center gap-1.5 px-2">
              {/* Logic for Page Numbers */}
              {(() => {
                const pages = [];
                const maxVisible = 5;
                let start = Math.max(1, currentPage - 2);
                let end = Math.min(totalPages, start + maxVisible - 1);

                if (end === totalPages) {
                  start = Math.max(1, end - maxVisible + 1);
                }

                for (let i = start; i <= end; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => {
                        setCurrentPage(i);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`min-w-[40px] h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-300 ${currentPage === i
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110"
                        : "bg-white dark:bg-darkblack-500 text-bgray-600 dark:text-bgray-300 border border-gray-100 dark:border-darkblack-400 hover:bg-gray-50 dark:hover:bg-darkblack-400"
                        }`}
                    >
                      {i}
                    </button>
                  );
                }
                return pages;
              })()}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="px-1 text-bgray-400 font-bold">...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className="min-w-[40px] h-10 flex items-center justify-center rounded-xl text-sm font-bold bg-white dark:bg-darkblack-500 text-bgray-600 dark:text-bgray-300 border border-gray-100 dark:border-darkblack-400 hover:bg-gray-50 dark:hover:bg-darkblack-400"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-darkblack-500 text-bgray-600 dark:text-bgray-300 border border-gray-100 dark:border-darkblack-400 hover:bg-blue-500 hover:text-white hover:border-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
              title={t('common.next')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Page Jump Section */}
          <div className="order-3 flex items-center gap-3">
            <span className="text-xs font-bold text-bgray-400 uppercase tracking-widest leading-none">
              {t('common.page') || "Página"}
            </span>
            <div className="flex items-center bg-gray-50 dark:bg-darkblack-500 border border-gray-100 dark:border-darkblack-400 rounded-xl px-3 py-1.5 h-10 shadow-inner">
              <span className="text-sm font-black text-bgray-900 dark:text-white mr-1">{currentPage}</span>
              <span className="text-xs font-bold text-bgray-400 mx-1">/</span>
              <span className="text-sm font-bold text-bgray-600 dark:text-bgray-400">{totalPages}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

GenericList.propTypes = {
  endpoint: PropTypes.string.isRequired,
  renderItem: PropTypes.func.isRequired,
  filters: PropTypes.object,
  onItemSelect: PropTypes.func,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      align: PropTypes.oneOf(["left", "center", "right"]),
      sortKey: PropTypes.string,
      defaultSortDirection: PropTypes.oneOf(["asc", "desc"]),
    })
  ),
  sortBy: PropTypes.string,
  itemsPerPage: PropTypes.number,
  emptyMessage: PropTypes.string,
  loadingMessage: PropTypes.string,
  entityName: PropTypes.string,
  showMobileCards: PropTypes.bool,
  showDesktopTable: PropTypes.bool,
  customParams: PropTypes.object,
  refreshTrigger: PropTypes.number,
  onSortChange: PropTypes.func,
  gridClassName: PropTypes.string,
  itemPatch: PropTypes.object,
};

export default GenericList;
