import PropTypes from "prop-types";

function Stepper({ steps, current = 0, className = "" }) {
  return (
    <ol
      aria-label="Progreso"
      className={`flex flex-wrap items-center gap-3 ${className}`}
    >
      {steps.map((step, index) => {
        const state =
          index < current ? "done" : index === current ? "current" : "todo";

        return (
          <li
            key={step}
            aria-current={state === "current" ? "step" : undefined}
            className="flex items-center gap-2"
          >
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-label font-bold ${
                state === "done"
                  ? "bg-brand-soft text-brand-strong"
                  : state === "current"
                    ? "bg-brand text-white"
                    : "bg-surface-2 text-ink-3"
              }`}
            >
              {state === "done" ? "✓" : index + 1}
            </span>
            <span
              className={`text-label ${
                state === "current" ? "font-bold text-ink" : "text-ink-3"
              }`}
            >
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

Stepper.propTypes = {
  steps: PropTypes.arrayOf(PropTypes.string).isRequired,
  current: PropTypes.number,
  className: PropTypes.string,
};

export default Stepper;
