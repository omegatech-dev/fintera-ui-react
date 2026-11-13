import PropTypes from "prop-types";

function SegmentedControl({ options, value, onChange, className = "" }) {
  return (
    <div
      role="radiogroup"
      className={`flex gap-1 rounded-control bg-surface-2 p-1 ${className}`}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange?.(option.value)}
            className={`h-[34px] flex-1 rounded-control px-3 text-label font-semibold transition-colors ${
              selected
                ? "bg-surface text-brand shadow-sm"
                : "text-ink-2 hover:text-ink"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

SegmentedControl.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({ value: PropTypes.string.isRequired, label: PropTypes.node })
  ).isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func,
  className: PropTypes.string,
};

export default SegmentedControl;
