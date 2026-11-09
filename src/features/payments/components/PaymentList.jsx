// src/components/payments/PaymentList.jsx

import { useState, useEffect } from "react";
import PaymentData from "./PaymentData";
import { usersApi } from "../../users/api";
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './PaymentList.css'; // Import the CSS for transitions

import { useLocale } from "../../../contexts/LocaleContext";

function PaymentList({ user }) {
  const [payments, setPayments] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useLocale();

  useEffect(() => {
    if (!user || !user.id) {
      // If user or token is not available, do not attempt fetch.
      setLoading(false);
      return;
    }

    const fetchPayments = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await usersApi.getPayments(user.id);

        // Adjust based on API response structure
        if (data.payments) {
          setPayments(data.payments);
        } else if (Array.isArray(data)) {
          // If the API returns an array directly
          setPayments(data);
        } else {
          throw new Error('Invalid data format');
        }

      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user]); // Only re-run if user changes

  // Function to refresh payments data
  const refreshPayments = async () => {
    if (!user || !user.id) {
      return;
    }

    try {
      const data = await usersApi.getPayments(user.id);

      // Adjust based on API response structure
      if (data.payments) {
        setPayments(data.payments);
      } else if (Array.isArray(data)) {
        // If the API returns an array directly
        setPayments(data);
      }
    } catch (error) {
      console.error('Error refreshing payments:', error);
    }
  };

  const handleToggleShow = () => {
    setShowAll(prevShowAll => !prevShowAll);
  };

  // Determine which payments to display
  const displayedPayments = showAll ? payments : payments.slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-success-300 mx-auto mb-4"></div>
          <p className="text-bgray-600 dark:text-bgray-50">{t('payments.loadingPayments')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
          <div className="text-red-500 mb-3">
            <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">{t('payments.connectionError')}</h3>
          <p className="text-red-600 dark:text-red-400">{t('common.error')}: {error}</p>
        </div>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-bgray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-bgray-700 dark:text-bgray-200 mb-2">
            {t('payments.noPayments')}
          </h3>
          <p className="text-bgray-500 dark:text-bgray-400">
            {t('payments.noContracts')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TransitionGroup>
        {displayedPayments.map((payment, _index) => (
          <CSSTransition key={payment.id} timeout={300} classNames="fade">
            <PaymentData paymentData={payment} onPaymentSuccess={refreshPayments} />
          </CSSTransition>
        ))}
      </TransitionGroup>

      {payments.length > 5 && (
        <div className="flex justify-center mt-8 pt-6 border-t border-gray-200 dark:border-darkblack-500">
          <button
            onClick={handleToggleShow}
            className="inline-flex items-center px-6 py-3 bg-white dark:bg-darkblack-700 border border-gray-300 dark:border-darkblack-500 rounded-lg text-sm font-medium text-bgray-700 dark:text-bgray-200 hover:bg-gray-50 dark:hover:bg-darkblack-600 focus:outline-hidden focus:ring-2 focus:ring-success-500 focus:border-success-500 transition-all duration-200"
          >
            {showAll ? (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                {t('payments.showLess')}
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {t('payments.showAll')} ({payments.length} {t('dashboard.payments').toLowerCase()})
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default PaymentList;