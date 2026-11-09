
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faMapMarkerAlt, faTag } from "@fortawesome/free-solid-svg-icons";
import { useLocale } from "../../../../../contexts/LocaleContext";

const LotProjectTab = ({ contract }) => {
    const { t } = useLocale();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Project Card */}
            <div className="space-y-6">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                        <FontAwesomeIcon icon={faBuilding} className="text-xl" />
                    </div>
                    <h5 className="text-xl font-black text-bgray-900 dark:text-white">{t("contractDetailsModal.project")}</h5>
                </div>

                <div className="bg-white dark:bg-darkblack-500 rounded-3xl border border-gray-100 dark:border-darkblack-400 shadow-xs p-8 space-y-6">
                    <div>
                        <p className="text-xs font-bold text-bgray-400 uppercase tracking-widest mb-1">{t("contractDetailsModal.name")}</p>
                        <p className="text-lg font-black text-bgray-900 dark:text-white">{contract.project_name || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-bgray-400 uppercase tracking-widest mb-1">{t("contractDetailsModal.address")}</p>
                        <div className="flex items-start gap-2">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-bgray-400 mt-1" />
                            <p className="text-base font-medium text-bgray-600 dark:text-bgray-300 leading-relaxed">{contract.project_address || "N/A"}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-bgray-400 uppercase tracking-widest mb-1">{t("contractDetailsModal.id")}</p>
                        <p className="text-sm font-mono font-bold text-bgray-500">{contract.project_id || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-bgray-400 uppercase tracking-widest mb-1">GUID</p>
                        <p className="text-sm font-mono font-bold text-bgray-500 truncate" title={contract.project_guid}>{contract.project_guid || "N/A"}</p>
                    </div>
                </div>
            </div>

            {/* Lot Card */}
            <div className="space-y-6">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                        <FontAwesomeIcon icon={faTag} className="text-xl" />
                    </div>
                    <h5 className="text-xl font-black text-bgray-900 dark:text-white">{t("contractDetailsModal.lot")}</h5>
                </div>

                <div className="bg-white dark:bg-darkblack-500 rounded-3xl border border-gray-100 dark:border-darkblack-400 shadow-xs p-8 space-y-6">
                    <div>
                        <p className="text-xs font-bold text-bgray-400 uppercase tracking-widest mb-1">{t("contractDetailsModal.name")}</p>
                        <p className="text-lg font-black text-bgray-900 dark:text-white">{contract.lot_name || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-bgray-400 uppercase tracking-widest mb-1">{t("contractDetailsModal.address")}</p>
                        <div className="flex items-start gap-2">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-bgray-400 mt-1" />
                            <p className="text-base font-medium text-bgray-600 dark:text-bgray-300 leading-relaxed">{contract.lot_address || "N/A"}</p>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-bold text-bgray-400 uppercase tracking-widest mb-1">{t("contractDetailsModal.id")}</p>
                        <p className="text-sm font-mono font-bold text-bgray-500">{contract.lot_id || "N/A"}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default LotProjectTab;
