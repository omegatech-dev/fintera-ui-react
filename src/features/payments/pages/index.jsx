import { useState, useContext, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GenericFilter from "../../../shared/forms/GenericFilter";
import GenericList from "../../../shared/ui/GenericList";
import PaymentItem, { PaymentDetailModal } from "../components/PaymentItem";
import { paymentsApi } from "../api";
import AuthContext from "../../../contexts/AuthContext";
import { useLocale } from "../../../contexts/LocaleContext";


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

function Payments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState({ pending: 0, paidThisMonth: 0, overdue: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const { user } = useContext(AuthContext);
  const { t } = useLocale();


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
        }
      } catch (error) {
        console.error("Error fetching payment stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [refreshTrigger]);

  const statusOptions = useMemo(() => [
    { value: "", label: t('filters.all') },
    { value: "submitted", label: t('payments.statusOptions.submitted') },
    { value: "paid", label: t('payments.statusOptions.paid') },
    { value: "rejected", label: t('payments.statusOptions.rejected') },
    { value: "overdue", label: t('payments.overdue') }
  ], [t]);

  const statusLabel = status ? (statusOptions.find(o => o.value === status)?.label ?? status) : '';

  const columns = useMemo(() => [
    { label: t('payments.description'), align: "left", sortKey: "description" },
    { label: t('payments.applicant'), align: "left", sortKey: "applicant" },
    { label: t('payments.totalAmount'), align: "right", sortKey: "amount", defaultSortDirection: "desc" },
    { label: t('payments.dueDate'), align: "left", sortKey: "due_date", defaultSortDirection: "desc" },
    { label: t('common.status'), align: "left", sortKey: "status" },
    { label: t('common.actions'), align: "left" }
  ], [t]);

  const filters = useMemo(() => {
    const obj = {};
    if (searchTerm) obj.search_term = searchTerm;
    if (status) obj.status = status;
    if (startDate) obj.start_date = startDate;
    if (endDate) obj.end_date = endDate;
    return obj;
  }, [searchTerm, status, startDate, endDate]);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const renderPaymentItem = useCallback((payment, index, isMobileCard) => {
    return (
      <PaymentItem
        paymentInfo={payment}
        index={index}
        userRole={user?.role}
        refreshPayments={handleRefresh}
        onClick={() => {
          setSelectedPayment(payment);
          setShowDetailModal(true);
        }}
        isMobileCard={isMobileCard}
      />
    );
  }, [user?.role, handleRefresh]);

  const formatCurrency = (value) => {
    return `L ${Number(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <main className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] sm:pt-[156px] pt-[100px] bg-bgray-50 dark:bg-darkblack-700 min-h-screen">
      <div className="max-w-[1600px] mx-auto">

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header Stats Section */}
          {/* Version 2.0 Glass Control Center */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                label: t('payments.pendingPaidMonthly'),
                value: stats.pending,
                color: "amber",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
              {
                label: t('payments.totalPaidThisMonth'),
                value: stats.paidThisMonth,
                color: "blue",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
              {
                label: t('payments.overdueTotal'),
                value: stats.overdue,
                color: "rose",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )
              }
            ].map((card, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-darkblack-600 rounded-2xl p-6 shadow-xs border border-gray-100 dark:border-darkblack-500 flex items-center space-x-4"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${card.color}-500 text-white shadow-lg shadow-${card.color}-500/20 text-xl`}>
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

          <motion.div variants={itemVariants} className="mb-8 relative z-20">
            <GenericFilter
              searchTerm={searchTerm}
              filterValue={status}
              filterOptions={statusOptions}
              onSearchChange={setSearchTerm}
              onFilterChange={setStatus}
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              searchPlaceholder={t('filters.searchPlaceholder')}
              filterPlaceholder={t('filters.statusPlaceholder')}
              minSearchLength={2}
            />
          </motion.div>

          {/* List Section */}
          <motion.div variants={itemVariants} layout className="w-full">
            <GenericList
              endpoint="/api/v1/payments"
              renderItem={renderPaymentItem}
              filters={filters}
              columns={columns}
              sortBy="updated_at-desc"
              itemsPerPage={20}
              emptyMessage={t('payments.noPaymentsFound', { searchTerm: searchTerm, status: statusLabel })}
              loadingMessage={t('payments.loadingPayments')}
              entityName="payments"
              refreshTrigger={refreshTrigger}
            />
          </motion.div>

          {/* Payment Detail Modal */}
          <AnimatePresence>
            {showDetailModal && selectedPayment && (
              <PaymentDetailModal
                payment={selectedPayment}
                onClose={() => {
                  setShowDetailModal(false);
                  setSelectedPayment(null);
                }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  );
}

export default Payments;
