import { useEffect } from "react";
import PropTypes from "prop-types";

function Toast({ visible, message, type = "success", duration = 3000, onClose }) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => onClose && onClose(), duration);
    return () => clearTimeout(t);
  }, [visible, duration, onClose]);

  if (!visible) return null;

  const base = "fixed right-6 bottom-6 z-[10000] max-w-xs px-4 py-3 rounded-lg shadow-lg";
  const style =
    type === "success"
      ? "bg-green-600 text-white"
      : type === "error"
        ? "bg-red-600 text-white"
        : "bg-gray-800 text-white";

  return (
    <div role="status" aria-live="polite" className={`motion-fade-up ${base} ${style}`}>
      <div className="text-sm">{message}</div>
    </div>
  );
}

Toast.propTypes = {
  visible: PropTypes.bool,
  message: PropTypes.string,
  type: PropTypes.oneOf(["success", "error", "info"]),
  duration: PropTypes.number,
  onClose: PropTypes.func,
};

export default Toast;