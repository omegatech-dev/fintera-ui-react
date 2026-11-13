import { useState, useContext, useMemo, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import useDebounce from "../../../hooks/useDebounce";
import PaymentItem, {
  PaymentDetailModal,
  ApproveModal,
  RejectPaymentModal,
  getPaymentMeta,
} from "../components/PaymentItem";
import { paymentsApi } from "../api";
import AuthContext from "../../../contexts/AuthContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { useToast } from "../../../contexts/ToastContext";
import {
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  Input,
  Pagination,
  SegmentedControl,
  Skeleton,
  Table,
} from "@/shared/ui";

const PER_PAGE = 20;

const formatCurrency = (value) =>
  `L ${Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (dateString) => {
  if (!dateString) return null;
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

function Payments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [approvalPayment, setApprovalPayment] = useState(null);
  const [rejectionPayment, setRejectionPayment] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState({ pending: 0, paidThisMonth: 0, overdue: 0 });
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    submitted: 0,
    overdue: 0,
    paid: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const [payments, setPayments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState({ field: "updated_at", direction: "desc" });

  const { user } = useContext(AuthContext);
  const { t } = useLocale();
  const { showToast } = useToast();
  const userRole = user?.role;

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const data = await paymentsApi.getStats();
        if (data) {
          setStats({
            pending: data.pending_this_month || 0,
            paidThisMonth: data.collected_this_month || 0,
            overdue: data.total_overdue || 0,
          });
          if (data.total_count != null) {
            setStatusCounts({
              all: Number(data.total_count) || 0,
              submitted: Number(data.pending_count) || 0,
              overdue: Number(data.overdue_count) || 0,
              paid: Number(data.paid_count) || 0,
            });
          } else {
            const statuses = ["", "submitted", "overdue", "paid"];
            const results = await Promise.allSettled(
              statuses.map((value) =>
                paymentsApi.list({
                  page: 1,
                  per_page: 1,
                  ...(value ? { status: value } : {}),
                })
              )
            );
            const next = { all: 0, submitted: 0, overdue: 0, paid: 0 };
            statuses.forEach((value, index) => {
              const result = results[index];
              if (result.status === "fulfilled") {
                const pagination = result.value.pagination || {};
                next[value || "all"] = Number(
                  pagination.count || pagination.total || 0
                );
              }
            });
            setStatusCounts(next);
          }
        }
      } catch (err) {
        console.error("Error fetching payment stats:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [refreshTrigger]);

  useEffect(() => {
    setSearchTerm(debouncedSearch.length >= 3 ? debouncedSearch : "");
    setPage(1);
  }, [debouncedSearch]);

  const filters = useMemo(() => {
    const obj = {};
    if (searchTerm) obj.search_term = searchTerm;
    if (status) obj.status = status;
    if (startDate) obj.start_date = startDate;
    if (endDate) obj.end_date = endDate;
    return obj;
  }, [searchTerm, status, startDate, endDate]);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await paymentsApi.list({
        ...filters,
        page,
        per_page: PER_PAGE,
        sort: `${sort.field}-${sort.direction}`,
      });
      setPayments(data.payments || []);
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
    fetchPayments();
  }, [fetchPayments, refreshTrigger]);

  const handleFilterChange = useCallback(
    (value) => {
      setStatus(value);
      setPage(1);
      const next = new URLSearchParams(searchParams);
      if (value) next.set("status", value);
      else next.delete("status");
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
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

  const handleRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const columns = useMemo(
    () => [
      {
        key: "description",
        header: t("payments.description"),
        sortable: true,
        render: (payment) => (
          <div className="min-w-0">
            <p className="truncate text-body font-semibold text-ink">
              {payment.description}
            </p>
            <p className="truncate text-micro text-ink-3">
              {payment.project_name || payment.contract?.lot?.project?.name
                ? `${payment.project_name || payment.contract?.lot?.project?.name} · `
                : ""}
              {payment.lot_name || payment.contract?.lot?.name || "—"}
            </p>
          </div>
        ),
      },
      {
        key: "applicant",
        header: t("payments.applicant"),
        sortable: true,
        render: (payment) => (
          <div className="min-w-0">
            <p className="truncate text-body text-ink">
              {payment.applicant_name ||
                payment.contract?.applicant_user?.full_name ||
                "-"}
            </p>
          </div>
        ),
      },
      {
        key: "amount",
        header: t("payments.totalAmount"),
        sortable: true,
        align: "right",
        render: (payment) => {
          const meta = getPaymentMeta(payment, t);
          return (
            <div className="text-right">
              <p
                className={`text-body-lg font-bold ${
                  meta.isOverdue ? "text-danger-strong" : "text-ink"
                }`}
              >
                {formatCurrency(meta.totalAmount)}
              </p>
              {Number(payment.interest_amount) > 0 && (
                <p className="text-micro text-danger-strong">
                  +{formatCurrency(payment.interest_amount)} {t("payments.accrued")}
                </p>
              )}
              {meta.isOverpayment && (
                <p className="text-micro text-info">
                  +{formatCurrency(meta.overpaymentAmount)}{" "}
                  {t("payments.overpayment")}
                </p>
              )}
            </div>
          );
        },
      },
      {
        key: "due_date",
        header: t("payments.dueDate"),
        sortable: true,
        render: (payment) => {
          const meta = getPaymentMeta(payment, t);
          return (
            <div>
              <p
                className={`text-body ${
                  meta.isOverdue ? "font-semibold text-danger-strong" : "text-ink-2"
                }`}
              >
                {formatDate(payment.due_date)}
              </p>
              {meta.isOverdue && (
                <p className="text-micro text-danger-strong">
                  {t("payments.pastDue")}
                </p>
              )}
            </div>
          );
        },
      },
      {
        key: "status",
        header: t("common.status"),
        sortable: true,
        render: (payment) => {
          const meta = getPaymentMeta(payment, t);
          return <Chip tone={meta.config.tone}>{meta.label}</Chip>;
        },
      },
      {
        key: "actions",
        header: "",
        align: "right",
        render: (payment) => {
          const meta = getPaymentMeta(payment, t);
          return (
            <div className="flex flex-wrap items-center justify-end gap-2">
              {meta.statusLower === "submitted" && userRole === "admin" && (
                <>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={meta.approvalBlocked}
                    title={
                      meta.approvalBlocked
                        ? t("payments.reservationRequiresContract")
                        : undefined
                    }
                    onClick={() => setApprovalPayment(payment)}
                  >
                    {t("payments.approve")}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setRejectionPayment(payment)}
                  >
                    {t("payments.reject")}
                  </Button>
                </>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelectedPayment(payment);
                  setShowDetailModal(true);
                }}
              >
                {t("common.view")}
              </Button>
            </div>
          );
        },
      },
    ],
    [t, userRole]
  );

  // Approval state is edited inside ApproveModal; keep it page-level so the
  // table cells stay stateless.
  const approvalMeta = approvalPayment
    ? getPaymentMeta(approvalPayment, t)
    : null;
  const [editAmount, setEditAmount] = useState(null);
  const [editInterest, setEditInterest] = useState(null);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [rejectionLoading, setRejectionLoading] = useState(false);

  useEffect(() => {
    if (approvalPayment) {
      setEditAmount(approvalPayment.amount);
      setEditInterest(approvalPayment.interest_amount || 0);
    }
  }, [approvalPayment]);

  const handleApprove = async (fileToUpload = null) => {
    if (!approvalPayment) return;
    const paidTotal = (Number(editAmount) || 0) + (Number(editInterest) || 0);
    setApprovalLoading(true);
    try {
      if (fileToUpload) {
        const formData = new FormData();
        formData.append("receipt", fileToUpload);
        await paymentsApi.uploadReceipt(approvalPayment.id, formData);
      }
      await paymentsApi.approve(approvalPayment.id, { paid_amount: paidTotal });
      showToast(t("payments.approveSuccess"), "success");
      setApprovalPayment(null);
      handleRefresh();
    } catch (err) {
      showToast(err.message || t("payments.approveError"), "error");
    } finally {
      setApprovalLoading(false);
    }
  };

  const handleReject = async (reason) => {
    if (!rejectionPayment) return;
    setRejectionLoading(true);
    try {
      await paymentsApi.reject(
        rejectionPayment.id,
        reason?.trim() ? { reason: reason.trim() } : {}
      );
      showToast(t("payments.rejectSuccess"), "success");
      setRejectionPayment(null);
      handleRefresh();
    } catch (err) {
      showToast(err.message || t("payments.rejectError"), "error");
    } finally {
      setRejectionLoading(false);
    }
  };

  const handleDownloadReceipt = useCallback(
    async (payment) => {
      try {
        const blob = await paymentsApi.downloadReceipt(payment.id);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `receipt-${payment.id}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        showToast(err.message || t("payments.downloadReceiptError"), "error");
      }
    },
    [showToast, t]
  );

  return (
    <main className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] page-shell bg-bgray-50 dark:bg-darkblack-700 min-h-screen">
      <div className="max-w-[1600px] mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                label: t("payments.pendingPaidMonthly"),
                value: stats.pending,
                color: "amber",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                label: t("payments.totalPaidThisMonth"),
                value: stats.paidThisMonth,
                color: "blue",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                label: t("payments.overdueTotal"),
                value: stats.overdue,
                color: "rose",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                ),
              },
            ].map((card, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-white dark:bg-darkblack-600 rounded-2xl p-6 shadow-xs border border-gray-100 dark:border-darkblack-500 flex items-center space-x-4"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${card.color}-500 text-white shadow-lg text-xl`}>
                  {card.icon}
                </div>
                <div>
                  <p className="text-bgray-500 dark:text-bgray-400 text-sm font-medium">{card.label}</p>
                  <h3 className="text-2xl font-bold text-bgray-900 dark:text-white leading-none mt-1">
                    {loadingStats ? "..." : formatCurrency(card.value)}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div variants={itemVariants} className="space-y-4">
            <SegmentedControl
              value={status}
              onChange={handleFilterChange}
              options={[
                { value: "", label: `${t("payments.tabs.all")} ${statusCounts.all}` },
                {
                  value: "submitted",
                  label: `${t("payments.tabs.pending")} ${statusCounts.submitted}`,
                },
                {
                  value: "overdue",
                  label: `${t("payments.tabs.overdue")} ${statusCounts.overdue}`,
                },
                {
                  value: "paid",
                  label: `${t("payments.tabs.approved")} ${statusCounts.paid}`,
                },
              ]}
            />

            <div className="flex flex-wrap items-center gap-3">
              <Input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={t("filters.searchPlaceholder")}
                className="w-full sm:w-72"
              />
              <Input
                type="date"
                value={startDate}
                onChange={(event) => {
                  setStartDate(event.target.value);
                  setPage(1);
                }}
                aria-label={t("filters.startDate") || "Start date"}
                className="w-full sm:w-44"
              />
              <Input
                type="date"
                value={endDate}
                onChange={(event) => {
                  setEndDate(event.target.value);
                  setPage(1);
                }}
                aria-label={t("filters.endDate") || "End date"}
                className="w-full sm:w-44"
              />
            </div>
          </motion.div>

          {error && (
            <ErrorState
              title={t("common.error")}
              description={error}
              onRetry={handleRefresh}
            />
          )}

          {/* List Section */}
          <motion.div variants={itemVariants} layout className="w-full">
            <Card bodyClassName="p-0">
              {loading ? (
                <div className="p-5">
                  <Skeleton rows={8} />
                </div>
              ) : (
                <>
                  <Table
                    columns={columns}
                    rows={payments}
                    getRowKey={(payment) => payment.id}
                    sort={sort}
                    onSortChange={handleSortChange}
                    empty={
                      <div className="p-5">
                        <EmptyState
                          variant="no-results"
                          title={t("payments.noPaymentsFound", {
                            searchTerm,
                            status,
                          })}
                          description={t("common.tryAdjustingFilters")}
                        />
                      </div>
                    }
                    mobileCard={(payment) => (
                      <PaymentItem
                        paymentInfo={payment}
                        userRole={userRole}
                        refreshPayments={handleRefresh}
                        isMobileCard
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowDetailModal(true);
                        }}
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
          </motion.div>

          {/* Payment Detail Modal */}
          {showDetailModal && selectedPayment && (
            <PaymentDetailModal
              payment={selectedPayment}
              onClose={() => {
                setShowDetailModal(false);
                setSelectedPayment(null);
              }}
            />
          )}

          {/* Admin approve / reject modals */}
          {approvalPayment && approvalMeta && (
            <ApproveModal
              paymentInfo={approvalPayment}
              onClose={() => setApprovalPayment(null)}
              handleApprove={handleApprove}
              approveLoading={approvalLoading}
              approvalResult={null}
              editAmount={editAmount}
              setEditAmount={setEditAmount}
              editInterest={editInterest}
              setEditInterest={setEditInterest}
              t={t}
              hasReceipt={approvalMeta.hasReceipt}
              handleDownloadReceipt={() => handleDownloadReceipt(approvalPayment)}
            />
          )}
          {rejectionPayment && (
            <RejectPaymentModal
              paymentInfo={rejectionPayment}
              onClose={() => setRejectionPayment(null)}
              handleReject={handleReject}
              rejectLoading={rejectionLoading}
              rejectResult={null}
              t={t}
            />
          )}
        </motion.div>
      </div>
    </main>
  );
}

export default Payments;
