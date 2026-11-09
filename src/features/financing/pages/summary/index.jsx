import React, { useContext, useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";

import AuthContext from "../../../../contexts/AuthContext";
import { usersApi } from "../../../users/api";
import { useLocale } from "../../../../contexts/LocaleContext";

// New Components
import HeroSection from "../../components/HeroSection";
import StatsOverview from "../../components/StatsOverview";
import NextPaymentCard from "../../components/NextPaymentCard";
import PaymentTimeline from "../../components/PaymentTimeline";


function Summary() {
  const { user } = useContext(AuthContext);
  const { userId } = useParams();
  const { t } = useLocale();

  const [summaryData, setSummaryData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const fetchAllData = useCallback(async () => {
    // If we’re missing user info, don’t attempt to fetch
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setFetchError(null);
    try {
      const targetUserId = userId || user.id;

      // Parallel fetch for Summary and Payments
      const [summaryData, paymentsData] = await Promise.all([
        usersApi.getSummary(targetUserId),
        usersApi.getPayments(targetUserId)
      ]);

      setSummaryData(summaryData);

      // Handle payments response structure variety
      let paymentsList = [];
      if (paymentsData.payments) {
        paymentsList = paymentsData.payments;
      } else if (Array.isArray(paymentsData)) {
        paymentsList = paymentsData;
      }
      setPayments(paymentsList);

    } catch (error) {
      console.error(error);
      setFetchError(error.message || "Error fetching data");
    } finally {
      setIsLoading(false);
    }
  }, [user, userId]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);



  // derived stats
  const totalPaid = payments.reduce((acc, curr) => acc + (parseFloat(curr.paid_amount) || 0), 0);
  const totalAmount = payments.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0) + (parseFloat(curr.interest_amount) || 0), 0);

  // Render Loading State - only if we don't have summary data (first load)
  if (isLoading && !summaryData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-success-300/25 border-t-success-400 mx-auto mb-4"></div>
          <p className="text-lg text-bgray-600 dark:text-bgray-50">{t('payments.loadingBalance')}</p>
        </div>
      </div>
    );
  }

  // Render Error State
  if (fetchError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full">
        <div className="text-center bg-red-50 dark:bg-red-900/20 p-8 rounded-lg border border-red-200 dark:border-red-800">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">{t('payments.connectionError')}</h3>
          <p className="text-red-600 dark:text-red-400">{t('common.error')}: {fetchError}</p>
          <button
            onClick={fetchAllData}
            className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-white rounded hover:bg-red-200 transition-colors"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto pb-20">
      <div className="space-y-8">
        {/* Hero Section */}
        <section>
          <HeroSection
            balance={summaryData?.balance}
            currency={summaryData?.currency}
            userName={user?.name}
          />
        </section>

        {/* Stats Overview */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatsOverview
            totalPaid={totalPaid}
            totalAmount={totalAmount}
            currency={summaryData?.currency}
          />
          <NextPaymentCard
            payments={payments}
            currency={summaryData?.currency}
          />
        </section>

        {/* Timeline */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-bgray-900 dark:text-white">
              {t('payments.paymentHistory')}
            </h2>
          </div>
          <PaymentTimeline payments={payments} onPaymentSuccess={fetchAllData} />
        </section>
      </div>
    </div>
  );
}

export default Summary;