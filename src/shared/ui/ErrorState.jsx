import PropTypes from "prop-types";
import Button from "./Button";

function ErrorState({ title = "No pudimos cargar los datos", description, onRetry, className = "" }) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center gap-2 rounded-card border border-danger/30 bg-danger-soft px-6 py-10 text-center ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="h-5 w-5 text-danger"
      >
        <path
          d="M12 8v5m0 3h.01M10.3 3.9 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
      <p className="text-body-lg font-bold text-ink">{title}</p>
      {description && (
        <p className="max-w-sm text-body text-ink-2">{description}</p>
      )}
      {onRetry && (
        <div className="mt-2">
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Reintentar
          </Button>
        </div>
      )}
    </div>
  );
}

ErrorState.propTypes = {
  title: PropTypes.node,
  description: PropTypes.node,
  onRetry: PropTypes.func,
  className: PropTypes.string,
};

export default ErrorState;
