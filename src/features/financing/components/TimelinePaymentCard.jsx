import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { format, isBefore, parseISO, startOfDay } from "date-fns";
import { es, enUS } from 'date-fns/locale';
import { useLocale } from '@/contexts/LocaleContext';
import { useToast } from '@/contexts/ToastContext';

import { paymentsApi } from "@/features/payments/api";

function TimelinePaymentCard({ payment, onPaymentSuccess, cardId }) {
    const { t, locale } = useLocale();
    const { showToast } = useToast();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const { id, amount, due_date, status, interest_amount, paid_amount, is_overpayment, contract, description, project_name, lot_name, rejection_reason, rejection_reason_notes, reason } = payment;
    const statusLower = (status || '').toLowerCase();
    const dueDate = parseISO(due_date);
    const isOverdue = isBefore(dueDate, startOfDay(new Date())) && statusLower !== 'paid' && statusLower !== 'rejected';
    const isRejected = statusLower === 'rejected';
    const rejectionReason = rejection_reason || rejection_reason_notes || reason || payment.rejection_note;
    const currency = contract?.currency || 'HNL';
    const displayProject = project_name || contract?.lot?.project?.name || '';
    const displayLot = lot_name || contract?.lot?.name || '';
    const dateLocale = locale === 'es' ? es : enUS;

    const interest = Number(interest_amount || 0);
    const totalDue = Number(amount || 0) + interest;
    const paidAmount = Number(paid_amount ?? 0);
    const showOverpayment = statusLower === 'paid' && (is_overpayment === true || (paidAmount > totalDue && totalDue > 0));
    const overpaymentAmount = showOverpayment ? paidAmount - totalDue : 0;

    const formatCurrency = (val) => new Intl.NumberFormat(locale === 'es' ? 'es-HN' : 'en-US', {
        style: 'currency',
        currency: currency
    }).format(val);

    const handleUpload = async () => {
        if (!selectedFile) return;
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('receipt', selectedFile);
            formData.append('paid_amount', totalDue.toString());

            await paymentsApi.uploadReceipt(id, formData);

            showToast(t('payments.paymentSuccessful'), "success");
            setIsModalOpen(false);
            onPaymentSuccess?.();
            setSelectedFile(null);
        } catch (err) {
            showToast(err.message || t('payments.paymentError'), "error");
        } finally {
            setIsUploading(false);
        }
    };

    const getStatusColor = () => {
        if (statusLower === 'paid') return 'bg-emerald-500';
        if (isRejected) return 'bg-rose-500';
        if (isOverdue) return 'bg-rose-500';
        return 'bg-amber-500';
    };

    return (
        <div id={cardId} className="relative pl-8 pb-4 group last:pb-0">
            {/* Vertical timeline line */}
            <div className="absolute left-[3px] top-4 bottom-0 w-[2px] bg-bgray-200 dark:bg-bgray-800 group-last:hidden"></div>

            {/* Timeline dot */}
            <div className={`absolute left-0 top-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-bgray-900 z-10 transition-transform group-hover:scale-125 ${getStatusColor()}`}></div>

            <div className="bg-white dark:bg-bgray-900/50 backdrop-blur-xs border border-bgray-200 dark:border-bgray-800 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-bgray-200/50 dark:hover:shadow-none hover:-translate-y-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-bgray-500 uppercase tracking-widest">
                                {format(dueDate, 'dd MMM yyyy', { locale: dateLocale })}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${statusLower === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                isRejected ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400' :
                                    isOverdue ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400' :
                                        'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                                }`}>
                                {statusLower === 'paid' ? t('payments.paid') : isRejected ? t('payments.statusOptions.rejected') : isOverdue ? t('payments.overdue') : t('payments.pending')}
                            </span>
                        </div>
                        {(description || displayProject || displayLot) && (
                            <p className="text-sm font-medium text-bgray-700 dark:text-bgray-300">
                                {[description, displayProject && displayLot ? `${displayProject} – ${displayLot}` : displayProject || displayLot].filter(Boolean).join(' · ')}
                            </p>
                        )}
                        {isRejected && (
                            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20">
                                <svg className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2z" />
                                </svg>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wide">
                                        {t('payments.statusOptions.rejected')}
                                    </p>
                                    {rejectionReason ? (
                                        <p className="text-sm text-rose-600 dark:text-rose-400 mt-1 italic">"{rejectionReason}"</p>
                                    ) : (
                                        <p className="text-sm text-rose-600 dark:text-rose-400 mt-1">{t('payments.paymentRejectedNotice')}</p>
                                    )}
                                </div>
                            </div>
                        )}
                        <h4 className="text-xl font-black text-bgray-900 dark:text-white">
                            {formatCurrency(totalDue)}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-bgray-500 dark:text-bgray-400">
                            <span>{t('payments.subtotal')}: {formatCurrency(amount)}</span>
                            {interest > 0 && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-bgray-300"></span>
                                    <span className="text-rose-500 font-medium">{t('payments.interest')}: {formatCurrency(interest)}</span>
                                </>
                            )}
                            {statusLower === 'paid' && paidAmount > 0 && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-bgray-300"></span>
                                    <span>{t('payments.totalPaid')}: {formatCurrency(paidAmount)}</span>
                                </>
                            )}
                            {showOverpayment && overpaymentAmount > 0 && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-bgray-300"></span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">{t('payments.amountOverpaid')}: +{formatCurrency(overpaymentAmount)} ({t('payments.overpayment')})</span>
                                </>
                            )}
                        </div>
                        {showOverpayment && overpaymentAmount > 0 && (
                            <div className="mt-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">{t('payments.amountOverpaid')}</p>
                                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">{formatCurrency(overpaymentAmount)}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center">
                        {statusLower !== 'paid' && statusLower !== 'submitted' && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-5 py-2 bg-bgray-900 dark:bg-white text-white dark:text-bgray-900 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-bgray-900/20 dark:shadow-none"
                            >
                                {t('payments.uploadReceipt')}
                            </button>
                        )}
                        {isRejected && (
                            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-500/10 px-4 py-2 rounded-xl text-sm border border-rose-200 dark:border-rose-500/20">
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2z" />
                                </svg>
                                {t('payments.statusOptions.rejected')}
                            </div>
                        )}
                        {statusLower === 'paid' && (
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/5 px-4 py-2 rounded-xl text-sm">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                                {t('payments.completed')}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Portal */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-bgray-900/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-bgray-900 w-full max-w-lg rounded-3xl p-8 shadow-2xl border border-bgray-100 dark:border-bgray-800 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-black text-bgray-900 dark:text-white">{t('payments.uploadReceipt')}</h3>
                                <p className="text-sm text-bgray-500 mt-1">{t('payments.uploadReceiptForThisPayment')}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-bgray-100 dark:hover:bg-bgray-800 rounded-full transition-colors">
                                <svg className="w-5 h-5 text-bgray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Payment details */}
                        <div className="space-y-4 mb-6">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-bgray-400 border-b border-bgray-200 dark:border-bgray-700 pb-2">
                                {t('payments.paymentDetailsSection')}
                            </h4>
                            <div className="p-4 rounded-2xl bg-bgray-50 dark:bg-bgray-800/50 border border-bgray-100 dark:border-bgray-700 space-y-3">
                                {(description || displayProject || displayLot) && (
                                    <div>
                                        <span className="text-[10px] font-bold text-bgray-400 uppercase tracking-wider block mb-0.5">{t('payments.description')}</span>
                                        <p className="text-sm font-medium text-bgray-900 dark:text-white">
                                            {[description, displayProject && displayLot ? `${displayProject} – ${displayLot}` : displayProject || displayLot].filter(Boolean).join(' · ')}
                                        </p>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-bgray-400 uppercase tracking-wider">{t('payments.dueDate')}</span>
                                    <span className="text-sm font-bold text-bgray-900 dark:text-white">{format(dueDate, 'PPP', { locale: dateLocale })}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-bgray-400 uppercase tracking-wider">{t('payments.subtotal')}</span>
                                    <span className="text-sm font-bold text-bgray-900 dark:text-white">{formatCurrency(amount)}</span>
                                </div>
                                {interest > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{t('payments.lateInterest')}</span>
                                        <span className="text-sm font-bold text-rose-600 dark:text-rose-400">{formatCurrency(interest)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-2 border-t border-bgray-200 dark:border-bgray-600">
                                    <span className="text-[10px] font-black text-bgray-500 uppercase tracking-wider">{t('payments.totalAmount')}</span>
                                    <span className="text-lg font-black text-bgray-900 dark:text-white">{formatCurrency(totalDue)}</span>
                                </div>
                            </div>

                            {/* What you're uploading */}
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-bgray-400 border-b border-bgray-200 dark:border-bgray-700 pb-2 mt-6">
                                {t('payments.whatYouAreUploading')}
                            </h4>
                            <p className="text-sm text-bgray-500 dark:text-bgray-400">
                                {t('payments.uploadReceiptDescription')}
                            </p>
                            <div className="relative group">
                                <input
                                    type="file"
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                    className="hidden"
                                    id="receipt-upload"
                                />
                                <label
                                    htmlFor="receipt-upload"
                                    className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${selectedFile
                                        ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-500/5'
                                        : 'border-bgray-200 dark:border-bgray-700 hover:border-bgray-400 dark:hover:border-bgray-500 bg-bgray-50/50 dark:bg-bgray-800/20'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${selectedFile ? 'bg-emerald-100 text-emerald-600' : 'bg-bgray-100 text-bgray-400 dark:bg-bgray-800'}`}>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                    </div>
                                    <span className="text-sm font-bold text-bgray-900 dark:text-white">
                                        {selectedFile ? selectedFile.name : t('payments.selectFileToUpload')}
                                    </span>
                                    <span className="text-xs text-bgray-500 mt-1">{t('payments.acceptedFormats')}</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-4 px-6 rounded-2xl border border-bgray-200 dark:border-bgray-700 text-bgray-600 dark:text-bgray-300 font-bold hover:bg-bgray-50 dark:hover:bg-bgray-800 transition-colors"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={!selectedFile || isUploading}
                                className="flex-[2] py-4 px-6 rounded-2xl bg-bgray-900 dark:bg-white text-white dark:text-bgray-900 font-black disabled:opacity-50 disabled:scale-100 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-bgray-900/20 dark:shadow-none"
                            >
                                {isUploading ? t('common.processing') : t('payments.confirm')}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

export default TimelinePaymentCard;
