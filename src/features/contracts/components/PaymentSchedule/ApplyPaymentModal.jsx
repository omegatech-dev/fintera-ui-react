import { useState } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCoins,
  faHandHoldingUsd,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { Button, Dialog } from "@/shared/ui";
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
  setSchedule,
}) => {
  const { showToast } = useToast();
  const { t } = useLocale();

  const [editableAmount, setEditableAmount] = useState("");
  const [editableInterest, setEditableInterest] = useState("");
  const [editableTotal, setEditableTotal] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const handleApplyPayment = async () => {
    setActionLoading(true);
    try {
      const paymentAmount = Number(editableAmount);

      if (selectedPayment?.isCapitalPayment) {
        if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
          showToast(t("contracts.capitalPaymentAmountRequired"), "error");
          setActionLoading(false);
          return;
        }

        const data = await contractsApi.capitalRepayment(
          contract?.project_id,
          contract?.lot_id,
          contract?.id,
          paymentAmount
        );

        onPaymentSuccess?.(data, true);

        let successMessage = `${t("contracts.capitalPayment")} ${t("contracts.appliedSuccessfully")}`;
        if (data.reajusted_payments_count > 0) {
          successMessage += ` - ${data.reajusted_payments_count} ${t("contracts.paymentsReadjusted")}`;
        }
        showToast(successMessage, "success");
      } else {
        const interestAmount = parseFloat(editableInterest) || 0;
        const paidAmount = parseFloat(editableTotal) || 0;

        if (paidAmount <= 0) {
          showToast(t("contracts.totalAmountRequired"), "error");
          setActionLoading(false);
          return;
        }

        const data = await contractsApi.approvePayment(selectedPayment.id, {
          amount: parseFloat(editableAmount) || 0,
          interest_amount: interestAmount,
          paid_amount: paidAmount,
        });

        const safeSchedule = Array.isArray(schedule) ? schedule : [];
        const updatedSchedule = safeSchedule.map((payment) =>
          payment.id === selectedPayment.id
            ? {
                ...payment,
                status: data.payment.status || "paid",
                paid_amount: data.payment.paid_amount,
                interest_amount: data.payment.interest_amount,
                payment_date: data.payment.payment_date,
                approved_at: data.payment.approved_at,
              }
            : payment
        );
        setSchedule(updatedSchedule);

        onPaymentSuccess?.(data, false);

        showToast(`${t("contracts.payment")} ${t("contracts.appliedSuccessfully")}`, "success");
      }

      setTimeout(() => {
        onClose();
        setEditableAmount("");
        setEditableInterest("");
        setEditableTotal("");
        setActionLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error applying payment:", error);
      const paymentType = selectedPayment?.isCapitalPayment
        ? t("contracts.capitalPayment").toLowerCase()
        : t("contracts.payment").toLowerCase();
      showToast(`${t("contracts.errorApplying")} ${paymentType}: ${error.message}`, "error");
      setActionLoading(false);
    }
  };

  if (!isOpen || !selectedPayment) return null;

  const isCapital = selectedPayment?.isCapitalPayment;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      size="md"
      title={isCapital ? t("contracts.capitalPayment") : t("contracts.applyPayment")}
      description={
        isCapital
          ? t("contracts.capitalPaymentDescription")
          : `${t("contracts.paymentFor")} #${selectedPayment.id}`
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleApplyPayment} loading={actionLoading}>
            {actionLoading
              ? isCapital
                ? t("contracts.applyingCapitalPayment")
                : t("contracts.applyingPayment")
              : isCapital
                ? t("contracts.applyCapitalPayment")
                : t("contracts.applyPayment")}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="apply-payment-amount"
            className="text-label font-semibold text-ink-2"
          >
            {isCapital ? t("contracts.capitalPaymentAmount") : t("contracts.paymentAmount")}
          </label>
          <div className="relative">
            <FontAwesomeIcon
              icon={isCapital ? faHandHoldingUsd : faCoins}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3"
            />
            <input
              id="apply-payment-amount"
              type="number"
              step="0.01"
              min="0"
              value={editableAmount}
              onChange={(event) => {
                const newAmount = event.target.value;
                const num = parseFloat(newAmount);
                if (newAmount !== "" && !isNaN(num) && num < 0) return;
                setEditableAmount(newAmount);
                if (!isCapital) {
                  const amount = parseFloat(newAmount) || 0;
                  const interest = parseFloat(editableInterest) || 0;
                  setEditableTotal((amount + interest).toString());
                }
              }}
              placeholder={isCapital ? t("contracts.enterCapitalPaymentAmount") : ""}
              className="h-11 w-full rounded-control border border-line-strong bg-surface pl-9 pr-3 text-[16px] font-semibold text-ink outline-none sm:text-body-lg"
            />
          </div>
        </div>

        {!isCapital && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="apply-payment-interest"
                className="text-label font-semibold text-ink-2"
              >
                {t("contracts.interestMoratory")}
              </label>
              <input
                id="apply-payment-interest"
                type="number"
                step="0.01"
                min="0"
                value={editableInterest}
                onChange={(event) => {
                  const newInterest = event.target.value;
                  const num = parseFloat(newInterest);
                  if (newInterest !== "" && !isNaN(num) && num < 0) return;
                  setEditableInterest(newInterest);
                  const amount = parseFloat(editableAmount) || 0;
                  const interest = parseFloat(newInterest) || 0;
                  setEditableTotal((amount + interest).toString());
                }}
                className="h-11 w-full rounded-control border border-warning/40 bg-warning-soft px-3 text-[16px] font-semibold text-ink outline-none sm:text-body-lg"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="apply-payment-total"
                className="text-label font-semibold text-ink-2"
              >
                {t("contracts.totalPaymentAmount")}
              </label>
              <input
                id="apply-payment-total"
                type="number"
                step="0.01"
                value={editableTotal}
                readOnly
                className="h-11 w-full rounded-control border border-info/30 bg-info-soft px-3 text-[16px] font-bold text-info outline-none sm:text-body-lg"
              />
            </div>
          </div>
        )}

        <div
          className={`flex gap-2 rounded-control border p-3 ${
            isCapital
              ? "border-info/25 bg-info-soft text-info"
              : "border-warning/25 bg-warning-soft text-warning"
          }`}
        >
          <FontAwesomeIcon icon={faInfoCircle} className="mt-0.5" />
          <p className="text-label font-medium leading-relaxed">
            {isCapital
              ? t("contracts.capitalPaymentInfo")
              : t("contracts.amountInterestWarning")}
          </p>
        </div>
      </div>
    </Dialog>
  );
};

ApplyPaymentModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  selectedPayment: PropTypes.object,
  contract: PropTypes.object,
  onPaymentSuccess: PropTypes.func,
  schedule: PropTypes.array,
  setSchedule: PropTypes.func,
};

export default ApplyPaymentModal;
