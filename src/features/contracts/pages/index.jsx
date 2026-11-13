import { useState, useContext, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical, faMagnifyingGlass, faSync } from "@fortawesome/free-solid-svg-icons";

import { useLocale } from "../../../contexts/LocaleContext";
import AuthContext from "../../../contexts/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import useDebounce from "@/hooks/useDebounce";
import { confirmDialog } from "@/shared/ui/ConfirmProvider";
import { contractsApi } from "../api";
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
  Menu,
  Pagination,
  Skeleton,
  Table,
} from "@/shared/ui";

const translateFinancingType = (type, t) => {
  switch (type?.toLowerCase()) {
    case "direct":
      return t("contracts.financingTypes.direct") || "Directo";
    case "cash":
      return t("contracts.financingTypes.cash") || "Contado";
    case "bank":
      return t("contracts.financingTypes.bank") || "Bancario";
    default:
      return "—";
  }
};

const money = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  return `L ${Number(value || 0).toLocaleString("es-HN", {
    maximumFractionDigits: 0,
  })}`;
};

const STATUS_TONES = {
  approved: "success",
  closed: "info",
  rejected: "danger",
  pending: "warning",
  submitted: "info",
  cancelled: "danger",
  canceled: "danger",
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
  const [searchDraft, setSearchDraft] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDateFilters, setShowDateFilters] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

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

  const handleSearchSubmit = useCallback((event) => {
    event.preventDefault();
    setSearchTerm(searchDraft);
    setPage(1);
  }, [searchDraft]);

  const debouncedSearch = useDebounce(searchDraft, 400);

  useEffect(() => {
    setSearchTerm(debouncedSearch);
    setPage(1);
  }, [debouncedSearch]);

  const handleStatusChange = useCallback((value) => {
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

  const handleApprove = useCallback(
    async (contract) => {
      if (!contract.id) return;
      setActionLoading(true);
      try {
        await contractsApi.approve(contract.project_id, contract.lot_id, contract.id);
        showToast(t("contracts.approvedSuccess"), "success");
        refreshContracts();
      } catch (err) {
        showToast(`Error: ${err.message}`, "error");
      } finally {
        setActionLoading(false);
      }
    },
    [refreshContracts, showToast, t]
  );

  const handleReject = useCallback(
    async (reason) => {
      const contract = rejectionContract;
      if (!contract?.id) return;
      setActionLoading(true);
      try {
        await contractsApi.reject(contract.project_id, contract.lot_id, contract.id, reason);
        showToast(t("contracts.rejectedSuccess"), "success");
        setRejectionContract(null);
        refreshContracts();
      } catch (err) {
        showToast(`Error: ${err.message}`, "error");
      } finally {
        setActionLoading(false);
      }
    },
    [rejectionContract, refreshContracts, showToast, t]
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

  const statusChips = useMemo(
    () => [
      { value: "", label: t("common.all"), count: stats.total },
      { value: "approved", label: t("contracts.status.approved"), count: stats.approved },
      { value: "pending", label: t("contracts.status.pending"), count: stats.pending },
      { value: "rejected", label: t("contracts.status.rejected"), count: stats.rejected },
    ],
    [stats, t]
  );

  const hasNextPaymentColumn = useMemo(
    () => contracts.some((contract) => contract.next_payment_date || contract.next_due_date),
    [contracts]
  );

  const columns = useMemo(() => {
    const base = [
      {
        key: "id",
        header: t("contracts.contractId"),
        sortable: true,
        render: (contract) => (
          <span className="font-bold text-ink">#{contract.id}</span>
        ),
      },
      {
        key: "applicant_user_id",
        header: t("contracts.client"),
        sortable: true,
        render: (contract) => (
          <div className="min-w-0">
            <span className="block truncate text-body font-semibold text-ink">
              {contract.applicant_name || "—"}
            </span>
            <span className="block truncate text-micro text-ink-3">
              {contract.applicant_identity || "—"}
            </span>
          </div>
        ),
      },
      {
        key: "lot_id",
        header: t("contracts.lotProject"),
        sortable: true,
        render: (contract) => (
          <div className="min-w-0">
            <span className="block truncate text-body text-ink-2">
              {contract.lot_name || "—"}
            </span>
            <span className="block truncate text-micro text-ink-3">
              {contract.project_name || "—"}
            </span>
          </div>
        ),
      },
      {
        key: "financing_type",
        header: t("contracts.type"),
        sortable: true,
        render: (contract) => (
          <span className="text-body text-ink-2">
            {translateFinancingType(contract.financing_type, t)}
          </span>
        ),
      },
      {
        key: "balance",
        header: t("contracts.balance"),
        align: "right",
        render: (contract) => (
          <span className="text-body font-semibold text-ink">
            {money(Math.abs(Number(contract.balance || 0)))}
          </span>
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
    ];

    if (hasNextPaymentColumn) {
      base.push({
        key: "next_payment_date",
        header: t("contracts.nextPayment"),
        render: (contract) => (
          <span className="text-body text-ink-2">
            {formatDate(contract.next_payment_date || contract.next_due_date)}
          </span>
        ),
      });
    } else {
      base.push({
        key: "contracts.created_at",
        header: t("contracts.created"),
        sortable: true,
        render: (contract) => (
          <span className="text-body text-ink-2">{formatDate(contract.created_at)}</span>
        ),
      });
    }

    base.push({
      key: "actions",
      header: "",
      align: "right",
      render: (contract) => {
        const contractStatus = contract.status?.toLowerCase();
        const items = [
          {
            label: t("common.view"),
            onSelect: () => navigate(`/contracts/${contract.guid}`),
          },
        ];

        if (userRole !== "seller" && ["approved", "closed"].includes(contractStatus)) {
          items.push({
            label: t("contracts.paymentSchedule"),
            onSelect: () => setScheduleContract(contract),
          });
        }
        if (userRole === "admin" && ["pending", "submitted", "rejected"].includes(contractStatus)) {
          items.push({
            label: t("contracts.approve"),
            onSelect: () => handleApprove(contract),
          });
        }
        if (userRole === "admin" && ["pending", "submitted"].includes(contractStatus)) {
          items.push({
            label: t("contracts.reject"),
            onSelect: () => setRejectionContract(contract),
          });
        }
        if (userRole === "admin" && contractStatus === "rejected") {
          items.push({
            label: t("common.delete") || "Eliminar",
            tone: "danger",
            onSelect: () => handleDeleteContract(contract),
          });
        }

        return (
          <div className="flex justify-end" onClick={(event) => event.stopPropagation()}>
            <Menu
              label={t("common.actions")}
              icon={<FontAwesomeIcon icon={faEllipsisVertical} />}
              items={items}
            />
          </div>
        );
      },
    });

    return base;
  }, [
    handleApprove,
    handleDeleteContract,
    hasNextPaymentColumn,
    navigate,
    t,
    userRole,
  ]);

  return (
    <main className="page-shell min-h-screen w-full bg-canvas px-4 pb-8 sm:px-6 xl:px-[48px] xl:pb-[48px]">
      <div className="mx-auto max-w-[1600px] space-y-5">
        <div className="motion-fade-up flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-page font-bold text-ink">
              {t("contracts.title") || "Contratos"}
            </h1>
            <p className="text-body text-ink-3">
              {t("contracts.summaryLine", {
                total: stats.total,
                approved: stats.approved,
                pending: stats.pending,
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={refreshContracts}>
              <FontAwesomeIcon icon={faSync} className="mr-2" />
              {t("common.refresh") || "Actualizar"}
            </Button>
          </div>
        </div>

        <div id="contract-stats" className="motion-fade-up [animation-delay:45ms]">
          <ContractStats stats={stats} />
        </div>

        <div className="motion-fade-up flex flex-col gap-3 [animation-delay:90ms] xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <form
              onSubmit={handleSearchSubmit}
              className="flex h-10 w-full items-center gap-2 rounded-control border border-line bg-surface px-3 sm:w-[300px]"
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} className="text-ink-3" />
              <input
                type="search"
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                placeholder={t("contracts.searchPlaceholder")}
                className="w-full bg-transparent text-label text-ink outline-none placeholder:text-ink-3"
                aria-label={t("contracts.searchPlaceholder")}
              />
            </form>
            <div className="flex flex-wrap items-center gap-1.5">
              {statusChips.map((chip) => {
                const selected = statusFilter === chip.value;
                return (
                  <button
                    key={chip.value || "all"}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => handleStatusChange(chip.value)}
                    className={`h-[30px] rounded-chip px-3 text-label font-semibold transition-colors ${
                      selected
                        ? "bg-brand-soft text-brand-strong"
                        : "border border-line bg-surface text-ink-2 hover:text-ink"
                    }`}
                  >
                    {chip.label} <span className="opacity-70">{chip.count}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-expanded={showDateFilters}
              onClick={() => setShowDateFilters((value) => !value)}
              className={`h-10 rounded-control border px-3 text-label font-semibold transition-colors ${
                showDateFilters || startDate || endDate
                  ? "border-brand/30 bg-brand-soft text-brand-strong"
                  : "border-line bg-surface text-ink-2 hover:bg-surface-2"
              }`}
            >
              {t("common.filter")}
            </button>
            {showDateFilters && (
              <>
            <label className="flex h-10 items-center gap-2 rounded-control border border-line bg-surface px-3 text-label text-ink-3">
              <span className="whitespace-nowrap">{t("common.startDate")}</span>
              <input
                type="date"
                value={startDate}
                onChange={(event) => {
                  setStartDate(event.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-label text-ink outline-none"
              />
            </label>
            <label className="flex h-10 items-center gap-2 rounded-control border border-line bg-surface px-3 text-label text-ink-3">
              <span className="whitespace-nowrap">{t("common.endDate")}</span>
              <input
                type="date"
                value={endDate}
                onChange={(event) => {
                  setEndDate(event.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-label text-ink outline-none"
              />
            </label>
              </>
            )}
          </div>
        </div>

        {error && (
          <ErrorState
            title={t("common.error")}
            description={error}
            onRetry={refreshContracts}
          />
        )}

        <Card className="motion-fade-up [animation-delay:135ms]" bodyClassName="p-0">
          {loading ? (
            <div className="p-5">
              <Skeleton rows={6} />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto px-2 sm:px-[18px]">
                <Table
                  columns={columns}
                  rows={contracts}
                  getRowKey={(contract) => contract.id}
                  sort={sort}
                  onSortChange={handleSortChange}
                  onRowClick={(contract) => navigate(`/contracts/${contract.guid}`)}
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
                      translateFinancingType={translateFinancingType}
                      formatDate={formatDate}
                      handleApprove={(event) => {
                        event?.stopPropagation();
                        handleApprove(contract);
                      }}
                      handleDeleteContract={(event) => {
                        event?.stopPropagation();
                        handleDeleteContract(contract);
                      }}
                      actionLoading={actionLoading}
                      deleteLoading={deleteLoading}
                      setShowSchedule={(open) => open && setScheduleContract(contract)}
                      setShowRejectionModal={(open) => open && setRejectionContract(contract)}
                      setShowDetailsModal={() => navigate(`/contracts/${contract.guid}`)}
                    />
                  )}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-[18px] py-3">
                <p className="text-label text-ink-3">
                  {t("contracts.showingContracts", {
                    count: contracts.length,
                    total,
                  })}
                </p>
                {totalPages > 1 && (
                  <Pagination
                    page={page}
                    pageCount={totalPages}
                    total={total}
                    perPage={PER_PAGE}
                    onPageChange={handlePageChange}
                  />
                )}
              </div>
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
