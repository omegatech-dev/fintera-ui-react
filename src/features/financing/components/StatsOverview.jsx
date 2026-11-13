import { useLocale } from '../../../contexts/LocaleContext';
import { formatCurrency } from '../../../shared/utils/formatters';

function StatsOverview({ totalAmount, totalPaid, currency }) {
    const { t } = useLocale();

    const percentage = totalAmount > 0 ? Math.min((totalPaid / totalAmount) * 100, 100) : 0;

    return (
        <div
            id="financing-stats"
            className="w-full rounded-card border border-line bg-surface p-5"
        >
            <div className="mb-4 flex items-center justify-between gap-4">
                <h3 className="text-title font-bold text-ink">
                    {t('payments.paymentProgress')}
                </h3>
                <span className="rounded-chip bg-brand-soft px-2.5 py-1 text-micro font-semibold text-brand-strong tabular-nums">
                    {percentage.toFixed(1)}%
                </span>
            </div>

            <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-surface-2">
                <div
                    className="h-2 rounded-full bg-brand transition-all duration-700 ease-out"
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <div className="flex justify-between gap-4 text-body">
                <div>
                    <p className="mb-1 text-label font-medium text-ink-3">{t('payments.totalPaid')}</p>
                    <p className="font-bold text-ink tabular-nums">{formatCurrency(totalPaid, currency)}</p>
                </div>
                <div className="text-right">
                    <p className="mb-1 text-label font-medium text-ink-3">{t('contracts.amount')}</p>
                    <p className="font-bold text-ink tabular-nums">{formatCurrency(totalAmount, currency)}</p>
                </div>
            </div>
        </div>
    );
}

export default StatsOverview;
