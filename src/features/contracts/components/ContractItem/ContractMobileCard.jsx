
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMapMarkerAlt,
    faCheckCircle,
    faTimesCircle,
    faReceipt,
    faEye,
    faCreditCard,
    faCalendarAlt,
    faTrashAlt,
    faCopy
} from "@fortawesome/free-solid-svg-icons";
import { formatStatus } from "../../../../shared/utils/formatStatus";
import { formatCurrency } from "../../../../shared/utils/formatters";
import { useToast } from "../../../../contexts/ToastContext";
import { createPortal } from "react-dom";
import PaymentScheduleModal from "../PaymentScheduleModal";
import RejectionModal from "../RejectionModal";
import ContractDetailsModal from "../ContractDetailsModal";

const ContractMobileCard = ({
    contract,
    userRole,
    refreshContracts,
    t,
    getStatusTheme,
    translateFinancingType,
    formatDate,

    handleNavigateToLot,
    handleNavigateToClient,
    handleApprove,
    handleReject,
    handleDeleteContract,
    actionLoading,
    deleteLoading,
    showSchedule,
    setShowSchedule,
    showRejectionModal,
    setShowRejectionModal,
    showDetailsModal,
    setShowDetailsModal
}) => {
    const { showToast } = useToast();
    const statusTheme = getStatusTheme(contract.status);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{
                y: -8,
                scale: 1.01,
                boxShadow: `0 20px 25px -5px ${statusTheme.color}20, 0 8px 10px -6px ${statusTheme.color}20`,
                transition: { duration: 0.2 }
            }}
            className={`relative group bg-white dark:bg-darkblack-600 rounded-[2.5rem] border-2 ${statusTheme.border} ${statusTheme.shadow} transition-all duration-300 w-full h-full flex flex-col overflow-hidden`}
        >
            {/* Creative GUID Tag (Vertical "System Passport" style) */}
            {contract.guid && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center h-full pointer-events-none z-20 overflow-hidden">
                    <div
                        className="whitespace-nowrap flex items-center text-[7px] font-mono font-black text-bgray-300 dark:text-darkblack-400 rotate-90 origin-left ml-2 tracking-[0.4em] opacity-40 select-none uppercase"
                        style={{ filter: "grayscale(1) contrast(1.2)" }}
                    >
                        SYS-AUTH // {contract.guid}
                    </div>
                </div>
            )}

            {/* Top-Right Menu & Actions */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
                {userRole !== "seller" && ["approved", "closed"].includes(contract.status?.toLowerCase()) && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowSchedule(true); }}
                        id="contract-schedule-btn"
                        title={t("contracts.paymentSchedule")}
                        className="w-10 h-10 flex items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all shadow-xs hover:shadow-lg hover:scale-110 active:scale-95"
                    >
                        <FontAwesomeIcon icon={faReceipt} className="text-sm" />
                    </button>
                )}
                <button
                    onClick={(e) => { e.stopPropagation(); setShowDetailsModal(true); }}
                    id="contract-view-details-btn"
                    title={t("common.view")}
                    className="w-10 h-10 flex items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-xs hover:shadow-lg hover:scale-110 active:scale-95"
                >
                    <FontAwesomeIcon icon={faEye} className="text-sm" />
                </button>

            </div>

            <div className="p-5 flex-1 flex flex-col">
                {/* Header: Lot and Status */}
                <div className="mb-4 pr-24">
                    <div
                        onClick={handleNavigateToLot}
                        className="cursor-pointer group/title min-h-[60px]"
                    >
                        <h3 className="text-xl font-bold text-bgray-900 dark:text-white group-hover/title:text-blue-600 dark:group-hover/title:text-blue-400 transition-colors leading-tight line-clamp-2">
                            {contract.lot_name || "N/A"}
                        </h3>
                        <div className="flex flex-col gap-1 mt-1.5">
                            <p className="text-xs text-bgray-600 dark:text-bgray-400 font-bold flex items-center truncate">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1.5 text-bgray-400 group-hover/title:text-blue-500 transition-colors" />
                                {contract.project_name || "—"}
                            </p>
                            {contract.guid && (
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(contract.guid);
                                        showToast(t("common.copiedToClipboard") || "Copiado al portapapeles", "success");
                                    }}
                                    className="text-[10px] text-bgray-400 dark:text-bgray-500 font-mono flex items-center gap-1.5 bg-gray-50 dark:bg-darkblack-500 px-2 py-0.5 rounded-md self-start border border-gray-100 dark:border-darkblack-400 cursor-pointer group/guid hover:border-blue-300/30 transition-all hover:bg-white dark:hover:bg-darkblack-400 shadow-xs"
                                >
                                    <span className="font-black text-[12px] tracking-widest opacity-100 uppercase">{t("contracts.id")}:</span>
                                    <span className="truncate max-w-[250px]">{contract.guid}</span>
                                    <FontAwesomeIcon icon={faCopy} className="ml-1 text-[8px] opacity-0 group-hover/guid:opacity-100 transition-opacity" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className={`inline-flex self-start px-2.5 py-1 rounded-full ${statusTheme.bg} ${statusTheme.text} text-[9px] font-extrabold uppercase tracking-widest border ${statusTheme.border} items-center mb-5 shadow-xs`}>
                    <FontAwesomeIcon icon={statusTheme.icon} className="mr-1.5" />
                    {formatStatus(contract.status?.toLowerCase(), t)}
                </div>

                {/* Client Info */}
                <div
                    onClick={handleNavigateToClient}
                    className="flex items-center p-3 bg-gray-50 dark:bg-darkblack-500 rounded-xl mb-5 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors border border-transparent hover:border-blue-100 dark:hover:border-blue-800/30 shadow-subtle"
                >
                    <div className="w-9 h-9 shrink-0 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shadow-md uppercase text-sm">
                        {contract.applicant_name?.charAt(0) || "?"}
                    </div>
                    <div className="ml-3 overflow-hidden">
                        <p className="text-sm font-bold text-bgray-900 dark:text-white truncate">
                            {contract.applicant_name || "N/A"}
                        </p>
                        <p className="text-[10px] text-bgray-600 dark:text-bgray-400 font-mono mt-1 truncate">
                            {contract.applicant_identity || "—"}
                        </p>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6 px-1">
                    <div className="space-y-1">
                        <p className="text-[9px] uppercase font-bold text-bgray-500 dark:text-bgray-500 tracking-widest">
                            {t("contracts.financing")}
                        </p>
                        <p className="text-xs font-bold text-bgray-800 dark:text-bgray-300 flex items-center truncate">
                            <FontAwesomeIcon icon={faCreditCard} className="mr-2 text-blue-500 opacity-70" />
                            {translateFinancingType(contract.financing_type, t)}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[9px] uppercase font-bold text-bgray-500 dark:text-bgray-500 tracking-widest text-right">
                            {t("contracts.created")}
                        </p>
                        <p className="text-xs font-bold text-bgray-800 dark:text-bgray-300 flex items-center justify-end truncate">
                            <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-indigo-500 opacity-70" />
                            {formatDate(contract.created_at)}
                        </p>
                    </div>
                </div>

                {/* Payment Progress Indicator */}
                {["approved", "closed"].includes(contract.status?.toLowerCase()) && contract.amount > 0 && (
                    <div className="mb-5 bg-gray-50 dark:bg-darkblack-500 rounded-xl p-3 border border-gray-100 dark:border-darkblack-400">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-bgray-500 dark:text-bgray-400 tracking-wider mb-1">
                                    {t("contracts.balance")?.includes("contracts.balance") ? "Saldo Pendiente" : (t("contracts.balance") || "Saldo Pendiente")}
                                </p>
                                <p className="text-base font-extrabold text-bgray-900 dark:text-white">
                                    {formatCurrency(contract.balance, contract.currency)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] uppercase font-bold text-bgray-500 dark:text-bgray-400 tracking-wider mb-1">
                                    {t("contracts.total") || "Total Deuda"}
                                </p>
                                <p className="text-xs font-bold text-bgray-700 dark:text-bgray-300">
                                    {formatCurrency(contract.amount, contract.currency)}
                                </p>
                            </div>
                        </div>

                        <div className="relative h-2 w-full bg-gray-200 dark:bg-darkblack-300 rounded-full overflow-hidden">
                            <div
                                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${((Number(contract.total_paid ?? (Number(contract.amount) - Number(contract.balance)))) / Number(contract.amount || 1)) >= 1
                                    ? 'bg-green-500'
                                    : 'bg-blue-500'
                                    }`}
                                style={{
                                    width: `${Math.max(0, Math.min(100, ((Number(contract.total_paid ?? (Number(contract.amount) - Number(contract.balance)))) / Number(contract.amount || 1)) * 100))}%`
                                }}
                            />
                        </div>
                        <div className="flex justify-between mt-2">
                            <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                {formatCurrency(
                                    Number(contract.total_paid ?? (Number(contract.amount) - Number(contract.balance))),
                                    contract.currency
                                )} / {formatCurrency(contract.amount, contract.currency)}
                            </p>
                        </div>
                    </div>
                )}

                {contract.status?.toLowerCase() === "rejected" && contract.rejection_reason && (
                    <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl">
                        <p className="text-[9px] font-bold text-red-800 dark:text-red-400 uppercase tracking-wider mb-1">
                            {t("contracts.rejectionReason")}
                        </p>
                        <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed italic line-clamp-2" title={contract.rejection_reason}>
                            "{contract.rejection_reason}"
                        </p>
                    </div>
                )}

                {/* Critical Admin Actions at the bottom */}
                {userRole === "admin" && ["pending", "submitted", "rejected"].includes(contract.status?.toLowerCase()) && (
                    <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-darkblack-500 mt-auto">
                        <button
                            onClick={handleApprove}
                            disabled={actionLoading}
                            className="flex-1 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-bold shadow-xs shadow-green-200 dark:shadow-none transition-all flex items-center justify-center disabled:opacity-50"
                        >
                            <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                            {t("contracts.approve")}
                        </button>
                        {contract.status?.toLowerCase() === "rejected" ? (
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleDeleteContract(e); }}
                                disabled={deleteLoading}
                                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold shadow-xs shadow-red-200 dark:shadow-none transition-all flex items-center justify-center disabled:opacity-50"
                            >
                                {deleteLoading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faTrashAlt} className="mr-2" />
                                        {t("contractDetailsModal.deleteContract")}
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowRejectionModal(true); }}
                                disabled={actionLoading}
                                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold shadow-xs shadow-red-200 dark:shadow-none transition-all flex items-center justify-center disabled:opacity-50"
                            >
                                <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
                                {t("contracts.reject")}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            {
                showSchedule && userRole !== "seller" && createPortal(
                    <PaymentScheduleModal
                        contract={contract}
                        open={showSchedule}
                        onClose={() => setShowSchedule(false)}
                        onPaymentSuccess={refreshContracts}
                    />,
                    document.body
                )
            }
            <RejectionModal isOpen={showRejectionModal} onClose={() => setShowRejectionModal(false)} onSubmit={handleReject} loading={actionLoading} />
            <ContractDetailsModal
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                contract={contract}
                onContractDeleted={() => {
                    setShowDetailsModal(false);
                    refreshContracts();
                }}
            />
        </motion.div >
    );
};

export default ContractMobileCard;
