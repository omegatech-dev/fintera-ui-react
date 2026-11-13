import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

function Menu({ label, icon, items, align = "right" }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointer = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKey = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 w-9 items-center justify-center rounded-control text-ink-3 hover:bg-surface-2"
      >
        {icon}
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute z-30 mt-1 min-w-44 rounded-control border border-line bg-surface p-1 shadow-pop ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                item.onSelect?.();
              }}
              className={`flex w-full items-center gap-2 rounded-chip px-2.5 py-2 text-left text-body hover:bg-surface-2 ${
                item.tone === "danger" ? "text-danger" : "text-ink-2"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

Menu.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.node,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.node.isRequired,
      icon: PropTypes.node,
      onSelect: PropTypes.func,
      tone: PropTypes.oneOf(["default", "danger"]),
    })
  ).isRequired,
  align: PropTypes.oneOf(["left", "right"]),
};

export default Menu;
