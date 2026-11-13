import PropTypes from "prop-types";

function Skeleton({ rows = 3, className = "" }) {
  return (
    <div className={`flex flex-col gap-3 ${className}`} aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className={`motion-shimmer h-3.5 rounded ${
            index === 0 ? "w-1/3" : "w-full"
          }`}
        />
      ))}
    </div>
  );
}

Skeleton.propTypes = {
  rows: PropTypes.number,
  className: PropTypes.string,
};

export default Skeleton;
