import PropTypes from "prop-types";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

function BrandSaveBar({ visible, saving, disabled, onDiscard, labels }) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
          className="sticky bottom-[calc(80px+env(safe-area-inset-bottom))] z-30 md:bottom-4"
        >
          <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4 shadow-pop sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:py-0">
            <div className="flex items-center gap-2 text-label font-semibold text-warning">
              <span className="h-2 w-2 rounded-full bg-warning" aria-hidden="true" />
              <span aria-live="polite">{labels.unsaved}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onDiscard}
                disabled={saving}
                className="h-9 rounded-control border border-line-strong bg-surface px-4 text-label font-semibold text-ink-2 transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {labels.discard}
              </button>
              <button
                type="submit"
                disabled={saving || disabled}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-control bg-brand px-5 text-label font-semibold text-white transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <span
                      className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
                      aria-hidden="true"
                    />
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

BrandSaveBar.propTypes = {
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

export default BrandSaveBar;
