import PropTypes from "prop-types";
import Button from "./Button";

function SaveBar({
  dirty = false,
  saving = false,
  onSave,
  onDiscard,
  saveLabel = "Guardar cambios",
  discardLabel = "Descartar",
  message = "Cambios sin guardar",
  className = "",
}) {
  if (!dirty) return null;

  return (
    <div
      className={`sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-surface px-4 py-3 shadow-pop ${className}`}
    >
      <span className="text-label font-semibold text-warning" role="status">
        {message}
      </span>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onDiscard} disabled={saving}>
          {discardLabel}
        </Button>
        <Button size="sm" onClick={onSave} loading={saving}>
          {saveLabel}
        </Button>
      </div>
    </div>
  );
}

SaveBar.propTypes = {
  dirty: PropTypes.bool,
  saving: PropTypes.bool,
  onSave: PropTypes.func,
  onDiscard: PropTypes.func,
  saveLabel: PropTypes.node,
  discardLabel: PropTypes.node,
  message: PropTypes.node,
  className: PropTypes.string,
};

export default SaveBar;
