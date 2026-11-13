import PropTypes from "prop-types";

function EmptyState({
  variant = "empty",
  icon,
  title,
  description,
  action,
  className = "",
}) {
  return (
    <div
      className={`motion-fade-in flex flex-col items-center justify-center gap-2 rounded-card border border-dashed border-line-strong bg-surface-2 px-6 py-10 text-center ${className}`}
    >
      {icon}
      <p className="text-body-lg font-bold text-ink">{title}</p>
      {description && (
        <p className="max-w-sm text-body text-ink-3">{description}</p>
      )}
      {variant === "no-results" && (
        <p className="text-micro text-ink-3">
          Ajusta o limpia los filtros para ver más resultados.
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

EmptyState.propTypes = {
  variant: PropTypes.oneOf(["empty", "no-results"]),
  icon: PropTypes.node,
  title: PropTypes.node,
  description: PropTypes.node,
  action: PropTypes.node,
  className: PropTypes.string,
};

export default EmptyState;
