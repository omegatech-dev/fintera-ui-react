import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUser,
    faTrashAlt,
    faWindowClose,
} from "@fortawesome/free-solid-svg-icons";
import { formatStatus } from "@/shared/utils/formatStatus";

const DetailsSidebar = ({
    contract,
    displayContract,
    statusTheme,
    tabs,
    activeTab,
    setActiveTab,
    isAdmin,
    isDeleting,
    handleDeleteContract,
    onClose,
    t
}) => {
    return (
        <div className="w-full md:w-80 shrink-0 bg-gray-50/50 dark:bg-darkblack-500/50 backdrop-blur-xs border-b md:border-b-0 md:border-r border-gray-100 dark:border-darkblack-400 flex flex-col">
            {/* Sidebar Header with Status */}
            <div className={`p-8 ${statusTheme.bg} transition-colors duration-500`}>
                <div className="flex items-center gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${statusTheme.shadow}`} style={{ backgroundColor: statusTheme.color }}>
                        <FontAwesomeIcon icon={statusTheme.icon} className="text-2xl" />
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] opacity-60 dark:opacity-40">{t("common.status")}</p>
                        <p className={`text-lg font-black ${statusTheme.text} capitalize`}>{formatStatus(contract.status, t)}</p>
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-black text-bgray-900 dark:text-white leading-tight flex items-center gap-3">
                        {contract.contract_id || "#N/A"}
                    </h3>
                    <p className="text-sm font-medium text-bgray-500 dark:text-bgray-400">
                        {t("contracts.created")} {new Date(contract.created_at).toLocaleDateString()}
                    </p>
                    {(displayContract?.created_by) && (
                        <p className="text-sm font-medium text-bgray-500 dark:text-bgray-400 mt-1 flex items-center gap-2">
                            <FontAwesomeIcon icon={faUser} className="text-bgray-400" />
                            {t("contractDetailsModal.reservedBy") || t("lotsTable.reservedBy")}: <span className="font-semibold text-bgray-700 dark:text-bgray-300">{displayContract.created_by}</span>
                        </p>
                    )}
                </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
                {tabs.map((tab) => (tab.show !== false && (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`group flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-300 ${activeTab === tab.id
                            ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20 translate-x-1"
                            : "text-bgray-500 dark:text-bgray-400 hover:bg-white dark:hover:bg-darkblack-400 hover:text-blue-500"
                            }`}
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${activeTab === tab.id ? "bg-white/20" : "bg-gray-100 dark:bg-darkblack-400 group-hover:scale-110"
                            }`}>
                            <FontAwesomeIcon icon={tab.icon} />
                        </div>
                        {tab.label}
                    </button>
                )))}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-6 border-t border-gray-100 dark:border-darkblack-400 space-y-3">
                {isAdmin && contract?.status?.toLowerCase() === "rejected" && (
                    <button
                        type="button"
                        onClick={handleDeleteContract}
                        disabled={isDeleting}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-black hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300 disabled:opacity-50"
                    >
                        {isDeleting ? (
                            <div className="w-5 h-5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                        ) : (
                            <FontAwesomeIcon icon={faTrashAlt} />
                        )}
                        {t("contractDetailsModal.deleteContract")}
                    </button>
                )}
                <button
                    onClick={onClose}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gray-100 dark:bg-darkblack-400 text-bgray-600 dark:text-bgray-300 font-black hover:bg-gray-200 dark:hover:bg-darkblack-300 transition-all duration-300"
                >
                    <FontAwesomeIcon icon={faWindowClose} />
                    {t("common.close")}
                </button>
            </div>
        </div>
    );
};

export default DetailsSidebar;
