import { useLocale } from '@/contexts/LocaleContext';
import { formatCurrency } from '@/shared/utils/formatters';

function HeroSection({ balance, currency, userName }) {
    const { t } = useLocale();

    return (
        <div
            id="financing-hero"
            className="w-full rounded-card border border-line bg-surface p-5 sm:p-6"
        >
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                <div className="min-w-0">
                    <p className="inline-flex items-center gap-2 text-micro font-semibold uppercase tracking-wide text-ink-3">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
                        {t('payments.welcomeMessage', { name: userName?.split(' ')[0] || t('dashboard.user') })}
                    </p>

                    <h1 className="mt-2 text-page font-bold tracking-tight text-ink">
                        {t('payments.balanceDashboard')}
                    </h1>
                    <p className="mt-1 max-w-md text-body text-ink-3">
                        {t('payments.managePayments')}
                    </p>
                </div>

                <div className="w-full rounded-card border border-brand/20 bg-brand-soft/60 p-5 lg:w-auto lg:min-w-[280px]">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-label font-semibold uppercase tracking-wide text-brand-strong">
                            {t('payments.balance')}
                        </span>
                        <span className="flex h-8 w-8 items-center justify-center rounded-control bg-surface text-brand">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </span>
                    </div>

                    <p className="mt-2 text-display font-bold tracking-tight text-brand-strong tabular-nums">
                        {formatCurrency(balance ?? 0, currency)}
                    </p>

                    <span className="mt-3 inline-flex items-center gap-2 rounded-chip bg-surface px-2.5 py-1 text-micro font-semibold uppercase tracking-wide text-brand-strong">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
                        {t('payments.statusOptions.approved')}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default HeroSection;
