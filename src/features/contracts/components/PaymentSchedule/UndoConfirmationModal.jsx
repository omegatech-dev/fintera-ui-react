import PropTypes from "prop-types";
import { Button, Dialog } from "@/shared/ui";
import { useLocale } from "../../../../contexts/LocaleContext";

const UndoConfirmationModal = ({ paymentId, onConfirm, onCancel, isLoading }) => {
  const { t } = useLocale();

  if (paymentId == null) return null;

  return (
    <Dialog
      open={paymentId != null}
      onClose={onCancel}
      size="sm"
      title={t("paymentSchedule.undoConfirmTitle")}
      description={t("paymentSchedule.undoConfirmMessage")}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={isLoading}>
            {t("paymentSchedule.undoPayment")}
          </Button>
        </>
      }
    />
  );
};

UndoConfirmationModal.propTypes = {
  paymentId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default UndoConfirmationModal;
