import { useState, memo } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan } from "@fortawesome/free-solid-svg-icons";
import { Button, Dialog } from "@/shared/ui";
import { useToast } from "../../../contexts/ToastContext";
import { useLocale } from "../../../contexts/LocaleContext";

const RejectionModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [reason, setReason] = useState("");
  const { showToast } = useToast();
  const { t } = useLocale();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!reason.trim()) {
      showToast(t("contracts.pleaseEnterReason"), "error");
      return;
    }
    onSubmit(reason);
  };

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      size="md"
      title={t("contracts.rejectContract")}
      description={t("contracts.rejectionReasonLong")}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="rejection-reason" className="text-label font-semibold text-ink-2">
            {t("contracts.rejectionReasonLabel")} *
          </label>
          <textarea
            id="rejection-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="min-h-[140px] w-full resize-none rounded-control border border-danger/30 bg-surface px-3 py-2 text-body text-ink outline-none focus:border-danger"
            placeholder={t("contracts.rejectionReasonPlaceholder")}
            required
            disabled={loading}
          />
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            variant="danger"
            loading={loading}
            disabled={loading || !reason.trim()}
          >
            {!loading && <FontAwesomeIcon icon={faBan} />}
            {loading ? t("contracts.rejecting") : t("contracts.confirmRejection")}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

RejectionModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default memo(RejectionModal);
