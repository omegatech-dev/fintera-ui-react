
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMapMarkerAlt,
    faCheckCircle,
    faTimesCircle,
    faReceipt,
    faEye,
    faCreditCard,
    faHome,
    faTrashAlt,
    faCopy
} from "@fortawesome/free-solid-svg-icons";
import { formatStatus } from "../../../../shared/utils/formatStatus";
import { useToast } from "../../../../contexts/ToastContext";
import { createPortal } from "react-dom";
import PaymentScheduleModal from "../PaymentScheduleModal";
import RejectionModal from "../RejectionModal";
import ContractDetailsModal from "../ContractDetailsModal";

const ContractTableRow = ({
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
        <motion.tr
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            whileHover={{ scale: 1.005, transition: { duration: 0.2 } }}
            className="group border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
        >
            <td className="px-6 py-4">
                <div onClick={handleNavigateToLot} className="group cursor-pointer flex items-center">
                    <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400 mr-3 group-hover:bg-green-100 dark:group-hover:bg-green-900/40 transition-colors border border-green-100 dark:border-green-900/20 shadow-xs">
                        <FontAwesomeIcon icon={faHome} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-bgray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors truncate">
                            {contract.lot_name || "N/A"}
                        </p>
                        <p className="text-[10px] text-bgray-500 dark:text-bgray-400 flex items-center mt-0.5 truncate uppercase tracking-tight font-medium">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1 opacity-50 text-[8px]" />
                            {contract.project_name || "—"}
                        </p>
                    </div>
                </div>
            </td>

            <td className="px-6 py-4">
                <div onClick={handleNavigateToClient} className="group cursor-pointer flex items-center">
                    <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-md mr-3 group-hover:scale-105 transition-transform uppercase">
                        {contract.applicant_name?.charAt(0) || "?"}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-bgray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                            {contract.applicant_name || "N/A"}
                        </p>
                        <p className="text-[10px] text-bgray-500 dark:text-bgray-400 font-mono mt-0.5 truncate">
                            {contract.applicant_identity || "—"}
                        </p>
                        {contract.guid && (
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(contract.guid);
                                    showToast(t("common.copiedToClipboard") || "Copiado al portapapeles", "success");
                                }}
                                className="text-[9px] text-bgray-400 dark:text-bgray-500 font-mono mt-1 flex items-center gap-1 cursor-pointer hover:text-blue-500 transition-colors"
                            >
                                <span className="font-black text-[8px] tracking-tighter opacity-70 uppercase">{t("contracts.systemGuid") || "ID"}:</span>
                                <span className="truncate max-w-[120px]">{contract.guid}</span>
                                <FontAwesomeIcon icon={faCopy} className="text-[7px] ml-1" />
                            </div>
                        )}
                    </div>
                </div>
            </td>

            <td className="px-6 py-4 text-center">
                <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/10 text-indigo-700 dark:text-indigo-400 text-xs font-bold border border-indigo-100 dark:border-indigo-800/20 shadow-xs">
                    <FontAwesomeIcon icon={faCreditCard} className="mr-2 opacity-70" />
                    {translateFinancingType(contract.financing_type, t)}
                </div>
            </td>

            <td className="px-6 py-4">
                <div className="flex flex-col items-center gap-1.5">
                    <div className={`px-4 py-1.5 rounded-full ${statusTheme.bg} ${statusTheme.text} text-[10px] font-bold uppercase tracking-wider border ${statusTheme.border} flex items-center shadow-xs`}>
                        <FontAwesomeIcon icon={statusTheme.icon} className="mr-2" />
                        {formatStatus(contract.status?.toLowerCase(), t)}
                    </div>
                </div>
            </td>

            <td className="px-6 py-4 text-center">
                <div className="inline-flex flex-col items-center">
                    <p className="text-xs font-bold text-bgray-800 dark:text-bgray-200">
                        {formatDate(contract.created_at)}
                    </p>
                    <div className="flex items-center mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-1.5" />
                        <p className="text-[10px] font-medium text-bgray-400 uppercase tracking-tighter">
                            {t("contracts.created")}
                        </p>
                    </div>
                </div>
            </td>

            <td className="px-6 py-4 text-center">
                <p className="text-xs font-semibold text-bgray-700 dark:text-bgray-300">
                    {contract.created_by || "—"}
                </p>
            </td>

            <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                    {userRole === "admin" && ["pending", "submitted", "rejected"].includes(contract.status?.toLowerCase()) && (
                        <button
                            onClick={handleApprove}
                            disabled={actionLoading}
                            title={t("contracts.approve")}
                            className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-500 hover:text-white transition-all flex items-center justify-center border border-green-200 dark:border-green-800/30 disabled:opacity-50"
                        >
                            <FontAwesomeIcon icon={faCheckCircle} />
                        </button>
                    )}

                    {userRole === "admin" && ["pending", "submitted"].includes(contract.status?.toLowerCase()) && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowRejectionModal(true); }}
                            disabled={actionLoading}
                            title={t("contracts.reject")}
                            className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-200 dark:border-red-800/30 disabled:opacity-50"
                        >
                            <FontAwesomeIcon icon={faTimesCircle} />
                        </button>
                    )}

                    {userRole === "admin" && contract.status?.toLowerCase() === "rejected" && (
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleDeleteContract(e); }}
                            disabled={deleteLoading}
                            title={t("contractDetailsModal.deleteContract")}
                            className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-200 dark:border-red-800/30 disabled:opacity-50"
                        >
                            {deleteLoading ? (
                                <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                            ) : (
                                <FontAwesomeIcon icon={faTrashAlt} />
                            )}
                        </button>
                    )}

                    {userRole !== "seller" && ["approved", "closed"].includes(contract.status?.toLowerCase()) && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowSchedule(true); }}
                            title={t("contracts.paymentSchedule")}
                            className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center border border-indigo-200 dark:border-indigo-800/30"
                        >
                            <FontAwesomeIcon icon={faReceipt} />
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setShowDetailsModal(true); }}
                        title={t("common.view")}
                        className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center border border-blue-200 dark:border-blue-800/30"
                    >
                        <FontAwesomeIcon icon={faEye} />
                    </button>
                </div>
            </td>

            {/* Modals are handled inside GenericList but for now keeping them here if needed */}
            {showSchedule && userRole !== "seller" && createPortal(
                <PaymentScheduleModal
                    contract={contract}
                    open={showSchedule}
                    onClose={() => setShowSchedule(false)}
                    onPaymentSuccess={refreshContracts}
                />,
                document.body
            )}
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
        </motion.tr>
    );
};

export default ContractTableRow;
