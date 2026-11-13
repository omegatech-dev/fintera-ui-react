import { useState, useContext, useMemo, useCallback, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useLocale } from "../../../../contexts/LocaleContext";
import AuthContext from "../../../../contexts/AuthContext";
import GenericList from "../../../../shared/ui/GenericList";
import SearchFilterBar from "../../../../shared/ui/SearchFilterBar";
import LotItem from "../../components/lots/LotItem";

function LotsList() {
  const { id: projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { t } = useLocale();

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");


  // Highlighted lot state for navigation from contracts
  const [highlightedLotId, setHighlightedLotId] = useState(null);

  /**
   * Handle navigation from contracts page - auto-search for the specific lot
   */
  useEffect(() => {
    if (location.state?.selectedLotId || location.state?.selectedLotName) {
      // Set the search term to the lot name to help find it in the list
      if (location.state.selectedLotName) {
        setSearchTerm(location.state.selectedLotName);
      }

      // Set the highlighted lot ID to visually distinguish it
      if (location.state.selectedLotId) {
        setHighlightedLotId(location.state.selectedLotId);

        // Clear the highlighting after 5 seconds
        setTimeout(() => {
          setHighlightedLotId(null);
        }, 5000);
      }

      // Clear the navigation state after using it
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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

  // Table columns with sort keys
  const columns = useMemo(
    () => [
      {
        label: t("lotsTable.lot"),
        align: "left",
        sortKey: "name",
        defaultSortDirection: "asc",
      },
      {
        label: t("lotsTable.dimensions"),
        align: "left",
        sortKey: "width",
        defaultSortDirection: "asc",
      },
      {
        label: t("lotsTable.price"),
        align: "left",
        sortKey: "price",
        defaultSortDirection: "desc",
      },
      { label: t("lotsTable.reservedBy"), align: "left" },
      {
        label: t("lotsTable.status"),
        align: "center",
        sortKey: "status",
        defaultSortDirection: "asc",
      },
      { label: t("lotsTable.actions"), align: "center" },
    ],
    [t]
  );

  // Filters for GenericList
  const filters = useMemo(
    () => ({
      search_term: searchTerm,
      status: statusFilter.toLowerCase(),
    }),
    [searchTerm, statusFilter]
  );



  // Render function for GenericList
  const renderLotItem = useCallback(
    (lot, index, isMobileCard) => {
      const isHighlighted = highlightedLotId && lot.id === highlightedLotId;
      return (
        <LotItem
          key={lot.id}
          lot={lot}
          index={index}
          userRole={user?.role}
          isMobileCard={isMobileCard}
          isHighlighted={isHighlighted}
        />
      );
    },
    [user?.role, highlightedLotId]
  );

  // Actions for SearchFilterBar
  const actions = useMemo(() => {
    if (user?.role === "admin") {
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
  }, [user?.role, navigate, projectId, t]);

  return (
    <main className="w-full px-6 pb-6 page-shell xl:px-[48px] xl:pb-[48px] dark:bg-darkblack-700">
      <div className="2xl:flex 2xl:space-x-[48px]">
        <section className="mb-6 2xl:mb-0 2xl:flex-1">
          {/* Search and Filter Bar */}
          <SearchFilterBar
            searchTerm={searchTerm}
            filterValue={statusFilter}
            filterOptions={statusOptions}
            onSearchChange={setSearchTerm}
            onFilterChange={setStatusFilter}
            searchPlaceholder={t("lotsTable.lotFilter")}
            filterPlaceholder={t("lotsTable.status")}
            showFilter={true}
            actions={actions}
          />

          {/* Generic List */}
          <GenericList
            endpoint={`/api/v1/projects/${projectId}/lots`}
            renderItem={renderLotItem}
            filters={filters}
            columns={columns}
            sortBy="updated_at-asc"
            itemsPerPage={20}
            emptyMessage={t("common.noItemsFound")}
            loadingMessage={t("common.loading")}
            entityName="lots"
            showMobileCards={true}
            showDesktopTable={false}
            refreshTrigger={0}
          />
        </section>
      </div>
    </main>
  );
}

export default LotsList;