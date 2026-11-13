import { useState, useContext, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync } from "@fortawesome/free-solid-svg-icons";

import { useLocale } from "../../../contexts/LocaleContext";
import AuthContext from "../../../contexts/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import { confirmDialog } from "@/shared/ui/ConfirmProvider";
import GenericFilter from "../../../shared/forms/GenericFilter";
import { contractsApi } from "../api";
import { getStatusTheme } from "../../../shared/utils/statusUtils";
import { formatStatus } from "../../../shared/utils/formatStatus";
import { formatDate } from "../../../shared/utils/formatters";
import ContractStats from "../components/ContractStats";
import ContractMobileCard from "../components/ContractItem/ContractMobileCard";
import PaymentScheduleModal from "../components/PaymentScheduleModal";
import RejectionModal from "../components/RejectionModal";
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

const translateFinancingType = (type, t) => {
  switch (type?.toLowerCase()) {
    case "direct":
      return t("contracts.financingTypes.direct") || "Directo";
    case "cash":
      return "Contado";
    case "bank":
      return t("contracts.financingTypes.bank") || "Bancario";
    default:
      return "N/A";
  }
};

const STATUS_TONES = {
  approved: "success",
  closed: "info",
  rejected: "danger",
  pending: "warning",
  submitted: "info",
};

const PER_PAGE = 12;

