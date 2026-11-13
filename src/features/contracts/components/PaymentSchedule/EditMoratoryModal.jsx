import { useState } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { Button, Dialog } from "@/shared/ui";
import { contractsApi } from "../../api";
import { useToast } from "../../../../contexts/ToastContext";
import { useLocale } from "../../../../contexts/LocaleContext";

const EditMoratoryModal = ({
  editingMora,
  onClose,
  moratoryAmount,
  setMoratoryAmount,
  schedule,
  setSchedule,
}) => {
  const { showToast } = useToast();
  const { t } = useLocale();

  const [actionLoading, setActionLoading] = useState(false);

  const handleUpdateMoratory = async () => {
    setActionLoading(true);
    try {
      const newMora = parseFloat(moratoryAmount) || 0;
      const data = await contractsApi.updateMoratory(editingMora, newMora);

      const safeSchedule = Array.isArray(schedule) ? schedule : [];
      const updatedSchedule = safeSchedule.map((payment) =>
        payment.id === editingMora
          ? { ...payment, interest_amount: data.payment.interest_amount }
          : payment
      );
      setSchedule(updatedSchedule);

      showToast(t("contracts.moratoryUpdated"), "success");
      onClose();
    } catch {
      showToast(t("contracts.errorUpdatingMoratory"), "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (editingMora === null) return null;

  return (
    <Dialog
      open={editingMora !== null}
      onClose={onClose}
      size="md"
      title={t("contracts.editMoratory")}
      description={t("contracts.updateMoratoryInfo")}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleUpdateMoratory} loading={actionLoading}>
            {t("common.save")}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="moratory-amount" className="text-label font-semibold text-ink-2">
            {t("contracts.moratoryInterest")}
          </label>
          <input
            id="moratory-amount"
            type="number"
            step="0.01"
            min="0"
            value={moratoryAmount}
            onChange={(event) => {
              const value = event.target.value;
              const num = parseFloat(value);
              if (value !== "" && !isNaN(num) && num < 0) return;
              setMoratoryAmount(value);
            }}
            className="h-11 w-full rounded-control border border-line-strong bg-surface px-3 text-[16px] font-semibold text-ink outline-none sm:text-body-lg"
          />
        </div>

        <div className="flex gap-2 rounded-control border border-info/25 bg-info-soft p-3 text-info">
          <FontAwesomeIcon icon={faInfoCircle} className="mt-0.5" />
          <p className="text-label font-medium leading-relaxed">
            {t("contracts.moratoryEditWarning")}
          </p>
        </div>
      </div>
    </Dialog>
  );
};

EditMoratoryModal.propTypes = {
  editingMora: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onClose: PropTypes.func.isRequired,
  moratoryAmount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  setMoratoryAmount: PropTypes.func.isRequired,
  schedule: PropTypes.array,
  setSchedule: PropTypes.func.isRequired,
};

export default EditMoratoryModal;
