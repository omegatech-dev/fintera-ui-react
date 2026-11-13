import { useState, useRef, memo, useEffect } from "react";
import { format, parseISO, isBefore, startOfDay } from "date-fns";
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import { paymentsApi } from "../api";
import { formatStatus } from "../../../shared/utils/formatStatus";
import { useLocale } from "../../../contexts/LocaleContext";
import { useToast } from "../../../contexts/ToastContext";
import { getDefaultCurrency } from "../../../shared/utils/formatSettings";
import { reservationApprovalBlocked } from "../utils/approval";
import { Button, Chip, Dialog } from "@/shared/ui";

// Pure helpers shared by the card view and the desktop table on the payments page
export function getPaymentMeta(paymentInfo, t) {
  const paidAmount = Number(paymentInfo.paid_amount ?? 0);
  const totalAmount =
    Number(paymentInfo.amount || 0) + Number(paymentInfo.interest_amount || 0);
  const statusLower = (paymentInfo.status || "").toLowerCase();
  const isOverdue =
    statusLower !== "paid" && paymentInfo.due_date && !paymentInfo.payment_date
      ? isBefore(parseISO(paymentInfo.due_date), startOfDay(new Date()))
      : false;
  const isOverpayment =
    statusLower === "paid" && paidAmount > totalAmount && totalAmount > 0;
  const overpaymentAmount = isOverpayment ? paidAmount - totalAmount : 0;
  const hasReceipt = Boolean(paymentInfo.has_receipt || paymentInfo.document_url);
  const approvalBlocked = reservationApprovalBlocked(paymentInfo);

  const config = (() => {
    switch (statusLower) {
      case "paid":
        return { tone: "success", dot: "bg-brand" };
      case "submitted":
        return { tone: "info", dot: "bg-info" };
      case "rejected":
        return { tone: "danger", dot: "bg-danger" };
      default:
        return isOverdue
          ? { tone: "danger", dot: "bg-danger" }
          : { tone: "neutral", dot: "bg-ink-3" };
    }
  })();

  const label =
    statusLower === "submitted"
      ? t("payments.statusOptions.submitted")
      : statusLower === "paid"
        ? t("payments.statusOptions.paid")
        : statusLower === "rejected"
          ? t("payments.statusOptions.rejected")
          : formatStatus(paymentInfo.status, t);

  return {
    paidAmount,
    totalAmount,
    statusLower,
    isOverdue,
    isOverpayment,
    overpaymentAmount,
    hasReceipt,
    approvalBlocked,
    config,
    label,
  };
}

const paylotLabel = (payment, t) => {
  const lot = payment.lot_name || payment.contract?.lot?.name;
  if (!lot) return t("common.notAvailable");
  return /^lote\b/i.test(lot) ? lot : `Lote ${lot}`;
};

const currencyLabel = (currency = getDefaultCurrency()) =>
  String(currency).toUpperCase() === "HNL" ? "L" : currency;

const formatMoney = (value, currency = getDefaultCurrency()) => {
  if (value === null || value === undefined) return "—";
  return `${currencyLabel(currency)} ${Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatShortDate = (dateString, fallback = "—") => {
  if (!dateString) return fallback;
  try {
    return format(parseISO(dateString), "dd MMM, yyyy");
  } catch {
    return dateString;
  }
};

const downloadBlob = async (paymentId) => {
  const blob = await paymentsApi.downloadReceipt(paymentId);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `receipt-${paymentId}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

function ReceiptPreview({ paymentId, hasReceipt }) {
  const { t } = useLocale();
  const [receiptUrl, setReceiptUrl] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!hasReceipt) return undefined;
    let active = true;
    paymentsApi
      .downloadReceipt(paymentId)
      .then((blob) => {
        if (active) setReceiptUrl(URL.createObjectURL(blob));
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [hasReceipt, paymentId]);

  if (!hasReceipt) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-card border border-dashed border-line-strong bg-surface-2 px-6 py-10 text-center">
        <svg
          className="h-8 w-8 text-ink-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-body font-semibold text-ink-2">
          {t("payments.noReceipt")}
        </p>
      </div>
    );
  }

  if (failed) {
    return (
      <div className="flex min-h-[220px] items-center justify-center rounded-card border border-line bg-surface-2 p-6 text-center text-body text-ink-3">
        {t("payments.previewNotAvailable")}
      </div>
    );
  }

  return (
    <div className="flex min-h-[220px] items-center justify-center overflow-hidden rounded-card border border-line bg-surface-2">
      {receiptUrl ? (
        <img
          src={receiptUrl}
          alt={t("payments.receipt")}
          className="max-h-[360px] w-full object-contain"
        />
      ) : (
        <div className="h-40 w-full animate-pulse rounded-card bg-line/60" />
      )}
    </div>
  );
}

