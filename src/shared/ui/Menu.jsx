import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";

const MOBILE_QUERY = "(max-width: 639px)";
const VIEWPORT_MARGIN = 8;
const TRIGGER_GAP = 4;

const isSeparator = (item) =>
  item === "-" || item?.separator === true || item?.type === "separator";

function useIsMobile() {
  const read = () =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia(MOBILE_QUERY).matches
      : false;
  const [mobile, setMobile] = useState(read);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }
    const media = window.matchMedia(MOBILE_QUERY);
    const handleChange = (event) => setMobile(event.matches);
    setMobile(media.matches);
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }
    media.addListener?.(handleChange);
    return () => media.removeListener?.(handleChange);
  }, []);

  return mobile;
}

function Menu({ label, icon, items, align = "right" }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const isMobile = useIsMobile();

  const close = useCallback(({ restoreFocus = false } = {}) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus({ preventScroll: true });
  }, []);

  useLayoutEffect(() => {
    if (!open || isMobile) {
      setPosition(null);
      return;
    }
    const trigger = triggerRef.current;
    const menu = menuRef.current;
    if (!trigger || !menu) return;

    const triggerRect = trigger.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;

    const left = Math.min(
      Math.max(
        align === "right" ? triggerRect.right - menuRect.width : triggerRect.left,
        VIEWPORT_MARGIN
      ),
      Math.max(VIEWPORT_MARGIN, viewportWidth - menuRect.width - VIEWPORT_MARGIN)
    );

    const below = triggerRect.bottom + TRIGGER_GAP;
    const above = triggerRect.top - menuRect.height - TRIGGER_GAP;
    const fitsBelow = below + menuRect.height <= viewportHeight - VIEWPORT_MARGIN;
    const fitsAbove = above >= VIEWPORT_MARGIN;
    const useAbove = !fitsBelow && (fitsAbove || triggerRect.top > viewportHeight / 2);

    const top = Math.min(
      Math.max(useAbove ? above : below, VIEWPORT_MARGIN),
      Math.max(VIEWPORT_MARGIN, viewportHeight - menuRect.height - VIEWPORT_MARGIN)
    );

    setPosition({ top, left });
  }, [align, isMobile, open]);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointer = (event) => {
      if (
        triggerRef.current?.contains(event.target) ||
        menuRef.current?.contains(event.target)
      ) {
        return;
      }
      close();
    };
    const handleKey = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close({ restoreFocus: true });
      }
    };
    const handleScroll = (event) => {
      if (event.target instanceof Node && menuRef.current?.contains(event.target)) {
        return;
      }
      close();
    };
    const handleResize = () => close();

    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [close, open]);

  useEffect(() => {
    if (!open) return;
    const first = menuRef.current?.querySelector('[role="menuitem"]:not([disabled])');
    first?.focus({ preventScroll: true });
  }, [open, isMobile]);

  const focusItem = (direction) => {
    const nodes = Array.from(
      menuRef.current?.querySelectorAll('[role="menuitem"]:not([disabled])') || []
    );
    if (!nodes.length) return;
    const current = nodes.indexOf(document.activeElement);
    let nextIndex;
    if (direction === "first") nextIndex = 0;
    else if (direction === "last") nextIndex = nodes.length - 1;
    else if (direction === "next") nextIndex = current < 0 ? 0 : (current + 1) % nodes.length;
    else nextIndex = current <= 0 ? nodes.length - 1 : current - 1;
    nodes[nextIndex].focus();
  };

  const handleMenuKeyDown = (event) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusItem("next");
        break;
      case "ArrowUp":
        event.preventDefault();
        focusItem("previous");
        break;
      case "Home":
        event.preventDefault();
        focusItem("first");
        break;
      case "End":
        event.preventDefault();
        focusItem("last");
        break;
      case "Tab":
        close();
        break;
      default:
        break;
    }
  };

  const selectItem = (item) => {
    if (item.disabled) return;
    close({ restoreFocus: true });
    item.onSelect?.();
  };

  const renderedItems = (items || []).map((item, index) => {
    if (isSeparator(item)) {
      return (
        <div
          key={`separator-${index}`}
          role="separator"
          className="my-1 h-px bg-line"
        />
      );
    }
    if (item?.section) {
      return (
        <div
          key={`section-${index}`}
          role="presentation"
          className="px-2.5 pb-1 pt-2 text-micro font-bold uppercase tracking-wide text-ink-3"
        >
          {item.section}
        </div>
      );
    }
    return (
      <button
        key={item.key || `menu-item-${index}`}
        type="button"
        role="menuitem"
        disabled={item.disabled}
        onClick={() => selectItem(item)}
        className={`flex min-h-10 w-full items-center gap-2.5 rounded-chip px-2.5 py-2 text-left text-body transition-colors ${
          item.tone === "danger"
            ? "text-danger hover:bg-danger-soft"
            : "text-ink-2 hover:bg-surface-2 hover:text-ink"
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {item.icon ? (
          <span
            aria-hidden="true"
            className={`flex w-4 shrink-0 justify-center ${
              item.tone === "danger" ? "text-danger" : "text-ink-3"
            }`}
          >
            {item.icon}
          </span>
        ) : null}
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
      </button>
    );
  });

  const menu = open ? (
    <div
      ref={menuRef}
      role="menu"
      aria-label={label}
      onKeyDown={handleMenuKeyDown}
      style={
        isMobile
          ? undefined
          : {
              top: position?.top ?? 0,
              left: position?.left ?? 0,
              visibility: position ? "visible" : "hidden",
            }
      }
      className={
        isMobile
          ? "motion-dialog fixed inset-x-3 bottom-3 z-[90] max-h-[70vh] overflow-y-auto rounded-card border border-line bg-surface p-2 shadow-pop"
          : "motion-pop-in fixed z-[90] max-h-[min(70vh,360px)] min-w-48 overflow-y-auto rounded-control border border-line bg-surface p-1 shadow-pop"
      }
    >
      {isMobile && (
        <div className="flex items-center justify-between px-2.5 pb-1 pt-1">
          <p className="text-micro font-bold uppercase tracking-wide text-ink-3">
            {label}
          </p>
        </div>
      )}
      {renderedItems}
    </div>
  ) : null;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 w-10 items-center justify-center rounded-control text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
      >
        {icon}
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <>
              {isMobile && (
                <div
                  aria-hidden="true"
                  onClick={() => close()}
                  className="fixed inset-0 z-[85] bg-ink/20"
                />
              )}
              {menu}
            </>,
            document.body
          )
        : null}
    </div>
  );
}

Menu.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.node,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.node,
      icon: PropTypes.node,
      onSelect: PropTypes.func,
      tone: PropTypes.oneOf(["default", "danger"]),
      disabled: PropTypes.bool,
      separator: PropTypes.bool,
      section: PropTypes.string,
    })
  ).isRequired,
  align: PropTypes.oneOf(["left", "right"]),
};

export default Menu;
