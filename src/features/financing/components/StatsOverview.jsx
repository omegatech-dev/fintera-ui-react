import React from 'react';
import { useLocale } from '../../../contexts/LocaleContext';

function StatsOverview({ totalAmount, totalPaid, currency }) {
    const { t } = useLocale();

    const percentage = totalAmount > 0 ? Math.min((totalPaid / totalAmount) * 100, 100) : 0;

    const formatCurrency = (value) => {
        if (typeof value !== 'number') return '—';
        return value.toLocaleString('en-US', { style: 'currency', currency: currency || 'USD' });
    };

    return (
        <div id="financing-stats" className="w-full bg-white dark:bg-darkblack-600 rounded-xl p-6 shadow-xs border border-bgray-200 dark:border-darkblack-500">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-bgray-900 dark:text-white">
                    {t('payments.paymentProgress')}
                </h3>
                <span className="text-sm font-medium text-bgray-500 dark:text-bgray-400">
                    {percentage.toFixed(1)}%
                </span>
            </div>

            <div className="w-full bg-bgray-200 dark:bg-darkblack-400 rounded-full h-3 mb-4 overflow-hidden">
                <div
                    className="bg-success-300 h-3 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>

            <div className="flex justify-between text-sm">
                <div>
                    <p className="text-bgray-500 dark:text-bgray-400 mb-1">{t('payments.totalPaid')}</p>
                    <p className="font-bold text-bgray-900 dark:text-white">{formatCurrency(totalPaid)}</p>
                </div>
                <div className="text-right">
                    <p className="text-bgray-500 dark:text-bgray-400 mb-1">{t('contracts.amount')}</p>
                    <p className="font-bold text-bgray-900 dark:text-white">{formatCurrency(totalAmount)}</p>
                </div>
            </div>
        </div>
    );
}

export default StatsOverview;
