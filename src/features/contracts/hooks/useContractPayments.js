import { useState, useCallback, useEffect } from 'react';
import { contractsApi } from '../api';
import { useToast } from '@/contexts/ToastContext';
import { useLocale } from '@/contexts/LocaleContext';

export const useContractPayments = (contract, open) => {
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentContract, setCurrentContract] = useState(() => contract || null);
    const [ledgerEntries, setLedgerEntries] = useState([]);
    const [undoLoadingPaymentId, setUndoLoadingPaymentId] = useState(null);
    const [undoConfirmPaymentId, setUndoConfirmPaymentId] = useState(null);

    const { showToast } = useToast();
    const { t } = useLocale();

    const fetchContractDetails = useCallback(async (contractId) => {
        if (!contractId) return null;

        setLoading(true);
        setError(null);
        try {
            const data = await contractsApi.getDetails(contract.project_id, contract.lot_id, contractId);
            return data.contract || null;
        } catch (error) {
            console.error('Error fetching contract details:', error);
            setError(error?.message || t('paymentSchedule.loadError'));
            showToast(t('common.error'), 'error');
            return null;
        } finally {
            setLoading(false);
        }
    }, [contract?.project_id, contract?.lot_id, showToast, t]);

    const loadContractData = useCallback(async () => {
        if (!contract?.id) {
            setSchedule([]);
            setLedgerEntries([]);
            setError(null);
            return;
        }

        const fullContract = await fetchContractDetails(contract.id);

        if (fullContract) {
            setCurrentContract(fullContract);
            const paymentSchedule = fullContract.payment_schedule || [];
            setSchedule(Array.isArray(paymentSchedule) ? paymentSchedule : []);
            const ledger = fullContract.ledger_entries || [];
            setLedgerEntries(Array.isArray(ledger) ? ledger : []);
        } else {
            setSchedule([]);
            setLedgerEntries([]);
        }
    }, [contract?.id, fetchContractDetails]);

    const handlePaymentResponse = useCallback((paymentResponse, isCapitalPayment, onPaymentSuccess) => {
        const updatedContract = paymentResponse?.contract ?? paymentResponse?.payment?.contract;

        if (updatedContract && (updatedContract.balance !== undefined || updatedContract.total_paid !== undefined)) {
            setCurrentContract((prev) => ({
                ...(prev || {}),
                ...(updatedContract.balance !== undefined && { balance: updatedContract.balance }),
                ...(updatedContract.total_paid !== undefined && { total_paid: updatedContract.total_paid }),
            }));
        }

        if (isCapitalPayment || paymentResponse?.reajusted_payments_count > 0) {
            if (paymentResponse.contract) {
                setSchedule(Array.isArray(paymentResponse.contract.payment_schedule) ? paymentResponse.contract.payment_schedule : []);
                setLedgerEntries(Array.isArray(paymentResponse.contract.ledger_entries) ? paymentResponse.contract.ledger_entries : []);
            } else {
                loadContractData();
            }
        } else {
            loadContractData();
        }

        if (onPaymentSuccess) {
            const contractForList =
                updatedContract?.id != null
                    ? { id: updatedContract.id, balance: updatedContract.balance, total_paid: updatedContract.total_paid, ...updatedContract }
                    : paymentResponse?.payment?.contract;
            onPaymentSuccess(contractForList ?? paymentResponse);
        }
    }, [loadContractData]);

    const handleUndoPayment = useCallback(async (paymentId, onPaymentSuccess) => {
        if (!paymentId) return;
        setUndoLoadingPaymentId(paymentId);
        try {
            await contractsApi.undoPayment(paymentId);
            await loadContractData();
            if (onPaymentSuccess) onPaymentSuccess({ payment: { id: paymentId }, type: "undo" });
            showToast(t("paymentSchedule.undoSuccess") || "Payment undone.", "success");
        } catch (error) {
            console.error("Error undoing payment:", error);
            showToast(error.message || t("paymentSchedule.undoError") || "Failed to undo payment.", "error");
        } finally {
            setUndoLoadingPaymentId(null);
        }
    }, [loadContractData, showToast, t]);

    useEffect(() => {
        if (!open || !contract?.id) {
            return;
        }
        loadContractData();
    }, [open, contract?.id, loadContractData]);

    useEffect(() => {
        if (!open) {
            setSchedule([]);
            setLedgerEntries([]);
            setCurrentContract(null);
        }
    }, [open]);

    return {
        schedule,
        setSchedule,
        loading,
        error,
        currentContract,
        setCurrentContract,
        ledgerEntries,
        undoLoadingPaymentId,
        undoConfirmPaymentId,
        setUndoConfirmPaymentId,
        handlePaymentResponse,
        handleUndoPayment,
        loadContractData
    };
};
