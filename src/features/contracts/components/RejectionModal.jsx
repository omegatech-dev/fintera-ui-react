import { useState, memo } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle, faBan } from "@fortawesome/free-solid-svg-icons";
import { useToast } from "../../../contexts/ToastContext";
import { useLocale } from "../../../contexts/LocaleContext";

const RejectionModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [reason, setReason] = useState("");
  const { showToast } = useToast();
  const { t } = useLocale();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      showToast(t("contracts.pleaseEnterReason") || "Por favor ingrese una razón para el rechazo.", "error");
      return;
    }
    onSubmit(reason);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-bgray-900/60 dark:bg-black/80 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-lg bg-white dark:bg-darkblack-600 rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20"
      >
        {/* Header Branding */}
        <div className="bg-red-50 dark:bg-red-900/10 p-8 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-2xl" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-bgray-900 dark:text-white leading-tight">
              {t("contracts.rejectContract") || "Rechazar Contrato"}
            </h3>
            <p className="text-sm font-medium text-bgray-500 dark:text-bgray-400 mt-1">
              {t("contracts.rejectionReasonLong") || "Proporcione una razón clara para el rechazo."}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="space-y-3">
            <label className="text-sm font-black text-bgray-900 dark:text-white block uppercase tracking-wider">
              {t("contracts.rejectionReasonLabel") || "Razón del rechazo"} *
            </label>
            <div className="relative group">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-6 py-5 rounded-3xl bg-gray-50 dark:bg-darkblack-500 border-2 border-transparent focus:border-red-500 focus:bg-white dark:focus:bg-darkblack-400 outline-hidden transition-all font-medium text-bgray-900 dark:text-white min-h-[160px] resize-none"
                placeholder={t("contracts.rejectionReasonPlaceholder") || "Ingrese detalladamente por qué este contrato no puede ser aprobado..."}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-8 py-4 rounded-2xl bg-gray-100 dark:bg-darkblack-500 text-bgray-600 dark:text-bgray-300 font-black hover:bg-gray-200 dark:hover:bg-darkblack-400 transition-all duration-300"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={loading || !reason.trim()}
              className="flex-[2] px-8 py-4 rounded-2xl bg-red-500 text-white font-black hover:bg-red-600 shadow-xl shadow-red-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FontAwesomeIcon icon={faBan} />
              )}
              {loading ? (t("contracts.rejecting") || "Rechazando...") : (t("contracts.confirmRejection") || "Confirmar Rechazo")}
            </button>
          </div>
        </form>
      </motion.div>
    </div>,
    document.body
  );
};

export default memo(RejectionModal);