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
        color: "text-brand",
        bgColor: "bg-brand-soft",
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
        color: "text-info",
        bgColor: "bg-info-soft",
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
        color: "text-danger",
        bgColor: "bg-danger-soft",
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
        color: "text-warning",
        bgColor: "bg-warning-soft",
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
        color: "text-brand-strong",
        bgColor: "bg-brand-soft",
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
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`flex h-[38px] items-center gap-2 rounded-control border px-3.5 text-label font-semibold transition-colors ${
                    isOpen
                        ? "border-brand bg-brand-soft text-brand-strong"
                        : "border-line bg-surface text-ink-2 hover:bg-surface-2"
                }`}
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
                        className="absolute right-0 z-[100] mt-2 w-72 overflow-hidden rounded-card border border-line bg-surface shadow-pop"
                    >
                        <div className="p-3">
                            <div className="mb-2 px-2 text-micro font-bold uppercase tracking-wide text-ink-3">
                                {t("reports.dataExport") || "Data Export"}
                            </div>
                            <div className="mb-3 grid grid-cols-2 gap-2">
                                {EXPORT_FORMATS.map((format) => (
                                    <button
                                        key={format.id}
                                        onClick={() => {
                                            onExportBase(format.id);
                                            setIsOpen(false);
                                        }}
                                        className="group flex flex-col items-center justify-center rounded-control border border-transparent p-2.5 transition-colors hover:border-line hover:bg-surface-2"
                                    >
                                        <div className={`mb-1.5 rounded-control p-2 ${format.bgColor} ${format.color}`}>
                                            {format.icon}
                                        </div>
                                        <span className="text-label font-semibold text-ink-2">{format.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="my-2 h-px bg-line" />

                            <div className="my-2 px-2 text-micro font-bold uppercase tracking-wide text-ink-3">
                                {t("reports.financialReports") || "Financial Reports"}
                            </div>
                            <div className="space-y-1">
                                {REPORT_TYPES.map((report) => (
                                    <button
                                        key={report.id}
                                        onClick={() => handleReportDownload(report.id)}
                                        className="group flex w-full items-center gap-2.5 rounded-control border border-transparent p-2 text-left transition-colors hover:border-line hover:bg-surface-2"
                                    >
                                        <div className={`rounded-control p-2 ${report.bgColor} ${report.color}`}>
                                            {report.icon}
                                        </div>
                                        <div>
                                            <span className="block text-label font-semibold text-ink-2">
                                                {t(report.titleKey)}
                                            </span>
                                            <span className="block text-micro text-ink-3">
                                                {t("common.downloadCsv") || "Download .csv"}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {(!startDate || !endDate) && (
                            <div className="flex items-center gap-2 bg-warning-soft p-3">
                                <svg className="shrink-0 text-warning" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                <span className="text-micro font-semibold leading-tight text-warning">
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
