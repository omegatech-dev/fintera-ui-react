import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const SIZES = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
};

function Dialog({
  open,
  onClose,
  title,
  description,
  size = "md",
  footer,
  children,
  className = "",
}) {
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return undefined;

    previouslyFocused.current = document.activeElement;
    const panel = panelRef.current;
    const firstFocusable = panel?.querySelector(FOCUSABLE);
    (firstFocusable || panel)?.focus?.();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose?.();
        return;
      }

      if (event.key !== "Tab" || !panel) return;

      const nodes = [...panel.querySelectorAll(FOCUSABLE)].filter(
        (node) => node.offsetParent !== null
      );
      if (!nodes.length) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={`w-full ${SIZES[size]} rounded-sheet bg-surface p-5 shadow-pop ${className}`}
      >
        {title && (
          <h2 id={titleId} className="text-section font-bold text-ink">
            {title}
          </h2>
        )}
        {description && (
          <p id={descriptionId} className="mt-1 text-body text-ink-2">
            {description}
          </p>
        )}
        <div className="mt-4">{children}</div>
        {footer && <div className="mt-5 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

Dialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.node,
  description: PropTypes.node,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  footer: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
};

export default Dialog;
