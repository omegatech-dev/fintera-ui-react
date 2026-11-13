import PropTypes from "prop-types";

function Card({ title, action, className = "", bodyClassName = "", children }) {
  return (
    <section
      className={`rounded-card border border-line bg-surface ${className}`}
    >
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 px-5 pt-5">
          {title && (
            <h3 className="text-title font-bold text-ink">{title}</h3>
          )}
          {action}
        </header>
      )}
      <div className={bodyClassName || "p-5"}>{children}</div>
    </section>
  );
}

Card.propTypes = {
  title: PropTypes.node,
  action: PropTypes.node,
  className: PropTypes.string,
  bodyClassName: PropTypes.string,
  children: PropTypes.node,
};

export default Card;
