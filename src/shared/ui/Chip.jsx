import PropTypes from "prop-types";

const TONES = {
  success: "bg-brand-soft text-brand-strong",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  violet: "bg-violet-soft text-violet",
  neutral: "border border-line bg-surface-2 text-ink-2",
};

function Chip({ tone = "neutral", className = "", children }) {
  return (
    <span
      className={`inline-flex h-6 items-center justify-center rounded-chip px-2 text-micro font-bold leading-none ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

Chip.propTypes = {
  tone: PropTypes.oneOf([
    "success",
    "warning",
    "danger",
    "info",
    "violet",
    "neutral",
  ]),
  className: PropTypes.string,
  children: PropTypes.node,
};

export default Chip;
