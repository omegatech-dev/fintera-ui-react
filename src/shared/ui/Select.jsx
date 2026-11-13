import { forwardRef } from "react";
import PropTypes from "prop-types";

const Select = forwardRef(function Select(
  { invalid = false, className = "", children, ...props },
  ref
) {
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={`h-11 w-full rounded-control border bg-surface px-3 text-[16px] text-ink outline-none sm:text-body-lg ${
        invalid ? "border-danger" : "border-line-strong"
      } ${className}`}
      {...props}
    >
      {children}
    </select>
  );
});

Select.propTypes = {
  invalid: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
};

export default Select;
