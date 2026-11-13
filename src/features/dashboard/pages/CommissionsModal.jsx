import { useState, useEffect, useCallback } from "react";
import { useLocale } from "../../../contexts/LocaleContext";
import { formatCurrency } from "../../../shared/utils/formatters";
import Dialog from "../../../shared/ui/Dialog";

import { dashboardApi } from "../api";

const CommissionsModal = ({ isActive, handleClose, initialDate }) => {
    const { t } = useLocale();
    const [selectedDate, setSelectedDate] = useState(initialDate || new Date());
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ totalCommissions: 0, distinctProjectCount: 0 });

    const fetchCommissions = useCallback(async () => {
        setLoading(true);
        try {
            // Get first and last day of selected month
            const year = selectedDate.getFullYear();
            const constMB = selectedDate.getMonth() + 1;
            const monthStr = constMB < 10 ? `0${constMB}` : constMB;

            const startDate = `${year}-${monthStr}-01`;
            // Calculate last day
            const lastDay = new Date(year, selectedDate.getMonth() + 1, 0).getDate();
            const endDate = `${year}-${monthStr}-${lastDay}`;

            const data = await dashboardApi.getCommissions(startDate, endDate);

            if (data) {
                const items = data.commissions || [];
                setCommissions(items);

                // Calculate pseudo stats
                const total = items.reduce((acc, curr) => acc + (curr.commission || 0), 0);
                const projects = new Set(items.map(i => i.project)).size;
                setStats({ totalCommissions: total, distinctProjectCount: projects });
            }
        } catch (error) {
            console.error("Failed to fetch commissions", error);
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    useEffect(() => {
        if (initialDate) {
            setSelectedDate(initialDate);
        }
    }, [initialDate]);

    useEffect(() => {
        if (isActive) {
            fetchCommissions();
        }
    }, [isActive, selectedDate, fetchCommissions]);

    const handleDownloadCSV = async () => {
        try {
            const year = selectedDate.getFullYear();
            const constMB = selectedDate.getMonth() + 1;
            const monthStr = constMB < 10 ? `0${constMB}` : constMB;
            const startDate = `${year}-${monthStr}-01`;
            const lastDay = new Date(year, selectedDate.getMonth() + 1, 0).getDate();
            const endDate = `${year}-${monthStr}-${lastDay}`;

            const blob = await dashboardApi.downloadCommissionsCsv(startDate, endDate);

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `commissions-${startDate}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to download CSV", error);
        }
    };

    const changeMonth = (offset) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setSelectedDate(newDate);
    };

    const months = [
        t("months.january"), t("months.february"), t("months.march"), t("months.april"),
        t("months.may"), t("months.june"), t("months.july"), t("months.august"),
        t("months.september"), t("months.october"), t("months.november"), t("months.december")
    ];

    if (!isActive) return null;

    return (
        <Dialog
            open={Boolean(isActive)}
            onClose={handleClose}
            size="lg"
            className="max-w-4xl max-h-[90vh] overflow-y-auto p-0"
        >
                <div className="bg-white dark:bg-darkblack-600 rounded-3xl w-full flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="relative p-6 border-b border-gray-100 dark:border-darkblack-500 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50 dark:bg-darkblack-600">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </span>
                                {t("commissions.title") || "Commissions Report"}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {t("commissions.subtitle") || "Track your earnings and sales performance"}
                            </p>
                        </div>

                        <div className="flex items-center bg-white dark:bg-darkblack-500 rounded-xl p-1 shadow-xs border border-gray-100 dark:border-darkblack-400">
                            <button
                                onClick={() => changeMonth(-1)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-darkblack-400 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <span className="w-40 text-center font-bold text-gray-800 dark:text-white select-none">
                                {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                            </span>
                            <button
                                onClick={() => changeMonth(1)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-darkblack-400 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>

                        <button onClick={handleClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {/* Stats Summary */}
                    <div className="grid grid-cols-2 gap-4 p-6 bg-white dark:bg-darkblack-600 border-b border-gray-100 dark:border-darkblack-500">
                        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-darkblack-500 border border-indigo-100 dark:border-darkblack-400">
                            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-1">{t("commissions.periodTotal") || "Total for Period"}</p>
                            <p className="text-2xl font-bold text-indigo-900 dark:text-white">{formatCurrency(stats.totalCommissions)}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-green-50 dark:bg-darkblack-500 border border-green-100 dark:border-darkblack-400">
                            <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">{t("commissions.projectsActive") || "Active Projects"}</p>
                            <p className="text-2xl font-bold text-green-900 dark:text-white">{stats.distinctProjectCount}</p>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30 dark:bg-darkblack-700">
                        {loading ? (
                            <div className="flex h-40 items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                            </div>
                        ) : commissions.length > 0 ? (
                            <div className="bg-white dark:bg-darkblack-600 rounded-xl shadow-xs border border-gray-100 dark:border-darkblack-500 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-darkblack-500 border-b border-gray-100 dark:border-darkblack-400">
                                        <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            <th className="px-6 py-4">{t("commissions.date") || "Date"}</th>
                                            <th className="px-6 py-4">{t("commissions.customer") || "Customer"}</th>
                                            <th className="px-6 py-4">{t("commissions.project") || "Project"}</th>
                                            <th className="px-6 py-4">{t("commissions.financingType") || "Financing Type"}</th>
                                            <th className="px-6 py-4 text-right">{t("commissions.saleValue") || "Sale Value"}</th>
                                            <th className="px-6 py-4 text-right">{t("commissions.amount") || "Commission"}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-darkblack-400">
                                        {commissions.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-darkblack-500 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{item.date}</td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{item.client_name}</div>
                                                    <div className="text-xs text-gray-500">ID: {item.contract_id}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 dark:text-white">{item.project}</div>
                                                    <div className="text-xs text-indigo-500">{item.lot}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                    {item.financing_type}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-right text-gray-600 dark:text-gray-300 font-mono">
                                                    {formatCurrency(item.amount)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-right font-bold text-green-600 dark:text-green-400 font-mono">
                                                    {formatCurrency(item.commission)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500">
                                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                {t("commissions.noData") || "No commissions found for this period"}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-100 dark:border-darkblack-500 bg-white dark:bg-darkblack-600 flex justify-end">
                        <button
                            onClick={handleDownloadCSV}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            {t("commissions.downloadCSV") || "Download CSV"}
                        </button>
                    </div>
                </div>
        </Dialog>
    );
};

export default CommissionsModal;
