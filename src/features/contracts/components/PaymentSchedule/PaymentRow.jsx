import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCheckCircle,
    faExclamationTriangle,
    faClock,
    faLock,
    faCoins,
    faPlus,
    faReceipt,
    faUndo
} from '@fortawesome/free-solid-svg-icons';

const PaymentRow = ({
    row,
    idx,
    paidSteps,
    fmt,
    t,
    translatePaymentType,
    calculateMoratoryDays,
    setSelectedPayment,
    setApplyPaymentModal,
    setEditingMora,
    setMoratoryAmount,
    onUndoPayment,
    undoLoadingPaymentId,
    isReadOnly
}) => {
    const getStatusConfig = (p) => {
        const status = (p.status || 'pending').toLowerCase();
        const isReadjustment = status === "readjustment";
        const moratoryDays = calculateMoratoryDays(p.due_date);
        const isPaid = status === "paid";
        const isOverdue = !isPaid && !isReadjustment && moratoryDays > 0;

        if (isReadjustment) return {
            label: t('paymentSchedule.readjustment'),
            dotColor: 'bg-gray-300 dark:bg-gray-600',
            badge: 'bg-gray-100 dark:bg-gray-800 text-gray-500',
            icon: faLock
        };
        if (isPaid) return {
            label: t('paymentSchedule.paid'),
            dotColor: 'bg-blue-500',
            badge: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30',
            icon: faCheckCircle
        };
        if (isOverdue) return {
            label: t('paymentSchedule.overdue'),
            dotColor: 'bg-rose-500',
            badge: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30',
            icon: faExclamationTriangle
        };
        return {
            label: t('paymentSchedule.pending'),
            dotColor: 'bg-amber-500',
            badge: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30',
            icon: faClock
        };
    };

    const statusConfig = getStatusConfig(row);
    const amount = row.amount || row.value || row.payment_amount;
    const paidAmount = row.paid_amount || 0;
    const interest = row.interest_amount || 0;
    const totalRequired = Number(amount) + Number(interest);
    const extraAmount = paidAmount > totalRequired ? paidAmount - totalRequired : 0;
    const moratoryDays = calculateMoratoryDays(row.due_date);
    const isReadjustment = row.status?.toLowerCase() === 'readjustment';
    const isPaid = row.status?.toLowerCase() === 'paid';
    const isUpcoming = !isPaid && !isReadjustment && idx === paidSteps;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.03 }}
            className={`relative group flex flex-col md:flex-row items-stretch md:items-center gap-4 p-1 rounded-xl transition-all duration-300 ${isReadjustment ? 'opacity-40 grayscale pointer-events-none' : ''}`}
        >
            {/* Status Node */}
            <div className="absolute -left-8 md:-left-12 top-1/2 -translate-y-1/2 z-10">
                <motion.div
                    whileHover={{ scale: 1.2 }}
                    className={`w-6 h-6 rounded-full border-4 border-white dark:border-darkblack-600 shadow-lg ${statusConfig.dotColor} ${isUpcoming ? 'ring-4 ring-blue-500/20' : ''}`}
                />
            </div>

            {/* Main Content Card */}
            <div className={`flex-1 flex flex-col md:flex-row items-center gap-3 p-3 rounded-xl border-2 transition-all duration-300 ${isUpcoming ? 'bg-blue-50/30 dark:bg-blue-900/10 border-blue-500 shadow-xl shadow-blue-500/10' : 'bg-white dark:bg-darkblack-600 border-gray-50 dark:border-darkblack-500 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-xl hover:shadow-blue-500/5'}`}>

                {/* Installment Badge */}
                <div className="shrink-0">
                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center ${isUpcoming ? 'bg-blue-600 text-white' : (row.payment_type === 'capital_repayment' ? 'bg-emerald-500 text-white' : 'bg-gray-50 dark:bg-darkblack-500 text-gray-400')}`}>
                        <p className="text-[8px] font-black uppercase mb-0.5 opacity-60">
                            {row.payment_type === 'capital_repayment' ? 'Abono' : 'Cuota'}
                        </p>
                        <p className="text-lg font-black">{row.payment_type === 'capital_repayment' ? <FontAwesomeIcon icon={faCoins} className="text-sm" /> : (row.number || idx + 1)}</p>
                    </div>
                </div>

                {/* Date & Type */}
                <div className="flex-1 min-w-0 flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-full md:w-28 text-center md:text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{t('paymentSchedule.date')}</p>
                        <p className="text-[13px] font-black text-gray-900 dark:text-white truncate">
                            {row.due_date ? new Date(row.due_date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : "—"}
                        </p>
                    </div>

                    <div className="w-full md:w-32 text-center md:text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{t('paymentSchedule.type')}</p>
                        <div className="inline-flex items-center px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-darkblack-500 text-[9px] font-black text-gray-500 uppercase">
                            {translatePaymentType(row.payment_type)}
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{t('paymentSchedule.amount')}</p>
                        <div className="flex flex-col md:flex-row items-baseline gap-2">
                            <p className={`text-xl font-black ${isUpcoming ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                                {fmt(amount)}
                            </p>
                            {(interest > 0 || moratoryDays > 0) && (
                                <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-900/20">
                                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-rose-500 text-[7px]" />
                                    <span className="text-[9px] font-black text-rose-600 dark:text-rose-400">+{fmt(interest)}</span>
                                </div>
                            )}
                            {extraAmount > 0 && (
                                <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20">
                                    <FontAwesomeIcon icon={faPlus} className="text-blue-500 text-[7px]" />
                                    <span className="text-[9px] font-black text-blue-600 dark:text-blue-400">+{fmt(extraAmount)} ({t('paymentSchedule.extraAmount')})</span>
                                </div>
                            )}
                        </div>
                        {isPaid && paidAmount > totalRequired && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-1 flex items-center gap-2"
                            >
                                <div className="px-1.5 py-0.5 bg-blue-500/10 rounded-md flex items-center gap-1.5 group/applied">
                                    <FontAwesomeIcon icon={faReceipt} className="text-[8px] text-blue-500 opacity-60 group-hover/applied:scale-110 transition-transform" />
                                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-tighter opacity-70">
                                        {t('payments.totalApplied') || 'Total Recibido'}: {fmt(paidAmount)}
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Status Label */}
                <div className="shrink-0 flex items-center gap-4">
                    {moratoryDays > 0 && !isPaid && (
                        <div className="hidden lg:flex flex-col items-end">
                            <p className="text-[9px] font-black uppercase text-rose-400 tracking-tighter">Mora</p>
                            <p className="text-xs font-black text-rose-500">{moratoryDays}d</p>
                        </div>
                    )}
                    <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${statusConfig.badge}`}>
                        <FontAwesomeIcon icon={statusConfig.icon} className="text-[10px]" />
                        {statusConfig.label}
                    </div>
                </div>

                {/* Integrated Actions */}
                <div className="shrink-0 h-full border-l border-gray-100 dark:border-darkblack-500 pl-6 flex items-center gap-2">
                    {isReadjustment ? (
                        <FontAwesomeIcon icon={faLock} className="text-gray-300" />
                    ) : (
                        <>
                            {!isReadOnly && !isPaid && (
                                <motion.button
                                    whileHover={{ scale: 1.1, backgroundColor: '#10B981' }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => {
                                        setSelectedPayment(row);
                                        setApplyPaymentModal(true);
                                    }}
                                    className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center transition-colors"
                                    title={t('paymentSchedule.applyPayment')}
                                >
                                    <FontAwesomeIcon icon={faCoins} />
                                </motion.button>
                            )}

                            {!isReadOnly && !isPaid && moratoryDays > 0 && (
                                <motion.button
                                    whileHover={{ scale: 1.1, backgroundColor: '#F59E0B', color: '#fff' }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => {
                                        setEditingMora(row.id || idx);
                                        setMoratoryAmount(interest?.toString() || "0");
                                    }}
                                    className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center transition-colors"
                                    title={t('paymentSchedule.editMoratory')}
                                >
                                    <FontAwesomeIcon icon={faExclamationTriangle} />
                                </motion.button>
                            )}

                            {isPaid && !isReadOnly && (
                                <motion.button
                                    whileHover={{ scale: 1.1, backgroundColor: '#EF4444', color: '#fff' }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => onUndoPayment?.(row.id)}
                                    disabled={undoLoadingPaymentId != null && undoLoadingPaymentId === row.id}
                                    className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={t('paymentSchedule.undoPayment')}
                                >
                                    {undoLoadingPaymentId === row.id ? (
                                        <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="inline-block w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full" />
                                    ) : (
                                        <FontAwesomeIcon icon={faUndo} className="text-xs" />
                                    )}
                                </motion.button>
                            )}

                            {isReadOnly && isPaid && (
                                <div className="w-10 h-10 flex items-center justify-center text-emerald-500 opacity-60">
                                    <FontAwesomeIcon icon={faCheckCircle} />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default PaymentRow;