function PaymentItem({
  paymentInfo,
  userRole,
  refreshPayments,
  onClick,
  _isMobileCard = false,
}) {
  const { t } = useLocale();
  const { showToast } = useToast();

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [editAmount, setEditAmount] = useState(paymentInfo.amount);
  const [editInterest, setEditInterest] = useState(
    paymentInfo.interest_amount || 0
  );
  const [approvalResult, setApprovalResult] = useState(null);
  const [rejectResult, setRejectResult] = useState(null);

  const meta = getPaymentMeta(paymentInfo, t);

  const handleApprove = async (fileToUpload = null) => {
    if (reservationApprovalBlocked(paymentInfo)) {
      setApprovalResult({
        type: "error",
        message: t("payments.reservationRequiresContract"),
      });
      return;
    }
    setApproveLoading(true);
    setApprovalResult(null);
    try {
      if (fileToUpload) {
        const formData = new FormData();
        formData.append("receipt", fileToUpload);
        await paymentsApi.uploadReceipt(paymentInfo.id, formData);
      }

      const paidAmount = (Number(editAmount) || 0) + (Number(editInterest) || 0);
      const data = await paymentsApi.approve(paymentInfo.id, {
        paid_amount: paidAmount,
      });

      if (data) {
        setApprovalResult({
          type: "success",
          message: t("payments.approveSuccess"),
        });
        setTimeout(() => {
          if (typeof refreshPayments === "function") refreshPayments();
          setShowApproveModal(false);
          setApprovalResult(null);
        }, 1500);
      }
    } catch (err) {
      setApprovalResult({
        type: "error",
        message: err.message || t("payments.approveError"),
      });
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
        setRejectResult({
          type: "success",
          message: t("payments.rejectSuccess"),
        });
        setTimeout(() => {
          if (typeof refreshPayments === "function") refreshPayments();
          setShowRejectModal(false);
          setRejectResult(null);
        }, 1500);
      }
    } catch (err) {
      setRejectResult({
        type: "error",
        message: err.message || t("payments.rejectError"),
      });
    } finally {
      setRejectLoading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      await downloadBlob(paymentInfo.id);
    } catch (error) {
      showToast(error.message || t("payments.downloadReceiptError"), "error");
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={(event) => {
        if (event.target.closest?.('[role="dialog"]')) return;
        onClick?.(event);
      }}
      className="group relative cursor-pointer rounded-card border border-line bg-surface p-4 transition-colors hover:border-line-strong"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Chip tone={meta.config.tone}>{meta.label}</Chip>
            {meta.isOverpayment && (
              <Chip tone="info">{t("payments.overpayment")}</Chip>
            )}
          </div>
          <div className="text-right">
            <p className="text-micro font-semibold uppercase tracking-wide text-ink-3">
              {t("payments.dueDate")}
            </p>
            <p
              className={`text-label font-semibold ${
                meta.isOverdue ? "text-danger" : "text-ink-2"
              }`}
            >
              {formatShortDate(paymentInfo.due_date)}
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-title font-bold leading-snug text-ink">
            {paymentInfo.description}
          </h4>
          <p className="mt-0.5 truncate text-micro text-ink-3">
            {[
              paymentInfo.project_name ||
                paymentInfo.contract?.lot?.project?.name,
              paymentInfo.lot_name || paymentInfo.contract?.lot?.name,
              paymentInfo.applicant_name ||
                paymentInfo.contract?.applicant_user?.full_name,
            ]
              .filter(Boolean)
              .join(" · ") || "—"}
          </p>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-2 border-t border-line pt-3">
          <div>
            <p className="text-micro font-semibold uppercase tracking-wide text-ink-3">
              {t("payments.totalAmount")}
            </p>
            <p
              className={`text-body-lg font-bold tabular-nums ${
                meta.isOverdue ? "text-danger" : "text-ink"
              }`}
            >
              {formatMoney(meta.totalAmount, paymentInfo.contract?.currency)}
            </p>
            {meta.isOverpayment && (
              <p className="text-micro text-info">
                +{formatMoney(meta.overpaymentAmount)} {t("payments.overpayment")}
              </p>
            )}
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            {meta.statusLower === "submitted" && userRole === "admin" && (
              <>
                <Button
                  size="sm"
                  variant="primary"
                  disabled={meta.approvalBlocked}
                  title={
                    meta.approvalBlocked
                      ? t("payments.reservationRequiresContract")
                      : undefined
                  }
                  onClick={(event) => {
                    event.stopPropagation();
                    if (meta.approvalBlocked) return;
                    setShowApproveModal(true);
                  }}
                >
                  {t("payments.approve")}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(event) => {
                    event.stopPropagation();
                    setShowRejectModal(true);
                  }}
                >
                  {t("payments.reject")}
                </Button>
              </>
            )}
            {meta.statusLower === "paid" && (
              <Button
                size="sm"
                variant="secondary"
                disabled={!meta.hasReceipt}
                onClick={(event) => {
                  event.stopPropagation();
                  handleDownloadReceipt();
                }}
              >
                {t("payments.receipt")}
              </Button>
            )}
          </div>
        </div>

        {meta.statusLower === "submitted" &&
          userRole === "admin" &&
          meta.approvalBlocked && (
            <p className="text-micro font-semibold text-warning">
              {t("payments.reservationRequiresContract")}
            </p>
          )}
      </div>

      {showApproveModal && (
        <ApproveModal
          paymentInfo={paymentInfo}
          onClose={() => setShowApproveModal(false)}
          handleApprove={handleApprove}
          approveLoading={approveLoading}
          approvalResult={approvalResult}
          editAmount={editAmount}
          setEditAmount={setEditAmount}
          editInterest={editInterest}
          setEditInterest={setEditInterest}
          t={t}
          hasReceipt={meta.hasReceipt}
          handleDownloadReceipt={handleDownloadReceipt}
        />
      )}
      {showRejectModal && (
        <RejectPaymentModal
          paymentInfo={paymentInfo}
          onClose={() => setShowRejectModal(false)}
          handleReject={handleReject}
          rejectLoading={rejectLoading}
          rejectResult={rejectResult}
          t={t}
        />
      )}
    </motion.div>
  );
}

