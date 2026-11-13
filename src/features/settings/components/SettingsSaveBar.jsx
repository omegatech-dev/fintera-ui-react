import PropTypes from "prop-types";

function SettingsSaveBar({
  visible,
  saving = false,
  saveDisabled = false,
  onDiscard,
  onSave,
  labels,
  className = "",
}) {
  if (!visible) return null;

  return (
    <div
      className={`flex min-h-16 flex-wrap items-center justify-between gap-3 rounded-[12px] border border-line bg-surface px-[18px] py-2.5 shadow-pop ${className}`}
    >
      <span className="text-label font-semibold text-warning" role="status">
        {labels.unsaved}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onDiscard}
          disabled={saving}
          className="inline-flex h-[38px] items-center justify-center rounded-control px-3.5 text-label font-semibold text-ink-2 transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {labels.discard}
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving || saveDisabled}
          className="inline-flex h-[38px] items-center justify-center gap-2 rounded-control bg-brand px-3.5 text-label font-bold text-white transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <>
              <span
                className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"
                aria-hidden="true"
              />
              {labels.saving}
            </>
          ) : (
            labels.save
          )}
        </button>
      </div>
    </div>
  );
}

SettingsSaveBar.propTypes = {
  visible: PropTypes.bool,
  saving: PropTypes.bool,
  saveDisabled: PropTypes.bool,
  onDiscard: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  labels: PropTypes.shape({
    unsaved: PropTypes.string.isRequired,
    discard: PropTypes.string.isRequired,
    save: PropTypes.string.isRequired,
    saving: PropTypes.string.isRequired,
  }).isRequired,
  className: PropTypes.string,
};

export default SettingsSaveBar;
