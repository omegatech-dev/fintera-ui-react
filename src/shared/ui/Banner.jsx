import PropTypes from "prop-types";

const TONES = {
  success: "border-brand/40 bg-brand-soft text-brand-strong",
  warning: "border-warning/40 bg-warning-soft text-warning",
  danger: "border-danger/40 bg-danger-soft text-danger",
  info: "border-info/40 bg-info-soft text-info",
  neutral: "border-line bg-surface-2 text-ink-2",
};

function Banner({ tone = "info", icon, action, className = "", children }) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={`flex items-start gap-2 rounded-control border px-3.5 py-3 text-body ${TONES[tone]} ${className}`}
    >
      {icon}
      <div className="flex-1 leading-snug">{children}</div>
      {action}
    </div>
  );
}

Banner.propTypes = {
  tone: PropTypes.oneOf(["success", "warning", "danger", "info", "neutral"]),
  icon: PropTypes.node,
  action: PropTypes.node,
  className: PropTypes.string,
  children: PropTypes.node,
};

export default Banner;
