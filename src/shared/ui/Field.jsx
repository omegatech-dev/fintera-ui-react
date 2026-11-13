import { cloneElement, isValidElement, useId } from "react";
import PropTypes from "prop-types";

function Field({ label, hint, error, required = false, id, children }) {
  const autoId = useId();
  const fieldId = id || `field-${autoId}`;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy =
    [hintId, errorId].filter(Boolean).join(" ") || undefined;

  const control = isValidElement(children)
    ? cloneElement(children, {
        id: children.props.id || fieldId,
        "aria-describedby":
          [children.props["aria-describedby"], describedBy]
            .filter(Boolean)
            .join(" ") || undefined,
        "aria-invalid": error ? true : children.props["aria-invalid"],
        required: required || children.props.required,
      })
    : children;

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label
          htmlFor={fieldId}
          className="text-label font-semibold text-ink-2"
        >
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}
      {control}
      {hint && !error && (
        <p id={hintId} className="text-micro text-ink-3">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-micro text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

Field.propTypes = {
  label: PropTypes.node,
  hint: PropTypes.node,
  error: PropTypes.node,
  required: PropTypes.bool,
  id: PropTypes.string,
  children: PropTypes.node,
};

export default Field;
