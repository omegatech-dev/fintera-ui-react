
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faExclamationTriangle, faCheckCircle, faClock, faClipboardList, faLock, faBan, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { formatStatus } from "@/shared/utils/formatStatus";
import { formatCurrency } from "@/shared/utils/formatters";
import { useLocale } from "../../../../../contexts/LocaleContext";
import { useToast } from "../../../../../contexts/ToastContext";
import { useMemo } from "react";

// Color mapping for status - keep it local or move to shared
const getStatusTheme = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
        case "pending":
            return {
                bg: "bg-yellow-50 dark:bg-yellow-900/10",
                text: "text-yellow-700 dark:text-yellow-400",
                border: "border-yellow-300 dark:border-yellow-500/40",
                icon: faClock,
                color: "#EAB308",
                shadow: "shadow-yellow-500/10"
            };
        case "submitted":
            return {
                bg: "bg-blue-50 dark:bg-blue-900/10",
                text: "text-blue-700 dark:text-blue-400",
                border: "border-blue-300 dark:border-blue-500/40",
                icon: faClipboardList,
                color: "#3B82F6",
                shadow: "shadow-blue-500/10"
            };
        case "approved":
            return {
                bg: "bg-green-50 dark:bg-green-900/10",
                text: "text-green-700 dark:text-green-400",
                border: "border-green-300 dark:border-green-500/40",
                icon: faCheckCircle,
                color: "#22C55E",
                shadow: "shadow-green-500/10"
            };
        case "rejected":
            return {
                bg: "bg-red-50 dark:bg-red-900/10",
                text: "text-red-700 dark:text-red-400",
                border: "border-red-300 dark:border-red-500/40",
                icon: faExclamationTriangle,
                color: "#EF4444",
                shadow: "shadow-red-500/10"
            };
        case "closed":
            return {
                bg: "bg-blue-50 dark:bg-blue-900/10",
                text: "text-blue-700 dark:text-blue-400",
                border: "border-blue-300 dark:border-blue-500/40",
                icon: faLock,
                color: "#3B82F6",
                shadow: "shadow-blue-500/10"
            };
        case "canceled":
        case "cancelled":
            return {
                bg: "bg-gray-100 dark:bg-gray-800",
                text: "text-gray-500 dark:text-gray-400",
                border: "border-gray-400 dark:border-gray-600",
                icon: faBan,
                color: "#9CA3AF"
            };
        default:
            return {
                bg: "bg-gray-50 dark:bg-gray-900/10",
                text: "text-gray-700 dark:text-gray-400",
                border: "border-gray-300 dark:border-gray-800/30",
                icon: faInfoCircle,
                color: "#6B7280"
            };
    }
};

const OverviewTab = ({ contract, displayContract, progressPercent, paidAmount }) => {
    const { t } = useLocale();
    const { showToast } = useToast();
    const statusTheme = useMemo(() => getStatusTheme(contract?.status), [contract?.status]);

    return (
        <div className="space-y-8">
            {/* GUID Badge at the top of Overview */}
            {contract.guid && (
                <div className="flex justify-end">
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(contract.guid);
                            showToast(t("common.copiedToClipboard") || "Copiado al portapapeles", "success");
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gray-50 dark:bg-darkblack-500/50 border border-bgray-100 dark:border-darkblack-400 group hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 transition-all active:scale-95 shadow-xs"
                        title={t("reservations.systemGuid") || "System ID"}
                    >
                        <span className="text-xs font-black text-bgray-400 dark:text-bgray-500 group-hover:text-blue-500 transition-colors uppercase tracking-wider">
                            {t("reservations.systemGuid") || "SYS-ID"}
                        </span>
                        <span className="text-xs font-mono font-bold text-bgray-600 dark:text-bgray-300 group-hover:text-blue-600">
                            {contract.guid}
                        </span>
                        <FontAwesomeIcon icon={faCopy} className="text-sm text-bgray-300 dark:text-bgray-600 group-hover:text-blue-400 transition-colors" />
                    </button>
                </div>
            )}

            {/* Status Summary Card */}
            <div className={`p-8 rounded-[2rem] border-2 ${statusTheme.border} ${statusTheme.bg} transition-all duration-500`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h5 className={`text-sm font-black uppercase tracking-widest ${statusTheme.text} mb-2 opacity-70`}>{t("contracts.statusSummary") || "Resumen de Estado"}</h5>
                        <p className="text-3xl font-black text-bgray-900 dark:text-white leading-tight max-w-xl">
                            {contract.status?.toLowerCase() === 'approved'
                                ? (t("contracts.approvedWelcome") || "El contrato ha sido aprobado y está activo.")
                                : contract.status?.toLowerCase() === 'rejected'
                                    ? (t("contracts.rejectedNotice") || "Este contrato ha sido rechazado.")
                                    : (t("contracts.pendingReview") || "El contrato está esperando revisión administrativa.")}
                        </p>
                    </div>
                    <div className="shrink-0">
                        <div className={`px-6 py-3 rounded-2xl bg-white dark:bg-darkblack-500 shadow-xl border ${statusTheme.border} flex items-center gap-3`}>
                            <FontAwesomeIcon icon={statusTheme.icon} className={statusTheme.text} />
                            <span className={`text-lg font-black ${statusTheme.text}`}>{formatStatus(contract.status, t)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50/50 dark:bg-darkblack-500/50 p-6 rounded-3xl border border-gray-100 dark:border-darkblack-400">
                    <p className="text-xs font-bold text-bgray-400 uppercase tracking-widest mb-2">{t("contracts.total") || "Total Deuda"}</p>
                    <p className="text-2xl font-black text-bgray-900 dark:text-white">{formatCurrency(contract.amount)}</p>
                </div>
                <div className="bg-gray-50/50 dark:bg-darkblack-500/50 p-6 rounded-3xl border border-gray-100 dark:border-darkblack-400">
                    <p className="text-xs font-bold text-bgray-400 uppercase tracking-widest mb-2">{t("contracts.balance") || "Saldo Pendiente"}</p>
                    <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{formatCurrency(contract.balance)}</p>
                </div>
                <div className="bg-gray-50/50 dark:bg-darkblack-500/50 p-6 rounded-3xl border border-gray-100 dark:border-darkblack-400">
                    <p className="text-xs font-bold text-bgray-400 uppercase tracking-widest mb-2">{t("contracts.progress") || "Progreso"}</p>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-3 bg-gray-200 dark:bg-darkblack-400 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                    width: `${progressPercent}%`
                                }}
                                className="h-full bg-blue-600 rounded-full"
                            />
                        </div>
                        <p className="text-sm font-black text-bgray-900 dark:text-white">
                            {formatCurrency(paidAmount)} / {formatCurrency(displayContract.amount)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Timeline / Additional Info Placeholder */}
            {contract.status?.toLowerCase() === 'rejected' && contract.rejection_reason && (
                <div className="p-8 bg-red-50/50 dark:bg-red-900/10 rounded-[2rem] border-2 border-red-100 dark:border-red-900/20">
                    <h5 className="text-sm font-black uppercase tracking-widest text-red-600 mb-4">{t("contracts.rejectionReason") || "Motivo de Rechazo"}</h5>
                    <p className="text-lg font-medium text-red-800 dark:text-red-300 leading-relaxed italic">
                        "{contract.rejection_reason}"
                    </p>
                </div>
            )}
        </div>
    );
};
export default OverviewTab;
