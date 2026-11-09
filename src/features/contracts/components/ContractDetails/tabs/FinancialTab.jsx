
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalculator, faSave, faExclamationTriangle, faCalendarAlt, faDollarSign, faCreditCard } from "@fortawesome/free-solid-svg-icons";
import { useLocale } from "@/contexts/LocaleContext";
import { useToast } from "@/contexts/ToastContext";
import { contractsApi } from "../../../api";
import { formatCurrency } from "@/shared/utils/formatters";

const FinancialTab = ({ contract, displayContract, fullContract, isEditMode, setIsEditMode, onSaveSuccess, isLoadingFull }) => {
    const { t } = useLocale();
    const { showToast } = useToast();


    const [paymentTerm, setPaymentTerm] = useState(contract?.payment_term ?? "");
    const [reserveAmount, setReserveAmount] = useState(contract?.reserve_amount ?? "");
    const [downPayment, setDownPayment] = useState(contract?.down_payment ?? "");
    const [maxPaymentDate, setMaxPaymentDate] = useState(
        contract?.max_payment_date ? String(contract.max_payment_date).slice(0, 10) : ""
    );
    const [isSaving, setIsSaving] = useState(false);

    // Sync local state from contract when it changes, but only if not editing to avoid overwriting user input?
    // Actually the original code synced on [contract.id, contract.payment_term, ...]
    useEffect(() => {
        if (contract) {
            setPaymentTerm(contract.payment_term ?? "");
            setReserveAmount(contract.reserve_amount ?? "");
            setDownPayment(contract.down_payment ?? "");
            setMaxPaymentDate(contract.max_payment_date ? String(contract.max_payment_date).slice(0, 10) : "");
        }
    }, [contract?.id, contract?.payment_term, contract?.reserve_amount, contract?.down_payment, contract?.max_payment_date, contract]);

    const calculateCurrentMonthlyPayment = () => {
        // If we have full contract details, check the payment schedule for the first installment
        if (fullContract?.payment_schedule && fullContract.payment_schedule.length > 0) {
            const installments = fullContract.payment_schedule.filter(p => p.type?.toLowerCase() === 'installment');
            if (installments.length > 0) {
                // Return first installment amount + interest_amount
                const first = installments[0];
                const totalAmount = Number(first.amount || 0) + Number(first.interest_amount || 0);
                return formatCurrency(totalAmount);
            }
        }

        // Fallback to manual calculation if no schedule is available
        const amount = Number(contract.amount);
        const term = Number(paymentTerm || 0);
        const down = Number(downPayment || 0);
        const reserve = Number(reserveAmount || 0);

        if (!amount || !term || term <= 0) return "N/A";

        const principal =
            contract.financing_type?.toLowerCase() === "cash"
                ? amount
                : amount - down - reserve;

        if (principal <= 0) return "N/A";

        const monthlyPayment = principal / term;
        return formatCurrency(monthlyPayment);
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            const data = {
                payment_term: Number(paymentTerm),
                reserve_amount: Number(reserveAmount),
                down_payment: Number(downPayment),
                ...((displayContract?.financing_type?.toLowerCase() === "bank" || displayContract?.financing_type?.toLowerCase() === "cash") && maxPaymentDate
                    ? { max_payment_date: maxPaymentDate }
                    : {}),
            };

            const result = await contractsApi.update(
                contract.project_id,
                contract.lot_id,
                contract.id,
                data
            );

            showToast(
                result.message || t("contractDetailsModal.savedSuccessfully"),
                "success"
            );
            setIsEditMode(false);
            onSaveSuccess(result.contract);

        } catch (error) {
            console.error("Error saving contract:", error);
            showToast(error.message, "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-10">
            {/* Financial Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                        <FontAwesomeIcon icon={faCalculator} className="text-xl" />
                    </div>
                    <div>
                        <h5 className="text-xl font-black text-bgray-900 dark:text-white">{t("contractDetailsModal.financialInfo")}</h5>
                        <p className="text-sm font-medium text-bgray-500">{t("contracts.paymentSummary") || "Resumen de pagos y financiamiento"}</p>
                    </div>
                </div>
                {isEditMode && (
                    <button
                        onClick={handleSaveChanges}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50"
                    >
                        {isSaving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <FontAwesomeIcon icon={faSave} />
                        )}
                        {isSaving ? t("common.saving") : t("common.save")}
                    </button>
                )}
            </div>

            {/* Main Numbers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 rounded-3xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">{t("contractDetailsModal.totalPrice")}</p>
                    <p className="text-2xl font-black text-bgray-900 dark:text-white">{formatCurrency(contract.amount)}</p>
                </div>
                <div className="p-6 rounded-3xl bg-gray-50 dark:bg-darkblack-500/50 border border-gray-100 dark:border-darkblack-400">
                    <p className="text-xs font-bold text-bgray-400 uppercase tracking-widest mb-2">{t("contractDetailsModal.financingType")}</p>
                    <p className="text-lg font-black text-bgray-900 dark:text-white capitalize">{t(`contractDetailsModal.financingTypes.${contract.financing_type?.toLowerCase()}`) || "N/A"}</p>
                </div>
                <div className="p-6 rounded-3xl bg-gray-50 dark:bg-darkblack-500/50 border border-gray-100 dark:border-darkblack-400">
                    <p className="text-xs font-bold text-bgray-400 uppercase tracking-widest mb-2">{t("contractDetailsModal.financedAmount")}</p>
                    <p className="text-xl font-black text-bgray-900 dark:text-white">
                        {formatCurrency(Number(contract.amount) - Number(reserveAmount || 0) - (contract.financing_type?.toLowerCase() === "direct" ? Number(downPayment || 0) : 0))}
                    </p>
                </div>
                {(contract.financing_type?.toLowerCase() === "bank" || contract.financing_type?.toLowerCase() === "cash") && (displayContract?.max_payment_date || maxPaymentDate) && (
                    <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                        <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-2">{t("contractDetailsModal.balanceDueBy")}</p>
                        <p className="text-xl font-black text-amber-700 dark:text-amber-400">
                            {new Date((displayContract?.max_payment_date || maxPaymentDate)).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                    </div>
                )}
                {contract.financing_type?.toLowerCase() === "direct" && (
                    <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">{t("contractDetailsModal.monthlyPayment")}</p>
                        <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                            {isLoadingFull ? (
                                <span className="animate-pulse">...</span>
                            ) : (
                                calculateCurrentMonthlyPayment()
                            )}
                        </p>
                    </div>
                )}
            </div>

            {isEditMode && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        {t("contractDetailsModal.scheduleEditWarning")}
                    </p>
                </div>
            )}

            {/* Editable Fields Grid */}
            <div className="bg-white dark:bg-darkblack-500 rounded-[2.5rem] border border-gray-100 dark:border-darkblack-400 shadow-xs p-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Payment Term */}
                    <div className="space-y-3">
                        <label className="text-sm font-black text-bgray-900 dark:text-white block uppercase tracking-wider">{t("contractDetailsModal.paymentTerm")}</label>
                        <div className="relative group">
                            <FontAwesomeIcon icon={faCalendarAlt} className="absolute left-5 top-1/2 -translate-y-1/2 text-bgray-400 group-focus-within:text-blue-500 transition-colors" />
                            {isEditMode ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={paymentTerm}
                                        onChange={(e) => setPaymentTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-darkblack-400 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-darkblack-600 outline-hidden transition-all font-bold text-bgray-900 dark:text-white"
                                        min="1"
                                    />
                                    <span className="text-sm font-bold text-bgray-400">{t("contractDetailsModal.months")}</span>
                                </div>
                            ) : (
                                <p className="pl-12 py-4 text-bgray-600 dark:text-bgray-300 font-bold">{paymentTerm || "—"} {t("contractDetailsModal.months")}</p>
                            )}
                        </div>
                    </div>

                    {/* Reserve Amount */}
                    <div className="space-y-3">
                        <label className="text-sm font-black text-bgray-900 dark:text-white block uppercase tracking-wider">{t("contractDetailsModal.reserveAmount")}</label>
                        <div className="relative group">
                            <FontAwesomeIcon icon={faDollarSign} className="absolute left-5 top-1/2 -translate-y-1/2 text-bgray-400 group-focus-within:text-blue-500 transition-colors" />
                            {isEditMode ? (
                                <input
                                    type="number"
                                    value={reserveAmount}
                                    onChange={(e) => setReserveAmount(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-darkblack-400 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-darkblack-600 outline-hidden transition-all font-bold text-bgray-900 dark:text-white"
                                    step="0.01"
                                />
                            ) : (
                                <p className="pl-12 py-4 text-bgray-600 dark:text-bgray-300 font-bold">{formatCurrency(reserveAmount)}</p>
                            )}
                        </div>
                    </div>

                    {/* Down Payment */}
                    <div className="space-y-3">
                        <label className="text-sm font-black text-bgray-900 dark:text-white block uppercase tracking-wider">{t("contractDetailsModal.downPayment")}</label>
                        <div className="relative group">
                            <FontAwesomeIcon icon={faCreditCard} className="absolute left-5 top-1/2 -translate-y-1/2 text-bgray-400 group-focus-within:text-blue-500 transition-colors" />
                            {isEditMode ? (
                                <input
                                    type="number"
                                    value={downPayment}
                                    onChange={(e) => setDownPayment(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-darkblack-400 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-darkblack-600 outline-hidden transition-all font-bold text-bgray-900 dark:text-white"
                                    step="0.01"
                                />
                            ) : (
                                <p className="pl-12 py-4 text-bgray-600 dark:text-bgray-300 font-bold">{formatCurrency(downPayment)}</p>
                            )}
                        </div>
                    </div>

                    {/* Max payment date (bank or cash) */}
                    {(displayContract?.financing_type?.toLowerCase() === "bank" || displayContract?.financing_type?.toLowerCase() === "cash") && (
                        <div className="space-y-3">
                            <label className="text-sm font-black text-bgray-900 dark:text-white block uppercase tracking-wider">{t("contractDetailsModal.maxPaymentDate")}</label>
                            <div className="relative group">
                                <FontAwesomeIcon icon={faCalendarAlt} className="absolute left-5 top-1/2 -translate-y-1/2 text-bgray-400 group-focus-within:text-blue-500 transition-colors" />
                                {isEditMode ? (
                                    <input
                                        type="date"
                                        value={maxPaymentDate}
                                        onChange={(e) => setMaxPaymentDate(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-darkblack-400 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-darkblack-600 outline-hidden transition-all font-bold text-bgray-900 dark:text-white"
                                    />
                                ) : (
                                    <p className="pl-12 py-4 text-bgray-600 dark:text-bgray-300 font-bold">
                                        {maxPaymentDate ? new Date(maxPaymentDate).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : "—"}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FinancialTab;