function ApproveModal({
  paymentInfo,
  onClose,
  handleApprove,
  approveLoading,
  approvalResult,
  editAmount,
  setEditAmount,
  editInterest,
  setEditInterest,
  t,
  hasReceipt,
  handleDownloadReceipt,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [receiptUrl, setReceiptUrl] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!hasReceipt) return undefined;
    let active = true;
    paymentsApi
      .downloadReceipt(paymentInfo.id)
      .then((blob) => {
        if (active) setReceiptUrl(URL.createObjectURL(blob));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [hasReceipt, paymentInfo.id]);

  const onFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearFile = (event) => {
    event.stopPropagation();
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const total = (Number(editAmount) || 0) + (Number(editInterest) || 0);
  const currency = paymentInfo.contract?.currency || getDefaultCurrency();

  return (
    <Dialog
      open
      onClose={onClose}
      size="lg"
      title={t("payments.approve")}
      description={paymentInfo.description}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={approveLoading}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={() => handleApprove(selectedFile)}
            loading={approveLoading}
          >
            {t("payments.approvePayment")}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
            {t("payments.receipt")}
          </p>
          <div className="flex min-h-[220px] flex-col overflow-hidden rounded-card border border-line bg-surface-2">
            {hasReceipt || previewUrl ? (
              <div className="relative flex flex-1 items-center justify-center">
                {previewUrl ? (
                  selectedFile?.type === "application/pdf" ? (
                    <iframe
                      src={previewUrl}
                      title={t("payments.previewReceipt")}
                      className="h-[220px] w-full border-0"
                    />
                  ) : (
                    <img
                      src={previewUrl}
                      alt={t("payments.previewReceipt")}
                      className="max-h-[260px] w-full object-contain"
                    />
                  )
                ) : receiptUrl ? (
                  paymentInfo.document_url?.toLowerCase().endsWith(".pdf") ? (
                    <iframe
                      src={receiptUrl}
                      title={t("payments.previewReceipt")}
                      className="h-[220px] w-full border-0"
                    />
                  ) : (
                    <img
                      src={receiptUrl}
                      alt={t("payments.receipt")}
                      className="max-h-[260px] w-full object-contain"
                    />
                  )
                ) : (
                  <div className="h-40 w-full animate-pulse bg-line/60" />
                )}
                {previewUrl && (
                  <Button
                    size="sm"
                    variant="secondary"
                    iconOnly
                    aria-label={t("common.delete")}
                    className="absolute right-2 top-2"
                    onClick={clearFile}
                  >
                    ×
                  </Button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-8 text-center"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={onFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                />
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-ink-3">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </span>
                <span className="text-label font-semibold text-ink-2">
                  {t("payments.clickToUploadReceipt")}
                </span>
                <span className="text-micro text-ink-3">
                  {t("payments.acceptedFormats")}
                </span>
              </button>
            )}
          </div>
          {hasReceipt && (
            <Button size="sm" variant="secondary" onClick={handleDownloadReceipt}>
              {t("payments.downloadReceipt")}
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {(paymentInfo.authorization_number ||
            paymentInfo.payer_account_name) && (
            <dl className="space-y-2 rounded-card border border-line bg-surface-2 p-3">
              {paymentInfo.authorization_number && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-micro font-semibold uppercase tracking-wide text-ink-3">
                    {t("payments.referenceNumber")}
                  </dt>
                  <dd className="truncate text-label font-semibold text-ink">
                    {paymentInfo.authorization_number}
                  </dd>
                </div>
              )}
              {paymentInfo.payer_account_name && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-micro font-semibold uppercase tracking-wide text-ink-3">
                    {t("payments.payerAccount")}
                  </dt>
                  <dd className="truncate text-label font-semibold text-ink">
                    {paymentInfo.payer_account_name}
                  </dd>
                </div>
              )}
            </dl>
          )}

          <label className="flex flex-col gap-1 text-label font-semibold text-ink-2">
            {t("payments.amount")} ({currencyLabel(currency)})
            <input
              type="number"
              step="any"
              min="0"
              value={editAmount ?? ""}
              onChange={(event) => {
                const val = event.target.value;
                const num = parseFloat(val);
                if (val !== "" && !isNaN(num) && num < 0) return;
                setEditAmount(val);
              }}
              className="h-11 rounded-control border border-line-strong bg-surface px-3 text-body-lg font-semibold text-ink"
            />
          </label>

          <label className="flex flex-col gap-1 text-label font-semibold text-ink-2">
            {t("payments.lateInterest")} ({currencyLabel(currency)})
            <input
              type="number"
              step="any"
              min="0"
              value={editInterest ?? ""}
              onChange={(event) => {
                const val = event.target.value;
                const num = parseFloat(val);
                if (val !== "" && !isNaN(num) && num < 0) return;
                setEditInterest(val);
              }}
              className="h-11 rounded-control border border-line-strong bg-surface px-3 text-body-lg font-semibold text-ink"
            />
          </label>

          <p className="text-micro text-ink-3">
            {t("payments.approveAmountHint")}
          </p>

          <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-3">
            <span className="text-micro font-bold uppercase tracking-wide text-ink-3">
              {t("payments.amountToApprove")}
            </span>
            <span className="text-page font-bold tabular-nums text-ink">
              {formatMoney(total, currency)}
            </span>
          </div>

          {approvalResult && (
            <p
              className={`rounded-control px-3 py-2 text-label font-semibold ${
                approvalResult.type === "success"
                  ? "bg-brand-soft text-brand-strong"
                  : "bg-danger-soft text-danger"
              }`}
            >
              {approvalResult.message}
            </p>
          )}
        </div>
      </div>
    </Dialog>
  );
}

function RejectPaymentModal({
  paymentInfo,
  onClose,
  handleReject,
  rejectLoading,
  rejectResult,
  t,
}) {
  const [reason, setReason] = useState("");

  const onSubmit = (event) => {
    event.preventDefault();
    handleReject(reason.trim() || undefined);
  };

  return (
    <Dialog
      open
      onClose={onClose}
      size="sm"
      title={t("payments.rejectPayment")}
      description={t("payments.rejectionReasonLong")}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={rejectLoading}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="danger"
            onClick={onSubmit}
            loading={rejectLoading}
          >
            {t("payments.confirmRejection")}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-3">
        <p className="truncate text-micro font-semibold uppercase tracking-wide text-ink-3">
          {paymentInfo.description}
        </p>
        <label className="flex flex-col gap-1 text-label font-semibold text-ink-2">
          {t("payments.rejectionReasonLabelOptional")}
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder={t("payments.rejectionReasonPlaceholder")}
            className="min-h-[120px] resize-none rounded-control border border-line-strong bg-surface p-3 text-body text-ink"
            disabled={rejectLoading}
          />
        </label>
        {rejectResult && (
          <p
            className={`rounded-control px-3 py-2 text-label font-semibold ${
              rejectResult.type === "success"
                ? "bg-brand-soft text-brand-strong"
                : "bg-danger-soft text-danger"
            }`}
          >
            {rejectResult.message}
          </p>
        )}
      </form>
    </Dialog>
  );
}

/**
 * Payment Detail Modal - mirrors the "Pago detalle" design: receipt and amount
 * summary on the left, payment metadata on the right.
 */
export function PaymentDetailModal({
  payment,
  onClose,
  userRole,
  onApprove,
  onReject,
}) {
  const { t } = useLocale();
  const { showToast } = useToast();

  const meta = getPaymentMeta(payment, t);
  const currency = payment.contract?.currency || getDefaultCurrency();
  const reference =
    payment.contract?.guid || payment.contract_guid || payment.guid;

  const handleDownload = async () => {
    try {
      await downloadBlob(payment.id);
    } catch {
      showToast(t("payments.downloadReceiptError"), "error");
    }
  };

  const detailRow = (label, value, tone = "text-ink") => (
    <div className="flex items-start justify-between gap-3 py-2">
      <span className="text-micro font-semibold uppercase tracking-wide text-ink-3">
        {label}
      </span>
      <span className={`text-right text-label font-semibold ${tone}`}>
        {value}
      </span>
    </div>
  );

  return (
    <Dialog
      open
      onClose={onClose}
      size="xl"
      title={
        <span className="flex flex-wrap items-center gap-3">
          {t("payments.paymentNumber", { id: payment.id })}
          <Chip tone={meta.config.tone}>{meta.label}</Chip>
        </span>
      }
      description={payment.description}
      footer={
        meta.statusLower === "submitted" && userRole === "admin" ? (
          <>
            <Button variant="ghost" onClick={onReject}>
              {t("payments.reject")}
            </Button>
            <Button
              disabled={meta.approvalBlocked}
              title={
                meta.approvalBlocked
                  ? t("payments.reservationRequiresContract")
                  : undefined
              }
              onClick={onApprove}
            >
              {t("payments.approvePayment")}
            </Button>
          </>
        ) : (
          <Button variant="secondary" onClick={onClose}>
            {t("common.close")}
          </Button>
        )
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-card border border-line bg-surface p-5">
          <p className="text-micro font-semibold uppercase tracking-wide text-ink-3">
            {[
              payment.project_name || payment.contract?.lot?.project?.name,
              paylotLabel(payment, t),
              payment.applicant_name ||
                payment.contract?.applicant_user?.full_name,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>

          <dl className="mt-4 divide-y divide-line border-y border-line">
            {detailRow(t("payments.amountDue"), formatMoney(payment.amount, currency))}
            {Number(payment.interest_amount) > 0 &&
              detailRow(
                t("payments.lateInterest"),
                `+ ${formatMoney(payment.interest_amount, currency)}`,
                "text-danger"
              )}
            {meta.isOverpayment &&
              detailRow(
                t("payments.overpayment"),
                `+ ${formatMoney(meta.overpaymentAmount, currency)}`,
                "text-info"
              )}
          </dl>

          <div className="flex items-center justify-between gap-3 py-3">
            <span className="text-body font-semibold text-ink-2">
              {t("payments.totalToCredit")}
            </span>
            <span className="text-title font-bold tabular-nums text-ink">
              {formatMoney(meta.totalAmount, currency)}
            </span>
          </div>

          <div className="mt-2 space-y-2">
            <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
              {t("payments.receipt")}
            </p>
            <ReceiptPreview
              paymentId={payment.id}
              hasReceipt={meta.hasReceipt}
            />
            {meta.hasReceipt && (
              <Button
                size="sm"
                variant="secondary"
                onClick={handleDownload}
                className="w-full"
              >
                {t("payments.downloadReceipt")}
              </Button>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <div className="rounded-card border border-line bg-surface p-4">
            <h3 className="text-title font-bold text-ink">
              {t("payments.information")}
            </h3>
            <dl className="mt-2 divide-y divide-line">
              {detailRow(t("payments.applicant"), payment.applicant_name || payment.contract?.applicant_user?.full_name || "—")}
              {detailRow(t("payments.propertyLot"), paylotLabel(payment, t))}
              {detailRow(t("payments.dueDate"), formatShortDate(payment.due_date))}
              {payment.payment_date &&
                detailRow(
                  t("payments.paymentDate"),
                  formatShortDate(payment.payment_date),
                  "text-info"
                )}
              {payment.approved_at &&
                detailRow(
                  t("payments.approvedAt"),
                  formatShortDate(payment.approved_at),
                  "text-brand-strong"
                )}
              {reference &&
                detailRow(t("contracts.id") || "ID", String(reference).slice(0, 12))}
              {payment.authorization_number &&
                detailRow(t("payments.referenceNumber"), payment.authorization_number)}
              {payment.payer_account_name &&
                detailRow(t("payments.payerAccount"), payment.payer_account_name)}
              {(payment.approver || payment.approved_by_name) &&
                detailRow(
                  t("payments.authorizedBy"),
                  payment.approver || payment.approved_by_name
                )}
            </dl>
          </div>

          {meta.statusLower === "rejected" && (
            <div className="rounded-card border border-danger-soft bg-danger-soft/40 p-4">
              <p className="text-micro font-bold uppercase tracking-wide text-danger">
                {t("payments.rejectionReasonLabel")}
              </p>
              <p className="mt-1 text-body text-ink-2">
                {payment.rejection_reason ||
                  payment.rejection_reason_notes ||
                  payment.rejection_note ||
                  t("payments.paymentRejectedNotice")}
              </p>
            </div>
          )}

          {meta.isOverpayment && (
            <div className="rounded-card border border-info-soft bg-info-soft/50 p-4">
              <p className="text-micro font-bold uppercase tracking-wide text-info">
                {t("payments.totalPaid")}
              </p>
              <p className="mt-1 text-body font-semibold text-ink">
                {formatMoney(meta.paidAmount, currency)}
              </p>
            </div>
          )}
        </section>
      </div>
    </Dialog>
  );
}

PaymentItem.propTypes = {
  paymentInfo: PropTypes.object.isRequired,
  userRole: PropTypes.string,
  refreshPayments: PropTypes.func,
  onClick: PropTypes.func,
  isMobileCard: PropTypes.bool,
};

ApproveModal.propTypes = {
  paymentInfo: PropTypes.object.isRequired,
  onClose: PropTypes.func,
  handleApprove: PropTypes.func,
  approveLoading: PropTypes.bool,
  approvalResult: PropTypes.object,
  editAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setEditAmount: PropTypes.func,
  editInterest: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setEditInterest: PropTypes.func,
  t: PropTypes.func.isRequired,
  hasReceipt: PropTypes.bool,
  handleDownloadReceipt: PropTypes.func,
};

RejectPaymentModal.propTypes = {
  paymentInfo: PropTypes.object.isRequired,
  onClose: PropTypes.func,
  handleReject: PropTypes.func,
  rejectLoading: PropTypes.bool,
  rejectResult: PropTypes.object,
  t: PropTypes.func.isRequired,
};

ReceiptPreview.propTypes = {
  paymentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  hasReceipt: PropTypes.bool,
};

PaymentDetailModal.propTypes = {
  payment: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  userRole: PropTypes.string,
  onApprove: PropTypes.func,
  onReject: PropTypes.func,
};

export default memo(PaymentItem);

export { ApproveModal, RejectPaymentModal };
