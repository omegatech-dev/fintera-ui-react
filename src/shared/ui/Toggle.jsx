import PropTypes from "prop-types";

function Toggle({ checked = false, onChange, label, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative inline-flex h-[22px] w-10 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
        checked ? "bg-brand" : "bg-line-strong"
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-all ${
          checked ? "left-[20px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

Toggle.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  label: PropTypes.string,
  disabled: PropTypes.bool,
};

export default Toggle;
