import PropTypes from "prop-types";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

function SettingsSaveBar({ visible, saving, disabled, onDiscard, labels }) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
          className="sticky bottom-4 z-20 mt-8"
        >
          <div className="flex flex-col gap-3 rounded-2xl border border-bgray-200 bg-white/95 p-4 shadow-lg backdrop-blur dark:border-darkblack-400 dark:bg-darkblack-600/95 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-bgray-700 dark:text-bgray-200">
              <span className="h-2 w-2 rounded-full bg-amber-400" aria-hidden="true" />
              <span aria-live="polite">{labels.unsaved}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onDiscard}
                disabled={saving}
                className="rounded-xl border border-bgray-200 px-4 py-2.5 text-sm font-semibold text-bgray-700 transition-colors hover:bg-bgray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-darkblack-400 dark:text-bgray-200 dark:hover:bg-darkblack-500"
              >
                {labels.discard}
              </button>
              <button
                type="submit"
                disabled={saving || disabled}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-blue-500/20 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {saving ? (
                  <>
                    <svg
                      className="-ml-1 mr-2 h-4 w-4 animate-spin text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {labels.saving}
                  </>
                ) : (
                  labels.save
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

SettingsSaveBar.propTypes = {
  visible: PropTypes.bool,
  saving: PropTypes.bool,
  disabled: PropTypes.bool,
  onDiscard: PropTypes.func.isRequired,
  labels: PropTypes.shape({
    unsaved: PropTypes.string.isRequired,
    discard: PropTypes.string.isRequired,
    save: PropTypes.string.isRequired,
    saving: PropTypes.string.isRequired,
  }).isRequired,
};

export default SettingsSaveBar;
