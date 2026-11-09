
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle, faCalculator, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { contractsApi } from "../../api";
import { useToast } from "../../../../contexts/ToastContext";
import { useLocale } from "../../../../contexts/LocaleContext";

const EditMoratoryModal = ({
    editingMora,
    onClose,
    moratoryAmount,
    setMoratoryAmount,
    schedule,
    setSchedule
}) => {
    const { showToast } = useToast();
    const { t } = useLocale();

    const [actionLoading, setActionLoading] = useState(false);

    const handleUpdateMoratory = async () => {
        setActionLoading(true);
        try {
            const newMora = parseFloat(moratoryAmount) || 0;
            const data = await contractsApi.updateMoratory(editingMora, newMora);

            // Update local schedule
            const safeSchedule = Array.isArray(schedule) ? schedule : [];
            const updatedSchedule = safeSchedule.map(payment =>
                payment.id === editingMora
                    ? { ...payment, interest_amount: data.payment.interest_amount }
                    : payment
            );
            setSchedule(updatedSchedule);

            showToast(t('contracts.moratoryUpdated'), "success");
            onClose();
        } catch {
            showToast(t('contracts.errorUpdatingMoratory'), "error");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {editingMora !== null && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-bgray-900/60 dark:bg-black/80 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-white dark:bg-darkblack-600 rounded-[2.5rem] shadow-2xl overflow-hidden w-full max-w-lg border border-gray-100 dark:border-darkblack-400"
                    >
                        <div className="p-8">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-white text-2xl shadow-xl shadow-amber-500/20">
                                    <FontAwesomeIcon icon={faExclamationTriangle} />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                        {t('contracts.editMoratory')}
                                    </h4>
                                    <p className="text-sm font-bold text-gray-400">
                                        {t('contracts.updateMoratoryInfo')}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
                                        {t('contracts.moratoryInterest')}
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <FontAwesomeIcon icon={faCalculator} className="text-amber-500 group-focus-within:scale-110 transition-transform" />
                                        </div>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={moratoryAmount}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const num = parseFloat(val);
                                                if (val !== "" && !isNaN(num) && num < 0) return;
                                                setMoratoryAmount(val);
                                            }}
                                            className="w-full pl-10 pr-4 py-4 bg-gray-50 dark:bg-darkblack-500 border-2 border-transparent focus:border-amber-500/50 rounded-2xl dark:text-white font-bold transition-all outline-hidden"
                                        />
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-100 dark:border-blue-900/20 flex gap-3">
                                    <FontAwesomeIcon icon={faInfoCircle} className="mt-1 text-blue-500" />
                                    <p className="text-xs font-bold leading-relaxed text-blue-700 dark:text-blue-300">
                                        {t('contracts.moratoryEditWarning')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-10">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-8 py-4 text-[10px] font-black uppercase tracking-[0.25em] rounded-2xl bg-gray-50 dark:bg-darkblack-500 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    onClick={handleUpdateMoratory}
                                    disabled={actionLoading}
                                    className="flex-[2] px-8 py-4 text-[10px] font-black uppercase tracking-[0.25em] rounded-2xl bg-amber-500 text-white shadow-xl shadow-amber-500/20 hover:bg-amber-600 transition-all transform hover:scale-[1.02]"
                                >
                                    {actionLoading ? t('common.loading') : t('common.save')}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default EditMoratoryModal;
