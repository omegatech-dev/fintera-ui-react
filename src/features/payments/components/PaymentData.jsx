// src/components/payments/PaymentData.jsx

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { format, isBefore, parseISO, startOfDay } from "date-fns";
import { formatStatus } from "../../../shared/utils/formatStatus";
import { paymentsApi } from "../api";
import { useLocale } from "../../../contexts/LocaleContext";
import { useToast } from "../../../contexts/ToastContext";

// Normalize payment from API: user payments return flat shape (no nested contract); build a safe contract for display
function normalizePayment(paymentData) {
  const paidAmount = Number(paymentData.paid_amount ?? 0);
  const contract = paymentData.contract ?? {
    currency: paymentData.currency ?? "HNL",
    lot: paymentData.lot_name
      ? { name: paymentData.lot_name, address: paymentData.lot_address ?? null }
      : null,
  };
  return { ...paymentData, contract, paidAmount };
}

function PaymentData({ paymentData, onPaymentSuccess }) {
  const normalized = normalizePayment(paymentData);
  const {
    id,
    contract,
    description,
    amount,
    due_date,
    status: initialStatus,
    interest_amount,
    paidAmount,
  } = normalized;
  const { t } = useLocale();
  const { showToast } = useToast();

  // State for payment modal
  const [paymentModal, setPaymentModal] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const modalRef = useRef(null);

  // Handle modal animation and body scroll
  useEffect(() => {
    if (paymentModal) {
      document.body.style.overflow = 'hidden';
      // Add a small delay to trigger the animation
      requestAnimationFrame(() => {
        setIsModalVisible(true);
      });

      // Focus after animation starts
      setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.focus();
        }
      }, 150);
    } else {
      // Delay removing body scroll to allow for exit animation
      setTimeout(() => {
        document.body.style.overflow = 'unset';
      }, 300);
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [paymentModal]);

  // Function to open payment modal instead of navigating
  const openPaymentModal = () => {
    setPaymentModal(true);
  };

  // Function to close modal with animation
  const closePaymentModal = () => {
    setIsModalVisible(false);
    setTimeout(() => {
      setPaymentModal(false);
      setSelectedFile(null);
    }, 300);
  };

  // Format currency function (contract may be missing when API returns flat PaymentResponse)
  const currency = contract?.currency ?? "HNL";
  const fmt = (v) =>
    v === null || v === undefined || v === ""
      ? "—"
      : Number(v).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + " " + currency;

  // Parse the due_date string into a Date object
  const dueDate = parseISO(due_date);

  // Get the start of today to ignore time components
  const todayStart = startOfDay(new Date());

  // Determine if the payment is overdue (due_date < todayStart)
  const isOverdue = isBefore(dueDate, todayStart);

  // Format the due date for display
  const formattedDueDate = format(dueDate, "dd MMM yyyy"); // e.g., "24 Oct 2023"

  // normalize status for comparisons and UI
  const statusKey = (initialStatus || "").toLowerCase();

  // Determine the color for the status
  const statusColor =
    statusKey === "paid" || statusKey === "submitted"
      ? "bg-green-100 text-green-800"
      : statusKey === "pending"
        ? "bg-yellow-100 text-yellow-800"
        : isOverdue
          ? "bg-red-100 text-red-800"
          : "bg-gray-100 text-gray-800";

  const getStatusIcon = () => {
    switch (statusKey) {
      case "paid":
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case "submitted":
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "pending":
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
    }
  };

  const getStatusText = () => {
    return formatStatus(statusKey, t);
  };

  return (
    <div className="payment-card bg-white dark:bg-darkblack-700 rounded-lg border border-gray-200 dark:border-darkblack-500 p-6 hover:shadow-lg transition-all duration-200">
      {/* Header with title and status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 dark:bg-darkblack-600 text-gray-600 dark:text-gray-400 text-xs font-medium rounded">
              {t('payments.paymentId')}: {id}
            </span>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="font-semibold text-lg text-bgray-900 dark:text-white">
              {description}
            </h4>
            {isOverdue && (
              <span className="inline-flex items-center px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs font-medium rounded-full">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('payments.overdue')}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
            {getStatusIcon()}
            <span className="ml-2">{getStatusText()}</span>
          </span>
        </div>
      </div>

      {/* Payment details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 dark:bg-darkblack-600 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <svg className="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <span className="text-sm font-medium text-bgray-700 dark:text-bgray-200">{t('payments.totalAmount')}</span>
          </div>
          <p className="text-xl font-bold text-bgray-900 dark:text-white">
            {currency} {Number(parseFloat(amount || 0) + parseFloat(interest_amount || 0)).toLocaleString()}
          </p>
          {Number(interest_amount || 0) > 0 && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              {t('payments.lateInterest')}: {currency} {Number(interest_amount).toLocaleString()}
            </p>
          )}
          {(initialStatus === "paid" && paidAmount > 0) && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
              {t('payments.amountReceived')}: {currency} {paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          )}
          {paidAmount > (Number(amount || 0) + Number(interest_amount || 0)) && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              {t('payments.extraAmount')}: {currency} {Number(paidAmount - (Number(amount || 0) + Number(interest_amount || 0))).toLocaleString()}
            </p>
          )}
        </div>

        <div className="bg-gray-50 dark:bg-darkblack-600 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4M8 7h8M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
            </svg>
            <span className="text-sm font-medium text-bgray-700 dark:text-bgray-200">{t('payments.dueDate')}</span>
          </div>
          <p className={`text-lg font-semibold ${isOverdue ? "text-red-600 dark:text-red-400" : "text-bgray-900 dark:text-white"}`}>
            {formattedDueDate}
          </p>
        </div>
      </div>

      {/* Lot Information (from nested contract or flat API: lot_name, lot_address) */}
      {(contract?.lot || normalized.lot_name) && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
          <div className="flex items-center space-x-2 mb-1">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{(contract?.lot?.name ?? normalized.lot_name) || t('common.notAvailable')}</span>
          </div>
          {(contract?.lot?.address ?? normalized.lot_address) && (
            <div className="flex items-center space-x-1 ml-6">
              <svg className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs text-blue-700 dark:text-blue-300">{contract?.lot?.address ?? normalized.lot_address}</span>
            </div>
          )}
        </div>
      )}

      {/* Action button */}
      {initialStatus !== "paid" && initialStatus !== "submitted" && (
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-darkblack-500">
          <button
            onClick={openPaymentModal}
            className="inline-flex items-center px-6 py-3 bg-success-300 hover:bg-success-400 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-md focus:outline-hidden focus:ring-2 focus:ring-success-500 focus:ring-offset-2"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {t('payments.makePayment')}
          </button>
        </div>
      )}

      {/* Payment Modal - Rendered as Portal */}
      {paymentModal && createPortal(
        <div
          className={`fixed inset-0 flex items-center justify-center z-50 overflow-y-auto transition-all duration-300 ease-out ${isModalVisible
            ? 'bg-black/50 backdrop-blur-xs'
            : 'bg-black/0 backdrop-blur-none'
            }`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closePaymentModal();
            }
          }}
        >
          <div
            ref={modalRef}
            className={`bg-white dark:bg-darkblack-600 rounded-lg p-6 w-full max-w-md mx-4 transition-all duration-300 ease-out transform ${isModalVisible
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-95 translate-y-4'
              }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            tabIndex="-1"
          >
            <h4 id="modal-title" className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {t('payments.makePayment')}
            </h4>
            <p id="modal-description" className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {description}
            </p>
            <div className="space-y-4">
              {/* Subtotal and Total Display */}
              <div className="p-3 bg-gray-50 dark:bg-darkblack-500 rounded-lg">
                <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300 mb-1">
                  <span>{t('payments.amount')}:</span>
                  <span>{fmt(parseFloat(amount || 0))}</span>
                </div>
                {interest_amount > 0 && (
                  <div className="flex justify-between text-sm text-red-600 dark:text-red-400 mb-1">
                    <span>{t('payments.lateInterest')}:</span>
                    <span>{fmt(parseFloat(interest_amount || 0))}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-gray-900 dark:text-white border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                  <span>{t('payments.total')}:</span>
                  <span>{fmt(parseFloat(amount || 0) + parseFloat(interest_amount || 0))}</span>
                </div>
              </div>
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('payments.uploadReceipt')}
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-darkblack-400 rounded-lg dark:bg-darkblack-500 dark:text-white focus:ring-2 focus:ring-blue-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {selectedFile && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t('payments.selectedFile')}: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closePaymentModal}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-darkblack-500 dark:hover:bg-darkblack-400 text-gray-800 dark:text-gray-100"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={async () => {
                  if (!selectedFile) {
                    showToast(t('payments.selectFileToUpload'), "error");
                    return;
                  }

                  setActionLoading(true);
                  try {
                    const totalAmount = Number(parseFloat(amount || 0) + parseFloat(interest_amount || 0));
                    const formData = new FormData();
                    formData.append('receipt', selectedFile);
                    formData.append('paid_amount', totalAmount.toString());

                    await paymentsApi.uploadReceipt(id, formData);

                    showToast(t('payments.paymentSuccessful'), "success");

                    // Close modal and reset state without page reload
                    setTimeout(() => {
                      closePaymentModal();
                      setActionLoading(false);
                      // Refresh payment status after successful submission
                      if (onPaymentSuccess) {
                        onPaymentSuccess();
                      }
                    }, 500);
                  } catch (error) {
                    console.error('Error uploading payment:', error);

                    // Check if it's an auth error
                    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                      showToast(t('common.sessionExpired'), "error");
                      // Optionally redirect to login instead of reload
                      window.location.href = '/signin';
                    } else {
                      showToast(`${t('payments.paymentError')}: ${error.message}`, "error");
                    }

                    setActionLoading(false);
                  }
                }}
                disabled={actionLoading || !selectedFile}
                className="px-4 py-2 text-sm font-medium rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed bg-blue-500 hover:bg-blue-600"
              >
                {actionLoading ? t('common.processing') : t('payments.makePayment')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}

PaymentData.propTypes = {
  paymentData: PropTypes.shape({
    id: PropTypes.number.isRequired,
    contract: PropTypes.shape({
      currency: PropTypes.string,
      lot: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        address: PropTypes.string,
      }),
    }),
    description: PropTypes.string,
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    due_date: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    interest_amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    paid_amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    lot_name: PropTypes.string,
    lot_address: PropTypes.string,
  }).isRequired,
  onPaymentSuccess: PropTypes.func,
};

export default PaymentData;