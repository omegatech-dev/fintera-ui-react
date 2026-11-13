import { useState } from 'react';
import { createPortal } from 'react-dom';
import { isBefore, parseISO, startOfDay } from "date-fns";
import { useLocale } from '@/contexts/LocaleContext';
import { useToast } from '@/contexts/ToastContext';
import { getDefaultCurrency } from '@/shared/utils/formatSettings';
import {
    formatCurrency as formatCurrencyIntl,
    formatDate,
} from '@/shared/utils/formatters';

import { paymentsApi } from "@/features/payments/api";

const STATUS_STYLES = {
    paid: 'bg-brand-soft text-brand-strong',
    rejected: 'bg-danger-soft text-danger',
    overdue: 'bg-danger-soft text-danger',
    pending: 'bg-warning-soft text-warning',
};

function TimelinePaymentCard({ payment, onPaymentSuccess, cardId }) {
    const { t } = useLocale();
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
    const currency = contract?.currency || getDefaultCurrency();
    const displayProject = project_name || contract?.lot?.project?.name || '';
    const displayLot = lot_name || contract?.lot?.name || '';

    const interest = Number(interest_amount || 0);
    const totalDue = Number(amount || 0) + interest;
    const paidAmount = Number(paid_amount ?? 0);
    const showOverpayment = statusLower === 'paid' && (is_overpayment === true || (paidAmount > totalDue && totalDue > 0));
    const overpaymentAmount = showOverpayment ? paidAmount - totalDue : 0;

    const formatCurrency = (val) => formatCurrencyIntl(val, currency);

    const statusTone = statusLower === 'paid'
        ? 'paid'
        : isRejected
            ? 'rejected'
            : isOverdue
                ? 'overdue'
                : 'pending';

    const contextLabel = [description, displayProject && displayLot ? `${displayProject} – ${displayLot}` : displayProject || displayLot].filter(Boolean).join(' · ');

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

    return (
        <div id={cardId} className="rounded-card border border-line bg-surface p-4 transition-colors hover:border-line-strong sm:p-5">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-micro font-semibold uppercase tracking-wide text-ink-3">
                            {formatDate(due_date)}
                        </span>
                        <span className={`rounded-chip px-2 py-0.5 text-micro font-semibold ${STATUS_STYLES[statusTone]}`}>
                            {statusLower === 'paid' ? t('payments.paid') : isRejected ? t('payments.statusOptions.rejected') : isOverdue ? t('payments.overdue') : t('payments.pending')}
                        </span>
                    </div>
                    {contextLabel && (
                        <p className="text-body font-medium text-ink-2">{contextLabel}</p>
                    )}
                    {isRejected && (
                        <div className="flex items-start gap-2 rounded-control border border-danger/20 bg-danger-soft p-3">
                            <svg className="mt-0.5 h-4 w-4 shrink-0 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2z" />
                            </svg>
                            <div className="min-w-0">
                                <p className="text-micro font-bold uppercase tracking-wide text-danger">
                                    {t('payments.statusOptions.rejected')}
                                </p>
                                {rejectionReason ? (
                                    <p className="mt-1 text-body text-ink-2 italic">"{rejectionReason}"</p>
                                ) : (
                                    <p className="mt-1 text-body text-ink-2">{t('payments.paymentRejectedNotice')}</p>
                                )}
                            </div>
                        </div>
                    )}
                    <h4 className="text-title font-bold text-ink tabular-nums">
                        {formatCurrency(totalDue)}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-micro text-ink-3">
                        <span>{t('payments.subtotal')}: {formatCurrency(amount)}</span>
                        {interest > 0 && (
                            <>
                                <span className="h-1 w-1 rounded-full bg-line-strong" aria-hidden="true" />
                                <span className="font-medium text-danger">{t('payments.interest')}: {formatCurrency(interest)}</span>
                            </>
                        )}
                        {statusLower === 'paid' && paidAmount > 0 && (
                            <>
                                <span className="h-1 w-1 rounded-full bg-line-strong" aria-hidden="true" />
                                <span>{t('payments.totalPaid')}: {formatCurrency(paidAmount)}</span>
                            </>
                        )}
                        {showOverpayment && overpaymentAmount > 0 && (
                            <>
                                <span className="h-1 w-1 rounded-full bg-line-strong" aria-hidden="true" />
                                <span className="font-medium text-brand-strong">{t('payments.amountOverpaid')}: +{formatCurrency(overpaymentAmount)} ({t('payments.overpayment')})</span>
                            </>
                        )}
                    </div>
                    {showOverpayment && overpaymentAmount > 0 && (
                        <div className="mt-2 rounded-control border border-brand/20 bg-brand-soft p-2">
                            <p className="text-micro font-bold uppercase tracking-wide text-brand-strong">{t('payments.amountOverpaid')}</p>
                            <p className="text-body font-bold text-brand-strong">{formatCurrency(overpaymentAmount)}</p>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 self-start md:self-center">
                    {statusLower !== 'paid' && statusLower !== 'submitted' && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="rounded-control bg-brand px-4 py-2 text-label font-semibold text-white transition-colors hover:bg-brand-strong"
                        >
                            {t('payments.uploadReceipt')}
                        </button>
                    )}
                    {isRejected && (
                        <div className="flex items-center gap-2 rounded-control border border-danger/20 bg-danger-soft px-3 py-2 text-label font-semibold text-danger">
                            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2z" />
                            </svg>
                            {t('payments.statusOptions.rejected')}
                        </div>
                    )}
                    {statusLower === 'paid' && (
                        <div className="flex items-center gap-2 rounded-control bg-brand-soft px-3 py-2 text-label font-semibold text-brand-strong">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                            {t('payments.completed')}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Portal */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm">
                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-sheet border border-line bg-surface p-6 shadow-pop sm:p-7">
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-section font-bold text-ink">{t('payments.uploadReceipt')}</h3>
                                <p className="mt-1 text-body text-ink-3">{t('payments.uploadReceiptForThisPayment')}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                aria-label={t('common.close')}
                                className="rounded-control p-1.5 text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Payment details */}
                        <div className="mb-6 space-y-4">
                            <h4 className="border-b border-line pb-2 text-micro font-semibold uppercase tracking-wide text-ink-3">
                                {t('payments.paymentDetailsSection')}
                            </h4>
                            <div className="space-y-3 rounded-control border border-line bg-surface-2 p-4">
                                {contextLabel && (
                                    <div>
                                        <span className="mb-0.5 block text-micro font-medium uppercase tracking-wide text-ink-3">{t('payments.description')}</span>
                                        <p className="text-body font-medium text-ink">{contextLabel}</p>
                                    </div>
                                )}
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-micro font-medium uppercase tracking-wide text-ink-3">{t('payments.dueDate')}</span>
                                    <span className="text-body font-semibold text-ink">{formatDate(due_date)}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-micro font-medium uppercase tracking-wide text-ink-3">{t('payments.subtotal')}</span>
                                    <span className="text-body font-semibold text-ink">{formatCurrency(amount)}</span>
                                </div>
                                {interest > 0 && (
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-micro font-medium uppercase tracking-wide text-danger">{t('payments.lateInterest')}</span>
                                        <span className="text-body font-semibold text-danger">{formatCurrency(interest)}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between gap-3 border-t border-line pt-2">
                                    <span className="text-micro font-bold uppercase tracking-wide text-ink-2">{t('payments.totalAmount')}</span>
                                    <span className="text-title font-bold text-ink">{formatCurrency(totalDue)}</span>
                                </div>
                            </div>

                            {/* What you're uploading */}
                            <h4 className="mt-6 border-b border-line pb-2 text-micro font-semibold uppercase tracking-wide text-ink-3">
                                {t('payments.whatYouAreUploading')}
                            </h4>
                            <p className="text-body text-ink-2">
                                {t('payments.uploadReceiptDescription')}
                            </p>
                            <div className="relative">
                                <input
                                    type="file"
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                    className="hidden"
                                    id="receipt-upload"
                                />
                                <label
                                    htmlFor="receipt-upload"
                                    className={`flex cursor-pointer flex-col items-center justify-center rounded-control border-2 border-dashed p-7 transition-colors ${selectedFile
                                        ? 'border-brand bg-brand-soft/40'
                                        : 'border-line-strong bg-surface-2 hover:border-brand/60'
                                        }`}
                                >
                                    <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-control ${selectedFile ? 'bg-brand-soft text-brand-strong' : 'bg-surface text-ink-3'}`}>
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                    </div>
                                    <span className="text-body font-semibold text-ink">
                                        {selectedFile ? selectedFile.name : t('payments.selectFileToUpload')}
                                    </span>
                                    <span className="mt-1 text-micro text-ink-3">{t('payments.acceptedFormats')}</span>
                                </label>
                            </div>
                        </div>

                        <div className="mt-7 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 rounded-control border border-line-strong px-5 py-3 text-label font-semibold text-ink-2 transition-colors hover:bg-surface-2"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={handleUpload}
                                disabled={!selectedFile || isUploading}
                                className="flex-[2] rounded-control bg-brand px-5 py-3 text-label font-semibold text-white transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
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
