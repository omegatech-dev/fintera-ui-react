import PropTypes from "prop-types";

const VARIANTS = {
  primary: "bg-brand text-white hover:bg-brand-strong",
  secondary: "border border-line-strong bg-surface text-ink-2 hover:bg-surface-2",
  ghost: "text-ink-2 hover:bg-surface-2",
  danger: "bg-danger text-white hover:opacity-90",
};

const SIZES = {
  md: "h-11 px-4 text-body-lg",
  sm: "h-[34px] px-3 text-label",
};

function Button({
  variant = "primary",
  size = "md",
  iconOnly = false,
  loading = false,
  className = "",
  children,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      aria-busy={loading || undefined}
      disabled={loading || props.disabled}
      className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-control font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out active:scale-[0.98] motion-reduce:active:scale-100 disabled:cursor-not-allowed disabled:opacity-60 ${
        VARIANTS[variant]
      } ${iconOnly ? "h-11 w-11 p-0" : SIZES[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : (
        children
      )}
    </button>
  );
}

Button.propTypes = {
  variant: PropTypes.oneOf(["primary", "secondary", "ghost", "danger"]),
  size: PropTypes.oneOf(["md", "sm"]),
  iconOnly: PropTypes.bool,
  loading: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
  type: PropTypes.string,
};

export default Button;
