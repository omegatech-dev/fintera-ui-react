import PropTypes from "prop-types";
import { useId } from "react";

function SettingsSection({
  title,
  description,
  children,
  divider = true,
  className = "",
}) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className={`${divider ? "mt-[18px] border-t border-line pt-[18px]" : ""} ${className}`.trim()}
    >
      <header className="mb-2.5">
        <h2 id={headingId} className="text-[15px] font-bold text-ink">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-label font-medium text-ink-3">
            {description}
          </p>
        )}
      </header>
      {children}
    </section>
  );
}

SettingsSection.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  children: PropTypes.node,
  divider: PropTypes.bool,
  className: PropTypes.string,
};

export default SettingsSection;
