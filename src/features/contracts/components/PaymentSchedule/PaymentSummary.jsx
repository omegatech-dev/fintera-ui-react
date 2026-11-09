
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChartLine,
    faBolt,
    faUser,
    faPhone,
    faIdCard,
    faProjectDiagram,
    faMapMarkerAlt,
    faCalendarAlt,
    faHistory,
    faClock,
    faCoins,
    faHandHoldingUsd,
    faCalculator
} from "@fortawesome/free-solid-svg-icons";
import CreditScoreCard from "../CreditScoreCard";

const PaymentSummary = ({
    summary,
    paidAmount,
    displayBalance,
    progressPercent,
    activeMonths,
    currentContract,
    activeUser,
    t,
    fmt
}) => {
    return (
        <div className="py-6 space-y-8">
            {/* Unified Health Hub */}
            <div className="bg-white dark:bg-darkblack-600 rounded-[2.5rem] p-8 border border-gray-100 dark:border-darkblack-500 shadow-2xl shadow-blue-500/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-blue-500/10 transition-all duration-1000" />

                <div className="relative z-10 flex flex-col gap-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center text-sm shadow-xs">
                                    <FontAwesomeIcon icon={faChartLine} />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">{t('contracts.totalValue')}</p>
                            </div>
                            <h4 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                                {fmt(summary?.price)}
                            </h4>
                        </div>

                        <div className="flex items-center gap-10">
                            <div className="space-y-1 text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">{t('contracts.paid')}</p>
                                <p className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                                    {fmt(paidAmount)}
                                </p>
                            </div>
                            <div className="w-px h-8 bg-gray-100 dark:bg-darkblack-500" />
                            <div className="space-y-1 text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">{t('contracts.balance')}</p>
                                <p className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                                    {fmt(displayBalance)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="relative h-2 bg-gray-100 dark:bg-darkblack-500 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                    width: `${progressPercent}%`
                                }}
                                transition={{ duration: 1.5, ease: "circOut" }}
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                            />
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                            <span className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faBolt} className="animate-pulse" />
                                {Math.round(progressPercent)}% {t('contracts.completed')}
                            </span>
                            <span className="text-gray-400">{t('contracts.healthIndicator')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Creative Cohesion Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {/* Pod 1: Client & Record - Integrated Credit Score */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-[1.5rem] bg-gray-50/50 dark:bg-darkblack-500/20 border border-gray-100 dark:border-darkblack-400/50 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                        <FontAwesomeIcon icon={faUser} className="text-6xl" />
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-start mb-1">
                            <p className="text-[9px] font-black uppercase tracking-widest text-blue-500">{t('contracts.clientRecord')}</p>
                        </div>

                        {(activeUser?.role === "admin" || activeUser?.role === "seller") && (
                            <CreditScoreCard creditScore={currentContract?.applicant_credit_score} />
                        )}

                        <div>
                            <h5 className="text-sm font-black text-gray-900 dark:text-white mb-1 truncate">{currentContract?.applicant_name || t('contractInfo.client')}</h5>
                            <p className="text-[10px] font-bold text-gray-400 mb-3 truncate">#{currentContract?.id} · {currentContract?.status || "Active"}</p>

                            {/* Contact Information */}
                            <div className="space-y-2">
                                {currentContract?.applicant_phone && (
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
                                        <FontAwesomeIcon icon={faPhone} className="text-[8px] text-gray-300" />
                                        <span className="truncate">{currentContract.applicant_phone}</span>
                                    </div>
                                )}
                                {currentContract?.applicant_identity && (
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
                                        <FontAwesomeIcon icon={faIdCard} className="text-[8px] text-gray-300" />
                                        <span className="truncate">{currentContract.applicant_identity}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Pod 2: Lot Information - Specific Specs */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="p-4 rounded-[1.5rem] bg-gray-50/50 dark:bg-darkblack-500/20 border border-gray-100 dark:border-darkblack-400/50 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                        <FontAwesomeIcon icon={faProjectDiagram} className="text-6xl" />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-500 mb-3">{t('contracts.lotInformation')}</p>
                    <h5 className="text-sm font-black text-gray-900 dark:text-white mb-1 truncate">{currentContract?.lot_name || t('contracts.lot')}</h5>
                    <p className="text-[10px] font-bold text-gray-400 mb-3 truncate">{currentContract?.project_name}</p>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">{t('projects.area')}</span>
                                <span className="text-[11px] font-black text-blue-600 dark:text-blue-400">
                                    {currentContract?.lot_area || "—"} m²
                                </span>
                            </div>
                            <div className="w-px h-5 bg-gray-200 dark:bg-darkblack-400" />
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">{t('projects.dimensions')}</span>
                                <span className="text-[11px] font-black text-gray-500 dark:text-gray-400">
                                    {currentContract?.lot_width && currentContract?.lot_length ?
                                        `${currentContract.lot_width} x ${currentContract.lot_length}` : "—"}
                                </span>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-gray-100 dark:border-darkblack-400/50 space-y-2">
                            <div className="flex items-center gap-2 text-[10px] font-black text-blue-600">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[8px]" />
                                <span className="truncate uppercase tracking-tight opacity-80">
                                    {currentContract?.lot_address || "—"}
                                </span>
                            </div>
                            {currentContract?.project_address && (
                                <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400">
                                    <FontAwesomeIcon icon={faProjectDiagram} className="text-[7px]" />
                                    <span className="truncate">
                                        {currentContract.project_address}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Pod 3: Financial Terms - Interest & Rate */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 rounded-[1.5rem] bg-gray-50/50 dark:bg-darkblack-500/20 border border-gray-100 dark:border-darkblack-400/50 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-6xl" />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-amber-500 mb-3">{t('contracts.terms')}</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">{t('contracts.months')}</p>
                            <p className="text-base font-black text-gray-900 dark:text-white">{summary?.term || 0}</p>
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">{t('contracts.rate')}</p>
                            <p className="text-base font-black text-amber-600">{summary?.interestRate || 0}%</p>
                        </div>
                    </div>
                </motion.div>

                {/* Pod 4: Timeline - Creation & Dates */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 rounded-[1.5rem] bg-gray-50/50 dark:bg-darkblack-500/20 border border-gray-100 dark:border-darkblack-400/50 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                        <FontAwesomeIcon icon={faHistory} className="text-6xl" />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-rose-500 mb-3">{t('contracts.timeline')}</p>
                    <div className="space-y-3">
                        <div>
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">{t('contractInfo.created')}</p>
                            <p className="text-[10px] font-bold text-gray-900 dark:text-white">
                                {currentContract?.created_at ? new Date(currentContract.created_at).toLocaleDateString() : "—"}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faClock} className="text-[10px] text-gray-400" />
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                                {t('contracts.activeSince')} {activeMonths} {t('common.months.jan').toLowerCase() === 'ene' ? 'meses' : 'months'}
                            </span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Detail Row (Reserve/Downpayment etc) */}
            <div className="bg-gray-50/30 dark:bg-darkblack-500/10 rounded-3xl p-6 border border-gray-100/50 dark:border-darkblack-400/30 flex flex-wrap items-center justify-between gap-8">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center text-xs">
                        <FontAwesomeIcon icon={faCoins} />
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('contracts.reserve')}</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white">{fmt(summary?.reserve)}</p>
                    </div>
                </div>
                <div className="h-4 w-px bg-gray-200 dark:bg-darkblack-400 hidden md:block" />
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center text-xs">
                        <FontAwesomeIcon icon={faHandHoldingUsd} />
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('contracts.downPayment')}</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white">{fmt(summary?.downPayment)}</p>
                    </div>
                </div>
                <div className="h-4 w-px bg-gray-200 dark:bg-darkblack-400 hidden md:block" />
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center text-xs">
                        <FontAwesomeIcon icon={faCalculator} />
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('contracts.financed')}</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white">{fmt(summary?.financed)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSummary;
