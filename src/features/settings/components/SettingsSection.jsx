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
      className={`${divider ? "mt-10 border-t border-bgray-200 pt-10 dark:border-darkblack-400" : ""} ${className}`.trim()}
    >
      <header className="mb-6">
        <h2
          id={headingId}
          className="text-2xl font-bold text-bgray-900 dark:text-white"
        >
          {title}
        </h2>
        {description && (
          <p className="mt-1 font-medium text-bgray-500 dark:text-bgray-400">
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
