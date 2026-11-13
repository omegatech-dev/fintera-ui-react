import PropTypes from "prop-types";
import Button from "./Button";
import Dialog from "./Dialog";

function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "danger",
  loading = false,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}

ConfirmDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  title: PropTypes.node,
  description: PropTypes.node,
  confirmLabel: PropTypes.node,
  cancelLabel: PropTypes.node,
  tone: PropTypes.oneOf(["danger", "primary"]),
  loading: PropTypes.bool,
};

export default ConfirmDialog;
