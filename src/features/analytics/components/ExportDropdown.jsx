import { memo, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "../../../contexts/LocaleContext";
import { useToast } from "../../../contexts/ToastContext";
import { reportsApi } from "@/shared/api/reports";

const REPORT_TYPES = [
    {
        id: "commissions_csv",
        titleKey: "reports.commissionsCsv",
        type: "report",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <polyline points="16 11 18 13 22 9" />
            </svg>
        ),
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10",
    },
    {
        id: "total_revenue_csv",
        titleKey: "reports.revenueFlowCsv",
        type: "report",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
        ),
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
    },
    {
        id: "overdue_payments_csv",
        titleKey: "reports.overduePaymentsCsv",
        type: "report",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
        ),
        color: "text-rose-500",
        bgColor: "bg-rose-500/10",
    }
];

const EXPORT_FORMATS = [
    {
        id: "csv",
        label: "CSV",
        type: "base",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <polyline points="9 15 12 18 15 15" />
            </svg>
        ),
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
    },
    {
        id: "xlsx",
        label: "Excel",
        type: "base",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <path d="M8 13h2l2 2 2-2h2" />
                <path d="M8 17h2l2-2 2 2h2" />
            </svg>
        ),
        color: "text-green-500",
        bgColor: "bg-green-500/10",
    }
];

const ExportDropdown = memo(function ExportDropdown({ startDate, endDate, onExportBase }) {
    const { t } = useLocale();
    const { showToast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleReportDownload = async (reportId) => {
        if (!startDate || !endDate) {
            showToast(t('reports.selectBothDates'), "error");
            return;
        }

        try {
            const blob = await reportsApi.downloadReport(reportId, {
                start_date: startDate,
                end_date: endDate,
            });

            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${reportId}-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast(t("common.downloadSuccess"), "success");
            setIsOpen(false);
        } catch {
            showToast(t('reports.downloadError'), "error");
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all duration-300
                    ${isOpen
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                        : "bg-white dark:bg-darkblack-600 text-gray-700 dark:text-white border border-gray-200 dark:border-darkblack-500 hover:border-blue-400 shadow-xs"
                    }
                `}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {t("common.export") || "Export"}
                <motion.svg
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-1"
                >
                    <polyline points="6 9 12 15 18 9" />
                </motion.svg>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-72 bg-white dark:bg-darkblack-600 rounded-3xl shadow-2xl border border-gray-100 dark:border-darkblack-500 z-[100] overflow-hidden"
                    >
                        <div className="p-4">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">
                                {t("reports.dataExport") || "Data Export"}
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {EXPORT_FORMATS.map((format) => (
                                    <button
                                        key={format.id}
                                        onClick={() => {
                                            onExportBase(format.id);
                                            setIsOpen(false);
                                        }}
                                        className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-darkblack-500 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-darkblack-400 group"
                                    >
                                        <div className={`p-2 rounded-xl ${format.bgColor} ${format.color} mb-2 group-hover:scale-110 transition-transform`}>
                                            {format.icon}
                                        </div>
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{format.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="h-[1px] bg-gray-100 dark:bg-darkblack-500 my-2" />

                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider my-3 px-2">
                                {t("reports.financialReports") || "Financial Reports"}
                            </div>
                            <div className="space-y-1">
                                {REPORT_TYPES.map((report) => (
                                    <button
                                        key={report.id}
                                        onClick={() => handleReportDownload(report.id)}
                                        className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-darkblack-500 transition-all border border-transparent hover:border-gray-100 dark:hover:border-darkblack-400 group text-left"
                                    >
                                        <div className={`p-2 rounded-xl ${report.bgColor} ${report.color} group-hover:scale-110 transition-transform`}>
                                            {report.icon}
                                        </div>
                                        <div>
                                            <span className="block text-sm font-bold text-gray-700 dark:text-gray-200">
                                                {t(report.titleKey)}
                                            </span>
                                            <span className="block text-[10px] text-gray-400">
                                                {t("common.downloadCsv") || "Download .csv"}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {(!startDate || !endDate) && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 flex items-center gap-2">
                                <svg className="text-amber-500 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 leading-tight">
                                    {t("reports.selectDates") || "Select a date range for reports"}
                                </span>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

export default ExportDropdown;
