import React from 'react';
import TimelinePaymentCard from './TimelinePaymentCard';
import { useLocale } from '../../../contexts/LocaleContext';

function PaymentTimeline({ payments, onPaymentSuccess }) {
    const { t } = useLocale();
    const [showAllUpcoming, setShowAllUpcoming] = React.useState(false);
    const [showAllPaid, setShowAllPaid] = React.useState(false);

    const { rejected, overdue, upcoming, paid } = React.useMemo(() => {
        const now = new Date();
        const rejected = [];
        const overdue = [];
        const upcoming = [];
        const paid = [];

        // Pre-parse dates once to optimize sorting and filtering
        const processedPayments = payments.map(p => ({
            ...p,
            _dueDateObj: new Date(p.due_date),
            _statusLower: (p.status || '').toLowerCase()
        }));

        processedPayments.sort((a, b) => a._dueDateObj - b._dueDateObj);

        processedPayments.forEach(p => {
            if (p._statusLower === 'rejected') {
                rejected.push(p);
            } else if (p._statusLower === 'paid') {
                paid.push(p);
            } else if (p._dueDateObj < now) {
                overdue.push(p);
            } else if (p._dueDateObj >= now) {
                upcoming.push(p);
            }
        });

        return { rejected, overdue, upcoming, paid };
    }, [payments]);

    const displayedUpcoming = showAllUpcoming ? upcoming : upcoming.slice(0, 3);
    const displayedPaid = showAllPaid ? paid : paid.slice(0, 3);

    const emptyState = (
        <div className="text-center py-10 text-bgray-500">
            <p>{t('payments.noPayments')}</p>
        </div>
    );

    return (
        <div id="financing-timeline" className="space-y-12">
            {rejected.length > 0 && (
                <section>
                    <h3 className="text-rose-600 dark:text-rose-400 font-bold mb-6 flex items-center gap-3 text-lg">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2z" />
                        </svg>
                        {t('payments.rejectedPayments')}
                    </h3>
                    <div className="ml-1 space-y-4">
                        {rejected.map((p) => (
                            <TimelinePaymentCard key={p.id} payment={p} onPaymentSuccess={onPaymentSuccess} />
                        ))}
                    </div>
                </section>
            )}

            {overdue.length > 0 && (
                <section>
                    <h3 className="text-rose-500 font-bold mb-6 flex items-center gap-3 text-lg">
                        <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"></span>
                        {t('payments.overdue')}
                    </h3>
                    <div className="ml-1 space-y-4">
                        {overdue.map((p, i) => (
                            <TimelinePaymentCard key={p.id} payment={p} onPaymentSuccess={onPaymentSuccess} cardId={i === 0 ? "financing-first-payment-card" : undefined} />
                        ))}
                    </div>
                </section>
            )}

            {upcoming.length > 0 && (
                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-bgray-900 dark:text-white font-bold flex items-center gap-3 text-lg">
                            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span>
                            {t('payments.upcoming')}
                        </h3>
                        {upcoming.length > 3 && (
                            <button
                                onClick={() => setShowAllUpcoming(!showAllUpcoming)}
                                className="text-sm font-medium text-success-300 hover:text-success-400 transition-colors"
                            >
                                {showAllUpcoming ? t('payments.showLess') : `${t('common.viewMore')} (${upcoming.length - 3})`}
                            </button>
                        )}
                    </div>
                    <div className="ml-1 space-y-4">
                        {displayedUpcoming.map((p, i) => (
                            <TimelinePaymentCard key={p.id} payment={p} onPaymentSuccess={onPaymentSuccess} cardId={overdue.length === 0 && i === 0 ? "financing-first-payment-card" : undefined} />
                        ))}
                    </div>
                </section>
            )}

            {paid.length > 0 && (
                <section>
                    <div className="flex justify-between items-center mb-6 opacity-80">
                        <h3 className="text-bgray-900 dark:text-white font-bold flex items-center gap-3 text-lg">
                            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                            {t('payments.completed')}
                        </h3>
                        {paid.length > 3 && (
                            <button
                                onClick={() => setShowAllPaid(!showAllPaid)}
                                className="text-sm font-medium text-bgray-500 hover:text-bgray-700 dark:hover:text-bgray-300 transition-colors"
                            >
                                {showAllPaid ? t('payments.showLess') : `${t('common.viewMore')} (${paid.length - 3})`}
                            </button>
                        )}
                    </div>
                    <div className={`ml-1 space-y-4 ${!showAllPaid ? 'opacity-70' : ''} transition-opacity`}>
                        {displayedPaid.map((p, i) => (
                            <TimelinePaymentCard key={p.id} payment={p} onPaymentSuccess={onPaymentSuccess} cardId={overdue.length === 0 && upcoming.length === 0 && i === 0 ? "financing-first-payment-card" : undefined} />
                        ))}
                    </div>
                </section>
            )}

            {payments.length === 0 && emptyState}
        </div>
    );
}

export default PaymentTimeline;