function Contract() {
  const { user } = useContext(AuthContext);
  const { t } = useLocale();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const userRole = user?.role;

  const [contracts, setContracts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState({
    field: "contracts.created_at",
    direction: "desc",
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  // Row-level modal state lifted from ContractItem
  const [scheduleContract, setScheduleContract] = useState(null);
  const [rejectionContract, setRejectionContract] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const filters = useMemo(() => {
    const obj = {};
    const trimmedTerm = searchTerm.trim();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (trimmedTerm) {
      if (uuidRegex.test(trimmedTerm)) {
        obj.guid = trimmedTerm;
      } else {
        obj.search_term = trimmedTerm;
      }
    }
    if (statusFilter) obj.status = statusFilter;
    if (startDate) obj.start_date = startDate;
    if (endDate) obj.end_date = endDate;
    return obj;
  }, [searchTerm, statusFilter, startDate, endDate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await contractsApi.getStats();
        if (data) {
          setStats({
            total: data.total,
            pending: data.pending,
            approved: data.approved,
            rejected: data.rejected,
          });
        }
      } catch (err) {
        console.error("Error fetching contract stats:", err);
      }
    };
    fetchStats();
  }, [refreshTrigger]);

  const refreshContracts = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        ...filters,
        page,
        per_page: PER_PAGE,
        sort: `${sort.field}-${sort.direction}`,
      };
      const data = await contractsApi.list(params);
      setContracts(data.contracts || []);
      const pagination = data.pagination || {};
      setTotalPages(Math.max(1, parseInt(pagination.pages || 1, 10)));
      setTotal(parseInt(pagination.count || pagination.total || 0, 10));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, page, sort]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts, refreshTrigger]);

  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((value) => {
    setStatusFilter(value);
    setPage(1);
  }, []);

  const statusOptions = useMemo(
    () => [
      { value: "", label: t("contracts.allStatuses") },
      { value: "pending", label: t("contracts.status.pending") },
      { value: "approved", label: t("contracts.status.approved") },
      { value: "rejected", label: t("contracts.status.rejected") },
      { value: "closed", label: t("contracts.status.closed") },
    ],
    [t]
  );

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

  const handleNavigateToLot = useCallback(
    (contract) => {
      if (contract.project_id) {
        navigate(`/projects/${contract.project_id}/lots`, {
          state: {
            selectedLotId: contract.lot_id,
            selectedLotName: contract.lot_name,
            selectedLotAddress: contract.lot_address,
          },
        });
      }
    },
    [navigate]
  );

  const handleNavigateToClient = useCallback(
    (contract) => {
      navigate("/users", {
        state: {
          selectedUserId: contract.applicant_identity,
          selectedUserName: contract.applicant_name,
          selectedUserPhone: contract.applicant_phone,
        },
      });
    },
    [navigate]
  );

  const handleApprove = useCallback(
    async (contract) => {
      if (!contract.id) return;
      setActionLoading(true);
      try {
        await contractsApi.approve(contract.project_id, contract.lot_id, contract.id);
        showToast("Contrato aprobado exitosamente.", "success");
        refreshContracts();
      } catch (err) {
        showToast(`Error: ${err.message}`, "error");
      } finally {
        setActionLoading(false);
      }
    },
    [refreshContracts, showToast]
  );

  const handleReject = useCallback(
    async (reason) => {
      const contract = rejectionContract;
      if (!contract?.id) return;
      setActionLoading(true);
      try {
        await contractsApi.reject(contract.project_id, contract.lot_id, contract.id, reason);
        showToast("Contrato rechazado exitosamente.", "success");
        setRejectionContract(null);
        refreshContracts();
      } catch (err) {
        showToast(`Error: ${err.message}`, "error");
      } finally {
        setActionLoading(false);
      }
    },
    [rejectionContract, refreshContracts, showToast]
  );

  const handleDeleteContract = useCallback(
    async (contract) => {
      if (!contract?.id) return;
      const confirmed = await confirmDialog({
        title: t("contractDetailsModal.deleteConfirm"),
        confirmLabel: t("common.delete") || "Eliminar",
      });
      if (!confirmed) return;
      setDeleteLoading(true);
      try {
        const data = await contractsApi.delete(contract.project_id, contract.lot_id, contract.id);
        showToast(data.message || t("contractDetailsModal.deletedSuccess"), "success");
        refreshContracts();
      } catch (err) {
        showToast(err.message, "error");
      } finally {
        setDeleteLoading(false);
      }
    },
    [refreshContracts, showToast, t]
  );

  const columns = useMemo(
    () => [
      {
        key: "lot_id",
        header: t("contracts.lot"),
        sortable: true,
        render: (contract) => (
          <button
            type="button"
            onClick={() => handleNavigateToLot(contract)}
            className="text-left"
          >
            <span className="block truncate text-body font-semibold text-ink">
              {contract.lot_name || "N/A"}
            </span>
            <span className="block truncate text-micro text-ink-3">
              {contract.project_name || "—"}
            </span>
          </button>
        ),
      },
      {
        key: "applicant_user_id",
        header: t("contracts.client"),
        sortable: true,
        render: (contract) => (
          <button
            type="button"
            onClick={() => handleNavigateToClient(contract)}
            className="text-left"
          >
            <span className="block truncate text-body text-ink">
              {contract.applicant_name || "N/A"}
            </span>
            <span className="block truncate text-micro text-ink-3">
              {contract.applicant_identity || "—"}
            </span>
          </button>
        ),
      },
      {
        key: "financing_type",
        header: t("contracts.financing"),
        sortable: true,
        render: (contract) => (
          <Chip>{translateFinancingType(contract.financing_type, t)}</Chip>
        ),
      },
      {
        key: "status",
        header: t("common.status"),
        sortable: true,
        render: (contract) => (
          <Chip tone={STATUS_TONES[contract.status?.toLowerCase()] || "neutral"}>
            {formatStatus(contract.status?.toLowerCase(), t)}
          </Chip>
        ),
      },
      {
        key: "contracts.created_at",
        header: t("contracts.created"),
        sortable: true,
        align: "right",
        render: (contract) => (
          <span className="text-body text-ink-2">
            {formatDate(contract.created_at)}
          </span>
        ),
      },
      {
        key: "created_by",
        header: t("contracts.createdBy"),
        align: "right",
        render: (contract) => contract.created_by || "—",
      },
      {
        key: "actions",
        header: "",
        align: "right",
        render: (contract) => {
          const contractStatus = contract.status?.toLowerCase();
          return (
            <div className="flex items-center justify-end gap-2">
              {userRole === "admin" &&
                ["pending", "submitted", "rejected"].includes(contractStatus) && (
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={actionLoading}
                    onClick={() => handleApprove(contract)}
                  >
                    {t("contracts.approve")}
                  </Button>
                )}
              {userRole === "admin" &&
                ["pending", "submitted"].includes(contractStatus) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setRejectionContract(contract)}
                  >
                    {t("contracts.reject")}
                  </Button>
                )}
              {userRole === "admin" && contractStatus === "rejected" && (
                <Button
                  size="sm"
                  variant="ghost"
                  loading={deleteLoading}
                  onClick={() => handleDeleteContract(contract)}
                >
                  {t("common.delete") || "Eliminar"}
                </Button>
              )}
              {userRole !== "seller" &&
                ["approved", "closed"].includes(contractStatus) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setScheduleContract(contract)}
                  >
                    {t("contracts.paymentSchedule")}
                  </Button>
                )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate(`/contracts/${contract.guid}`)}
                title={t("common.view")}
              >
                {t("common.view")}
              </Button>
            </div>
          );
        },
      },
    ],
    [
      actionLoading,
      deleteLoading,
      handleApprove,
      handleDeleteContract,
      handleNavigateToClient,
      handleNavigateToLot,
      navigate,
      t,
      userRole,
    ]
  );

  return (
    <main className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] page-shell dark:bg-darkblack-700 min-h-screen">
      <div className="max-w-[1600px] mx-auto space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-page font-bold text-ink">
              {t("contracts.title") || "Contratos"}
            </h1>
            <p className="text-body text-ink-3">
              {t("contracts.subtitle") || "Financiamientos y reservas por cliente."}
            </p>
          </div>
          <Button variant="secondary" onClick={refreshContracts}>
            <FontAwesomeIcon icon={faSync} className="mr-2" />
            {t("common.refresh") || "Actualizar"}
          </Button>
        </div>

        <div id="contract-stats">
          <ContractStats stats={stats} />
        </div>

        <Card bodyClassName="p-5">
          <GenericFilter
            searchTerm={searchTerm}
            filterValue={statusFilter}
            filterOptions={statusOptions}
            onSearchChange={handleSearchChange}
            onFilterChange={handleFilterChange}
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            searchPlaceholder={t("contracts.searchPlaceholder")}
            filterPlaceholder={t("contracts.filterByStatus")}
            minSearchLength={3}
          />
        </Card>

        {error && (
          <ErrorState
            title={t("common.error")}
            description={error}
            onRetry={refreshContracts}
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
                rows={contracts}
                getRowKey={(contract) => contract.id}
                sort={sort}
                onSortChange={handleSortChange}
                empty={
                  <div className="p-5">
                    <EmptyState
                      variant="no-results"
                      title={t("contracts.noContractsFound")}
                      description={t("common.tryAdjustingFilters")}
                    />
                  </div>
                }
                mobileCard={(contract) => (
                  <ContractMobileCard
                    contract={contract}
                    userRole={userRole}
                    refreshContracts={refreshContracts}
                    t={t}
                    getStatusTheme={getStatusTheme}
                    translateFinancingType={translateFinancingType}
                    formatDate={formatDate}
                    handleNavigateToLot={(e) => {
                      e?.stopPropagation();
                      handleNavigateToLot(contract);
                    }}
                    handleNavigateToClient={(e) => {
                      e?.stopPropagation();
                      handleNavigateToClient(contract);
                    }}
                    handleApprove={(e) => {
                      e?.stopPropagation();
                      handleApprove(contract);
                    }}
                    handleReject={handleReject}
                    handleDeleteContract={(e) => {
                      e?.stopPropagation();
                      handleDeleteContract(contract);
                    }}
                    actionLoading={actionLoading}
                    deleteLoading={deleteLoading}
                    showSchedule={false}
                    setShowSchedule={(open) =>
                      open && setScheduleContract(contract)
                    }
                    showRejectionModal={false}
                    setShowRejectionModal={(open) =>
                      open && setRejectionContract(contract)
                    }
                    showDetailsModal={false}
                    setShowDetailsModal={() =>
                      navigate(`/contracts/${contract.guid}`)
                    }
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

        {scheduleContract && (
          <PaymentScheduleModal
            contract={scheduleContract}
            open={!!scheduleContract}
            onClose={() => setScheduleContract(null)}
            onPaymentSuccess={refreshContracts}
          />
        )}

        <RejectionModal
          isOpen={!!rejectionContract}
          onClose={() => setRejectionContract(null)}
          onSubmit={handleReject}
          loading={actionLoading}
        />
      </div>
    </main>
  );
}

export default Contract;
