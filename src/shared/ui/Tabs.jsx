import { useRef } from "react";
import PropTypes from "prop-types";

function Tabs({ items, value, onChange, className = "" }) {
  const refs = useRef([]);

  const handleKeyDown = (event, index) => {
    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();

    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % items.length;
    if (event.key === "ArrowLeft")
      next = (index - 1 + items.length) % items.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = items.length - 1;

    onChange?.(items[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      className={`flex gap-6 border-b border-line ${className}`}
    >
      {items.map((item, index) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            ref={(element) => {
              refs.current[index] = element;
            }}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange?.(item.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={`-mb-px border-b-2 pb-2.5 pt-1 text-body ${
              selected
                ? "border-brand font-bold text-ink"
                : "border-transparent font-semibold text-ink-3 hover:text-ink-2"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

Tabs.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({ value: PropTypes.string.isRequired, label: PropTypes.node })
  ).isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func,
  className: PropTypes.string,
};

export default Tabs;
