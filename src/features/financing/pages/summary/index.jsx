import { useContext, useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";

import AuthContext from "../../../../contexts/AuthContext";
import { usersApi } from "../../../users/api";
import { useLocale } from "../../../../contexts/LocaleContext";

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
      setFetchError(error.message || t('payments.fetchPaymentsError'));
    } finally {
      setIsLoading(false);
    }
  }, [user, userId, t]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);



  // derived stats
  const totalPaid = payments.reduce((acc, curr) => acc + (parseFloat(curr.paid_amount) || 0), 0);
  const totalAmount = payments.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0) + (parseFloat(curr.interest_amount) || 0), 0);

  // Render Loading State - only if we don't have summary data (first load)
  if (isLoading && !summaryData) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-brand/25 border-t-brand" />
          <p className="text-body text-ink-3">{t('payments.loadingBalance')}</p>
        </div>
      </div>
    );
  }

  // Render Error State
  if (fetchError) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <div className="rounded-card border border-danger/30 bg-danger-soft p-6 text-center sm:p-8">
          <div className="mb-3 text-danger">
            <svg className="mx-auto h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="mb-1 text-title font-bold text-danger">{t('payments.connectionError')}</h3>
          <p className="text-body text-ink-2">{t('common.error')}: {fetchError}</p>
          <button
            onClick={fetchAllData}
            className="mt-4 rounded-control bg-danger px-4 py-2 text-label font-semibold text-white transition-opacity hover:opacity-90"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 pb-20">
      <HeroSection
        balance={summaryData?.balance}
        currency={summaryData?.currency}
        userName={user?.name}
      />

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
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

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-section font-bold text-ink">
            {t('payments.paymentHistory')}
          </h2>
        </div>
        <PaymentTimeline payments={payments} onPaymentSuccess={fetchAllData} />
      </section>
    </div>
  );
}

export default Summary;
