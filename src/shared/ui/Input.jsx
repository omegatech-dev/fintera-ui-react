import { forwardRef } from "react";
import PropTypes from "prop-types";

const Input = forwardRef(function Input(
  { invalid = false, className = "", ...props },
  ref
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={`h-11 w-full rounded-control border bg-surface px-3 text-[16px] text-ink outline-none sm:text-body-lg ${
        invalid ? "border-danger" : "border-line-strong"
      } ${className}`}
      {...props}
    />
  );
});

Input.propTypes = {
  invalid: PropTypes.bool,
  className: PropTypes.string,
};

export default Input;
