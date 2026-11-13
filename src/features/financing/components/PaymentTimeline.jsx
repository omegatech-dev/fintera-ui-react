import { useMemo, useState } from 'react';
import TimelinePaymentCard from './TimelinePaymentCard';
import { useLocale } from '../../../contexts/LocaleContext';

function PaymentTimeline({ payments, onPaymentSuccess }) {
    const { t } = useLocale();
    const [showAllUpcoming, setShowAllUpcoming] = useState(false);
    const [showAllPaid, setShowAllPaid] = useState(false);

    const { rejected, overdue, upcoming, paid } = useMemo(() => {
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

    const sectionTitle = "flex items-center gap-2.5 text-title font-bold text-ink";

    const emptyState = (
        <div className="rounded-card border border-line bg-surface py-10 text-center text-body text-ink-3">
            <p>{t('payments.noPayments')}</p>
        </div>
    );

    return (
        <div id="financing-timeline" className="space-y-9">
            {rejected.length > 0 && (
                <section>
                    <h3 className={`${sectionTitle} mb-4`}>
                        <span className="h-2 w-2 rounded-full bg-danger" aria-hidden="true" />
                        {t('payments.rejectedPayments')}
                    </h3>
                    <div className="space-y-3">
                        {rejected.map((p) => (
                            <TimelinePaymentCard key={p.id} payment={p} onPaymentSuccess={onPaymentSuccess} />
                        ))}
                    </div>
                </section>
            )}

            {overdue.length > 0 && (
                <section>
                    <h3 className={`${sectionTitle} mb-4`}>
                        <span className="h-2 w-2 rounded-full bg-danger" aria-hidden="true" />
                        {t('payments.overdue')}
                    </h3>
                    <div className="space-y-3">
                        {overdue.map((p, i) => (
                            <TimelinePaymentCard key={p.id} payment={p} onPaymentSuccess={onPaymentSuccess} cardId={i === 0 ? "financing-first-payment-card" : undefined} />
                        ))}
                    </div>
                </section>
            )}

            {upcoming.length > 0 && (
                <section>
                    <div className="mb-4 flex items-center justify-between gap-4">
                        <h3 className={sectionTitle}>
                            <span className="h-2 w-2 rounded-full bg-warning" aria-hidden="true" />
                            {t('payments.upcoming')}
                        </h3>
                        {upcoming.length > 3 && (
                            <button
                                onClick={() => setShowAllUpcoming(!showAllUpcoming)}
                                className="text-label font-semibold text-brand transition-colors hover:text-brand-strong"
                            >
                                {showAllUpcoming ? t('payments.showLess') : `${t('common.viewMore')} (${upcoming.length - 3})`}
                            </button>
                        )}
                    </div>
                    <div className="space-y-3">
                        {displayedUpcoming.map((p, i) => (
                            <TimelinePaymentCard key={p.id} payment={p} onPaymentSuccess={onPaymentSuccess} cardId={overdue.length === 0 && i === 0 ? "financing-first-payment-card" : undefined} />
                        ))}
                    </div>
                </section>
            )}

            {paid.length > 0 && (
                <section>
                    <div className="mb-4 flex items-center justify-between gap-4">
                        <h3 className={sectionTitle}>
                            <span className="h-2 w-2 rounded-full bg-brand" aria-hidden="true" />
                            {t('payments.completed')}
                        </h3>
                        {paid.length > 3 && (
                            <button
                                onClick={() => setShowAllPaid(!showAllPaid)}
                                className="text-label font-semibold text-ink-3 transition-colors hover:text-ink"
                            >
                                {showAllPaid ? t('payments.showLess') : `${t('common.viewMore')} (${paid.length - 3})`}
                            </button>
                        )}
                    </div>
                    <div className={`space-y-3 transition-opacity ${!showAllPaid ? 'opacity-75' : ''}`}>
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
