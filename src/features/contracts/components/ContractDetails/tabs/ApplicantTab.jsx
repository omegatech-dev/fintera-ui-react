
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faIdCard, faPhone } from "@fortawesome/free-solid-svg-icons";
import { useLocale } from "@/contexts/LocaleContext";
import AuthContext from "@/contexts/AuthContext";
import { useContext } from "react";

const ApplicantTab = ({ contract }) => {
    const { t } = useLocale();
    const { user } = useContext(AuthContext);
    const isAdmin = user?.role === "admin";

    return (
        <div className="space-y-10">
            {/* Applicant Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                    <FontAwesomeIcon icon={faUser} className="text-xl" />
                </div>
                <div>
                    <h5 className="text-xl font-black text-bgray-900 dark:text-white">{t("contractDetailsModal.applicant")}</h5>
                    <p className="text-sm font-medium text-bgray-500">{t("contracts.clientDetails") || "Información del cliente y perfil crediticio"}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Details Card */}
                <div className="bg-white dark:bg-darkblack-500 rounded-3xl border border-gray-100 dark:border-darkblack-400 shadow-xs p-8 space-y-8">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-3xl font-black text-indigo-600">
                            {contract.applicant_name?.charAt(0)}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-bgray-400 uppercase tracking-widest mb-1">{t("contractDetailsModal.name")}</p>
                            <p className="text-xl font-black text-bgray-900 dark:text-white">{contract.applicant_name || "N/A"}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 pt-4 border-t border-gray-50 dark:border-darkblack-400">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <FontAwesomeIcon icon={faIdCard} className="text-bgray-400 text-xs" />
                                <p className="text-xs font-bold text-bgray-400 uppercase tracking-widest">{t("contractDetailsModal.identity")}</p>
                            </div>
                            <p className="text-base font-bold text-bgray-900 dark:text-white font-mono">{contract.applicant_identity || "N/A"}</p>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <FontAwesomeIcon icon={faPhone} className="text-bgray-400 text-xs" />
                                <p className="text-xs font-bold text-bgray-400 uppercase tracking-widest">{t("contractDetailsModal.phone")}</p>
                            </div>
                            <p className="text-base font-bold text-bgray-900 dark:text-white">{contract.applicant_phone || "N/A"}</p>
                        </div>
                    </div>
                </div>

                {/* Credit Score Visualization (FICO 300–850) - Only visible for Admin */}
                {isAdmin && contract.applicant_credit_score !== undefined && (() => {
                    const ficoMin = 300, ficoMax = 850, circumference = 283;
                    const score = Math.round(Math.max(ficoMin, Math.min(ficoMax, contract.applicant_credit_score)));
                    const fillLength = ((score - ficoMin) / (ficoMax - ficoMin)) * circumference;
                    const isExcellent = score >= 750;
                    const isGood = score >= 670 && score < 750;
                    return (
                        <div className="bg-white dark:bg-darkblack-500 rounded-3xl border border-gray-100 dark:border-darkblack-400 shadow-xs p-8 flex flex-col items-center justify-center text-center">
                            <p className="text-xs font-bold text-bgray-400 uppercase tracking-widest mb-6">{t("contractDetailsModal.creditScore")}</p>

                            <div className="relative w-40 h-40 mb-6">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="10" fill="none" className="text-gray-100 dark:text-darkblack-400" />
                                    <motion.circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        stroke="currentColor"
                                        strokeWidth="10"
                                        fill="none"
                                        strokeLinecap="round"
                                        initial={{ strokeDasharray: "0 283" }}
                                        animate={{ strokeDasharray: `${fillLength} 283` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className={`${isExcellent ? "text-emerald-500" : isGood ? "text-amber-500" : "text-red-500"}`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-black text-bgray-900 dark:text-white">{score}</span>
                                    <span className="text-xs font-bold text-bgray-400">/ {ficoMax}</span>
                                </div>
                            </div>

                            <div className={`px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest ${isExcellent ? "bg-emerald-50 text-emerald-600" : isGood ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"}`}>
                                {isExcellent ? t("creditScore.excellent") : isGood ? t("creditScore.good") : t("creditScore.needsImprovement")}
                            </div>
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};
export default ApplicantTab;
