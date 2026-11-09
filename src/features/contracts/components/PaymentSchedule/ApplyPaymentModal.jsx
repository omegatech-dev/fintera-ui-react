
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandHoldingUsd, faCoins, faDollarSign, faExclamationTriangle, faInfoCircle, faCalculator } from "@fortawesome/free-solid-svg-icons";
import { contractsApi } from "../../api";
import { useToast } from "../../../../contexts/ToastContext";
import { useLocale } from "../../../../contexts/LocaleContext";

const ApplyPaymentModal = ({
    isOpen,
    onClose,
    selectedPayment,
    contract,
    onPaymentSuccess,
    schedule,
    setSchedule
}) => {
    const { showToast } = useToast();
    const { t } = useLocale();

    const [editableAmount, setEditableAmount] = useState("");
    const [editableInterest, setEditableInterest] = useState("");
    const [editableTotal, setEditableTotal] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    // Initialize fields when modal opens

    const handleApplyPayment = async () => {
        setActionLoading(true);
        try {
            const paymentAmount = parseFloat(editableAmount) || 0;

            if (selectedPayment?.isCapitalPayment) {
                // Handle capital payment (abono a capital)
                if (paymentAmount <= 0) {
                    showToast(t('contracts.capitalPaymentAmountRequired'), "error");
                    setActionLoading(false);
                    return;
                }

                // Make API call for capital payment
                const data = await contractsApi.capitalRepayment(
                    contract?.project_id,
                    contract?.lot_id,
                    contract?.id,
                    paymentAmount
                );

                // Call callback
                if (onPaymentSuccess) {
                    onPaymentSuccess(data, true); // true indicates capital payment
                }

                // Show success feedback
                let successMessage = `${t('contracts.capitalPayment')} ${t('contracts.appliedSuccessfully')}`;
                if (data.reajusted_payments_count > 0) {
                    successMessage += ` - ${data.reajusted_payments_count} ${t('contracts.paymentsReadjusted')}`;
                }
                showToast(successMessage, "success");

            } else {
                // Handle regular payment
                const interestAmount = parseFloat(editableInterest) || 0;
                const paidAmount = parseFloat(editableTotal) || 0;

                if (paidAmount <= 0) {
                    showToast(t('contracts.totalAmountRequired'), "error");
                    setActionLoading(false);
                    return;
                }

                // Make API call to approve payment
                const data = await contractsApi.approvePayment(selectedPayment.id, {
                    amount: parseFloat(editableAmount) || 0,
                    interest_amount: interestAmount,
                    paid_amount: paidAmount
                });

                // Update local schedule optimistically if needed, but we typically reload or use returned data
                // logic moved from parent:
                const safeSchedule = Array.isArray(schedule) ? schedule : [];
                const updatedSchedule = safeSchedule.map(payment =>
                    payment.id === selectedPayment.id
                        ? {
                            ...payment,
                            status: data.payment.status || 'paid',
                            paid_amount: data.payment.paid_amount,
                            interest_amount: data.payment.interest_amount,
                            payment_date: data.payment.payment_date,
                            approved_at: data.payment.approved_at
                        }
                        : payment
                );
                setSchedule(updatedSchedule);

                if (onPaymentSuccess) {
                    onPaymentSuccess(data, false); // false = regular payment
                }

                showToast(`${t('contracts.payment')} ${t('contracts.appliedSuccessfully')}`, "success");
            }

            setTimeout(() => {
                onClose();
                setEditableAmount("");
                setEditableInterest("");
                setEditableTotal("");
                setActionLoading(false);
            }, 500);

        } catch (error) {
            console.error('Error applying payment:', error);
            const paymentType = selectedPayment?.isCapitalPayment ? t('contracts.capitalPayment').toLowerCase() : t('contracts.payment').toLowerCase();
            showToast(`${t('contracts.errorApplying')} ${paymentType}: ${error.message}`, "error");
            setActionLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && selectedPayment && (
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
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl shadow-xl ${selectedPayment?.isCapitalPayment ? "bg-blue-600 shadow-blue-500/20" : "bg-blue-600 shadow-blue-500/20"}`}>
                                    <FontAwesomeIcon icon={selectedPayment?.isCapitalPayment ? faHandHoldingUsd : faCoins} />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                        {selectedPayment?.isCapitalPayment ? t('contracts.capitalPayment') : t('contracts.applyPayment')}
                                    </h4>
                                    <p className="text-sm font-bold text-gray-400">
                                        {selectedPayment?.isCapitalPayment
                                            ? t('contracts.capitalPaymentDescription')
                                            : `${t('contracts.paymentFor')} #${selectedPayment.id}`
                                        }
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
                                        {selectedPayment?.isCapitalPayment ? t('contracts.capitalPaymentAmount') : t('contracts.paymentAmount')}
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <FontAwesomeIcon icon={faDollarSign} className="text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                                        </div>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={editableAmount}
                                            onChange={(e) => {
                                                const newAmount = e.target.value;
                                                const num = parseFloat(newAmount);
                                                if (newAmount !== "" && !isNaN(num) && num < 0) return;
                                                setEditableAmount(newAmount);
                                                if (!selectedPayment?.isCapitalPayment) {
                                                    const amount = parseFloat(newAmount) || 0;
                                                    const interest = parseFloat(editableInterest) || 0;
                                                    setEditableTotal((amount + interest).toString());
                                                }
                                            }}
                                            placeholder={selectedPayment?.isCapitalPayment ? t('contracts.enterCapitalPaymentAmount') : ""}
                                            className="w-full pl-10 pr-4 py-4 bg-gray-50 dark:bg-darkblack-500 border-2 border-transparent focus:border-blue-500/50 rounded-2xl dark:text-white font-bold transition-all outline-hidden"
                                        />
                                    </div>
                                </div>

                                {!selectedPayment?.isCapitalPayment && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
                                                {t('contracts.interestMoratory')}
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-400" />
                                                </div>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={editableInterest}
                                                    onChange={(e) => {
                                                        const newInterest = e.target.value;
                                                        const num = parseFloat(newInterest);
                                                        if (newInterest !== "" && !isNaN(num) && num < 0) return;
                                                        setEditableInterest(newInterest);
                                                        const amount = parseFloat(editableAmount) || 0;
                                                        const interest = parseFloat(newInterest) || 0;
                                                        setEditableTotal((amount + interest).toString());
                                                    }}
                                                    className="w-full pl-10 pr-4 py-4 bg-amber-50/50 dark:bg-amber-900/10 border-2 border-transparent focus:border-amber-500/50 rounded-2xl dark:text-white font-bold transition-all outline-hidden"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
                                                {t('contracts.totalPaymentAmount')}
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <FontAwesomeIcon icon={faCalculator} className="text-blue-500" />
                                                </div>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={editableTotal}
                                                    readOnly
                                                    className="w-full pl-10 pr-4 py-4 bg-blue-50/50 dark:bg-blue-900/20 border-2 border-blue-100 dark:border-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400 font-black transition-all outline-hidden"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className={`p-4 rounded-2xl border-2 flex gap-3 ${selectedPayment?.isCapitalPayment ? "bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20" : "bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20"}`}>
                                    <FontAwesomeIcon icon={faInfoCircle} className={`mt-1 ${selectedPayment?.isCapitalPayment ? "text-blue-500" : "text-amber-500"}`} />
                                    <p className={`text-xs font-bold leading-relaxed ${selectedPayment?.isCapitalPayment ? "text-blue-700 dark:text-blue-300" : "text-amber-700 dark:text-amber-300"}`}>
                                        {selectedPayment?.isCapitalPayment ? t('contracts.capitalPaymentInfo') : t('contracts.amountInterestWarning')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-10">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-8 py-4 text-[10px] font-black uppercase tracking-[0.25em] rounded-2xl bg-gray-50 dark:bg-darkblack-500 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all border border-transparent hover:border-gray-200 dark:hover:border-darkblack-400"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    onClick={handleApplyPayment}
                                    disabled={actionLoading}
                                    className={`flex-[2] px-8 py-4 text-[10px] font-black uppercase tracking-[0.25em] rounded-2xl text-white shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] ${selectedPayment?.isCapitalPayment
                                        ? "bg-emerald-500 shadow-emerald-500/20 hover:bg-emerald-600"
                                        : "bg-blue-600 shadow-blue-500/20 hover:bg-blue-700"
                                        }`}
                                >
                                    {actionLoading
                                        ? (selectedPayment?.isCapitalPayment ? t('contracts.applyingCapitalPayment') : t('contracts.applyingPayment'))
                                        : (selectedPayment?.isCapitalPayment ? t('contracts.applyCapitalPayment') : t('contracts.applyPayment'))
                                    }
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ApplyPaymentModal;
