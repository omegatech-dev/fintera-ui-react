import React from 'react';
import { useLocale } from '../../../contexts/LocaleContext';

function NextPaymentCard({ payments, currency }) {
    const { t } = useLocale();

    const nextPayment = payments
        .filter(p => (p.status || '').toLowerCase() !== 'paid' && (p.status || '').toLowerCase() !== 'rejected' && new Date(p.due_date) >= new Date())
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];

    if (!nextPayment) {
        return (
            <div className="w-full bg-white dark:bg-bgray-900/50 backdrop-blur-xs border border-bgray-200 dark:border-bgray-800 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
                <p className="text-bgray-500 font-medium">{t('payments.noUpcomingPayments')}</p>
            </div>
        );
    }

    const totalDue = Number(nextPayment.amount || 0) + Number(nextPayment.interest_amount || 0);
    const dueDate = new Date(nextPayment.due_date);
    const displayProject = nextPayment.project_name || nextPayment.contract?.lot?.project?.name || '';
    const displayLot = nextPayment.lot_name || nextPayment.contract?.lot?.name || '';
    const paymentContext = [nextPayment.description, displayProject && displayLot ? `${displayProject} – ${displayLot}` : displayProject || displayLot].filter(Boolean);

    return (
        <div id="financing-next-payment" className="w-full bg-white dark:bg-bgray-900/50 backdrop-blur-xs border border-bgray-200 dark:border-bgray-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all group overflow-hidden relative">
            {/* Dynamic background accent */}
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <svg className="w-24 h-24 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                </svg>
            </div>

            <div className="relative z-10">
                <h3 className="text-sm font-bold text-bgray-500 dark:text-bgray-400 uppercase tracking-widest mb-4">
                    {t('payments.nextPayment')}
                </h3>

                <div className="space-y-1">
                    {paymentContext.length > 0 && (
                        <p className="text-sm font-medium text-bgray-700 dark:text-bgray-300 mb-2">
                            {paymentContext.join(' · ')}
                        </p>
                    )}
                    <p className="text-3xl font-black text-bgray-900 dark:text-white">
                        {currency} {totalDue.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                        <p className="text-base font-bold text-purple-600 dark:text-purple-400">
                            {dueDate.toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-bgray-100 dark:border-bgray-800">
                    <p className="text-xs text-bgray-400 leading-relaxed italic">
                        {t('payments.detailedPaymentInfo')}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default NextPaymentCard;
