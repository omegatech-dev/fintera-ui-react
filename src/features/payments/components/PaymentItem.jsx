import { useState, useRef, memo, useEffect } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { format, parseISO, isBefore, startOfDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { paymentsApi } from "../api";
import { formatStatus } from "../../../shared/utils/formatStatus";
import { useLocale } from "../../../contexts/LocaleContext";
import { useToast } from "../../../contexts/ToastContext";
import { getDefaultCurrency } from "../../../shared/utils/formatSettings";
import { reservationApprovalBlocked } from "../utils/approval";

function PaymentItem({ paymentInfo, userRole, refreshPayments, onClick, isMobileCard = false }) {
  const { t } = useLocale();
  const { showToast } = useToast();

  // Modal State
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [editAmount, setEditAmount] = useState(paymentInfo.amount);
  const [editInterest, setEditInterest] = useState(paymentInfo.interest_amount || 0);
  const [approvalResult, setApprovalResult] = useState(null);
  const [rejectResult, setRejectResult] = useState(null);

  const hasReceipt = Boolean(paymentInfo.has_receipt || paymentInfo.document_url);

  const formatCurrency = (value, currency = getDefaultCurrency()) => {
    if (value === null || value === undefined) return "—";
    return `${currency} ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('common.notAvailable');
    try {
      return format(parseISO(dateString), "dd MMM, yyyy");
    } catch {
      return dateString;
    }
  };

  const maskIdentity = (identity) => {
    if (!identity) return "N/A";
    const str = String(identity);
    return str.length <= 8 ? str : `${str.slice(0, 4)}••••${str.slice(-4)}`;
  };

  const isOverdue = paymentInfo.due_date && !paymentInfo.payment_date
    ? isBefore(parseISO(paymentInfo.due_date), startOfDay(new Date()))
    : false;

  const totalAmount = Number(paymentInfo.amount || 0) + Number(paymentInfo.interest_amount || 0);
  const statusLower = (paymentInfo.status || "").toLowerCase();
  const approvalBlocked = reservationApprovalBlocked(paymentInfo);
  const paidAmount = Number(paymentInfo.paid_amount ?? 0);
  const isOverpayment = statusLower === "paid" && paidAmount > totalAmount && totalAmount > 0;
  const overpaymentAmount = isOverpayment ? paidAmount - totalAmount : 0;

  const getStatusConfig = () => {
    switch (statusLower) {
      case "paid":
        return {
          bg: "bg-blue-500/10",
          text: "text-blue-600 dark:text-blue-400",
          dot: "bg-blue-500",
          border: "border-blue-500/20"
        };
      case "submitted":
        return {
          bg: "bg-amber-500/10",
          text: "text-amber-600 dark:text-amber-400",
          dot: "bg-amber-500",
          border: "border-amber-500/20"
        };
      case "rejected":
        return {
          bg: "bg-rose-500/10",
          text: "text-rose-600 dark:text-rose-400",
          dot: "bg-rose-500",
          border: "border-rose-500/20"
        };
      default:
        if (isOverdue) return { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400", dot: "bg-rose-500", border: "border-rose-500/20" };
        return { bg: "bg-slate-500/10", text: "text-slate-600 dark:text-slate-400", dot: "bg-slate-400", border: "border-slate-500/20" };
    }
  };

  const statusConfig = getStatusConfig();
  const statusLabel = statusLower === "submitted"
    ? t('payments.statusOptions.submitted')
    : statusLower === "paid"
      ? t('payments.statusOptions.paid')
      : statusLower === "rejected"
        ? t('payments.statusOptions.rejected')
        : formatStatus(paymentInfo.status, t);

  const handleApprove = async (fileToUpload = null) => {
    if (reservationApprovalBlocked(paymentInfo)) {
      setApprovalResult({ type: 'error', message: t('payments.reservationRequiresContract') });
      return;
    }
    setApproveLoading(true);
    setApprovalResult(null);
    try {
      // Step 1: Upload File if exists
      if (fileToUpload) {
        const formData = new FormData();
        formData.append('receipt', fileToUpload);

        await paymentsApi.uploadReceipt(paymentInfo.id, formData);
      }

      // Step 2: Approve Payment — only send paid_amount (amount admin confirms). Payment's amount/interest stay as defined; editing in the modal changes only what we record as paid.
      const paidAmount = (Number(editAmount) || 0) + (Number(editInterest) || 0);

      const data = await paymentsApi.approve(paymentInfo.id, { paid_amount: paidAmount });

      if (data) {
        setApprovalResult({ type: 'success', message: t('payments.approveSuccess') });
        setTimeout(() => {
          if (typeof refreshPayments === "function") refreshPayments();
          setShowApproveModal(false);
          setApprovalResult(null);
        }, 1500);
      }
    } catch (err) {
      setApprovalResult({ type: 'error', message: err.message || t('payments.approveError') });
    } finally {
      setApproveLoading(false);
    }
  };

  const handleReject = async (reason) => {
    setRejectLoading(true);
    setRejectResult(null);
    try {
      const body = reason?.trim() ? { reason: reason.trim() } : {};

      const data = await paymentsApi.reject(paymentInfo.id, body);

      if (data) {
        setRejectResult({ type: 'success', message: t('payments.rejectSuccess') });
        setTimeout(() => {
          if (typeof refreshPayments === "function") refreshPayments();
          setShowRejectModal(false);
          setRejectResult(null);
        }, 1500);
      }
    } catch (err) {
      setRejectResult({ type: 'error', message: err.message || t('payments.rejectError') });
    } finally {
      setRejectLoading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      const blob = await paymentsApi.downloadReceipt(paymentInfo.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${paymentInfo.id}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showToast(`${error.message || t('payments.downloadReceiptError')}`, "error");
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", damping: 15, stiffness: 100 } }
  };

  // --- VERSION 2.0 MOBILE VIEW ---
  if (isMobileCard) {
    return (
      <motion.div
        layout
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ y: -4, shadow: "0 10px 25px rgba(0,0,0,0.05)" }}
        onClick={onClick}
        className="relative group bg-white dark:bg-darkblack-600 rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-xs overflow-hidden cursor-pointer"
      >

        <div className="space-y-6 relative z-10">
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} animate-pulse`} />
                {statusLabel}
              </div>
              {isOverpayment && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {t('payments.overpayment')}
                </span>
              )}
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{t('payments.dueDate')}</span>
              <span className={`text-[11px] font-black ${isOverdue ? 'text-rose-500' : 'text-slate-600 dark:text-slate-300'}`}>{formatDate(paymentInfo.due_date)}</span>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
              {paymentInfo.description} <span className="text-blue-500 font-normal">.</span>
            </h4>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="text-[10px] font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-tight">
                {paymentInfo.project_name || paymentInfo.contract?.lot?.project?.name || ""}
              </span>
              <span className="text-[10px] font-black bg-slate-900 dark:bg-darkblack-400 text-white px-2.5 py-1 rounded-lg uppercase tracking-tighter">
                {paymentInfo.lot_name || paymentInfo.contract?.lot?.name || "N/A"}
              </span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-white/10" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{paymentInfo.applicant_name || paymentInfo.contract?.applicant_user?.full_name || "-"}</span>
              </div>
            </div>
          </div>

          <div className="flex items-end justify-between pt-6 border-t border-slate-50 dark:border-white/5">
            <div>
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('payments.totalAmount')}</span>
              <div className="flex flex-col gap-0.5">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(totalAmount, paymentInfo.contract?.currency)}
                </span>
                {isOverpayment && (
                  <>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">+{formatCurrency(overpaymentAmount)} {t('payments.overpayment')}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{t('payments.totalPaid')}: {formatCurrency(paidAmount, paymentInfo.contract?.currency)}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {statusLower === "submitted" && userRole === "admin" && (
                <>
                  <motion.button
                    whileHover={approvalBlocked ? undefined : { scale: 1.05 }}
                    whileTap={approvalBlocked ? undefined : { scale: 0.95 }}
                    onClick={(e) => { e.stopPropagation(); if (approvalBlocked) return; setShowApproveModal(true); }}
                    disabled={approvalBlocked}
                    aria-disabled={approvalBlocked}
                    title={approvalBlocked ? t('payments.reservationRequiresContract') : undefined}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-xs transition-all flex items-center justify-center ${approvalBlocked ? "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed" : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800"}`}
                  >
                    {t('payments.approve')}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => { e.stopPropagation(); setShowRejectModal(true); }}
                    className="px-6 py-2.5 bg-rose-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-xs hover:bg-rose-600 transition-all flex items-center justify-center"
                  >
                    {t('payments.reject')}
                  </motion.button>
                  {approvalBlocked && (
                    <p className="w-full text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                      {t('payments.reservationRequiresContract')}
                    </p>
                  )}
                </>
              )}
              {statusLower === "paid" && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => { e.stopPropagation(); hasReceipt && handleDownloadReceipt(); }}
                  disabled={!hasReceipt}
                  className={`p-4 rounded-[22px] transition-all flex items-center justify-center ${hasReceipt ? "bg-white dark:bg-darkblack-500 text-blue-600 shadow-xl border border-slate-100 dark:border-white/5" : "bg-slate-50 text-slate-200 dark:bg-darkblack-500/50"}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {showApproveModal && <ApproveModal
          paymentInfo={paymentInfo} onClose={() => setShowApproveModal(false)}
          handleApprove={handleApprove} approveLoading={approveLoading} approvalResult={approvalResult}
          editAmount={editAmount} setEditAmount={setEditAmount} editInterest={editInterest} setEditInterest={setEditInterest}
          t={t} hasReceipt={hasReceipt} handleDownloadReceipt={handleDownloadReceipt}
        />}
        {showRejectModal && <RejectPaymentModal
          paymentInfo={paymentInfo} onClose={() => setShowRejectModal(false)}
          handleReject={handleReject} rejectLoading={rejectLoading} rejectResult={rejectResult}
          t={t}
        />}
      </motion.div>
    );
  }

  // --- VERSION 2.0 DESKTOP VIEW ---
  return (
    <motion.tr
      layout
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="group border-b border-slate-100/50 dark:border-white/5 last:border-0 hover:bg-slate-50/40 dark:hover:bg-white/[0.02] transition-colors duration-400 cursor-pointer"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-5">
          <div className="relative w-10 h-10 rounded-xl bg-white dark:bg-darkblack-500 shadow-xs border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:border-blue-500/20 transition-all duration-500 overflow-hidden">
            <svg className="w-5 h-5 z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white mb-0.5 truncate">{paymentInfo.description}</p>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold tracking-wider text-blue-500 uppercase opacity-40">PROPERTY</span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">
                {paymentInfo.project_name || paymentInfo.contract?.lot?.project?.name ? `${paymentInfo.project_name || paymentInfo.contract?.lot?.project?.name} - ` : ""}
                {paymentInfo.lot_name || paymentInfo.contract?.lot?.name || "-"}
              </span>
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{paymentInfo.applicant_name || paymentInfo.contract?.applicant_user?.full_name || "-"}</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 opacity-60 mt-0.5">{maskIdentity(paymentInfo.applicant_identity || paymentInfo.contract?.applicant_user?.identity)}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5">
            <span className={`text-xl font-bold ${isOverdue ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"}`}>
              {formatCurrency(totalAmount, paymentInfo.contract?.currency)}
            </span>
          </div>
          {paymentInfo.interest_amount > 0 && <span className="text-[9px] font-bold text-rose-600 mt-0.5">+{formatCurrency(paymentInfo.interest_amount)} {t('payments.accrued')}</span>}
          {isOverpayment && (
            <div className="mt-1.5 space-y-0.5 text-right">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase block">+{formatCurrency(overpaymentAmount)} {t('payments.overpayment')}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t('payments.totalPaid')}: {formatCurrency(paidAmount, paymentInfo.contract?.currency)}</span>
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className={`text-[13px] font-bold ${isOverdue ? "text-rose-600" : "text-slate-900 dark:text-slate-300"}`}>{formatDate(paymentInfo.due_date)}</span>
          {isOverdue && <span className="text-[9px] font-bold text-rose-600 tracking-wider mt-1">{t('payments.pastDue')}</span>}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col gap-1.5">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} shadow-xs shadow-black/5`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-2 ${statusConfig.dot} animate-pulse`} />
            {statusLabel}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap justify-end gap-3 transition-opacity duration-300">
          {statusLower === "submitted" && userRole === "admin" && (
            <>
              <motion.button
                whileHover={approvalBlocked ? undefined : { scale: 1.05 }}
                whileTap={approvalBlocked ? undefined : { scale: 0.95 }}
                onClick={(e) => { e.stopPropagation(); if (approvalBlocked) return; setShowApproveModal(true); }}
                disabled={approvalBlocked}
                aria-disabled={approvalBlocked}
                title={approvalBlocked ? t('payments.reservationRequiresContract') : undefined}
                className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-md transition-all ${approvalBlocked ? "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed" : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-95"}`}
              >
                {t('payments.approve')}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => { e.stopPropagation(); setShowRejectModal(true); }}
                className="px-5 py-2 bg-rose-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-md hover:bg-rose-600 active:scale-95 transition-all"
              >
                {t('payments.reject')}
              </motion.button>
              {approvalBlocked && (
                <p className="w-full text-right text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                  {t('payments.reservationRequiresContract')}
                </p>
              )}
            </>
          )}
          {statusLower === "paid" && (
            <motion.button
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); hasReceipt && handleDownloadReceipt(); }}
              disabled={!hasReceipt}
              className={`p-3 rounded-2xl transition-all ${hasReceipt ? "bg-white dark:bg-darkblack-500 text-blue-600 shadow-lg border border-slate-100 dark:border-white/10" : "text-slate-200 cursor-not-allowed"}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </motion.button>
          )}
        </div>
      </td>

      <AnimatePresence>
        {showApproveModal && (
          <ApproveModal
            key="approve-modal"
            paymentInfo={paymentInfo} onClose={() => setShowApproveModal(false)}
            handleApprove={handleApprove} approveLoading={approveLoading} approvalResult={approvalResult}
            editAmount={editAmount} setEditAmount={setEditAmount} editInterest={editInterest} setEditInterest={setEditInterest}
            t={t} hasReceipt={hasReceipt} handleDownloadReceipt={handleDownloadReceipt}
          />
        )}
        {showRejectModal && (
          <RejectPaymentModal
            key="reject-modal"
            paymentInfo={paymentInfo} onClose={() => setShowRejectModal(false)}
            handleReject={handleReject} rejectLoading={rejectLoading} rejectResult={rejectResult}
            t={t}
          />
        )}
      </AnimatePresence>
    </motion.tr>
  );
}

/**
 * Version 2.0 Approve Modal - Ultra Premium
 */
function ApproveModal({
  paymentInfo, onClose, handleApprove, approveLoading, approvalResult,
  editAmount, setEditAmount, editInterest, setEditInterest, t, hasReceipt, handleDownloadReceipt
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [receiptUrl, setReceiptUrl] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (hasReceipt && !previewUrl) {
      let active = true;
      paymentsApi.downloadReceipt(paymentInfo.id)
        .then(blob => {
          if (active) {
            const url = URL.createObjectURL(blob);
            setReceiptUrl(url);
          }
        })
        .catch(console.error);
      return () => { active = false; };
    }
  }, [hasReceipt, paymentInfo.id, previewUrl]);

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onApproveClick = () => {
    handleApprove(selectedFile);
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-[12px] flex items-center justify-center z-[9999] p-3 sm:p-4 md:p-6" onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
        className="bg-white dark:bg-darkblack-600 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-100 dark:border-white/10 max-h-[95vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative flex flex-col lg:flex-row min-h-0 flex-1 overflow-hidden">
          {/* Left Side: Receipt Preview */}
          <div className="lg:w-2/5 min-h-[180px] lg:min-h-0 p-2 hidden lg:flex flex-col">
            {hasReceipt || previewUrl ? (
              <div className="flex-1 min-h-0 w-full rounded-xl overflow-hidden bg-slate-50 dark:bg-darkblack-500 relative group">
                {previewUrl ? (
                  selectedFile?.type === "application/pdf" ? (
                    <iframe src={previewUrl} title="Preview" className="w-full h-full border-0 min-h-[200px]" />
                  ) : (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  )
                ) : (
                  receiptUrl ? (
                    paymentInfo.document_url?.toLowerCase().endsWith('.pdf') ? (
                      <iframe src={receiptUrl} title="PDF" className="w-full h-full border-0 min-h-[200px]" />
                    ) : (
                      <img src={receiptUrl} alt="Receipt" className="w-full h-full object-cover" />
                    )
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">Loading...</div>
                  )
                )}
                <div className="absolute inset-0 bg-slate-900/20 group-hover:opacity-100 transition-opacity" />

                {previewUrl ? (
                  <button
                    onClick={clearFile}
                    className="absolute top-2 right-2 bg-rose-500 text-white p-2 rounded-full shadow-lg hover:bg-rose-600 transition-all z-10"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                ) : (
                  <button
                    onClick={handleDownloadReceipt}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-slate-900 px-4 py-2 rounded-lg font-bold uppercase text-[10px] tracking-wider shadow-lg hover:bg-slate-50 transition-all"
                  >
                    {t('payments.downloadReceipt')}
                  </button>
                )}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 min-h-0 w-full rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center text-slate-300 space-y-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-all group py-6"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={onFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 group-hover:opacity-100 transition-opacity text-center px-3">
                  {t('payments.clickToUploadReceipt')}
                </span>
                <span className="text-[9px] font-medium uppercase tracking-wider opacity-30">{t('payments.acceptedFormats')}</span>
              </div>
            )}
          </div>

          {/* Right Side: Controls */}
          <div className="flex-1 p-4 sm:p-6 lg:p-6 flex flex-col justify-between min-h-0 overflow-y-auto">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <div className="inline-flex px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-wider mb-2">
                    {t('payments.paymentVerification')}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {t('payments.approve')} <span className="text-emerald-500 font-normal">.</span>
                  </h3>
                  <p className="text-slate-400 font-medium mt-1 uppercase text-[9px] tracking-wider max-w-[260px] truncate">{paymentInfo.description}</p>
                </div>
                <button onClick={onClose} className="p-2 sm:p-2.5 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-rose-500 hover:text-white transition-all duration-300 shadow-xs shrink-0" aria-label="Close">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-5">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('payments.amount')}</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pr-2 border-r border-gray-100 dark:border-white/10 uppercase">{paymentInfo.contract?.currency}</span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={editAmount}
                      onChange={e => {
                        const val = e.target.value;
                        const num = parseFloat(val);
                        if (val !== "" && !isNaN(num) && num < 0) return;
                        setEditAmount(val);
                      }}
                      className="w-full pl-16 sm:pl-20 pr-6 py-3 bg-slate-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 focus:border-emerald-500 rounded-xl outline-hidden font-bold text-lg dark:text-white transition-all shadow-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider ml-1">{t('payments.lateInterest')}</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300/50 font-bold text-sm pr-2 border-r border-white/10 uppercase">{paymentInfo.contract?.currency}</span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={editInterest}
                      onChange={e => {
                        const val = e.target.value;
                        const num = parseFloat(val);
                        if (val !== "" && !isNaN(num) && num < 0) return;
                        setEditInterest(val);
                      }}
                      className="w-full pl-16 sm:pl-20 pr-6 py-3 bg-slate-50 dark:bg-white/[0.03] border border-transparent focus:border-emerald-500/30 rounded-xl outline-hidden font-bold text-lg dark:text-white transition-all shadow-inner"
                    />
                  </div>
                </div>
                <p className="text-[9px] text-slate-500 dark:text-slate-400">
                  {t('payments.approveAmountHint')}
                </p>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 space-y-4">
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 pr-1">{t('payments.amountToApprove')}</span>
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                  {((Number(editAmount) || 0) + (Number(editInterest) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  <span className="text-sm font-medium ml-1.5 opacity-30 uppercase tracking-wider">{paymentInfo.contract?.currency}</span>
                </div>
              </div>

              <AnimatePresence>
                {approvalResult && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-3 rounded-xl text-center text-[9px] font-bold uppercase tracking-wider shadow-xs ${approvalResult.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                    {approvalResult.message}
                  </motion.div>
                )}
              </AnimatePresence>

              {!approvalResult?.type && (
                <motion.button
                  whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
                  onClick={onApproveClick} disabled={approveLoading}
                  className="w-full py-3.5 sm:py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {approveLoading ? (
                    <span className="animate-spin block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full" />
                  ) : (
                    <>
                      {t('payments.authorizeTransaction')}
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

    </motion.div>,
    document.body
  );
}

/**
 * Reject Payment Modal - Admin rejects a submitted payment (optional reason)
 */
function RejectPaymentModal({ paymentInfo, onClose, handleReject, rejectLoading, rejectResult, t }) {
  const [reason, setReason] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    handleReject(reason.trim() || undefined);
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-[12px] flex items-center justify-center z-[9999] p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
        className="bg-white dark:bg-darkblack-600 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-white/10"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-rose-50 dark:bg-rose-900/10 p-8 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              {t('payments.rejectPayment')}
            </h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              {t('payments.rejectionReasonLong')}
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-8 space-y-6">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {paymentInfo.description}
          </p>
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              {t('payments.rejectionReasonLabelOptional')}
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder={t('payments.rejectionReasonPlaceholder')}
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 focus:border-rose-500 outline-hidden font-medium text-slate-900 dark:text-white min-h-[120px] resize-none text-sm"
              disabled={rejectLoading}
            />
          </div>

          <AnimatePresence>
            {rejectResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl text-center text-[10px] font-bold uppercase tracking-wider ${rejectResult.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}
              >
                {rejectResult.message}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={rejectLoading}
              className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-darkblack-500 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px] hover:bg-slate-200 dark:hover:bg-darkblack-400 transition-all"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={rejectLoading}
              className="flex-[2] py-4 rounded-2xl bg-rose-500 text-white font-bold uppercase tracking-wider text-[10px] shadow-lg hover:bg-rose-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {rejectLoading ? (
                <span className="animate-spin block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              ) : null}
              {rejectLoading ? t('payments.rejecting') : t('payments.confirmRejection')}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>,
    document.body
  );
}

/**
 * Payment Detail Modal - Comprehensive view of a payment record
 */
export function PaymentDetailModal({ payment, onClose }) {
  const { t } = useLocale();
  const { showToast } = useToast();
  // const token = getToken(); // Removed as we use apiClient now

  const formatCurrency = (value, currency = getDefaultCurrency()) => {
    if (value === null || value === undefined) return "—";
    return `${currency} ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString, showTime = false) => {
    if (!dateString) return "—";
    try {
      return format(parseISO(dateString), showTime ? "dd MMM, yyyy HH:mm" : "dd MMM, yyyy");
    } catch {
      return dateString;
    }
  };

  const statusLower = (payment.status || "").toLowerCase();
  const totalAmount = Number(payment.amount || 0) + Number(payment.interest_amount || 0);
  const paidAmountDetail = Number(payment.paid_amount ?? 0);
  const isOverpaymentDetail = statusLower === "paid" && paidAmountDetail > totalAmount && totalAmount > 0;
  const overpaymentAmountDetail = isOverpaymentDetail ? paidAmountDetail - totalAmount : 0;

  const getStatusConfig = () => {
    switch (statusLower) {
      case "paid": return { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", dot: "bg-blue-500", border: "border-blue-500/20" };
      case "submitted": return { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500", border: "border-amber-500/20" };
      case "rejected": return { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400", dot: "bg-rose-500", border: "border-rose-500/20" };
      default: return { bg: "bg-slate-500/10", text: "text-slate-600 dark:text-slate-400", dot: "bg-slate-400", border: "border-slate-500/20" };
    }
  };

  const statusConfig = getStatusConfig();

  const hasReceipt = Boolean(payment.has_receipt || payment.document_url);
  const [receiptUrl, setReceiptUrl] = useState(null);

  useEffect(() => {
    if (hasReceipt) {
      let active = true;
      paymentsApi.downloadReceipt(payment.id)
        .then(blob => {
          if (active) setReceiptUrl(URL.createObjectURL(blob));
        })
        .catch(() => { });
      return () => { active = false; };
    }
  }, [hasReceipt, payment.id]);

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-[10px] flex items-center justify-center z-[10000] p-4 md:p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white dark:bg-darkblack-600 rounded-[2.5rem] shadow-2xl w-full max-w-5xl overflow-hidden border border-white/50 dark:border-white/10 flex flex-col lg:flex-row max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Left Side: Media/Visual */}
        <div className="lg:w-[45%] bg-slate-50 dark:bg-darkblack-700 p-4 border-r border-slate-100 dark:border-white/5 overflow-hidden flex flex-col">
          <div className="flex-1 min-h-[300px] rounded-[2rem] overflow-hidden bg-white dark:bg-darkblack-500 shadow-inner flex items-center justify-center relative">
            {hasReceipt ? (
              receiptUrl ? (
                (payment.is_pdf || payment.document_url?.toLowerCase().endsWith('.pdf')) ? (
                  <iframe src={receiptUrl} title="Receipt PDF" className="w-full h-full border-0" />
                ) : (
                  <img src={receiptUrl} alt="Payment Receipt" className="w-full h-full object-contain p-4" />
                )
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">Loading...</div>
              )
            ) : (
              <div className="flex flex-col items-center text-slate-300 dark:text-slate-600 gap-4">
                <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-bold uppercase tracking-widest">{t('payments.noReceipt')}</span>
              </div>
            )}
          </div>
          {hasReceipt && (
            <button
              onClick={async () => {
                try {
                  const blob = await paymentsApi.downloadReceipt(payment.id);
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `receipt-${payment.id}.pdf`;
                  link.target = "_blank";
                  link.click();
                  window.URL.revokeObjectURL(url);
                } catch {
                  showToast(t('payments.downloadReceiptError'), "error");
                }
              }}
              className="mt-4 w-full py-4 bg-white dark:bg-darkblack-500 rounded-2xl text-[10px] font-black uppercase tracking-widest text-blue-500 border border-blue-500/10 hover:bg-blue-50 transition-all mb-4"
            >
              {t('common.download')} {t('payments.receipt')}
            </button>
          )}
        </div>

        {/* Right Side: Details */}
        <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-start mb-10">
            <div>
              <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} mb-4`}>
                <span className={`w-2 h-2 rounded-full mr-3 ${statusConfig.dot}`} />
                {statusLower === 'paid' ? t('payments.statusOptions.paid') : statusLower === 'submitted' ? t('payments.statusOptions.submitted') : statusLower === 'rejected' ? t('payments.statusOptions.rejected') : (payment.status || 'Pending')}
              </div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none italic mb-2">
                {t('payments.paymentDetail')} <span className="text-blue-500 font-normal">.</span>
              </h2>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{payment.description}</p>
            </div>
            <button onClick={onClose} className="p-4 rounded-full bg-slate-50 dark:bg-white/5 hover:bg-rose-500 hover:text-white transition-all group">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Amount Summary Card */}
            <div className="col-span-1 md:col-span-2 bg-slate-900 dark:bg-darkblack-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" /></svg>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400/60 block mb-3">{t('payments.totalAmount')}</span>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-black italic tracking-tighter">{formatCurrency(totalAmount, payment.contract?.currency)}</span>
              </div>
              <div className="mt-6 flex gap-6 border-t border-white/5 pt-6">
                <div>
                  <span className="text-[9px] font-bold text-white/40 uppercase block mb-1">Base</span>
                  <span className="font-bold">{formatCurrency(payment.amount)}</span>
                </div>
                {Number(payment.interest_amount) > 0 && (
                  <div>
                    <span className="text-[9px] font-bold text-rose-400 uppercase block mb-1">Interests</span>
                    <span className="font-bold text-rose-400">+{formatCurrency(payment.interest_amount)}</span>
                  </div>
                )}
              </div>
              {isOverpaymentDetail && (
                <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-6">
                  <div>
                    <span className="text-[9px] font-bold text-white/40 uppercase block mb-1">{t('payments.totalAmount')}</span>
                    <span className="font-bold">{formatCurrency(totalAmount, payment.contract?.currency)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-emerald-400 uppercase block mb-1">{t('payments.overpayment')}</span>
                    <span className="font-bold text-emerald-300">+{formatCurrency(overpaymentAmountDetail, payment.contract?.currency)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-emerald-400 uppercase block mb-1">{t('payments.totalPaid')}</span>
                    <span className="font-bold text-emerald-300">{formatCurrency(paidAmountDetail, payment.contract?.currency)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Timestamps */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-white/5 pb-2">{t('payments.temporalData')}</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-50 dark:bg-white/[0.02] p-3 rounded-xl border border-slate-100 dark:border-white/5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{t('payments.dueDate')}</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white uppercase">{formatDate(payment.due_date)}</span>
                </div>
                {payment.payment_date && (
                  <div className="flex justify-between items-center bg-blue-500/5 p-3 rounded-xl border border-blue-500/10">
                    <span className="text-[10px] font-bold text-blue-500 uppercase">{t('payments.paymentDate')}</span>
                    <span className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase">{formatDate(payment.payment_date)}</span>
                  </div>
                )}
                {payment.approved_at && (
                  <div className="flex justify-between items-center bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase">{t('payments.approvedAt')}</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase">{formatDate(payment.approved_at, true)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Management Info */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-white/5 pb-2">{t('payments.authorityAndEntity')}</h4>
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">{t('payments.applicant')}</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white uppercase">{payment.applicant_name || payment.contract?.applicant_user?.full_name || "-"}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">{t('payments.propertyLot')}</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white uppercase">
                    {payment.project_name || payment.contract?.lot?.project?.name ? `${payment.project_name || payment.contract?.lot?.project?.name} - ` : ""}
                    Lote {payment.lot_name || payment.contract?.lot?.name || "-"}
                  </span>
                </div>
                {payment.contract?.guid && (
                  <div className="p-3 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5 group/guid">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">{t('contracts.id') || "ID del Contrato"}</span>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(payment.contract?.guid);
                        showToast(t("common.copiedToClipboard") || "Copiado al portapapeles", "success");
                      }}
                      className="flex items-center justify-between cursor-pointer hover:text-blue-500 transition-colors"
                    >
                      <span className="text-sm font-mono font-bold uppercase truncate pr-4">
                        {payment.contract?.guid}
                      </span>
                      <svg className="w-4 h-4 text-slate-300 group-hover/guid:text-blue-500 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                      </svg>
                    </div>
                  </div>
                )}
                {(payment.approver || payment.approved_by_name) && (
                  <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                    <span className="text-[9px] font-bold text-indigo-500 uppercase block mb-1">{t('payments.authorizedBy')}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold">
                        {(payment.approver || payment.approved_by_name).charAt(0)}
                      </div>
                      <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase">{payment.approver || payment.approved_by_name}</span>
                    </div>
                  </div>
                )}
                {statusLower === 'rejected' && (
                  <div className="p-3 bg-rose-500/5 rounded-xl border border-rose-500/10">
                    <span className="text-[9px] font-bold text-rose-500 uppercase block mb-1">{t('payments.rejectionReasonLabel')}</span>
                    <p className="text-sm font-medium text-rose-700 dark:text-rose-300 leading-relaxed">
                      {payment.rejection_reason || payment.rejection_reason_notes || payment.rejection_note
                        ? `"${payment.rejection_reason || payment.rejection_reason_notes || payment.rejection_note}"`
                        : t('payments.paymentRejectedNotice')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

PaymentItem.propTypes = {
  paymentInfo: PropTypes.object.isRequired,
  userRole: PropTypes.string,
  refreshPayments: PropTypes.func,
  onClick: PropTypes.func,
  isMobileCard: PropTypes.bool
};

PaymentDetailModal.propTypes = {
  payment: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired
};

export default memo(PaymentItem);
