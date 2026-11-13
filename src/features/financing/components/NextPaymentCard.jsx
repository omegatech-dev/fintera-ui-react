import { useLocale } from '../../../contexts/LocaleContext';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';

function NextPaymentCard({ payments, currency }) {
    const { t } = useLocale();

    const nextPayment = payments
        .filter((p) => (p.status || '').toLowerCase() !== 'paid' && (p.status || '').toLowerCase() !== 'rejected' && new Date(p.due_date) >= new Date())
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];

    if (!nextPayment) {
        return (
            <div className="flex w-full flex-col items-center justify-center rounded-card border border-line bg-surface p-6 text-center">
                <p className="text-body font-medium text-ink-3">{t('payments.noUpcomingPayments')}</p>
            </div>
        );
    }

    const totalDue = Number(nextPayment.amount || 0) + Number(nextPayment.interest_amount || 0);
    const displayProject = nextPayment.project_name || nextPayment.contract?.lot?.project?.name || '';
    const displayLot = nextPayment.lot_name || nextPayment.contract?.lot?.name || '';
    const paymentContext = [nextPayment.description, displayProject && displayLot ? `${displayProject} – ${displayLot}` : displayProject || displayLot].filter(Boolean);

    return (
        <div
            id="financing-next-payment"
            className="w-full rounded-card border border-line bg-surface p-5"
        >
            <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-control bg-warning-soft text-warning">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </span>
                <h3 className="text-title font-bold text-ink">
                    {t('payments.nextPayment')}
                </h3>
            </div>

            <div className="mt-4 space-y-1.5">
                {paymentContext.length > 0 && (
                    <p className="text-body font-medium text-ink-2">
                        {paymentContext.join(' · ')}
                    </p>
                )}
                <p className="text-page font-bold text-ink tabular-nums">
                    {formatCurrency(totalDue, currency)}
                </p>
                <p className="inline-flex items-center gap-2 rounded-chip bg-warning-soft px-2.5 py-1 text-micro font-semibold text-warning">
                    <span className="h-1.5 w-1.5 rounded-full bg-warning" aria-hidden="true" />
                    {formatDate(nextPayment.due_date)}
                </p>
            </div>

            <div className="mt-4 border-t border-line pt-3">
                <p className="text-micro leading-relaxed text-ink-3">
                    {t('payments.detailedPaymentInfo')}
                </p>
            </div>
        </div>
    );
}

export default NextPaymentCard;
